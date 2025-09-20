import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { supabaseServer } from '@/lib/supabase/server';
import { User, PasswordResetCode } from '@/lib/db/models';
import crypto from 'crypto';
import nodemailer from 'nodemailer';

export const runtime = 'nodejs';

// Create a transporter for sending emails
const createTransporter = () => {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn('SMTP configuration not found, email sending will be simulated');
    return null;
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

export async function POST(request: NextRequest) {
  try {
    // Validate authentication
    const authHeader = request.headers.get('authorization');
    const bearer = authHeader?.startsWith('Bearer ')
      ? authHeader.slice('Bearer '.length)
      : undefined;
    const cookieStore = await cookies();
    const token = bearer || cookieStore.get('sb-access-token')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const { data: { user }, error } = await supabaseServer.auth.getUser(token);
    if (error || !user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { currentPassword } = body;

    if (!currentPassword) {
      return NextResponse.json(
        { error: 'Current password is required' },
        { status: 400 }
      );
    }

    // Get user from database
    const dbUser = await User.findByPk(user.id);
    if (!dbUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Verify current password with Supabase
    const { error: signInError } = await supabaseServer.auth.signInWithPassword({
      email: dbUser.email,
      password: currentPassword,
    });

    if (signInError) {
      return NextResponse.json(
        { error: 'Current password is incorrect' },
        { status: 400 }
      );
    }

    // Generate 6-digit verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const codeHash = crypto.createHash('sha256').update(verificationCode).digest('hex');

    // Set expiration to 15 minutes from now
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 15);

    // Save verification code to database
    await PasswordResetCode.create({
      userId: user.id,
      codeHash,
      expiresAt,
    });

    // Send email with verification code
    const transporter = createTransporter();
    if (transporter) {
      try {
        await transporter.sendMail({
          from: process.env.SMTP_USER,
          to: dbUser.email,
          subject: 'Visionara - Password Change Verification',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #1f2937;">Password Change Verification</h2>
              <p>Hello ${dbUser.displayName || 'User'},</p>
              <p>You have requested to change your password. Please use the verification code below:</p>
              <div style="background-color: #f3f4f6; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
                <h1 style="color: #1f2937; font-size: 32px; letter-spacing: 4px; margin: 0;">${verificationCode}</h1>
              </div>
              <p><strong>This code will expire in 15 minutes.</strong></p>
              <p>If you did not request this password change, please ignore this email and contact support.</p>
              <p>Best regards,<br>The Visionara Team</p>
            </div>
          `,
          text: `
            Password Change Verification

            Hello ${dbUser.displayName || 'User'},

            You have requested to change your password. Please use the verification code below:

            ${verificationCode}

            This code will expire in 15 minutes.

            If you did not request this password change, please ignore this email and contact support.

            Best regards,
            The Visionara Team
          `,
        });
      } catch (emailError) {
        console.error('Failed to send verification email:', emailError);
        // Continue anyway - the code is still saved in database
      }
    } else {
      // For development, log the verification code
      console.log(`🔐 Password change verification code for ${dbUser.email}: ${verificationCode}`);
    }

    return NextResponse.json({
      message: 'Verification code sent to your email',
      // In development, include the code in response for testing
      ...(process.env.NODE_ENV === 'development' && { verificationCode }),
    });

  } catch (error: any) {
    console.error('Password change request error:', error);
    return NextResponse.json(
      { error: 'Failed to process password change request', details: error.message },
      { status: 500 }
    );
  }
}