'use client';

import Footer from '@/components/footer';
import Link from 'next/link';

export default function PrivacyPolicyPage() {
  return (
    <div className="privacy-page">
      <div className="privacy-container">
        <div className="privacy-header">
          <Link href="/" className="back-link">
            ← Back to Home
          </Link>
          <h1 className="privacy-title">Privacy Policy</h1>
          <p className="privacy-updated">Last Updated: January 26, 2026</p>
        </div>

        <div className="privacy-content">
          <section>
            <h2>1. Introduction</h2>
            <p>
              Welcome to VISIONARA ("we," "our," or "us"). We are committed to protecting your personal information and your right to privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our services.
            </p>
          </section>

          <section>
            <h2>2. Information We Collect</h2>
            <h3>2.1 Personal Information</h3>
            <p>We may collect personal information that you voluntarily provide to us when you:</p>
            <ul>
              <li>Fill out contact forms</li>
              <li>Subscribe to our newsletter</li>
              <li>Request a quote or consultation</li>
              <li>Communicate with us via email or other channels</li>
            </ul>
            <p>This information may include:</p>
            <ul>
              <li>Name</li>
              <li>Email address</li>
              <li>Phone number</li>
              <li>Company name</li>
              <li>Project details and requirements</li>
            </ul>

            <h3>2.2 Automatically Collected Information</h3>
            <p>When you visit our website, we may automatically collect certain information, including:</p>
            <ul>
              <li>IP address</li>
              <li>Browser type and version</li>
              <li>Device information</li>
              <li>Pages visited and time spent on pages</li>
              <li>Referring website addresses</li>
              <li>Operating system</li>
            </ul>
          </section>

          <section>
            <h2>3. How We Use Your Information</h2>
            <p>We use the information we collect to:</p>
            <ul>
              <li>Respond to your inquiries and provide customer support</li>
              <li>Send you newsletters and marketing communications (with your consent)</li>
              <li>Improve our website and services</li>
              <li>Analyze website usage and trends</li>
              <li>Prevent fraud and enhance security</li>
              <li>Comply with legal obligations</li>
              <li>Process and fulfill service requests</li>
            </ul>
          </section>

          <section>
            <h2>4. How We Share Your Information</h2>
            <p>We do not sell your personal information. We may share your information with:</p>
            <ul>
              <li><strong>Service Providers:</strong> Third-party vendors who assist us in operating our website and providing services (e.g., email service providers, analytics tools)</li>
              <li><strong>Legal Requirements:</strong> When required by law or to protect our rights, property, or safety</li>
              <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
            </ul>
          </section>

          <section>
            <h2>5. Cookies and Tracking Technologies</h2>
            <p>
              We use cookies and similar tracking technologies to track activity on our website and store certain information. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. However, if you do not accept cookies, you may not be able to use some portions of our website.
            </p>
          </section>

          <section>
            <h2>6. Data Security</h2>
            <p>
              We implement appropriate technical and organizational security measures to protect your personal information. However, no method of transmission over the Internet or electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your data, we cannot guarantee absolute security.
            </p>
          </section>

          <section>
            <h2>7. Your Privacy Rights</h2>
            <p>Depending on your location, you may have the following rights:</p>
            <ul>
              <li><strong>Access:</strong> Request a copy of your personal information</li>
              <li><strong>Correction:</strong> Request correction of inaccurate data</li>
              <li><strong>Deletion:</strong> Request deletion of your personal information</li>
              <li><strong>Opt-Out:</strong> Unsubscribe from marketing communications</li>
              <li><strong>Data Portability:</strong> Request transfer of your data</li>
            </ul>
            <p>
              To exercise these rights, please contact us at{' '}
              <a href="mailto:visionara0231@gmail.com">visionara0231@gmail.com</a>
            </p>
          </section>

          <section>
            <h2>8. Newsletter Subscriptions</h2>
            <p>
              When you subscribe to our newsletter, we collect your email address. You can unsubscribe at any time by clicking the "unsubscribe" link in our emails or by contacting us directly.
            </p>
          </section>

          <section>
            <h2>9. Third-Party Links</h2>
            <p>
              Our website may contain links to third-party websites. We are not responsible for the privacy practices of these external sites. We encourage you to review their privacy policies.
            </p>
          </section>

          <section>
            <h2>10. Children's Privacy</h2>
            <p>
              Our services are not intended for individuals under the age of 13. We do not knowingly collect personal information from children. If you become aware that a child has provided us with personal information, please contact us.
            </p>
          </section>

          <section>
            <h2>11. International Data Transfers</h2>
            <p>
              Your information may be transferred to and processed in countries other than your country of residence. We will take appropriate measures to ensure your data is treated securely and in accordance with this Privacy Policy.
            </p>
          </section>

          <section>
            <h2>12. Changes to This Privacy Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date.
            </p>
          </section>

          <section>
            <h2>13. Contact Us</h2>
            <p>If you have any questions about this Privacy Policy, please contact us:</p>
            <ul>
              <li><strong>Email:</strong> <a href="mailto:visionara0231@gmail.com">visionara0231@gmail.com</a></li>
              <li><strong>Phone:</strong> +1 437-430-3922</li>
              <li><strong>Address:</strong> 1454 Dundas St E, Mississauga, ON L4X 1L4, Canada</li>
            </ul>
          </section>
        </div>
      </div>

      <Footer />

      <style jsx>{`
        .privacy-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 100%);
          color: var(--text1, #e5e7eb);
        }

        .privacy-container {
          max-width: 900px;
          margin: 0 auto;
          padding: 6rem 2rem 4rem;
        }

        .privacy-header {
          margin-bottom: 3rem;
          text-align: center;
        }

        .back-link {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          color: rgba(118, 60, 172, 0.9);
          margin-bottom: 2rem;
          transition: transform 0.2s;
        }

        .back-link:hover {
          transform: translateX(-4px);
          text-decoration: underline;
        }

        .privacy-title {
          font-size: 3rem;
          font-weight: 800;
          background: linear-gradient(120deg, #ffffff, rgba(118, 60, 172, 0.8));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 0.5rem;
        }

        .privacy-updated {
          color: rgba(229, 231, 235, 0.6);
          font-size: 0.95rem;
        }

        .privacy-content {
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 16px;
          padding: 3rem;
        }

        .privacy-content section {
          margin-bottom: 2.5rem;
        }

        .privacy-content section:last-child {
          margin-bottom: 0;
        }

        .privacy-content h2 {
          font-size: 1.75rem;
          font-weight: 700;
          margin-bottom: 1rem;
          color: rgba(255, 255, 255, 0.95);
        }

        .privacy-content h3 {
          font-size: 1.25rem;
          font-weight: 600;
          margin: 1.5rem 0 0.75rem;
          color: rgba(255, 255, 255, 0.9);
        }

        .privacy-content p {
          line-height: 1.7;
          margin-bottom: 1rem;
          color: rgba(229, 231, 235, 0.85);
        }

        .privacy-content ul {
          list-style: disc;
          padding-left: 2rem;
          margin-bottom: 1rem;
        }

        .privacy-content li {
          line-height: 1.7;
          margin-bottom: 0.5rem;
          color: rgba(229, 231, 235, 0.85);
        }

        .privacy-content a {
          color: rgba(118, 60, 172, 0.9);
          text-decoration: underline;
          transition: color 0.2s;
        }

        .privacy-content a:hover {
          color: rgba(118, 60, 172, 1);
        }

        .privacy-content strong {
          color: rgba(255, 255, 255, 0.95);
          font-weight: 600;
        }

        @media (max-width: 768px) {
          .privacy-container {
            padding: 4rem 1.5rem 3rem;
          }

          .privacy-title {
            font-size: 2rem;
          }

          .privacy-content {
            padding: 2rem 1.5rem;
          }

          .privacy-content h2 {
            font-size: 1.5rem;
          }

          .privacy-content h3 {
            font-size: 1.1rem;
          }
        }
      `}</style>
    </div>
  );
}
