// Quick test untuk kirim OTP ke email via production backend
const testOTP = async () => {
  console.log('📧 Testing OTP Email via Production Backend\n');
  
  const email = 'mohnurulhaq556@gmail.com';
  console.log(`Target Email: ${email}\n`);
  
  try {
    console.log('⏳ Sending request to production backend...\n');
    
    const response = await fetch('https://teardrop-production.up.railway.app/api/auth/resend-otp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email })
    });
    
    const data = await response.json();
    
    console.log('📬 Response Status:', response.status);
    console.log('📬 Response Data:', JSON.stringify(data, null, 2));
    
    if (data.success) {
      console.log('\n✅ OTP email sent successfully!');
      console.log(`Check inbox: ${email}`);
    } else {
      console.log('\n❌ Failed to send OTP');
      console.log('Error:', data.message);
    }
  } catch (error) {
    console.error('\n❌ Request failed:', error.message);
  }
};

testOTP();
