import pool from '../config/database.js';

// Get organization info for current user
const getOrganizationId = async (userId) => {
  const [orgs] = await pool.execute(
    'SELECT id_to_chuc FROM nguoi_phu_trach_to_chuc WHERE id_nguoi_dung = ?',
    [userId]
  );
  return orgs.length > 0 ? orgs[0].id_to_chuc : null;
};

// Get my events
export const getMyEvents = async (req, res, next) => {
  try {
    const userId = req.user.id_nguoi_dung;
    const orgId = await getOrganizationId(userId);

    if (!orgId) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy thông tin tổ chức.'
      });
    }

    const [events] = await pool.execute(
      `SELECT 
        sk.id_su_kien,
        sk.ten_su_kien,
        sk.ngay_bat_dau,
        sk.ngay_ket_thuc,
        sk.so_luong_du_kien,
        sk.trang_thai,
        bv.ten_benh_vien,
        sk.ten_dia_diem,
        sk.dia_chi
      FROM sukien_hien_mau sk
      JOIN benh_vien bv ON sk.id_benh_vien = bv.id_benh_vien
      WHERE sk.id_to_chuc = ?
      ORDER BY sk.ngay_bat_dau DESC`,
      [orgId]
    );

    res.json({
      success: true,
      data: {
        events
      }
    });
  } catch (error) {
    next(error);
  }
};

// Create event
export const createEvent = async (req, res, next) => {
  try {
    const userId = req.user.id_nguoi_dung;
    const orgId = await getOrganizationId(userId);

    if (!orgId) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy thông tin tổ chức.'
      });
    }

    const {
      ten_su_kien,
      id_benh_vien,
      ngay_bat_dau,
      ngay_ket_thuc,
      ten_dia_diem,
      dia_chi,
      so_luong_du_kien
    } = req.body;

    if (!ten_su_kien || !id_benh_vien || !ngay_bat_dau || !ten_dia_diem || !dia_chi) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng điền đầy đủ thông tin bắt buộc.'
      });
    }

    const [result] = await pool.execute(
      `INSERT INTO sukien_hien_mau 
       (id_to_chuc, id_benh_vien, ten_su_kien, ngay_bat_dau, ngay_ket_thuc, ten_dia_diem, dia_chi, so_luong_du_kien, trang_thai)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'cho_duyet')`,
      [orgId, id_benh_vien, ten_su_kien, ngay_bat_dau, ngay_ket_thuc || null, ten_dia_diem, dia_chi, so_luong_du_kien || null]
    );

    // Get created event
    const [events] = await pool.execute(
      `SELECT 
        sk.id_su_kien,
        sk.ten_su_kien,
        sk.ngay_bat_dau,
        sk.ngay_ket_thuc,
        sk.so_luong_du_kien,
        sk.trang_thai,
        bv.ten_benh_vien,
        sk.ten_dia_diem,
        sk.dia_chi
      FROM sukien_hien_mau sk
      JOIN benh_vien bv ON sk.id_benh_vien = bv.id_benh_vien
      WHERE sk.id_su_kien = ?`,
      [result.insertId]
    );

    res.status(201).json({
      success: true,
      message: 'Tạo sự kiện thành công. Đang chờ duyệt.',
      data: {
        event: events[0]
      }
    });
  } catch (error) {
    next(error);
  }
};

// Update event
export const updateEvent = async (req, res, next) => {
  try {
    const userId = req.user.id_nguoi_dung;
    const { id } = req.params;
    const orgId = await getOrganizationId(userId);

    if (!orgId) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy thông tin tổ chức.'
      });
    }

    // Check if event belongs to organization
    const [events] = await pool.execute(
      'SELECT id_su_kien FROM sukien_hien_mau WHERE id_su_kien = ? AND id_to_chuc = ?',
      [id, orgId]
    );

    if (events.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Sự kiện không tồn tại hoặc không thuộc tổ chức của bạn.'
      });
    }

    const {
      ten_su_kien,
      id_benh_vien,
      ngay_bat_dau,
      ngay_ket_thuc,
      ten_dia_diem,
      dia_chi,
      so_luong_du_kien
    } = req.body;

    const updateFields = [];
    const updateValues = [];

    if (ten_su_kien) {
      updateFields.push('ten_su_kien = ?');
      updateValues.push(ten_su_kien);
    }
    if (id_benh_vien) {
      updateFields.push('id_benh_vien = ?');
      updateValues.push(id_benh_vien);
    }
    if (ngay_bat_dau) {
      updateFields.push('ngay_bat_dau = ?');
      updateValues.push(ngay_bat_dau);
    }
    if (ngay_ket_thuc !== undefined) {
      updateFields.push('ngay_ket_thuc = ?');
      updateValues.push(ngay_ket_thuc || null);
    }
    if (ten_dia_diem !== undefined) {
      updateFields.push('ten_dia_diem = ?');
      updateValues.push(ten_dia_diem || null);
    }
    if (dia_chi !== undefined) {
      updateFields.push('dia_chi = ?');
      updateValues.push(dia_chi || null);
    }
    if (so_luong_du_kien !== undefined) {
      updateFields.push('so_luong_du_kien = ?');
      updateValues.push(so_luong_du_kien || null);
    }

    if (updateFields.length > 0) {
      updateValues.push(id);
      await pool.execute(
        `UPDATE sukien_hien_mau SET ${updateFields.join(', ')} WHERE id_su_kien = ?`,
        updateValues
      );
    }

    // Get updated event
    const [updatedEvents] = await pool.execute(
      `SELECT 
        sk.id_su_kien,
        sk.ten_su_kien,
        sk.ngay_bat_dau,
        sk.ngay_ket_thuc,
        sk.so_luong_du_kien,
        sk.trang_thai,
        bv.ten_benh_vien,
        sk.ten_dia_diem,
        sk.dia_chi
      FROM sukien_hien_mau sk
      JOIN benh_vien bv ON sk.id_benh_vien = bv.id_benh_vien
      WHERE sk.id_su_kien = ?`,
      [id]
    );

    res.json({
      success: true,
      message: 'Cập nhật sự kiện thành công.',
      data: {
        event: updatedEvents[0]
      }
    });
  } catch (error) {
    next(error);
  }
};

// Delete event
export const deleteEvent = async (req, res, next) => {
  try {
    const userId = req.user.id_nguoi_dung;
    const { id } = req.params;
    const orgId = await getOrganizationId(userId);

    if (!orgId) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy thông tin tổ chức.'
      });
    }

    // Check if event belongs to organization
    const [events] = await pool.execute(
      'SELECT id_su_kien FROM sukien_hien_mau WHERE id_su_kien = ? AND id_to_chuc = ?',
      [id, orgId]
    );

    if (events.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Sự kiện không tồn tại hoặc không thuộc tổ chức của bạn.'
      });
    }

    await pool.execute('DELETE FROM sukien_hien_mau WHERE id_su_kien = ?', [id]);

    res.json({
      success: true,
      message: 'Xóa sự kiện thành công.'
    });
  } catch (error) {
    next(error);
  }
};

// Get event registrations
export const getEventRegistrations = async (req, res, next) => {
  try {
    const userId = req.user.id_nguoi_dung;
    const { id } = req.params;
    const orgId = await getOrganizationId(userId);

    if (!orgId) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy thông tin tổ chức.'
      });
    }

    // Check if event belongs to organization
    const [events] = await pool.execute(
      'SELECT id_su_kien FROM sukien_hien_mau WHERE id_su_kien = ? AND id_to_chuc = ?',
      [id, orgId]
    );

    if (events.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Sự kiện không tồn tại hoặc không thuộc tổ chức của bạn.'
      });
    }

    // Get registrations
    const [registrations] = await pool.execute(
      `SELECT 
        dk.id_dang_ky,
        dk.id_nguoi_hien,
        dk.ngay_dang_ky,
        dk.trang_thai,
        dk.ghi_chu_duyet,
        nh.nhom_mau,
        nd.ho_ten,
        nd.email,
        nd.so_dien_thoai,
        nd.gioi_tinh,
        nd.ngay_sinh
      FROM dang_ky_hien_mau dk
      JOIN nguoi_hien_mau nh ON dk.id_nguoi_hien = nh.id_nguoi_hien
      JOIN nguoidung nd ON nh.id_nguoi_dung = nd.id_nguoi_dung
      WHERE dk.id_su_kien = ?
      ORDER BY dk.ngay_dang_ky DESC`,
      [id]
    );

    res.json({
      success: true,
      data: {
        registrations
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get organization stats for dashboard
export const getStats = async (req, res, next) => {
  try {
    const userId = req.user.id_nguoi_dung;
    const orgId = await getOrganizationId(userId);

    if (!orgId) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy thông tin tổ chức.'
      });
    }

    // Get total events
    const [eventCount] = await pool.execute(
      'SELECT COUNT(*) as count FROM sukien_hien_mau WHERE id_to_chuc = ?',
      [orgId]
    );

    // Get pending registrations count
    const [pendingCount] = await pool.execute(
      `SELECT COUNT(*) as count 
       FROM dang_ky_hien_mau dk
       JOIN sukien_hien_mau sk ON dk.id_su_kien = sk.id_su_kien
       WHERE sk.id_to_chuc = ? AND dk.trang_thai = 'cho_duyet'`,
      [orgId]
    );

    // Get approved registrations count
    const [approvedCount] = await pool.execute(
      `SELECT COUNT(*) as count 
       FROM dang_ky_hien_mau dk
       JOIN sukien_hien_mau sk ON dk.id_su_kien = sk.id_su_kien
       WHERE sk.id_to_chuc = ? AND dk.trang_thai = 'da_duyet'`,
      [orgId]
    );

    // Get total participants (all registrations)
    const [participantCount] = await pool.execute(
      `SELECT COUNT(DISTINCT dk.id_nguoi_hien) as count 
       FROM dang_ky_hien_mau dk
       JOIN sukien_hien_mau sk ON dk.id_su_kien = sk.id_su_kien
       WHERE sk.id_to_chuc = ?`,
      [orgId]
    );

    res.json({
      success: true,
      data: {
        totalEvents: eventCount[0].count,
        pendingApprovals: pendingCount[0].count,
        approvedRegistrations: approvedCount[0].count,
        totalParticipants: participantCount[0].count
      }
    });
  } catch (error) {
    next(error);
  }
};

