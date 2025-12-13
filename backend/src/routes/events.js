import express from 'express';
import { getEvents, getEventById, getUpcomingEvents } from '../controllers/eventController.js';

const router = express.Router();

// Public routes
router.get('/', getEvents);
router.get('/upcoming/list', getUpcomingEvents);
router.get('/:id', getEventById);

export default router;

