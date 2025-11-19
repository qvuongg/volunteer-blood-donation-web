import express from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import { registerForEvent, getMyRegistrations } from '../controllers/registrationController.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Donor routes
router.post('/', authorize('nguoi_hien'), registerForEvent);
router.get('/my', authorize('nguoi_hien'), getMyRegistrations);

export default router;

