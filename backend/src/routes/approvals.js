import express from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import { 
  getPendingRegistrations,
  approveRegistration, 
  rejectRegistration 
} from '../controllers/approvalController.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);
router.use(authorize('to_chuc'));

// Get pending registrations
router.get('/pending', getPendingRegistrations);

// Approval routes
router.put('/registrations/:id/approve', approveRegistration);
router.put('/registrations/:id/reject', rejectRegistration);

export default router;

