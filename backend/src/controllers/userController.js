import { UserModel } from '../models/User.js';
import { ApiResponse, asyncHandler, sanitizeUser } from '../utils/helpers.js';

/**
 * User Controller - Handles user management operations
 */
export class UserController {
  /**
   * Get all users
   */
  static getAllUsers = asyncHandler(async (req, res) => {
    const { status, role } = req.query;
    const filters = {};
    
    if (status) filters.status = status;
    if (role) filters.role = role;

    const users = await UserModel.findAll(filters);
    const sanitizedUsers = users.map(sanitizeUser);

    res.json(ApiResponse.success(sanitizedUsers));
  });

  /**
   * Get user by ID
   */
  static getUserById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const user = await UserModel.findById(id);

    if (!user) {
      return res.status(404).json(
        ApiResponse.error('User not found')
      );
    }

    res.json(ApiResponse.success(sanitizeUser(user)));
  });

  /**
   * Search users
   */
  static searchUsers = asyncHandler(async (req, res) => {
    const { q } = req.query;

    if (!q || q.length < 2) {
      return res.status(400).json(
        ApiResponse.error('Search query must be at least 2 characters')
      );
    }

    const users = await UserModel.search(q);
    const sanitizedUsers = users.map(sanitizeUser);

    res.json(ApiResponse.success(sanitizedUsers));
  });

  /**
   * Get online users
   */
  static getOnlineUsers = asyncHandler(async (req, res) => {
    const users = await UserModel.getOnlineUsers();
    const sanitizedUsers = users.map(sanitizeUser);

    res.json(ApiResponse.success(sanitizedUsers));
  });

  /**
   * Update user status
   */
  static updateStatus = asyncHandler(async (req, res) => {
    const { status } = req.body;
    const userId = req.user.id;

    const validStatuses = ['online', 'offline', 'away'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json(
        ApiResponse.error(`Invalid status. Must be one of: ${validStatuses.join(', ')}`)
      );
    }

    const updatedUser = await UserModel.updateStatus(userId, status);

    res.json(
      ApiResponse.success(
        sanitizeUser(updatedUser),
        'Status updated successfully'
      )
    );
  });

  /**
   * Delete user (admin only)
   */
  static deleteUser = asyncHandler(async (req, res) => {
    const { id } = req.params;

    // Prevent deleting self
    if (id === req.user.id) {
      return res.status(400).json(
        ApiResponse.error('Cannot delete your own account')
      );
    }

    const user = await UserModel.findById(id);
    if (!user) {
      return res.status(404).json(
        ApiResponse.error('User not found')
      );
    }

    await UserModel.delete(id);

    res.json(ApiResponse.success(null, 'User deleted successfully'));
  });

  /**
   * Update user role (admin only)
   */
  static updateUserRole = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { role } = req.body;

    const validRoles = ['user', 'admin', 'moderator'];
    if (!validRoles.includes(role)) {
      return res.status(400).json(
        ApiResponse.error(`Invalid role. Must be one of: ${validRoles.join(', ')}`)
      );
    }

    // Prevent changing own role
    if (id === req.user.id) {
      return res.status(400).json(
        ApiResponse.error('Cannot change your own role')
      );
    }

    const updatedUser = await UserModel.update(id, { role });

    res.json(
      ApiResponse.success(
        sanitizeUser(updatedUser),
        'User role updated successfully'
      )
    );
  });
}
