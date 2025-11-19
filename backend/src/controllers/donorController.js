import pool from '../config/database.js';

// Get donor profile
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
        message: 'User not found'
      });
    }

    // Get donor info
    const [donors] = await pool.execute(
      `SELECT id_nguoi_hien, nhom_mau, lan_hien_gan_nhat, tong_so_lan_hien 
       FROM nguoi_hien_mau WHERE id_nguoi_dung = ?`,
      [userId]
    );

    const user = users[0];
    const donor = donors[0] || null;

    res.json({
      success: true,
      data: {
        user,
        donor
      }
    });
  } catch (error) {
    next(error);
  }
};

// Update profile
export const updateProfile = async (req, res, next) => {
  try {
    const userId = req.user.id_nguoi_dung;
    const { ho_ten, so_dien_thoai, gioi_tinh, ngay_sinh } = req.body;

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

    // Update user
    const updateFields = [];
    const updateValues = [];

    if (ho_ten) {
      updateFields.push('ho_ten = ?');
      updateValues.push(ho_ten);
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

    if (updateFields.length > 0) {
      updateValues.push(userId);
      await pool.execute(
        `UPDATE nguoidung SET ${updateFields.join(', ')} WHERE id_nguoi_dung = ?`,
        updateValues
      );
    }

    // Get updated user
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

// Get/Update blood info
export const getBloodInfo = async (req, res, next) => {
  try {
    const userId = req.user.id_nguoi_dung;

    const [donors] = await pool.execute(
      `SELECT id_nguoi_hien, nhom_mau, lan_hien_gan_nhat, tong_so_lan_hien 
       FROM nguoi_hien_mau WHERE id_nguoi_dung = ?`,
      [userId]
    );

    if (donors.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Donor record not found'
      });
    }

    res.json({
      success: true,
      data: {
        donor: donors[0]
      }
    });
  } catch (error) {
    next(error);
  }
};

export const updateBloodInfo = async (req, res, next) => {
  try {
    const userId = req.user.id_nguoi_dung;
    const { nhom_mau } = req.body;

    if (!nhom_mau) {
      return res.status(400).json({
        success: false,
        message: 'Nhóm máu là bắt buộc.'
      });
    }

    // Check if donor record exists
    const [donors] = await pool.execute(
      'SELECT id_nguoi_hien FROM nguoi_hien_mau WHERE id_nguoi_dung = ?',
      [userId]
    );

    if (donors.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Donor record not found'
      });
    }

    // Update blood type
    await pool.execute(
      'UPDATE nguoi_hien_mau SET nhom_mau = ? WHERE id_nguoi_dung = ?',
      [nhom_mau, userId]
    );

    // Get updated donor
    const [updatedDonors] = await pool.execute(
      `SELECT id_nguoi_hien, nhom_mau, lan_hien_gan_nhat, tong_so_lan_hien 
       FROM nguoi_hien_mau WHERE id_nguoi_dung = ?`,
      [userId]
    );

    res.json({
      success: true,
      message: 'Cập nhật nhóm máu thành công.',
      data: {
        donor: updatedDonors[0]
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get donation history
export const getHistory = async (req, res, next) => {
  try {
    const userId = req.user.id_nguoi_dung;

    // Get donor id
    const [donors] = await pool.execute(
      'SELECT id_nguoi_hien FROM nguoi_hien_mau WHERE id_nguoi_dung = ?',
      [userId]
    );

    if (donors.length === 0) {
      return res.json({
        success: true,
        data: {
          history: []
        }
      });
    }

    const donorId = donors[0].id_nguoi_hien;

    // Get donation history
    const [history] = await pool.execute(
      `SELECT 
        kq.id_ket_qua,
        kq.ngay_hien,
        kq.luong_ml,
        kq.ket_qua,
        kq.ngay_tao,
        sk.ten_su_kien,
        bv.ten_benh_vien
       FROM ket_qua_hien_mau kq
       JOIN sukien_hien_mau sk ON kq.id_su_kien = sk.id_su_kien
       JOIN benh_vien bv ON kq.id_benh_vien = bv.id_benh_vien
       WHERE kq.id_nguoi_hien = ?
       ORDER BY kq.ngay_hien DESC`,
      [donorId]
    );

    res.json({
      success: true,
      data: {
        history
      }
    });
  } catch (error) {
    next(error);
  }
};

