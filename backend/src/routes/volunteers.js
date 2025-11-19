import express from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import { getNotifications, markAsRead } from '../controllers/volunteerController.js';

const router = express.Router();

router.use(authenticate);
router.use(authorize('nhom_tinh_nguyen'));

router.get('/notifications', getNotifications);
router.put('/notifications/:id/read', markAsRead);

export default router;

