import pool from '../config/database.js';
import { createNotification } from './notificationController.js';
import { sendEventUpdateEmail, sendNewEventNotificationEmail } from '../utils/email.js';

// Get organization info for current user
const getOrganizationId = async (userId) => {
  const [orgs] = await pool.execute(
    'SELECT id_to_chuc FROM nguoi_phu_trach_to_chuc WHERE id_nguoi_phu_trach = ?',
    [userId]
  );
  return orgs.length > 0 ? orgs[0].id_to_chuc : null;
};

// Get my events
export const getMyEvents = async (req, res, next) => {
  try {
    const userId = req.user.id_nguoi_dung;
    const orgId = await getOrganizationId(userId);
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    if (!orgId) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy thông tin tổ chức.'
      });
    }

    // Get total count
    const [countResult] = await pool.execute(
      `SELECT COUNT(*) as total FROM sukien_hien_mau WHERE id_to_chuc = ?`,
      [orgId]
    );
    const total = countResult[0].total;

    const [events] = await pool.execute(
      `SELECT 
        sk.id_su_kien,
        sk.ten_su_kien,
        sk.ngay_bat_dau,
        sk.ngay_ket_thuc,
        sk.so_luong_du_kien,
        sk.trang_thai,
        sk.ly_do_tu_choi,
        bv.ten_benh_vien,
        sk.ten_dia_diem,
        sk.dia_chi
      FROM sukien_hien_mau sk
      JOIN benh_vien bv ON sk.id_benh_vien = bv.id_benh_vien
      WHERE sk.id_to_chuc = ?
      ORDER BY sk.ngay_bat_dau DESC
      LIMIT ${limit} OFFSET ${offset}`,
      [orgId]
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

    // Validate ngay_bat_dau is not in the past
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startDate = new Date(ngay_bat_dau);
    startDate.setHours(0, 0, 0, 0);
    
    if (startDate < today) {
      return res.status(400).json({
        success: false,
        message: 'Ngày bắt đầu sự kiện không được trong quá khứ.'
      });
    }

    // Validate ngay_ket_thuc is after ngay_bat_dau if provided
    if (ngay_ket_thuc) {
      const endDate = new Date(ngay_ket_thuc);
      endDate.setHours(0, 0, 0, 0);
      
      if (endDate < startDate) {
        return res.status(400).json({
          success: false,
          message: 'Ngày kết thúc phải sau ngày bắt đầu.'
        });
      }
    }

    const [result] = await pool.execute(
      `INSERT INTO sukien_hien_mau 
       (id_to_chuc, id_benh_vien, ten_su_kien, ngay_bat_dau, ngay_ket_thuc, ten_dia_diem, dia_chi, so_luong_du_kien, trang_thai)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'cho_duyet')`,
      [orgId, id_benh_vien, ten_su_kien, ngay_bat_dau, ngay_ket_thuc || null, ten_dia_diem, dia_chi, so_luong_du_kien || null]
    );

    // Get created event with organization info
    const [events] = await pool.execute(
      `SELECT 
        sk.id_su_kien,
        sk.ten_su_kien,
        sk.ngay_bat_dau,
        sk.ngay_ket_thuc,
        sk.so_luong_du_kien,
        sk.trang_thai,
        bv.ten_benh_vien,
        bv.id_benh_vien,
        tc.ten_don_vi,
        sk.ten_dia_diem,
        sk.dia_chi
      FROM sukien_hien_mau sk
      JOIN benh_vien bv ON sk.id_benh_vien = bv.id_benh_vien
      JOIN to_chuc tc ON sk.id_to_chuc = tc.id_to_chuc
      WHERE sk.id_su_kien = ?`,
      [result.insertId]
    );

    const event = events[0];

    // Send notification to organization coordinator (creator)
    await createNotification(
      userId,
      'su_kien_tao_thanh_cong',
      'Sự kiện đã được tạo thành công',
      `Sự kiện "${event.ten_su_kien}" đã được tạo thành công và đang chờ bệnh viện "${event.ten_benh_vien}" phê duyệt.`,
      `/organization/events/${event.id_su_kien}`
    );

    // Get hospital coordinator(s) to send notification and email
    const [hospitalCoordinators] = await pool.execute(
      `SELECT 
        nptbv.id_nguoi_phu_trach,
        nd.id_nguoi_dung,
        nd.ho_ten,
        nd.email
      FROM nguoi_phu_trach_benh_vien nptbv
      JOIN nguoidung nd ON nptbv.id_nguoi_phu_trach = nd.id_nguoi_dung
      WHERE nptbv.id_benh_vien = ?`,
      [event.id_benh_vien]
    );

    // Send notification and email to each hospital coordinator
    if (hospitalCoordinators.length > 0) {
      const eventInfo = {
        ten_su_kien: event.ten_su_kien,
        ngay_bat_dau: event.ngay_bat_dau,
        ngay_ket_thuc: event.ngay_ket_thuc,
        ten_dia_diem: event.ten_dia_diem,
        dia_chi: event.dia_chi,
        so_luong_du_kien: event.so_luong_du_kien
      };

      for (const coordinator of hospitalCoordinators) {
        // Send in-app notification
        await createNotification(
          coordinator.id_nguoi_dung,
          'su_kien_moi',
          'Sự kiện hiến máu mới cần phê duyệt',
          `Tổ chức "${event.ten_don_vi}" đã tạo sự kiện "${event.ten_su_kien}" và đang chờ bạn phê duyệt.`,
          `/hospital/event-approval`
        );

        // Send email notification (async, don't wait)
        sendNewEventNotificationEmail(
          coordinator.email,
          coordinator.ho_ten,
          event.ten_su_kien,
          event.ten_don_vi,
          eventInfo
        ).catch(err => console.error('Email sending failed:', err));
      }
    }

    res.status(201).json({
      success: true,
      message: 'Tạo sự kiện thành công. Đang chờ duyệt.',
      data: {
        event: {
          id_su_kien: event.id_su_kien,
          ten_su_kien: event.ten_su_kien,
          ngay_bat_dau: event.ngay_bat_dau,
          ngay_ket_thuc: event.ngay_ket_thuc,
          so_luong_du_kien: event.so_luong_du_kien,
          trang_thai: event.trang_thai,
          ten_benh_vien: event.ten_benh_vien,
          ten_dia_diem: event.ten_dia_diem,
          dia_chi: event.dia_chi
        }
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

// Delete/Cancel event
export const deleteEvent = async (req, res, next) => {
  try {
    const userId = req.user.id_nguoi_dung;
    const { id } = req.params;
    const { ly_do_huy } = req.body;
    const orgId = await getOrganizationId(userId);

    if (!orgId) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy thông tin tổ chức.'
      });
    }

    // Get event info and all approved registrations before deleting
    const [eventInfo] = await pool.execute(
      `SELECT ten_su_kien FROM sukien_hien_mau 
       WHERE id_su_kien = ? AND id_to_chuc = ?`,
      [id, orgId]
    );

    if (eventInfo.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Sự kiện không tồn tại hoặc không thuộc tổ chức của bạn.'
      });
    }

    const eventName = eventInfo[0].ten_su_kien;

    // Get all approved registrations to notify
    const [registrations] = await pool.execute(
      `SELECT dk.id_nguoi_hien, nd.id_nguoi_dung, nd.ho_ten, nd.email
       FROM dang_ky_hien_mau dk
       JOIN nguoidung nd ON dk.id_nguoi_hien = nd.id_nguoi_dung
       WHERE dk.id_su_kien = ? AND dk.trang_thai = 'da_duyet'`,
      [id]
    );

    // Send notifications and emails to all registered donors
    const reason = ly_do_huy || 'Sự kiện đã bị hủy do lý do bất khả kháng.';
    
    for (const reg of registrations) {
      // Send in-app notification
      await createNotification(
        reg.id_nguoi_dung,
        'su_kien_huy',
        `Sự kiện "${eventName}" đã bị hủy`,
        `Rất tiếc, sự kiện "${eventName}" mà bạn đã đăng ký đã bị hủy. ${reason}`,
        '/donor/registrations'
      );

      // Send email
      sendEventUpdateEmail(
        reg.email,
        reg.ho_ten,
        eventName,
        'cancel',
        reason
      ).catch(err => console.error('Email sending failed:', err));
    }

    // Delete event (cascade delete registrations via FK)
    await pool.execute('DELETE FROM sukien_hien_mau WHERE id_su_kien = ?', [id]);

    res.json({
      success: true,
      message: `Đã hủy sự kiện và thông báo cho ${registrations.length} người đã đăng ký.`
    });
  } catch (error) {
    next(error);
  }
};

// Get event detail
export const getEventDetail = async (req, res, next) => {
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
      `SELECT 
        sk.id_su_kien,
        sk.ten_su_kien,
        sk.ngay_bat_dau,
        sk.ngay_ket_thuc,
        sk.so_luong_du_kien,
        sk.trang_thai,
        sk.ly_do_tu_choi,
        sk.ten_dia_diem,
        sk.dia_chi,
        bv.id_benh_vien,
        bv.ten_benh_vien,
        tc.ten_don_vi
      FROM sukien_hien_mau sk
      JOIN benh_vien bv ON sk.id_benh_vien = bv.id_benh_vien
      JOIN to_chuc tc ON sk.id_to_chuc = tc.id_to_chuc
      WHERE sk.id_su_kien = ? AND sk.id_to_chuc = ?`,
      [id, orgId]
    );

    if (events.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Sự kiện không tồn tại hoặc không thuộc tổ chức của bạn.'
      });
    }

    // Get registration counts
    const [counts] = await pool.execute(
      `SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN trang_thai = 'cho_duyet' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN trang_thai = 'da_duyet' THEN 1 ELSE 0 END) as approved,
        SUM(CASE WHEN trang_thai = 'tu_choi' THEN 1 ELSE 0 END) as rejected
      FROM dang_ky_hien_mau
      WHERE id_su_kien = ?`,
      [id]
    );

    res.json({
      success: true,
      data: {
        event: events[0],
        registrations: {
          total: counts[0].total || 0,
          pending: counts[0].pending || 0,
          approved: counts[0].approved || 0,
          rejected: counts[0].rejected || 0
        }
      }
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
      JOIN nguoidung nd ON nh.id_nguoi_hien = nd.id_nguoi_dung
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

// Get organization profile
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

    // Get organization coordinator info
    const [coordinators] = await pool.execute(
      `SELECT nptc.*, tc.ten_don_vi, tc.dia_chi
       FROM nguoi_phu_trach_to_chuc nptc
       JOIN to_chuc tc ON nptc.id_to_chuc = tc.id_to_chuc
       WHERE nptc.id_nguoi_phu_trach = ?`,
      [userId]
    );

    res.json({
      success: true,
      data: {
        user: users[0],
        coordinator: coordinators[0] || null,
        organization: coordinators[0] ? {
          id_to_chuc: coordinators[0].id_to_chuc,
          ten_don_vi: coordinators[0].ten_don_vi,
          dia_chi: coordinators[0].dia_chi
        } : null
      }
    });
  } catch (error) {
    next(error);
  }
};

// Update organization profile
export const updateProfile = async (req, res, next) => {
  try {
    const userId = req.user.id_nguoi_dung;
    const { ho_ten, so_dien_thoai, chuc_vu, nguoi_lien_he } = req.body;

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

    // Update coordinator info (only nguoi_lien_he, chuc_vu is not in this table)
    if (nguoi_lien_he !== undefined) {
      await pool.execute(
        'UPDATE nguoi_phu_trach_to_chuc SET nguoi_lien_he = ? WHERE id_nguoi_phu_trach = ?',
        [nguoi_lien_he || null, userId]
      );
    }

    // Get updated profile
    const [users] = await pool.execute(
      `SELECT id_nguoi_dung, ho_ten, email, so_dien_thoai, gioi_tinh, ngay_sinh, id_vai_tro, trang_thai 
       FROM nguoidung WHERE id_nguoi_dung = ?`,
      [userId]
    );

    const [coordinators] = await pool.execute(
      `SELECT nptc.*, tc.ten_don_vi, tc.dia_chi
       FROM nguoi_phu_trach_to_chuc nptc
       JOIN to_chuc tc ON nptc.id_to_chuc = tc.id_to_chuc
       WHERE nptc.id_nguoi_phu_trach = ?`,
      [userId]
    );

    res.json({
      success: true,
      message: 'Cập nhật thông tin thành công.',
      data: {
        user: users[0],
        coordinator: coordinators[0] || null,
        organization: coordinators[0] ? {
          id_to_chuc: coordinators[0].id_to_chuc,
          ten_don_vi: coordinators[0].ten_don_vi,
          dia_chi: coordinators[0].dia_chi
        } : null
      }
    });
  } catch (error) {
    next(error);
  }
};

