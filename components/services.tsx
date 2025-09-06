'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Image from 'next/image';

type Svc = { title: string; icon: string; text: string };

const SERVICES: Svc[] = [
  { title: 'Web Development',         icon: '/icons/computer.gif', text: 'Pixel-perfect, responsive websites with fast load times and clean, scalable code.' },
  { title: 'Mobile App Development',  icon: '/icons/computer.gif', text: 'iOS & Android apps with modern UI and smooth, native-feel interactions.' },
  { title: 'Graphic Designing',       icon: '/icons/computer.gif', text: 'Logos, brand systems, and marketing collateral that feel premium and consistent.' },
  { title: 'Marketing',               icon: '/icons/computer.gif', text: 'Full-funnel strategy across SEO, paid, and lifecycle—creative that converts.' },
];

export default function Services() {
  const sectionRef = useRef<HTMLDivElement | null>(null);
  const stageRef   = useRef<HTMLDivElement | null>(null);
  const trackRef   = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const reduce =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const mm = gsap.matchMedia();

    // Desktop / tablet: horizontal slider
    mm.add('(min-width: 768px)', () => {
      if (!trackRef.current || !stageRef.current || !sectionRef.current) return;

      // Reserve space for header + progress so slides stay centered
      const HEADER_SPACE = 140;
      gsap.set(stageRef.current, { height: `calc(100vh - ${HEADER_SPACE}px)` });

      const distance = () =>
        trackRef.current!.scrollWidth - stageRef.current!.clientWidth;

      // Use PIXELS for X, not xPercent
      const scrollTween = gsap.to(trackRef.current, {
        x: () => -distance(),
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current!,
          pin: true,
          scrub: 1,
          anticipatePin: 1,
          end: () => `+=${distance()}`,
          snap: {
            snapTo: (value) => {
              // snap to slide widths
              const w = stageRef.current!.clientWidth;
              const i = Math.round(Math.abs(value) / w);
              return -i * w;
            },
            duration: 0.35,
            inertia: false,
          },
          invalidateOnRefresh: true,
        },
      });

      if (!reduce) {
        // progress fill
        gsap.to('.svc__progressFill', {
          width: '100%',
          ease: 'none',
          scrollTrigger: {
            trigger: sectionRef.current!,
            start: 'top top',
            end: () => `+=${distance()}`,
            scrub: true,
            invalidateOnRefresh: true,
          },
        });

        // reveal per panel (tied to container animation)
        gsap.utils.toArray<HTMLElement>('.svc__panel').forEach((panel) => {
          const card = panel.querySelector('.svc__card');
          const icon = panel.querySelector('.svc__icon');
          gsap.from(card, {
            opacity: 0,
            y: 44,
            duration: 0.8,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: panel,
              containerAnimation: scrollTween,
              start: 'left center',
              toggleActions: 'play none none reverse',
            },
          });
          gsap.from(icon, {
            y: 30,
            rotate: -6,
            opacity: 0,
            duration: 0.8,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: panel,
              containerAnimation: scrollTween,
              start: 'left 70%',
            },
          });
        });
      }

      return () => ScrollTrigger.getAll().forEach((t) => t.kill());
    });

    // Mobile: stacked cards fade-up
    mm.add('(max-width: 767px)', () => {
      if (reduce) return;
      gsap.utils.toArray<HTMLElement>('.svc__card').forEach((card, i) => {
        gsap.from(card, {
          opacity: 0,
          y: 26,
          duration: 0.7,
          ease: 'power2.out',
          delay: i * 0.05,
          scrollTrigger: { trigger: card, start: 'top 85%', once: true },
        });
      });
    });

    // Floating 3D-ish icons (roaming)
    if (!reduce) {
      const floats = gsap.utils.toArray<HTMLElement>('.svc__float');
      floats.forEach((el, idx) => {
        const loop = () =>
          gsap.to(el, {
            x: gsap.utils.random(-120, 120),
            y: gsap.utils.random(-70, 70),
            rotateX: gsap.utils.random(-25, 25),
            rotateY: gsap.utils.random(-25, 25),
            rotateZ: gsap.utils.random(-15, 15),
            scale: gsap.utils.random(0.9, 1.1),
            duration: gsap.utils.random(4, 7),
            ease: 'sine.inOut',
            onComplete: loop,
          });
        loop();
        gsap.to(el, {
          y: '+=12',
          duration: 2.2 + idx * 0.2,
          yoyo: true,
          repeat: -1,
          ease: 'sine.inOut',
        });
      });
    }

    return () => mm.revert();
  }, []);

  return (
    <section ref={sectionRef} className="home_section2 svc">
      {/* Heading (with requested top margin) */}
      <header className="svc__header">
        <h2 className="svc__title">
          <span className="svc__titleFill">Our Services</span>
          <span className="svc__titleSheen" aria-hidden />
        </h2>
      </header>

      {/* Progress (with margin top) */}
      <div className="svc__progress">
        <span className="svc__progressFill" />
      </div>

      {/* Decorative roaming icons */}
      <div className="svc__floats" aria-hidden>
        <svg className="svc__float svc__float--cube" width="48" height="48" viewBox="0 0 24 24">
          <g transform="translate(2,2)">
            <path d="M10 0 20 6 10 12 0 6Z" fill="url(#g1)" />
            <path d="M20 6v8l-10 6V12z" fill="url(#g2)" />
            <path d="M10 12v8L0 14V6z" fill="url(#g3)" />
            <defs>
              <linearGradient id="g1" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="var(--text1)" stopOpacity=".9" />
                <stop offset="1" stopColor="var(--foreground)" />
              </linearGradient>
              <linearGradient id="g2" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="var(--foreground)" />
                <stop offset="1" stopColor="#8b5bd4" />
              </linearGradient>
              <linearGradient id="g3" x1="1" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="var(--foreground)" stopOpacity=".8" />
                <stop offset="1" stopColor="var(--text1)" stopOpacity=".4" />
              </linearGradient>
            </defs>
          </g>
        </svg>
        <svg className="svc__float svc__float--pyr" width="44" height="44" viewBox="0 0 24 24">
          <g transform="translate(2,2)">
            <path d="M10 0 20 16H0z" fill="url(#p1)" />
            <path d="M10 0 20 16 10 12z" fill="url(#p2)" />
            <defs>
              <linearGradient id="p1" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="var(--text1)" stopOpacity=".9" />
                <stop offset="1" stopColor="var(--foreground)" />
              </linearGradient>
              <linearGradient id="p2" x1="1" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="var(--foreground)" />
                <stop offset="1" stopColor="#8b5bd4" />
              </linearGradient>
            </defs>
          </g>
        </svg>
        <svg className="svc__float svc__float--ring" width="50" height="50" viewBox="0 0 48 48">
          <defs>
            <radialGradient id="r1" cx="50%" cy="50%" r="50%">
              <stop offset="0" stopColor="var(--text1)" stopOpacity=".9" />
              <stop offset="1" stopColor="var(--foreground)" />
            </radialGradient>
          </defs>
          <circle cx="24" cy="24" r="12" fill="none" stroke="url(#r1)" strokeWidth="8" />
          <circle cx="24" cy="24" r="12" fill="none" stroke="rgba(255,255,255,.15)" strokeWidth="2" />
        </svg>
      </div>

      {/* Stage (centers slides under the header) */}
      <div ref={stageRef} className="svc__stage">
        <div ref={trackRef} className="svc__track">
          {SERVICES.map((s) => (
            <section key={s.title} className="svc__panel">
              <article className="svc__card">
                <div className="svc__cardBorder" aria-hidden />
                <div className="svc__iconWrap">
                  <Image src={s.icon} alt={`${s.title} icon`} width={120} height={120} className="svc__icon" />
                  <span className="svc__orb" aria-hidden />
                </div>
                <h3 className="svc__cardTitle">{s.title}</h3>
                <p className="svc__cardText">{s.text}</p>
                <button className="svc__cta">Learn more</button>
              </article>
            </section>
          ))}
        </div>
      </div>

      <style jsx>{`
        .svc { position: relative; width: 100%; height: 100vh; overflow: hidden; color: var(--text1); padding: 0 6vw; }
        .svc__header { position: sticky; top: 0; z-index: 3; text-align: center; margin-top: 2.5rem; }
        .svc__title { position: relative; display: inline-block; font-size: clamp(2rem, 4.6vw, 3.2rem); line-height: 1.1; margin: .4rem 0 .2rem; }
        .svc__titleFill { background: linear-gradient(90deg, var(--text1), var(--foreground)); -webkit-background-clip: text; background-clip: text; color: transparent; }
        .svc__titleSheen { content: ''; position: absolute; inset: 0; background: linear-gradient(120deg, transparent 0%, rgba(255,255,255,.18) 30%, transparent 60%); background-size: 200% 100%; mix-blend-mode: overlay; animation: sheen 3.2s linear infinite; pointer-events: none; }
        @keyframes sheen { from { background-position-x: 0%; } to { background-position-x: 200%; } }

        .svc__progress { position: sticky; top: 3.6rem; z-index: 3; height: 3px; width: min(640px, 90vw); margin: .8rem auto 0; background: rgba(255,255,255,.08); border-radius: 999px; overflow: hidden; }
        .svc__progressFill { display: block; height: 100%; width: 0%; background: linear-gradient(90deg, var(--foreground), #8b5bd4); box-shadow: 0 4px 16px rgba(118,60,172,.4); }

        .svc__floats { position: absolute; inset: 0; pointer-events: none; z-index: 1; }
        .svc__float { position: absolute; filter: drop-shadow(0 10px 20px rgba(118,60,172,.35)); opacity: .9; transform-style: preserve-3d; }
        .svc__float--cube { top: 22%; left: 12%; }
        .svc__float--pyr  { top: 68%; left: 16%; }
        .svc__float--ring { top: 36%; left: 84%; }

        .svc__stage { position: relative; z-index: 2; height: calc(100vh - 140px); display: grid; place-items: center; }
        .svc__track { display: flex; height: 100%; will-change: transform; }
        .svc__panel { min-width: 100%; /* <-- important: match stage width (includes padding) */ height: 100%; display: grid; place-items: center; padding: 0 6vw; }

        .svc__card { position: relative; max-width: 36rem; padding: 1.4rem 1.4rem 1.2rem; border-radius: 18px;
          background: radial-gradient(900px 240px at 10% -10%, rgba(118,60,172,.14), transparent 45%), rgba(255,255,255,.04);
          backdrop-filter: blur(8px); box-shadow: 0 14px 36px rgba(118,60,172,.25); transform-style: preserve-3d; }
        .svc__cardBorder { position: absolute; inset: 0; border-radius: 18px; padding: 1px; background: linear-gradient(180deg, rgba(118,60,172,.55), rgba(118,60,172,.15));
          pointer-events: none; mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0); -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
          -webkit-mask-composite: xor; mask-composite: exclude; }

        .svc__iconWrap { position: relative; width: 120px; height: 120px; margin: 0 auto .6rem; }
        .svc__icon { position: relative; z-index: 1; filter: drop-shadow(0 6px 18px rgba(118,60,172,.35)); transition: transform .3s ease; }
        .svc__orb { position: absolute; inset: -18px; border-radius: 999px; background: radial-gradient(circle at 50% 50%, rgba(118,60,172,.28), rgba(118,60,172,0) 60%); filter: blur(22px); }

        .svc__cardTitle { text-align: center; font-size: 1.4rem; font-weight: 800; margin: .2rem 0 .4rem; }
        .svc__cardText { text-align: center; opacity: .9; line-height: 1.6; max-width: 34rem; margin: 0 auto .9rem; }
        .svc__cta { width: 100%; border-radius: 12px; padding: .8rem 1rem; font-weight: 700; border: 1px solid rgba(118,60,172,.6);
          background: linear-gradient(120deg, rgba(118,60,172,.25), rgba(118,60,172,.12)), rgba(255,255,255,.04); transition: transform .2s, box-shadow .2s, background .25s; }
        .svc__cta:hover { transform: translateY(-2px); box-shadow: 0 14px 32px rgba(118,60,172,.35);
          background: linear-gradient(120deg, rgba(118,60,172,.32), rgba(118,60,172,.18)), rgba(255,255,255,.06); }

        @media (hover: hover) and (pointer: fine) { .svc__card:hover .svc__icon { transform: translateY(-6px) rotate(-2deg) scale(1.02); } }

        @media (max-width: 767px) {
          .svc { height: auto; overflow: visible; padding: 3.25rem 1rem 3rem; }
          .svc__header { position: relative; top: auto; margin-top: 1.8rem; }
          .svc__progress { position: relative; top: auto; margin: .8rem auto 1rem; }
          .svc__stage { height: auto; }
          .svc__track { display: grid; gap: 1rem; }
          .svc__panel { min-width: auto; height: auto; padding: 0; }
        }
      `}</style>
    </section>
  );
}
