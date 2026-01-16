import { NextRequest, NextResponse } from 'next/server';
import { verifyMailtrapConnection, sendEmail } from '@/lib/email';

/**
 * Test endpoint for Mailtrap configuration
 * GET: Verifies connection
 * POST: Sends a test email
 */
export async function GET(request: NextRequest) {
  try {
    const isConnected = await verifyMailtrapConnection();
    
    if (isConnected) {
      return NextResponse.json({
        success: true,
        message: 'Mailtrap connection verified successfully',
        config: {
          host: process.env.MAILTRAP_HOST ? '✓ Set' : '✗ Missing',
          port: process.env.MAILTRAP_PORT || '587 (default)',
          user: process.env.MAILTRAP_USER ? '✓ Set' : '✗ Missing',
          pass: process.env.MAILTRAP_PASS ? '✓ Set' : '✗ Missing',
          fromEmail: process.env.MAILTRAP_FROM_EMAIL || 'Not set (will use MAILTRAP_USER)',
        },
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          message: 'Failed to verify Mailtrap connection. Check your credentials.',
        },
        { status: 500 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: 'Error verifying Mailtrap connection',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const testEmail = body.email || process.env.BROKER_EMAIL || 'ruslannikolov1@gmail.com';

    const result = await sendEmail({
      to: testEmail,
      subject: 'Test Email from Real Estate App',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              h2 { color: #e10600; }
              .success { background-color: #d4edda; border: 1px solid #c3e6cb; padding: 15px; border-radius: 4px; margin: 20px 0; }
            </style>
          </head>
          <body>
            <div class="container">
              <h2>Test Email</h2>
              <div class="success">
                <strong>✓ Success!</strong> If you're reading this, Mailtrap is configured correctly and emails are being sent successfully.
              </div>
              <p>This is a test email sent from your Real Estate App backend.</p>
              <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
            </div>
          </body>
        </html>
      `,
      text: 'Test Email - If you\'re reading this, Mailtrap is configured correctly and emails are being sent successfully.',
    });

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: `Test email sent successfully to ${testEmail}`,
        messageId: result.messageId,
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          message: 'Failed to send test email',
          error: result.error,
        },
        { status: 500 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: 'Error sending test email',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
