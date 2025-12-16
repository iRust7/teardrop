import { MessageModel } from '../models/Message.js';
import { UserModel } from '../models/User.js';
import { ApiResponse, asyncHandler } from '../utils/helpers.js';
import { supabaseAdmin } from '../config/database.js';
import crypto from 'crypto';
import multer from 'multer';

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter: (req, file, cb) => {
    // Accept images, videos, pdfs, documents
    const allowedTypes = [
      'image/',
      'video/',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument',
      'text/',
      'application/zip',
      'application/x-rar',
    ];
    
    if (allowedTypes.some(type => file.mimetype.startsWith(type))) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  },
}).single('file');

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
   * Upload file and send as message
   */
  static uploadFile = asyncHandler(async (req, res) => {
    // Use multer middleware
    upload(req, res, async (err) => {
      if (err) {
        return res.status(400).json(
          ApiResponse.error(err.message || 'File upload failed')
        );
      }

      if (!req.file) {
        return res.status(400).json(
          ApiResponse.error('No file provided')
        );
      }

      const { receiver_id, caption } = req.body;
      const user_id = req.user.id;

      // Validate receiver exists
      const receiver = await UserModel.findById(receiver_id);
      if (!receiver) {
        return res.status(404).json(
          ApiResponse.error('Receiver not found')
        );
      }

      try {
        // Generate unique filename
        const fileExt = req.file.originalname.split('.').pop();
        const fileName = `${user_id}/${Date.now()}_${crypto.randomBytes(8).toString('hex')}.${fileExt}`;
        
        // Upload to Supabase Storage
        const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
          .from('chat-files')
          .upload(fileName, req.file.buffer, {
            contentType: req.file.mimetype,
            cacheControl: '3600',
          });

        if (uploadError) {
          console.error('Supabase upload error:', uploadError);
          return res.status(500).json(
            ApiResponse.error('Failed to upload file to storage')
          );
        }

        // Get public URL
        const { data: urlData } = supabaseAdmin.storage
          .from('chat-files')
          .getPublicUrl(fileName);

        // Create message with file data
        const fileData = {
          name: req.file.originalname,
          size: req.file.size,
          type: req.file.mimetype,
          url: urlData.publicUrl,
          path: fileName,
          hash: req.body.file_hash || null, // SHA-256 hash for integrity
        };
        
        if (req.body.file_hash) {
          console.log('[FILE UPLOAD] Hash received:', req.body.file_hash.substring(0, 16) + '...');
        }

        const message = await MessageModel.create({
          user_id,
          receiver_id,
          content: caption || '',
          type: 'file',
          file_data: fileData,
          is_read: false,
        });

        // Fetch complete message with user data
        const completeMessage = await MessageModel.findById(message.id);

        res.status(201).json(
          ApiResponse.success(completeMessage, 'File uploaded and sent successfully')
        );
      } catch (error) {
        console.error('File upload error:', error);
        return res.status(500).json(
          ApiResponse.error('Failed to process file upload')
        );
      }
    });
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
