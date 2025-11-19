import jwt from 'jsonwebtoken';
import pool from '../config/database.js';

// Verify JWT token
export const authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided. Access denied.'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user from database
    const [users] = await pool.execute(
      'SELECT id_nguoi_dung, ho_ten, email, so_dien_thoai, gioi_tinh, ngay_sinh, id_vai_tro, trang_thai FROM nguoidung WHERE id_nguoi_dung = ?',
      [decoded.userId]
    );

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'User not found.'
      });
    }

    const user = users[0];

    // Check if user is active
    if (!user.trang_thai) {
      return res.status(403).json({
        success: false,
        message: 'Account is deactivated.'
      });
    }

    // Get role name
    const [roles] = await pool.execute(
      'SELECT ten_vai_tro FROM vaitro WHERE id_vai_tro = ?',
      [user.id_vai_tro]
    );

    req.user = {
      ...user,
      ten_vai_tro: roles[0]?.ten_vai_tro
    };

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired.'
      });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token.'
      });
    }
    next(error);
  }
};

// Role-based access control
export const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.'
      });
    }

    if (!allowedRoles.includes(req.user.ten_vai_tro)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Insufficient permissions.'
      });
    }

    next();
  };
};

