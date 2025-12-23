import pool from '../config/database.js';

// Get volunteer group id
const getVolunteerGroupId = async (userId) => {
  const [groups] = await pool.execute(
    'SELECT id_nhom FROM nhom_tinh_nguyen WHERE id_nguoi_dung = ?',
    [userId]
  );
  return groups.length > 0 ? groups[0].id_nhom : null;
};

// Get notifications
export const getNotifications = async (req, res, next) => {
  try {
    const userId = req.user.id_nguoi_dung;

    const [notifications] = await pool.execute(
      `SELECT 
        id_thong_bao,
        loai_thong_bao,
        tieu_de,
        noi_dung,
        link_lien_ket,
        da_doc,
        ngay_tao
      FROM thong_bao
      WHERE id_nguoi_nhan = ? AND loai_thong_bao = 'benh_vien_notification'
      ORDER BY ngay_tao DESC`,
      [userId]
    );

    res.json({
      success: true,
      data: { notifications }
    });
  } catch (error) {
    next(error);
  }
};

// Mark notification as read
export const markAsRead = async (req, res, next) => {
  try {
    const userId = req.user.id_nguoi_dung;
    const { id } = req.params;

    await pool.execute(
      'UPDATE thong_bao SET da_doc = TRUE WHERE id_thong_bao = ? AND id_nguoi_nhan = ?',
      [id, userId]
    );

    res.json({
      success: true,
      message: 'Đã đánh dấu đã đọc.'
    });
  } catch (error) {
    next(error);
  }
};

// Get volunteer profile
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

    // Get volunteer group info
    const [groups] = await pool.execute(
      `SELECT id_nhom, ten_nhom, dia_chi, nguoi_lien_he
       FROM nhom_tinh_nguyen WHERE id_nguoi_dung = ?`,
      [userId]
    );

    res.json({
      success: true,
      data: {
        user: users[0],
        group: groups[0] || null
      }
    });
  } catch (error) {
    next(error);
  }
};

// Update volunteer profile
export const updateProfile = async (req, res, next) => {
  try {
    const userId = req.user.id_nguoi_dung;
    const { ho_ten, so_dien_thoai, ten_nhom, dia_chi, nguoi_lien_he } = req.body;

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

    // Update volunteer group info
    const updateGroupFields = [];
    const updateGroupValues = [];

    if (ten_nhom !== undefined) {
      updateGroupFields.push('ten_nhom = ?');
      updateGroupValues.push(ten_nhom);
    }
    if (dia_chi !== undefined) {
      updateGroupFields.push('dia_chi = ?');
      updateGroupValues.push(dia_chi || null);
    }
    if (nguoi_lien_he !== undefined) {
      updateGroupFields.push('nguoi_lien_he = ?');
      updateGroupValues.push(nguoi_lien_he || null);
    }

    if (updateGroupFields.length > 0) {
      updateGroupValues.push(userId);
      await pool.execute(
        `UPDATE nhom_tinh_nguyen SET ${updateGroupFields.join(', ')} WHERE id_nguoi_dung = ?`,
        updateGroupValues
      );
    }

    // Get updated profile
    const [users] = await pool.execute(
      `SELECT id_nguoi_dung, ho_ten, email, so_dien_thoai, gioi_tinh, ngay_sinh, id_vai_tro, trang_thai 
       FROM nguoidung WHERE id_nguoi_dung = ?`,
      [userId]
    );

    const [groups] = await pool.execute(
      `SELECT id_nhom, ten_nhom, dia_chi, nguoi_lien_he
       FROM nhom_tinh_nguyen WHERE id_nguoi_dung = ?`,
      [userId]
    );

    res.json({
      success: true,
      message: 'Cập nhật thông tin thành công.',
      data: {
        user: users[0],
        group: groups[0] || null
      }
    });
  } catch (error) {
    next(error);
  }
};

