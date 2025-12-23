import express from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import { 
  getNotifications, 
  markAsRead, 
  getProfile, 
  updateProfile 
} from '../controllers/volunteerController.js';

const router = express.Router();

router.use(authenticate);
router.use(authorize('nhom_tinh_nguyen'));

router.get('/notifications', getNotifications);
router.put('/notifications/:id/read', markAsRead);
router.get('/profile', getProfile);
router.put('/profile', updateProfile);

export default router;

