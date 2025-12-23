import express from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import {
  getMyEvents,
  getEventDetail,
  createEvent,
  updateEvent,
  deleteEvent,
  getEventRegistrations,
  getStats,
  getProfile,
  updateProfile
} from '../controllers/organizationController.js';
import pool from '../config/database.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);
router.use(authorize('to_chuc'));

// Stats and profile routes
router.get('/stats', getStats);
router.get('/profile', getProfile);
router.put('/profile', updateProfile);

// Get hospitals list for event creation
router.get('/hospitals', async (req, res, next) => {
  try {
    const [hospitals] = await pool.execute(
      'SELECT id_benh_vien, ten_benh_vien FROM benh_vien ORDER BY ten_benh_vien'
    );
    res.json({
      success: true,
      data: { hospitals }
    });
  } catch (error) {
    next(error);
  }
});

// Event routes
router.get('/events', getMyEvents);
router.get('/events/:id', getEventDetail);
router.post('/events', createEvent);
router.put('/events/:id', updateEvent);
router.delete('/events/:id', deleteEvent);
router.get('/events/:id/registrations', getEventRegistrations);

export default router;

