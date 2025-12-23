import pool from '../config/database.js';
import { sendNotificationToUser } from '../config/socket.js';

// Get notifications for current user
export const getNotifications = async (req, res, next) => {
  try {
    const userId = req.user.id_nguoi_dung;
    const limit = parseInt(req.query.limit) || 20;
    const offset = parseInt(req.query.offset) || 0;

    // Get notifications with proper integer parameters
    const [notifications] = await pool.query(
      `SELECT 
        id_thong_bao,
        loai_thong_bao,
        tieu_de,
        noi_dung,
        link_lien_ket,
        da_doc,
        ngay_tao
      FROM thong_bao
      WHERE id_nguoi_nhan = ?
      ORDER BY ngay_tao DESC
      LIMIT ${limit} OFFSET ${offset}`,
      [userId]
    );

    // Get unread count
    const [unreadCount] = await pool.execute(
      `SELECT COUNT(*) as count
       FROM thong_bao
       WHERE id_nguoi_nhan = ? AND da_doc = FALSE`,
      [userId]
    );

    res.json({
      success: true,
      data: {
        notifications,
        unreadCount: unreadCount[0].count
      }
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

    // Update notification
    await pool.execute(
      `UPDATE thong_bao
       SET da_doc = TRUE
       WHERE id_thong_bao = ? AND id_nguoi_nhan = ?`,
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

// Mark all notifications as read
export const markAllAsRead = async (req, res, next) => {
  try {
    const userId = req.user.id_nguoi_dung;

    await pool.execute(
      `UPDATE thong_bao
       SET da_doc = TRUE
       WHERE id_nguoi_nhan = ? AND da_doc = FALSE`,
      [userId]
    );

    res.json({
      success: true,
      message: 'Đã đánh dấu tất cả đã đọc.'
    });
  } catch (error) {
    next(error);
  }
};

// Delete notification
export const deleteNotification = async (req, res, next) => {
  try {
    const userId = req.user.id_nguoi_dung;
    const { id } = req.params;

    await pool.execute(
      `DELETE FROM thong_bao
       WHERE id_thong_bao = ? AND id_nguoi_nhan = ?`,
      [id, userId]
    );

    res.json({
      success: true,
      message: 'Đã xóa thông báo.'
    });
  } catch (error) {
    next(error);
  }
};

// Helper function to create notification
export const createNotification = async (id_nguoi_nhan, loai_thong_bao, tieu_de, noi_dung, link_lien_ket = null) => {
  try {
    const [result] = await pool.execute(
      `INSERT INTO thong_bao (id_nguoi_nhan, loai_thong_bao, tieu_de, noi_dung, link_lien_ket)
       VALUES (?, ?, ?, ?, ?)`,
      [id_nguoi_nhan, loai_thong_bao, tieu_de, noi_dung, link_lien_ket]
    );

    // Send real-time notification via WebSocket
    const notification = {
      id_thong_bao: result.insertId,
      loai_thong_bao,
      tieu_de,
      noi_dung,
      link_lien_ket,
      da_doc: false,
      ngay_tao: new Date()
    };

    sendNotificationToUser(id_nguoi_nhan, notification);

    return { success: true };
  } catch (error) {
    console.error('Error creating notification:', error);
    return { success: false, error };
  }
};

