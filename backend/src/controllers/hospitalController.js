import pool from '../config/database.js';

// Get pending events for hospital approval
export const getPendingEvents = async (req, res, next) => {
  try {
    const userId = req.user.id_nguoi_dung;

    // Get hospital ID from user
    const [hospital] = await pool.execute(
      'SELECT id_benh_vien FROM nguoi_phu_trach_benh_vien WHERE id_nguoi_phu_trach = ?',
      [userId]
    );

    if (hospital.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy thông tin bệnh viện.'
      });
    }

    const hospitalId = hospital[0].id_benh_vien;

    // Get pending events
    const [events] = await pool.execute(
      `SELECT sk.*, tc.ten_don_vi
      FROM sukien_hien_mau sk
      JOIN to_chuc tc ON sk.id_to_chuc = tc.id_to_chuc
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

// Get approved events for hospital
export const getApprovedEvents = async (req, res, next) => {
  try {
    const userId = req.user.id_nguoi_dung;

    // Get hospital ID from user
    const [hospital] = await pool.execute(
      'SELECT id_benh_vien FROM nguoi_phu_trach_benh_vien WHERE id_nguoi_phu_trach = ?',
      [userId]
    );

    if (hospital.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy thông tin bệnh viện.'
      });
    }

    const hospitalId = hospital[0].id_benh_vien;

    // Get approved events
    const [events] = await pool.execute(
      `SELECT sk.*, tc.ten_don_vi
      FROM sukien_hien_mau sk
      JOIN to_chuc tc ON sk.id_to_chuc = tc.id_to_chuc
      WHERE sk.id_benh_vien = ? AND sk.trang_thai = 'da_duyet'
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

// Approve event
export const approveEvent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id_nguoi_dung;

    // Get coordinator ID
    const [coordinator] = await pool.execute(
      'SELECT id_nguoi_phu_trach FROM nguoi_phu_trach_benh_vien WHERE id_nguoi_phu_trach = ?',
      [userId]
    );

    if (coordinator.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy thông tin người phụ trách.'
      });
    }

    const coordinatorId = coordinator[0].id_nguoi_phu_trach;

    const status = action === 'approve' ? 'da_duyet' : 'tu_choi';
    await pool.execute(
      'UPDATE sukien_hien_mau SET trang_thai = ?, id_phe_duyet_boi = ? WHERE id_su_kien = ?',
      [status, coordinatorId, id]
    );

    res.json({
      success: true,
      message: 'Đã phê duyệt sự kiện.'
    });
  } catch (error) {
    next(error);
  }
};

// Get event participants (approved donors)
export const getEventParticipants = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id_nguoi_dung;

    // Get hospital ID
    const [hospital] = await pool.execute(
      'SELECT id_benh_vien FROM nguoi_phu_trach_benh_vien WHERE id_nguoi_phu_trach = ?',
      [userId]
    );

    if (hospital.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy thông tin bệnh viện.'
      });
    }

    const hospitalId = hospital[0].id_benh_vien;

    // Get participants
    const [participants] = await pool.execute(
      `SELECT 
        dk.id_dang_ky,
        dk.ngay_dang_ky,
        nd.id_nguoi_dung,
        nd.ho_ten,
        nd.email,
        nd.so_dien_thoai,
        nh.id_nguoi_hien,
        nh.nhom_mau,
        nh.nhom_mau_xac_nhan,
        nh.tong_so_lan_hien,
        sk.ten_su_kien
      FROM dang_ky_hien_mau dk
      JOIN nguoi_hien_mau nh ON dk.id_nguoi_hien = nh.id_nguoi_hien
      JOIN nguoidung nd ON nh.id_nguoi_hien = nd.id_nguoi_dung
      JOIN sukien_hien_mau sk ON dk.id_su_kien = sk.id_su_kien
      WHERE dk.id_su_kien = ? AND dk.trang_thai = 'da_duyet' AND sk.id_benh_vien = ?
      ORDER BY dk.ngay_dang_ky DESC`,
      [id, hospitalId]
    );

    res.json({
      success: true,
      data: { participants }
    });
  } catch (error) {
    next(error);
  }
};

// Confirm blood type after donation
export const confirmBloodType = async (req, res, next) => {
  try {
    const { id_nguoi_hien, nhom_mau, ghi_chu } = req.body;
    const userId = req.user.id_nguoi_dung;

    if (!id_nguoi_hien || !nhom_mau) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp đầy đủ thông tin.'
      });
    }

    // Validate blood type
    const validBloodTypes = ['A', 'B', 'AB', 'O'];
    if (!validBloodTypes.includes(nhom_mau)) {
      return res.status(400).json({
        success: false,
        message: 'Nhóm máu không hợp lệ.'
      });
    }

    // Get hospital ID
    const [hospital] = await pool.execute(
      'SELECT id_benh_vien FROM nguoi_phu_trach_benh_vien WHERE id_nguoi_phu_trach = ?',
      [userId]
    );

    if (hospital.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy thông tin bệnh viện.'
      });
    }

    const hospitalId = hospital[0].id_benh_vien;

    // Get coordinator ID for confirmation
    const [coordinator] = await pool.execute(
      'SELECT id_nguoi_phu_trach FROM nguoi_phu_trach_benh_vien WHERE id_nguoi_phu_trach = ?',
      [userId]
    );

    if (coordinator.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy thông tin người phụ trách.'
      });
    }

    const coordinatorId = coordinator[0].id_nguoi_phu_trach;

    // Update blood type with confirmation
    await pool.execute(
      `UPDATE nguoi_hien_mau 
       SET nhom_mau = ?,
           nhom_mau_xac_nhan = TRUE,
           ngay_xac_nhan = CURDATE(),
           id_nguoi_phu_trach_benh_vien = ?,
           ghi_chu_xac_nhan = ?
       WHERE id_nguoi_hien = ?`,
      [nhom_mau, coordinatorId, ghi_chu || 'Xác thực nhóm máu qua xét nghiệm', id_nguoi_hien]
    );

    // Get updated donor info
    const [donor] = await pool.execute(
      `SELECT nh.*, nd.ho_ten, bv.ten_benh_vien
       FROM nguoi_hien_mau nh
       JOIN nguoidung nd ON nh.id_nguoi_hien = nd.id_nguoi_dung
       LEFT JOIN nguoi_phu_trach_benh_vien nptbv ON nh.id_nguoi_phu_trach_benh_vien = nptbv.id_nguoi_phu_trach
       LEFT JOIN benh_vien bv ON nptbv.id_benh_vien = bv.id_benh_vien
       WHERE nh.id_nguoi_hien = ?`,
      [id_nguoi_hien]
    );

    res.json({
      success: true,
      message: 'Xác thực nhóm máu thành công.',
      data: { donor: donor[0] }
    });
  } catch (error) {
    next(error);
  }
};

// Update event status (approve/reject)
export const updateEventStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { trang_thai } = req.body;
    const userId = req.user.id_nguoi_dung;

    // Get coordinator ID
    const [coordinator] = await pool.execute(
      'SELECT id_nguoi_phu_trach FROM nguoi_phu_trach_benh_vien WHERE id_nguoi_phu_trach = ?',
      [userId]
    );

    if (coordinator.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy thông tin người phụ trách.'
      });
    }

    const coordinatorId = coordinator[0].id_nguoi_phu_trach;

    await pool.execute(
      'UPDATE sukien_hien_mau SET trang_thai = ?, id_phe_duyet_boi = ? WHERE id_su_kien = ?',
      [trang_thai, coordinatorId, id]
    );

    res.json({
      success: true,
      message: 'Cập nhật trạng thái sự kiện thành công.'
    });
  } catch (error) {
    next(error);
  }
};

// Get approved registrations for an event
export const getApprovedRegistrations = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id_nguoi_dung;

    // Get hospital ID
    const [hospital] = await pool.execute(
      'SELECT id_benh_vien FROM nguoi_phu_trach_benh_vien WHERE id_nguoi_phu_trach = ?',
      [userId]
    );

    if (hospital.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy thông tin bệnh viện.'
      });
    }

    const hospitalId = hospital[0].id_benh_vien;

    // Get approved registrations
    const [registrations] = await pool.execute(
      `SELECT 
        dk.id_dang_ky,
        dk.ngay_dang_ky,
        nd.ho_ten,
        nd.email,
        nd.so_dien_thoai,
        nh.nhom_mau,
        nh.nhom_mau_xac_nhan
      FROM dang_ky_hien_mau dk
      JOIN nguoi_hien_mau nh ON dk.id_nguoi_hien = nh.id_nguoi_hien
      JOIN nguoidung nd ON nh.id_nguoi_hien = nd.id_nguoi_dung
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

// Create donation result
export const createResult = async (req, res, next) => {
  try {
    const { id_nguoi_hien, id_su_kien, ngay_hien, luong_ml, ket_qua } = req.body;
    const userId = req.user.id_nguoi_dung;

    // Get hospital ID
    const [hospital] = await pool.execute(
      'SELECT id_benh_vien FROM nguoi_phu_trach_benh_vien WHERE id_nguoi_phu_trach = ?',
      [userId]
    );

    if (hospital.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy thông tin bệnh viện.'
      });
    }

    const hospitalId = hospital[0].id_benh_vien;

    // Insert result
    await pool.execute(
      `INSERT INTO ket_qua_hien_mau (id_nguoi_hien, id_su_kien, id_benh_vien, ngay_hien, luong_ml, ket_qua)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [id_nguoi_hien, id_su_kien, hospitalId, ngay_hien, luong_ml, ket_qua]
    );

    // Update donor stats
    await pool.execute(
      `UPDATE nguoi_hien_mau 
       SET tong_so_lan_hien = tong_so_lan_hien + 1,
           lan_hien_gan_nhat = ?
       WHERE id_nguoi_hien = ?`,
      [ngay_hien, id_nguoi_hien]
    );

    res.json({
      success: true,
      message: 'Tạo kết quả hiến máu thành công.'
    });
  } catch (error) {
    next(error);
  }
};

// Create notification
export const createNotification = async (req, res, next) => {
  try {
    const { id_nhom, tieu_de, noi_dung } = req.body;
    const userId = req.user.id_nguoi_dung;

    // Get hospital ID
    const [hospital] = await pool.execute(
      'SELECT id_benh_vien FROM nguoi_phu_trach_benh_vien WHERE id_nguoi_phu_trach = ?',
      [userId]
    );

    if (hospital.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy thông tin bệnh viện.'
      });
    }

    const hospitalId = hospital[0].id_benh_vien;

    // Insert notification
    await pool.execute(
      `INSERT INTO thong_bao (id_benh_vien, id_nhom, tieu_de, noi_dung) 
       VALUES (?, ?, ?, ?)`,
      [hospitalId, id_nhom, tieu_de, noi_dung]
    );

    res.json({
      success: true,
      message: 'Tạo thông báo thành công.'
    });
  } catch (error) {
    next(error);
  }
};

// Get list of donors with unconfirmed blood type
export const getUnconfirmedBloodTypes = async (req, res, next) => {
  try {
    const userId = req.user.id_nguoi_dung;

    console.log('🔍 Getting unconfirmed blood types for user:', userId);

    // Get hospital ID
    const [hospital] = await pool.execute(
      'SELECT id_benh_vien FROM nguoi_phu_trach_benh_vien WHERE id_nguoi_phu_trach = ?',
      [userId]
    );

    if (hospital.length === 0) {
      console.log('❌ Hospital not found for user:', userId);
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy thông tin bệnh viện.'
      });
    }

    const hospitalId = hospital[0].id_benh_vien;
    console.log('🏥 Hospital ID:', hospitalId);

    // Get donors who have participated in hospital's approved events but blood type not confirmed
    const [donors] = await pool.execute(
      `SELECT DISTINCT
        nh.id_nguoi_hien,
        nh.nhom_mau,
        nh.tong_so_lan_hien,
        nd.ho_ten,
        nd.email,
        nd.so_dien_thoai,
        nh.lan_hien_gan_nhat as ngay_hien_gan_nhat
      FROM nguoi_hien_mau nh
      JOIN nguoidung nd ON nh.id_nguoi_hien = nd.id_nguoi_dung
      JOIN dang_ky_hien_mau dk ON nh.id_nguoi_hien = dk.id_nguoi_hien
      JOIN sukien_hien_mau sk ON dk.id_su_kien = sk.id_su_kien
      WHERE nh.nhom_mau_xac_nhan = FALSE 
        AND nh.nhom_mau IS NOT NULL
        AND sk.id_benh_vien = ?
        AND dk.trang_thai = 'da_duyet'
      GROUP BY nh.id_nguoi_hien, nh.nhom_mau, nh.tong_so_lan_hien, nd.ho_ten, nd.email, nd.so_dien_thoai, nh.lan_hien_gan_nhat
      ORDER BY nh.lan_hien_gan_nhat DESC`,
      [hospitalId]
    );

    console.log('👥 Found', donors.length, 'donors with unconfirmed blood type');
    console.log('📋 Donors:', JSON.stringify(donors, null, 2));

    res.json({
      success: true,
      data: { donors }
    });
  } catch (error) {
    next(error);
  }
};

// Get hospital stats for dashboard
export const getStats = async (req, res, next) => {
  try {
    const userId = req.user.id_nguoi_dung;

    // Get hospital ID
    const [hospital] = await pool.execute(
      'SELECT id_benh_vien FROM nguoi_phu_trach_benh_vien WHERE id_nguoi_phu_trach = ?',
      [userId]
    );

    if (hospital.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy thông tin bệnh viện.'
      });
    }

    const hospitalId = hospital[0].id_benh_vien;

    // Get pending events count
    const [pendingEvents] = await pool.execute(
      `SELECT COUNT(*) as count 
       FROM sukien_hien_mau 
       WHERE id_benh_vien = ? AND trang_thai = 'cho_duyet'`,
      [hospitalId]
    );

    // Get total donors (from approved registrations)
    const [totalDonors] = await pool.execute(
      `SELECT COUNT(DISTINCT dk.id_nguoi_hien) as count
       FROM dang_ky_hien_mau dk
       JOIN sukien_hien_mau sk ON dk.id_su_kien = sk.id_su_kien
       WHERE sk.id_benh_vien = ? AND dk.trang_thai = 'da_duyet'`,
      [hospitalId]
    );

    // Get total blood collected
    const [bloodCollected] = await pool.execute(
      `SELECT COALESCE(SUM(kq.luong_ml), 0) as total
       FROM ket_qua_hien_mau kq
       JOIN sukien_hien_mau sk ON kq.id_su_kien = sk.id_su_kien
       WHERE sk.id_benh_vien = ?`,
      [hospitalId]
    );

    // Get notifications sent count
    const [notificationsSent] = await pool.execute(
      `SELECT COUNT(*) as count
       FROM thong_bao
       WHERE id_benh_vien = ?`,
      [hospitalId]
    );

    res.json({
      success: true,
      data: {
        pendingEvents: pendingEvents[0].count,
        totalDonors: totalDonors[0].count,
        bloodCollected: bloodCollected[0].total,
        notificationsSent: notificationsSent[0].count
      }
    });
  } catch (error) {
    next(error);
  }
};
