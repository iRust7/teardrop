import express from 'express';
import { UserController } from '../controllers/userController.js';
import { authenticate, authorizeAdmin, validateBody } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// User routes
router.get('/', UserController.getAllUsers);
router.get('/search', UserController.searchUsers);
router.get('/online', UserController.getOnlineUsers);
router.get('/:id', UserController.getUserById);
router.put('/status', validateBody(['status']), UserController.updateStatus);

// Admin only routes
router.delete('/:id', authorizeAdmin, UserController.deleteUser);
router.put(
  '/:id/role',
  authorizeAdmin,
  validateBody(['role']),
  UserController.updateUserRole
);

export default router;
