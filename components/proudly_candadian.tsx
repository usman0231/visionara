'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export default function ProudlyCanadian() {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const reduce = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const ctx = gsap.context(() => {
      // reveal
      gsap.from('.pc__eyebrow, .pc__title, .pc__blurb, .pc__flagWrap', {
        opacity: 0,
        y: 18,
        duration: 0.8,
        ease: 'power3.out',
        stagger: 0.08,
        scrollTrigger: { trigger: ref.current, start: 'top 85%', once: true },
      });

      if (reduce) return;

      // subtle shine across the title
      gsap.to('.pc__titleSheen', { backgroundPositionX: '200%', duration: 3.2, repeat: -1, ease: 'linear' });

      // floating maple leaves
      const leaves = gsap.utils.toArray<HTMLElement>('.pc__leaf');
      leaves.forEach((leaf, i) => {
        const loop = () =>
          gsap.to(leaf, {
            x: gsap.utils.random(-40, 40),
            y: gsap.utils.random(-20, 20),
            rotate: gsap.utils.random(-15, 15),
            duration: gsap.utils.random(4, 7),
            ease: 'sine.inOut',
            onComplete: loop,
          });
        loop();
        // small bob
        gsap.to(leaf, { y: '+=10', duration: 2 + i * 0.15, yoyo: true, repeat: -1, ease: 'sine.inOut' });
      });

      // gentle hover tilt on flag
      const flag = document.querySelector<HTMLElement>('.pc__flag');
      if (flag) {
        const rotX = gsap.quickTo(flag, 'rotateX', { duration: 0.3, ease: 'power2.out' });
        const rotY = gsap.quickTo(flag, 'rotateY', { duration: 0.3, ease: 'power2.out' });
        const lift = gsap.quickTo(flag, 'y', { duration: 0.3, ease: 'power2.out' });
        const onMove = (e: MouseEvent) => {
          const r = flag.getBoundingClientRect();
          const dx = (e.clientX - (r.left + r.width / 2)) / (r.width / 2);
          const dy = (e.clientY - (r.top + r.height / 2)) / (r.height / 2);
          rotX(dy * -5);
          rotY(dx * 5);
          lift(-4);
        };
        const onLeave = () => { rotX(0); rotY(0); lift(0); };
        flag.addEventListener('mousemove', onMove);
        flag.addEventListener('mouseleave', onLeave);
      }
    }, ref);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={ref} className="pc">
      <div className="pc__glow pc__glow--l" aria-hidden />
      <div className="pc__glow pc__glow--r" aria-hidden />

      <header className="pc__header">
        <p className="pc__eyebrow">About Us</p>
        <h2 className="pc__title">
          <span className="pc__titleFill">Proudly Canadian</span>
          <span className="pc__titleSheen" aria-hidden />
        </h2>
        <p className="pc__blurb">
          Built in Canada, serving partners across North America with craftsmanship and care.
        </p>
      </header>

      {/* Flag + badge */}
      <div className="pc__flagWrap">
        {/* Accessible Canadian flag (inline SVG) */}
        <div className="pc__flag" role="img" aria-label="Flag of Canada">
          {/* red bars */}
          <span className="pc__flagBar pc__flagBar--left" />
          <span className="pc__flagBar pc__flagBar--right" />
          {/* maple leaf */}
          <svg className="pc__leafMain" viewBox="0 0 512 512" aria-hidden>
            <path
              d="M256 32l48 96 96-16-64 80 80 16-112 80 16 48-64-16v160h-16V320l-64 16 16-48-112-80 80-16-64-80 96 16 48-96z"
              fill="#d80027"
            />
          </svg>
        </div>

        <div className="pc__madeBadge" aria-hidden>
          <svg width="18" height="18" viewBox="0 0 24 24" className="pc__badgeLeaf" aria-hidden>
            <path
              d="M12 2l1.6 3.5L17 6l-2.2 2.1L15.2 11 12 9.5 8.8 11l.4-2.9L7 6l3.4-.5L12 2z"
              fill="currentColor"
            />
          </svg>
          <span>Made in Canada</span>
        </div>
      </div>

      {/* small floating leaves */}
      <span className="pc__leaf pc__leaf--1" aria-hidden />
      <span className="pc__leaf pc__leaf--2" aria-hidden />
      <span className="pc__leaf pc__leaf--3" aria-hidden />
      <span className="pc__leaf pc__leaf--4" aria-hidden />

      <style jsx>{`
        .pc {
          position: relative;
          width: 100%;
          padding: 5rem 1.25rem 5.5rem;
          margin-inline: auto;
          color: var(--text1);
          background:
            radial-gradient(1200px 380px at 10% -10%, rgba(118,60,172,.12), transparent 45%),
            radial-gradient(900px 280px at 90% 110%, rgba(118,60,172,.12), transparent 45%);
          overflow: hidden;
          isolation: isolate;
        }
        .pc__header {
          text-align: center;
          margin-bottom: 1.4rem;
        }
        .pc__eyebrow {
          letter-spacing: .14em;
          text-transform: uppercase;
          font-size: .8rem;
          opacity: .8;
          margin-bottom: .35rem;
        }
        .pc__title {
          position: relative;
          display: inline-block;
          font-size: clamp(1.9rem, 4vw, 2.6rem);
          line-height: 1.1;
          margin: 0 0 .5rem;
        }
        .pc__titleFill {
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
          animation: textShine 6s ease-in-out infinite;
        }
        .pc__titleFill::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(
            90deg,
            transparent 0%,
            rgba(255, 255, 255, 0.5) 50%,
            transparent 100%
          );
          background-size: 200% 100%;
          animation: shine 5s linear infinite;
          -webkit-background-clip: text;
          background-clip: text;
          mix-blend-mode: overlay;
        }
        .pc__titleSheen {
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
        .pc__blurb {
          opacity: .85;
          max-width: 640px;
          margin: 0 auto;
        }

        /* flag area */
        .pc__flagWrap {
          display: grid;
          place-items: center;
          margin-top: 1.4rem;
        }
        .pc__flag {
          position: relative;
          width: min(560px, 92vw);
          aspect-ratio: 2 / 1; /* Canadian flag proportional area */
          border-radius: 12px;
          background: #fff;
          box-shadow: 0 14px 36px rgba(118,60,172,.25), 0 0 0 1px rgba(255,255,255,.08) inset;
          transform-style: preserve-3d;
          transition: box-shadow .25s ease, transform .25s ease;
        }
        .pc__flag:hover {
          box-shadow: 0 18px 44px rgba(118,60,172,.35), 0 0 0 1px rgba(255,255,255,.12) inset;
        }
        .pc__flagBar {
          position: absolute;
          top: 0; bottom: 0;
          width: 25%;
          background: #d80027; /* Canada red */
          border-radius: 12px 0 0 12px;
        }
        .pc__flagBar--left { left: 0; }
        .pc__flagBar--right { right: 0; border-radius: 0 12px 12px 0; }

        .pc__leafMain {
          position: absolute;
          top: 50%; left: 50%;
          width: 32%;
          transform: translate(-50%, -48%); /* slight up for visual center */
          filter: drop-shadow(0 6px 16px rgba(216,0,39,.35));
        }

        .pc__madeBadge {
          display: inline-flex;
          align-items: center;
          gap: .5rem;
          margin-top: .9rem;
          padding: .4rem .7rem;
          border-radius: 999px;
          font-weight: 700;
          color: #fff;
          background: linear-gradient(90deg, #d80027, #a50b1a);
          box-shadow: 0 10px 24px rgba(216,0,39,.35);
        }
        .pc__badgeLeaf { display: block; }

        /* decorative glows */
        .pc__glow {
          position: absolute;
          width: 700px; height: 700px;
          border-radius: 999px;
          filter: blur(36px);
          pointer-events: none;
          z-index: -1;
          opacity: .55;
        }
        .pc__glow--l {
          left: -180px; top: -140px;
          background: radial-gradient(circle at 50% 50%, rgba(118,60,172,.28), transparent 60%);
        }
        .pc__glow--r {
          right: -180px; bottom: -160px;
          background: radial-gradient(circle at 50% 50%, rgba(118,60,172,.22), transparent 60%);
        }

        /* tiny floating leaves */
        .pc__leaf {
          position: absolute;
          width: 16px; height: 16px;
          background: #d80027;
          clip-path: polygon(50% 0%, 60% 12%, 75% 12%, 66% 25%, 80% 35%, 63% 38%, 66% 55%, 50% 45%, 34% 55%, 37% 38%, 20% 35%, 34% 25%, 25% 12%, 40% 12%);
          filter: drop-shadow(0 4px 8px rgba(216,0,39,.35));
          opacity: .9;
        }
        .pc__leaf--1 { top: 18%; left: 14%; }
        .pc__leaf--2 { top: 28%; right: 12%; }
        .pc__leaf--3 { bottom: 20%; left: 8%; }
        .pc__leaf--4 { bottom: 26%; right: 10%; }

        @media (max-width: 560px) {
          .pc { padding: 4rem 1rem; }
          .pc__leaf { opacity: .7; }
        }
      `}</style>
    </section>
  );
}
