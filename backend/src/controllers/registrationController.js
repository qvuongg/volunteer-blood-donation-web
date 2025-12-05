import pool from '../config/database.js';

// Register for event
export const registerForEvent = async (req, res, next) => {
  try {
    const userId = req.user.id_nguoi_dung;
    const { id_su_kien } = req.body;

    if (!id_su_kien) {
      return res.status(400).json({
        success: false,
        message: 'ID sự kiện là bắt buộc.'
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

    // Create registration
    const [result] = await pool.execute(
      'INSERT INTO dang_ky_hien_mau (id_su_kien, id_nguoi_hien, trang_thai) VALUES (?, ?, "cho_duyet")',
      [id_su_kien, donorId]
    );

    // Get created registration
    const [registrations] = await pool.execute(
      `SELECT 
        dk.id_dang_ky,
        dk.id_su_kien,
        dk.ngay_dang_ky,
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

    // Get registrations
    const [registrations] = await pool.execute(
      `SELECT 
        dk.id_dang_ky,
        dk.id_su_kien,
        dk.ngay_dang_ky,
        dk.trang_thai,
        dk.ghi_chu_duyet,
        sk.ten_su_kien,
        sk.ngay_bat_dau,
        sk.ngay_ket_thuc,
        tc.ten_don_vi,
        bv.ten_benh_vien,
        sk.ten_dia_diem,
        sk.dia_chi
      FROM dang_ky_hien_mau dk
      JOIN sukien_hien_mau sk ON dk.id_su_kien = sk.id_su_kien
      JOIN to_chuc tc ON sk.id_to_chuc = tc.id_to_chuc
      JOIN benh_vien bv ON sk.id_benh_vien = bv.id_benh_vien
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

