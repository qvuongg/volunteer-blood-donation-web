import pool from '../config/database.js';

// Get hospital id for user
const getHospitalId = async (userId) => {
  const [hospitals] = await pool.execute(
    'SELECT id_benh_vien FROM nguoi_phu_trach_benh_vien WHERE id_nguoi_dung = ?',
    [userId]
  );
  return hospitals.length > 0 ? hospitals[0].id_benh_vien : null;
};

// Get pending events
export const getPendingEvents = async (req, res, next) => {
  try {
    const userId = req.user.id_nguoi_dung;
    const hospitalId = await getHospitalId(userId);

    if (!hospitalId) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy thông tin bệnh viện.'
      });
    }

    const [events] = await pool.execute(
      `SELECT 
        sk.id_su_kien,
        sk.ten_su_kien,
        sk.ngay_bat_dau,
        sk.ngay_ket_thuc,
        sk.so_luong_du_kien,
        tc.ten_don_vi,
        dd.ten_dia_diem,
        dd.dia_chi
      FROM sukien_hien_mau sk
      JOIN to_chuc tc ON sk.id_to_chuc = tc.id_to_chuc
      LEFT JOIN dia_diem dd ON sk.id_dia_diem = dd.id_dia_diem
      WHERE sk.id_benh_vien = ? AND sk.trang_thai = 'cho_duyet'
      ORDER BY sk.ngay_bat_dau DESC`,
      [hospitalId]
    );

    res.json({
      success: true,
      data: { events }
    });
  } catch (error) {
    next(error);
  }
};

// Approve/reject event
export const updateEventStatus = async (req, res, next) => {
  try {
    const userId = req.user.id_nguoi_dung;
    const { id } = req.params;
    const { action } = req.body; // 'approve' or 'reject'

    const hospitalId = await getHospitalId(userId);
    if (!hospitalId) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy thông tin bệnh viện.'
      });
    }

    // Get coordinator id
    const [coords] = await pool.execute(
      'SELECT id_nguoi_phu_trach FROM nguoi_phu_trach_benh_vien WHERE id_nguoi_dung = ?',
      [userId]
    );
    const coordinatorId = coords[0]?.id_nguoi_phu_trach;

    // Check if event belongs to hospital
    const [events] = await pool.execute(
      'SELECT id_su_kien FROM sukien_hien_mau WHERE id_su_kien = ? AND id_benh_vien = ?',
      [id, hospitalId]
    );

    if (events.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Sự kiện không tồn tại.'
      });
    }

    const status = action === 'approve' ? 'da_duyet' : 'tu_choi';
    await pool.execute(
      'UPDATE sukien_hien_mau SET trang_thai = ?, id_phe_duyet_boi = ? WHERE id_su_kien = ?',
      [status, coordinatorId, id]
    );

    res.json({
      success: true,
      message: action === 'approve' ? 'Duyệt sự kiện thành công.' : 'Từ chối sự kiện thành công.'
    });
  } catch (error) {
    next(error);
  }
};

// Get approved registrations for final approval
export const getApprovedRegistrations = async (req, res, next) => {
  try {
    const userId = req.user.id_nguoi_dung;
    const { id } = req.params; // event id
    const hospitalId = await getHospitalId(userId);

    if (!hospitalId) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy thông tin bệnh viện.'
      });
    }

    const [registrations] = await pool.execute(
      `SELECT 
        dk.id_dang_ky,
        dk.id_nguoi_hien,
        dk.ngay_dang_ky,
        nh.nhom_mau,
        nd.ho_ten,
        nd.email,
        nd.so_dien_thoai
      FROM dang_ky_hien_mau dk
      JOIN nguoi_hien_mau nh ON dk.id_nguoi_hien = nh.id_nguoi_hien
      JOIN nguoidung nd ON nh.id_nguoi_dung = nd.id_nguoi_dung
      JOIN sukien_hien_mau sk ON dk.id_su_kien = sk.id_su_kien
      WHERE dk.id_su_kien = ? AND dk.trang_thai = 'da_duyet' AND sk.id_benh_vien = ?
      ORDER BY dk.ngay_dang_ky DESC`,
      [id, hospitalId]
    );

    res.json({
      success: true,
      data: { registrations }
    });
  } catch (error) {
    next(error);
  }
};

// Create result
export const createResult = async (req, res, next) => {
  try {
    const userId = req.user.id_nguoi_dung;
    const hospitalId = await getHospitalId(userId);

    if (!hospitalId) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy thông tin bệnh viện.'
      });
    }

    const { id_nguoi_hien, id_su_kien, ngay_hien, luong_ml, ket_qua } = req.body;

    if (!id_nguoi_hien || !id_su_kien || !ngay_hien || !ket_qua) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng điền đầy đủ thông tin.'
      });
    }

    await pool.execute(
      `INSERT INTO ket_qua_hien_mau (id_nguoi_hien, id_su_kien, id_benh_vien, ngay_hien, luong_ml, ket_qua)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [id_nguoi_hien, id_su_kien, hospitalId, ngay_hien, luong_ml || null, ket_qua]
    );

    // Update donor's last donation date and count
    await pool.execute(
      `UPDATE nguoi_hien_mau 
       SET lan_hien_gan_nhat = ?, tong_so_lan_hien = tong_so_lan_hien + 1
       WHERE id_nguoi_hien = ?`,
      [ngay_hien, id_nguoi_hien]
    );

    res.json({
      success: true,
      message: 'Cập nhật kết quả thành công.'
    });
  } catch (error) {
    next(error);
  }
};

// Create notification
export const createNotification = async (req, res, next) => {
  try {
    const userId = req.user.id_nguoi_dung;
    const hospitalId = await getHospitalId(userId);

    if (!hospitalId) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy thông tin bệnh viện.'
      });
    }

    const { id_nhom, tieu_de, noi_dung } = req.body;

    if (!id_nhom || !tieu_de || !noi_dung) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng điền đầy đủ thông tin.'
      });
    }

    await pool.execute(
      'INSERT INTO thong_bao (id_benh_vien, id_nhom, tieu_de, noi_dung) VALUES (?, ?, ?, ?)',
      [hospitalId, id_nhom, tieu_de, noi_dung]
    );

    res.json({
      success: true,
      message: 'Gửi thông báo thành công.'
    });
  } catch (error) {
    next(error);
  }
};

