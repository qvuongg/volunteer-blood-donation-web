import pool from '../config/database.js';
import bcrypt from 'bcrypt';

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

    // Get donor info with blood type confirmation status
    const [donors] = await pool.execute(
      `SELECT nh.id_nguoi_hien, nh.nhom_mau, nh.lan_hien_gan_nhat, nh.tong_so_lan_hien,
              nh.nhom_mau_xac_nhan, nh.ngay_xac_nhan, nh.id_nguoi_phu_trach_benh_vien, nh.ghi_chu_xac_nhan,
              bv.ten_benh_vien as ten_benh_vien_xac_nhan
       FROM nguoi_hien_mau nh
       LEFT JOIN nguoi_phu_trach_benh_vien nptbv ON nh.id_nguoi_phu_trach_benh_vien = nptbv.id_nguoi_phu_trach
       LEFT JOIN benh_vien bv ON nptbv.id_benh_vien = bv.id_benh_vien
       WHERE nh.id_nguoi_hien = ?`,
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
    const { ho_ten, so_dien_thoai, gioi_tinh, ngay_sinh, nhom_mau, cccd } = req.body;

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

    // Check if CCCD is already used by another user
    if (cccd) {
      const [existingCCCD] = await pool.execute(
        'SELECT id_nguoi_dung FROM nguoidung WHERE cccd = ? AND id_nguoi_dung != ?',
        [cccd, userId]
      );

      if (existingCCCD.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Số CCCD/CMND đã được sử dụng.'
        });
      }
    }

    // Update user info
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
    if (cccd !== undefined) {
      updateFields.push('cccd = ?');
      updateValues.push(cccd || null);
    }

    if (updateFields.length > 0) {
      updateValues.push(userId);
      await pool.execute(
        `UPDATE nguoidung SET ${updateFields.join(', ')} WHERE id_nguoi_dung = ?`,
        updateValues
      );
    }

    // Update blood type if provided
    if (nhom_mau) {
      const validBloodTypes = ['A', 'B', 'AB', 'O'];
      if (validBloodTypes.includes(nhom_mau)) {
        // Check if verified
        const [donors] = await pool.execute(
          'SELECT nhom_mau_xac_nhan FROM nguoi_hien_mau WHERE id_nguoi_hien = ?',
          [userId]
        );

        // Only update if not verified
        if (donors.length > 0 && !donors[0].nhom_mau_xac_nhan) {
          await pool.execute(
            'UPDATE nguoi_hien_mau SET nhom_mau = ? WHERE id_nguoi_hien = ?',
            [nhom_mau, userId]
          );
        }
      }
    }

    // Get updated user and donor info
    const [users] = await pool.execute(
      `SELECT id_nguoi_dung, ho_ten, email, so_dien_thoai, gioi_tinh, ngay_sinh, id_vai_tro, trang_thai, cccd 
       FROM nguoidung WHERE id_nguoi_dung = ?`,
      [userId]
    );

    // Fetch updated donor info as well to return consistent data
    const [donors] = await pool.execute(
      `SELECT nh.id_nguoi_hien, nh.nhom_mau, nh.lan_hien_gan_nhat, nh.tong_so_lan_hien,
              nh.nhom_mau_xac_nhan, nh.ngay_xac_nhan, nh.id_nguoi_phu_trach_benh_vien, nh.ghi_chu_xac_nhan,
              bv.ten_benh_vien as ten_benh_vien_xac_nhan
       FROM nguoi_hien_mau nh
       LEFT JOIN nguoi_phu_trach_benh_vien nptbv ON nh.id_nguoi_phu_trach_benh_vien = nptbv.id_nguoi_phu_trach
       LEFT JOIN benh_vien bv ON nptbv.id_benh_vien = bv.id_benh_vien
       WHERE nh.id_nguoi_hien = ?`,
      [userId]
    );

    res.json({
      success: true,
      message: 'Cập nhật thông tin thành công.',
      data: {
        user: users[0],
        donor: donors[0]
      }
    });
  } catch (error) {
    next(error);
  }
};

// Change password
export const changePassword = async (req, res, next) => {
  try {
    const userId = req.user.id_nguoi_dung;
    const { mat_khau_cu, mat_khau_moi } = req.body;

    if (!mat_khau_cu || !mat_khau_moi) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng nhập đầy đủ thông tin.'
      });
    }

    if (mat_khau_moi.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Mật khẩu mới phải có ít nhất 6 ký tự.'
      });
    }

    // Get current password
    const [users] = await pool.execute(
      'SELECT mat_khau FROM nguoidung WHERE id_nguoi_dung = ?',
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Người dùng không tồn tại.'
      });
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(mat_khau_cu, users[0].mat_khau);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Mật khẩu hiện tại không đúng.'
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(mat_khau_moi, 10);

    // Update password
    await pool.execute(
      'UPDATE nguoidung SET mat_khau = ? WHERE id_nguoi_dung = ?',
      [hashedPassword, userId]
    );

    res.json({
      success: true,
      message: 'Đổi mật khẩu thành công.'
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
      `SELECT nh.id_nguoi_hien, nh.nhom_mau, nh.lan_hien_gan_nhat, nh.tong_so_lan_hien,
              nh.nhom_mau_xac_nhan, nh.ngay_xac_nhan, nh.id_nguoi_phu_trach_benh_vien, nh.ghi_chu_xac_nhan,
              bv.ten_benh_vien as ten_benh_vien_xac_nhan
       FROM nguoi_hien_mau nh
       LEFT JOIN nguoi_phu_trach_benh_vien nptbv ON nh.id_nguoi_phu_trach_benh_vien = nptbv.id_nguoi_phu_trach
       LEFT JOIN benh_vien bv ON nptbv.id_benh_vien = bv.id_benh_vien
       WHERE nh.id_nguoi_hien = ?`,
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

    // Validate blood type
    const validBloodTypes = ['A', 'B', 'AB', 'O'];
    if (!validBloodTypes.includes(nhom_mau)) {
      return res.status(400).json({
        success: false,
        message: 'Nhóm máu không hợp lệ.'
      });
    }

    // Check if donor record exists
    const [donors] = await pool.execute(
      'SELECT id_nguoi_hien, nhom_mau_xac_nhan FROM nguoi_hien_mau WHERE id_nguoi_hien = ?',
      [userId]
    );

    if (donors.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Donor record not found'
      });
    }

    // If blood type is already confirmed, don't allow changes
    if (donors[0].nhom_mau_xac_nhan) {
      return res.status(400).json({
        success: false,
        message: 'Nhóm máu đã được xác thực bởi bệnh viện, không thể thay đổi.'
      });
    }

    // Update blood type (only self-declared, not confirmed)
    await pool.execute(
      'UPDATE nguoi_hien_mau SET nhom_mau = ? WHERE id_nguoi_hien = ?',
      [nhom_mau, userId]
    );

    // Get updated donor
    const [updatedDonors] = await pool.execute(
      `SELECT nh.id_nguoi_hien, nh.nhom_mau, nh.lan_hien_gan_nhat, nh.tong_so_lan_hien,
              nh.nhom_mau_xac_nhan, nh.ngay_xac_nhan, nh.id_nguoi_phu_trach_benh_vien, nh.ghi_chu_xac_nhan,
              bv.ten_benh_vien as ten_benh_vien_xac_nhan
       FROM nguoi_hien_mau nh
       LEFT JOIN nguoi_phu_trach_benh_vien nptbv ON nh.id_nguoi_phu_trach_benh_vien = nptbv.id_nguoi_phu_trach
       LEFT JOIN benh_vien bv ON nptbv.id_benh_vien = bv.id_benh_vien
       WHERE nh.id_nguoi_hien = ?`,
      [userId]
    );

    res.json({
      success: true,
      message: 'Cập nhật nhóm máu thành công. Nhóm máu sẽ được xác thực chính thức khi bạn hiến máu.',
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
      'SELECT id_nguoi_hien FROM nguoi_hien_mau WHERE id_nguoi_hien = ?',
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
