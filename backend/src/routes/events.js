import express from 'express';
import { getEvents, getEventById } from '../controllers/eventController.js';

const router = express.Router();

// Public routes
router.get('/', getEvents);
router.get('/:id', getEventById);

export default router;

