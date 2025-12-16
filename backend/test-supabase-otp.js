/**
 * Test Supabase Auth OTP - Direct Test
 * 
 * This tests Supabase Auth email OTP functionality
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

const testEmail = 'setyafiky@gmail.com'; // Change this to your test email

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('🧪 Testing Supabase Auth OTP');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

async function testOTP() {
  try {
    console.log(`📧 Sending OTP to: ${testEmail}`);
    console.log('🔍 Testing with shouldCreateUser: true first...\n');
    
    const { data, error } = await supabase.auth.signInWithOtp({
      email: testEmail,
      options: {
        shouldCreateUser: true, // Try with true first
      }
    });

    if (error) {
      console.error('❌ Error:', error.message);
      console.error('Details:', error);
      process.exit(1);
    }

    console.log('✅ OTP sent successfully!');
    console.log('📬 Check your email:', testEmail);
    console.log('\n💡 Tips:');
    console.log('   - Check spam/junk folder if not in inbox');
    console.log('   - Email should arrive within 1-2 minutes');
    console.log('   - OTP expires after 1 hour');
    console.log('   - Rate limit: 4 OTPs per hour per email');
    
  } catch (err) {
    console.error('❌ Unexpected error:', err);
    process.exit(1);
  }
}

testOTP();
