'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

type Review = {
  name: string;
  role?: string;
  rating: number; // 1..5
  text: string;
};

const REVIEWS: Review[] = [
  {
    name: 'Amina K.',
    role: 'Product Designer',
    rating: 5,
    text: 'The experience was buttery smooth. The micro-animations made everything feel premium without being flashy.'
  },
  {
    name: 'Usman H.',
    role: 'Founder, Fintly',
    rating: 5,
    text: 'Fantastic. Performance is snappy and the UI polish stands out—customers noticed immediately.'
  },
  {
    name: 'Sana R.',
    role: 'Marketing Lead',
    rating: 4,
    text: 'Love the details: hover states, subtle glow, and the way cards slide in. Instantly elevated our brand feel.'
  },
  {
    name: 'Zayn M.',
    role: 'Engineer',
    rating: 5,
    text: 'Setup was effortless and the animations are configurable. Dark-mode friendly out of the box.'
  },
];

function Stars({ rating }: { rating: number }) {
  return (
    <div className="stars" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => {
        const filled = i < rating;
        return (
          <svg
            key={i}
            width="18"
            height="18"
            viewBox="0 0 24 24"
            aria-hidden="true"
            className="star"
          >
            <path
              d="M12 3.5l2.8 5.67 6.27.91-4.53 4.41 1.07 6.24L12 17.77 6.39 20.73l1.07-6.24L2.93 10.08l6.27-.91L12 3.5z"
              fill={filled ? 'var(--foreground)' : 'transparent'}
              stroke="var(--foreground)"
              strokeWidth="1.5"
            />
          </svg>
        );
      })}
      <style jsx>{`
        .stars { display:flex; gap:.35rem; align-items:center; }
        .star { flex:0 0 auto; }
      `}</style>
    </div>
  );
}

export default function ReviewsSection() {
  const sectionRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // GSAP + ScrollTrigger safely on client
    gsap.registerPlugin(ScrollTrigger);

    const prefersReduced = typeof window !== 'undefined'
      && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const ctx = gsap.context(() => {
      if (prefersReduced) return;

      // Title + subtitle reveal
      gsap.from('.reviews__header .reveal', {
        opacity: 0,
        y: 24,
        duration: 0.8,
        ease: 'power2.out',
        stagger: 0.08,
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 80%',
          once: true,
        },
      });

      // Card stagger-in on scroll
      gsap.utils.toArray<HTMLElement>('.review-card').forEach((card, i) => {
        gsap.from(card, {
          opacity: 0,
          y: 32,
          rotateX: -6,
          transformOrigin: '50% 100%',
          duration: 0.9,
          ease: 'power3.out',
          delay: i * 0.06,
          scrollTrigger: {
            trigger: card,
            start: 'top 90%',
            toggleActions: 'play none none reverse',
          },
        });
      });

      // Soft floating glow orb (parallax-ish)
      gsap.to('.glow-orb', {
        x: 60,
        y: -30,
        scale: 1.06,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        duration: 6,
      });

      // Subtle spotlight sweep across header
      gsap.to('.headline-sheen', {
        backgroundPositionX: '200%',
        duration: 3.2,
        ease: 'none',
        repeat: -1,
      });
    }, sectionRef);

    // 3D tilt on hover (mouse only)
    const cards = Array.from(
      sectionRef.current?.querySelectorAll<HTMLElement>('.review-card') ?? []
    );
    const cleanups: Array<() => void> = [];

    cards.forEach((card) => {
      const rotX = gsap.quickTo(card, 'rotateX', { duration: 0.3, ease: 'power2.out' });
      const rotY = gsap.quickTo(card, 'rotateY', { duration: 0.3, ease: 'power2.out' });
      const lift = gsap.quickTo(card, 'y', { duration: 0.3, ease: 'power2.out' });
      const setBoxShadow = (value: string) => {
        gsap.to(card, { boxShadow: value, duration: 0.3, ease: 'power2.out' });
      };

      const onMove = (e: MouseEvent) => {
        const rect = card.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dx = (e.clientX - cx) / (rect.width / 2);
        const dy = (e.clientY - cy) / (rect.height / 2);
        rotX(dy * -6);
        rotY(dx * 6);
        lift(-6);
        setBoxShadow('0 12px 30px rgba(118, 60, 172, 0.35)');
      };

      const onLeave = () => {
        rotX(0); rotY(0); lift(0);
        setBoxShadow('0 6px 20px rgba(118, 60, 172, 0.25)');
      };

      card.addEventListener('mousemove', onMove);
      card.addEventListener('mouseleave', onLeave);

      cleanups.push(() => {
        card.removeEventListener('mousemove', onMove);
        card.removeEventListener('mouseleave', onLeave);
      });
    });

    return () => {
      ctx.revert();
      cleanups.forEach((fn) => fn());
    };
  }, []);

  return (
    <section ref={sectionRef} className="reviews">
      <div className="glow-orb" aria-hidden />
      <header className="reviews__header">
        <p className="eyebrow reveal text-white">What people say</p>
        <h2 className="headline reveal">
          <span className="headline-fill">Loved by teams</span>
          <span className="headline-sheen" aria-hidden />
        </h2>
        <p className="sub reveal text-white">
          Subtle motion, striking clarity—crafted for dark mode and performance.
        </p>
      </header>

      <div className="grid">
        {REVIEWS.map((r, idx) => (
          <article className="review-card" key={idx}>
            <div className="review-card__border" aria-hidden />
            <div className="review-card__inner">
              <div className="review-card__top">
                <div className="avatar" aria-hidden>
                  {r.name.split(' ').map(p => p[0]).slice(0,2).join('').toUpperCase()}
                </div>
                <div className="meta">
                  <div className="name">{r.name}</div>
                  {r.role && <div className="role">{r.role}</div>}
                </div>
                <Stars rating={r.rating} />
              </div>
              <p className="text">“{r.text}”</p>
            </div>
          </article>
        ))}
      </div>

      <style jsx>{`
        .reviews {
          position: relative;
          padding: 6rem 1.25rem;
          max-width: 1100px;
          margin: 0 auto;
          isolation: isolate;
          overflow-x: hidden;
        }

        .reviews__header {
          text-align: center;
          margin-bottom: 2.75rem;
        }
        .eyebrow {
          letter-spacing: .12em;
          text-transform: uppercase;
          font-size: .8rem;
          opacity: .8;
        }
        .headline {
          position: relative;
          display: inline-block;
          font-size: clamp(1.8rem, 4vw, 2.6rem);
          line-height: 1.1;
          margin: .35rem 0 .6rem;
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
              rgba(255,255,255,0) 0%,
              rgba(255,255,255,.18) 30%,
              rgba(255,255,255,0) 60%
          );
          background-size: 200% 100%;
          mix-blend-mode: overlay;
          pointer-events: none;
        }
        .sub {
          max-width: 620px;
          margin: 0 auto;
          opacity: .9;
        }

        .grid {
          display: grid;
          grid-template-columns: repeat(12, 1fr);
          gap: 1.25rem;
        }
        .review-card {
          grid-column: span 12;
          perspective: 1000px;
          position: relative;
          transform-style: preserve-3d;
        }
        @media (min-width: 640px) {
          .review-card { grid-column: span 6; }
        }
        @media (min-width: 1024px) {
          .review-card { grid-column: span 4; }
        }

        .review-card__border {
          position: absolute;
          inset: 0;
          border-radius: 16px;
          padding: 1px; /* gradient border thickness */
          background: linear-gradient(180deg,
            rgba(118,60,172,.55),
            rgba(118,60,172,.15)
          );
          filter: drop-shadow(0 6px 20px rgba(118,60,172,.25));
          pointer-events: none;
        }
        .review-card__inner {
          position: relative;
          border-radius: 15px;
          background:
            radial-gradient(1200px 300px at 10% -20%, rgba(118,60,172,.12), transparent 40%),
            rgba(255,255,255,.03);
          backdrop-filter: blur(6px);
          padding: 1.1rem;
          min-height: 200px;
          box-shadow: 0 6px 20px rgba(118,60,172,.25);
          transform-style: preserve-3d;
          will-change: transform, box-shadow;
        }

        .review-card__top {
          display: grid;
          grid-template-columns: auto 1fr auto;
          gap: .75rem 1rem;
          align-items: center;
        }
        .avatar {
          width: 40px; height: 40px;
          border-radius: 999px;
          display: grid; place-items: center;
          font-weight: 700;
          letter-spacing: .02em;
          background: radial-gradient(circle at 30% 30%,
            rgba(118,60,172,.9), rgba(118,60,172,.35));
          color: white;
          box-shadow: inset 0 0 0 1px rgba(255,255,255,.15);
        }
        .meta .name { font-weight: 600; }
        .meta .role { font-size: .85rem; opacity: .8; }

        .text {
          margin-top: .85rem;
          line-height: 1.6;
          color: var(--text1);
          opacity: .95;
        }

        /* floating glow orb behind content */
        .glow-orb {
          position: absolute;
          width: 520px; height: 520px;
          border-radius: 999px;
          left: -160px; top: -120px;
          background: radial-gradient(
            circle at 50% 50%,
            rgba(118,60,172,.28),
            rgba(118,60,172,0) 60%
          );
          filter: blur(30px);
          z-index: -1;
          pointer-events: none;
        }
      `}</style>
    </section>
  );
}
