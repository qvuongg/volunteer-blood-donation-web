import pool from '../config/database.js';
import bcrypt from 'bcrypt';
import { sendAccountApprovalEmail } from '../utils/email.js';

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

// Get user detail by ID
export const getUserDetail = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Get user basic info
    const [users] = await pool.execute(
      `SELECT nd.id_nguoi_dung, nd.ho_ten, nd.email, nd.so_dien_thoai, nd.gioi_tinh, 
              nd.ngay_sinh, nd.id_vai_tro, nd.trang_thai, nd.ngay_tao, vt.ten_vai_tro
       FROM nguoidung nd
       JOIN vaitro vt ON nd.id_vai_tro = vt.id_vai_tro
       WHERE nd.id_nguoi_dung = ?`,
      [id]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy người dùng.'
      });
    }

    const user = users[0];
    const roleName = user.ten_vai_tro;
    const profile = {
      user: {
        id_nguoi_dung: user.id_nguoi_dung,
        ho_ten: user.ho_ten,
        email: user.email,
        so_dien_thoai: user.so_dien_thoai,
        gioi_tinh: user.gioi_tinh,
        ngay_sinh: user.ngay_sinh,
        id_vai_tro: user.id_vai_tro,
        ten_vai_tro: roleName,
        trang_thai: user.trang_thai,
        ngay_tao: user.ngay_tao
      }
    };

    // Get additional info based on role
    if (roleName === 'nguoi_hien') {
      const [donors] = await pool.execute(
        `SELECT nh.*, bv.ten_benh_vien as ten_benh_vien_xac_nhan
         FROM nguoi_hien_mau nh
         LEFT JOIN nguoi_phu_trach_benh_vien npt ON nh.id_nguoi_phu_trach_benh_vien = npt.id_nguoi_phu_trach
         LEFT JOIN benh_vien bv ON npt.id_benh_vien = bv.id_benh_vien
         WHERE nh.id_nguoi_hien = ?`,
        [id]
      );
      profile.donor = donors[0] || null;
    } else if (roleName === 'to_chuc') {
      const [coordinators] = await pool.execute(
        `SELECT nptc.*, tc.ten_don_vi, tc.dia_chi
         FROM nguoi_phu_trach_to_chuc nptc
         JOIN to_chuc tc ON nptc.id_to_chuc = tc.id_to_chuc
         WHERE nptc.id_nguoi_phu_trach = ?`,
        [id]
      );
      if (coordinators.length > 0) {
        profile.coordinator = {
          id_nguoi_phu_trach: coordinators[0].id_nguoi_phu_trach,
          chuc_vu: coordinators[0].chuc_vu
        };
        profile.organization = {
          id_to_chuc: coordinators[0].id_to_chuc,
          ten_don_vi: coordinators[0].ten_don_vi,
          dia_chi: coordinators[0].dia_chi
        };
      }
    } else if (roleName === 'benh_vien') {
      const [coordinators] = await pool.execute(
        `SELECT nptbv.*, bv.ten_benh_vien, bv.dia_chi
         FROM nguoi_phu_trach_benh_vien nptbv
         JOIN benh_vien bv ON nptbv.id_benh_vien = bv.id_benh_vien
         WHERE nptbv.id_nguoi_phu_trach = ?`,
        [id]
      );
      if (coordinators.length > 0) {
        profile.coordinator = {
          id_nguoi_phu_trach: coordinators[0].id_nguoi_phu_trach,
          chuc_vu: coordinators[0].chuc_vu
        };
        profile.hospital = {
          id_benh_vien: coordinators[0].id_benh_vien,
          ten_benh_vien: coordinators[0].ten_benh_vien,
          dia_chi: coordinators[0].dia_chi
        };
      }
    } else if (roleName === 'nhom_tinh_nguyen') {
      const [groups] = await pool.execute(
        `SELECT id_nhom, ten_nhom, dia_chi
         FROM nhom_tinh_nguyen WHERE id_nguoi_dung = ?`,
        [id]
      );
      profile.volunteerGroup = groups[0] || null;
    }

    res.json({
      success: true,
      data: profile
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

    // Lấy thông tin người dùng mục tiêu (bao gồm email, ho_ten, id_vai_tro)
    const [targetRows] = await pool.execute(
      'SELECT id_vai_tro, email, ho_ten, trang_thai FROM nguoidung WHERE id_nguoi_dung = ?',
      [id]
    );

    if (targetRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy người dùng.'
      });
    }

    const targetUser = targetRows[0];
    const targetRoleId = targetUser.id_vai_tro;
    const ADMIN_ROLE_ID = 5; // giả định id_vai_tro = 5 là quản trị viên
    const oldStatus = targetUser.trang_thai;

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

    // Update status
    await pool.execute(
      'UPDATE nguoidung SET trang_thai = ? WHERE id_nguoi_dung = ?',
      [trang_thai, id]
    );

    // Send approval email if status changed from false to true for special roles
    // MySQL returns boolean as 0/1, so we need to check both
    const wasInactive = oldStatus === false || oldStatus === 0 || oldStatus === null;
    const isNowActive = trang_thai === true || trang_thai === 1;

    console.log('📧 Email check:', {
      userId: id,
      oldStatus,
      newStatus: trang_thai,
      wasInactive,
      isNowActive,
      roleId: targetRoleId
    });

    if (isNowActive && wasInactive) {
      // Get role name
      const [roles] = await pool.execute(
        'SELECT ten_vai_tro FROM vaitro WHERE id_vai_tro = ?',
        [targetRoleId]
      );

      const roleName = roles[0]?.ten_vai_tro;
      console.log('📧 Role name:', roleName);

      // Only send email for special roles that require approval
      if (['to_chuc', 'benh_vien', 'nhom_tinh_nguyen'].includes(roleName)) {
        console.log(`📧 Sending approval email to ${targetUser.email} for role ${roleName}`);
        try {
          await sendAccountApprovalEmail(
            targetUser.email,
            targetUser.ho_ten,
            roleName
          );
          console.log(`✅ Account approval email sent to ${targetUser.email}`);
        } catch (emailError) {
          console.error('❌ Error sending account approval email:', emailError);
          // Don't fail the status update if email fails
        }
      } else {
        console.log(`📧 Skipping email - role ${roleName} does not require approval notification`);
      }
    } else {
      console.log('📧 Skipping email - status change does not meet criteria');
    }

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

    // Get new users this month
    const [newUsersThisMonth] = await pool.execute(
      `SELECT COUNT(*) as count FROM nguoidung 
       WHERE MONTH(ngay_tao) = MONTH(CURRENT_DATE()) 
       AND YEAR(ngay_tao) = YEAR(CURRENT_DATE())`
    );

    // Get pending events
    const [pendingEvents] = await pool.execute(
      `SELECT COUNT(*) as count FROM sukien_hien_mau WHERE trang_thai = 'cho_duyet'`
    );

    // Get pending registrations
    const [pendingRegistrations] = await pool.execute(
      `SELECT COUNT(*) as count FROM dang_ky_hien_mau WHERE trang_thai = 'cho_duyet'`
    );

    // Get total blood donated (sum of all successful donations)
    const [totalBlood] = await pool.execute(
      `SELECT COALESCE(SUM(luong_ml), 0) as total FROM ket_qua_hien_mau WHERE ket_qua = 'Dat'`
    );

    res.json({
      success: true,
      data: {
        totalUsers: userCount[0].count,
        totalDonors: donorCount[0].count,
        totalEvents: eventCount[0].count,
        totalRegistrations: registrationCount[0].count,
        newUsersThisMonth: newUsersThisMonth[0].count,
        pendingEvents: pendingEvents[0].count,
        pendingRegistrations: pendingRegistrations[0].count,
        totalBloodDonated: totalBlood[0].total
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get recent activities
export const getRecentActivities = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const halfLimit = Math.floor(limit / 2);

    // Get recent user registrations
    const [recentUsers] = await pool.execute(
      `SELECT 
        nd.id_nguoi_dung,
        nd.ho_ten,
        nd.email,
        nd.ngay_tao,
        vt.ten_vai_tro,
        'user_registered' as activity_type
      FROM nguoidung nd
      JOIN vaitro vt ON nd.id_vai_tro = vt.id_vai_tro
      ORDER BY nd.ngay_tao DESC
      LIMIT ${halfLimit}`
    );

    // Get recent event status changes (approved/rejected)
    const [recentEvents] = await pool.execute(
      `SELECT 
        sk.id_su_kien,
        sk.ten_su_kien,
        sk.trang_thai,
        sk.ngay_bat_dau,
        sk.ly_do_tu_choi,
        tc.ten_don_vi,
        CASE 
          WHEN sk.trang_thai = 'da_duyet' THEN 'event_approved'
          WHEN sk.trang_thai = 'tu_choi' THEN 'event_rejected'
          ELSE 'event_created'
        END as activity_type
      FROM sukien_hien_mau sk
      LEFT JOIN to_chuc tc ON sk.id_to_chuc = tc.id_to_chuc
      WHERE sk.trang_thai IN ('da_duyet', 'tu_choi')
      ORDER BY sk.ngay_bat_dau DESC
      LIMIT ${halfLimit}`
    );

    // Combine and sort activities by timestamp
    const activities = [
      ...recentUsers.map(user => ({
        id: `user_${user.id_nguoi_dung}`,
        type: user.activity_type,
        title: 'Người dùng mới đăng ký',
        description: `${user.ho_ten} (${getRoleLabel(user.ten_vai_tro)})`,
        timestamp: user.ngay_tao,
        badge: 'primary',
        badgeText: 'Mới'
      })),
      ...recentEvents.map(event => ({
        id: `event_${event.id_su_kien}`,
        type: event.activity_type,
        title: event.activity_type === 'event_approved' ? 'Sự kiện được duyệt' : 'Sự kiện bị từ chối',
        description: `${event.ten_su_kien} - ${event.ten_don_vi || 'N/A'}`,
        timestamp: event.ngay_bat_dau,
        badge: event.activity_type === 'event_approved' ? 'success' : 'danger',
        badgeText: event.activity_type === 'event_approved' ? 'Đã duyệt' : 'Từ chối'
      }))
    ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, limit);

    res.json({
      success: true,
      data: { activities }
    });
  } catch (error) {
    next(error);
  }
};

// Helper function for role labels
function getRoleLabel(role) {
  const labels = {
    'admin': 'Quản trị viên',
    'nguoi_hien': 'Người hiến máu',
    'to_chuc': 'Tổ chức',
    'benh_vien': 'Bệnh viện',
    'nhom_tinh_nguyen': 'Tình nguyện viên'
  };
  return labels[role] || role;
}

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

