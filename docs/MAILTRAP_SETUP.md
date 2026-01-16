# Mailtrap Email Setup Guide

This guide will walk you through setting up Mailtrap for sending emails from your Real Estate App backend.

## Overview

Mailtrap offers two services:
1. **Email Testing** (sandbox) - Catches emails in development, perfect for testing
2. **Email Sending** (production) - Actually sends emails to real recipients

We'll set up both so you can test in development and send real emails in production.

---

## Step 1: Create a Mailtrap Account

1. Go to [https://mailtrap.io](https://mailtrap.io)
2. Click **"Sign Up"** (top right)
3. Sign up with:
   - Email address
   - Password
   - Or use GitHub/Google OAuth

---

## Step 2: Set Up Email Testing (Development)

This is for catching emails during development - emails won't actually be sent.

### 2.1 Access Email Testing

1. After logging in, you'll see the **"Email Testing"** section
2. Click on **"Inboxes"** in the left sidebar
3. You should see a default inbox (e.g., "My Inbox")
4. Click on the inbox name

### 2.2 Get SMTP Credentials

1. In the inbox settings, go to the **"SMTP Settings"** tab
2. Select **"Nodemailer"** from the integration dropdown
3. You'll see credentials like:
   ```
   Host: sandbox.smtp.mailtrap.io
   Port: 2525 (or 587)
   Username: [your-username]
   Password: [your-password]
   ```

### 2.3 Copy These Credentials

Keep these for your `.env.local` file (we'll add them in Step 4).

---

## Step 3: Set Up Email Sending (Production)

This is for actually sending emails to real recipients.

### 3.1 Enable Email Sending

1. In Mailtrap dashboard, click **"Email Sending"** in the left sidebar
2. If you haven't set it up yet, click **"Get Started"** or **"Add Domain"**

### 3.2 Choose Your Plan

- **Free Plan**: 500 emails/month, 2 emails/second
- **Paid Plans**: More emails and higher limits

For a single recipient, the free plan should be sufficient.

### 3.3 Add Your Sending Domain (Optional but Recommended)

**Option A: Use Mailtrap's Shared Domain (Quick Setup)**
- Mailtrap provides a shared domain (e.g., `mailtrap.io`)
- Quick to set up, but emails come from `yourname@mailtrap.io`
- Good for testing and low-volume sending

**Option B: Use Your Own Domain (Production Ready)**
- Add your own domain (e.g., `yourdomain.com`)
- Requires DNS configuration (SPF, DKIM records)
- Better deliverability and branding
- Follow Mailtrap's domain verification guide

### 3.4 Get SMTP Credentials for Email Sending

1. Go to **"Email Sending"** → **"SMTP Settings"**
2. You'll see:
   ```
   Host: live.smtp.mailtrap.io
   Port: 587 (or 2525)
   Username: [your-api-token]
   Password: [your-api-token]
   ```
   Note: For Email Sending, username and password are the same (your API token)

3. **Copy these credentials** - they're different from Email Testing credentials

### 3.5 Verify Your "From" Email Address

1. Go to **"Email Sending"** → **"Domains & Addresses"**
2. If using shared domain, verify your email address:
   - Click **"Verify Email"**
   - Enter your email (e.g., `ruslannikolov1@gmail.com`)
   - Check your inbox for verification email
   - Click the verification link
3. If using your own domain, follow the domain verification process

---

## Step 4: Configure Environment Variables

Add the following to your `.env.local` file in the project root:

### For Development (Email Testing - Catches Emails)

```env
# Mailtrap Email Testing (Development)
# Use these when you want to catch emails in Mailtrap inbox
MAILTRAP_HOST=sandbox.smtp.mailtrap.io
MAILTRAP_PORT=2525
MAILTRAP_USER=your-testing-username-here
MAILTRAP_PASS=your-testing-password-here
MAILTRAP_FROM_EMAIL=ruslannikolov1@gmail.com
MAILTRAP_FROM_NAME=Real Estate App
```

### For Production (Email Sending - Real Emails)

```env
# Mailtrap Email Sending (Production)
# Use these when you want to send real emails
MAILTRAP_HOST=live.smtp.mailtrap.io
MAILTRAP_PORT=587
MAILTRAP_USER=your-api-token-here
MAILTRAP_PASS=your-api-token-here
MAILTRAP_FROM_EMAIL=ruslannikolov1@gmail.com
MAILTRAP_FROM_NAME=Real Estate App

# Recipient email (where valuation requests go)
BROKER_EMAIL=ruslannikolov1@gmail.com
```

### Important Notes:

1. **For Development**: Use Email Testing credentials (sandbox.smtp.mailtrap.io)
   - Emails will be caught in your Mailtrap inbox
   - Perfect for testing without sending real emails

2. **For Production**: Use Email Sending credentials (live.smtp.mailtrap.io)
   - Emails will be sent to real recipients
   - Make sure your "from" email is verified

3. **Switching Between Modes**: 
   - Change `MAILTRAP_HOST` between `sandbox.smtp.mailtrap.io` and `live.smtp.mailtrap.io`
   - Update credentials accordingly

4. **Security**: 
   - Never commit `.env.local` to git (it should be in `.gitignore`)
   - Keep your API tokens secret

---

## Step 5: Test Your Configuration

### 5.1 Test Connection

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Test the connection by visiting:
   ```
   http://localhost:3000/api/email/test
   ```
   Or use curl:
   ```bash
   curl http://localhost:3000/api/email/test
   ```

   You should see a JSON response indicating if the connection is successful.

### 5.2 Send a Test Email

**Option A: Using the Test Endpoint**

Send a POST request to test email sending:

```bash
curl -X POST http://localhost:3000/api/email/test \
  -H "Content-Type: application/json" \
  -d '{"email": "your-email@example.com"}'
```

**Option B: Using the Valuation Form**

1. Go to your valuation page in the app
2. Fill out the form
3. Submit it
4. Check:
   - **Development mode**: Check your Mailtrap Email Testing inbox
   - **Production mode**: Check the recipient's email inbox

### 5.3 Verify in Mailtrap Dashboard

**For Email Testing:**
1. Go to Mailtrap → Email Testing → Inboxes
2. Open your inbox
3. You should see the test email there

**For Email Sending:**
1. Go to Mailtrap → Email Sending → Logs
2. You should see sent emails and their status

---

## Step 6: Production Deployment

### 6.1 Vercel (Recommended)

1. Go to your Vercel project settings
2. Navigate to **"Environment Variables"**
3. Add all the Mailtrap production variables:
   - `MAILTRAP_HOST=live.smtp.mailtrap.io`
   - `MAILTRAP_PORT=587`
   - `MAILTRAP_USER=your-api-token`
   - `MAILTRAP_PASS=your-api-token`
   - `MAILTRAP_FROM_EMAIL=your-verified-email@example.com`
   - `MAILTRAP_FROM_NAME=Real Estate App`
   - `BROKER_EMAIL=ruslannikolov1@gmail.com`

4. **Important**: Set these for **Production** environment (not Preview/Development)

5. Redeploy your application

### 6.2 Other Hosting Platforms

Follow similar steps:
1. Add environment variables in your hosting platform's dashboard
2. Use production Mailtrap credentials (live.smtp.mailtrap.io)
3. Ensure your "from" email is verified
4. Redeploy

---

## Troubleshooting

### Issue: "Mailtrap credentials are not configured"

**Solution**: Check that all required environment variables are set:
- `MAILTRAP_HOST`
- `MAILTRAP_USER`
- `MAILTRAP_PASS`

### Issue: "Connection verification failed"

**Possible causes:**
1. Wrong credentials - double-check username/password
2. Wrong host - make sure you're using the correct host (sandbox vs live)
3. Wrong port - try 587, 2525, or 465
4. Network/firewall blocking SMTP ports

**Solution**: 
- Verify credentials in Mailtrap dashboard
- Try the test endpoint: `GET /api/email/test`
- Check Mailtrap logs for connection attempts

### Issue: "Emails not arriving"

**For Email Testing:**
- Check your Mailtrap inbox (Email Testing → Inboxes)
- Emails should appear there, not in real inboxes

**For Email Sending:**
- Check spam/junk folder
- Verify your "from" email is verified in Mailtrap
- Check Mailtrap Email Sending → Logs for delivery status
- Ensure you're using `live.smtp.mailtrap.io` (not sandbox)

### Issue: "Authentication failed"

**Solution**:
- For Email Testing: Use the username/password from SMTP Settings
- For Email Sending: Username and password should be the same (your API token)
- Make sure there are no extra spaces in environment variables

### Issue: "Rate limit exceeded"

**Solution**:
- Free plan: 2 emails/second, 500 emails/month
- Upgrade plan or wait for rate limit to reset
- Check Mailtrap dashboard for usage stats

---

## Quick Reference

### Environment Variables Summary

```env
# Required
MAILTRAP_HOST=sandbox.smtp.mailtrap.io  # or live.smtp.mailtrap.io
MAILTRAP_PORT=587                        # or 2525
MAILTRAP_USER=your-username-or-token
MAILTRAP_PASS=your-password-or-token

# Optional
MAILTRAP_FROM_EMAIL=your-email@example.com
MAILTRAP_FROM_NAME=Real Estate App
BROKER_EMAIL=recipient@example.com
```

### API Endpoints

- `GET /api/email/test` - Verify Mailtrap connection
- `POST /api/email/test` - Send a test email
- `POST /api/valuation` - Send valuation request email

### Mailtrap Dashboard Links

- Email Testing: https://mailtrap.io/inboxes
- Email Sending: https://mailtrap.io/sending
- SMTP Settings: https://mailtrap.io/api-tokens

---

## Next Steps

1. ✅ Set up Mailtrap account
2. ✅ Configure environment variables
3. ✅ Test connection and send test email
4. ✅ Verify emails are being received
5. ✅ Deploy to production with production credentials

---

## Support

- Mailtrap Documentation: https://mailtrap.io/docs
- Mailtrap Support: support@mailtrap.io
- Mailtrap Community: https://community.mailtrap.io
