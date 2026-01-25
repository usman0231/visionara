// lib/email/contactEmailHtml.ts
type ContactPayload = {
  name?: string;
  email?: string;
  company?: string;
  phone?: string;
  projectType?: string | string[];
  budget?: string;
  timeline?: string;
  message?: string;
  submittedAt?: string; // optional ISO date
  logoUrl?: string;     // e.g. 'https://yourdomain.com/visionara-logo.png'
};

export function contactEmailHtml(data: ContactPayload) {
  const brand = {
    bg: '#000000',
    card: '#0b0b0b',
    border: 'rgba(255,255,255,0.10)',
    text: '#ffffff',
    muted: 'rgba(255,255,255,0.78)',
    primary: '#763cac',
    primarySoft: 'rgba(118, 60, 172, 0.25)',
  };

  const safe = (v?: string) =>
    (v ?? '')
      .toString()
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

  const types = Array.isArray(data.projectType)
    ? data.projectType.join(', ')
    : data.projectType ?? 'N/A';

  const dt =
    data.submittedAt
      ? new Date(data.submittedAt)
      : new Date();

  const logo = "/images/final_transparent.png";

  const dateStr = dt.toLocaleString();

  return `
  <!doctype html>
  <html lang="en">
    <head>
      <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
      <title>New Visionara Contact</title>
      <style>
        /* Dark mode support for clients that honor it */
        @media (prefers-color-scheme: dark) {
          .card { background: ${brand.card} !important; }
        }
        /* Mobile spacing */
        @media (max-width: 600px) {
          .container { padding: 16px !important; }
          .h1 { font-size: 24px !important; }
          .pill { display: block !important; margin-bottom: 6px !important; }
        }
      </style>
    </head>
    <body style="margin:0;padding:0;background:${brand.bg};color:${brand.text};">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${brand.bg};">
        <tr>
          <td align="center">
            <table class="container" role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:600px;max-width:600px;padding:24px;">
              <!-- HEADER -->
              <tr>
                <td align="left" style="padding:12px 0 18px;">
                  <table role="presentation" cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="vertical-align:middle;">
                        <div style="width:44px;height:44px;border-radius:12px;overflow:hidden;background:linear-gradient(135deg, ${brand.primarySoft}, transparent);border:1px solid ${brand.border};">
                          ${
                            logo
                              ? `<img src="${safe(logo)}" width="44" height="44" alt="Visionara" style="display:block;width:44px;height:44px;object-fit:contain;" />`
                              : ''
                          }
                        </div>
                      </td>
                      <td style="vertical-align:middle;padding-left:12px;">
                        <div style="font-size:12px;letter-spacing:.16em;text-transform:uppercase;color:${brand.muted};">New Inquiry</div>
                        <div style="font-size:20px;font-weight:800;line-height:1.2;color:${brand.text};">Visionara Contact</div>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- CARD -->
              <tr>
                <td class="card" style="background:${brand.card};border:1px solid ${brand.border};border-radius:16px;overflow:hidden;">
                  <!-- Banner -->
                  <div style="background:linear-gradient(135deg, ${brand.primary}, #9b6dd2);padding:18px;">
                    <div style="font-size:22px;font-weight:800;color:#000;">Project details received</div>
                    <div style="font-size:13px;color:#0a0a0a;opacity:.85;">${safe(dateStr)}</div>
                  </div>

                  <!-- Body -->
                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:18px;">
                    <!-- Intro line -->
                    <tr>
                      <td style="padding:0 0 12px 0;">
                        <div class="h1" style="font-size:26px;font-weight:800;line-height:1.25;color:${brand.text};margin:0;">${safe(data.name) || 'Someone'} is reaching out 👋</div>
                        <div style="font-size:14px;color:${brand.muted};margin-top:6px;">
                          Here’s everything they shared via the contact form.
                        </div>
                      </td>
                    </tr>

                    <!-- Pills -->
                    <tr>
                      <td style="padding:6px 0 14px 0;">
                        <span class="pill" style="display:inline-block;background:${brand.primarySoft};color:${brand.text};border:1px solid ${brand.border};padding:8px 10px;border-radius:999px;font-size:12px;margin-right:8px;margin-bottom:4px;"><strong style="color:${brand.primary}">Type</strong>: ${safe(types)}</span>
                        <span class="pill" style="display:inline-block;background:${brand.primarySoft};color:${brand.text};border:1px solid ${brand.border};padding:8px 10px;border-radius:999px;font-size:12px;margin-right:8px;margin-bottom:4px;"><strong style="color:${brand.primary}">Timeline</strong>: ${safe(data.timeline) || 'N/A'}</span>
                      </td>
                    </tr>

                    <!-- 2-col info -->
                    <tr>
                      <td>
                        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                          <tr>
                            <td width="50%" style="vertical-align:top;padding-right:8px;">
                              <div style="font-size:12px;color:${brand.muted};text-transform:uppercase;letter-spacing:.06em;margin-bottom:6px;">Contact</div>
                              <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="font-size:14px;color:${brand.text}">
                                <tr><td style="padding:4px 0;"><strong>Name:</strong> ${safe(data.name) || '—'}</td></tr>
                                <tr><td style="padding:4px 0;"><strong>Email:</strong> <a href="mailto:${safe(data.email)}" style="color:${brand.primary};text-decoration:none;">${safe(data.email) || '—'}</a></td></tr>
                                <tr><td style="padding:4px 0;"><strong>Phone:</strong> ${safe(data.phone) || '—'}</td></tr>
                              </table>
                            </td>
                            <td width="50%" style="vertical-align:top;padding-left:8px;">
                              <div style="font-size:12px;color:${brand.muted};text-transform:uppercase;letter-spacing:.06em;margin-bottom:6px;">Company</div>
                              <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="font-size:14px;color:${brand.text}">
                                <tr><td style="padding:4px 0;"><strong>Company:</strong> ${safe(data.company) || '—'}</td></tr>
                                <tr><td style="padding:4px 0;"><strong>Submitted:</strong> ${safe(dateStr)}</td></tr>
                              </table>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>

                    <!-- Divider -->
                    <tr>
                      <td style="padding:16px 0;">
                        <div style="height:1px;background:${brand.border};"></div>
                      </td>
                    </tr>

                    <!-- Message -->
                    <tr>
                      <td>
                        <div style="font-size:12px;color:${brand.muted};text-transform:uppercase;letter-spacing:.06em;margin-bottom:6px;">Message</div>
                        <div style="font-size:15px;line-height:1.6;color:${brand.text}">
                          ${safe((data.message || '').replace(/\n/g, '<br/>')) || '—'}
                        </div>
                      </td>
                    </tr>
                  </table>

                  <!-- Footer -->
                  <div style="padding:14px 18px;border-top:1px solid ${brand.border};display:flex;align-items:center;justify-content:space-between;margin-top:30px;">
                    <div style="font-size:12px;color:${brand.muted}">Reply directly to continue the conversation.</div>
                    <a href="mailto:${safe(data.email || '')}" style="background:${brand.primary};color:#000;border-radius:10px;padding:10px 14px;font-weight:800;text-decoration:none;">Reply</a>
                  </div>
                </td>
              </tr>

              <!-- Signature -->
              <tr>
                <td align="center" style="padding:18px 6px;color:${brand.muted};font-size:12px;">
                  © ${new Date().getFullYear()} Visionara — built with care.
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
  </html>`;
}
