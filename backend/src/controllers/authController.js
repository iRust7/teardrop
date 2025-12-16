import { UserModel } from '../models/User.js';
import { hashPassword, comparePassword } from '../utils/password.js';
import { generateToken } from '../utils/jwt.js';
import { ApiResponse, asyncHandler, sanitizeUser } from '../utils/helpers.js';

/**
 * Auth Controller - Handles authentication operations
 */
export class AuthController {
  /**
   * Register a new user
   */
  static register = asyncHandler(async (req, res) => {
    const { username, email, password } = req.body;

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

    // Create user
    const user = await UserModel.create({
      username,
      email,
      password_hash,
      status: 'online',
      role: 'user'
    });

    // Generate token
    const token = generateToken({ userId: user.id, email: user.email, role: user.role });

    res.status(201).json(
      ApiResponse.success(
        {
          user: sanitizeUser(user),
          token
        },
        'User registered successfully'
      )
    );
  });

  /**
   * Login user
   */
  static login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    // Find user
    const user = await UserModel.findByEmail(email);
    if (!user) {
      return res.status(401).json(
        ApiResponse.error('Invalid email or password')
      );
    }

    // Verify password
    const isValidPassword = await comparePassword(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json(
        ApiResponse.error('Invalid email or password')
      );
    }

    // Update user status to online
    await UserModel.updateStatus(user.id, 'online');

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
   * Send OTP to email
   */
  static sendOTP = asyncHandler(async (req, res) => {
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
        ApiResponse.error('User not found')
      );
    }

    // Generate OTP (6 digits)
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Save OTP to user record
    await UserModel.update(user.id, {
      otp_code: otp,
      otp_expiry: otpExpiry.toISOString(),
    });

    // In production, send email here using SendGrid, Mailgun, etc.
    // For demo, we'll log it
    console.log(`[OTP] Code for ${email}: ${otp} (expires: ${otpExpiry})`);

    res.json(
      ApiResponse.success(
        { email },
        'OTP sent to your email'
      )
    );
  });

  /**
   * Verify OTP and login
   */
  static verifyOTP = asyncHandler(async (req, res) => {
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

    // Check OTP
    if (!user.otp_code || user.otp_code !== otp) {
      return res.status(401).json(
        ApiResponse.error('Invalid OTP')
      );
    }

    // Check expiry
    if (new Date() > new Date(user.otp_expiry)) {
      return res.status(401).json(
        ApiResponse.error('OTP has expired')
      );
    }

    // Clear OTP
    await UserModel.update(user.id, {
      otp_code: null,
      otp_expiry: null,
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
        'OTP verified successfully'
      )
    );
  });
}
