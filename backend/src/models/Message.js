import { supabaseAdmin } from '../config/database.js';

/**
 * Message Model - Handles all message-related database operations
 */
export class MessageModel {
  /**
   * Create a new message
   */
  static async create(messageData) {
    const { data, error } = await supabaseAdmin
      .from('messages')
      .insert([messageData])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Find message by ID
   */
  static async findById(id) {
    const { data, error } = await supabaseAdmin
      .from('messages')
      .select('*, users!messages_user_id_fkey(id, username, avatar_url)')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  /**
   * Get messages between two users
   */
  static async getConversation(userId1, userId2, limit = 50, offset = 0) {
    const { data, error } = await supabaseAdmin
      .from('messages')
      .select('*, users!messages_user_id_fkey(id, username, avatar_url, status)')
      .or(`and(user_id.eq.${userId1},receiver_id.eq.${userId2}),and(user_id.eq.${userId2},receiver_id.eq.${userId1})`)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    return data.reverse(); // Return in chronological order
  }

  /**
   * Get all messages for a user (sent or received)
   */
  static async getUserMessages(userId, limit = 100) {
    const { data, error } = await supabaseAdmin
      .from('messages')
      .select(`
        *,
        sender:users!messages_user_id_fkey(id, username, avatar_url, status),
        receiver:users!messages_receiver_id_fkey(id, username, avatar_url, status)
      `)
      .or(`user_id.eq.${userId},receiver_id.eq.${userId}`)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data.reverse();
  }

  /**
   * Get recent conversations for a user
   */
  static async getRecentConversations(userId) {
    const { data, error } = await supabaseAdmin
      .from('messages')
      .select('*, users!messages_user_id_fkey(id, username, avatar_url, status)')
      .or(`user_id.eq.${userId},receiver_id.eq.${userId}`)
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) throw error;

    // Group by conversation partner
    const conversations = {};
    data.forEach(msg => {
      const partnerId = msg.user_id === userId ? msg.receiver_id : msg.user_id;
      if (!conversations[partnerId] || new Date(msg.created_at) > new Date(conversations[partnerId].created_at)) {
        conversations[partnerId] = msg;
      }
    });

    return Object.values(conversations);
  }

  /**
   * Update message
   */
  static async update(id, updates) {
    const { data, error } = await supabaseAdmin
      .from('messages')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Mark message as read
   */
  static async markAsRead(id) {
    return await this.update(id, { 
      is_read: true,
      read_at: new Date().toISOString()
    });
  }

  /**
   * Mark all messages in conversation as read
   */
  static async markConversationAsRead(userId, partnerId) {
    const { data, error } = await supabaseAdmin
      .from('messages')
      .update({ 
        is_read: true,
        read_at: new Date().toISOString()
      })
      .eq('user_id', partnerId)
      .eq('receiver_id', userId)
      .eq('is_read', false)
      .select();

    if (error) throw error;
    return data;
  }

  /**
   * Delete message
   */
  static async delete(id) {
    const { error } = await supabaseAdmin
      .from('messages')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  }

  /**
   * Get unread message count for user
   */
  static async getUnreadCount(userId) {
    const { count, error } = await supabaseAdmin
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('receiver_id', userId)
      .eq('is_read', false);

    if (error) throw error;
    return count;
  }

  /**
   * Search messages by content
   */
  static async search(userId, query) {
    const { data, error } = await supabaseAdmin
      .from('messages')
      .select('*, users!messages_user_id_fkey(id, username, avatar_url)')
      .or(`user_id.eq.${userId},receiver_id.eq.${userId}`)
      .ilike('content', `%${query}%`)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) throw error;
    return data;
  }
}
