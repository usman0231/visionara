import { NextRequest, NextResponse } from 'next/server';
import { ContactSubmission } from '@/lib/db/models';
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
        from: `"Visionara" <${from}>`,
        to: submission.email,
        subject: 'Re: Your Contact Form Submission',
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                .message { background: white; padding: 20px; border-radius: 5px; margin: 20px 0; }
                .original-message { background: #f0f0f0; padding: 15px; border-left: 4px solid #667eea; margin: 20px 0; }
                .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>Visionara</h1>
                  <p>We've received your inquiry</p>
                </div>
                <div class="content">
                  <p>Hi ${submission.name},</p>

                  <div class="message">
                    ${replyMessage.replace(/\n/g, '<br>')}
                  </div>

                  <div class="original-message">
                    <strong>Your Original Message:</strong><br>
                    ${submission.message.replace(/\n/g, '<br>')}
                  </div>

                  <p>Best regards,<br>The Visionara Team</p>

                  <div class="footer">
                    <p>This email was sent in response to your contact form submission.</p>
                    <p>If you have any questions, feel free to reply to this email.</p>
                  </div>
                </div>
              </div>
            </body>
          </html>
        `,
        text: `Hi ${submission.name},\n\n${replyMessage}\n\n---\nYour Original Message:\n${submission.message}\n\nBest regards,\nThe Visionara Team`,
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
