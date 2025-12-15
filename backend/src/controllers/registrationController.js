import pool from '../config/database.js';
import { sendRegistrationApprovalEmail } from '../utils/email.js';

// Register for event
export const registerForEvent = async (req, res, next) => {
  try {
    const userId = req.user.id_nguoi_dung;
    const { eventId } = req.params;
    const { ngay_hen_hien, khung_gio, phieu_kham_sang_loc } = req.body;
    const id_su_kien = parseInt(eventId);

    // Validation
    if (!id_su_kien || isNaN(id_su_kien)) {
      return res.status(400).json({
        success: false,
        message: 'ID sự kiện không hợp lệ.'
      });
    }

    if (!ngay_hen_hien || !khung_gio || !phieu_kham_sang_loc) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng điền đầy đủ thông tin đăng ký (ngày hẹn, khung giờ, phiếu khám sàng lọc).'
      });
    }

    // Get donor id - id_nguoi_hien is the primary key and equals id_nguoi_dung
    const [donors] = await pool.execute(
      'SELECT id_nguoi_hien FROM nguoi_hien_mau WHERE id_nguoi_hien = ?',
      [userId]
    );

    if (donors.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy thông tin người hiến máu.'
      });
    }

    const donorId = donors[0].id_nguoi_hien;

    // Check if already registered
    const [existing] = await pool.execute(
      'SELECT id_dang_ky FROM dang_ky_hien_mau WHERE id_su_kien = ? AND id_nguoi_hien = ?',
      [id_su_kien, donorId]
    );

    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Bạn đã đăng ký sự kiện này rồi.'
      });
    }

    // Check if event exists and is approved
    const [events] = await pool.execute(
      'SELECT id_su_kien, trang_thai FROM sukien_hien_mau WHERE id_su_kien = ?',
      [id_su_kien]
    );

    if (events.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Sự kiện không tồn tại.'
      });
    }

    if (events[0].trang_thai !== 'da_duyet') {
      return res.status(400).json({
        success: false,
        message: 'Sự kiện chưa được duyệt.'
      });
    }

    // Create registration with full data
    const [result] = await pool.execute(
      `INSERT INTO dang_ky_hien_mau 
       (id_su_kien, id_nguoi_hien, ngay_hen_hien, khung_gio, phieu_kham_sang_loc, trang_thai) 
       VALUES (?, ?, ?, ?, ?, "cho_duyet")`,
      [id_su_kien, donorId, ngay_hen_hien, khung_gio, JSON.stringify(phieu_kham_sang_loc)]
    );

    // Get created registration
    const [registrations] = await pool.execute(
      `SELECT 
        dk.id_dang_ky,
        dk.id_su_kien,
        dk.ngay_dang_ky,
        dk.ngay_hen_hien,
        dk.khung_gio,
        dk.trang_thai,
        sk.ten_su_kien,
        sk.ngay_bat_dau
      FROM dang_ky_hien_mau dk
      JOIN sukien_hien_mau sk ON dk.id_su_kien = sk.id_su_kien
      WHERE dk.id_dang_ky = ?`,
      [result.insertId]
    );

    res.status(201).json({
      success: true,
      message: 'Đăng ký thành công. Vui lòng chờ duyệt.',
      data: {
        registration: registrations[0]
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get my registrations
export const getMyRegistrations = async (req, res, next) => {
  try {
    const userId = req.user.id_nguoi_dung;

    // Get donor id - id_nguoi_hien is the primary key and equals id_nguoi_dung
    const [donors] = await pool.execute(
      'SELECT id_nguoi_hien FROM nguoi_hien_mau WHERE id_nguoi_hien = ?',
      [userId]
    );

    if (donors.length === 0) {
      return res.json({
        success: true,
        data: {
          registrations: []
        }
      });
    }

    const donorId = donors[0].id_nguoi_hien;

    // Get registrations with donation results
    const [registrations] = await pool.execute(
      `SELECT 
        dk.id_dang_ky,
        dk.id_su_kien,
        dk.ngay_dang_ky,
        dk.ngay_hen_hien,
        dk.khung_gio,
        dk.trang_thai,
        dk.ghi_chu_duyet,
        dk.phieu_kham_sang_loc,
        sk.ten_su_kien,
        sk.ngay_bat_dau,
        sk.ngay_ket_thuc,
        tc.ten_don_vi,
        bv.ten_benh_vien,
        sk.ten_dia_diem,
        sk.dia_chi,
        kq.id_ket_qua,
        kq.ngay_hien,
        kq.luong_ml,
        kq.ket_qua as ket_qua_hien_mau
      FROM dang_ky_hien_mau dk
      JOIN sukien_hien_mau sk ON dk.id_su_kien = sk.id_su_kien
      JOIN to_chuc tc ON sk.id_to_chuc = tc.id_to_chuc
      JOIN benh_vien bv ON sk.id_benh_vien = bv.id_benh_vien
      LEFT JOIN ket_qua_hien_mau kq ON dk.id_nguoi_hien = kq.id_nguoi_hien AND dk.id_su_kien = kq.id_su_kien
      WHERE dk.id_nguoi_hien = ?
      ORDER BY dk.ngay_dang_ky DESC`,
      [donorId]
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

// Get all registrations for all events of an organization (for organization manager)
export const getAllOrganizationRegistrations = async (req, res, next) => {
  try {
    const userId = req.user.id_nguoi_dung;

    // Get all registrations for all events managed by this organization
    const [registrations] = await pool.execute(
      `SELECT 
        dk.id_dang_ky,
        dk.id_su_kien,
        dk.id_nguoi_hien,
        dk.ngay_dang_ky,
        dk.ngay_hen_hien,
        dk.khung_gio,
        dk.phieu_kham_sang_loc,
        dk.trang_thai,
        dk.ghi_chu_duyet,
        nd.ho_ten,
        nd.email,
        nd.so_dien_thoai,
        nd.gioi_tinh,
        nd.ngay_sinh,
        nhm.nhom_mau,
        nhm.tong_so_lan_hien,
        nhm.lan_hien_gan_nhat,
        nhm.nhom_mau_xac_nhan,
        sk.ten_su_kien,
        sk.ten_dia_diem,
        sk.dia_chi,
        sk.ngay_bat_dau,
        sk.ngay_ket_thuc
      FROM dang_ky_hien_mau dk
      JOIN nguoi_hien_mau nhm ON dk.id_nguoi_hien = nhm.id_nguoi_hien
      JOIN nguoidung nd ON nhm.id_nguoi_hien = nd.id_nguoi_dung
      JOIN sukien_hien_mau sk ON dk.id_su_kien = sk.id_su_kien
      JOIN nguoi_phu_trach_to_chuc npt ON sk.id_to_chuc = npt.id_to_chuc
      WHERE npt.id_nguoi_phu_trach = ?
      ORDER BY dk.ngay_dang_ky DESC`,
      [userId]
    );

    // Parse JSON phieu_kham_sang_loc (if it's still a string)
    const formattedRegistrations = registrations.map(reg => ({
      ...reg,
      phieu_kham_sang_loc: reg.phieu_kham_sang_loc 
        ? (typeof reg.phieu_kham_sang_loc === 'string' ? JSON.parse(reg.phieu_kham_sang_loc) : reg.phieu_kham_sang_loc)
        : null
    }));

    res.json({
      success: true,
      data: {
        registrations: formattedRegistrations
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get registrations for an event (for organization manager)
export const getEventRegistrations = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const userId = req.user.id_nguoi_dung;

    // Check if user is organization manager for this event
    const [events] = await pool.execute(
      `SELECT sk.id_su_kien, sk.id_to_chuc
       FROM sukien_hien_mau sk
       JOIN nguoi_phu_trach_to_chuc npt ON sk.id_to_chuc = npt.id_to_chuc
       WHERE sk.id_su_kien = ? AND npt.id_nguoi_phu_trach = ?`,
      [eventId, userId]
    );

    if (events.length === 0) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền xem danh sách đăng ký của sự kiện này.'
      });
    }

    // Get all registrations for this event
    const [registrations] = await pool.execute(
      `SELECT 
        dk.id_dang_ky,
        dk.id_su_kien,
        dk.id_nguoi_hien,
        dk.ngay_dang_ky,
        dk.ngay_hen_hien,
        dk.khung_gio,
        dk.phieu_kham_sang_loc,
        dk.trang_thai,
        dk.ghi_chu_duyet,
        nd.ho_ten,
        nd.email,
        nd.so_dien_thoai,
        nd.gioi_tinh,
        nd.ngay_sinh,
        nhm.nhom_mau,
        nhm.tong_so_lan_hien,
        nhm.lan_hien_gan_nhat,
        nhm.nhom_mau_xac_nhan
      FROM dang_ky_hien_mau dk
      JOIN nguoi_hien_mau nhm ON dk.id_nguoi_hien = nhm.id_nguoi_hien
      JOIN nguoidung nd ON nhm.id_nguoi_hien = nd.id_nguoi_dung
      WHERE dk.id_su_kien = ?
      ORDER BY dk.ngay_dang_ky DESC`,
      [eventId]
    );

    // Parse JSON phieu_kham_sang_loc (if it's still a string)
    const formattedRegistrations = registrations.map(reg => ({
      ...reg,
      phieu_kham_sang_loc: reg.phieu_kham_sang_loc 
        ? (typeof reg.phieu_kham_sang_loc === 'string' ? JSON.parse(reg.phieu_kham_sang_loc) : reg.phieu_kham_sang_loc)
        : null
    }));

    res.json({
      success: true,
      data: {
        registrations: formattedRegistrations
      }
    });
  } catch (error) {
    next(error);
  }
};

// Delete registration (only if pending)
export const deleteRegistration = async (req, res, next) => {
  try {
    const { registrationId } = req.params;
    const userId = req.user.id_nguoi_dung;

    // Check if user owns this registration and it's still pending
    const [registrations] = await pool.execute(
      `SELECT dk.id_dang_ky, dk.trang_thai, dk.id_nguoi_hien
       FROM dang_ky_hien_mau dk
       JOIN nguoi_hien_mau nhm ON dk.id_nguoi_hien = nhm.id_nguoi_hien
       WHERE dk.id_dang_ky = ? AND nhm.id_nguoi_hien = ?`,
      [registrationId, userId]
    );

    if (registrations.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đơn đăng ký hoặc bạn không có quyền xóa.'
      });
    }

    if (registrations[0].trang_thai !== 'cho_duyet') {
      return res.status(400).json({
        success: false,
        message: 'Chỉ có thể xóa đơn đăng ký đang chờ duyệt.'
      });
    }

    // Delete registration
    await pool.execute(
      'DELETE FROM dang_ky_hien_mau WHERE id_dang_ky = ?',
      [registrationId]
    );

    res.json({
      success: true,
      message: 'Đã xóa đơn đăng ký thành công.'
    });
  } catch (error) {
    next(error);
  }
};

// Approve or reject registration
export const updateRegistrationStatus = async (req, res, next) => {
  try {
    const { registrationId } = req.params;
    const { trang_thai, ghi_chu_duyet } = req.body;
    const userId = req.user.id_nguoi_dung;

    // Validation
    if (!['da_duyet', 'tu_choi'].includes(trang_thai)) {
      return res.status(400).json({
        success: false,
        message: 'Trạng thái không hợp lệ. Chỉ chấp nhận "da_duyet" hoặc "tu_choi".'
      });
    }

    // Check if user is organization manager for this registration's event
    const [registrations] = await pool.execute(
      `SELECT dk.id_dang_ky, sk.id_to_chuc
       FROM dang_ky_hien_mau dk
       JOIN sukien_hien_mau sk ON dk.id_su_kien = sk.id_su_kien
       JOIN nguoi_phu_trach_to_chuc npt ON sk.id_to_chuc = npt.id_to_chuc
       WHERE dk.id_dang_ky = ? AND npt.id_nguoi_phu_trach = ?`,
      [registrationId, userId]
    );

    if (registrations.length === 0) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền duyệt đăng ký này.'
      });
    }

    // Get donor and event info before updating (for email)
    const [donorInfo] = await pool.execute(
      `SELECT 
        nd.ho_ten,
        nd.email,
        dk.ngay_hen_hien,
        dk.khung_gio,
        sk.ten_su_kien,
        sk.ten_dia_diem,
        sk.dia_chi
      FROM dang_ky_hien_mau dk
      JOIN nguoi_hien_mau nhm ON dk.id_nguoi_hien = nhm.id_nguoi_hien
      JOIN nguoidung nd ON nhm.id_nguoi_hien = nd.id_nguoi_dung
      JOIN sukien_hien_mau sk ON dk.id_su_kien = sk.id_su_kien
      WHERE dk.id_dang_ky = ?`,
      [registrationId]
    );

    // Update registration status
    await pool.execute(
      `UPDATE dang_ky_hien_mau 
       SET trang_thai = ?, 
           ghi_chu_duyet = ?,
           id_nguoi_duyet = ?
       WHERE id_dang_ky = ?`,
      [trang_thai, ghi_chu_duyet || null, userId, registrationId]
    );

    // Send email notification
    if (donorInfo.length > 0) {
      const donor = donorInfo[0];
      const eventInfo = {
        ten_su_kien: donor.ten_su_kien,
        ngay_hen_hien: donor.ngay_hen_hien,
        khung_gio: donor.khung_gio,
        ten_dia_diem: donor.ten_dia_diem,
        dia_chi: donor.dia_chi
      };
      
      // Send email asynchronously (don't wait for it)
      sendRegistrationApprovalEmail(
        donor.email,
        donor.ho_ten,
        eventInfo,
        trang_thai,
        ghi_chu_duyet || ''
      ).catch(err => console.error('Email sending failed:', err));
    }

    // Get updated registration
    const [updated] = await pool.execute(
      `SELECT 
        dk.id_dang_ky,
        dk.trang_thai,
        dk.ghi_chu_duyet,
        nd.ho_ten as nguoi_duyet
      FROM dang_ky_hien_mau dk
      LEFT JOIN nguoidung nd ON dk.id_nguoi_duyet = nd.id_nguoi_dung
      WHERE dk.id_dang_ky = ?`,
      [registrationId]
    );

    res.json({
      success: true,
      message: trang_thai === 'da_duyet' ? 'Đã duyệt đăng ký thành công. Email thông báo đã được gửi.' : 'Đã từ chối đăng ký. Email thông báo đã được gửi.',
      data: {
        registration: updated[0]
      }
    });
  } catch (error) {
    next(error);
  }
};

