'use client';

import Footer from '@/components/footer';
import Link from 'next/link';

export default function TermsOfServicePage() {
  return (
    <div className="terms-page">
      <div className="terms-container">
        <div className="terms-header">
          <Link href="/" className="back-link">
            ← Back to Home
          </Link>
          <h1 className="terms-title">Terms of Service</h1>
          <p className="terms-updated">Last Updated: January 26, 2026</p>
        </div>

        <div className="terms-content">
          <section>
            <h2>1. Agreement to Terms</h2>
            <p>
              By accessing and using the VISIONARA website and services, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this site.
            </p>
          </section>

          <section>
            <h2>2. Services Description</h2>
            <p>
              VISIONARA provides digital services including but not limited to:
            </p>
            <ul>
              <li>Web application development</li>
              <li>Mobile application development</li>
              <li>Graphic design services</li>
              <li>Digital marketing services</li>
              <li>Consulting and strategy</li>
            </ul>
            <p>
              We reserve the right to modify, suspend, or discontinue any aspect of our services at any time without prior notice.
            </p>
          </section>

          <section>
            <h2>3. User Obligations</h2>
            <p>When using our services, you agree to:</p>
            <ul>
              <li>Provide accurate and complete information</li>
              <li>Maintain the confidentiality of any account credentials</li>
              <li>Use our services only for lawful purposes</li>
              <li>Not engage in any activity that disrupts or interferes with our services</li>
              <li>Not attempt to gain unauthorized access to any part of our systems</li>
              <li>Respect intellectual property rights</li>
            </ul>
          </section>

          <section>
            <h2>4. Intellectual Property Rights</h2>
            <h3>4.1 Our Content</h3>
            <p>
              Unless otherwise stated, VISIONARA and/or its licensors own the intellectual property rights for all material on this website. All intellectual property rights are reserved. You may view and/or print pages from the website for your own personal use subject to restrictions set in these terms.
            </p>

            <h3>4.2 Client Work</h3>
            <p>
              For contracted projects, intellectual property rights will be transferred to the client upon full payment, unless otherwise specified in the project agreement. We retain the right to showcase completed work in our portfolio unless explicitly prohibited by a non-disclosure agreement.
            </p>

            <h3>4.3 Prohibited Use</h3>
            <p>You must not:</p>
            <ul>
              <li>Republish material from this website without permission</li>
              <li>Sell, rent, or sub-license material from the website</li>
              <li>Reproduce, duplicate, or copy material from the website for commercial purposes</li>
              <li>Redistribute content from VISIONARA (unless content is specifically made for redistribution)</li>
            </ul>
          </section>

          <section>
            <h2>5. Project Agreements and Payment Terms</h2>
            <h3>5.1 Project Scope</h3>
            <p>
              All projects will be governed by a separate written agreement that outlines scope, deliverables, timelines, and costs. These Terms of Service supplement but do not replace project-specific agreements.
            </p>

            <h3>5.2 Payment</h3>
            <p>Payment terms will be specified in individual project agreements. Generally:</p>
            <ul>
              <li>A deposit may be required before work begins</li>
              <li>Milestone payments may be required for larger projects</li>
              <li>Final payment is due upon project completion</li>
              <li>Late payments may incur additional fees</li>
            </ul>

            <h3>5.3 Revisions and Changes</h3>
            <p>
              Project agreements will specify the number of included revisions. Additional revisions beyond the agreed scope may incur extra charges.
            </p>
          </section>

          <section>
            <h2>6. Confidentiality</h2>
            <p>
              We respect the confidentiality of your business information. Any confidential information shared during the course of our engagement will be protected, except where disclosure is required by law or with your explicit consent.
            </p>
          </section>

          <section>
            <h2>7. Limitation of Liability</h2>
            <p>
              To the fullest extent permitted by applicable law, VISIONARA shall not be liable for:
            </p>
            <ul>
              <li>Any indirect, incidental, special, consequential, or punitive damages</li>
              <li>Loss of profits, revenue, data, or use</li>
              <li>Damages resulting from your use or inability to use our services</li>
              <li>Any conduct or content of third parties on our website</li>
            </ul>
            <p>
              Our total liability shall not exceed the amount paid by you for the specific service that gave rise to the claim.
            </p>
          </section>

          <section>
            <h2>8. Warranties and Disclaimers</h2>
            <h3>8.1 Service Warranty</h3>
            <p>
              We strive to deliver high-quality services and will work to correct any defects in our work as specified in project agreements.
            </p>

            <h3>8.2 Disclaimer</h3>
            <p>
              Our website and services are provided "as is" without warranties of any kind, either express or implied. We do not warrant that:
            </p>
            <ul>
              <li>Our services will be uninterrupted or error-free</li>
              <li>Defects will be corrected immediately</li>
              <li>Our website is free of viruses or other harmful components</li>
              <li>Results from using our services will meet your requirements</li>
            </ul>
          </section>

          <section>
            <h2>9. Indemnification</h2>
            <p>
              You agree to indemnify and hold harmless VISIONARA, its contractors, and its licensors from any claims, losses, damages, liabilities, and expenses (including legal fees) arising from:
            </p>
            <ul>
              <li>Your use of our services</li>
              <li>Your violation of these Terms of Service</li>
              <li>Your violation of any rights of another party</li>
              <li>Content you provide that infringes intellectual property rights</li>
            </ul>
          </section>

          <section>
            <h2>10. Third-Party Services</h2>
            <p>
              Our services may integrate with or rely on third-party platforms, tools, or services. We are not responsible for the availability, accuracy, or content of these third-party services. Your use of third-party services is subject to their respective terms and conditions.
            </p>
          </section>

          <section>
            <h2>11. Termination</h2>
            <p>
              We reserve the right to terminate or suspend access to our services immediately, without prior notice or liability, for any reason, including breach of these Terms. Upon termination:
            </p>
            <ul>
              <li>Your right to use our services will cease immediately</li>
              <li>Any provisions that should survive termination will remain in effect</li>
              <li>Payment obligations for services rendered will remain due</li>
            </ul>
          </section>

          <section>
            <h2>12. Governing Law</h2>
            <p>
              These Terms shall be governed by and construed in accordance with the laws of Canada and the Province of Ontario, without regard to its conflict of law provisions. Any disputes arising from these Terms or our services shall be subject to the exclusive jurisdiction of the courts of Ontario, Canada.
            </p>
          </section>

          <section>
            <h2>13. Changes to Terms</h2>
            <p>
              We reserve the right to modify these Terms of Service at any time. We will notify users of any material changes by posting the new Terms on this page and updating the "Last Updated" date. Your continued use of our services after such modifications constitutes acceptance of the updated Terms.
            </p>
          </section>

          <section>
            <h2>14. Severability</h2>
            <p>
              If any provision of these Terms is found to be unenforceable or invalid, that provision will be limited or eliminated to the minimum extent necessary so that the Terms will otherwise remain in full force and effect.
            </p>
          </section>

          <section>
            <h2>15. Entire Agreement</h2>
            <p>
              These Terms, together with any project-specific agreements and our Privacy Policy, constitute the entire agreement between you and VISIONARA regarding the use of our services.
            </p>
          </section>

          <section>
            <h2>16. Contact Information</h2>
            <p>
              If you have any questions about these Terms of Service, please contact us:
            </p>
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
        .terms-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 100%);
          color: var(--text1, #e5e7eb);
        }

        .terms-container {
          max-width: 900px;
          margin: 0 auto;
          padding: 6rem 2rem 4rem;
        }

        .terms-header {
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

        .terms-title {
          font-size: 3rem;
          font-weight: 800;
          background: linear-gradient(120deg, #ffffff, rgba(118, 60, 172, 0.8));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 0.5rem;
        }

        .terms-updated {
          color: rgba(229, 231, 235, 0.6);
          font-size: 0.95rem;
        }

        .terms-content {
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 16px;
          padding: 3rem;
        }

        .terms-content section {
          margin-bottom: 2.5rem;
        }

        .terms-content section:last-child {
          margin-bottom: 0;
        }

        .terms-content h2 {
          font-size: 1.75rem;
          font-weight: 700;
          margin-bottom: 1rem;
          color: rgba(255, 255, 255, 0.95);
        }

        .terms-content h3 {
          font-size: 1.25rem;
          font-weight: 600;
          margin: 1.5rem 0 0.75rem;
          color: rgba(255, 255, 255, 0.9);
        }

        .terms-content p {
          line-height: 1.7;
          margin-bottom: 1rem;
          color: rgba(229, 231, 235, 0.85);
        }

        .terms-content ul {
          list-style: disc;
          padding-left: 2rem;
          margin-bottom: 1rem;
        }

        .terms-content li {
          line-height: 1.7;
          margin-bottom: 0.5rem;
          color: rgba(229, 231, 235, 0.85);
        }

        .terms-content a {
          color: rgba(118, 60, 172, 0.9);
          text-decoration: underline;
          transition: color 0.2s;
        }

        .terms-content a:hover {
          color: rgba(118, 60, 172, 1);
        }

        .terms-content strong {
          color: rgba(255, 255, 255, 0.95);
          font-weight: 600;
        }

        @media (max-width: 768px) {
          .terms-container {
            padding: 4rem 1.5rem 3rem;
          }

          .terms-title {
            font-size: 2rem;
          }

          .terms-content {
            padding: 2rem 1.5rem;
          }

          .terms-content h2 {
            font-size: 1.5rem;
          }

          .terms-content h3 {
            font-size: 1.1rem;
          }
        }
      `}</style>
    </div>
  );
}
