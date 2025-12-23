import pool from '../config/database.js';
import bcrypt from 'bcrypt';

// Get all users with pagination and filters
export const getUsers = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.max(1, parseInt(req.query.limit) || 10);
    const offset = (page - 1) * limit;
    const { role, status, search } = req.query;

    let whereConditions = [];
    let queryParams = [];

    // Filter by role
    if (role) {
      whereConditions.push('vt.ten_vai_tro = ?');
      queryParams.push(role);
    }

    // Filter by status
    if (status !== undefined && status !== '') {
      whereConditions.push('nd.trang_thai = ?');
      queryParams.push(status === 'true' || status === '1' ? 1 : 0);
    }

    // Search by name or email
    if (search) {
      whereConditions.push('(nd.ho_ten LIKE ? OR nd.email LIKE ?)');
      queryParams.push(`%${search}%`, `%${search}%`);
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Get total count
    const [countResult] = await pool.execute(
      `SELECT COUNT(*) as total 
       FROM nguoidung nd
       JOIN vaitro vt ON nd.id_vai_tro = vt.id_vai_tro
       ${whereClause}`,
      queryParams
    );

    const total = countResult[0].total;

    // Get paginated users - Use template literal for LIMIT/OFFSET to avoid prepared statement issues
    const limitOffsetClause = `LIMIT ${limit} OFFSET ${offset}`;
    const [users] = await pool.execute(
      `SELECT 
        nd.id_nguoi_dung,
        nd.ho_ten,
        nd.email,
        nd.so_dien_thoai,
        nd.gioi_tinh,
        nd.ngay_sinh,
        nd.trang_thai,
        nd.ngay_tao,
        vt.ten_vai_tro
      FROM nguoidung nd
      JOIN vaitro vt ON nd.id_vai_tro = vt.id_vai_tro
      ${whereClause}
      ORDER BY nd.ngay_tao DESC
      ${limitOffsetClause}`,
      queryParams
    );

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// Update user
export const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { ho_ten, email, so_dien_thoai, gioi_tinh, ngay_sinh, id_vai_tro } = req.body;

    const updateFields = [];
    const updateValues = [];

    if (ho_ten) {
      updateFields.push('ho_ten = ?');
      updateValues.push(ho_ten);
    }
    if (email) {
      updateFields.push('email = ?');
      updateValues.push(email);
    }
    if (so_dien_thoai !== undefined) {
      updateFields.push('so_dien_thoai = ?');
      updateValues.push(so_dien_thoai || null);
    }
    if (gioi_tinh) {
      updateFields.push('gioi_tinh = ?');
      updateValues.push(gioi_tinh);
    }
    if (ngay_sinh) {
      updateFields.push('ngay_sinh = ?');
      updateValues.push(ngay_sinh);
    }
    if (id_vai_tro) {
      updateFields.push('id_vai_tro = ?');
      updateValues.push(id_vai_tro);
    }

    if (updateFields.length > 0) {
      updateValues.push(id);
      await pool.execute(
        `UPDATE nguoidung SET ${updateFields.join(', ')} WHERE id_nguoi_dung = ?`,
        updateValues
      );
    }

    res.json({
      success: true,
      message: 'Cập nhật người dùng thành công.'
    });
  } catch (error) {
    next(error);
  }
};

// Update user status
export const updateUserStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { trang_thai } = req.body;

    // Lấy thông tin người yêu cầu (admin đang đăng nhập)
    const requesterId = req.user?.id_nguoi_dung || req.user?.id;

    // Lấy thông tin người dùng mục tiêu
    const [targetRows] = await pool.execute(
      'SELECT id_vai_tro FROM nguoidung WHERE id_nguoi_dung = ?',
      [id]
    );

    if (targetRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy người dùng.'
      });
    }

    const targetRoleId = targetRows[0].id_vai_tro;
    const ADMIN_ROLE_ID = 5; // giả định id_vai_tro = 5 là quản trị viên

    // Chặn tự vô hiệu hóa chính mình
    if (requesterId && Number(requesterId) === Number(id)) {
      return res.status(403).json({
        success: false,
        message: 'Không thể tự vô hiệu hóa tài khoản của chính bạn.'
      });
    }

    // Chặn vô hiệu hóa tài khoản quản trị viên khác
    if (Number(targetRoleId) === ADMIN_ROLE_ID) {
      return res.status(403).json({
        success: false,
        message: 'Không thể thay đổi trạng thái tài khoản quản trị viên khác.'
      });
    }

    await pool.execute(
      'UPDATE nguoidung SET trang_thai = ? WHERE id_nguoi_dung = ?',
      [trang_thai, id]
    );

    res.json({
      success: true,
      message: 'Cập nhật trạng thái thành công.'
    });
  } catch (error) {
    next(error);
  }
};

// Delete user
export const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    await pool.execute('DELETE FROM nguoidung WHERE id_nguoi_dung = ?', [id]);
    res.json({
      success: true,
      message: 'Xóa người dùng thành công.'
    });
  } catch (error) {
    next(error);
  }
};

// Get stats
export const getStats = async (req, res, next) => {
  try {
    const [userCount] = await pool.execute('SELECT COUNT(*) as count FROM nguoidung');
    const [donorCount] = await pool.execute('SELECT COUNT(*) as count FROM nguoi_hien_mau');
    const [eventCount] = await pool.execute('SELECT COUNT(*) as count FROM sukien_hien_mau');
    const [registrationCount] = await pool.execute('SELECT COUNT(*) as count FROM dang_ky_hien_mau');

    res.json({
      success: true,
      data: {
        totalUsers: userCount[0].count,
        totalDonors: donorCount[0].count,
        totalEvents: eventCount[0].count,
        totalRegistrations: registrationCount[0].count
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get all events with pagination and filters
export const getEvents = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.max(1, parseInt(req.query.limit) || 10);
    const offset = (page - 1) * limit;
    const { status, organization, hospital, search } = req.query;

    let whereConditions = [];
    let queryParams = [];

    if (status) {
      whereConditions.push('sk.trang_thai = ?');
      queryParams.push(status);
    }

    if (organization) {
      whereConditions.push('sk.id_to_chuc = ?');
      queryParams.push(organization);
    }

    if (hospital) {
      whereConditions.push('sk.id_benh_vien = ?');
      queryParams.push(hospital);
    }

    if (search) {
      whereConditions.push('(sk.ten_su_kien LIKE ? OR sk.dia_chi LIKE ?)');
      queryParams.push(`%${search}%`, `%${search}%`);
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Get total count
    const [countResult] = await pool.execute(
      `SELECT COUNT(*) as total FROM sukien_hien_mau sk ${whereClause}`,
      queryParams
    );

    const total = countResult[0].total;

    // Get events with registration count - Use template literal for LIMIT/OFFSET
    const limitOffsetClause = `LIMIT ${limit} OFFSET ${offset}`;
    const [events] = await pool.execute(
      `SELECT 
        sk.*,
        tc.ten_don_vi,
        bv.ten_benh_vien,
        COUNT(DISTINCT dk.id_dang_ky) as so_luong_dang_ky
      FROM sukien_hien_mau sk
      LEFT JOIN to_chuc tc ON sk.id_to_chuc = tc.id_to_chuc
      LEFT JOIN benh_vien bv ON sk.id_benh_vien = bv.id_benh_vien
      LEFT JOIN dang_ky_hien_mau dk ON sk.id_su_kien = dk.id_su_kien
      ${whereClause}
      GROUP BY sk.id_su_kien
      ORDER BY sk.ngay_bat_dau DESC
      ${limitOffsetClause}`,
      queryParams
    );

    res.json({
      success: true,
      data: {
        events,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get all registrations with pagination and filters
export const getRegistrations = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.max(1, parseInt(req.query.limit) || 10);
    const offset = (page - 1) * limit;
    const { status, event, donor } = req.query;

    let whereConditions = [];
    let queryParams = [];

    if (status) {
      whereConditions.push('dk.trang_thai = ?');
      queryParams.push(status);
    }

    if (event) {
      whereConditions.push('dk.id_su_kien = ?');
      queryParams.push(event);
    }

    if (donor) {
      whereConditions.push('dk.id_nguoi_hien = ?');
      queryParams.push(donor);
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Get total count
    const [countResult] = await pool.execute(
      `SELECT COUNT(*) as total FROM dang_ky_hien_mau dk ${whereClause}`,
      queryParams
    );

    const total = countResult[0].total;

    // Get registrations - Use template literal for LIMIT/OFFSET
    const limitOffsetClause = `LIMIT ${limit} OFFSET ${offset}`;
    const [registrations] = await pool.execute(
      `SELECT 
        dk.*,
        nd.ho_ten,
        nd.email,
        nd.so_dien_thoai,
        sk.ten_su_kien,
        sk.ngay_bat_dau,
        sk.ngay_ket_thuc,
        nh.nhom_mau
      FROM dang_ky_hien_mau dk
      JOIN nguoi_hien_mau nh ON dk.id_nguoi_hien = nh.id_nguoi_hien
      JOIN nguoidung nd ON nh.id_nguoi_hien = nd.id_nguoi_dung
      JOIN sukien_hien_mau sk ON dk.id_su_kien = sk.id_su_kien
      ${whereClause}
      ORDER BY dk.ngay_dang_ky DESC
      ${limitOffsetClause}`,
      queryParams
    );

    res.json({
      success: true,
      data: {
        registrations,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get reports overview
export const getReportsOverview = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    
    let dateCondition = '';
    let queryParams = [];
    
    if (startDate && endDate) {
      dateCondition = 'WHERE kq.ngay_hien BETWEEN ? AND ?';
      queryParams = [startDate, endDate];
    }

    // Get donations by month
    const [donationsByMonth] = await pool.execute(
      `SELECT 
        DATE_FORMAT(kq.ngay_hien, '%Y-%m') as month,
        COUNT(*) as count,
        SUM(kq.luong_ml) as total_ml
      FROM ket_qua_hien_mau kq
      ${dateCondition}
      GROUP BY month
      ORDER BY month DESC
      LIMIT 12`,
      queryParams
    );

    // Get events by month
    const [eventsByMonth] = await pool.execute(
      `SELECT 
        DATE_FORMAT(sk.ngay_bat_dau, '%Y-%m') as month,
        COUNT(*) as count
      FROM sukien_hien_mau sk
      ${dateCondition.replace('kq.ngay_hien', 'sk.ngay_bat_dau')}
      GROUP BY month
      ORDER BY month DESC
      LIMIT 12`,
      queryParams
    );

    res.json({
      success: true,
      data: {
        donationsByMonth,
        eventsByMonth
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get reports by blood types
export const getReportsByBloodType = async (req, res, next) => {
  try {
    const [bloodTypes] = await pool.execute(
      `SELECT 
        nh.nhom_mau,
        COUNT(DISTINCT nh.id_nguoi_hien) as total_donors,
        COUNT(kq.id_ket_qua) as total_donations,
        COALESCE(SUM(kq.luong_ml), 0) as total_ml
      FROM nguoi_hien_mau nh
      LEFT JOIN ket_qua_hien_mau kq ON nh.id_nguoi_hien = kq.id_nguoi_hien
      WHERE nh.nhom_mau IS NOT NULL
      GROUP BY nh.nhom_mau
      ORDER BY total_donors DESC`
    );

    res.json({
      success: true,
      data: { bloodTypes }
    });
  } catch (error) {
    next(error);
  }
};

// Get reports by organizations
export const getReportsByOrganization = async (req, res, next) => {
  try {
    const [organizations] = await pool.execute(
      `SELECT 
        tc.id_to_chuc,
        tc.ten_don_vi,
        COUNT(DISTINCT sk.id_su_kien) as total_events,
        COUNT(DISTINCT dk.id_dang_ky) as total_registrations,
        COUNT(DISTINCT kq.id_ket_qua) as total_donations,
        COALESCE(SUM(kq.luong_ml), 0) as total_ml
      FROM to_chuc tc
      LEFT JOIN sukien_hien_mau sk ON tc.id_to_chuc = sk.id_to_chuc
      LEFT JOIN dang_ky_hien_mau dk ON sk.id_su_kien = dk.id_su_kien
      LEFT JOIN ket_qua_hien_mau kq ON dk.id_nguoi_hien = kq.id_nguoi_hien AND dk.id_su_kien = kq.id_su_kien
      GROUP BY tc.id_to_chuc
      ORDER BY total_events DESC`
    );

    res.json({
      success: true,
      data: { organizations }
    });
  } catch (error) {
    next(error);
  }
};

// Get reports by hospitals
export const getReportsByHospital = async (req, res, next) => {
  try {
    const [hospitals] = await pool.execute(
      `SELECT 
        bv.id_benh_vien,
        bv.ten_benh_vien,
        COUNT(DISTINCT sk.id_su_kien) as total_events,
        COUNT(DISTINCT dk.id_dang_ky) as total_registrations,
        COUNT(DISTINCT kq.id_ket_qua) as total_donations,
        COALESCE(SUM(kq.luong_ml), 0) as total_ml
      FROM benh_vien bv
      LEFT JOIN sukien_hien_mau sk ON bv.id_benh_vien = sk.id_benh_vien
      LEFT JOIN dang_ky_hien_mau dk ON sk.id_su_kien = dk.id_su_kien
      LEFT JOIN ket_qua_hien_mau kq ON dk.id_nguoi_hien = kq.id_nguoi_hien AND dk.id_su_kien = kq.id_su_kien
      GROUP BY bv.id_benh_vien
      ORDER BY total_events DESC`
    );

    res.json({
      success: true,
      data: { hospitals }
    });
  } catch (error) {
    next(error);
  }
};

// Get admin profile
export const getProfile = async (req, res, next) => {
  try {
    const userId = req.user.id_nguoi_dung;

    // Get user info
    const [users] = await pool.execute(
      `SELECT id_nguoi_dung, ho_ten, email, so_dien_thoai, gioi_tinh, ngay_sinh, id_vai_tro, trang_thai 
       FROM nguoidung WHERE id_nguoi_dung = ?`,
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy người dùng.'
      });
    }

    res.json({
      success: true,
      data: {
        user: users[0]
      }
    });
  } catch (error) {
    next(error);
  }
};

// Update admin profile
export const updateProfile = async (req, res, next) => {
  try {
    const userId = req.user.id_nguoi_dung;
    const { ho_ten, so_dien_thoai } = req.body;

    // Check if phone is already used by another user
    if (so_dien_thoai) {
      const [existingPhones] = await pool.execute(
        'SELECT id_nguoi_dung FROM nguoidung WHERE so_dien_thoai = ? AND id_nguoi_dung != ?',
        [so_dien_thoai, userId]
      );

      if (existingPhones.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Số điện thoại đã được sử dụng.'
        });
      }
    }

    // Update user info
    const updateUserFields = [];
    const updateUserValues = [];

    if (ho_ten) {
      updateUserFields.push('ho_ten = ?');
      updateUserValues.push(ho_ten);
    }
    if (so_dien_thoai !== undefined) {
      updateUserFields.push('so_dien_thoai = ?');
      updateUserValues.push(so_dien_thoai || null);
    }

    if (updateUserFields.length > 0) {
      updateUserValues.push(userId);
      await pool.execute(
        `UPDATE nguoidung SET ${updateUserFields.join(', ')} WHERE id_nguoi_dung = ?`,
        updateUserValues
      );
    }

    // Get updated profile
    const [users] = await pool.execute(
      `SELECT id_nguoi_dung, ho_ten, email, so_dien_thoai, gioi_tinh, ngay_sinh, id_vai_tro, trang_thai 
       FROM nguoidung WHERE id_nguoi_dung = ?`,
      [userId]
    );

    res.json({
      success: true,
      message: 'Cập nhật thông tin thành công.',
      data: {
        user: users[0]
      }
    });
  } catch (error) {
    next(error);
  }
};

