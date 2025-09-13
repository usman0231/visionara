'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export default function VisionQuoteBand() {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const ctx = gsap.context(() => {
      if (reduce) return;

      // reveal
      gsap.from('.vq__eyebrow, .vq__quote, .vq__signature', {
        opacity: 0,
        y: 18,
        duration: 0.8,
        ease: 'power3.out',
        stagger: 0.08,
        scrollTrigger: { trigger: ref.current, start: 'top 85%', once: true },
      });

      // subtle float for blobs
      gsap.to('.vq__glow--l', {
        x: 60, y: -30, scale: 1.05, repeat: -1, yoyo: true, ease: 'sine.inOut', duration: 7,
      });
      gsap.to('.vq__glow--r', {
        x: -40, y: 20, scale: 1.08, repeat: -1, yoyo: true, ease: 'sine.inOut', duration: 6,
      });

      // shimmer through the highlighted words
      gsap.to('.vq__shine', {
        backgroundPositionX: '200%',
        duration: 3.2,
        repeat: -1,
        ease: 'none',
      });
    }, ref);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={ref} className="home_section4 relative w-full min-h-[44vh] grid place-items-center overflow-hidden px-6 py-20">
      {/* Decorative gradient rails */}
      <span className="vq__rail vq__rail--top" aria-hidden />
      <span className="vq__rail vq__rail--bottom" aria-hidden />

      {/* Soft glows */}
      <span className="vq__glow vq__glow--l" aria-hidden />
      <span className="vq__glow vq__glow--r" aria-hidden />

      <div className="max-w-5xl text-center">
        <p className="vq__eyebrow">Our Philosophy</p>

        <blockquote className="vq__quote">
          <span className="vq__quoteMark">“</span>
          At <span className="vq__brand">Visionara</span>, we don’t just build websites or apps — we craft
          <span className="vq__shine"> digital experiences </span>
          that <span className="vq__shine">inspire growth</span> and
          <span className="vq__shine"> innovation</span>.
          <span className="vq__quoteMark">”</span>
        </blockquote>

        <p className="vq__signature">— Team Visionara</p>
      </div>

      <style jsx>{`
        :root {
          --background: #000000;
          --foreground: #763cac;
          --text1: #ffffff;
        }

        .home_section4 {
          background: radial-gradient(1200px 400px at 10% -10%, rgba(118,60,172,.14), transparent 40%),
            radial-gradient(900px 300px at 90% 110%, rgba(118,60,172,.14), transparent 40%),
            var(--background);
          color: var(--text1);
          isolation: isolate;
        }

        /* rails */
        .vq__rail {
          position: absolute;
          left: 0; right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, var(--foreground), transparent);
          opacity: .45;
        }
        .vq__rail--top { top: 0; }
        .vq__rail--bottom { bottom: 0; }

        /* glows */
        .vq__glow {
          position: absolute;
          width: 680px; height: 680px;
          border-radius: 999px;
          filter: blur(40px);
          z-index: -1;
          pointer-events: none;
          opacity: .5;
        }
        .vq__glow--l {
          left: -220px; top: -200px;
          background: radial-gradient(circle at 50% 50%, rgba(118,60,172,.35), rgba(118,60,172,0) 60%);
        }
        .vq__glow--r {
          right: -200px; bottom: -220px;
          background: radial-gradient(circle at 50% 50%, rgba(118,60,172,.28), rgba(118,60,172,0) 60%);
        }

        .vq__eyebrow {
          letter-spacing: .14em;
          text-transform: uppercase;
          font-size: .8rem;
          opacity: .8;
          margin-bottom: .6rem;
        }

        .vq__quote {
          position: relative;
          font-size: clamp(1.4rem, 3.6vw, 2rem);
          line-height: 1.35;
          font-weight: 500;
          margin: 0 auto .75rem;
        }

        .vq__quoteMark {
          font-size: 1.8em;
          line-height: 0;
          vertical-align: -0.25em;
          background: linear-gradient(90deg, var(--text1), var(--foreground));
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          text-shadow: 0 0 30px rgba(118,60,172,.15);
          padding: 0 .1em;
        }

        .vq__brand {
          font-weight: 800;
          padding: .06em .3em;
          border-radius: .5rem;
          background:
            radial-gradient(800px 200px at 10% -20%, rgba(118,60,172,.18), transparent 40%),
            rgba(255,255,255,.04);
          box-shadow: inset 0 0 0 1px rgba(255,255,255,.08);
        }

        /* embedded shine highlight on key words */
        .vq__shine {
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
          animation: textShine 5s ease-in-out infinite;
          border-bottom: 2px solid rgba(118,60,172,.55);
          padding: 0 .18em .04em;
          margin: 0 .06em;
        }
        .vq__shine::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(
            90deg,
            transparent 0%,
            rgba(255, 255, 255, 0.7) 50%,
            transparent 100%
          );
          background-size: 200% 100%;
          animation: shine 4s linear infinite;
          -webkit-background-clip: text;
          background-clip: text;
          mix-blend-mode: overlay;
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

        .vq__signature {
          opacity: .75;
          font-size: .95rem;
          margin-top: .35rem;
        }

        /* small screens: more breathing room */
        @media (max-width: 480px) {
          .home_section4 { padding-top: 3.2rem; padding-bottom: 3.2rem; }
          .vq__quote { font-size: 1.2rem; }
        }
      `}</style>
    </section>
  );
}
