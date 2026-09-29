import { useEffect, useRef } from 'react';
import gsap from 'gsap';

const EXPERIENCE = [
  {
    role: 'Website Developer',
    company: '13 UTOPiA',
    period: '2022 — Present',
    description:
      'Supported development of AI-powered tools and automation frameworks. Building responsive WordPress & Shopify websites, social media creatives, and brand visuals to deliver impactful digital solutions that strengthen brand identity and online presence.',
    tags: ['WordPress', 'AI Tools', 'Shopify', 'Branding', 'React'],
  },
  {
    role: 'Sales Staff',
    company: 'Axis Bank',
    period: '2022',
    description:
      'Served in a customer-facing sales role, developing strong communication skills and a deep understanding of client requirements in a fast-paced professional environment.',
    tags: ['Sales', 'Client Relations', 'Communication'],
  },
];

const EDUCATION = [
  {
    degree: 'Bachelor of Computer Applications',
    institution: 'Swarrnim Startup & Innovation',
    period: '2019 — 2021',
    description: 'Studied computer applications with focus on modern software development, UI design, and startup-oriented innovation practices.',
  },
];

export default function ExperienceSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const animatedRef = useRef(false);
  // Refs for each word in the heading
  const careerRef = useRef<HTMLSpanElement>(null);
  const ampRef = useRef<HTMLSpanElement>(null);
  const workRef = useRef<HTMLSpanElement>(null);
  const numberLineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    // ── Pre-hide ──────────────────────────────────────────
    // CAREER: clip-path closed (wiped from bottom)
    gsap.set(careerRef.current, {
      clipPath: 'inset(100% 0% 0% 0%)',
      opacity: 1,
    });
    // "&": scale + rotate in
    gsap.set(ampRef.current, { scale: 0, rotation: -25, opacity: 0, transformOrigin: 'center bottom' });
    // WORK: clip-path from left
    gsap.set(workRef.current, {
      clipPath: 'inset(0% 100% 0% 0%)',
      opacity: 1,
    });
    // Number counter line
    gsap.set(numberLineRef.current, { opacity: 0, x: -20 });

    gsap.set(section.querySelectorAll('.exp-card'), { y: 70, opacity: 0 });
    gsap.set(section.querySelectorAll('.edu-card, .cta-card'), { y: 50, opacity: 0 });
    gsap.set(section.querySelectorAll('.anim-label'), { opacity: 0, x: -16 });

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !animatedRef.current) {
          animatedRef.current = true;

          const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });

          // 0. Label
          tl.to(section.querySelectorAll('.anim-label'), {
            opacity: 1, x: 0, duration: 0.5, ease: 'power2.out'
          }, 0);

          // 1. "CAREER" — clip-path curtain wipes UP (bottom → top reveal)
          tl.to(careerRef.current, {
            clipPath: 'inset(0% 0% 0% 0%)',
            duration: 1.0,
            ease: 'expo.out',
          }, 0.15);

          // 2. "WORK" — clip-path curtain wipes in from LEFT
          tl.to(workRef.current, {
            clipPath: 'inset(0% 0% 0% 0%)',
            duration: 1.0,
            ease: 'expo.out',
          }, 0.35);

          // 3. "&" — bounces in between them
          tl.to(ampRef.current, {
            scale: 1, rotation: 0, opacity: 1,
            duration: 0.65,
            ease: 'back.out(1.8)',
          }, 0.55);

          // 4. Number counter line pops in
          tl.to(numberLineRef.current, {
            opacity: 1, x: 0, duration: 0.5, ease: 'power2.out'
          }, 0.7);

          // 5. Cards stagger up with slight spring
          tl.to(section.querySelectorAll('.exp-card'), {
            y: 0, opacity: 1,
            duration: 0.85,
            stagger: 0.14,
            ease: 'power3.out',
          }, 0.5);

          // 6. Education + CTA
          tl.to(section.querySelectorAll('.edu-card, .cta-card'), {
            y: 0, opacity: 1,
            duration: 0.75,
            stagger: 0.12,
            ease: 'power3.out',
          }, 0.65);
        }
      },
      { threshold: 0.05 }
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative w-full bg-[#0a0a0a] text-white overflow-hidden pt-4 pb-16"
    >
      {/* Top separator */}
      <div className="w-full h-px bg-white/[0.06] mb-32" />

      <div className="px-6 md:px-16 lg:px-24">

        {/* Section Label */}
        <div className="flex items-center gap-4 mb-16">
          <div className="anim-label flex items-center gap-4">
            <div className="w-8 h-px bg-white/40" />
            <span className="text-[10px] tracking-[0.5em] text-white/40 uppercase font-mono">Experience</span>
          </div>
        </div>

        {/* ── Giant heading: CAREER & WORK ─────────────────── */}
        <div className="mb-6">
          {/* Number / count indicator */}
          <div ref={numberLineRef} className="flex items-center gap-4 mb-8">
            <span className="text-[9px] tracking-[0.6em] text-white/20 font-mono uppercase">02 / section</span>
            <div className="flex-1 max-w-[80px] h-px bg-white/10" />
          </div>

          {/* Words row */}
          <div className="flex flex-wrap items-end gap-x-5 leading-[0.82]" style={{ marginBottom: '0.15em' }}>

            {/* CAREER — clips upward from bottom */}
            <span
              ref={careerRef}
              className="inline-block font-black uppercase tracking-tighter text-white will-change-transform"
              style={{ fontSize: 'clamp(52px,9vw,130px)' }}
            >
              CAREER
            </span>

            {/* & — pops in the middle */}
            <span
              ref={ampRef}
              className="inline-block font-black uppercase tracking-tighter will-change-transform"
              style={{
                fontSize: 'clamp(52px,9vw,130px)',
                color: 'transparent',
                WebkitTextStroke: '1.5px rgba(255,255,255,0.3)',
              }}
            >
              &amp;
            </span>

            {/* WORK — sweeps in from right */}
            <span
              ref={workRef}
              className="inline-block font-black uppercase tracking-tighter text-white will-change-transform"
              style={{ fontSize: 'clamp(52px,9vw,130px)' }}
            >
              WORK
            </span>

          </div>

          {/* Thin underline that draws itself */}
          <div className="overflow-hidden h-px mt-5 mb-24">
            <div
              className="h-px bg-gradient-to-r from-white/30 via-white/10 to-transparent exp-underline"
              style={{ width: '100%' }}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-16 lg:gap-24">

          {/* Left — Experience Cards */}
          <div className="flex flex-col gap-6">
            <p className="text-[10px] tracking-[0.5em] text-white/30 uppercase font-mono mb-4">Professional Experience</p>
            {EXPERIENCE.map((exp, i) => (
              <div
                key={i}
                className="exp-card group relative border border-white/[0.08] bg-white/[0.02] p-8 md:p-10 hover:border-white/20 hover:bg-white/[0.04] transition-all duration-500 cursor-default"
              >
                {/* Number */}
                <span className="absolute top-8 right-10 text-[10px] font-mono text-white/15">0{i + 1}</span>

                {/* Top row */}
                <div className="flex flex-wrap gap-4 items-start justify-between mb-6">
                  <div>
                    <h3 className="text-xl md:text-2xl font-bold tracking-tight text-white">
                      {exp.role}
                    </h3>
                    <p className="text-sm text-white/40 mt-1 font-mono tracking-wide">{exp.company}</p>
                  </div>
                  <span className="text-[10px] tracking-[0.3em] text-white/25 font-mono border border-white/10 px-3 py-1.5 uppercase shrink-0">
                    {exp.period}
                  </span>
                </div>

                {/* Description */}
                <p className="text-sm md:text-base leading-[1.8] text-white/50 mb-7">{exp.description}</p>

                {/* Tags */}
                <div className="flex flex-wrap gap-2">
                  {exp.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[9px] tracking-[0.35em] text-white/30 uppercase font-mono border border-white/[0.08] px-3 py-1 group-hover:border-white/20 group-hover:text-white/50 transition-all duration-300"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Arrow */}
                <div className="absolute bottom-8 right-10 text-white/10 group-hover:text-white/40 transition-colors duration-300 text-sm">→</div>
              </div>
            ))}
          </div>

          {/* Right — Education + CTA */}
          <div className="flex flex-col gap-6">

            <p className="text-[10px] tracking-[0.5em] text-white/30 uppercase font-mono mb-4">Education</p>

            {EDUCATION.map((edu, i) => (
              <div
                key={i}
                className="edu-card relative border border-white/[0.08] bg-white/[0.02] p-8 hover:border-white/20 transition-all duration-500 cursor-default"
              >
                <p className="text-[9px] tracking-[0.4em] text-white/25 uppercase font-mono mb-4">{edu.period}</p>
                <h3 className="text-base md:text-lg font-bold tracking-tight text-white mb-2 leading-snug">{edu.degree}</h3>
                <p className="text-sm text-white/40 font-mono mb-5">{edu.institution}</p>
                <p className="text-sm leading-[1.75] text-white/45">{edu.description}</p>
              </div>
            ))}

            {/* CTA Card */}
            <a
              href="mailto:iambairwabharat@gmail.com"
              className="cta-card group relative border border-white/10 bg-white/[0.02] p-8 hover:bg-white hover:border-white transition-all duration-500 block"
            >
              <p className="text-[10px] tracking-[0.5em] text-white/30 group-hover:text-black/40 uppercase font-mono mb-5 transition-colors duration-300">
                Let's Work Together
              </p>
              <h3 className="text-2xl md:text-3xl font-black tracking-tight text-white group-hover:text-black transition-colors duration-300 mb-3 leading-tight">
                Open for<br />new projects.
              </h3>
              <span className="text-sm text-white/40 group-hover:text-black/50 transition-colors duration-300 font-mono">
                iambairwabharat@gmail.com →
              </span>
            </a>

          </div>
        </div>

      </div>
    </section>
  );
}
