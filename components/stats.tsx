'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const statsData = [
  { id: 1, value: 20, suffix: '+', label: 'projects shipped' },
  { id: 2, value: 97, suffix: '%', label: 'client satisfaction' },
  { id: 3, value: 6, prefix: '2–', suffix: ' wks', label: 'typical MVP timeline' },
];

export default function Stats() {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const numbers = gsap.utils.toArray<HTMLElement>('.stat-number');

      numbers.forEach((el, i) => {
        const target = statsData[i].value;

        gsap.fromTo(
          el,
          { innerText: 0 },
          {
            innerText: target,
            duration: 1.8,
            ease: 'power1.out',
            snap: { innerText: 1 },
            scrollTrigger: {
              trigger: el,
              start: 'top 85%',
              toggleActions: 'play none none reverse',
            },
            onUpdate() {
              el.innerText = Math.floor(Number(el.innerText)).toString();
            },
          }
        );
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} className="w-full bg-[var(--background)] py-12">
      <div className="mx-auto max-w-7xl px-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {statsData.map((s) => (
            <div
              key={s.id}
              className="rounded-xl border border-white/10 bg-white/5 px-6 py-10 text-center"
            >
              <span className="text-4xl font-extrabold text-[var(--foreground)] md:text-5xl">
                {s.prefix && <span>{s.prefix}</span>}
                <span className="stat-number">{s.value}</span>
                {s.suffix && <span>{s.suffix}</span>}
              </span>
              <p className="mt-2 text-sm text-[var(--text1)]/90">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
