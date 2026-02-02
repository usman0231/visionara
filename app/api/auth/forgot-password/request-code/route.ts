import { NextRequest, NextResponse } from 'next/server';
import { PasswordResetCode, User } from '@/lib/db/models';
import { Op } from 'sequelize';
import crypto from 'crypto';
import nodemailer from 'nodemailer';

export const runtime = 'nodejs';

function makeTransport() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) return null;

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
    pool: true,
    maxConnections: 3,
    maxMessages: 50,
    socketTimeout: 15000,
    connectionTimeout: 10000,
    greetingTimeout: 8000,
    tls: { rejectUnauthorized: true },
  });
}

function hashCode(code: string) {
  return crypto.createHash('sha256').update(code).digest('hex');
}

function generateCode(): string {
  const n = Math.floor(100000 + Math.random() * 900000);
  return String(n);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email = (body?.email || '').toString().trim().toLowerCase();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Find user by email
    const dbUser = await User.findOne({ where: { email } });
    if (!dbUser) {
      return NextResponse.json({ error: 'No account found with this email address' }, { status: 404 });
    }

    // Throttle: limit to 3 codes per 10 minutes
    const windowMs = 10 * 60 * 1000;
    const since = new Date(Date.now() - windowMs);
    const recentCount = await PasswordResetCode.count({
      where: {
        userId: dbUser.id,
        createdAt: { [Op.gte]: since },
      },
    });

    if (recentCount >= 3) {
      return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 });
    }

    const code = generateCode();
    const codeHash = hashCode(code);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    console.log('Creating password reset code for user:', dbUser.id, 'code:', code);

    await PasswordResetCode.create({
      userId: dbUser.id,
      codeHash,
      expiresAt,
    });

    console.log('Password reset code created successfully');

    const transporter = makeTransport();
    if (!transporter) {
      console.log('FORGOT PASSWORD (dev): sending code', { to: dbUser.email, code });
    } else {
      const from = process.env.SMTP_FROM || process.env.SMTP_USER!;
      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; background-color: #0a0a0a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
          <table role="presentation" style="width: 100%; border-collapse: collapse;">
            <tr>
              <td align="center" style="padding: 40px 20px;">
                <table role="presentation" style="max-width: 480px; width: 100%; border-collapse: collapse;">
                  <!-- Logo/Header -->
                  <tr>
                    <td align="center" style="padding-bottom: 32px;">
                      <h1 style="margin: 0; font-size: 28px; font-weight: 700; color: #ffffff; letter-spacing: -0.5px;">Visionara</h1>
                    </td>
                  </tr>

                  <!-- Main Content Card -->
                  <tr>
                    <td style="background: linear-gradient(145deg, #1a1a2e 0%, #16162a 100%); border-radius: 16px; padding: 40px 32px; border: 1px solid rgba(139, 92, 246, 0.2);">
                      <!-- Icon -->
                      <table role="presentation" style="width: 100%; border-collapse: collapse;">
                        <tr>
                          <td align="center" style="padding-bottom: 24px;">
                            <table role="presentation" style="border-collapse: collapse; margin: 0 auto;">
                              <tr>
                                <td align="center" valign="middle" style="width: 64px; height: 64px; background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%); border-radius: 50%; text-align: center; vertical-align: middle;">
                                  <span style="font-size: 28px; line-height: 64px;">&#128274;</span>
                                </td>
                              </tr>
                            </table>
                          </td>
                        </tr>

                        <!-- Title -->
                        <tr>
                          <td align="center" style="padding-bottom: 16px;">
                            <h2 style="margin: 0; font-size: 24px; font-weight: 600; color: #ffffff;">Password Reset</h2>
                          </td>
                        </tr>

                        <!-- Description -->
                        <tr>
                          <td align="center" style="padding-bottom: 32px;">
                            <p style="margin: 0; font-size: 15px; line-height: 1.6; color: #a1a1aa;">
                              We received a request to reset your password. Use the verification code below to proceed.
                            </p>
                          </td>
                        </tr>

                        <!-- OTP Code -->
                        <tr>
                          <td align="center" style="padding-bottom: 32px;">
                            <div style="background: rgba(139, 92, 246, 0.1); border: 2px dashed rgba(139, 92, 246, 0.4); border-radius: 12px; padding: 24px 32px;">
                              <span style="font-size: 36px; font-weight: 700; letter-spacing: 8px; color: #a78bfa; font-family: 'Courier New', monospace;">${code}</span>
                            </div>
                          </td>
                        </tr>

                        <!-- Expiry Notice -->
                        <tr>
                          <td align="center" style="padding-bottom: 24px;">
                            <p style="margin: 0; font-size: 13px; color: #71717a;">
                              This code expires in <strong style="color: #a78bfa;">10 minutes</strong>
                            </p>
                          </td>
                        </tr>

                        <!-- Security Notice -->
                        <tr>
                          <td style="background: rgba(251, 191, 36, 0.1); border-radius: 8px; padding: 16px;">
                            <p style="margin: 0; font-size: 13px; line-height: 1.5; color: #fbbf24; text-align: center;">
                              &#9888; If you didn't request this, please ignore this email or contact support if you have concerns.
                            </p>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td align="center" style="padding-top: 32px;">
                      <p style="margin: 0; font-size: 12px; color: #52525b;">
                        &copy; ${new Date().getFullYear()} Visionara. All rights reserved.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `;
      await transporter.sendMail({
        from: `"Visionara" <${from}>`,
        to: dbUser.email,
        subject: 'Password Reset - Your Verification Code',
        html,
        text: `Your Visionara password reset code is ${code}. It expires in 10 minutes. If you didn't request this, please ignore this email.`,
      });
    }

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error('forgot-password request-code error:', e);
    return NextResponse.json({ error: 'Failed to send verification code' }, { status: 500 });
  }
}
