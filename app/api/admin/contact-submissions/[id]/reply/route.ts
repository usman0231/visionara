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
    console.log('🔵 Reply API started');

    const userId = request.headers.get('x-user-id');
    console.log('🔵 User ID:', userId);

    if (!userId) {
      console.log('🔴 Authentication failed - no user ID');
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { id } = await params;
    console.log('🔵 Contact submission ID:', id);

    const body = await request.json();
    const { replyMessage } = body;
    console.log('🔵 Reply message length:', replyMessage?.length);

    if (!replyMessage) {
      console.log('🔴 No reply message provided');
      return NextResponse.json({ error: 'Reply message is required' }, { status: 400 });
    }

    // Find the submission
    console.log('🔵 Finding submission...');
    const submission = await ContactSubmission.findByPk(id);

    if (!submission) {
      console.log('🔴 Submission not found');
      return NextResponse.json({ error: 'Submission not found' }, { status: 404 });
    }

    console.log('🔵 Found submission for email:', submission.email);
    console.log('🔵 Submission details:', {
      id: submission.id,
      name: submission.name,
      email: submission.email,
      hasEmail: !!submission.email,
      emailLength: submission.email?.length
    });

    // Validate email exists
    if (!submission.email || !submission.email.trim()) {
      console.log('🔴 Submission has no email address');
      return NextResponse.json(
        { error: 'Contact submission has no email address' },
        { status: 400 }
      );
    }

    // Update submission status
    console.log('🔵 Updating submission...');
    await submission.update({
      status: 'replied',
      replyMessage,
      repliedAt: new Date(),
      repliedBy: userId,
    });
    console.log('🔵 Submission updated successfully');

    // Send email reply
    console.log('🔵 Setting up email transport...');
    const transporter = makeTransport();
    let emailSent = false;
    let emailError = null;

    if (transporter) {
      console.log('🔵 SMTP configured, sending email to:', submission.email);
      const from = process.env.SMTP_FROM || process.env.SMTP_USER!;

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(submission.email)) {
        console.log('🔴 Invalid email format:', submission.email);
        emailError = `Invalid email format: ${submission.email}`;
      } else {
        try {
          const mailOptions = {
            from: `"VISIONARA" <${from}>`,
            to: submission.email,
            subject: `Re: Your inquiry to VISIONARA`,
            html: generateReplyEmailHTML(submission.name, replyMessage, submission.message),
            text: generateReplyEmailText(submission.name, replyMessage, submission.message),
            replyTo: from,
          };

          console.log('🔵 Email options:', {
            from: mailOptions.from,
            to: mailOptions.to,
            subject: mailOptions.subject
          });

          await transporter.sendMail(mailOptions);

          console.log(`✅ Reply email sent to ${submission.email} for submission ${id}`);
          emailSent = true;
        } catch (error: any) {
          console.error('🔴 Email sending error:', error.message);
          console.error('🔴 Email error details:', error);
          emailError = error.message;
        }
      }
    } else {
      console.log(`⚠️ SMTP not configured - reply saved to database but email not sent for submission ${id}`);
      emailError = 'SMTP not configured. Please add SMTP_HOST, SMTP_USER, and SMTP_PASS to environment variables.';
    }

    console.log('🔵 Returning success response');
    return NextResponse.json({
      message: emailSent
        ? 'Reply sent successfully'
        : 'Reply saved but email not sent',
      emailSent,
      emailError,
      submission: {
        id: submission.id,
        status: submission.status,
        repliedAt: submission.repliedAt,
      }
    });
  } catch (error: any) {
    console.error('🔴 Reply to contact submission error:', error);
    console.error('🔴 Error stack:', error.stack);
    return NextResponse.json(
      { error: 'Failed to send reply', details: error.message },
      { status: 500 }
    );
  }
}
