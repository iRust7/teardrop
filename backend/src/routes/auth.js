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

// OAuth routes
router.post(
  '/google/callback',
  rateLimit(10, 60000),
  validateBody(['email']),
  AuthController.googleCallback
);

// OTP routes
router.post(
  '/otp/send',
  rateLimit(5, 60000), // 5 OTP requests per minute
  validateBody(['email']),
  AuthController.sendOTP
);

router.post(
  '/otp/verify',
  rateLimit(10, 60000),
  validateBody(['email', 'otp']),
  AuthController.verifyOTP
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
