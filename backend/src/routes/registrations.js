import express from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import { 
  registerForEvent, 
  getMyRegistrations,
  getEventRegistrations,
  updateRegistrationStatus,
  deleteRegistration
} from '../controllers/registrationController.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Donor routes
router.post('/event/:eventId', authorize('nguoi_hien'), registerForEvent);
router.get('/my', authorize('nguoi_hien'), getMyRegistrations);
router.delete('/:registrationId', authorize('nguoi_hien'), deleteRegistration);

// Organization manager routes
router.get('/event/:eventId/list', authorize('to_chuc'), getEventRegistrations);
router.put('/:registrationId/status', authorize('to_chuc'), updateRegistrationStatus);

export default router;

