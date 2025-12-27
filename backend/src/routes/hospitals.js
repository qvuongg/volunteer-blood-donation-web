import express from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import {
  getPendingEvents,
  getApprovedEvents,
  getAllEvents,
  updateEventStatus,
  getApprovedRegistrations,
  createResult,
  createBulkResults,
  createHospitalNotification,
  getUnconfirmedBloodTypes,
  getAllBloodTypes,
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
router.get('/events/all', getAllEvents);
router.put('/events/:id/status', updateEventStatus);
router.get('/events/:id/registrations', getApprovedRegistrations);
router.post('/results', createResult);
router.post('/results/bulk', createBulkResults);
router.post('/notifications', createHospitalNotification);

// Blood type confirmation routes
router.get('/blood-types/unconfirmed', getUnconfirmedBloodTypes);
router.get('/blood-types/all', getAllBloodTypes);
router.post('/blood-types/confirm', confirmBloodType);

// Profile routes
router.put('/profile', updateProfile);

export default router;

