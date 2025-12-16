import { MessageModel } from '../models/Message.js';
import { UserModel } from '../models/User.js';
import { ApiResponse, asyncHandler } from '../utils/helpers.js';

/**
 * Message Controller - Handles messaging operations
 */
export class MessageController {
  /**
   * Send a message
   */
  static sendMessage = asyncHandler(async (req, res) => {
    const { receiver_id, content } = req.body;
    const user_id = req.user.id;

    // Validate receiver exists
    const receiver = await UserModel.findById(receiver_id);
    if (!receiver) {
      return res.status(404).json(
        ApiResponse.error('Receiver not found')
      );
    }

    // Validate content
    if (!content || content.trim().length === 0) {
      return res.status(400).json(
        ApiResponse.error('Message content cannot be empty')
      );
    }

    if (content.length > 5000) {
      return res.status(400).json(
        ApiResponse.error('Message content is too long (max 5000 characters)')
      );
    }

    // Create message
    const message = await MessageModel.create({
      user_id,
      receiver_id,
      content: content.trim(),
      is_read: false
    });

    // Fetch complete message with user data
    const completeMessage = await MessageModel.findById(message.id);

    res.status(201).json(
      ApiResponse.success(completeMessage, 'Message sent successfully')
    );
  });

  /**
   * Get conversation between current user and another user
   */
  static getConversation = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const currentUserId = req.user.id;
    const limit = parseInt(req.query.limit) || 50;
    const offset = parseInt(req.query.offset) || 0;

    // Validate user exists
    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json(
        ApiResponse.error('User not found')
      );
    }

    const messages = await MessageModel.getConversation(
      currentUserId,
      userId,
      limit,
      offset
    );

    res.json(ApiResponse.success(messages));
  });

  /**
   * Get all user messages
   */
  static getUserMessages = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const limit = parseInt(req.query.limit) || 100;

    const messages = await MessageModel.getUserMessages(userId, limit);

    res.json(ApiResponse.success(messages));
  });

  /**
   * Get recent conversations
   */
  static getRecentConversations = asyncHandler(async (req, res) => {
    const userId = req.user.id;

    const conversations = await MessageModel.getRecentConversations(userId);

    res.json(ApiResponse.success(conversations));
  });

  /**
   * Mark message as read
   */
  static markAsRead = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;

    const message = await MessageModel.findById(id);
    
    if (!message) {
      return res.status(404).json(
        ApiResponse.error('Message not found')
      );
    }

    // Only receiver can mark message as read
    if (message.receiver_id !== userId) {
      return res.status(403).json(
        ApiResponse.error('You can only mark messages sent to you as read')
      );
    }

    const updatedMessage = await MessageModel.markAsRead(id);

    res.json(
      ApiResponse.success(updatedMessage, 'Message marked as read')
    );
  });

  /**
   * Mark all messages in conversation as read
   */
  static markConversationAsRead = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const currentUserId = req.user.id;

    const messages = await MessageModel.markConversationAsRead(
      currentUserId,
      userId
    );

    res.json(
      ApiResponse.success(
        { count: messages.length },
        `Marked ${messages.length} messages as read`
      )
    );
  });

  /**
   * Delete message
   */
  static deleteMessage = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;

    const message = await MessageModel.findById(id);
    
    if (!message) {
      return res.status(404).json(
        ApiResponse.error('Message not found')
      );
    }

    // Only sender can delete message or admin
    if (message.user_id !== userId && req.user.role !== 'admin') {
      return res.status(403).json(
        ApiResponse.error('You can only delete your own messages')
      );
    }

    await MessageModel.delete(id);

    res.json(ApiResponse.success(null, 'Message deleted successfully'));
  });

  /**
   * Get unread message count
   */
  static getUnreadCount = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const count = await MessageModel.getUnreadCount(userId);

    res.json(ApiResponse.success({ count }));
  });

  /**
   * Search messages
   */
  static searchMessages = asyncHandler(async (req, res) => {
    const { q } = req.query;
    const userId = req.user.id;

    if (!q || q.length < 2) {
      return res.status(400).json(
        ApiResponse.error('Search query must be at least 2 characters')
      );
    }

    const messages = await MessageModel.search(userId, q);

    res.json(ApiResponse.success(messages));
  });
}
