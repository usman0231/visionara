// app/api/contact/route.ts
import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { contactEmailHtml } from '@/lib/email/contactEmailHtml';
import { contactEmailText } from '@/lib/email/contactEmailText';
import { ContactSubmission } from '@/lib/db/models';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type ContactFormData = {
  name?: string;
  email?: string;
  company?: string;
  phone?: string;
  serviceType?: string | string[];
  projectType?: string | string[];
  budget?: string;
  timeline?: string;
  message?: string;
};

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
    socketTimeout: 15_000,
    connectionTimeout: 10_000,
    greetingTimeout: 8_000,
    tls: { rejectUnauthorized: true },
  });
}

// Small helper to extract useful fields without using `any`
function extractErrorInfo(e: unknown) {
  if (typeof e === 'string') return { message: e };
  if (e instanceof Error) {
    const extra = e as { code?: unknown; command?: unknown; response?: unknown };
    return {
      name: e.name,
      message: e.message,
      code: typeof extra.code === 'string' ? extra.code : undefined,
      command: typeof extra.command === 'string' ? extra.command : undefined,
      response: typeof extra.response === 'string' ? extra.response : undefined,
    };
  }
  if (e && typeof e === 'object') {
    const o = e as Record<string, unknown>;
    return {
      name: typeof o.name === 'string' ? o.name : undefined,
      message: typeof o.message === 'string' ? o.message : undefined,
      code: typeof o.code === 'string' ? o.code : undefined,
      command: typeof o.command === 'string' ? o.command : undefined,
      response: typeof o.response === 'string' ? o.response : undefined,
    };
  }
  return { message: String(e) };
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as ContactFormData;

    const serviceType = body.serviceType || body.projectType;
    const projectType =
      Array.isArray(serviceType)
        ? serviceType
        : serviceType
        ? [serviceType]
        : [];

    // Save to database
    const submission = await ContactSubmission.create({
      name: body.name || '',
      email: body.email || '',
      company: body.company || null,
      phone: body.phone || null,
      serviceType: projectType.join(', ') || null,
      budget: body.budget || null,
      timeline: body.timeline || null,
      message: body.message || '',
      status: 'pending',
      meta: {
        userAgent: req.headers.get('user-agent'),
        submittedAt: new Date().toISOString(),
      },
    });

    const transporter = makeTransport();

    if (!transporter) {
      console.log('CONTACT (dev fallback, no SMTP configured):', { ...body, projectType, submissionId: submission.id });
      return NextResponse.json(
        { message: 'Message received (dev mode, no SMTP configured).', submissionId: submission.id },
        { status: 200 }
      );
    }

    const from = process.env.SMTP_FROM || process.env.SMTP_USER!;
    const to = process.env.CONTACT_TO || process.env.SMTP_USER!;

    const html = contactEmailHtml({
      ...body,
      projectType,
      submittedAt: new Date().toISOString(),
      logoUrl: process.env.PUBLIC_LOGO_URL || 'https://your-domain.com/visionara-logo.png',
    });

    await transporter.sendMail({
      from: `"Visionara Website" <${from}>`,
      to,
      subject: 'New Contact Form Submission',
      html,
      text: contactEmailText({ ...body, projectType }),
      replyTo: body.email,
    });

    return NextResponse.json({ message: "Thanks! We'll be in touch.", submissionId: submission.id }, { status: 200 });
  } catch (err: unknown) {
    console.error('CONTACT_ERROR:', extractErrorInfo(err));
    return NextResponse.json(
      { message: 'Failed to send message. Please try again later.' },
      { status: 500 }
    );
  }
}
