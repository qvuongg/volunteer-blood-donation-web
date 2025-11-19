import express from 'express';
import { body } from 'express-validator';
import { register, login, getMe } from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Validation rules
const registerValidation = [
  body('ho_ten').trim().notEmpty().withMessage('Họ tên là bắt buộc'),
  body('email').isEmail().withMessage('Email không hợp lệ'),
  body('mat_khau').isLength({ min: 6 }).withMessage('Mật khẩu phải có ít nhất 6 ký tự'),
  body('gioi_tinh').isIn(['Nam', 'Nu', 'Khac']).withMessage('Giới tính không hợp lệ'),
  body('ngay_sinh').isISO8601().withMessage('Ngày sinh không hợp lệ'),
  body('id_vai_tro').isInt().withMessage('Vai trò không hợp lệ')
];

const loginValidation = [
  body('email').isEmail().withMessage('Email không hợp lệ'),
  body('mat_khau').notEmpty().withMessage('Mật khẩu là bắt buộc')
];

// Routes
router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);
router.get('/me', authenticate, getMe);

export default router;

