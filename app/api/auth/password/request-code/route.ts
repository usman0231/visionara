import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { supabaseServer } from '@/lib/supabase/server';
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
  // 6-digit numeric code
  const n = Math.floor(100000 + Math.random() * 900000);
  return String(n);
}

export async function POST(request: NextRequest) {
  try {
    // Require authenticated session
    const cookieStore = await cookies();
    const token = cookieStore.get('sb-access-token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { data: { user }, error } = await supabaseServer.auth.getUser(token);
    if (error || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Ensure user exists in DB
    const dbUser = await User.findByPk(user.id);
    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
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
      return NextResponse.json({ error: 'Too many requests. Try again later.' }, { status: 429 });
    }

    const code = generateCode();
    const codeHash = hashCode(code);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await PasswordResetCode.create({
      userId: dbUser.id,
      codeHash,
      expiresAt,
    });

    const transporter = makeTransport();
    if (!transporter) {
      console.log('PASSWORD REQUEST (dev): sending code', { to: dbUser.email, code });
    } else {
      const from = process.env.SMTP_FROM || process.env.SMTP_USER!;
      const html = `
        <div style="font-family: system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif; line-height:1.6;">
          <h2>Password Change Verification</h2>
          <p>Use the following code to change your password. It expires in 10 minutes.</p>
          <div style="font-size: 24px; font-weight: bold; letter-spacing: 4px;">${code}</div>
          <p>If you did not request this, you can ignore this email.</p>
        </div>
      `;
      await transporter.sendMail({
        from: `"Visionara" <${from}>`,
        to: dbUser.email,
        subject: 'Your password change code',
        html,
        text: `Your password change code is ${code}. It expires in 10 minutes.`,
      });
    }

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error('request-code error:', e);
    return NextResponse.json({ error: 'Failed to send verification code' }, { status: 500 });
  }
}
