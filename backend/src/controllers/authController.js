import { UserModel } from '../models/User.js';
import { hashPassword, comparePassword } from '../utils/password.js';
import { generateToken } from '../utils/jwt.js';
import { ApiResponse, asyncHandler, sanitizeUser } from '../utils/helpers.js';

/**
 * Auth Controller - Handles authentication operations
 */
export class AuthController {
  /**
   * Register a new user (Step 1: Create user and send OTP)
   */
  static register = asyncHandler(async (req, res) => {
    const { username, email, password, turnstileToken } = req.body;

    // Verify Turnstile token
    if (!turnstileToken) {
      return res.status(400).json(
        ApiResponse.error('Captcha verification required')
      );
    }

    // Verify Turnstile with Cloudflare
    const turnstileVerify = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        secret: process.env.TURNSTILE_SECRET_KEY,
        response: turnstileToken
      })
    });
    const turnstileResult = await turnstileVerify.json();
    
    if (!turnstileResult.success) {
      return res.status(400).json(
        ApiResponse.error('Captcha verification failed')
      );
    }

    // Check if user already exists
    const existingUser = await UserModel.findByEmail(email);
    if (existingUser) {
      return res.status(409).json(
        ApiResponse.error('User with this email already exists')
      );
    }

    const existingUsername = await UserModel.findByUsername(username);
    if (existingUsername) {
      return res.status(409).json(
        ApiResponse.error('Username already taken')
      );
    }

    // Validate password strength
    if (password.length < 6) {
      return res.status(400).json(
        ApiResponse.error('Password must be at least 6 characters long')
      );
    }

    // Hash password
    const password_hash = await hashPassword(password);

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Create user (email not verified yet)
    const user = await UserModel.create({
      username,
      email,
      password_hash,
      status: 'offline',
      role: 'user',
      email_verified: false,
      otp_code: otp,
      otp_expiry: otpExpiry.toISOString()
    });

    // Send OTP via Gmail
    try {
      const { sendOTPEmail } = await import('../utils/emailService.js');
      await sendOTPEmail(email, otp);
      
      console.log(`[REGISTER] OTP sent to ${email}: ${otp}`);
      
      res.status(201).json(
        ApiResponse.success(
          { email, userId: user.id },
          'Registration successful! Check your email for OTP verification code.'
        )
      );
    } catch (emailError) {
      console.error('[REGISTER] Email send failed:', emailError);
      
      // Rollback user creation if email fails
      await UserModel.delete(user.id);
      
      res.status(500).json(
        ApiResponse.error('Failed to send verification email. Please try again.')
      );
    }
  });

  /**
   * Login user (with rate limiting and turnstile after 3 failed attempts)
   */
  static login = asyncHandler(async (req, res) => {
    const { email, password, turnstileToken } = req.body;

    // Find user
    const user = await UserModel.findByEmail(email);
    if (!user) {
      return res.status(401).json(
        ApiResponse.error('Invalid email or password')
      );
    }

    // Check if email is verified
    if (!user.email_verified) {
      return res.status(403).json(
        ApiResponse.error('Please verify your email first. Check your inbox for OTP code.')
      );
    }

    // Check failed login attempts
    const failedAttempts = user.failed_login_attempts || 0;
    
    // Require Turnstile after 3 failed attempts
    if (failedAttempts >= 3) {
      if (!turnstileToken) {
        return res.status(429).json(
          ApiResponse.error('Too many failed attempts. Please complete the captcha.', { requireCaptcha: true })
        );
      }

      // Verify Turnstile
      const turnstileVerify = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          secret: process.env.TURNSTILE_SECRET_KEY,
          response: turnstileToken
        })
      });
      const turnstileResult = await turnstileVerify.json();
      
      if (!turnstileResult.success) {
        return res.status(400).json(
          ApiResponse.error('Captcha verification failed', { requireCaptcha: true })
        );
      }
    }

    // Verify password
    const isValidPassword = await comparePassword(password, user.password_hash);
    if (!isValidPassword) {
      // Increment failed attempts
      await UserModel.update(user.id, {
        failed_login_attempts: failedAttempts + 1
      });
      
      const remainingAttempts = 3 - (failedAttempts + 1);
      const message = remainingAttempts > 0 
        ? `Invalid email or password. ${remainingAttempts} attempts remaining before captcha required.`
        : 'Invalid email or password. Captcha required for next attempt.';
      
      return res.status(401).json(
        ApiResponse.error(message, { requireCaptcha: failedAttempts + 1 >= 3 })
      );
    }

    // Reset failed attempts on successful login
    await UserModel.update(user.id, {
      failed_login_attempts: 0,
      status: 'online'
    });

    // Generate token
    const token = generateToken({ userId: user.id, email: user.email, role: user.role });

    res.json(
      ApiResponse.success(
        {
          user: sanitizeUser(user),
          token
        },
        'Login successful'
      )
    );
  });

  /**
   * Logout user
   */
  static logout = asyncHandler(async (req, res) => {
    const userId = req.user.id;

    // Update user status to offline
    await UserModel.updateStatus(userId, 'offline');

    res.json(ApiResponse.success(null, 'Logout successful'));
  });

  /**
   * Get current user profile
   */
  static getProfile = asyncHandler(async (req, res) => {
    const user = await UserModel.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json(
        ApiResponse.error('User not found')
      );
    }

    res.json(ApiResponse.success(sanitizeUser(user)));
  });

  /**
   * Update user profile
   */
  static updateProfile = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { username, avatar_url, bio } = req.body;

    const updates = {};
    if (username) {
      // Check if username is taken
      const existing = await UserModel.findByUsername(username);
      if (existing && existing.id !== userId) {
        return res.status(409).json(
          ApiResponse.error('Username already taken')
        );
      }
      updates.username = username;
    }
    if (avatar_url !== undefined) updates.avatar_url = avatar_url;
    if (bio !== undefined) updates.bio = bio;

    const updatedUser = await UserModel.update(userId, updates);

    res.json(
      ApiResponse.success(
        sanitizeUser(updatedUser),
        'Profile updated successfully'
      )
    );
  });

  /**
   * Change password
   */
  static changePassword = asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    const user = await UserModel.findById(userId);

    // Verify current password
    const isValid = await comparePassword(currentPassword, user.password_hash);
    if (!isValid) {
      return res.status(401).json(
        ApiResponse.error('Current password is incorrect')
      );
    }

    // Validate new password
    if (newPassword.length < 6) {
      return res.status(400).json(
        ApiResponse.error('New password must be at least 6 characters long')
      );
    }

    // Hash and update password
    const password_hash = await hashPassword(newPassword);
    await UserModel.update(userId, { password_hash });

    res.json(ApiResponse.success(null, 'Password changed successfully'));
  });

  /**
   * Refresh token
   */
  static refreshToken = asyncHandler(async (req, res) => {
    const user = req.user;
    const token = generateToken({ userId: user.id, email: user.email, role: user.role });

    res.json(
      ApiResponse.success({ token }, 'Token refreshed successfully')
    );
  });

  /**
   * Google OAuth callback handler
   */
  static googleCallback = asyncHandler(async (req, res) => {
    const { email, name, google_id, avatar_url } = req.body;

    if (!email) {
      return res.status(400).json(
        ApiResponse.error('Email is required')
      );
    }

    // Check if user exists
    let user = await UserModel.findByEmail(email);

    if (!user) {
      // Create new user from Google OAuth
      const username = name || email.split('@')[0];
      user = await UserModel.create({
        username,
        email,
        password_hash: '', // No password for OAuth users
        google_id,
        avatar_url,
        status: 'online',
        role: 'user',
        email_verified: true, // Google accounts are pre-verified
      });
    } else {
      // Update existing user
      await UserModel.update(user.id, {
        google_id,
        avatar_url,
        status: 'online',
        email_verified: true,
      });
    }

    // Generate token
    const token = generateToken({ userId: user.id, email: user.email, role: user.role });

    res.json(
      ApiResponse.success(
        {
          user: sanitizeUser(user),
          token,
        },
        'Google login successful'
      )
    );
  });

  /**
   * Resend OTP for email verification (during registration)
   */
  static resendOTP = asyncHandler(async (req, res) => {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json(
        ApiResponse.error('Email is required')
      );
    }

    // Check if user exists
    const user = await UserModel.findByEmail(email);
    if (!user) {
      return res.status(404).json(
        ApiResponse.error('User not found.')
      );
    }

    // Check if already verified
    if (user.email_verified) {
      return res.status(400).json(
        ApiResponse.error('Email already verified. Please login.')
      );
    }

    // Generate new OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    // Save OTP to user record
    await UserModel.update(user.id, {
      otp_code: otp,
      otp_expiry: otpExpiry.toISOString(),
    });

    // Send OTP via Gmail
    try {
      const { sendOTPEmail } = await import('../utils/emailService.js');
      await sendOTPEmail(email, otp);
      
      console.log(`[RESEND OTP] Code sent to ${email}: ${otp}`);
      
      res.json(
        ApiResponse.success(
          { email },
          'Kode OTP baru telah dikirim ke email kamu'
        )
      );
    } catch (emailError) {
      console.error('[RESEND OTP] Email send failed:', emailError);
      
      res.status(500).json(
        ApiResponse.error('Failed to send OTP. Please try again.')
      );
    }
  });

  /**
   * Verify OTP after registration (email verification)
   */
  static verifyRegistrationOTP = asyncHandler(async (req, res) => {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json(
        ApiResponse.error('Email and OTP are required')
      );
    }

    // Find user
    const user = await UserModel.findByEmail(email);
    if (!user) {
      return res.status(404).json(
        ApiResponse.error('User not found')
      );
    }

    // Check if already verified
    if (user.email_verified) {
      return res.status(400).json(
        ApiResponse.error('Email already verified. Please login.')
      );
    }

    // Check OTP
    if (!user.otp_code || user.otp_code !== otp) {
      return res.status(401).json(
        ApiResponse.error('Kode OTP salah')
      );
    }

    // Check expiry
    if (new Date() > new Date(user.otp_expiry)) {
      return res.status(401).json(
        ApiResponse.error('Kode OTP sudah kadaluarsa. Silakan kirim ulang.')
      );
    }

    // Verify email and clear OTP
    await UserModel.update(user.id, {
      otp_code: null,
      otp_expiry: null,
      email_verified: true,
      status: 'online',
    });

    // Generate token
    const token = generateToken({ userId: user.id, email: user.email, role: user.role });

    res.json(
      ApiResponse.success(
        {
          user: sanitizeUser(user),
          token,
        },
        'Email verified successfully! You can now login.'
      )
    );
  });
}
