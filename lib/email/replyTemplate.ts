export function generateReplyEmailHTML(
  customerName: string,
  replyMessage: string,
  originalMessage: string
): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reply from VISIONARA</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">

          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">VISIONARA</h1>
              <p style="color: #e0e7ff; margin: 10px 0 0 0; font-size: 16px;">Your Vision, Our Technology</p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="color: #1a202c; margin: 0 0 20px 0; font-size: 24px;">Hi ${customerName},</h2>

              <p style="color: #4a5568; line-height: 1.6; margin: 0 0 20px 0; font-size: 16px;">
                Thank you for reaching out to us! We've received your message and here's our response:
              </p>

              <div style="background-color: #f7fafc; border-left: 4px solid #667eea; padding: 20px; margin: 0 0 30px 0; border-radius: 4px;">
                <p style="color: #2d3748; line-height: 1.8; margin: 0; font-size: 15px; white-space: pre-wrap;">${replyMessage}</p>
              </div>

              <div style="border-top: 2px solid #e2e8f0; padding-top: 25px; margin-top: 25px;">
                <p style="color: #718096; font-size: 14px; font-weight: 600; margin: 0 0 10px 0;">Your Original Message:</p>
                <p style="color: #a0aec0; line-height: 1.6; margin: 0; font-size: 14px; font-style: italic; white-space: pre-wrap;">${originalMessage}</p>
              </div>

              <p style="color: #4a5568; line-height: 1.6; margin: 30px 0 0 0; font-size: 16px;">
                If you have any further questions, feel free to reply to this email or contact us directly.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #1a202c; padding: 30px; text-align: center;">
              <p style="color: #a0aec0; margin: 0 0 15px 0; font-size: 14px;">
                <strong style="color: #ffffff;">VISIONARA</strong><br>
                Transforming your business ideas into reality
              </p>
              <p style="color: #718096; margin: 0; font-size: 13px;">
                <a href="https://www.visionara.ca" style="color: #667eea; text-decoration: none;">www.visionara.ca</a> |
                <a href="mailto:info@visionara.ca" style="color: #667eea; text-decoration: none;">info@visionara.ca</a>
              </p>
              <p style="color: #4a5568; margin: 15px 0 0 0; font-size: 12px;">
                © ${new Date().getFullYear()} VISIONARA. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

export function generateReplyEmailText(
  customerName: string,
  replyMessage: string,
  originalMessage: string
): string {
  return `
Hi ${customerName},

Thank you for reaching out to us! We've received your message and here's our response:

${replyMessage}

---
Your Original Message:
${originalMessage}
---

If you have any further questions, feel free to reply to this email or contact us directly.

Best regards,
VISIONARA Team

www.visionara.ca
info@visionara.ca

© ${new Date().getFullYear()} VISIONARA. All rights reserved.
  `.trim();
}
