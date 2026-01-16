import nodemailer from 'nodemailer';
import { MailtrapTransport } from 'mailtrap';

/**
 * Mailtrap Email Service
 * 
 * This service handles email sending via Mailtrap Email Sending API (production)
 * or Mailtrap Email Testing SMTP (development).
 * 
 * Environment Variables Required:
 * - MAILTRAP_API_TOKEN: Your Mailtrap API token (for production/real emails)
 * - OR use SMTP credentials for testing:
 *   - MAILTRAP_HOST: SMTP host (sandbox.smtp.mailtrap.io for testing)
 *   - MAILTRAP_PORT: SMTP port (usually 2525)
 *   - MAILTRAP_USER: Your Mailtrap username
 *   - MAILTRAP_PASS: Your Mailtrap password
 * - MAILTRAP_FROM_EMAIL: The "from" email address (use Mailtrap demo domain like hello@demomailtrap.co)
 * - MAILTRAP_FROM_NAME: Optional display name for the sender
 */

interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
}

interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Creates and returns a configured nodemailer transporter for Mailtrap
 * Uses API transport for production (real emails) or SMTP for testing
 */
function createMailtrapTransporter() {
  // Priority 1: Use API token for production (real emails)
  const apiToken = process.env.MAILTRAP_API_TOKEN;
  
  if (apiToken) {
    return nodemailer.createTransport(
      MailtrapTransport({
        token: apiToken,
      })
    );
  }

  // Fallback: Use SMTP for testing (catches emails in Mailtrap inbox)
  const host = process.env.MAILTRAP_HOST;
  const port = parseInt(process.env.MAILTRAP_PORT || '2525', 10);
  const user = process.env.MAILTRAP_USER;
  const pass = process.env.MAILTRAP_PASS;

  if (!host || !user || !pass) {
    throw new Error(
      'Mailtrap configuration is incomplete. Please provide either MAILTRAP_API_TOKEN (for production) or SMTP credentials (MAILTRAP_HOST, MAILTRAP_USER, MAILTRAP_PASS) for testing.'
    );
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465, // true for 465, false for other ports
    auth: {
      user,
      pass,
    },
    // Optional: Add TLS options for better compatibility
    tls: {
      rejectUnauthorized: false, // Set to true in production if you have proper SSL certificates
    },
  });
}

/**
 * Sends an email using Mailtrap
 * 
 * @param options - Email options (to, subject, html, text, replyTo)
 * @returns Promise with email result
 */
export async function sendEmail(options: EmailOptions): Promise<EmailResult> {
  try {
    // Validate that we have either API token or SMTP credentials
    const hasApiToken = !!process.env.MAILTRAP_API_TOKEN;
    const hasSmtpCreds = !!(process.env.MAILTRAP_HOST && process.env.MAILTRAP_USER && process.env.MAILTRAP_PASS);
    
    if (!hasApiToken && !hasSmtpCreds) {
      throw new Error('Mailtrap credentials are not configured. Provide MAILTRAP_API_TOKEN or SMTP credentials.');
    }

    // Use Mailtrap demo domain for "from" address when using API token
    // Format: name@demomailtrap.co (Mailtrap provides this domain)
    const fromEmail = process.env.MAILTRAP_FROM_EMAIL || 'hello@demomailtrap.co';
    const fromName = process.env.MAILTRAP_FROM_NAME || 'Real Estate App';

    // Prepare recipients (handle both string and array)
    const recipients = Array.isArray(options.to) ? options.to : [options.to];

    console.log('Sending email via Mailtrap:', {
      from: { address: fromEmail, name: fromName },
      to: recipients,
      subject: options.subject,
      usingApiToken: hasApiToken,
    });

    // Create transporter
    const transporter = createMailtrapTransporter();

    // Send email
    const info = await transporter.sendMail({
      from: {
        address: fromEmail,
        name: fromName,
      },
      to: recipients,
      subject: options.subject,
      text: options.text || stripHtml(options.html),
      html: options.html,
      replyTo: options.replyTo,
    });

    console.log('Email sent successfully:', {
      info,
      messageId: 'messageId' in info ? info.messageId : 'N/A',
      success: 'success' in info ? info.success : 'N/A',
    });

    // Handle different response types (SMTP vs API)
    const messageId = 'messageId' in info ? info.messageId : 
                     'success' in info && info.success ? 'sent' : 
                     undefined;

    return {
      success: true,
      messageId: messageId || 'sent',
    };
  } catch (error) {
    console.error('Error sending email via Mailtrap:', error);
    if (error instanceof Error) {
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
      });
    }
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/**
 * Verifies Mailtrap connection
 * Useful for testing configuration
 */
export async function verifyMailtrapConnection(): Promise<boolean> {
  try {
    const transporter = createMailtrapTransporter();
    await transporter.verify();
    return true;
  } catch (error) {
    console.error('Mailtrap connection verification failed:', error);
    return false;
  }
}

/**
 * Helper function to strip HTML tags for plain text fallback
 */
function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim();
}
