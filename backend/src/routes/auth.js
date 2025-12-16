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
  // Temporarily increased limit for debugging
  rateLimit(100, 60000), // 100 requests per minute
  validateBody(['email', 'password']),
  AuthController.login
);

// OTP routes for registration email verification
router.post(
  '/verify-otp',
  rateLimit(15, 60000), // Increased from 10 to 15
  validateBody(['email', 'otp']),
  AuthController.verifyRegistrationOTP
);

router.post(
  '/resend-otp',
  rateLimit(10, 60000), // Increased from 3 to 10 for better UX
  validateBody(['email']),
  AuthController.resendOTP
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
