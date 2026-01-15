import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { z } from 'zod';

// Validation schema
const valuationSchema = z.object({
  squareMeters: z.number().positive('Square meters must be a positive number'),
  yearOfConstruction: z.number().int().min(1800).max(new Date().getFullYear() + 1).optional(),
  hasAct16: z.enum(['yes', 'no', 'not-specified'], {
    required_error: 'Act 16 selection is required',
  }),
  hasElevator: z.boolean(),
  floor: z.number().int(),
  city: z.string().min(2, 'City must be at least 2 characters'),
  neighborhood: z.string().min(2, 'Neighborhood must be at least 2 characters'),
  phone: z.string().min(5, 'Phone number is required'),
});

export async function POST(request: NextRequest) {
  try {
    // Check if SMTP2GO is configured
    if (!process.env.SMTP2GO_USERNAME || !process.env.SMTP2GO_PASSWORD) {
      console.error('SMTP2GO credentials are not configured');
      return NextResponse.json(
        { error: 'Email service is not configured' },
        { status: 500 }
      );
    }

    const brokerEmail = process.env.BROKER_EMAIL || 'ruslannikolov1@gmail.com';
    const fromEmail = process.env.SMTP2GO_FROM_EMAIL || brokerEmail;

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

    // Format Act 16 value for display
    const act16Display = data.hasAct16 === 'yes' 
      ? 'Yes' 
      : data.hasAct16 === 'no' 
      ? 'No' 
      : 'Not Specified';

    // Format elevator value for display
    const elevatorDisplay = data.hasElevator ? 'Yes' : 'No';

    // Create email content
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
            <h2>Property Valuation Request</h2>
            <div class="field">
              <div class="label">Square Meters (m²):</div>
              <div class="value">${data.squareMeters}</div>
            </div>
            <div class="field">
              <div class="label">Year of Construction:</div>
              <div class="value">${data.yearOfConstruction || 'Not specified'}</div>
            </div>
            <div class="field">
              <div class="label">Has Act 16 (акт 16):</div>
              <div class="value">${act16Display}</div>
            </div>
            <div class="field">
              <div class="label">Has Elevator:</div>
              <div class="value">${elevatorDisplay}</div>
            </div>
            <div class="field">
              <div class="label">Floor:</div>
              <div class="value">${data.floor}</div>
            </div>
            <div class="field">
              <div class="label">City:</div>
              <div class="value">${data.city}</div>
            </div>
            <div class="field">
              <div class="label">Neighborhood:</div>
              <div class="value">${data.neighborhood}</div>
            </div>
            <div class="field">
              <div class="label">Phone Number:</div>
              <div class="value">${data.phone}</div>
            </div>
          </div>
        </body>
      </html>
    `;

    const emailText = `
Property Valuation Request

Square Meters (m²): ${data.squareMeters}
Year of Construction: ${data.yearOfConstruction || 'Not specified'}
Has Act 16 (акт 16): ${act16Display}
Has Elevator: ${elevatorDisplay}
Floor: ${data.floor}
City: ${data.city}
Neighborhood: ${data.neighborhood}
Phone Number: ${data.phone}
    `.trim();

    // Create SMTP2GO transporter
    const transporter = nodemailer.createTransport({
      host: 'mail.smtp2go.com',
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP2GO_USERNAME,
        pass: process.env.SMTP2GO_PASSWORD,
      },
    });

    // Send email via SMTP2GO
    await transporter.sendMail({
      from: fromEmail,
      to: brokerEmail,
      subject: `Property Valuation Request - ${data.city}`,
      text: emailText,
      html: emailHtml,
    });

    return NextResponse.json(
      { success: true, message: 'Valuation request sent successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error sending valuation email:', error);
    
    // Handle nodemailer specific errors
    if (error instanceof Error) {
      console.error('SMTP2GO error:', error.message);
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
