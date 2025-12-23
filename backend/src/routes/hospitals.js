import express from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import {
  getPendingEvents,
  getApprovedEvents,
  updateEventStatus,
  getApprovedRegistrations,
  createResult,
  createBulkResults,
  createNotification,
  getUnconfirmedBloodTypes,
  confirmBloodType,
  getStats,
  updateProfile
} from '../controllers/hospitalController.js';

const router = express.Router();

router.use(authenticate);
router.use(authorize('benh_vien'));

// Stats route
router.get('/stats', getStats);

router.get('/events/pending', getPendingEvents);
router.get('/events/approved', getApprovedEvents);
router.put('/events/:id/status', updateEventStatus);
router.get('/events/:id/registrations', getApprovedRegistrations);
router.post('/results', createResult);
router.post('/results/bulk', createBulkResults);
router.post('/notifications', createNotification);

// Blood type confirmation routes
router.get('/blood-types/unconfirmed', getUnconfirmedBloodTypes);
router.post('/blood-types/confirm', confirmBloodType);

// Profile routes
router.put('/profile', updateProfile);

export default router;

