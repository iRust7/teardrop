import { supabaseAdmin } from '../config/database.js';

/**
 * User Model - Handles all user-related database operations
 */
export class UserModel {
  /**
   * Create a new user
   */
  static async create(userData) {
    const { data, error } = await supabaseAdmin
      .from('users')
      .insert([userData])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Find user by ID
   */
  static async findById(id) {
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  /**
   * Find user by email
   */
  static async findByEmail(email) {
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  /**
   * Find user by username
   */
  static async findByUsername(username) {
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('username', username)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  /**
   * Get all users
   */
  static async findAll(filters = {}) {
    let query = supabaseAdmin.from('users').select('*');

    if (filters.status) {
      query = query.eq('status', filters.status);
    }

    if (filters.role) {
      query = query.eq('role', filters.role);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  /**
   * Update user
   */
  static async update(id, updates) {
    const { data, error } = await supabaseAdmin
      .from('users')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Update user status
   */
  static async updateStatus(id, status) {
    return await this.update(id, { 
      status, 
      last_seen: new Date().toISOString() 
    });
  }

  /**
   * Delete user
   */
  static async delete(id) {
    const { error } = await supabaseAdmin
      .from('users')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  }

  /**
   * Search users by username or email
   */
  static async search(query) {
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('id, username, email, status, avatar_url, role, created_at')
      .or(`username.ilike.%${query}%,email.ilike.%${query}%`)
      .order('username');

    if (error) throw error;
    return data;
  }

  /**
   * Get online users
   */
  static async getOnlineUsers() {
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('id, username, status, avatar_url, role')
      .eq('status', 'online')
      .order('username');

    if (error) throw error;
    return data;
  }
}
