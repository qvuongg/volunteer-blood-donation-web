import pool from '../config/database.js';
import bcrypt from 'bcrypt';

// Get all users
export const getUsers = async (req, res, next) => {
  try {
    const [users] = await pool.execute(
      `SELECT 
        nd.id_nguoi_dung,
        nd.ho_ten,
        nd.email,
        nd.so_dien_thoai,
        nd.gioi_tinh,
        nd.ngay_sinh,
        nd.trang_thai,
        nd.ngay_tao,
        vt.ten_vai_tro
      FROM nguoidung nd
      JOIN vaitro vt ON nd.id_vai_tro = vt.id_vai_tro
      ORDER BY nd.ngay_tao DESC`
    );

    res.json({
      success: true,
      data: { users }
    });
  } catch (error) {
    next(error);
  }
};

// Update user
export const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { ho_ten, email, so_dien_thoai, gioi_tinh, ngay_sinh, id_vai_tro } = req.body;

    const updateFields = [];
    const updateValues = [];

    if (ho_ten) {
      updateFields.push('ho_ten = ?');
      updateValues.push(ho_ten);
    }
    if (email) {
      updateFields.push('email = ?');
      updateValues.push(email);
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
    if (id_vai_tro) {
      updateFields.push('id_vai_tro = ?');
      updateValues.push(id_vai_tro);
    }

    if (updateFields.length > 0) {
      updateValues.push(id);
      await pool.execute(
        `UPDATE nguoidung SET ${updateFields.join(', ')} WHERE id_nguoi_dung = ?`,
        updateValues
      );
    }

    res.json({
      success: true,
      message: 'Cập nhật người dùng thành công.'
    });
  } catch (error) {
    next(error);
  }
};

// Update user status
export const updateUserStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { trang_thai } = req.body;

    await pool.execute(
      'UPDATE nguoidung SET trang_thai = ? WHERE id_nguoi_dung = ?',
      [trang_thai, id]
    );

    res.json({
      success: true,
      message: 'Cập nhật trạng thái thành công.'
    });
  } catch (error) {
    next(error);
  }
};

// Delete user
export const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    await pool.execute('DELETE FROM nguoidung WHERE id_nguoi_dung = ?', [id]);
    res.json({
      success: true,
      message: 'Xóa người dùng thành công.'
    });
  } catch (error) {
    next(error);
  }
};

// Get stats
export const getStats = async (req, res, next) => {
  try {
    const [userCount] = await pool.execute('SELECT COUNT(*) as count FROM nguoidung');
    const [donorCount] = await pool.execute('SELECT COUNT(*) as count FROM nguoi_hien_mau');
    const [eventCount] = await pool.execute('SELECT COUNT(*) as count FROM sukien_hien_mau');
    const [registrationCount] = await pool.execute('SELECT COUNT(*) as count FROM dang_ky_hien_mau');

    res.json({
      success: true,
      data: {
        totalUsers: userCount[0].count,
        totalDonors: donorCount[0].count,
        totalEvents: eventCount[0].count,
        totalRegistrations: registrationCount[0].count
      }
    });
  } catch (error) {
    next(error);
  }
};

