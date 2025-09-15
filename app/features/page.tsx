'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import Footer from '@/components/footer';

type PlanKey = 'basic' | 'standard' | 'enterprise';
type ServiceKey = 'web' | 'mobile' | 'graphic' | 'marketing';

const plans: { key: PlanKey; name: string; tag?: string; cta: string }[] = [
  { key: 'basic', name: 'Basic', cta: 'Get Started' },
  { key: 'standard', name: 'Standard', tag: 'Most Popular', cta: 'Get Started' },
  { key: 'enterprise', name: 'Enterprise', cta: 'Contact Sales' },
];

const pricing: Record<ServiceKey, Record<PlanKey, { onetime: string; monthly: string; yearly: string }>> = {
  web: {
    basic: { onetime: 'CAD $1,499', monthly: 'CAD $99/mo', yearly: 'CAD $1,188/yr' },
    standard: { onetime: 'CAD $2,499', monthly: 'CAD $199/mo', yearly: 'CAD $2,388/yr' },
    enterprise: { onetime: 'CAD $4,000-$5,500', monthly: 'CAD $299/mo', yearly: 'CAD $3,588/yr' },
  },
  mobile: {
    basic: { onetime: 'CAD $15,000', monthly: 'CAD $199/mo', yearly: 'CAD $2,388/yr' },
    standard: { onetime: 'CAD $35,000', monthly: 'CAD $299/mo', yearly: 'CAD $3,588/yr' },
    enterprise: { onetime: 'CAD $65,000-$100,000', monthly: 'CAD $499/mo', yearly: 'CAD $5,988/yr' },
  },
  graphic: {
    basic: { onetime: 'CAD $899', monthly: 'CAD $599/mo', yearly: 'CAD $7,188/yr' },
    standard: { onetime: 'CAD $2,299', monthly: 'CAD $999/mo', yearly: 'CAD $11,988/yr' },
    enterprise: { onetime: 'CAD $3,799', monthly: 'CAD $1,499/mo', yearly: 'CAD $17,988/yr' },
  },
  marketing: {
    basic: { onetime: 'Contact for quote', monthly: 'CAD $1,899/mo', yearly: 'CAD $22,788/yr' },
    standard: { onetime: 'Contact for quote', monthly: 'CAD $3,799/mo', yearly: 'CAD $45,588/yr' },
    enterprise: { onetime: 'Contact for quote', monthly: 'CAD $6,999/mo', yearly: 'CAD $83,988/yr' },
  },
};

type Cell = string | boolean;

type Section = {
  title: string;
  rows: { label: string; values: Record<PlanKey, Cell> }[];
};

const dataByService: Record<ServiceKey, Section[]> = {
  web: [
    {
      title: 'Web Development — Core Features',
      rows: [
        { label: 'Custom website pages', values: { basic: '5 pages', standard: '10 pages', enterprise: 'Unlimited pages' } },
        { label: 'Domain & hosting', values: { basic: 'Free .ca domain + hosting', standard: 'Free .ca domain + hosting', enterprise: 'Premium hosting' } },
        { label: 'Mobile-friendly design', values: { basic: true, standard: true, enterprise: true } },
        { label: 'Contact forms', values: { basic: 'Basic integration', standard: 'Advanced forms', enterprise: 'Custom integrations' } },
        { label: 'SEO optimization', values: { basic: 'Basic setup', standard: 'Standard optimization', enterprise: 'Marketing analytics' } },
        { label: 'Support & updates', values: { basic: '1 hour/month', standard: '2 hours/month', enterprise: 'Weekly updates' } },
      ],
    },
    {
      title: 'Advanced Features',
      rows: [
        { label: 'Logo design', values: { basic: false, standard: 'Custom logo design', enterprise: 'Professional branding' } },
        { label: 'Social media integration', values: { basic: false, standard: true, enterprise: true } },
        { label: 'Google Business setup', values: { basic: false, standard: true, enterprise: true } },
        { label: 'Blog functionality', values: { basic: false, standard: true, enterprise: true } },
        { label: 'E-commerce/Reservations', values: { basic: false, standard: false, enterprise: 'E-commerce OR reservations' } },
        { label: 'Content creation', values: { basic: false, standard: false, enterprise: 'Professional content creation' } },
        { label: 'Priority support', values: { basic: false, standard: false, enterprise: true } },
      ],
    },
  ],
  mobile: [
    {
      title: 'Mobile Development — Core',
      rows: [
        { label: 'Platform support', values: { basic: 'iOS OR Android', standard: 'Cross-platform (iOS + Android)', enterprise: 'Complex cross-platform' } },
        { label: 'App screens', values: { basic: '5-8 core screens', standard: '12-15 screens', enterprise: 'Unlimited complexity' } },
        { label: 'User authentication', values: { basic: true, standard: 'User accounts & profiles', enterprise: 'Advanced security features' } },
        { label: 'Push notifications', values: { basic: true, standard: true, enterprise: true } },
        { label: 'App store submission', values: { basic: true, standard: true, enterprise: true } },
        { label: 'UI/UX design', values: { basic: 'Basic UI/UX design', standard: 'Professional design', enterprise: 'Custom design system' } },
      ],
    },
    {
      title: 'Backend & Integration',
      rows: [
        { label: 'Payment integration', values: { basic: false, standard: true, enterprise: 'Advanced payment systems' } },
        { label: 'Backend development', values: { basic: false, standard: 'Backend API development', enterprise: 'Custom backend development' } },
        { label: 'Database setup', values: { basic: false, standard: 'Cloud database setup', enterprise: 'Enterprise database architecture' } },
        { label: 'Third-party integrations', values: { basic: false, standard: 'Standard integrations', enterprise: 'Advanced integrations' } },
        { label: 'Admin dashboard', values: { basic: false, standard: false, enterprise: true } },
        { label: 'Support team', values: { basic: 'Basic support', standard: 'Standard support', enterprise: 'Dedicated support team' } },
      ],
    },
  ],
  graphic: [
    {
      title: 'Brand Design — Core',
      rows: [
        { label: 'Logo design', values: { basic: 'Custom logo (3 concepts)', standard: 'Logo + 3 variations', enterprise: 'Complete brand identity' } },
        { label: 'Business materials', values: { basic: 'Business card + letterhead', standard: 'Business stationery suite', enterprise: 'Marketing materials' } },
        { label: 'Brand guidelines', values: { basic: 'Brand color palette', standard: 'Brand guidelines document', enterprise: 'Comprehensive guidelines' } },
        { label: 'Social media assets', values: { basic: false, standard: 'Social media templates (10)', enterprise: 'Unlimited templates' } },
        { label: 'Delivery time', values: { basic: '1-2 weeks', standard: '2-3 weeks', enterprise: '3-4 weeks' } },
        { label: 'Design support', values: { basic: 'Basic support', standard: '10 hours/month design work', enterprise: 'Unlimited design requests' } },
      ],
    },
    {
      title: 'Advanced Design Services',
      rows: [
        { label: 'Presentation templates', values: { basic: false, standard: false, enterprise: true } },
        { label: 'Email signature designs', values: { basic: false, standard: false, enterprise: true } },
        { label: 'Brand photography guidelines', values: { basic: false, standard: false, enterprise: true } },
        { label: 'Marketing collateral', values: { basic: false, standard: 'Standard templates', enterprise: 'Marketing material templates' } },
        { label: 'Brand extensions', values: { basic: false, standard: 'Limited variations', enterprise: 'Everything in Standard +' } },
      ],
    },
  ],
  marketing: [
    {
      title: 'Digital Marketing — Core',
      rows: [
        { label: 'Social media management', values: { basic: '3 platforms', standard: '5 platforms', enterprise: 'All platforms + LinkedIn/TikTok' } },
        { label: 'Content posting', values: { basic: '12 posts/month/platform', standard: '20 posts/month/platform', enterprise: 'Content creation (blogs, videos)' } },
        { label: 'SEO optimization', values: { basic: 'Basic SEO optimization', standard: 'Advanced SEO + content marketing', enterprise: 'Comprehensive digital strategy' } },
        { label: 'Google Business', values: { basic: 'Google Business optimization', standard: 'Google Ads management', enterprise: 'Advanced PPC campaigns' } },
        { label: 'Reporting', values: { basic: 'Monthly performance reports', standard: 'Bi-weekly reports', enterprise: 'Real-time analytics' } },
        { label: 'Contract terms', values: { basic: '6-month minimum', standard: '6-month minimum', enterprise: 'Flexible terms' } },
      ],
    },
    {
      title: 'Advanced Marketing',
      rows: [
        { label: 'Email marketing', values: { basic: false, standard: 'Email marketing campaigns', enterprise: 'Marketing automation' } },
        { label: 'Dedicated support', values: { basic: 'Shared account manager', standard: 'Account manager', enterprise: 'Dedicated marketing manager' } },
        { label: 'Strategy development', values: { basic: 'Basic strategy', standard: 'Growth strategy', enterprise: 'Comprehensive digital strategy' } },
        { label: 'Advanced campaigns', values: { basic: false, standard: 'Multi-channel campaigns', enterprise: 'Advanced PPC campaigns' } },
      ],
    },
  ],
};

/* ----------------------------- UI helpers ----------------------------- */
const Check = () => (
  <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[var(--foreground)]/18">
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-[var(--foreground)]"><path d="M20.285 6.709a1 1 0 0 1 0 1.414l-9.9 9.9a1 1 0 0 1-1.414 0l-5.256-5.255a1 1 0 1 1 1.414-1.415l4.549 4.55 9.193-9.194a1 1 0 0 1 1.414 0z"/></svg>
  </span>
);
const Dash = () => <span className="text-white/40">—</span>;
const renderCell = (v: Cell) =>
  typeof v === 'boolean' ? (v ? <Check /> : <Dash />) : <span className="text-sm">{v}</span>;

/* --------------------------------- Page -------------------------------- */
export default function FeaturesPage() {
  const [service, setService] = useState<ServiceKey>('web');
  const [billing, setBilling] = useState<'onetime' | 'monthly' | 'yearly'>('onetime');
  const sections = useMemo(() => dataByService[service], [service]);

  return (
    <main className="bg-[var(--background)] text-[var(--text1)] min-h-screen">
      {/* HERO */}
      <section className="mx-auto max-w-7xl px-4 pt-20 pb-8">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-8">
          <p className="mb-2 text-xs uppercase tracking-[0.16em] text-white/70">🇨🇦 Visionara</p>
          <h1 className="text-4xl font-extrabold leading-tight md:text-6xl">Compare Our Services</h1>
          <p className="mt-4 max-w-prose text-lg text-white/90">
            Detailed breakdown of what's included in each tier across all our service categories.
          </p>

          {/* SERVICE SELECTOR */}
          <div className="mt-6 inline-flex rounded-full border border-white/15 bg-white/5 p-1">
            {([
              { key: 'web', label: 'Web Development' },
              { key: 'mobile', label: 'Mobile Apps' },
              { key: 'graphic', label: 'Graphic Design' },
              { key: 'marketing', label: 'Marketing' },
            ] as { key: ServiceKey; label: string }[]).map((opt) => (
              <button
                key={opt.key}
                onClick={() => setService(opt.key)}
                className={`px-5 py-3 text-sm rounded-full transition ${
                  service === opt.key
                    ? 'bg-[var(--foreground)] text-black font-semibold'
                    : 'text-[var(--text1)] hover:text-white'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* BILLING TOGGLE */}
          <div className="mt-4 inline-flex rounded-full border border-white/15 bg-white/5 p-1 ml-4">
            {([
              { key: 'onetime', label: 'One-time' },
              { key: 'monthly', label: 'Monthly' },
              { key: 'yearly', label: 'Yearly' },
            ] as { key: 'onetime' | 'monthly' | 'yearly'; label: string }[]).map((opt) => (
              <button
                key={opt.key}
                onClick={() => setBilling(opt.key)}
                className={`px-4 py-2 text-sm rounded-full transition ${
                  billing === opt.key
                    ? 'bg-[var(--foreground)] text-black font-semibold'
                    : 'text-[var(--text1)] hover:text-white'
                }`}
              >
                {opt.label}
                {opt.key === 'yearly' && <span className="ml-1 text-xs bg-orange-500 text-white px-1.5 py-0.5 rounded">20% OFF</span>}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* SIDE-BY-SIDE COLUMNS */}
      <section className="mx-auto max-w-7xl px-4 pb-12">
        {/* Header row */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {plans.map((p) => (
            <div key={p.key} className="rounded-2xl border border-white/10 bg-white/5 p-6 relative">
              {p.tag && (
                <div className="absolute -top-3 left-6 w-fit rounded-full bg-[var(--foreground)] px-4 py-1 text-xs font-extrabold text-black">
                  {p.tag}
                </div>
              )}
              <h3 className="text-xl font-bold mt-2">{p.name}</h3>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-[var(--foreground)]">
                  {pricing[service][p.key][billing]}
                </span>
              </div>
              {service !== 'marketing' && (
                <div className="text-sm text-white/70 mt-2">
                  Monthly: {pricing[service][p.key].monthly}<br/>
                  Yearly: {pricing[service][p.key].yearly} {billing === 'yearly' && <span className="text-orange-400">(20% off)</span>}
                </div>
              )}
              <a
                href={p.key === 'enterprise' ? '/contact' : '/contact'}
                className={`mt-6 inline-block w-full rounded-xl border border-white/20 px-4 py-3 text-center text-sm font-semibold transition hover:bg-white/5 ${
                  p.tag ? 'bg-[var(--foreground)] text-black hover:bg-[var(--foreground)]/90' : 'text-[var(--text1)]'
                }`}
              >
                {p.cta}
              </a>
            </div>
          ))}
        </div>

        {/* Sections per plan (rows inside each column) */}
        {sections.map((section) => (
          <div key={section.title} className="mt-8">
            <div className="mb-4 text-lg font-semibold text-white/90">{section.title}</div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {plans.map((p) => (
                <div key={p.key} className="overflow-hidden rounded-2xl border border-white/10">
                  <div className="bg-white/[0.08] px-5 py-3 text-sm font-semibold">
                    {p.name}
                  </div>
                  <ul>
                    {section.rows.map((r, i) => (
                      <li
                        key={r.label}
                        className={`flex items-center justify-between gap-3 px-5 py-4 text-sm ${
                          i % 2 ? 'bg-white/[0.03]' : ''
                        }`}
                      >
                        <span className="text-white/90 flex-1">{r.label}</span>
                        <span className="flex-shrink-0">{renderCell(r.values[p.key])}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        ))}
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 pb-16">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center">
          <h2 className="text-3xl font-extrabold">Ready to start your project?</h2>
          <p className="mx-auto mt-4 max-w-prose text-lg text-white/85">
            From web apps to mobile solutions, stunning visuals to growth marketing — we've got you covered.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-6">
            <Link
              href="/contact"
              className="inline-block rounded-full border border-white/20 bg-[var(--foreground)] px-8 py-4 font-semibold text-black hover:bg-[var(--foreground)]/90 transition"
            >
              Start a project
            </Link>
            <Link
              href="/"
              className="inline-block rounded-full border border-white/20 px-8 py-4 font-semibold text-[var(--text1)] hover:bg-white/5 transition"
            >
              Learn more
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}