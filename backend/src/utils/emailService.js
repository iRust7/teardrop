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
    // Add timeout to prevent hanging
    connectionTimeout: 10000, // 10 seconds
    greetingTimeout: 5000, // 5 seconds
    socketTimeout: 15000, // 15 seconds
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
      subject: '✨ Your Verification Code - Teardrop Chat',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              padding: 40px 20px;
              line-height: 1.6;
            }
            .email-container {
              max-width: 600px;
              margin: 0 auto;
              background: #ffffff;
              border-radius: 24px;
              overflow: hidden;
              box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            }
            .header {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              padding: 50px 40px;
              text-align: center;
              color: white;
            }
            .logo {
              font-size: 48px;
              margin-bottom: 15px;
              animation: float 3s ease-in-out infinite;
            }
            @keyframes float {
              0%, 100% { transform: translateY(0px); }
              50% { transform: translateY(-10px); }
            }
            .header h1 {
              font-size: 32px;
              font-weight: 700;
              margin-bottom: 10px;
              letter-spacing: -0.5px;
            }
            .header p {
              font-size: 16px;
              opacity: 0.95;
              font-weight: 300;
            }
            .content {
              padding: 50px 40px;
            }
            .greeting {
              font-size: 18px;
              color: #2d3748;
              margin-bottom: 25px;
            }
            .otp-section {
              background: linear-gradient(135deg, #f6f8fb 0%, #e9ecf5 100%);
              border-radius: 16px;
              padding: 40px;
              text-align: center;
              margin: 35px 0;
              border: 2px solid #e2e8f0;
            }
            .otp-label {
              font-size: 14px;
              color: #718096;
              text-transform: uppercase;
              letter-spacing: 1.5px;
              font-weight: 600;
              margin-bottom: 20px;
            }
            .otp-code {
              font-size: 52px;
              font-weight: 800;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              -webkit-background-clip: text;
              -webkit-text-fill-color: transparent;
              background-clip: text;
              letter-spacing: 12px;
              margin: 15px 0;
              font-family: 'Courier New', monospace;
            }
            .otp-expires {
              display: inline-block;
              background: #fff;
              color: #e53e3e;
              padding: 10px 20px;
              border-radius: 25px;
              font-size: 13px;
              font-weight: 600;
              margin-top: 20px;
              box-shadow: 0 4px 12px rgba(229, 62, 62, 0.15);
            }
            .message {
              color: #4a5568;
              font-size: 16px;
              line-height: 1.8;
              margin: 25px 0;
            }
            .security-notice {
              background: #fff5f5;
              border-left: 4px solid #fc8181;
              padding: 20px;
              border-radius: 8px;
              margin: 30px 0;
            }
            .security-notice p {
              color: #742a2a;
              font-size: 14px;
              line-height: 1.6;
            }
            .security-notice strong {
              color: #c53030;
            }
            .footer {
              background: #f7fafc;
              padding: 40px;
              text-align: center;
              border-top: 1px solid #e2e8f0;
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
          <div class="email-container">
            <div class="header">
              <div class="logo">💬</div>
              <h1>Teardrop Chat</h1>
              <p>Secure Email Verification</p>
            </div>
            
            <div class="content">
              <div class="greeting">
                Hello! 👋
              </div>
              
              <p class="message">
                Thank you for joining <strong>Teardrop Chat</strong>. 
                To complete your registration, please use the verification code below:
              </p>

              <div class="otp-section">
                <div class="otp-label">Your Verification Code</div>
                <div class="otp-code">${otpCode}</div>
                <div class="otp-expires">⏱ Expires in 10 minutes</div>
              </div>

              <p class="message">
                Enter this code in the registration form to verify your email address and complete your account setup.
              </p>

              <div class="security-notice">
                <p>
                  <strong>🔒 Security Notice:</strong><br>
                  Never share this code with anyone. Teardrop Chat will never ask you for this code via phone, email, or any other method. If you didn't request this code, please ignore this email.
                </p>
              </div>
            </div>

            <div class="footer">
              <p class="footer-text" style="color: #a0aec0; font-size: 13px; line-height: 1.8; margin: 0;">
                This is an automated message, please do not reply.<br>
                <strong style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">Teardrop Chat</strong> - Secure Messaging Platform<br>
                © 2024 Teardrop Chat. All rights reserved.
              </p>
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

    // Add timeout promise to prevent hanging
    const sendMailPromise = transporter.sendMail(mailOptions);
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Email send timeout after 15s')), 15000)
    );
    
    const info = await Promise.race([sendMailPromise, timeoutPromise]);
    console.log(`[EMAIL] ✅ OTP sent to ${toEmail}: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('[EMAIL] ❌ Failed to send OTP:', error.message);
    // More specific error messages
    if (error.message.includes('timeout')) {
      throw new Error('Email service timeout. Please try again.');
    } else if (error.message.includes('auth') || error.message.includes('Invalid')) {
      throw new Error('Email configuration error. Please contact support.');
    }
    throw new Error('Failed to send email. Please try again later.');
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
