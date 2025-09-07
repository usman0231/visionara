'use client';

import { useMemo, useState } from 'react';
import Footer from '@/components/footer';

type PlanKey = 'support' | 'suite' | 'pro' | 'enterprise';
type ServiceKey = 'web' | 'mobile' | 'design' | 'marketing';

const plans: { key: PlanKey; name: string; tag?: string; cta: string }[] = [
  { key: 'support', name: 'Support Team', cta: 'Buy now' },
  { key: 'suite', name: 'Suite Team', cta: 'Buy now' },
  { key: 'pro', name: 'Suite Professional', tag: 'Most popular', cta: 'Buy now' },
  { key: 'enterprise', name: 'Suite Enterprise', cta: 'Talk to Sales' },
];

const pricing: Record<PlanKey, { annual: string; monthly: string }> = {
  support: { annual: '$19', monthly: '$25' },
  suite: { annual: '$55', monthly: '$69' },
  pro: { annual: '$115', monthly: '$149' },
  enterprise: { annual: '$169', monthly: '$219' },
};

type Cell = string | boolean;

type Section = {
  title: string;
  rows: { label: string; values: Record<PlanKey, Cell> }[];
};

const dataByService: Record<ServiceKey, Section[]> = {
  web: [
    {
      title: 'Web App — Core',
      rows: [
        { label: 'Next.js + React foundation', values: { support: true, suite: true, pro: true, enterprise: true } },
        { label: 'API & database (Node/Prisma/Postgres)', values: { support: true, suite: true, pro: true, enterprise: true } },
        { label: 'Auth & roles', values: { support: 'Basic', suite: 'Standard', pro: 'Advanced', enterprise: 'SSO/SAML' } },
        { label: 'Accessibility & design system', values: { support: 'Starter', suite: 'Pro kit', pro: 'Enterprise kit', enterprise: 'Enterprise kit' } },
      ],
    },
    {
      title: 'Delivery & Quality',
      rows: [
        { label: 'CI/CD & preview environments', values: { support: true, suite: true, pro: true, enterprise: true } },
        { label: 'Automated tests', values: { support: 'Smoke', suite: 'Unit', pro: 'Unit + E2E', enterprise: 'Unit + E2E' } },
        { label: 'Performance budget', values: { support: false, suite: true, pro: true, enterprise: true } },
        { label: 'Support SLA', values: { support: 'Community', suite: '48h', pro: '24h', enterprise: 'Same business day' } },
      ],
    },
  ],
  mobile: [
    {
      title: 'Mobile — Core',
      rows: [
        { label: 'React Native / Flutter', values: { support: true, suite: true, pro: true, enterprise: true } },
        { label: 'Offline-first & sync', values: { support: false, suite: true, pro: true, enterprise: true } },
        { label: 'Push notifications', values: { support: true, suite: true, pro: true, enterprise: true } },
        { label: 'Native modules', values: { support: 'Common', suite: 'Extended', pro: 'Advanced', enterprise: 'Custom' } },
      ],
    },
    {
      title: 'Launch',
      rows: [
        { label: 'App Store / Play Store readiness', values: { support: true, suite: true, pro: true, enterprise: true } },
        { label: 'Crash reporting & analytics', values: { support: true, suite: true, pro: true, enterprise: true } },
        { label: 'Release train setup', values: { support: false, suite: true, pro: true, enterprise: true } },
      ],
    },
  ],
  design: [
    {
      title: 'Brand & UI',
      rows: [
        { label: 'Logo & identity basics', values: { support: true, suite: true, pro: true, enterprise: true } },
        { label: 'Design system (Figma)', values: { support: 'Light', suite: 'Core', pro: 'Core + tokens', enterprise: 'Enterprise tokens' } },
        { label: 'Illustration / motion snippets', values: { support: false, suite: true, pro: true, enterprise: true } },
        { label: 'Pitch deck / investor kit', values: { support: 'Template', suite: 'Custom', pro: 'Custom + motion', enterprise: 'Bespoke suite' } },
      ],
    },
  ],
  marketing: [
    {
      title: 'Growth',
      rows: [
        { label: 'Positioning & messaging', values: { support: true, suite: true, pro: true, enterprise: true } },
        { label: 'Landing pages & CRO', values: { support: 'Essentials', suite: 'A/B setup', pro: 'Experiment program', enterprise: 'Program + team enablement' } },
        { label: 'SEO (tech + content plan)', values: { support: 'Checklist', suite: 'Foundation', pro: 'Foundation + content ops', enterprise: 'Enterprise plan' } },
        { label: 'Paid media management', values: { support: false, suite: 'Starter', pro: 'Multi-channel', enterprise: 'Custom budget' } },
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
  const sections = useMemo(() => dataByService[service], [service]);

  return (
    <main className="bg-[var(--background)] text-[var(--text1)]">
      {/* HERO */}
      <section className="mx-auto max-w-7xl px-4 pt-10">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <p className="mb-1 text-xs uppercase tracking-[0.16em] text-white/70">Visionara</p>
          <h1 className="text-3xl font-extrabold leading-tight md:text-5xl">Compare plans — side by side</h1>
          <p className="mt-2 max-w-prose text-white/90">
            Pick a service below to see exactly what’s included across plans.
          </p>

          {/* SERVICE SELECTOR */}
          <div className="mt-4 inline-flex rounded-full border border-white/15 bg-white/5 p-1">
            {([
              { key: 'web', label: 'Web App' },
              { key: 'mobile', label: 'Mobile App' },
              { key: 'design', label: 'Graphic Designing' },
              { key: 'marketing', label: 'Marketing' },
            ] as { key: ServiceKey; label: string }[]).map((opt) => (
              <button
                key={opt.key}
                onClick={() => setService(opt.key)}
                className={`px-4 py-2 text-sm rounded-full transition ${
                  service === opt.key
                    ? 'bg-[var(--foreground)] text-black font-semibold'
                    : 'text-[var(--text1)]'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* SIDE-BY-SIDE COLUMNS */}
      <section className="mx-auto max-w-7xl px-4 pb-12 pt-8">
        {/* Header row */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          {plans.map((p) => (
            <div key={p.key} className="rounded-2xl border border-white/10 bg-white/5 p-5">
              {p.tag && (
                <div className="mb-2 w-fit rounded-full bg-[var(--foreground)] px-3 py-1 text-[10px] font-extrabold text-black">
                  {p.tag}
                </div>
              )}
              <h3 className="text-lg font-bold">{p.name}</h3>
              <div className="mt-2 flex items-baseline gap-3">
                <span className="text-2xl font-extrabold text-[var(--foreground)]">
                  {pricing[p.key].annual}
                </span>
                <span className="text-xs text-white/70">annual / agent</span>
              </div>
              <div className="text-xs text-white/70">or {pricing[p.key].monthly} monthly</div>
              <a
                href={p.key === 'enterprise' ? '/contact' : '#'}
                className={`mt-4 inline-block w-full rounded-xl border border-white/20 px-4 py-2 text-center text-sm font-semibold ${
                  p.tag ? 'bg-[var(--foreground)] text-black' : 'text-[var(--text1)]'
                }`}
              >
                {p.cta}
              </a>
            </div>
          ))}
        </div>

        {/* Sections per plan (rows inside each column) */}
        {sections.map((section) => (
          <div key={section.title} className="mt-6">
            <div className="mb-2 text-sm font-semibold text-white/80">{section.title}</div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
              {plans.map((p) => (
                <div key={p.key} className="overflow-hidden rounded-2xl border border-white/10">
                  <div className="bg-white/[0.06] px-4 py-2 text-sm font-semibold">
                    {p.name}
                  </div>
                  <ul>
                    {section.rows.map((r, i) => (
                      <li
                        key={r.label}
                        className={`flex items-center justify-between gap-3 px-4 py-3 text-sm ${
                          i % 2 ? 'bg-white/[0.03]' : ''
                        }`}
                      >
                        <span className="text-white/90">{r.label}</span>
                        <span>{renderCell(r.values[p.key])}</span>
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
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center">
          <h2 className="text-2xl font-extrabold">Ready to build with Visionara?</h2>
          <p className="mx-auto mt-2 max-w-prose text-white/85">
            Web & mobile apps, standout visuals, and marketing that moves the needle.
          </p>
          <a
            href="/contact"
            className="mt-4 inline-block rounded-full border border-white/20 bg-[var(--foreground)] px-5 py-3 font-semibold text-black"
          >
            Start a project
          </a>
        </div>
      </section>

      <Footer />
    </main>
  );
}
