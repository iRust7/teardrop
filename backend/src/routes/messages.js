import express from 'express';
import { MessageController } from '../controllers/messageController.js';
import { authenticate, validateBody } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Message routes
router.post(
  '/',
  validateBody(['receiver_id', 'content']),
  MessageController.sendMessage
);
router.post('/upload', MessageController.uploadFile);
router.get('/', MessageController.getUserMessages);
router.get('/conversations/recent', MessageController.getRecentConversations);
router.get('/unread-count', MessageController.getUnreadCount);
router.get('/search', MessageController.searchMessages);
router.get('/conversation/:userId', MessageController.getConversation);
router.put('/:id/read', MessageController.markAsRead);
router.put('/conversation/:userId/read', MessageController.markConversationAsRead);
router.delete('/:id', MessageController.deleteMessage);

export default router;
