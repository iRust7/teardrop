// Script to check and enable Supabase Realtime
import { supabaseAdmin } from './src/config/database.js';

async function checkRealtime() {
  console.log('🔍 Checking Supabase Realtime configuration...\n');

  try {
    // Test connection
    const { data: testData, error: testError } = await supabaseAdmin
      .from('messages')
      .select('id')
      .limit(1);

    if (testError) {
      console.error('❌ Database connection failed:', testError.message);
      return;
    }

    console.log('✅ Database connection successful');

    // Get Realtime channel info
    const channel = supabaseAdmin.channel('test_channel');
    
    const status = await new Promise((resolve) => {
      channel.subscribe((status, err) => {
        console.log('📡 Realtime subscription status:', status);
        if (err) {
          console.error('❌ Subscription error:', err);
        }
        resolve(status);
      });
      
      // Timeout after 5 seconds
      setTimeout(() => {
        resolve('TIMEOUT');
      }, 5000);
    });

    if (status === 'SUBSCRIBED') {
      console.log('✅ Realtime is working!');
    } else if (status === 'TIMEOUT') {
      console.log('⏱️ Realtime subscription timed out');
    } else {
      console.log('⚠️ Realtime status:', status);
    }

    await supabaseAdmin.removeChannel(channel);

    console.log('\n📋 Instructions to enable Realtime:');
    console.log('1. Go to: https://supabase.com/dashboard/project/bhnqnwsztprgssxekxvz/database/replication');
    console.log('2. Find the "messages" table');
    console.log('3. Enable replication for the "messages" table');
    console.log('4. Save changes');
    console.log('\nℹ️ Note: Even if Realtime is not enabled, the polling fallback will work!');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }

  process.exit(0);
}

checkRealtime();
