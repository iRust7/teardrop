import nodemailer from 'nodemailer';

/**
 * Email Service untuk mengirim OTP via Gmail
 */

// Konfigurasi transporter untuk Gmail
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });
};

/**
 * Kirim OTP ke email user
 */
export const sendOTPEmail = async (toEmail, otpCode) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: `"Teardrop Chat" <${process.env.GMAIL_USER}>`,
      to: toEmail,
      subject: '🔐 Kode OTP Login Teardrop Chat',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              background-color: #f4f4f4;
              margin: 0;
              padding: 20px;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              background-color: #ffffff;
              border-radius: 10px;
              padding: 30px;
              box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
            }
            .header h1 {
              color: #4F46E5;
              margin: 0;
              font-size: 28px;
            }
            .otp-box {
              background-color: #F3F4F6;
              border: 2px dashed #4F46E5;
              border-radius: 8px;
              padding: 20px;
              text-align: center;
              margin: 30px 0;
            }
            .otp-code {
              font-size: 36px;
              font-weight: bold;
              color: #4F46E5;
              letter-spacing: 8px;
              margin: 10px 0;
            }
            .message {
              color: #6B7280;
              line-height: 1.6;
              font-size: 16px;
            }
            .footer {
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #E5E7EB;
              text-align: center;
              color: #9CA3AF;
              font-size: 14px;
            }
            .warning {
              background-color: #FEF2F2;
              border-left: 4px solid #EF4444;
              padding: 15px;
              margin: 20px 0;
              border-radius: 4px;
            }
            .warning p {
              margin: 0;
              color: #991B1B;
              font-size: 14px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>💬 Teardrop Chat</h1>
            </div>
            
            <p class="message">Halo,</p>
            <p class="message">Kamu menerima email ini karena meminta kode OTP untuk login ke Teardrop Chat.</p>
            
            <div class="otp-box">
              <p style="margin: 0; color: #6B7280; font-size: 14px;">KODE OTP KAMU:</p>
              <div class="otp-code">${otpCode}</div>
              <p style="margin: 0; color: #6B7280; font-size: 14px;">Berlaku selama 10 menit</p>
            </div>
            
            <p class="message">Masukkan kode ini di halaman login untuk melanjutkan.</p>
            
            <div class="warning">
              <p><strong>⚠️ Peringatan Keamanan:</strong></p>
              <p>Jangan bagikan kode ini kepada siapapun. Tim Teardrop Chat tidak akan pernah meminta kode OTP kamu.</p>
            </div>
            
            <p class="message">Jika kamu tidak meminta kode ini, abaikan email ini.</p>
            
            <div class="footer">
              <p>Email ini dikirim otomatis dari Teardrop Chat</p>
              <p>© ${new Date().getFullYear()} Teardrop Chat. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
Teardrop Chat - Kode OTP Login

Kode OTP kamu adalah: ${otpCode}

Kode ini berlaku selama 10 menit.
Masukkan kode ini di halaman login untuk melanjutkan.

JANGAN BAGIKAN kode ini kepada siapapun!

Jika kamu tidak meminta kode ini, abaikan email ini.

© ${new Date().getFullYear()} Teardrop Chat
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`[EMAIL] OTP sent to ${toEmail}: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('[EMAIL] Failed to send OTP:', error);
    throw new Error('Gagal mengirim email OTP');
  }
};

/**
 * Test email configuration
 */
export const testEmailConnection = async () => {
  try {
    const transporter = createTransporter();
    await transporter.verify();
    console.log('[EMAIL] Gmail connection verified successfully');
    return true;
  } catch (error) {
    console.error('[EMAIL] Gmail connection failed:', error.message);
    return false;
  }
};
