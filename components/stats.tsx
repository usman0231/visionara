'use client';

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface StatData {
  id: string;
  label: string;
  value: number;
  prefix: string | null;
  suffix: string | null;
  sortOrder: number;
}

export default function Stats() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [statsData, setStatsData] = useState<StatData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/stats');
        if (response.ok) {
          const data = await response.json();
          setStatsData(data.stats);
        }
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  useEffect(() => {
    if (loading || statsData.length === 0) return;

    const ctx = gsap.context(() => {
      const numbers = gsap.utils.toArray<HTMLElement>('.stat-number');

      numbers.forEach((el, i) => {
        if (statsData[i]) {
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
        }
      });
    }, containerRef);

    return () => ctx.revert();
  }, [loading, statsData]);

  if (loading) {
    return (
      <section className="w-full bg-[var(--background)] py-12">
        <div className="mx-auto max-w-7xl px-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="rounded-xl border border-white/10 bg-white/5 px-6 py-10 text-center animate-pulse"
              >
                <div className="h-12 bg-white/10 rounded mb-4"></div>
                <div className="h-4 bg-white/10 rounded w-3/4 mx-auto"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section ref={containerRef} className="w-full bg-[var(--background)] py-12">
      <div className="mx-auto max-w-7xl px-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
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
