// Test script untuk verifikasi Gmail SMTP
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const testEmail = async () => {
  console.log('\n🔍 Testing Gmail SMTP Configuration...\n');
  
  console.log('📧 Email:', process.env.GMAIL_USER);
  console.log('🔑 Password:', process.env.GMAIL_APP_PASSWORD ? `${process.env.GMAIL_APP_PASSWORD.substring(0, 4)}****${process.env.GMAIL_APP_PASSWORD.slice(-4)}` : 'NOT SET');
  console.log('');

  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
    family: 4,
    logger: true,
    debug: true
  });

  try {
    console.log('⏳ Verifying connection...\n');
    await transporter.verify();
    console.log('\n✅ Connection verified successfully!\n');
    
    console.log('⏳ Sending test email...\n');
    const info = await transporter.sendMail({
      from: `"Teardrop Chat Test" <${process.env.GMAIL_USER}>`,
      to: process.env.GMAIL_USER, // Send to self
      subject: '✨ Test Email - Teardrop Chat OTP',
      text: 'If you receive this email, your Gmail SMTP configuration is working correctly!',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px;">
          <h2 style="color: #4CAF50;">✅ Success!</h2>
          <p>Your Gmail SMTP configuration is working correctly.</p>
          <p><strong>Configuration:</strong></p>
          <ul>
            <li>Email: ${process.env.GMAIL_USER}</li>
            <li>SMTP: smtp.gmail.com:465</li>
            <li>Status: Connected</li>
          </ul>
          <p style="color: #666; font-size: 12px; margin-top: 30px;">
            Teardrop Chat - Email Service Test
          </p>
        </div>
      `
    });

    console.log('\n✅ Email sent successfully!');
    console.log('📬 Message ID:', info.messageId);
    console.log('\n🎉 Gmail SMTP is working! Check your inbox:', process.env.GMAIL_USER);
  } catch (error) {
    console.error('\n❌ Test failed!');
    console.error('Error:', error.message);
    
    if (error.message.includes('Invalid login')) {
      console.error('\n⚠️  App Password tidak valid!');
      console.error('');
      console.error('Solusi:');
      console.error('1. Pastikan 2-Step Verification sudah aktif di akun Gmail');
      console.error('2. Buat App Password baru di: https://myaccount.google.com/apppasswords');
      console.error('3. Update GMAIL_APP_PASSWORD di file .env (16 karakter tanpa spasi)');
      console.error('4. Lihat TROUBLESHOOTING_GMAIL.md untuk panduan lengkap');
    } else if (error.message.includes('timeout')) {
      console.error('\n⚠️  Connection timeout!');
      console.error('Coba:');
      console.error('1. Cek koneksi internet');
      console.error('2. Matikan firewall/antivirus sementara');
      console.error('3. Coba gunakan jaringan lain');
    }
  }
  
  process.exit(0);
};

testEmail();
