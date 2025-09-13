'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

type Item = { src: string; alt: string };

const ITEMS: Item[] = [
  { src: '/gallery/s1.png', alt: 'Achievement 1' },
  { src: '/gallery/s2.png', alt: 'Achievement 2' },
  { src: '/gallery/s3.png', alt: 'Achievement 3' },
  { src: '/gallery/s4.png', alt: 'Achievement 4' },
  { src: '/gallery/s5.png', alt: 'Achievement 5' },
  { src: '/gallery/s6.png', alt: 'Achievement 6' },
  { src: '/gallery/s8.png', alt: 'Achievement 7' },
];

export default function AchievementsGallery() {
  const ref = useRef<HTMLDivElement | null>(null);
  const [open, setOpen] = useState<number | null>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const ctx = gsap.context(() => {
      if (reduce) return;

      gsap.from('.ag__header .reveal', {
        opacity: 0,
        y: 18,
        duration: 0.7,
        ease: 'power2.out',
        stagger: 0.06,
        scrollTrigger: { trigger: ref.current, start: 'top 85%', once: true },
      });

      gsap.from('.ag__tile', {
        opacity: 0,
        y: 26,
        scale: 0.98,
        duration: 0.7,
        ease: 'power3.out',
        stagger: 0.06,
        scrollTrigger: { trigger: ref.current, start: 'top 75%', once: true },
      });
    }, ref);

    return () => ctx.revert();
  }, []);

  // Body lock while lightbox open
  useEffect(() => {
    const prev = document.body.style.overflow;
    if (open !== null) document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  return (
    <section ref={ref} className="ag mb-30">
      <header className="ag__header">
        <h2 className="reveal">
          <span className="ag__headlineFill">Our Achievements</span>
          <span className="ag__headlineSheen" aria-hidden />
        </h2>
        <p className="ag__sub reveal">Highlights from our recent work and recognition.</p>
      </header>

      <div className="ag__grid">
        {ITEMS.map((it, i) => (
          <figure
            key={it.src}
            className="ag__tile"
            role="button"
            tabIndex={0}
            aria-label={`Open ${it.alt}`}
            onClick={() => setOpen(i)}
            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setOpen(i)}
          >
            <span className="ag__border" aria-hidden />
            <div className="ag__imgWrap">
              <Image
                fill
                src={it.src}
                alt={it.alt}
                sizes="(max-width: 640px) 92vw, (max-width: 1024px) 45vw, 30vw"
                className="ag__img"
                priority={i < 3}
              />
              <span className="ag__shine" aria-hidden />
            </div>
          </figure>
        ))}
      </div>

      {/* Lightbox (optional) */}
      {open !== null && (
        <div className="ag__lightbox" role="dialog" aria-modal="true" aria-label="Image viewer">
          <button className="ag__close" aria-label="Close" onClick={() => setOpen(null)}>✕</button>
          <button
            className="ag__nav ag__nav--prev"
            aria-label="Previous"
            onClick={() => setOpen((i) => (i! - 1 + ITEMS.length) % ITEMS.length)}
          >‹</button>
          <button
            className="ag__nav ag__nav--next"
            aria-label="Next"
            onClick={() => setOpen((i) => (i! + 1) % ITEMS.length)}
          >›</button>

          <div className="ag__lightboxImgWrap">
            <Image
              key={ITEMS[open].src}
              fill
              src={ITEMS[open].src}
              alt={ITEMS[open].alt}
              sizes="100vw"
              className="ag__lightboxImg"
              priority
            />
          </div>
        </div>
      )}

      <style jsx>{`

        .ag {
          width: min(1200px, 95vw);
          margin-inline: auto;
          padding: 4rem 0 5rem;
          color: var(--text1);
          background:
            radial-gradient(1200px 400px at 10% -10%, rgba(118,60,172,.12), transparent 40%),
            radial-gradient(900px 300px at 90% 110%, rgba(118,60,172,.12), transparent 40%);
        }

        .ag__header { text-align:center; margin-bottom: 1.2rem; }
        .ag__header h2 {
          position: relative;
          display:inline-block;
          font-size: clamp(1.8rem, 4vw, 2.6rem);
          line-height:1.1;
          margin:0 0 .4rem;
        }
        .ag__headlineFill {
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
        .ag__headlineFill::after {
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
        .ag__headlineSheen {
          display: none;
        }
        .ag__sub { opacity:.8; max-width:640px; margin:0 auto; }
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

        /* ——— THE FIX: auto-fit grid + unified aspect ratio ——— */
        .ag__grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 14px;
        }
        .ag__tile {
          position: relative;
          aspect-ratio: 16 / 10;   /* consistent tile height -> clean rows */
          border-radius: 16px;
          cursor: zoom-in;
          outline: none;
        }

        .ag__border {
          position: absolute; inset: 0;
          padding: 1px; border-radius: 16px;
          background: linear-gradient(180deg, rgba(118,60,172,.5), rgba(118,60,172,.15));
          filter: drop-shadow(0 8px 22px rgba(118,60,172,.25));
          pointer-events: none;
        }

        .ag__imgWrap {
          position: absolute; inset: 0;
          border-radius: 15px; overflow: hidden;
          background: rgba(255,255,255,.03);
          backdrop-filter: blur(4px);
          box-shadow: 0 8px 22px rgba(118,60,172,.25);
          transition: transform .25s ease, box-shadow .25s ease;
        }

        .ag__img {
          object-fit: contain;  /* prevents cropping of awards/screens */
          padding: 10px;        /* keeps transparent PNGs off the edges */
          transition: transform .4s ease, opacity .3s ease;
        }

        .ag__tile:hover .ag__imgWrap { transform: translateY(-4px); box-shadow: 0 16px 36px rgba(118,60,172,.35); }
        .ag__tile:hover .ag__img { transform: scale(1.03); }

        .ag__shine {
          position: absolute; inset: 0;
          background: linear-gradient(100deg, transparent 10%, rgba(255,255,255,.16) 45%, transparent 60%);
          transform: translateX(-120%); transition: transform .8s ease; mix-blend-mode: screen;
        }
        .ag__tile:hover .ag__shine { transform: translateX(120%); }

        /* Lightbox */
        .ag__lightbox {
          position: fixed; inset: 0; z-index: 80;
          background: rgba(0,0,0,.85); backdrop-filter: blur(2px);
          display: grid; place-items: center;
        }
        .ag__lightboxImgWrap {
          position: relative;
          width: min(1200px, 92vw);
          height: min(86vh, 92vw);     /* ensures it fits on small screens */
          border-radius: 14px; overflow: hidden;
          border: 1px solid rgba(118,60,172,.4);
          box-shadow: 0 16px 50px rgba(118,60,172,.35);
          background: rgba(0,0,0,.6);
        }
        .ag__lightboxImg { object-fit: contain; }
        .ag__close {
          position: absolute; top: 18px; right: 20px;
          font-size: 18px; padding: .4rem .6rem; border-radius: 10px;
          color: var(--text1); background: rgba(255,255,255,.06); border: 1px solid rgba(255,255,255,.12);
        }
        .ag__nav {
          position: absolute; top: 50%; transform: translateY(-50%);
          font-size: 36px; padding: .2rem .6rem; border-radius: 12px;
          color: var(--text1); background: rgba(255,255,255,.06); border: 1px solid rgba(255,255,255,.12);
        }
        .ag__nav--prev { left: 24px; }
        .ag__nav--next { right: 24px; }
      `}</style>
    </section>
  );
}
