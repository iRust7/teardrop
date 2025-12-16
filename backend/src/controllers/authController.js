import { UserModel } from '../models/User.js';
import { hashPassword, comparePassword } from '../utils/password.js';
import { generateToken } from '../utils/jwt.js';
import { ApiResponse, asyncHandler, sanitizeUser } from '../utils/helpers.js';
import { supabase } from '../config/database.js';

/**
 * Auth Controller - Handles authentication operations using Supabase Auth
 */
export class AuthController {
  /**
   * Register a new user (Step 1: Send OTP via Supabase Auth)
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

    // Check if user already exists in our database
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

    // Hash password for our database
    const password_hash = await hashPassword(password);

    // Create user in our database (not verified yet)
    const user = await UserModel.create({
      username,
      email,
      password_hash,
      status: 'offline',
      role: 'user',
      email_verified: false,
      otp_code: null,
      otp_expiry: null
    });

    console.log(`[REGISTER] User created: ${email} (ID: ${user.id})`);
    console.log('[REGISTER] OTP already sent by frontend via Supabase Auth');
    
    res.status(201).json(
      ApiResponse.success(
        { email, userId: user.id },
        'User registered! Please verify your OTP code.'
      )
    )
  });

  /**
   * Login user (with rate limiting and turnstile after 3 failed attempts)
   */
  static login = asyncHandler(async (req, res) => {
    const { email, password, turnstileToken } = req.body;

    console.log(`[LOGIN] Attempt for email: ${email}`);

    // Find user
    const user = await UserModel.findByEmail(email);
    if (!user) {
      console.log(`[LOGIN] User not found: ${email}`);
      return res.status(401).json(
        ApiResponse.error('Invalid email or password')
      );
    }

    console.log(`[LOGIN] User found: ${email}, email_verified: ${user.email_verified}`);

    // Check if email is verified
    if (!user.email_verified) {
      console.log(`[LOGIN] Email not verified for: ${email}`);
      return res.status(403).json({
        success: false,
        message: 'Please verify your email first. Check your inbox for OTP code.',
        data: { 
          needsVerification: true,
          email: user.email 
        },
        timestamp: new Date().toISOString()
      });
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
    
    // If user doesn't exist, just send OTP (for pre-registration)
    if (!user) {
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      
      // Send OTP via Gmail
      try {
        const { sendOTPEmail } = await import('../utils/emailService.js');
        await sendOTPEmail(email, otp);
        
        console.log(`[PRE-REGISTER OTP] Code sent to ${email}: ${otp}`);
        
        return res.status(200).json(
          ApiResponse.success(
            { email, message: 'OTP sent to email' },
            'Verification code sent! Check your email.'
          )
        );
      } catch (emailError) {
        console.error('[PRE-REGISTER OTP] ❌ Email send failed:', emailError.message);
        const errorMsg = emailError.message.includes('timeout') 
          ? 'Email service is slow. Please wait a moment and try again.'
          : 'Failed to send verification email. Please try again.';
        return res.status(500).json(
          ApiResponse.error(errorMsg)
        );
      }
    }

    // Check if already verified
    if (user.email_verified) {
      return res.status(400).json(
        ApiResponse.error('Email already verified. Please login.')
      );
    }

    // Send OTP via Supabase Auth
    try {
      const { data, error } = await supabase.auth.signInWithOtp({
        email: email,
        options: {
          shouldCreateUser: true,
        }
      });

      if (error) {
        console.error('[RESEND OTP] Supabase error:', error);
        throw error;
      }

      console.log(`[RESEND OTP] OTP sent via Supabase to ${email}`);
      
      res.json(
        ApiResponse.success(
          { email },
          'Kode OTP baru telah dikirim ke email kamu'
        )
      );
    } catch (error) {
      console.error('[RESEND OTP] ❌ Failed:', error.message);
      
      res.status(500).json(
        ApiResponse.error('Failed to send OTP. Please try again.')
      );
    }
  });

  /**
   * Verify OTP after registration (email verification using Supabase Auth)
   */
  static verifyRegistrationOTP = asyncHandler(async (req, res) => {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json(
        ApiResponse.error('Email and OTP are required')
      );
    }

    // Find user in our database
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

    // Verify OTP with Supabase Auth
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email: email,
        token: otp,
        type: 'email'
      });

      if (error) {
        console.error('[VERIFY OTP] Supabase error:', error);
        
        if (error.message.includes('expired')) {
          return res.status(401).json(
            ApiResponse.error('Kode OTP sudah kadaluarsa. Silakan kirim ulang.')
          );
        }
        
        return res.status(401).json(
          ApiResponse.error('Kode OTP salah')
        );
      }

      // OTP verified successfully, update our database
      await UserModel.update(user.id, {
        otp_code: null,
        otp_expiry: null,
        email_verified: true,
        status: 'online',
      });

      console.log(`[VERIFY OTP] Email verified for ${email}`);

      // Generate our custom JWT token
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
    } catch (error) {
      console.error('[VERIFY OTP] Error:', error);
      res.status(500).json(
        ApiResponse.error('Failed to verify OTP. Please try again.')
      );
    }
  });
}
