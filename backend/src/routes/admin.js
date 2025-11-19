import express from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import {
  getUsers,
  updateUser,
  updateUserStatus,
  deleteUser,
  getStats
} from '../controllers/adminController.js';

const router = express.Router();

router.use(authenticate);
router.use(authorize('admin'));

router.get('/users', getUsers);
router.put('/users/:id', updateUser);
router.put('/users/:id/status', updateUserStatus);
router.delete('/users/:id', deleteUser);
router.get('/stats', getStats);

export default router;

