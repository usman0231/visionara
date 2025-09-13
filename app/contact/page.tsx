'use client';

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Footer from '@/components/footer';

gsap.registerPlugin(ScrollTrigger);

export default function ContactPage() {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<null | { ok: boolean; msg: string }>(null);
  const [selectedService, setSelectedService] = useState<string>('');

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.reveal', {
        y: 20,
        opacity: 0,
        duration: 0.7,
        ease: 'power3.out',
        stagger: 0.08,
      });

      gsap.utils.toArray<HTMLElement>('[data-animate]').forEach((el) => {
        gsap.from(el, {
          opacity: 0,
          y: 24,
          duration: 0.7,
          ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 85%' },
        });
      });
    }, rootRef);

    return () => ctx.revert();
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus(null);
    setLoading(true);

    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const json = await res.json();
      setStatus({ ok: res.ok, msg: json.message || (res.ok ? 'Thanks! We’ll be in touch.' : 'Something went wrong.') });

      if (res.ok) form.reset();
    } catch (err) {
      setStatus({ ok: false, msg: 'Network error. Please try again.' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <main ref={rootRef} className="bg-[var(--background)] text-[var(--text1)]">
      {/* HERO */}
      <section className="mx-auto max-w-7xl px-4 pt-10 pb-8">
        <p className="reveal mb-2 inline-block text-xs uppercase tracking-[0.16em] text-[var(--text1)]/70">
          Contact Visionara
        </p>
        <h1 className="reveal text-3xl font-extrabold leading-tight md:text-5xl">
          Tell us about your project.
        </h1>
        <p className="reveal mt-3 max-w-prose text-[var(--text1)]/90">
          Whether you need a web app, mobile app, fresh brand visuals, or a growth push—we’re here to help.
        </p>
      </section>

      {/* CONTENT */}
      <section className="mx-auto max-w-7xl grid grid-cols-1 gap-8 px-4 pb-14 md:grid-cols-5">
        {/* Left: Details */}
        <aside data-animate className="md:col-span-2 space-y-4">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-xl font-bold">Get in touch</h2>
            <ul className="mt-3 space-y-2 text-sm text-[var(--text1)]/90">
              <li>
                Email:{' '}
                <a className="text-[var(--foreground)] underline" href="mailto:hello@visionara.studio">
                  hello@visionara.studio
                </a>
              </li>
              <li>Phone: <span className="opacity-90">+1 (555) 123-4567</span></li>
              <li>Hours: <span className="opacity-90">Mon–Fri, 9am–6pm</span></li>
            </ul>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h3 className="text-lg font-semibold">Project fit</h3>
            <p className="mt-2 text-sm text-[var(--text1)]/90">
              Best for MVPs, redesigns, and product teams who want a proactive partner across{' '}
              <strong>web</strong>, <strong>mobile</strong>, <strong>design</strong>, and <strong>marketing</strong>.
            </p>
          </div>
        </aside>

        {/* Right: Form */}
        <div data-animate className="md:col-span-3">
          <form
            onSubmit={handleSubmit}
            className="rounded-2xl border border-white/10 bg-white/5 p-6"
          >
            {/* Name / Email */}
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm">Full name *</label>
                <input
                  name="name"
                  required
                  className="w-full rounded-lg border border-white/15 bg-transparent px-3 py-2 outline-none ring-0 focus:border-[var(--foreground)]"
                  placeholder="Jane Doe"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm">Email *</label>
                <input
                  name="email"
                  required
                  type="email"
                  className="w-full rounded-lg border border-white/15 bg-transparent px-3 py-2 outline-none ring-0 focus:border-[var(--foreground)]"
                  placeholder="jane@company.com"
                />
              </div>
            </div>

            {/* Company / Phone */}
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm">Company</label>
                <input
                  name="company"
                  className="w-full rounded-lg border border-white/15 bg-transparent px-3 py-2 outline-none ring-0 focus:border-[var(--foreground)]"
                  placeholder="Acme Inc."
                />
              </div>
              <div>
                <label className="mb-1 block text-sm">Phone</label>
                <input
                  name="phone"
                  className="w-full rounded-lg border border-white/15 bg-transparent px-3 py-2 outline-none ring-0 focus:border-[var(--foreground)]"
                  placeholder="+1 555 000 0000"
                />
              </div>
            </div>

            {/* Service Type */}
            <div className="mt-4">
              <label className="mb-2 block text-sm">Service type *</label>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {[
                  { name: 'Web Development', value: 'web' },
                  { name: 'Mobile App Development', value: 'mobile' },
                  { name: 'Graphic Design', value: 'graphic' },
                  { name: 'Marketing', value: 'marketing' }
                ].map((service) => (
                  <label
                    key={service.value}
                    className={`flex cursor-pointer items-center gap-3 rounded-lg border px-4 py-3 text-sm transition ${
                      selectedService === service.value
                        ? 'border-[var(--foreground)] bg-[var(--foreground)]/10'
                        : 'border-white/15 bg-white/5 hover:border-white/25'
                    }`}
                  >
                    <input 
                      type="radio" 
                      name="serviceType" 
                      value={service.value}
                      onChange={(e) => setSelectedService(e.target.value)}
                      className="text-[var(--foreground)] focus:ring-[var(--foreground)]"
                    />
                    <span className="font-medium">{service.name}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Budget */}
            <div className="mt-4">
              <div>
                <label className="mb-1 block text-sm">Budget range (CAD)</label>
                <select
                  name="budget"
                  className="w-full rounded-lg border border-white/15 bg-transparent px-3 py-2 outline-none focus:border-[var(--foreground)]"
                >
                  <option className="bg-black">Select budget</option>
                  {selectedService === 'web' && (
                    <>
                      <option className="bg-black">$1,499 - $2,499 (Basic - Standard)</option>
                      <option className="bg-black">$4,000 - $5,500 (Enterprise)</option>
                      <option className="bg-black">$99 - $299/month (Ongoing)</option>
                    </>
                  )}
                  {selectedService === 'mobile' && (
                    <>
                      <option className="bg-black">$15,000 - $35,000 (Basic - Standard)</option>
                      <option className="bg-black">$65,000 - $100,000 (Enterprise)</option>
                      <option className="bg-black">$199 - $499/month (Ongoing)</option>
                    </>
                  )}
                  {selectedService === 'graphic' && (
                    <>
                      <option className="bg-black">$899 - $2,299 (Basic - Standard)</option>
                      <option className="bg-black">$3,799 (Enterprise)</option>
                      <option className="bg-black">$599 - $1,499/month (Ongoing)</option>
                    </>
                  )}
                  {selectedService === 'marketing' && (
                    <>
                      <option className="bg-black">$1,899 - $3,799/month (Basic - Standard)</option>
                      <option className="bg-black">$6,999/month (Enterprise)</option>
                      <option className="bg-black">Contact for custom quote</option>
                    </>
                  )}
                  {!selectedService && (
                    <>
                      <option className="bg-black">$1,000 - $5,000</option>
                      <option className="bg-black">$5,000 - $15,000</option>
                      <option className="bg-black">$15,000 - $50,000</option>
                      <option className="bg-black">$50,000+</option>
                    </>
                  )}
                </select>
              </div>
            </div>

            {/* Timeline */}
            <div className="mt-4">
              <label className="mb-1 block text-sm">Project timeline</label>
              <select
                name="timeline"
                className="w-full rounded-lg border border-white/15 bg-transparent px-3 py-2 outline-none focus:border-[var(--foreground)]"
              >
                <option className="bg-black">Select timeline</option>
                {selectedService === 'web' && (
                  <>
                    <option className="bg-black">1-2 weeks (Basic site)</option>
                    <option className="bg-black">2-4 weeks (Standard site)</option>
                    <option className="bg-black">4-8 weeks (Enterprise site)</option>
                  </>
                )}
                {selectedService === 'mobile' && (
                  <>
                    <option className="bg-black">8-12 weeks (Basic app)</option>
                    <option className="bg-black">12-16 weeks (Standard app)</option>
                    <option className="bg-black">16-24 weeks (Enterprise app)</option>
                  </>
                )}
                {selectedService === 'graphic' && (
                  <>
                    <option className="bg-black">1-2 weeks (Basic package)</option>
                    <option className="bg-black">2-3 weeks (Standard package)</option>
                    <option className="bg-black">3-4 weeks (Enterprise package)</option>
                  </>
                )}
                {selectedService === 'marketing' && (
                  <>
                    <option className="bg-black">Ongoing - 6 month minimum</option>
                    <option className="bg-black">Ongoing - 12 month contract</option>
                    <option className="bg-black">Custom timeline</option>
                  </>
                )}
                {!selectedService && (
                  <>
                    <option className="bg-black">ASAP</option>
                    <option className="bg-black">2-4 weeks</option>
                    <option className="bg-black">1-3 months</option>
                    <option className="bg-black">3+ months</option>
                  </>
                )}
              </select>
            </div>

            {/* Message */}
            <div className="mt-4">
              <label className="mb-1 block text-sm">Tell us more *</label>
              <textarea
                name="message"
                required
                rows={5}
                className="w-full rounded-lg border border-white/15 bg-transparent px-3 py-2 outline-none ring-0 focus:border-[var(--foreground)]"
                placeholder="What are you building? Goals, scope, links…"
              />
            </div>

            {/* Submit */}
            <div className="mt-5 flex items-center gap-3">
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center justify-center rounded-xl border border-white/20 bg-gradient-to-tr from-[var(--foreground)] to-[var(--foreground)]/70 px-5 py-3 font-semibold text-black disabled:opacity-60"
              >
                {loading ? 'Sending…' : 'Send message'}
              </button>

              {status && (
                <span
                  className={`text-sm ${status.ok ? 'text-[var(--foreground)]' : 'text-red-400'}`}
                >
                  {status.msg}
                </span>
              )}
            </div>
          </form>
        </div>
      </section>

      {/* FOOTER */}
      <Footer />
    </main>
  );
}
