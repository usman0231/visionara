// app/api/contact/route.ts
import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { contactEmailHtml } from '@/lib/email/contactEmailHtml';
import { contactEmailText } from '@/lib/email/contactEmailText';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function makeTransport() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) return null;

  return nodemailer.createTransport({
    host,
    port,
    // 587 => STARTTLS (secure false), 465 => implicit TLS (secure true)
    secure: port === 465,
    auth: { user, pass },
    pool: true,
    maxConnections: 3,
    maxMessages: 50,
    socketTimeout: 15_000,
    connectionTimeout: 10_000,
    greetingTimeout: 8_000,
    tls: { rejectUnauthorized: true },
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Normalize projectType from checkbox groups (can arrive as string or array)
    const projectType =
      Array.isArray(body.projectType)
        ? body.projectType
        : body.projectType
        ? [body.projectType]
        : [];

    const transporter = makeTransport();

    // Dev-friendly fallback when SMTP is not configured
    if (!transporter) {
      console.log('CONTACT (dev fallback, no SMTP configured):', { ...body, projectType });
      return NextResponse.json(
        { message: 'Message received (dev mode, no SMTP configured).' },
        { status: 200 }
      );
    }

    const from = process.env.SMTP_FROM || process.env.SMTP_USER!;
    const to = process.env.CONTACT_TO || process.env.SMTP_USER!;

    const html = contactEmailHtml({
      ...body,
      projectType,
      submittedAt: new Date().toISOString(),
      logoUrl:
        process.env.PUBLIC_LOGO_URL ||
        'https://your-domain.com/visionara-logo.png',
    });

    await transporter.sendMail({
      from: `"Visionara Website" <${from}>`,
      to,
      subject: 'New Contact Form Submission',
      html,
      text: contactEmailText({ ...body, projectType }),
      replyTo: body.email,
    });

    return NextResponse.json({ message: 'Thanks! We’ll be in touch.' }, { status: 200 });
  } catch (err: any) {
    console.error('CONTACT_ERROR:', {
      name: err?.name,
      code: err?.code,
      command: err?.command,
      message: err?.message,
      response: err?.response,
    });

    return NextResponse.json(
      { message: 'Failed to send message. Please try again later.' },
      { status: 500 }
    );
  }
}
