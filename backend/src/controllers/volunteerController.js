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
    const groupId = await getVolunteerGroupId(userId);

    if (!groupId) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy nhóm tình nguyện.'
      });
    }

    const [notifications] = await pool.execute(
      `SELECT 
        tb.id_thong_bao,
        tb.tieu_de,
        tb.noi_dung,
        tb.ngay_tao,
        tb.da_doc,
        bv.ten_benh_vien
      FROM thong_bao tb
      JOIN benh_vien bv ON tb.id_benh_vien = bv.id_benh_vien
      WHERE tb.id_nhom = ?
      ORDER BY tb.ngay_tao DESC`,
      [groupId]
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
    const groupId = await getVolunteerGroupId(userId);

    if (!groupId) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy nhóm tình nguyện.'
      });
    }

    await pool.execute(
      'UPDATE thong_bao SET da_doc = TRUE WHERE id_thong_bao = ? AND id_nhom = ?',
      [id, groupId]
    );

    res.json({
      success: true,
      message: 'Đã đánh dấu đã đọc.'
    });
  } catch (error) {
    next(error);
  }
};

