import express from 'express';
import { AuthController } from '../controllers/authController.js';
import { authenticate, validateBody, rateLimit } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.post(
  '/register',
  rateLimit(10, 60000), // 10 requests per minute
  validateBody(['username', 'email', 'password']),
  AuthController.register
);

router.post(
  '/login',
  rateLimit(10, 60000),
  validateBody(['email', 'password']),
  AuthController.login
);

// Protected routes
router.post('/logout', authenticate, AuthController.logout);
router.get('/profile', authenticate, AuthController.getProfile);
router.put('/profile', authenticate, AuthController.updateProfile);
router.post(
  '/change-password',
  authenticate,
  validateBody(['currentPassword', 'newPassword']),
  AuthController.changePassword
);
router.post('/refresh-token', authenticate, AuthController.refreshToken);

export default router;
