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

const DATA: Record<Category, Record<Tier, Plan>> = {
  Web: {
    Basic: {
      name: 'Basic',
      prices: { onetime: '$500', monthly: '$50/month', yearly: '$500/year' },
      features: [
        '5 Page Website',
        'Responsive Design',
        'Basic SEO',
        'Contact Form',
        'Social Media Integration',
      ],
    },
    Standard: {
      name: 'Standard',
      prices: { onetime: '$1000', monthly: '$100/month', yearly: '$1000/year' },
      features: [
        '10 Page Website',
        'Responsive Design',
        'Advanced SEO',
        'Contact Form',
        'Social Media Integration',
        'Blog Setup',
      ],
    },
    Enterprise: {
      name: 'Enterprise',
      prices: { onetime: '$2000', monthly: '$200/month', yearly: '$2000/year' },
      features: [
        '20 Page Website',
        'Responsive Design',
        'Premium SEO',
        'Contact Form',
        'Social Media Integration',
        'Blog Setup',
        'E-commerce Functionality',
      ],
    },
  },
  Mobile: {
    Basic: {
      name: 'Basic',
      prices: { onetime: '$1000', monthly: '$100/month', yearly: '$1000/year' },
      features: ['Simple App', 'iOS & Android', 'Basic UI/UX', 'Push Notifications'],
    },
    Standard: {
      name: 'Standard',
      prices: { onetime: '$2000', monthly: '$200/month', yearly: '$2000/year' },
      features: [
        'Moderate App',
        'iOS & Android',
        'Advanced UI/UX',
        'Push Notifications',
        'In-App Purchases',
      ],
    },
    Enterprise: {
      name: 'Enterprise',
      prices: { onetime: '$4000', monthly: '$400/month', yearly: '$4000/year' },
      features: [
        'Complex App',
        'iOS & Android',
        'Premium UI/UX',
        'Push Notifications',
        'In-App Purchases',
        'API Integration',
      ],
    },
  },
  Graphic: {
    Basic: {
      name: 'Basic',
      prices: { onetime: '$300', monthly: '$30/month', yearly: '$300/year' },
      features: ['Logo Design', 'Business Card Design', 'Flyer Design'],
    },
    Standard: {
      name: 'Standard',
      prices: { onetime: '$600', monthly: '$60/month', yearly: '$600/year' },
      features: [
        'Logo Design',
        'Business Card Design',
        'Flyer Design',
        'Brochure Design',
        'Social Media Kit',
      ],
    },
    Enterprise: {
      name: 'Enterprise',
      prices: { onetime: '$1200', monthly: '$120/month', yearly: '$1200/year' },
      features: [
        'Logo Design',
        'Business Card Design',
        'Flyer Design',
        'Brochure Design',
        'Social Media Kit',
        'Packaging Design',
      ],
    },
  },
  Marketing: {
    Basic: {
      name: 'Basic',
      prices: { onetime: '$400', monthly: '$40/month', yearly: '$400/year' },
      features: ['Social Media Setup', 'Basic SEO', 'Content Creation'],
    },
    Standard: {
      name: 'Standard',
      prices: { onetime: '$800', monthly: '$80/month', yearly: '$800/year' },
      features: [
        'Social Media Management',
        'Advanced SEO',
        'Content Creation',
        'Email Marketing',
      ],
    },
    Enterprise: {
      name: 'Enterprise',
      prices: { onetime: '$1600', monthly: '$160/month', yearly: '$1600/year' },
      features: [
        'Comprehensive Strategy',
        'Premium SEO',
        'Content Creation',
        'Email Marketing',
        'PPC Campaigns',
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

  const plans = useMemo(() => {
    const group = DATA[category];
    return [group.Basic, group.Standard, group.Enterprise];
  }, [category]);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const ctx = gsap.context(() => {
      if (prefersReduced) return;

      // title + controls reveal
      gsap.from('.pkg__header .reveal', {
        opacity: 0,
        y: 22,
        duration: 0.7,
        ease: 'power2.out',
        stagger: 0.06,
        scrollTrigger: { trigger: sectionRef.current, start: 'top 85%', once: true },
      });

      // cards stagger
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

      // gentle glow orbit
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

    // mouse tilt on hover
    const cards = () =>
      Array.from(sectionRef.current?.querySelectorAll<HTMLElement>('.pkg-card') ?? []);
    const addTilt = (card: HTMLElement) => {
      const rotX = gsap.quickTo(card, 'rotateX', { duration: 0.3, ease: 'power2.out' });
      const rotY = gsap.quickTo(card, 'rotateY', { duration: 0.3, ease: 'power2.out' });
      const lift = gsap.quickTo(card, 'y', { duration: 0.3, ease: 'power2.out' });
      const setBoxShadow = (value: string) => {
        gsap.to(card, { boxShadow: value, duration: 0.3, ease: 'power2.out' });
      };

      const onMove = (e: MouseEvent) => {
        const rect = card.getBoundingClientRect();
        const dx = (e.clientX - (rect.left + rect.width / 2)) / (rect.width / 2);
        const dy = (e.clientY - (rect.top + rect.height / 2)) / (rect.height / 2);
        rotX(dy * -6);
        rotY(dx * 6);
        lift(-6);
        setBoxShadow('0 14px 32px rgba(118,60,172,.35)');
      };
      const onLeave = () => {
        rotX(0);
        rotY(0);
        lift(0);
        setBoxShadow('0 8px 26px rgba(118,60,172,.25)');
      };

      card.addEventListener('mousemove', onMove);
      card.addEventListener('mouseleave', onLeave);
      return () => {
        card.removeEventListener('mousemove', onMove);
        card.removeEventListener('mouseleave', onLeave);
      };
    };
    const cleanups = cards().map(addTilt);

    return () => {
      ctx.revert();
      cleanups.forEach((fn) => fn());
    };
  }, [category, billing]);

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
          {(['Web', 'Mobile', 'Graphic', 'Marketing'] as Category[]).map((c) => (
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
              className={`seg__btn ${billing === b ? 'is-active' : ''}`}
              onClick={() => setBilling(b)}
            >
              {b === 'onetime' ? 'One-time' : b === 'monthly' ? 'Monthly' : 'Yearly'}
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
        :root {
          --background: #000000;
          --foreground: #763cac;
          --text1: #ffffff;
        }
        .pkg {
          position: relative;
          padding: 6rem 1.25rem 7rem;
          max-width: 1200px;
          margin: 0 auto;
          color: var(--text1);
          isolation: isolate;
        }
        .pkg__glow {
          position: absolute;
          width: 700px;
          height: 700px;
          border-radius: 999px;
          left: -180px;
          top: -160px;
          background: radial-gradient(
            circle at 50% 50%,
            rgba(118, 60, 172, 0.3),
            rgba(118, 60, 172, 0) 60%
          );
          filter: blur(36px);
          z-index: -1;
          pointer-events: none;
        }
        .pkg__header {
          text-align: center;
          margin-bottom: 2.2rem;
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
          background: linear-gradient(90deg, var(--text1), var(--foreground));
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }
        .headline-sheen {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(
            120deg,
            rgba(255, 255, 255, 0) 0%,
            rgba(255, 255, 255, 0.18) 30%,
            rgba(255, 255, 255, 0) 60%
          );
          background-size: 200% 100%;
          mix-blend-mode: overlay;
          pointer-events: none;
          animation: sheen 3.2s linear infinite;
        }
        @keyframes sheen {
          from {
            background-position-x: 0%;
          }
          to {
            background-position-x: 200%;
          }
        }

        /* Category pills */
        .pills {
          display: flex;
          flex-wrap: wrap;
          gap: 0.6rem;
          justify-content: center;
          margin: 0.6rem 0 1.2rem;
        }
        .pill {
          border: 1px solid rgba(118, 60, 172, 0.4);
          background: rgba(255, 255, 255, 0.03);
          padding: 0.5rem 0.9rem;
          border-radius: 999px;
          transition: background 0.25s ease, border-color 0.25s ease, transform 0.2s ease;
        }
        .pill:hover {
          transform: translateY(-1px);
          border-color: rgba(118, 60, 172, 0.75);
          background: rgba(255, 255, 255, 0.06);
        }
        .pill.is-active {
          background: radial-gradient(
              1000px 300px at 10% -20%,
              rgba(118, 60, 172, 0.22),
              transparent 40%
            ),
            rgba(255, 255, 255, 0.06);
          border-color: var(--foreground);
        }

        /* Segmented control */
        .seg {
          position: relative;
          display: inline-flex;
          align-items: center;
          gap: 0.2rem;
          padding: 0.35rem;
          border-radius: 999px;
          margin: 0.8rem auto 1.8rem;
          border: 1px solid rgba(118, 60, 172, 0.45);
          background: rgba(255, 255, 255, 0.03);
        }
        .seg__btn {
          position: relative;
          z-index: 1;
          padding: 0.5rem 0.9rem;
          border-radius: 999px;
          font-weight: 600;
          opacity: 0.9;
        }
        .seg__btn.is-active {
          opacity: 1;
        }
        .seg__thumb {
          position: absolute;
          z-index: 0;
          top: 4px;
          bottom: 4px;
          width: calc((100% - 0.7rem) / 3);
          border-radius: 999px;
          background: radial-gradient(
              1200px 300px at 10% -20%,
              rgba(118, 60, 172, 0.25),
              transparent 40%
            ),
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

        /* Grid */
        .grid {
          display: grid;
          grid-template-columns: repeat(12, 1fr);
          gap: 1.25rem;
        }
        .pkg-card {
          grid-column: span 12;
          perspective: 1000px;
          position: relative;
          transform-style: preserve-3d;
        }
        @media (min-width: 700px) {
          .pkg-card {
            grid-column: span 6;
          }
        }
        @media (min-width: 1024px) {
          .pkg-card {
            grid-column: span 4;
          }
        }

        /* Card visuals */
        .pkg-card__border {
          position: absolute;
          inset: 0;
          border-radius: 18px;
          padding: 1px;
          background: linear-gradient(
            180deg,
            rgba(118, 60, 172, 0.55),
            rgba(118, 60, 172, 0.15)
          );
          filter: drop-shadow(0 8px 26px rgba(118, 60, 172, 0.25));
          pointer-events: none;
        }
        .pkg-card__inner {
          position: relative;
          border-radius: 17px;
          background: radial-gradient(
              1200px 300px at 10% -20%,
              rgba(118, 60, 172, 0.12),
              transparent 40%
            ),
            rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(8px);
          padding: 1.3rem;
          min-height: 260px;
          box-shadow: 0 8px 26px rgba(118, 60, 172, 0.25);
          transform-style: preserve-3d;
          will-change: transform, box-shadow;
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
          align-items: baseline;
          justify-content: space-between;
          gap: 1rem;
          margin-bottom: 0.9rem;
        }
        .tier {
          font-size: 1.2rem;
          font-weight: 700;
          letter-spacing: 0.01em;
        }
        .price {
          font-size: clamp(1.6rem, 3.6vw, 2.2rem);
          font-weight: 800;
          background: linear-gradient(90deg, var(--text1), var(--foreground));
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          text-shadow: 0 0 30px rgba(118, 60, 172, 0.15);
        }

        .features {
          display: grid;
          gap: 0.55rem;
          margin: 0.8rem 0 1.1rem;
          padding: 0;
          list-style: none;
        }
        .features li {
          display: grid;
          grid-template-columns: 18px 1fr;
          align-items: center;
          gap: 0.55rem;
          opacity: 0.95;
        }

        .cta {
          width: 100%;
          border-radius: 12px;
          padding: 0.8rem 1rem;
          font-weight: 700;
          border: 1px solid rgba(118, 60, 172, 0.6);
          background: linear-gradient(
              120deg,
              rgba(118, 60, 172, 0.25),
              rgba(118, 60, 172, 0.12)
            ),
            rgba(255, 255, 255, 0.04);
          transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.3s ease;
        }
        .cta:hover {
          transform: translateY(-2px);
          box-shadow: 0 14px 32px rgba(118, 60, 172, 0.35);
          background: linear-gradient(
              120deg,
              rgba(118, 60, 172, 0.32),
              rgba(118, 60, 172, 0.18)
            ),
            rgba(255, 255, 255, 0.06);
        }
      `}</style>
    </section>
  );
}
