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
}
