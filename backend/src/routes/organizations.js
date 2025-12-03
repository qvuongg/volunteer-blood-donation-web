import express from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import {
  getMyEvents,
  createEvent,
  updateEvent,
  deleteEvent,
  getEventRegistrations,
  getStats
} from '../controllers/organizationController.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);
router.use(authorize('to_chuc'));

// Stats route
router.get('/stats', getStats);

// Event routes
router.get('/events', getMyEvents);
router.post('/events', createEvent);
router.put('/events/:id', updateEvent);
router.delete('/events/:id', deleteEvent);
router.get('/events/:id/registrations', getEventRegistrations);

export default router;

