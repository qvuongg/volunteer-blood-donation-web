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
        nh.id_nguoi_hien,
        nd.ho_ten,
        nd.email,
        nd.so_dien_thoai,
        nh.nhom_mau,
        nh.nhom_mau_xac_nhan,
        CASE 
          WHEN kq.id_ket_qua IS NOT NULL THEN TRUE
          ELSE FALSE
        END as da_co_ket_qua
      FROM dang_ky_hien_mau dk
      JOIN nguoi_hien_mau nh ON dk.id_nguoi_hien = nh.id_nguoi_hien
      JOIN nguoidung nd ON nh.id_nguoi_hien = nd.id_nguoi_dung
      JOIN sukien_hien_mau sk ON dk.id_su_kien = sk.id_su_kien
      LEFT JOIN ket_qua_hien_mau kq ON kq.id_nguoi_hien = nh.id_nguoi_hien AND kq.id_su_kien = dk.id_su_kien
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

    // Validate required fields
    if (!id_nguoi_hien || !id_su_kien || !ngay_hien || !luong_ml || !ket_qua) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp đầy đủ thông tin.'
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

    // Validate event belongs to hospital and is approved
    const [event] = await pool.execute(
      `SELECT ngay_bat_dau, ngay_ket_thuc, trang_thai 
       FROM sukien_hien_mau 
       WHERE id_su_kien = ? AND id_benh_vien = ?`,
      [id_su_kien, hospitalId]
    );

    if (event.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy sự kiện hoặc sự kiện không thuộc bệnh viện của bạn.'
      });
    }

    if (event[0].trang_thai !== 'da_duyet') {
      return res.status(400).json({
        success: false,
        message: 'Không thể cập nhật kết quả cho sự kiện chưa được duyệt.'
      });
    }

    // Validate donation date is not before event start date
    const eventStart = new Date(event[0].ngay_bat_dau);
    const donationDate = new Date(ngay_hien);
    
    if (donationDate < eventStart) {
      return res.status(400).json({
        success: false,
        message: 'Ngày hiến không thể trước ngày bắt đầu sự kiện.'
      });
    }

    // Check if result already exists
    const [existingResult] = await pool.execute(
      `SELECT id_ket_qua FROM ket_qua_hien_mau 
       WHERE id_nguoi_hien = ? AND id_su_kien = ?`,
      [id_nguoi_hien, id_su_kien]
    );

    if (existingResult.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Kết quả hiến máu cho người này đã tồn tại trong sự kiện này.'
      });
    }

    // Insert result
    await pool.execute(
      `INSERT INTO ket_qua_hien_mau (id_nguoi_hien, id_su_kien, id_benh_vien, ngay_hien, luong_ml, ket_qua)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [id_nguoi_hien, id_su_kien, hospitalId, ngay_hien, luong_ml, ket_qua]
    );

    // Update donor stats only if result is "Dat"
    if (ket_qua === 'Dat') {
      await pool.execute(
        `UPDATE nguoi_hien_mau 
         SET tong_so_lan_hien = tong_so_lan_hien + 1,
             lan_hien_gan_nhat = ?
         WHERE id_nguoi_hien = ?`,
        [ngay_hien, id_nguoi_hien]
      );
    }

    res.json({
      success: true,
      message: 'Tạo kết quả hiến máu thành công.'
    });
  } catch (error) {
    next(error);
  }
};

// Bulk create donation results
export const createBulkResults = async (req, res, next) => {
  try {
    const { id_su_kien, ngay_hien, results } = req.body;
    const userId = req.user.id_nguoi_dung;

    // Validate required fields
    if (!id_su_kien || !ngay_hien || !results || !Array.isArray(results) || results.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp đầy đủ thông tin.'
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

    // Validate event
    const [event] = await pool.execute(
      `SELECT ngay_bat_dau, ngay_ket_thuc, trang_thai 
       FROM sukien_hien_mau 
       WHERE id_su_kien = ? AND id_benh_vien = ?`,
      [id_su_kien, hospitalId]
    );

    if (event.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy sự kiện hoặc sự kiện không thuộc bệnh viện của bạn.'
      });
    }

    if (event[0].trang_thai !== 'da_duyet') {
      return res.status(400).json({
        success: false,
        message: 'Không thể cập nhật kết quả cho sự kiện chưa được duyệt.'
      });
    }

    // Validate donation date
    const eventStart = new Date(event[0].ngay_bat_dau);
    const donationDate = new Date(ngay_hien);
    
    if (donationDate < eventStart) {
      return res.status(400).json({
        success: false,
        message: 'Ngày hiến không thể trước ngày bắt đầu sự kiện.'
      });
    }

    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      let successCount = 0;
      let skipCount = 0;
      const errors = [];

      for (const result of results) {
        const { id_nguoi_hien, luong_ml, ket_qua } = result;

        // Validate each result
        if (!id_nguoi_hien || !luong_ml || !ket_qua) {
          errors.push(`Người hiến ${id_nguoi_hien}: Thiếu thông tin`);
          skipCount++;
          continue;
        }

        // Check if result already exists
        const [existing] = await connection.execute(
          `SELECT id_ket_qua FROM ket_qua_hien_mau 
           WHERE id_nguoi_hien = ? AND id_su_kien = ?`,
          [id_nguoi_hien, id_su_kien]
        );

        if (existing.length > 0) {
          errors.push(`Người hiến ${id_nguoi_hien}: Đã có kết quả`);
          skipCount++;
          continue;
        }

        // Insert result
        await connection.execute(
          `INSERT INTO ket_qua_hien_mau (id_nguoi_hien, id_su_kien, id_benh_vien, ngay_hien, luong_ml, ket_qua)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [id_nguoi_hien, id_su_kien, hospitalId, ngay_hien, luong_ml, ket_qua]
        );

        // Update donor stats only if result is "Dat"
        if (ket_qua === 'Dat') {
          await connection.execute(
            `UPDATE nguoi_hien_mau 
             SET tong_so_lan_hien = tong_so_lan_hien + 1,
                 lan_hien_gan_nhat = ?
             WHERE id_nguoi_hien = ?`,
            [ngay_hien, id_nguoi_hien]
          );
        }

        successCount++;
      }

      await connection.commit();

      res.json({
        success: true,
        message: `Cập nhật thành công ${successCount} kết quả${skipCount > 0 ? `, bỏ qua ${skipCount}` : ''}.`,
        data: {
          successCount,
          skipCount,
          errors: errors.length > 0 ? errors : undefined
        }
      });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
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

// Update hospital coordinator profile
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

    // Update coordinator info
    const updateCoordinatorFields = [];
    const updateCoordinatorValues = [];

    if (chuc_vu !== undefined) {
      updateCoordinatorFields.push('chuc_vu = ?');
      updateCoordinatorValues.push(chuc_vu || null);
    }
    if (nguoi_lien_he !== undefined) {
      updateCoordinatorFields.push('nguoi_lien_he = ?');
      updateCoordinatorValues.push(nguoi_lien_he || null);
    }

    if (updateCoordinatorFields.length > 0) {
      updateCoordinatorValues.push(userId);
      await pool.execute(
        `UPDATE nguoi_phu_trach_benh_vien SET ${updateCoordinatorFields.join(', ')} WHERE id_nguoi_phu_trach = ?`,
        updateCoordinatorValues
      );
    }

    // Get updated profile
    const [users] = await pool.execute(
      `SELECT id_nguoi_dung, ho_ten, email, so_dien_thoai, gioi_tinh, ngay_sinh, id_vai_tro, trang_thai 
       FROM nguoidung WHERE id_nguoi_dung = ?`,
      [userId]
    );

    const [coordinator] = await pool.execute(
      `SELECT nptbv.*, bv.ten_benh_vien, bv.dia_chi
       FROM nguoi_phu_trach_benh_vien nptbv
       JOIN benh_vien bv ON nptbv.id_benh_vien = bv.id_benh_vien
       WHERE nptbv.id_nguoi_phu_trach = ?`,
      [userId]
    );

    res.json({
      success: true,
      message: 'Cập nhật thông tin thành công.',
      data: {
        user: users[0],
        coordinator: coordinator[0] || null,
        hospital: coordinator[0] ? {
          id_benh_vien: coordinator[0].id_benh_vien,
          ten_benh_vien: coordinator[0].ten_benh_vien,
          dia_chi: coordinator[0].dia_chi
        } : null
      }
    });
  } catch (error) {
    next(error);
  }
};
