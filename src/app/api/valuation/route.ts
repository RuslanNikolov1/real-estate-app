import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { sendEmail } from '@/lib/email';

// Validation schema
const valuationSchema = z.object({
  squareMeters: z.number().positive('Square meters must be a positive number'),
  yearOfConstruction: z.number().int().min(1800).max(new Date().getFullYear() + 1).optional(),
  hasAct16: z.enum(['yes', 'no', 'not-specified'], {
    required_error: 'Act 16 selection is required',
  }),
  hasElevator: z.enum(['yes', 'no'], {
    required_error: 'Elevator selection is required',
  }),
  floor: z.number().int(),
  city: z.string().min(2, 'City must be at least 2 characters'),
  neighborhood: z.string().min(2, 'Neighborhood must be at least 2 characters'),
  phone: z.string().min(5, 'Phone number is required'),
});

export async function POST(request: NextRequest) {
  try {
    // Check if Mailtrap is configured (either API token or SMTP credentials)
    const hasApiToken = !!process.env.MAILTRAP_API_TOKEN;
    const hasSmtpCreds = !!(process.env.MAILTRAP_HOST && process.env.MAILTRAP_USER && process.env.MAILTRAP_PASS);
    
    if (!hasApiToken && !hasSmtpCreds) {
      console.error('Mailtrap credentials are not configured');
      return NextResponse.json(
        { error: 'Email service is not configured. Provide MAILTRAP_API_TOKEN or SMTP credentials.' },
        { status: 500 }
      );
    }

    const brokerEmail = process.env.BROKER_EMAIL || 'ruslannikolov1@gmail.com';

    // Parse request body
    const body = await request.json();

    // Validate input
    const validationResult = valuationSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Validation failed',
          details: validationResult.error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message,
          })),
        },
        { status: 400 }
      );
    }

    const data = validationResult.data;

    // Format Act 16 value for display (Bulgarian)
    const act16Display = data.hasAct16 === 'yes' 
      ? 'Да' 
      : data.hasAct16 === 'no' 
      ? 'Не' 
      : 'Не е посочено';

    // Format elevator value for display (Bulgarian)
    const elevatorDisplay = data.hasElevator === 'yes' ? 'Да' : 'Не';

    // Create email content (Bulgarian)
    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            h2 { color: #e10600; border-bottom: 2px solid #e10600; padding-bottom: 10px; }
            .field { margin-bottom: 15px; }
            .label { font-weight: bold; color: #555; }
            .value { margin-top: 5px; padding: 8px; background-color: #f5f5f5; border-radius: 4px; }
          </style>
        </head>
        <body>
          <div class="container">
            <h2>Заявка за оценка на имот</h2>
            <div class="field">
              <div class="label">Квадратни метри (м²):</div>
              <div class="value">${data.squareMeters}</div>
            </div>
            <div class="field">
              <div class="label">Година на строителство:</div>
              <div class="value">${data.yearOfConstruction || 'Не е посочено'}</div>
            </div>
            <div class="field">
              <div class="label">Има акт 16:</div>
              <div class="value">${act16Display}</div>
            </div>
            <div class="field">
              <div class="label">Има асансьор:</div>
              <div class="value">${elevatorDisplay}</div>
            </div>
            <div class="field">
              <div class="label">Етаж:</div>
              <div class="value">${data.floor}</div>
            </div>
            <div class="field">
              <div class="label">Град:</div>
              <div class="value">${data.city}</div>
            </div>
            <div class="field">
              <div class="label">Квартал:</div>
              <div class="value">${data.neighborhood}</div>
            </div>
            <div class="field">
              <div class="label">Телефонен номер:</div>
              <div class="value">${data.phone}</div>
            </div>
          </div>
        </body>
      </html>
    `;

    const emailText = `
Заявка за оценка на имот

Квадратни метри (м²): ${data.squareMeters}
Година на строителство: ${data.yearOfConstruction || 'Не е посочено'}
Има акт 16: ${act16Display}
Има асансьор: ${elevatorDisplay}
Етаж: ${data.floor}
Град: ${data.city}
Квартал: ${data.neighborhood}
Телефонен номер: ${data.phone}
    `.trim();

    // Send email via Mailtrap
    const emailResult = await sendEmail({
      to: brokerEmail,
      subject: `Заявка за оценка на имот - ${data.city}`,
      text: emailText,
      html: emailHtml,
    });

    if (!emailResult.success) {
      throw new Error(emailResult.error || 'Failed to send email');
    }

    return NextResponse.json(
      { success: true, message: 'Valuation request sent successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error sending valuation email:', error);
    
    // Handle email service errors
    if (error instanceof Error) {
      console.error('Mailtrap error:', error.message);
    }

    return NextResponse.json(
      { 
        error: 'Failed to send valuation request',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
