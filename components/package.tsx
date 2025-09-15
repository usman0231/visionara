'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

type Billing = 'onetime' | 'monthly' | 'yearly';
type Tier = 'Basic' | 'Standard' | 'Enterprise';
type Category = 'Web' | 'Mobile' | 'Graphic' | 'Marketing';

type Plan = {
  name: Tier;
  prices: Record<Billing, string>;
  features: string[];
};

interface Package {
  id: string;
  category: Category;
  tier: Tier;
  priceOnetime: string;
  priceMonthly: string;
  priceYearly: string;
  features: string[];
  active: boolean;
  sortOrder: number;
}

// Fallback data for when database is unavailable
const FALLBACK_DATA: Record<Category, Record<Tier, Plan>> = {
  Web: {
    Basic: {
      name: 'Basic',
      prices: { onetime: 'CAD $1,499', monthly: 'CAD $99/mo', yearly: 'CAD $1,188/yr' },
      features: [
        '5-page custom website',
        'Free .ca domain + hosting',
        'Mobile-friendly design',
        'Contact form integration',
        'Basic SEO setup',
        '1 hour/month support',
      ],
    },
    Standard: {
      name: 'Standard',
      prices: { onetime: 'CAD $2,499', monthly: 'CAD $199/mo', yearly: 'CAD $2,388/yr' },
      features: [
        '10-page professional site',
        'Custom logo design',
        'Social media integration',
        'Google Business setup',
        'Blog functionality',
        'Advanced contact forms',
        '2 hours/month updates',
      ],
    },
    Enterprise: {
      name: 'Enterprise',
      prices: { onetime: 'CAD $4,000-$5,500', monthly: 'CAD $299/mo', yearly: 'CAD $3,588/yr' },
      features: [
        'Unlimited pages',
        'E-commerce OR reservations',
        'Professional content creation',
        'Marketing analytics',
        'Weekly updates',
        'Custom integrations',
        'Priority support',
      ],
    },
  },
  Mobile: {
    Basic: {
      name: 'Basic',
      prices: { onetime: 'CAD $8-11k', monthly: 'CAD $199/mo', yearly: 'CAD $2,388/yr' },
      features: [
        'Native iOS OR Android app',
        '5-8 core screens',
        'User authentication',
        'Push notifications',
        'App store submission',
        'Basic UI/UX design',
      ],
    },
    Standard: {
      name: 'Standard',
      prices: { onetime: 'CAD $13-18k', monthly: 'CAD $299/mo', yearly: 'CAD $3,588/yr' },
      features: [
        'Cross-platform (iOS + Android)',
        '12-15 screens',
        'User accounts & profiles',
        'Payment integration',
        'Backend API development',
        'Cloud database setup',
      ],
    },
    Enterprise: {
      name: 'Enterprise',
      prices: { onetime: 'CAD $25-30k', monthly: 'CAD $499/mo', yearly: 'CAD $5,988/yr' },
      features: [
        'Complex cross-platform app',
        'Custom backend development',
        'Advanced integrations',
        'Admin dashboard',
        'Advanced security features',
        'Dedicated support team',
      ],
    },
  },
  Graphic: {
    Basic: {
      name: 'Basic',
      prices: { onetime: 'CAD $899', monthly: 'CAD $599/mo', yearly: 'CAD $7,188/yr' },
      features: [
        'Custom logo design (3 concepts)',
        'Business card design',
        'Letterhead template',
        'Brand color palette',
        '1-2 weeks delivery',
      ],
    },
    Standard: {
      name: 'Standard',
      prices: { onetime: 'CAD $2,299', monthly: 'CAD $999/mo', yearly: 'CAD $11,988/yr' },
      features: [
        'Complete brand identity',
        'Logo + 3 variations',
        'Business stationery suite',
        'Social media templates (10)',
        'Brand guidelines document',
        '10 hours/month design work',
      ],
    },
    Enterprise: {
      name: 'Enterprise',
      prices: { onetime: 'CAD $3,799', monthly: 'CAD $1,499/mo', yearly: 'CAD $17,988/yr' },
      features: [
        'Everything in Standard',
        'Marketing material templates',
        'Presentation templates',
        'Email signature designs',
        'Brand photography guidelines',
        'Unlimited design requests',
      ],
    },
  },
  Marketing: {
    Basic: {
      name: 'Basic',
      prices: { onetime: 'Contact for quote', monthly: 'CAD $1,899/mo', yearly: 'CAD $22,788/yr' },
      features: [
        'Social media management (3 platforms)',
        '12 posts per month/platform',
        'Basic SEO optimization',
        'Google Business optimization',
        'Monthly performance reports',
        '6-month contract minimum',
      ],
    },
    Standard: {
      name: 'Standard',
      prices: { onetime: 'Contact for quote', monthly: 'CAD $3,799/mo', yearly: 'CAD $45,588/yr' },
      features: [
        'Social media management (5 platforms)',
        '20 posts per month/platform',
        'Advanced SEO + content marketing',
        'Google Ads management',
        'Email marketing campaigns',
        'Bi-weekly reports',
      ],
    },
    Enterprise: {
      name: 'Enterprise',
      prices: { onetime: 'Contact for quote', monthly: 'CAD $6,999/mo', yearly: 'CAD $83,988/yr' },
      features: [
        'Comprehensive digital strategy',
        'All platforms + LinkedIn/TikTok',
        'Advanced PPC campaigns',
        'Content creation (blogs, videos)',
        'Marketing automation',
        'Dedicated marketing manager',
      ],
    },
  },
};

function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M20 6L9 17l-5-5"
        fill="none"
        stroke="var(--foreground)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function PackagesSection() {
  const sectionRef = useRef<HTMLDivElement | null>(null);
  const [category, setCategory] = useState<Category>('Web');
  const [billing, setBilling] = useState<Billing>('onetime');
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    try {
      const response = await fetch('/api/admin/packages');
      if (!response.ok) {
        // Use fallback data if API fails
        console.warn('API not available, using fallback data');
        setPackages([]);
        setLoading(false);
        return;
      }
      const data = await response.json();
      // Filter only active packages
      const activePackages = data.filter((pkg: Package) => pkg.active);
      setPackages(activePackages);
    } catch (error) {
      // Use fallback data on error
      console.warn('Error fetching packages, using fallback data:', error);
      setPackages([]);
    } finally {
      setLoading(false);
    }
  };

  const plans = useMemo(() => {
    // If we have database packages, use them
    if (packages.length > 0) {
      const categoryPackages = packages
        .filter(pkg => pkg.category === category)
        .sort((a, b) => a.sortOrder - b.sortOrder);

      return categoryPackages.map(pkg => ({
        name: pkg.tier,
        prices: {
          onetime: pkg.priceOnetime,
          monthly: pkg.priceMonthly,
          yearly: pkg.priceYearly
        },
        features: pkg.features
      }));
    }

    // Fall back to hardcoded data if database is empty
    const group = FALLBACK_DATA[category];
    const applyDiscount = (price: string) => {
      if (billing !== 'yearly') return price;
      
      // Extract numeric value and apply 20% discount
      const match = price.match(/CAD \$([0-9,]+)/);
      if (match) {
        const numericValue = parseInt(match[1].replace(',', ''));
        const discountedValue = Math.round(numericValue * 0.8);
        return price.replace(/CAD \$[0-9,]+/, `CAD $${discountedValue.toLocaleString()}`);
      }
      return price;
    };

    return [group.Basic, group.Standard, group.Enterprise].map(plan => ({
      ...plan,
      prices: {
        ...plan.prices,
        yearly: applyDiscount(plan.prices.yearly)
      }
    }));
  }, [category, billing, packages]);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const ctx = gsap.context(() => {
      if (prefersReduced) return;

      gsap.from('.pkg__header .reveal', {
        opacity: 0,
        y: 22,
        duration: 0.7,
        ease: 'power2.out',
        stagger: 0.06,
        scrollTrigger: { trigger: sectionRef.current, start: 'top 85%', once: true },
      });

      gsap.from('.pkg-card', {
        opacity: 0,
        y: 36,
        rotateX: -6,
        transformOrigin: '50% 100%',
        duration: 0.9,
        ease: 'power3.out',
        stagger: 0.08,
        scrollTrigger: { trigger: sectionRef.current, start: 'top 70%', once: true },
      });

      gsap.to('.pkg__glow', {
        x: 60,
        y: -30,
        scale: 1.07,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        duration: 6,
      });
    }, sectionRef);

    return () => ctx.revert();
  }, [category, billing]);

  // Get available categories from database packages
  const availableCategories = useMemo(() => {
    if (packages.length > 0) {
      const categories = [...new Set(packages.map(pkg => pkg.category))].sort();
      return categories;
    }
    return ['Web', 'Mobile', 'Graphic', 'Marketing'] as Category[];
  }, [packages]);

  // Show loading state
  if (loading) {
    return (
      <section className="pkg">
        <div className="pkg__glow" aria-hidden />
        <header className="pkg__header">
          <p className="eyebrow">Pricing</p>
          <h2 className="headline">
            <span className="headline-fill">Packages</span>
          </h2>
        </header>
        <div className="grid">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="pkg-card">
              <div className="pkg-card__inner">
                <div className="animate-pulse">
                  <div className="h-6 bg-gray-200 rounded mb-4"></div>
                  <div className="h-8 bg-gray-200 rounded mb-6"></div>
                  <div className="space-y-3">
                    {[...Array(4)].map((_, j) => (
                      <div key={j} className="h-4 bg-gray-200 rounded"></div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section ref={sectionRef} className="pkg">
      <div className="pkg__glow" aria-hidden />
      <header className="pkg__header">
        <p className="eyebrow reveal">Pricing</p>
        <h2 className="headline reveal">
          <span className="headline-fill">Packages</span>
          <span className="headline-sheen" aria-hidden />
        </h2>

        {/* Category pills */}
        <div className="pills reveal" role="tablist" aria-label="Package categories">
          {availableCategories.map((c) => (
            <button
              key={c}
              role="tab"
              aria-selected={category === c}
              className={`pill ${category === c ? 'is-active' : ''}`}
              onClick={() => setCategory(c)}
            >
              {c}
            </button>
          ))}
        </div>

        {/* Billing segmented control */}
        <div className="seg reveal" role="tablist" aria-label="Billing frequency">
          {(['onetime', 'monthly', 'yearly'] as Billing[]).map((b) => (
            <button
              key={b}
              role="tab"
              aria-selected={billing === b}
              className={`seg__btn ${billing === b ? 'is-active' : ''} ${b === 'yearly' ? 'yearly-btn' : ''}`}
              onClick={() => setBilling(b)}
            >
              {b === 'onetime' ? 'One-time' : b === 'monthly' ? 'Monthly' : 'Yearly'}
              {b === 'yearly' && <span className="discount-badge">20% OFF</span>}
            </button>
          ))}
          <span className={`seg__thumb ${billing}`} aria-hidden />
        </div>
      </header>

      {/* Cards */}
      <div className="grid">
        {plans.map((plan) => (
          <article key={plan.name} className="pkg-card" data-tier={plan.name}>
            <div className="pkg-card__border" aria-hidden />
            {plan.name === 'Standard' && (
              <span className="ribbon" aria-label="Most Popular" style={{ zIndex: 10 }}>
                Most Popular
              </span>
            )}
            <div className="pkg-card__inner">
              <div className="top">
                <h3 className="tier">{plan.name}</h3>
                <div className="price">{plan.prices[billing]}</div>
              </div>

              <ul className="features">
                {plan.features.map((f) => (
                  <li key={f}>
                    <CheckIcon />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              <button className="cta" aria-label={`Choose ${plan.name} ${category} plan`}>
                Choose plan
              </button>
            </div>
          </article>
        ))}
      </div>

      <style jsx>{`
        .pkg {
          position: relative;
          padding: 3rem 1rem 4rem;
          max-width: 100vw;
          overflow-x: hidden;
          margin: 0 auto;
          color: var(--text1);
          isolation: isolate;
        }
        @media (min-width: 640px) {
          .pkg {
            padding: 4rem 1.5rem 5rem;
          }
        }
        @media (min-width: 1024px) {
          .pkg {
            padding: 6rem 2rem 7rem;
          }
        }
        .pkg__glow {
          display: none;
        }
        .pkg__header {
          text-align: center;
          margin-bottom: 1.5rem;
        }
        @media (min-width: 640px) {
          .pkg__header {
            margin-bottom: 2rem;
          }
        }
        @media (min-width: 1024px) {
          .pkg__header {
            margin-bottom: 2.5rem;
          }
        }
        .eyebrow {
          letter-spacing: 0.12em;
          text-transform: uppercase;
          font-size: 0.8rem;
          opacity: 0.85;
        }
        .headline {
          position: relative;
          display: inline-block;
          font-size: clamp(1.9rem, 4vw, 2.8rem);
          line-height: 1.1;
          margin: 0.35rem 0 1rem;
        }
        .headline-fill {
          position: relative;
          display: inline-block;
          background: linear-gradient(
            110deg,
            var(--text1),
            var(--foreground),
            var(--text1)
          );
          background-size: 300% 100%;
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          animation: textShine 4s ease-in-out infinite;
        }
        .headline-fill::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(
            90deg,
            transparent 0%,
            rgba(255, 255, 255, 0.6) 50%,
            transparent 100%
          );
          background-size: 200% 100%;
          animation: shine 3s linear infinite;
          -webkit-background-clip: text;
          background-clip: text;
          mix-blend-mode: overlay;
        }
        .headline-sheen {
          display: none;
        }
        @keyframes textShine {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }
        @keyframes shine {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }

        /* Category pills */
        .pills {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          justify-content: center;
          margin: 1rem 0 1.5rem;
        }
        @media (min-width: 640px) {
          .pills {
            gap: 0.75rem;
            margin: 1.2rem 0 1.8rem;
          }
        }
        .pill {
          border: 1px solid rgba(118, 60, 172, 0.4);
          background: rgba(255, 255, 255, 0.03);
          padding: 0.6rem 1rem;
          border-radius: 999px;
          transition: background 0.25s ease, border-color 0.25s ease, transform 0.2s ease;
          font-size: clamp(0.85rem, 2vw, 0.95rem);
          font-weight: 500;
        }
        @media (min-width: 640px) {
          .pill {
            padding: 0.7rem 1.2rem;
            font-size: 1rem;
          }
        }
        .pill:hover {
          transform: translateY(-1px);
          border-color: rgba(118, 60, 172, 0.75);
          background: rgba(255, 255, 255, 0.06);
        }
        .pill.is-active {
          background: rgba(118, 60, 172, 0.15),
            rgba(255, 255, 255, 0.06);
          border-color: var(--foreground);
        }

        /* Segmented control */
        .seg {
          position: relative;
          display: flex;
          align-items: stretch;
          gap: 0;
          padding: 0.35rem;
          border-radius: 999px;
          margin: 0.8rem auto 1.8rem;
          border: 1px solid rgba(118, 60, 172, 0.45);
          background: rgba(255, 255, 255, 0.03);
          width: 100%;
          max-width: 400px;
        }
        @media (min-width: 600px) {
          .seg {
            max-width: 450px;
          }
        }
        .seg__btn {
          position: relative;
          z-index: 1;
          padding: 0.6rem 1rem;
          border-radius: 999px;
          font-weight: 600;
          opacity: 0.9;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.4rem;
          flex: 1;
          min-width: 0;
          text-align: center;
          min-height: 2.5rem;
        }
        .seg__btn.is-active {
          opacity: 1;
        }
        .yearly-btn {
          flex-direction: column;
          gap: 0.2rem;
          padding: 0.4rem 0.8rem;
        }
        .discount-badge {
          font-size: 0.65rem;
          background: linear-gradient(90deg, #ff6b35, #f7931e);
          color: white;
          padding: 0.1rem 0.3rem;
          border-radius: 999px;
          font-weight: 700;
          letter-spacing: 0.02em;
          box-shadow: 0 2px 8px rgba(255, 107, 53, 0.3);
          animation: pulse 2s ease-in-out infinite;
          white-space: nowrap;
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        @media (min-width: 600px) {
          .seg__btn {
            padding: 0.6rem 1.2rem;
            min-height: 3rem;
          }
          .yearly-btn {
            flex-direction: row;
            gap: 0.4rem;
            padding: 0.6rem 1.2rem;
          }
          .discount-badge {
            font-size: 0.7rem;
            padding: 0.15rem 0.4rem;
          }
        }
        .seg__thumb {
          position: absolute;
          z-index: 0;
          top: 4px;
          bottom: 4px;
          width: calc((100% - 0.7rem) / 3);
          border-radius: 999px;
          background: rgba(118, 60, 172, 0.2),
            rgba(255, 255, 255, 0.08);
          box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.08),
            0 8px 22px rgba(118, 60, 172, 0.25);
          transition: left 0.28s cubic-bezier(0.22, 0.8, 0.36, 1);
        }
        .seg__thumb.onetime {
          left: 4px;
        }
        .seg__thumb.monthly {
          left: calc(4px + (100% - 0.7rem) / 3 + 0.35rem);
        }
        .seg__thumb.yearly {
          left: calc(4px + 2 * ((100% - 0.7rem) / 3 + 0.35rem));
        }

        /* ===== Responsive grid layout ===== */
        .grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1rem;
          align-items: stretch;
          padding: 0;
          max-width: 100%;
        }
        @media (min-width: 640px) {
          .grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 1.25rem;
          }
        }
        @media (min-width: 768px) {
          .grid {
            grid-template-columns: repeat(3, 1fr);
            gap: 1.5rem;
            max-width: 1200px;
            margin: 0 auto;
          }
        }
        .pkg-card {
          position: relative;
          perspective: 1000px;
          transform-style: preserve-3d;
          height: 100%;
          width: 100%;
        }
        
        /* Force equal heights */
        @media (min-width: 640px) {
          .grid {
            align-items: stretch;
          }
          .pkg-card {
            height: 520px;
          }
        }
        @media (min-width: 768px) {
          .pkg-card {
            height: 550px;
          }
        }

        .pkg-card__border {
          position: absolute;
          inset: 0;
          border-radius: 18px;
          padding: 1px;
          background: linear-gradient(180deg, rgba(118, 60, 172, 0.55), rgba(118, 60, 172, 0.15));
          filter: drop-shadow(0 8px 26px rgba(118, 60, 172, 0.25));
          pointer-events: none;
        }

        .pkg-card__inner {
          position: relative;
          border-radius: 17px;
          background: rgba(118, 60, 172, 0.08),
            rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(8px);
          padding: 1.3rem;
          height: 100%;
          box-shadow: 0 8px 26px rgba(118, 60, 172, 0.25);
          will-change: transform, box-shadow;
          display: grid;
          grid-template-rows: auto 1fr auto;
          gap: 0.8rem;
          overflow: hidden;
        }
        
        /* Ensure consistent inner dimensions */
        @media (min-width: 640px) {
          .pkg-card__inner {
            padding: 1.5rem;
            gap: 1rem;
          }
        }
        @media (min-width: 768px) {
          .pkg-card__inner {
            padding: 1.75rem;
            gap: 1.2rem;
          }
        }

        .ribbon {
          position: absolute;
          top: 10px;
          right: 10px;
          background: linear-gradient(90deg, var(--foreground), #8b5bd4);
          color: white;
          padding: 0.35rem 0.6rem;
          font-size: 0.75rem;
          border-radius: 999px;
          box-shadow: 0 6px 18px rgba(118, 60, 172, 0.4);
        }

        .top {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          margin: 0;
        }
        @media (min-width: 640px) {
          .top {
            flex-direction: row;
            align-items: baseline;
            justify-content: space-between;
            gap: 1rem;
          }
        }
        .tier {
          font-size: 1.2rem;
          font-weight: 700;
          letter-spacing: 0.01em;
        }
        .price {
          font-size: clamp(1.2rem, 2.8vw, 1.6rem);
          font-weight: 800;
          background: linear-gradient(90deg, var(--text1), var(--foreground));
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          text-shadow: 0 0 30px rgba(118, 60, 172, 0.15);
          line-height: 1.2;
          word-break: break-word;
        }

        .features {
          display: grid;
          gap: 0.5rem;
          margin: 0;
          padding: 0;
          list-style: none;
          overflow-y: auto;
          min-height: 0;
        }
        .features li {
          display: grid;
          grid-template-columns: 18px 1fr;
          align-items: flex-start;
          gap: 0.5rem;
          opacity: 0.95;
          font-size: 0.95rem;
          line-height: 1.4;
        }
        @media (min-width: 640px) {
          .features {
            gap: 0.55rem;
          }
          .features li {
            gap: 0.55rem;
            font-size: 1rem;
            line-height: 1.5;
            align-items: center;
          }
        }

        .cta {
          width: 100%;
          border-radius: 12px;
          padding: 0.8rem 1rem;
          font-weight: 700;
          border: 1px solid rgba(118, 60, 172, 0.6);
          background: linear-gradient(120deg, 
            rgba(118, 60, 172, 0.25) 0%, 
            rgba(118, 60, 172, 0.22) 20%, 
            rgba(118, 60, 172, 0.18) 30%, 
            rgba(118, 60, 172, 0.15) 50%, 
            rgba(118, 60, 172, 0.12) 70%, 
            rgba(118, 60, 172, 0.10) 85%, 
            rgba(118, 60, 172, 0.08) 100%),
            rgba(255, 255, 255, 0.04);
          transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.3s ease;
          align-self: end;
        }
        .cta:hover {
          transform: translateY(-2px);
          box-shadow: 0 14px 32px rgba(118, 60, 172, 0.35);
          background: linear-gradient(120deg, 
            rgba(118, 60, 172, 0.32) 0%, 
            rgba(118, 60, 172, 0.28) 20%, 
            rgba(118, 60, 172, 0.25) 30%, 
            rgba(118, 60, 172, 0.22) 50%, 
            rgba(118, 60, 172, 0.18) 70%, 
            rgba(118, 60, 172, 0.15) 85%, 
            rgba(118, 60, 172, 0.12) 100%),
            rgba(255, 255, 255, 0.06);
        }
      `}</style>
    </section>
  );
}
