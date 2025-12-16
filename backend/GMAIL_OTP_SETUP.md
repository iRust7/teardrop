# Gmail OTP Setup Guide

To enable OTP emails in Teardrop Chat, you need to configure a Gmail App Password.

## 1. Enable 2-Step Verification
1. Go to your [Google Account Security settings](https://myaccount.google.com/security).
2. Under "How you sign in to Google", select **2-Step Verification**.
3. Follow the steps to enable it if not already enabled.

## 2. Create an App Password
1. Go back to the [Security page](https://myaccount.google.com/security).
2. Search for "App passwords" in the search bar at the top, or look for it under "How you sign in to Google" (you might need to click on 2-Step Verification first to see it at the bottom).
3. Click **App passwords**.
4. Enter a name for the app (e.g., "Teardrop Chat").
5. Click **Create**.
6. Copy the 16-character password generated (spaces don't matter).

## 3. Configure Environment Variables
Update your `.env` file in the `backend` folder:

```env
GMAIL_USER=your.email@gmail.com
GMAIL_APP_PASSWORD=xxxx xxxx xxxx xxxx
```

Replace `your.email@gmail.com` with your Gmail address and the password with the App Password you just generated.

## Troubleshooting
- **Connection Timeout**: Check your internet connection. Some ISPs block email ports.
- **Authentication Failed**: Ensure you are using an App Password, NOT your regular Gmail password.
- **Antivirus/Firewall**: Temporarily disable antivirus or firewall that might be blocking email sending.
