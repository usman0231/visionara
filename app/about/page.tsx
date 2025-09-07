'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Footer from '@/components/footer';
import Stats from '@/components/stats';

gsap.registerPlugin(ScrollTrigger);

export default function AboutPage() {
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Hero intro
      gsap.from('.hero-in', {
        y: 20,
        opacity: 0,
        duration: 0.8,
        ease: 'power3.out',
        stagger: 0.12,
      });

      // Generic reveal
      gsap.utils.toArray<HTMLElement>('[data-animate]').forEach((el) => {
        gsap.from(el, {
          opacity: 0,
          y: 26,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 85%' },
        });
      });

      // Stagger children (cards, pills, quotes)
      gsap.utils.toArray<HTMLElement>('[data-stagger]').forEach((wrap) => {
        gsap.from(wrap.children, {
          y: 16,
          opacity: 0,
          duration: 0.6,
          stagger: 0.08,
          ease: 'power2.out',
          scrollTrigger: { trigger: wrap, start: 'top 85%' },
        });
      });
    }, rootRef);

    return () => ctx.revert();
  }, []);

  return (
    <main
      ref={rootRef}
      className="bg-[var(--background)] text-[var(--text1)]"
    >
      <div className="mx-auto max-w-7xl px-4 pb-10 pt-8">
        {/* HERO */}
        <section className="grid items-center gap-8 md:grid-cols-2">
          <div>
            <p className="hero-in mb-2 inline-block text-xs uppercase tracking-[0.16em] text-[var(--text1)]/70">
              About Visionara
            </p>
            <h1 className="hero-in text-3xl font-extrabold leading-tight md:text-5xl">
              We turn bold ideas into beautiful, scalable products.
            </h1>
            <p className="hero-in mt-3 max-w-prose text-base text-[var(--text1)]/90">
              Visionara is a studio of builders, designers, and strategists crafting high-impact
              digital experiences. From concept to launch, we deliver modern <strong>web apps</strong>,{' '}
              <strong>mobile apps</strong>, striking <strong>graphics</strong>, and growth-driven{' '}
              <strong>marketing</strong>.
            </p>
            <div className="hero-in mt-5 flex flex-wrap items-center gap-3">
              <a
                href="/contact"
                className="rounded-xl border border-white/20 bg-gradient-to-tr from-[var(--foreground)] to-[var(--foreground)]/70 px-4 py-3 font-semibold text-black"
              >
                Start a project
              </a>
              <a
                href="#services"
                className="rounded-xl border border-white/20 px-4 py-3 text-[var(--text1)] no-underline"
              >
                Our capabilities
              </a>
            </div>
          </div>

          <div className="relative">
            <div className="hero-in relative aspect-square w-full overflow-hidden rounded-2xl border border-white/15 bg-gradient-to-br from-[var(--foreground)]/25 to-transparent">
              <Image
                src="/images/final_transparent.png"
                alt="Visionara logo"
                fill
                sizes="(max-width: 900px) 60vw, 420px"
                priority
                className="object-contain p-6"
              />
            </div>
          </div>
        </section>
      </div>

      {/* FULL-WIDTH STATS WITH COUNT-UP */}
      <Stats />

      <div className="mx-auto max-w-7xl px-4">
        {/* STORY */}
        <section data-animate className="mb-6 rounded-2xl border border-white/10 bg-white/5 p-6">
          <h2 className="mb-1 text-2xl font-bold">Our story</h2>
          <p className="text-[var(--text1)]/90">
            We started Visionara to give founders and product teams a partner who sweats the details.
            Today we’re a cross-disciplinary crew shipping software and brands for fintech, SaaS,
            and consumer products—always balancing speed, craft, and measurable impact.
          </p>
        </section>

        {/* VALUES */}
        <section data-animate className="mb-10">
          <h2 className="mb-3 text-2xl font-bold">What we value</h2>
          <div data-stagger className="grid gap-4 md:grid-cols-4">
            {[
              ['Clarity', 'Simple interfaces. Clear roadmaps. No jargon.'],
              ['Craft', 'From pixels to pipelines, we obsess over quality.'],
              ['Speed', 'Short cycles, steady momentum, real outcomes.'],
              ['Ownership', 'We act like product owners—proactive and accountable.'],
            ].map(([title, copy]) => (
              <article
                key={title}
                className="rounded-2xl border border-white/10 bg-white/5 p-5"
              >
                <h3 className="text-lg font-semibold">{title}</h3>
                <p className="mt-1 text-sm text-[var(--text1)]/90">{copy}</p>
              </article>
            ))}
          </div>
        </section>

        {/* SERVICES */}
        <section id="services" data-animate className="mb-10">
          <h2 className="mb-3 text-2xl font-bold">What we do</h2>
          <div data-stagger className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[
              [
                'Web App Development',
                ['Next.js / React / Node', 'Design systems & a11y', 'Testing, CI/CD, cloud'],
              ],
              [
                'Mobile App Development',
                ['React Native / Flutter', 'Offline-first & push', 'App Store / Play deploys'],
              ],
              [
                'Graphic Designing',
                ['Logos, UI kits, decks', 'Illustration & motion', 'Print & packaging'],
              ],
              ['Marketing', ['Positioning & messaging', 'Landing pages & CRO', 'Paid, SEO, analytics']],
            ].map(([title, items]) => (
              <article
                key={title as string}
                className="rounded-2xl border border-white/10 bg-white/5 p-5"
              >
                <h3 className="text-lg font-semibold">{title as string}</h3>
                <ul className="mt-2 list-disc pl-5 text-sm text-[var(--text1)]/90">
                  {(items as string[]).map((i) => (
                    <li key={i}>{i}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>

        {/* TECH */}
        <section data-animate className="mb-10">
          <h2 className="mb-3 text-2xl font-bold">Tech we love</h2>
          <div data-stagger className="flex flex-wrap gap-2">
            {[
              'Next.js',
              'React',
              'TypeScript',
              'Node.js',
              'Prisma',
              'PostgreSQL',
              'Firebase',
              'AWS',
              'Vercel',
              'Flutter',
              'React Native',
              'Figma',
            ].map((t) => (
              <span
                key={t}
                className="rounded-full border border-white/15 bg-white/5 px-3 py-2 text-sm"
              >
                {t}
              </span>
            ))}
          </div>
        </section>

        {/* TESTIMONIALS */}
        <section data-animate className="mb-10">
          <h2 className="mb-3 text-2xl font-bold">What clients say</h2>
          <div data-stagger className="grid gap-3 md:grid-cols-3">
            {[
              [
                '“Visionara delivered a polished MVP in five weeks and nailed our brand.”',
                '— Product Lead, Fintech',
              ],
              [
                '“The team is proactive, communicative, and deeply technical. True partners.”',
                '— CTO, SaaS Startup',
              ],
              [
                '“Our conversion rate doubled after their redesign and CRO experiments.”',
                '— Growth Manager, DTC',
              ],
            ].map(([q, c]) => (
              <blockquote
                key={q}
                className="rounded-2xl border border-white/10 bg-white/5 p-5"
              >
                <p>{q}</p>
                <cite className="mt-2 block text-sm text-[var(--text1)]/80 not-italic">{c}</cite>
              </blockquote>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section data-animate className="mb-12">
          <h2 className="mb-3 text-2xl font-bold">FAQs</h2>
          <div className="space-y-3">
            {[
              [
                'What engagement models do you offer?',
                'Fixed-scope projects, monthly product pods, or augmenting your in-house team.',
              ],
              ['Do you work with early-stage startups?', 'Yes—MVPs and rapid validation are our sweet spot.'],
              [
                'Can you take over an existing codebase?',
                'Absolutely. We audit, stabilize, and then ship improvements in short sprints.',
              ],
            ].map(([q, a]) => (
              <details
                key={q}
                className="rounded-xl border border-white/10 bg-white/5 p-4"
              >
                <summary className="cursor-pointer font-semibold">{q}</summary>
                <p className="mt-2 text-sm text-[var(--text1)]/90">{a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section data-animate className="mb-16 text-center">
          <h2 className="text-3xl font-extrabold">Let’s build what’s next.</h2>
          <p className="mx-auto mt-2 max-w-prose text-[var(--text1)]/90">
            Tell us where you’re headed—we’ll help you get there faster.
          </p>
          <a
            href="/contact"
            className="mt-4 inline-block rounded-xl border border-white/20 bg-gradient-to-tr from-[var(--foreground)] to-[var(--foreground)]/70 px-5 py-3 font-semibold text-black"
          >
            Book a discovery call
          </a>
        </section>
      </div>

      {/* SITE FOOTER */}
      <Footer />
    </main>
  );
}
