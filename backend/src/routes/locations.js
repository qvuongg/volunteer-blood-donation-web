import express from 'express';
import { getLocations, getNearbyLocations } from '../controllers/locationController.js';

const router = express.Router();

// Public routes
router.get('/', getLocations);
router.get('/nearby', getNearbyLocations);

export default router;

