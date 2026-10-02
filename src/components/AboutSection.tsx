import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { scrambleText, attachMagneticLetters } from '../utils/titleAnimations';

const SKILLS = [
  { name: 'WordPress Development', level: 92 },
  { name: 'UI / UX Design', level: 88 },
  { name: 'Frontend Development', level: 85 },
  { name: 'E-commerce (Shopify)', level: 82 },
  { name: 'AI-Powered Web Dev', level: 78 },
  { name: 'Social Media Design', level: 90 },
  { name: '3D / Blender Modeling', level: 75 },
];

const LANGUAGES = ['English', 'Hindi', 'Gujarati'];

export default function AboutSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);
  const bairwaRef = useRef<HTMLSpanElement>(null);
  const taglineRef = useRef<HTMLParagraphElement>(null);
  const animatedRef = useRef(false);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    // Pre-hide elements
    gsap.set(section.querySelectorAll('.anim-label'), { opacity: 0, x: -20 });
    gsap.set(section.querySelectorAll('.mag-letter'), { yPercent: 115, opacity: 0, skewX: 8 });
    gsap.set(bairwaRef.current, { opacity: 0, x: 60 });
    gsap.set(taglineRef.current, { opacity: 0, y: 16 });
    gsap.set(section.querySelector('.bio-block'), { opacity: 0, y: 48 });
    gsap.set(section.querySelectorAll('.skill-bar-fill'), { scaleX: 0 });
    gsap.set(section.querySelectorAll('.contact-item'), { x: -28, opacity: 0 });

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !animatedRef.current) {
          animatedRef.current = true;

          const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });

          tl.to(section.querySelectorAll('.anim-label'), {
            opacity: 1, x: 0, duration: 0.6, ease: 'power2.out'
          }, 0);

          tl.to(section.querySelectorAll('.mag-letter'), {
            yPercent: 0,
            opacity: 1,
            skewX: 0,
            duration: 1.0,
            stagger: { each: 0.055, ease: 'power2.out' },
          }, 0.1);

          tl.to(bairwaRef.current, {
            opacity: 1, x: 0, duration: 0.5, ease: 'power3.out'
          }, 0.3).then(() => {
            if (bairwaRef.current) {
              scrambleText(bairwaRef.current, ' BAIRWA', 0.9);
            }
          });

          tl.to(taglineRef.current, {
            opacity: 1, y: 0, duration: 0.7, ease: 'power2.out'
          }, 0.65);

          tl.to(section.querySelector('.bio-block'), {
            opacity: 1, y: 0, duration: 0.9, ease: 'power3.out'
          }, 0.55);

          tl.to(section.querySelectorAll('.skill-bar-fill'), {
            scaleX: 1, duration: 1.1, stagger: 0.07, ease: 'expo.out'
          }, 0.7);

          tl.to(section.querySelectorAll('.contact-item'), {
            x: 0, opacity: 1, duration: 0.65, stagger: 0.08, ease: 'power2.out'
          }, 0.75);

          if (headingRef.current) {
            setTimeout(() => {
              if (headingRef.current) attachMagneticLetters(headingRef.current);
            }, 1200);
          }
        }
      },
      { threshold: 0.08 }
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="about-section"
      ref={sectionRef}
      className="about-section-start relative w-full bg-[#0a0a0a] text-white overflow-hidden py-32 md:py-48"
    >
      {/* Top thin separator */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

      {/* Subtle grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.02] pointer-events-none"
        style={{
          backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
          backgroundSize: '100px 100px',
        }}
      />

      {/* Section Label */}
      <div className="px-6 md:px-16 lg:px-24 mb-16">
        <div className="anim-label flex items-center gap-4">
          <div className="w-8 h-px bg-white/40" />
          <span className="text-[10px] tracking-[0.5em] text-white/40 uppercase font-mono">01 / ABOUT PROFILE</span>
        </div>
      </div>

      <div className="px-6 md:px-16 lg:px-24">

        {/* ── Giant Name Heading ─────────────────────────── */}
        <div ref={headingRef} className="mb-24">
          <div className="flex flex-wrap items-end gap-x-2 leading-[0.85] overflow-hidden" style={{ paddingBottom: '0.1em' }}>
            {'BHARAT'.split('').map((l, i) => (
              <span
                key={`b-${i}`}
                className="inline-block overflow-hidden"
                style={{ fontSize: 'clamp(56px,10vw,140px)', lineHeight: 0.9 }}
              >
                <span
                  className="mag-letter inline-block font-black uppercase tracking-tighter text-white will-change-transform"
                  style={{ fontSize: 'inherit', display: 'block', transition: 'transform 0.3s cubic-bezier(0.23,1,0.32,1)' }}
                >
                  {l}
                </span>
              </span>
            ))}

            <span
              ref={bairwaRef}
              className="inline-block font-black uppercase tracking-tighter will-change-transform"
              style={{
                fontSize: 'clamp(56px,10vw,140px)',
                lineHeight: 0.9,
                color: 'transparent',
                WebkitTextStroke: '1.5px rgba(255,255,255,0.2)',
              }}
            >
              &nbsp;BAIRWA
            </span>
          </div>

          <p
            ref={taglineRef}
            className="mt-6 text-[10px] md:text-[11px] tracking-[0.6em] text-white/40 uppercase font-mono"
          >
            CREATIVE DEVELOPER &nbsp;/&nbsp; WEB DESIGNER &nbsp;/&nbsp; AHMEDABAD, IN
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 lg:gap-32">

          {/* Left — Bio + Languages + Contact */}
          <div className="bio-block flex flex-col gap-16">

            {/* Bio */}
            <div>
              <p className="text-[10px] tracking-[0.5em] text-white/30 uppercase mb-6 font-mono">BIOGRAPHY</p>
              <p className="text-xl md:text-2xl font-light leading-[1.65] text-white/85 tracking-tight">
                I build digital experiences at the intersection of high-performance engineering, responsive design, and tactile web aesthetics.
              </p>
              <p className="mt-6 text-sm md:text-base font-light leading-[1.8] text-white/50">
                Specializing in modern web applications, WordPress & Shopify architectures, interactive 3D WebGL interfaces, and AI-assisted workflows. Based in Sabarmati, Ahmedabad, delivering high-end web experiences for forward-thinking clients.
              </p>
            </div>

            {/* Languages */}
            <div>
              <p className="text-[10px] tracking-[0.5em] text-white/30 uppercase mb-6 font-mono">LANGUAGES</p>
              <div className="flex flex-wrap gap-3">
                {LANGUAGES.map((lang) => (
                  <span
                    key={lang}
                    className="px-4 py-2 border border-white/10 text-[10px] tracking-[0.3em] text-white/60 uppercase font-mono hover:border-white/40 hover:text-white transition-all duration-300 cursor-default"
                  >
                    {lang}
                  </span>
                ))}
              </div>
            </div>

            {/* Contact Details */}
            <div>
              <p className="text-[10px] tracking-[0.5em] text-white/30 uppercase mb-6 font-mono">GET IN TOUCH</p>
              <div className="flex flex-col gap-2">
                {[
                  { label: 'Phone', value: '+91 99740 33803', href: 'tel:+919974033803' },
                  { label: 'Email', value: 'iambairwabharat@gmail.com', href: 'mailto:iambairwabharat@gmail.com' },
                  { label: 'Vercel', value: 'bharat-iota-beige.vercel.app', href: 'https://bharat-iota-beige.vercel.app' },
                  { label: 'Location', value: 'Sabarmati, Ahmedabad', href: '#' },
                ].map((item) => (
                  <a
                    key={item.label}
                    href={item.href}
                    target={item.href.startsWith('http') ? '_blank' : undefined}
                    rel="noreferrer"
                    className="contact-item group flex items-center justify-between py-4 border-b border-white/[0.07] hover:border-white/20 transition-colors duration-300"
                  >
                    <span className="text-[9px] tracking-[0.4em] text-white/30 uppercase font-mono">{item.label}</span>
                    <span className="text-xs md:text-sm text-white/70 group-hover:text-white font-mono transition-colors duration-300">{item.value}</span>
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Right — Skills */}
          <div>
            <p className="text-[10px] tracking-[0.5em] text-white/30 uppercase mb-12 font-mono">CORE COMPETENCIES</p>
            <div className="flex flex-col gap-10">
              {SKILLS.map((skill) => (
                <div key={skill.name} className="group">
                  <div className="flex justify-between items-end mb-3">
                    <span className="text-xs tracking-[0.2em] uppercase text-white/70 group-hover:text-white transition-colors duration-300 font-mono">
                      {skill.name}
                    </span>
                    <span className="text-[10px] font-mono text-white/30 group-hover:text-white/70 transition-colors duration-300">
                      {skill.level}%
                    </span>
                  </div>
                  <div className="w-full h-px bg-white/10 relative">
                    <div
                      className="skill-bar-fill absolute top-0 left-0 h-px bg-white origin-left"
                      style={{ width: `${skill.level}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
    </section>
  );
}
