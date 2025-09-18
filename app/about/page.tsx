'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Footer from '@/components/footer';
import Stats from '@/components/stats';

gsap.registerPlugin(ScrollTrigger);

interface AboutContent {
  id: string;
  section: 'hero' | 'story' | 'values' | 'services' | 'tech' | 'testimonials' | 'cta' | 'stats';
  title: string;
  subtitle: string | null;
  content: Record<string, any>;
  sortOrder: number;
}

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string | null;
}

// Fallback data (existing hardcoded content)
const FALLBACK_DATA = {
  hero: {
    title: 'We turn bold ideas into beautiful, scalable products.',
    subtitle: 'About Visionara',
    content: {
      description: 'Visionara is a studio of builders, designers, and strategists crafting high-impact digital experiences. From concept to launch, we deliver modern web apps, mobile apps, striking graphics, and growth-driven marketing.',
      buttons: [
        { text: 'Start a project', href: '/contact', primary: true },
        { text: 'Our capabilities', href: '#services', primary: false }
      ],
      image: { src: '/images/final_transparent.png', alt: 'Visionara logo' }
    }
  },
  story: {
    title: 'Our story',
    content: {
      text: 'We started Visionara to give founders and product teams a partner who sweats the details. Today we\'re a cross-disciplinary crew shipping software and brands for fintech, SaaS, and consumer products�?"always balancing speed, craft, and measurable impact.'
    }
  },
  values: {
    title: 'What we value',
    content: {
      items: [
        { title: 'Clarity', description: 'Simple interfaces. Clear roadmaps. No jargon.' },
        { title: 'Craft', description: 'From pixels to pipelines, we obsess over quality.' },
        { title: 'Speed', description: 'Short cycles, steady momentum, real outcomes.' },
        { title: 'Ownership', description: 'We act like product owners�?"proactive and accountable.' }
      ]
    }
  },
  services: {
    title: 'What we do',
    content: {
      layout: 'grid',
      columns: 4,
      accentColor: '#6366F1',
      items: [
        { title: 'Web App Development', items: ['Next.js / React / Node', 'Design systems & a11y', 'Testing, CI/CD, cloud'] },
        { title: 'Mobile App Development', items: ['React Native / Flutter', 'Offline-first & push', 'App Store / Play deploys'] },
        { title: 'Graphic Designing', items: ['Logos, UI kits, decks', 'Illustration & motion', 'Print & packaging'] },
        { title: 'Marketing', items: ['Positioning & messaging', 'Landing pages & CRO', 'Paid, SEO, analytics'] }
      ]
    }
  },
  tech: {
    title: 'Tech we love',
    content: {
      technologies: ['Next.js', 'React', 'TypeScript', 'Node.js', 'Prisma', 'PostgreSQL', 'Firebase', 'AWS', 'Vercel', 'Flutter', 'React Native', 'Figma']
    }
  },
  testimonials: {
    title: 'What clients say',
    content: {
      testimonials: [
        { quote: '"Visionara delivered a polished MVP in five weeks and nailed our brand."', attribution: '�?" Product Lead, Fintech' },
        { quote: '"The team is proactive, communicative, and deeply technical. True partners."', attribution: '�?" CTO, SaaS Startup' },
        { quote: '"Our conversion rate doubled after their redesign and CRO experiments."', attribution: '�?" Growth Manager, DTC' }
      ]
    }
  },
  cta: {
    title: 'Let\'s build what\'s next.',
    content: {
      description: 'Tell us where you\'re headed�?"we\'ll help you get there faster.',
      button: { text: 'Book a discovery call', href: '/contact' }
    }
  }
};
const FALLBACK_FAQS = [
  { question: 'What engagement models do you offer?', answer: 'Fixed-scope projects, monthly product pods, or augmenting your in-house team.' },
  { question: 'Do you work with early-stage startups?', answer: 'Yesâ€”MVPs and rapid validation are our sweet spot.' },
  { question: 'Can you take over an existing codebase?', answer: 'Absolutely. We audit, stabilize, and then ship improvements in short sprints.' }
];

export default function AboutPage() {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [aboutContent, setAboutContent] = useState<Record<string, AboutContent>>({});
  const [sortedSections, setSortedSections] = useState<AboutContent[]>([]);
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch content from database
  useEffect(() => {
    const fetchContent = async () => {
      try {
        // Fetch about content and FAQs in parallel
        const [aboutResponse, faqResponse] = await Promise.all([
          fetch('/api/about-content').catch(() => null),
          fetch('/api/faqs').catch(() => null)
        ]);

        // Process about content
        if (aboutResponse?.ok) {
          const aboutData = await aboutResponse.json();
          // Store both sorted array and map for easy access
          setSortedSections(aboutData);
          const contentMap: Record<string, AboutContent> = {};
          aboutData.forEach((item: AboutContent) => {
            contentMap[item.section] = item;
          });
          setAboutContent(contentMap);
        }

        // Process FAQs
        if (faqResponse?.ok) {
          const faqData = await faqResponse.json();
          setFaqs(faqData);
        }
      } catch (error) {
        console.warn('Failed to fetch content, using fallback data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, []);

  // Helper function to get content with fallback
  const getContent = (section: keyof typeof FALLBACK_DATA) => {
    return aboutContent[section] || FALLBACK_DATA[section];
  };

  // Get FAQs with fallback
  const displayFaqs = faqs.length > 0 ? faqs : FALLBACK_FAQS;

  // Function to render individual sections dynamically
  const renderSection = (section: AboutContent) => {
    const content = section.content;

    switch (section.section) {
      case 'hero':
        return (
          <section key={section.id} className="grid items-center gap-8 md:grid-cols-2">
            <div>
              <p className="hero-in mb-2 inline-block text-xs uppercase tracking-[0.16em] text-[var(--text1)]/70">
                {section.subtitle || 'About Visionara'}
              </p>
              <h1 className="hero-in text-3xl font-extrabold leading-tight md:text-5xl">
                {section.title}
              </h1>
              <p className="hero-in mt-3 max-w-prose text-base text-[var(--text1)]/90">
                {content.description}
              </p>
              <div className="hero-in mt-5 flex flex-wrap items-center gap-3">
                {content.buttons?.map((button: any, index: number) => (
                  <a
                    key={index}
                    href={button.href}
                    className={`rounded-xl border border-white/20 px-4 py-3 font-semibold ${
                      button.primary
                        ? 'bg-gradient-to-tr from-[var(--foreground)] to-[var(--foreground)]/70 text-black'
                        : 'text-[var(--text1)] no-underline'
                    }`}
                  >
                    {button.text}
                  </a>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="hero-in relative aspect-square w-full overflow-hidden rounded-2xl border border-white/15 bg-gradient-to-br from-[var(--foreground)]/25 to-transparent">
                <Image
                  src={content.image?.src || '/images/final_transparent.png'}
                  alt={content.image?.alt || 'Visionara logo'}
                  fill
                  sizes="(max-width: 900px) 60vw, 420px"
                  priority
                  className="object-contain p-6"
                />
              </div>
            </div>
          </section>
        );

      case 'story':
        return (
          <section key={section.id} data-animate className="mb-6 rounded-2xl border border-white/10 bg-white/5 p-6">
            <h2 className="mb-1 text-2xl font-bold">{section.title}</h2>
            <p className="text-[var(--text1)]/90">
              {content.text}
            </p>
          </section>
        );

      case 'values':
        return (
          <section key={section.id} data-animate className="mb-10">
            <h2 className="mb-3 text-2xl font-bold">{section.title}</h2>
            <div data-stagger className="grid gap-4 md:grid-cols-4">
              {content.items?.map((item: any) => (
                <article
                  key={item.title}
                  className="rounded-2xl border border-white/10 bg-white/5 p-5"
                >
                  <h3 className="text-lg font-semibold">{item.title}</h3>
                  <p className="mt-1 text-sm text-[var(--text1)]/90">{item.description}</p>
                </article>
              ))}
            </div>
          </section>
        );

      case 'services': {
        const layout = content.layout || 'grid';
        const normalizedColumns =
          typeof content.columns === 'number' ? content.columns : FALLBACK_DATA.services.content.columns;
        const boundedColumns = Math.min(Math.max(Math.round(normalizedColumns || 4), 1), 4) as 1 | 2 | 3 | 4;
        const accentColor = content.accentColor as string | undefined;
        const sectionStyle = content.background
          ? { background: content.background as string }
          : undefined;

        const columnClassMap: Record<1 | 2 | 3 | 4, string> = {
          1: 'md:grid-cols-1 lg:grid-cols-1',
          2: 'md:grid-cols-2 lg:grid-cols-2',
          3: 'md:grid-cols-2 lg:grid-cols-3',
          4: 'md:grid-cols-2 lg:grid-cols-4',
        };

        const layoutClass =
          layout === 'list'
            ? 'space-y-4'
            : layout === 'feature'
            ? 'grid gap-6 md:grid-cols-2'
            : `grid gap-4 ${columnClassMap[boundedColumns]}`;

        const renderServiceIcon = (icon?: string, title?: string) => {
          if (!icon) return null;
          const isImage = icon.startsWith('/') || icon.startsWith('http');
          if (isImage) {
            return (
              <div className="mb-4 h-12 w-12 overflow-hidden rounded-full bg-white/10">
                <Image
                  src={icon}
                  alt={title ? `${title} icon` : 'Service icon'}
                  width={48}
                  height={48}
                  className="h-full w-full object-cover"
                />
              </div>
            );
          }

          return (
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-lg">
              {icon}
            </div>
          );
        };

        const items = Array.isArray(content.items) && content.items.length
          ? content.items
          : FALLBACK_DATA.services.content.items;

        return (
          <section
            key={section.id}
            id="services"
            data-animate
            className="mb-12 rounded-3xl border border-white/10 bg-white/5 p-6 shadow-lg shadow-black/10 backdrop-blur"
            style={sectionStyle}
          >
            <div className="mb-6 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
              <div>
                <h2 className="text-2xl font-bold md:text-3xl">{section.title}</h2>
                {section.subtitle && (
                  <p className="mt-1 max-w-3xl text-[var(--text1)]/85">{section.subtitle}</p>
                )}
              </div>
            </div>
            <div data-stagger className={layoutClass}>
              {items.map((service: any, serviceIndex: number) => {
                const cardAccent = service.accentColor || accentColor;
                const cardStyle = cardAccent
                  ? { borderColor: cardAccent, boxShadow: `0 18px 42px -28px ${cardAccent}` }
                  : undefined;
                const badgeStyle = cardAccent ? { color: cardAccent } : undefined;
                const details: string[] = Array.isArray(service.items) ? service.items : [];

                return (
                  <article
                    key={service.title || serviceIndex}
                    className="rounded-2xl border border-white/12 bg-white/[0.07] p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl hover:shadow-black/15"
                    style={cardStyle}
                  >
                    {renderServiceIcon(service.icon, service.title)}
                    <h3 className="text-lg font-semibold text-[var(--foreground)]">{service.title}</h3>
                    {service.tagline && (
                      <p className="mt-1 text-xs font-semibold uppercase tracking-wide" style={badgeStyle}>
                        {service.tagline}
                      </p>
                    )}
                    {service.description && (
                      <p className="mt-3 text-sm text-[var(--text1)]/85">{service.description}</p>
                    )}
                    {details.length > 0 && (
                      <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-[var(--text1)]/90">
                        {details.map((detail, detailIndex) => (
                          <li key={`${service.title || serviceIndex}-${detailIndex}`}>{detail}</li>
                        ))}
                      </ul>
                    )}
                    {service.cta && service.cta.text && service.cta.href && (
                      <a
                        href={service.cta.href}
                        className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-[var(--foreground)]"
                      >
                        {service.cta.text}
                        <span aria-hidden>→</span>
                      </a>
                    )}
                  </article>
                );
              })}
            </div>
          </section>
        );
      }

      case 'tech':
        return (
          <section key={section.id} data-animate className="mb-10">
            <h2 className="mb-3 text-2xl font-bold">{section.title}</h2>
            <div data-stagger className="flex flex-wrap gap-2">
              {content.technologies?.map((tech: string) => (
                <span
                  key={tech}
                  className="rounded-full border border-white/15 bg-white/5 px-3 py-2 text-sm"
                >
                  {tech}
                </span>
              ))}
            </div>
          </section>
        );

      case 'testimonials':
        return (
          <section key={section.id} data-animate className="mb-10">
            <h2 className="mb-3 text-2xl font-bold">{section.title}</h2>
            <div data-stagger className="grid gap-3 md:grid-cols-3">
              {content.testimonials?.map((testimonial: any, index: number) => (
                <blockquote
                  key={index}
                  className="rounded-2xl border border-white/10 bg-white/5 p-5"
                >
                  <p>{testimonial.quote}</p>
                  <cite className="mt-2 block text-sm text-[var(--text1)]/80 not-italic">{testimonial.attribution}</cite>
                </blockquote>
              ))}
            </div>
          </section>
        );

      case 'stats':
        return (
          <section key={section.id} data-animate className="mb-10">
            <h2 className="mb-3 text-2xl font-bold">{section.title}</h2>
            <div data-stagger className="grid gap-4 md:grid-cols-3">
              {content.stats?.map((stat: any) => (
                <div
                  key={stat.id}
                  className="rounded-xl border border-white/10 bg-white/5 px-6 py-10 text-center"
                >
                  <span className="text-4xl font-extrabold text-[var(--foreground)] md:text-5xl">
                    {stat.prefix && <span>{stat.prefix}</span>}
                    <span className="stat-number">{stat.value}</span>
                    {stat.suffix && <span>{stat.suffix}</span>}
                  </span>
                  <p className="mt-2 text-sm text-[var(--text1)]/90">{stat.label}</p>
                </div>
              ))}
            </div>
          </section>
        );

      case 'cta':
        return (
          <section key={section.id} data-animate className="mb-16 text-center">
            <h2 className="text-3xl font-extrabold">{section.title}</h2>
            <p className="mx-auto mt-2 max-w-prose text-[var(--text1)]/90">
              {content.description}
            </p>
            <a
              href={content.button?.href || '/contact'}
              className="mt-4 inline-block rounded-xl border border-white/20 bg-gradient-to-tr from-[var(--foreground)] to-[var(--foreground)]/70 px-5 py-3 font-semibold text-black"
            >
              {content.button?.text || 'Book a discovery call'}
            </a>
          </section>
        );

      default:
        return null;
    }
  };

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
        {/* Render sections dynamically based on sortOrder from database */}
        {sortedSections.length > 0 ? (
          sortedSections.map((section) => {
            // Hero section gets special container treatment
            if (section.section === 'hero') {
              return renderSection(section);
            }
            return null; // Hero is rendered separately above
          })
        ) : (
          // Fallback hero section if no data
          renderSection({
            id: 'fallback-hero',
            section: 'hero',
            title: FALLBACK_DATA.hero.title,
            subtitle: FALLBACK_DATA.hero.subtitle,
            content: FALLBACK_DATA.hero.content,
            sortOrder: 1
          } as AboutContent)
        )}
      </div>

      {/* FULL-WIDTH STATS WITH COUNT-UP - Fallback only if no database stats */}
      {sortedSections.length === 0 && <Stats />}

      <div className="mx-auto max-w-7xl px-4">
        {/* Render non-hero sections dynamically based on sortOrder */}
        {sortedSections.length > 0 ? (
          sortedSections.map((section) => {
            // Skip hero section as it's rendered above
            if (section.section === 'hero') {
              return null;
            }
            // Skip CTA section as it's rendered after FAQ
            if (section.section === 'cta') {
              return null;
            }
            return renderSection(section);
          })
        ) : (
          // Fallback sections if no data
          <>
            {renderSection({
              id: 'fallback-story',
              section: 'story',
              title: FALLBACK_DATA.story.title,
              subtitle: null,
              content: FALLBACK_DATA.story.content,
              sortOrder: 2
            } as AboutContent)}
            {renderSection({
              id: 'fallback-values',
              section: 'values',
              title: FALLBACK_DATA.values.title,
              subtitle: null,
              content: FALLBACK_DATA.values.content,
              sortOrder: 3
            } as AboutContent)}
            {renderSection({
              id: 'fallback-services',
              section: 'services',
              title: FALLBACK_DATA.services.title,
              subtitle: null,
              content: FALLBACK_DATA.services.content,
              sortOrder: 4
            } as AboutContent)}
            {renderSection({
              id: 'fallback-tech',
              section: 'tech',
              title: FALLBACK_DATA.tech.title,
              subtitle: null,
              content: FALLBACK_DATA.tech.content,
              sortOrder: 5
            } as AboutContent)}
            {renderSection({
              id: 'fallback-testimonials',
              section: 'testimonials',
              title: FALLBACK_DATA.testimonials.title,
              subtitle: null,
              content: FALLBACK_DATA.testimonials.content,
              sortOrder: 6
            } as AboutContent)}
          </>
        )}

        {/* FAQ */}
        <section data-animate className="mb-12">
          <h2 className="mb-3 text-2xl font-bold">FAQs</h2>
          <div className="space-y-3">
            {displayFaqs.map((faq: any, index: number) => (
              <details
                key={faq.id || index}
                className="rounded-xl border border-white/10 bg-white/5 p-4"
              >
                <summary className="cursor-pointer font-semibold">{faq.question}</summary>
                <p className="mt-2 text-sm text-[var(--text1)]/90">{faq.answer}</p>
              </details>
            ))}
          </div>
        </section>

        {/* CTA - Render after FAQ */}
        {sortedSections.length > 0 ? (
          sortedSections.map((section) => {
            if (section.section === 'cta') {
              return renderSection(section);
            }
            return null;
          })
        ) : (
          // Fallback CTA if no data
          renderSection({
            id: 'fallback-cta',
            section: 'cta',
            title: FALLBACK_DATA.cta.title,
            subtitle: null,
            content: FALLBACK_DATA.cta.content,
            sortOrder: 7
          } as AboutContent)
        )}
      </div>

      {/* SITE FOOTER */}
      <Footer />
    </main>
  );
}





