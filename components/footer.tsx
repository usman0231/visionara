'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

interface SiteSettings {
  siteName?: string;
  tagline?: string;
  description?: string;
}

interface ContactSettings {
  email?: string;
  phone?: string;
  address?: string;
}

interface SocialSettings {
  facebook?: string;
  twitter?: string;
  instagram?: string;
  linkedin?: string;
  github?: string;
}

// Fallback data
const FALLBACK_SITE: SiteSettings = {
  siteName: 'VISIONARA',
  tagline: 'We craft digital experiences that inspire growth and innovation.',
};

const FALLBACK_CONTACT: ContactSettings = {
  email: 'visionara0231@gmail.com',
  phone: '+1 437-430-3922',
  address: '1454 Dundas St E, Mississauga, ON L4X 1L4',
};

const FALLBACK_SOCIAL: SocialSettings = {
  twitter: '#',
  linkedin: '#',
  github: '#',
  instagram: '#',
};

export default function InteractiveFooter() {
  const ref = useRef<HTMLDivElement | null>(null);
  const [year] = useState<number>(new Date().getFullYear());
  const [copied, setCopied] = useState(false);
  const [site, setSite] = useState<SiteSettings>(FALLBACK_SITE);
  const [contact, setContact] = useState<ContactSettings>(FALLBACK_CONTACT);
  const [social, setSocial] = useState<SocialSettings>(FALLBACK_SOCIAL);

  // Fetch settings from database
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch('/api/settings');
        if (response.ok) {
          const data = await response.json();
          const settings = data.settings || data || [];

          settings.forEach((setting: { key: string; value: any }) => {
            if (setting.key === 'site.info') {
              setSite({ ...FALLBACK_SITE, ...setting.value });
            } else if (setting.key === 'contact.info') {
              setContact({ ...FALLBACK_CONTACT, ...setting.value });
            } else if (setting.key === 'social.links') {
              setSocial({ ...FALLBACK_SOCIAL, ...setting.value });
            }
          });
        }
      } catch (error) {
        console.warn('Using fallback footer data');
      }
    };

    fetchSettings();
  }, []);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const reduce =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const el = ref.current!;
    if (!el) return;

    // spotlight follows cursor
    const move = (e: MouseEvent) => {
      const r = el.getBoundingClientRect();
      el.style.setProperty('--mx', `${e.clientX - r.left}px`);
      el.style.setProperty('--my', `${e.clientY - r.top}px`);
    };
    el.addEventListener('mousemove', move);

    // magnetic buttons
    const magnets = el.querySelectorAll<HTMLElement>('.ft__magnet');
    magnets.forEach((m) => {
      const x = gsap.quickTo(m, 'x', { duration: 0.25, ease: 'power3.out' });
      const y = gsap.quickTo(m, 'y', { duration: 0.25, ease: 'power3.out' });
      const onMove = (e: MouseEvent) => {
        const r = m.getBoundingClientRect();
        const dx = (e.clientX - (r.left + r.width / 2)) / (r.width / 2);
        const dy = (e.clientY - (r.top + r.height / 2)) / (r.height / 2);
        x(dx * 12);
        y(dy * 12);
      };
      const reset = () => { x(0); y(0); };
      m.addEventListener('mousemove', onMove);
      m.addEventListener('mouseleave', reset);
    });

    // floaty orbs + column reveal
    const ctx = gsap.context(() => {
      if (!reduce) {
        gsap.to('.ft__orb--l', { x: 60, y: -30, scale: 1.06, yoyo: true, repeat: -1, ease: 'sine.inOut', duration: 7 });
        gsap.to('.ft__orb--r', { x: -50, y: 30, scale: 1.08, yoyo: true, repeat: -1, ease: 'sine.inOut', duration: 6 });
      }
      gsap.from('.ft__col', {
        opacity: 0,
        y: 22,
        duration: 0.7,
        ease: 'power3.out',
        stagger: 0.08,
        scrollTrigger: { trigger: el, start: 'top 85%', once: true },
      });
    }, ref);

    return () => {
      el.removeEventListener('mousemove', move);
      ctx.revert();
    };
  }, []);

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(contact.email || FALLBACK_CONTACT.email!);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  };

  const scrollTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  // Social icons with their SVG paths
  const socialIcons = [
    {
      key: 'twitter',
      url: social.twitter,
      label: 'Twitter / X',
      svg: <svg width="18" height="18" viewBox="0 0 24 24"><path fill="currentColor" d="M17.5 3h3l-7.5 8.6L22 21h-5.9l-4.6-5.6L6 21H3l8-9.2L2 3h6l4.1 5L17.5 3Z"/></svg>
    },
    {
      key: 'linkedin',
      url: social.linkedin,
      label: 'LinkedIn',
      svg: <svg width="18" height="18" viewBox="0 0 24 24"><path fill="currentColor" d="M6.94 6.5A2.44 2.44 0 1 1 4.5 4.06 2.44 2.44 0 0 1 6.94 6.5ZM4.75 20h4.38V9H4.75v11ZM13 9v11h4.38v-5.83c0-3.21 4.17-3.47 4.17 0V20H26V13.94c0-6.31-6.87-6.07-8.62-2.97V9H13Z"/></svg>
    },
    {
      key: 'github',
      url: social.github,
      label: 'GitHub',
      svg: <svg width="18" height="18" viewBox="0 0 24 24"><path fill="currentColor" d="M12 2a10 10 0 0 0-3.16 19.5c.5.09.68-.22.68-.48v-1.7c-2.78.6-3.36-1.17-3.36-1.17-.46-1.15-1.12-1.45-1.12-1.45-.92-.63.07-.62.07-.62 1.02.07 1.56 1.05 1.56 1.05.9 1.56 2.36 1.11 2.94.85.09-.65.35-1.11.64-1.36-2.22-.26-4.56-1.11-4.56-4.96 0-1.1.39-2 .1-2.7 0 0 .84-.27 2.75 1.03A9.56 9.56 0 0 1 12 7.07c.85 0 1.7.11 2.5.32 1.9-1.3 2.74-1.03 2.74-1.03.54 1.37.2 2.4.1 2.7.62.67 1 1.53 1 2.58 0 3.86-2.34 4.7-4.57 4.96.36.31.69.94.69 1.9v2.82c0 .26.18.57.69.48A10 10 0 0 0 12 2Z"/></svg>
    },
    {
      key: 'instagram',
      url: social.instagram,
      label: 'Instagram',
      svg: <svg width="18" height="18" viewBox="0 0 24 24"><path fill="currentColor" d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5m0 2a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3H7m5 3a5 5 0 1 1 0 10 5 5 0 0 1 0-10m6.5-.25a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5Z"/></svg>
    },
    {
      key: 'facebook',
      url: social.facebook,
      label: 'Facebook',
      svg: <svg width="18" height="18" viewBox="0 0 24 24"><path fill="currentColor" d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c5.05-.5 9-4.76 9-9.95z"/></svg>
    },
  ];

  // Filter out empty social links
  const activeSocials = socialIcons.filter(s => s.url && s.url !== '#' && s.url.trim() !== '');

  return (
    <footer ref={ref} className="ft">
      {/* decorative */}
      <span className="ft__rail" aria-hidden />
      <span className="ft__orb ft__orb--l" aria-hidden />
      <span className="ft__orb ft__orb--r" aria-hidden />

      <div className="ft__grid">
        {/* Brand */}
        <div className="ft__col ft__brand">
          <Link href="/" className="ft__logoLink">
            <Image src="/images/medium_res_logo.webp" alt={`${site.siteName} logo`} width={56} height={56} className="ft__logo mx-auto sm:mx-0" />
            <span className="ft__brandName">{site.siteName}</span>
          </Link>
          <p className="ft__tag">{site.tagline}</p>

          <button className="ft__email" onClick={copyEmail} aria-label="Copy email">
            {contact.email}
            <span className={`ft__copied ${copied ? 'is-on' : ''}`}>Copied!</span>
          </button>

          {activeSocials.length > 0 && (
            <div className="ft__social">
              {activeSocials.map((s) => (
                <a
                  key={s.key}
                  className="ft__magnet ft__socialBtn"
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                >
                  {s.svg}
                </a>
              ))}
            </div>
          )}
        </div>

        {/* Links */}
        <nav className="ft__col">
          <p className="ft__h">Company</p>
          <ul className="ft__list">
            <li><Link href="/about">About</Link></li>
            <li><Link href="/features">Features</Link></li>
            <li><Link href="/">Home</Link></li>
            <li><Link href="/contact">Contact</Link></li>
          </ul>
        </nav>

        <nav className="ft__col">
          <p className="ft__h">Services</p>
          <ul className="ft__list">
            <li><Link href="#web">Web Development</Link></li>
            <li><Link href="#mobile">Mobile Apps</Link></li>
            <li><Link href="#design">Graphic Design</Link></li>
            <li><Link href="#marketing">Marketing</Link></li>
          </ul>
        </nav>

        {/* Newsletter */}
        <div className="ft__col">
          <p className="ft__h">Newsletter</p>
          <form
            className="ft__form"
            onSubmit={(e) => {
              e.preventDefault();
              alert('Thanks! We will keep you posted.');
            }}
          >
            <label className="ft__field">
              <input type="email" required placeholder=" " aria-label="Email address" />
              <span>Email address</span>
            </label>
            <button className="ft__magnet ft__send" aria-label="Subscribe">Subscribe</button>
          </form>
          <p className="ft__note">🇨🇦 Proudly Canadian • Built with care in Canada</p>
        </div>
      </div>

      {/* bottom bar */}
      <div className="ft__bottom">
        <p>© {year} {site.siteName}. All rights reserved.</p>
        <div className="ft__bottomLinks">
          <Link href="#">Privacy</Link>
          <Link href="#">Terms</Link>
          <button className="ft__top" onClick={scrollTop} aria-label="Back to top">↑ Top</button>
        </div>
      </div>

      <style jsx>{`
        .ft {
          position: relative;
          --mx: 50%;
          --my: 0%;
          color: var(--text1);
          padding: 3.6rem 1.25rem 2rem;
          margin-inline: auto;
          border-top-left-radius: 18px;
          border-top-right-radius: 18px;
          background:
            radial-gradient(1000px 300px at 10% -20%, rgba(118,60,172,.14), transparent 40%),
            radial-gradient(900px 280px at 90% 110%, rgba(118,60,172,.12), transparent 45%),
            rgba(255,255,255,0.02);
          backdrop-filter: saturate(140%) blur(10px);
          overflow: hidden !important;
        }

        /* spotlight layer */
        .ft::after {
          content: '';
          position: absolute; inset: 0;
          pointer-events: none;
          background:
            radial-gradient(300px 200px at var(--mx) var(--my), rgba(118,60,172,.18), transparent 70%),
            linear-gradient(180deg, rgba(255,255,255,.04), transparent);
          mix-blend-mode: screen;
        }

        .ft__rail {
          position: absolute; left: 0; right: 0; top: 0; height: 1px;
          background: linear-gradient(90deg, transparent, var(--foreground), transparent);
          opacity: .55;
        }
        .ft__orb {
          position: absolute;
          width: 680px; height: 680px; border-radius: 999px; filter: blur(40px);
          pointer-events: none; z-index: -1; opacity: .45;
        }
        .ft__orb--l { left: -220px; top: -180px; background: radial-gradient(circle,#763cac55,transparent 60%); }
        .ft__orb--r { right: -220px; bottom: -220px; background: radial-gradient(circle,#763cac44,transparent 60%); }

        .ft__grid {
          display: grid;
          grid-template-columns: 1.2fr .8fr .8fr 1fr;
          gap: 2rem 1.4rem;
        }
        @media (max-width: 900px) {
          .ft__grid { grid-template-columns: 1fr 1fr; }
        }
        @media (max-width: 560px) {
          .ft__grid { grid-template-columns: 1fr; }
        }

        .ft__col { min-width: 0; }

        .ft__brand .ft__logoLink {
          display: inline-flex; align-items: center; gap: .7rem; margin-bottom: .4rem;
        }
        .ft__logo {
          filter: drop-shadow(0 6px 16px rgba(118,60,172,.35));
          border-radius: 12px;
        }
        .ft__brandName {
          font-weight: 800; letter-spacing: .18em; font-size: .95rem; opacity: .95;
        }
        .ft__tag { opacity: .85; max-width: 40ch; }

        .ft__email {
          display: inline-flex; align-items: center; gap: .5rem;
          margin-top: .8rem; padding: .45rem .7rem; border-radius: 10px;
          border: 1px solid rgba(255,255,255,.12);
          background: rgba(255,255,255,.04);
          transition: transform .2s ease, box-shadow .2s ease, background .25s ease;
        }
        .ft__email:hover { transform: translateY(-2px); box-shadow: 0 10px 22px rgba(118,60,172,.35); background: rgba(255,255,255,.06); }
        .ft__copied { margin-left: .4rem; font-size: .8rem; opacity: 0; transition: opacity .2s; }
        .ft__copied.is-on { opacity: .9; }

        .ft__h { font-weight: 800; letter-spacing: .04em; margin-bottom: .6rem; }
        .ft__list { list-style: none; padding: 0; margin: 0; display: grid; gap: .4rem; }
        .ft__list a { opacity: .85; }
        .ft__list a:hover { opacity: 1; text-decoration: underline; text-underline-offset: 3px; }

        .ft__form { display: grid; gap: .6rem; max-width: 360px; }
        .ft__field {
          position: relative; display: block;
          border-radius: 12px; overflow: hidden;
          background: rgba(255,255,255,.04);
          border: 1px solid rgba(255,255,255,.12);
        }
        .ft__field input {
          width: 100%; padding: .9rem 1rem .7rem; background: transparent; color: var(--text1);
          outline: none; border: 0;
        }
        .ft__field span {
          position: absolute; left: .95rem; top: .85rem; pointer-events: none;
          opacity: .7; transition: transform .18s ease, opacity .18s ease, font-size .18s ease;
        }
        .ft__field input:focus + span,
        .ft__field input:not(:placeholder-shown) + span {
          transform: translateY(-.8rem) scale(.92); opacity: .9; font-size: .8rem;
        }
        .ft__send {
          justify-self: start;
          border-radius: 12px;
          padding: .7rem 1rem;
          border: 1px solid rgba(118,60,172,.6);
          background: linear-gradient(120deg, rgba(118,60,172,.28), rgba(118,60,172,.14)), rgba(255,255,255,.04);
          font-weight: 700;
          transition: transform .2s, box-shadow .2s, background .25s;
        }
        .ft__send:hover { transform: translateY(-2px); box-shadow: 0 14px 32px rgba(118,60,172,.35); }

        .ft__note { opacity: .75; font-size: .9rem; margin-top: .6rem; }

        .ft__social { display: flex; gap: .6rem; margin-top: .9rem; }
        .ft__socialBtn {
          display: grid; place-items: center; width: 40px; height: 40px; border-radius: 12px;
          color: var(--text1);
          background: rgba(255,255,255,.05);
          border: 1px solid rgba(255,255,255,.12);
          box-shadow: 0 8px 20px rgba(118,60,172,.25);
          transition: transform .2s, background .25s;
        }
        .ft__socialBtn:hover { background: rgba(255,255,255,.08); transform: translateY(-2px); }

        .ft__bottom {
          margin-top: 2rem; padding-top: 1rem;
          display: flex; align-items: center; justify-content: space-between; gap: 1rem;
          border-top: 1px solid rgba(255,255,255,.08);
          opacity: .95;
        }
        .ft__bottomLinks { display: flex; gap: .9rem; align-items: center; }
        .ft__top {
          border: 1px solid rgba(255,255,255,.18);
          background: rgba(255,255,255,.06);
          padding: .35rem .6rem; border-radius: 10px; font-weight: 700;
        }

        @media (max-width: 560px) {
          .ft { padding: 3rem 1rem 1.6rem; }
          .ft__bottom { flex-direction: column; align-items: flex-start; }
        }
          /* Mobile: center-align all footer content */
        @media (max-width: 560px) {
            .ft {
                text-align: center;
                padding-bottom: 10rem;
            }

            /* one-column grid, centered items */
            .ft__grid {
                grid-template-columns: 1fr;
                justify-items: center;
            }

            /* brand block */
            .ft__brand .ft__logoLink {
                justify-content: center;
            }
            .ft__tag, .ft__email, .ft__note {
                margin-left: auto;
                margin-right: auto;
            }

            /* socials */
            .ft__social {
                justify-content: center;
            }

            /* newsletter */
            .ft__form {
                width: 100%;
                justify-items: center;
            }
            .ft__field {
                width: min(100%, 360px);
            }
            .ft__send {
                justify-self: center;
            }

            /* bottom bar */
            .ft__bottom {
                flex-direction: column;
                align-items: center;
                text-align: center;
            }
            .ft__bottomLinks {
                justify-content: center;
            }

        }

      `}</style>
    </footer>
  );
}
