import { useEffect, useRef } from 'react';
import gsap from 'gsap';

const EXPERIENCE = [
  {
    role: 'Website Developer & Designer',
    company: '13 UTOPiA',
    period: '2022 — Present',
    description:
      'Engineered responsive WordPress & Shopify platforms, custom web app interfaces, AI-powered automation workflows, and brand visual identities for modern digital environments.',
    tags: ['WordPress', 'Shopify', 'React', 'AI Workflows', 'Branding'],
  },
  {
    role: 'Sales & Client Relations',
    company: 'Axis Bank',
    period: '2022',
    description:
      'Managed client communications and sales strategy in a fast-paced environment, cultivating key stakeholder insights and user-centric problem solving.',
    tags: ['Client Relations', 'Sales Strategy', 'Communication'],
  },
];

const EDUCATION = [
  {
    degree: 'Bachelor of Computer Applications',
    institution: 'Swarrnim Startup & Innovation University',
    period: '2019 — 2021',
    description: 'Specialized in computer applications, web systems architecture, UI/UX interaction principles, and innovation practices.',
  },
];

export default function ExperienceSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const animatedRef = useRef(false);
  const careerRef = useRef<HTMLSpanElement>(null);
  const ampRef = useRef<HTMLSpanElement>(null);
  const workRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    gsap.set(careerRef.current, { clipPath: 'inset(100% 0% 0% 0%)', opacity: 1 });
    gsap.set(ampRef.current, { scale: 0, rotation: -25, opacity: 0, transformOrigin: 'center bottom' });
    gsap.set(workRef.current, { clipPath: 'inset(0% 100% 0% 0%)', opacity: 1 });

    gsap.set(section.querySelectorAll('.exp-card'), { y: 50, opacity: 0 });
    gsap.set(section.querySelectorAll('.edu-card, .cta-card'), { y: 40, opacity: 0 });

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !animatedRef.current) {
          animatedRef.current = true;
          const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });

          tl.to(careerRef.current, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.0, ease: 'expo.out' }, 0.15);
          tl.to(workRef.current, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.0, ease: 'expo.out' }, 0.35);
          tl.to(ampRef.current, { scale: 1, rotation: 0, opacity: 1, duration: 0.65, ease: 'back.out(1.8)' }, 0.55);

          tl.to(section.querySelectorAll('.exp-card'), {
            y: 0, opacity: 1, duration: 0.85, stagger: 0.14, ease: 'power3.out',
          }, 0.5);

          tl.to(section.querySelectorAll('.edu-card, .cta-card'), {
            y: 0, opacity: 1, duration: 0.75, stagger: 0.12, ease: 'power3.out',
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
      id="experience-section"
      ref={sectionRef}
      className="relative w-full bg-[#0a0a0a] text-white overflow-hidden pt-32 pb-48 md:pt-48 md:pb-64"
    >
      <div className="w-full h-px bg-white/[0.08] mb-24" />

      <div className="px-6 md:px-16 lg:px-24">

        {/* Section Label */}
        <div className="flex items-center gap-4 mb-16">
          <div className="w-8 h-px bg-white/40" />
          <span className="text-[10px] tracking-[0.5em] text-white/40 uppercase font-mono">02 / EXPERIENCE & BACKGROUND</span>
        </div>

        {/* Heading */}
        <div className="mb-20">
          <div className="flex flex-wrap items-end gap-x-5 leading-[0.82]" style={{ marginBottom: '0.15em' }}>
            <span
              ref={careerRef}
              className="inline-block font-black uppercase tracking-tighter text-white will-change-transform"
              style={{ fontSize: 'clamp(52px,9vw,130px)' }}
            >
              CAREER
            </span>

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

            <span
              ref={workRef}
              className="inline-block font-black uppercase tracking-tighter text-white will-change-transform"
              style={{ fontSize: 'clamp(52px,9vw,130px)' }}
            >
              WORK
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-16 lg:gap-24">

          {/* Left — Professional Experience */}
          <div className="flex flex-col gap-8">
            <p className="text-[10px] tracking-[0.5em] text-white/30 uppercase font-mono mb-2">CAREER HISTORY</p>
            {EXPERIENCE.map((exp, i) => (
              <div
                key={i}
                className="exp-card group relative border-b border-white/10 pb-10 hover:border-white/30 transition-all duration-500 cursor-default"
              >
                <div className="flex flex-wrap gap-4 items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl md:text-2xl font-bold tracking-tight text-white group-hover:text-white transition-colors">
                      {exp.role}
                    </h3>
                    <p className="text-xs text-white/40 mt-1 font-mono tracking-wider uppercase">{exp.company}</p>
                  </div>
                  <span className="text-[9px] tracking-[0.3em] text-white/40 font-mono border border-white/10 px-3 py-1 uppercase shrink-0">
                    {exp.period}
                  </span>
                </div>

                <p className="text-sm md:text-base leading-[1.75] text-white/50 mb-6 font-light">{exp.description}</p>

                <div className="flex flex-wrap gap-2">
                  {exp.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[9px] tracking-[0.3em] text-white/30 uppercase font-mono border border-white/[0.08] px-2.5 py-1 group-hover:border-white/20 transition-all duration-300"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Right — Education & CTA */}
          <div className="flex flex-col gap-10">
            <div>
              <p className="text-[10px] tracking-[0.5em] text-white/30 uppercase font-mono mb-6">ACADEMIC BACKGROUND</p>

              {EDUCATION.map((edu, i) => (
                <div
                  key={i}
                  className="edu-card relative border-b border-white/10 pb-8 cursor-default"
                >
                  <p className="text-[9px] tracking-[0.4em] text-white/30 uppercase font-mono mb-2">{edu.period}</p>
                  <h3 className="text-base font-bold tracking-tight text-white mb-1 leading-snug">{edu.degree}</h3>
                  <p className="text-xs text-white/40 font-mono mb-3 uppercase">{edu.institution}</p>
                  <p className="text-xs leading-[1.7] text-white/45 font-light">{edu.description}</p>
                </div>
              ))}
            </div>

            {/* CTA Box */}
            <a
              href="mailto:iambairwabharat@gmail.com"
              data-cursor="CONTACT"
              className="cta-card group relative border border-white/15 bg-white/[0.02] p-8 hover:bg-white hover:border-white transition-all duration-500 block rounded-sm"
            >
              <p className="text-[9px] tracking-[0.4em] text-white/40 group-hover:text-black/50 uppercase font-mono mb-4 transition-colors duration-300">
                INITIATE PROJECT
              </p>
              <h3 className="text-xl md:text-2xl font-black tracking-tight text-white group-hover:text-black transition-colors duration-300 mb-2 leading-tight">
                AVAILABLE FOR NEW FREELANCE & STUDIO COMMISSIONS.
              </h3>
              <span className="text-xs text-white/50 group-hover:text-black/70 transition-colors duration-300 font-mono">
                iambairwabharat@gmail.com →
              </span>
            </a>

          </div>
        </div>

      </div>
    </section>
  );
}
