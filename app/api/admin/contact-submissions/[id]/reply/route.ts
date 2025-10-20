import { NextRequest, NextResponse } from 'next/server';
import { ContactSubmission } from '@/lib/db/models';
import nodemailer from 'nodemailer';
import { generateReplyEmailHTML, generateReplyEmailText } from '@/lib/email/replyTemplate';

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
    socketTimeout: 15_000,
    connectionTimeout: 10_000,
    greetingTimeout: 8_000,
    tls: { rejectUnauthorized: true },
  });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { replyMessage } = body;

    if (!replyMessage) {
      return NextResponse.json({ error: 'Reply message is required' }, { status: 400 });
    }

    // Find the submission
    const submission = await ContactSubmission.findByPk(id);
    if (!submission) {
      return NextResponse.json({ error: 'Submission not found' }, { status: 404 });
    }

    // Update submission status
    await submission.update({
      status: 'replied',
      replyMessage,
      repliedAt: new Date(),
      repliedBy: userId,
    });

    // Send email reply
    const transporter = makeTransport();

    if (transporter) {
      const from = process.env.SMTP_FROM || process.env.SMTP_USER!;

      await transporter.sendMail({
        from: `"VISIONARA" <${from}>`,
        to: submission.email,
        subject: `Re: Your inquiry to VISIONARA`,
        html: generateReplyEmailHTML(submission.name, replyMessage, submission.message),
        text: generateReplyEmailText(submission.name, replyMessage, submission.message),
        replyTo: from,
      });

      console.log(`✅ Reply sent to ${submission.email} for submission ${id}`);
    } else {
      console.log(`⚠️ Reply saved but email not sent (SMTP not configured) for submission ${id}`);
    }

    return NextResponse.json({
      message: 'Reply sent successfully',
      submission: {
        id: submission.id,
        status: submission.status,
        repliedAt: submission.repliedAt,
      }
    });
  } catch (error: any) {
    console.error('Reply to contact submission error:', error);
    return NextResponse.json(
      { error: 'Failed to send reply', details: error.message },
      { status: 500 }
    );
  }
}
