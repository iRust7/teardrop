import { supabaseAdmin } from '../config/database.js';

/**
 * Status Service - Handles user status monitoring
 */
export class StatusService {
  /**
   * Mark users as offline if they haven't been seen in the last 2 minutes
   */
  static async updateInactiveUsers() {
    try {
      const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000).toISOString();
      
      const { data, error } = await supabaseAdmin
        .from('users')
        .update({ status: 'offline' })
        .eq('status', 'online')
        .lt('last_seen', twoMinutesAgo)
        .select();

      if (error) {
        console.error('Error updating inactive users:', error);
        return { count: 0, error };
      }

      if (data && data.length > 0) {
        console.log(`Marked ${data.length} users as offline`);
      }

      return { count: data?.length || 0 };
    } catch (error) {
      console.error('Error in updateInactiveUsers:', error);
      return { count: 0, error };
    }
  }

  /**
   * Start monitoring user status
   */
  static startMonitoring() {
    console.log('Starting user status monitoring...');
    
    // Check every 30 seconds
    const interval = setInterval(async () => {
      await this.updateInactiveUsers();
    }, 30000);

    // Initial check
    this.updateInactiveUsers();

    return interval;
  }
}
