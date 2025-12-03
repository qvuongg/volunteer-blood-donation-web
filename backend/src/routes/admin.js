import express from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import {
  getUsers,
  updateUser,
  updateUserStatus,
  deleteUser,
  getStats,
  getEvents,
  getRegistrations,
  getReportsOverview,
  getReportsByBloodType,
  getReportsByOrganization,
  getReportsByHospital
} from '../controllers/adminController.js';

const router = express.Router();

router.use(authenticate);
router.use(authorize('admin'));

// User management
router.get('/users', getUsers);
router.put('/users/:id', updateUser);
router.put('/users/:id/status', updateUserStatus);
router.delete('/users/:id', deleteUser);

// Event management
router.get('/events', getEvents);

// Registration management
router.get('/registrations', getRegistrations);

// Reports
router.get('/reports/overview', getReportsOverview);
router.get('/reports/blood-types', getReportsByBloodType);
router.get('/reports/organizations', getReportsByOrganization);
router.get('/reports/hospitals', getReportsByHospital);

// Stats
router.get('/stats', getStats);

export default router;

