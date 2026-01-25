'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Footer from '@/components/footer';

type PlanKey = 'basic' | 'standard' | 'enterprise';
type ServiceKey = 'web' | 'mobile' | 'graphic' | 'marketing';

interface Package {
  id: string;
  category: string;
  tier: string;
  priceOnetime: string;
  priceMonthly: string;
  priceYearly: string;
  features: string[];
}

const plans: { key: PlanKey; name: string; tag?: string; cta: string }[] = [
  { key: 'basic', name: 'Basic', cta: 'Get Started' },
  { key: 'standard', name: 'Standard', tag: 'Most Popular', cta: 'Get Started' },
  { key: 'enterprise', name: 'Enterprise', cta: 'Contact Sales' },
];

const serviceLabels: Record<ServiceKey, string> = {
  web: 'Web Development',
  mobile: 'Mobile Apps',
  graphic: 'Graphic Design',
  marketing: 'Marketing',
};

// Fallback pricing data
const FALLBACK_PRICING: Record<ServiceKey, Record<PlanKey, { onetime: string; monthly: string; yearly: string }>> = {
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

// Fallback features data
const FALLBACK_FEATURES: Record<ServiceKey, Record<PlanKey, string[]>> = {
  web: {
    basic: [
      '5 custom website pages',
      'Free .ca domain + hosting',
      'Mobile-friendly design',
      'Basic contact form integration',
      'Basic SEO setup',
      '1 hour/month support & updates',
    ],
    standard: [
      '10 custom website pages',
      'Free .ca domain + hosting',
      'Mobile-friendly design',
      'Advanced contact forms',
      'Standard SEO optimization',
      '2 hours/month support & updates',
      'Custom logo design',
      'Social media integration',
      'Google Business setup',
      'Blog functionality',
    ],
    enterprise: [
      'Unlimited custom pages',
      'Premium hosting',
      'Mobile-friendly design',
      'Custom integrations',
      'Marketing analytics',
      'Weekly updates',
      'Professional branding',
      'Social media integration',
      'Google Business setup',
      'Blog functionality',
      'E-commerce OR reservations',
      'Professional content creation',
      'Priority support',
    ],
  },
  mobile: {
    basic: [
      'iOS OR Android platform',
      '5-8 core screens',
      'User authentication',
      'Push notifications',
      'App store submission',
      'Basic UI/UX design',
      'Basic support',
    ],
    standard: [
      'Cross-platform (iOS + Android)',
      '12-15 screens',
      'User accounts & profiles',
      'Push notifications',
      'App store submission',
      'Professional UI/UX design',
      'Payment integration',
      'Backend API development',
      'Cloud database setup',
      'Standard third-party integrations',
      'Standard support',
    ],
    enterprise: [
      'Complex cross-platform',
      'Unlimited complexity',
      'Advanced security features',
      'Push notifications',
      'App store submission',
      'Custom design system',
      'Advanced payment systems',
      'Custom backend development',
      'Enterprise database architecture',
      'Advanced integrations',
      'Admin dashboard',
      'Dedicated support team',
    ],
  },
  graphic: {
    basic: [
      'Custom logo (3 concepts)',
      'Business card + letterhead',
      'Brand color palette',
      '1-2 weeks delivery',
      'Basic design support',
    ],
    standard: [
      'Logo + 3 variations',
      'Business stationery suite',
      'Brand guidelines document',
      'Social media templates (10)',
      '2-3 weeks delivery',
      '10 hours/month design work',
      'Standard marketing templates',
    ],
    enterprise: [
      'Complete brand identity',
      'Marketing materials',
      'Comprehensive brand guidelines',
      'Unlimited social media templates',
      '3-4 weeks delivery',
      'Unlimited design requests',
      'Presentation templates',
      'Email signature designs',
      'Brand photography guidelines',
      'Marketing material templates',
    ],
  },
  marketing: {
    basic: [
      '3 social media platforms',
      '12 posts/month/platform',
      'Basic SEO optimization',
      'Google Business optimization',
      'Monthly performance reports',
      '6-month minimum contract',
      'Shared account manager',
      'Basic strategy',
    ],
    standard: [
      '5 social media platforms',
      '20 posts/month/platform',
      'Advanced SEO + content marketing',
      'Google Ads management',
      'Bi-weekly reports',
      '6-month minimum contract',
      'Email marketing campaigns',
      'Dedicated account manager',
      'Growth strategy',
      'Multi-channel campaigns',
    ],
    enterprise: [
      'All platforms + LinkedIn/TikTok',
      'Content creation (blogs, videos)',
      'Comprehensive digital strategy',
      'Advanced PPC campaigns',
      'Real-time analytics',
      'Flexible contract terms',
      'Marketing automation',
      'Dedicated marketing manager',
      'Comprehensive digital strategy',
      'Advanced PPC campaigns',
    ],
  },
};

/* ----------------------------- UI helpers ----------------------------- */
const Check = () => (
  <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[var(--foreground)]/20 flex-shrink-0">
    <svg viewBox="0 0 24 24" className="h-3 w-3 fill-[var(--foreground)]">
      <path d="M20.285 6.709a1 1 0 0 1 0 1.414l-9.9 9.9a1 1 0 0 1-1.414 0l-5.256-5.255a1 1 0 1 1 1.414-1.415l4.549 4.55 9.193-9.194a1 1 0 0 1 1.414 0z" />
    </svg>
  </span>
);

/* --------------------------------- Page -------------------------------- */
export default function FeaturesPage() {
  const [service, setService] = useState<ServiceKey>('web');
  const [billing, setBilling] = useState<'onetime' | 'monthly' | 'yearly'>('onetime');
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    try {
      const response = await fetch('/api/packages');
      if (!response.ok) {
        console.warn('API not available, using fallback data');
        setLoading(false);
        return;
      }
      const data = await response.json();
      if (Array.isArray(data) && data.length > 0) {
        setPackages(data);
      }
    } catch (error) {
      console.warn('Error fetching packages, using fallback data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Build pricing from packages or use fallback
  const pricing = useMemo(() => {
    if (packages.length === 0) return FALLBACK_PRICING;

    const result: Record<ServiceKey, Record<PlanKey, { onetime: string; monthly: string; yearly: string }>> = {
      web: { ...FALLBACK_PRICING.web },
      mobile: { ...FALLBACK_PRICING.mobile },
      graphic: { ...FALLBACK_PRICING.graphic },
      marketing: { ...FALLBACK_PRICING.marketing },
    };

    packages.forEach((pkg) => {
      const category = pkg.category.toLowerCase() as ServiceKey;
      const tier = pkg.tier.toLowerCase() as PlanKey;
      if (result[category] && result[category][tier]) {
        result[category][tier] = {
          onetime: pkg.priceOnetime,
          monthly: pkg.priceMonthly,
          yearly: pkg.priceYearly,
        };
      }
    });

    return result;
  }, [packages]);

  // Build features from packages or use fallback
  const features = useMemo(() => {
    if (packages.length === 0) return FALLBACK_FEATURES;

    const result: Record<ServiceKey, Record<PlanKey, string[]>> = {
      web: { ...FALLBACK_FEATURES.web },
      mobile: { ...FALLBACK_FEATURES.mobile },
      graphic: { ...FALLBACK_FEATURES.graphic },
      marketing: { ...FALLBACK_FEATURES.marketing },
    };

    packages.forEach((pkg) => {
      const category = pkg.category.toLowerCase() as ServiceKey;
      const tier = pkg.tier.toLowerCase() as PlanKey;
      if (result[category] && result[category][tier] && pkg.features && pkg.features.length > 0) {
        result[category][tier] = pkg.features;
      }
    });

    return result;
  }, [packages]);

  // Get all unique features across all tiers for the current service
  const allFeaturesForService = useMemo(() => {
    const currentFeatures = features[service];
    const allFeatures: string[] = [];
    const featureSet = new Set<string>();

    // Collect all features in order (basic -> standard -> enterprise)
    ['basic', 'standard', 'enterprise'].forEach((tier) => {
      const tierFeatures = currentFeatures[tier as PlanKey] || [];
      tierFeatures.forEach((feature) => {
        const normalizedFeature = feature.toLowerCase().trim();
        if (!featureSet.has(normalizedFeature)) {
          featureSet.add(normalizedFeature);
          allFeatures.push(feature);
        }
      });
    });

    return allFeatures;
  }, [features, service]);

  // Check if a tier has a specific feature
  const tierHasFeature = (tier: PlanKey, feature: string): boolean => {
    const tierFeatures = features[service][tier] || [];
    const normalizedFeature = feature.toLowerCase().trim();
    return tierFeatures.some((f) => f.toLowerCase().trim() === normalizedFeature);
  };

  return (
    <main className="bg-[var(--background)] text-[var(--text1)] min-h-screen">
      {/* HERO */}
      <section className="mx-auto max-w-7xl px-4 pt-20 pb-8">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 sm:p-6 md:p-8">
          <p className="mb-2 text-xs uppercase tracking-[0.16em] text-white/70">🇨🇦 Visionara</p>
          <h1 className="text-2xl font-extrabold leading-tight sm:text-4xl md:text-6xl">Compare Our Services</h1>
          <p className="mt-4 max-w-prose text-base sm:text-lg text-white/90">
            Detailed breakdown of what's included in each tier across all our service categories.
          </p>

          {/* SERVICE SELECTOR */}
          <div className="mt-6 flex flex-col sm:inline-flex sm:flex-row rounded-xl sm:rounded-full border border-white/15 bg-white/5 p-1 gap-1 sm:gap-0">
            {(['web', 'mobile', 'graphic', 'marketing'] as ServiceKey[]).map((opt) => (
              <button
                key={opt}
                onClick={() => setService(opt)}
                className={`px-4 py-3 text-sm rounded-xl sm:rounded-full transition min-h-[44px] flex items-center justify-center ${
                  service === opt
                    ? 'bg-[var(--foreground)] text-black font-semibold'
                    : 'text-[var(--text1)] hover:text-white active:bg-white/10'
                }`}
              >
                {serviceLabels[opt]}
              </button>
            ))}
          </div>

          {/* BILLING TOGGLE */}
          <div className="mt-4 flex flex-col sm:inline-flex sm:flex-row rounded-xl sm:rounded-full border border-white/15 bg-white/5 p-1 gap-1 sm:gap-0 sm:ml-4">
            {(['onetime', 'monthly', 'yearly'] as const).map((opt) => (
              <button
                key={opt}
                onClick={() => setBilling(opt)}
                className={`px-4 py-2 text-sm rounded-xl sm:rounded-full transition min-h-[44px] flex items-center justify-center ${
                  billing === opt
                    ? 'bg-[var(--foreground)] text-black font-semibold'
                    : 'text-[var(--text1)] hover:text-white active:bg-white/10'
                }`}
              >
                {opt === 'onetime' ? 'One-time' : opt === 'monthly' ? 'Monthly' : 'Yearly'}
                {opt === 'yearly' && <span className="ml-1 text-xs bg-orange-500 text-white px-1.5 py-0.5 rounded">20% OFF</span>}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING CARDS */}
      <section className="mx-auto max-w-7xl px-4 pb-8">
        <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-3">
          {plans.map((p) => (
            <div key={p.key} className="rounded-2xl border border-white/10 bg-white/5 p-4 sm:p-6 relative">
              {p.tag && (
                <div className="absolute -top-3 left-6 w-fit rounded-full bg-[var(--foreground)] px-4 py-1 text-xs font-extrabold text-black">
                  {p.tag}
                </div>
              )}
              <h3 className="text-lg sm:text-xl font-bold mt-2">{p.name}</h3>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-xl sm:text-2xl md:text-3xl font-extrabold text-[var(--foreground)]">
                  {pricing[service][p.key][billing]}
                </span>
              </div>
              {service !== 'marketing' && (
                <div className="text-sm text-white/70 mt-2">
                  Monthly: {pricing[service][p.key].monthly}
                  <br />
                  Yearly: {pricing[service][p.key].yearly} {billing === 'yearly' && <span className="text-orange-400">(20% off)</span>}
                </div>
              )}
              <a
                href="/contact"
                className={`mt-6 inline-block w-full rounded-xl border border-white/20 px-4 py-3 text-center text-sm font-semibold transition hover:bg-white/5 active:bg-white/10 min-h-[44px] flex items-center justify-center ${
                  p.tag ? 'bg-[var(--foreground)] text-black hover:bg-[var(--foreground)]/90' : 'text-[var(--text1)]'
                }`}
              >
                {p.cta}
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES COMPARISON */}
      <section className="mx-auto max-w-7xl px-4 pb-12">
        <div className="mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-white/95">{serviceLabels[service]} Features</h2>
          <p className="mt-2 text-white/70">Compare what's included in each tier</p>
        </div>

        {loading ? (
          <div className="text-center py-12 text-white/60">Loading features...</div>
        ) : (
          <>
            {/* Desktop: Full Comparison Table */}
            <div className="hidden md:block overflow-hidden rounded-2xl border border-white/10">
              <table className="w-full">
                <thead>
                  <tr className="bg-white/[0.08]">
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white/90 w-1/3">Feature</th>
                    {plans.map((p) => (
                      <th key={p.key} className="px-6 py-4 text-center text-sm font-semibold text-white/90">
                        {p.name}
                        {p.tag && <span className="ml-2 text-xs text-[var(--foreground)]">★</span>}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {allFeaturesForService.map((feature, idx) => (
                    <tr key={feature} className={idx % 2 ? 'bg-white/[0.03]' : ''}>
                      <td className="px-6 py-4 text-sm text-white/90">{feature}</td>
                      {plans.map((p) => (
                        <td key={p.key} className="px-6 py-4 text-center">
                          {tierHasFeature(p.key, feature) ? (
                            <span className="inline-flex justify-center">
                              <Check />
                            </span>
                          ) : (
                            <span className="text-white/30">—</span>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile: Card-based Feature Lists */}
            <div className="md:hidden space-y-6">
              {plans.map((p) => (
                <div key={p.key} className="rounded-2xl border border-white/10 overflow-hidden">
                  <div className="bg-white/[0.08] px-5 py-4 flex items-center justify-between">
                    <span className="text-lg font-semibold">{p.name}</span>
                    {p.tag && (
                      <span className="text-xs bg-[var(--foreground)] text-black px-2 py-1 rounded-full font-semibold">
                        {p.tag}
                      </span>
                    )}
                  </div>
                  <div className="p-4">
                    <div className="mb-3">
                      <span className="text-2xl font-extrabold text-[var(--foreground)]">
                        {pricing[service][p.key][billing]}
                      </span>
                    </div>
                    <ul className="space-y-3">
                      {features[service][p.key].map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-3 text-sm text-white/90">
                          <Check />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <a
                      href="/contact"
                      className={`mt-6 inline-block w-full rounded-xl border border-white/20 px-4 py-3 text-center text-sm font-semibold transition ${
                        p.tag ? 'bg-[var(--foreground)] text-black' : 'text-[var(--text1)] hover:bg-white/5'
                      }`}
                    >
                      {p.cta}
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </section>

      {/* FEATURE COUNT SUMMARY */}
      <section className="mx-auto max-w-7xl px-4 pb-12">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {plans.map((p) => {
            const featureCount = features[service][p.key].length;
            return (
              <div
                key={p.key}
                className={`rounded-xl border p-4 text-center ${
                  p.tag ? 'border-[var(--foreground)]/50 bg-[var(--foreground)]/10' : 'border-white/10 bg-white/5'
                }`}
              >
                <div className="text-3xl font-extrabold text-[var(--foreground)]">{featureCount}</div>
                <div className="text-sm text-white/70">{p.name} Features</div>
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 pb-16">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 sm:p-6 md:p-8 text-center">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold">Ready to start your project?</h2>
          <p className="mx-auto mt-4 max-w-prose text-base sm:text-lg text-white/85">
            From web apps to mobile solutions, stunning visuals to growth marketing — we've got you covered.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mt-6">
            <Link
              href="/contact"
              className="inline-block rounded-full border border-white/20 bg-[var(--foreground)] px-6 sm:px-8 py-3 sm:py-4 font-semibold text-black hover:bg-[var(--foreground)]/90 active:bg-[var(--foreground)]/80 transition min-h-[44px] flex items-center justify-center"
            >
              Start a project
            </Link>
            <Link
              href="/"
              className="inline-block rounded-full border border-white/20 px-6 sm:px-8 py-3 sm:py-4 font-semibold text-[var(--text1)] hover:bg-white/5 active:bg-white/10 transition min-h-[44px] flex items-center justify-center"
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
