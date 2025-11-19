import express from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import {
  getProfile,
  updateProfile,
  getBloodInfo,
  updateBloodInfo,
  getHistory
} from '../controllers/donorController.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Profile routes
router.get('/profile', authorize('nguoi_hien'), getProfile);
router.put('/profile', authorize('nguoi_hien'), updateProfile);

// Blood info routes
router.get('/blood-info', authorize('nguoi_hien'), getBloodInfo);
router.put('/blood-info', authorize('nguoi_hien'), updateBloodInfo);

// History route
router.get('/history', authorize('nguoi_hien'), getHistory);

export default router;

