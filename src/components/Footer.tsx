import { useEffect, useRef } from 'react';
import gsap from 'gsap';

const NAV_LINKS = [
  { label: 'Top', href: '#' },
  { label: 'About', href: '#about-section' },
  { label: 'Experience', href: '#experience-section' },
  { label: 'Contact', href: 'mailto:iambairwabharat@gmail.com' },
];

const SOCIAL_LINKS = [
  { label: 'LinkedIn', href: 'https://linkedin.com' },
  { label: 'GitHub', href: 'https://github.com' },
  { label: 'Portfolio', href: 'https://bharat-iota-beige.vercel.app' },
];

export default function Footer() {
  const footerRef = useRef<HTMLElement>(null);
  const marqueeRef = useRef<HTMLDivElement>(null);

  // Pensatori Irrazionali BUILD Kinetic Refs
  const ctaSectionRef = useRef<HTMLDivElement>(null);
  const buRef = useRef<HTMLSpanElement>(null);
  const ldRef = useRef<HTMLSpanElement>(null);
  const iWrapperRef = useRef<HTMLDivElement>(null);
  const iTextRef = useRef<HTMLSpanElement>(null);
  const finalBtnRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const footer = footerRef.current;
    const ctaSection = ctaSectionRef.current;
    if (!footer || !ctaSection) return;

    // Pre-hide non-hero elements
    gsap.set(footer.querySelectorAll('.footer-line-anim'), { scaleX: 0, transformOrigin: 'left center' });
    gsap.set(footer.querySelectorAll('.footer-fade'), { y: 30, opacity: 0 });

    // Initial 0-State (BUILD spelled as a clean single word)
    gsap.set(buRef.current, { x: 0 });
    gsap.set(ldRef.current, { x: 0 });
    gsap.set(iWrapperRef.current, { x: 0, y: 0, rotation: 0, transformOrigin: 'center center' });
    gsap.set(iTextRef.current, { opacity: 1 });
    gsap.set(finalBtnRef.current, { opacity: 0, pointerEvents: 'none' });

    if (marqueeRef.current) {
      gsap.to(marqueeRef.current, { xPercent: -50, duration: 22, ease: 'none', repeat: -1 });
    }

    // ── Master Timeline (Clean 0.0 to 1.0 progress with ZERO element overlap) ──
    const tl = gsap.timeline({ paused: true });

    // Phase 1: Echo lines (0.0 -> 0.3)
    tl.fromTo(footer.querySelectorAll('.build-echo'),
      { opacity: 0, scale: 0.96 },
      { opacity: 0.12, scale: 1, duration: 0.3, stagger: 0.05, ease: 'power2.out' },
    0);

    // Phase 2: BU & LD separate, letter I rotates 45deg (0.15 -> 0.55)
    tl.to(buRef.current, { x: '-9vw', duration: 0.4, ease: 'power2.inOut' }, 0.15);
    tl.to(ldRef.current, { x: '9vw', duration: 0.4, ease: 'power2.inOut' }, 0.15);
    tl.to(iWrapperRef.current, { y: '50px', rotation: 45, duration: 0.4, ease: 'power2.inOut' }, 0.15);

    // Phase 3: Clean mutual-exclusive cross-fade (0.45 -> 0.65) — NO OVERLAP EVER
    tl.to(iTextRef.current, { opacity: 0, duration: 0.15, ease: 'power1.out' }, 0.45);
    tl.to(finalBtnRef.current, { opacity: 1, pointerEvents: 'auto', duration: 0.15, ease: 'power1.in' }, 0.55);

    // Phase 4: Settle into horizontal CONTACT US button at bottom (0.55 -> 1.0)
    tl.to(iWrapperRef.current, { rotation: 0, y: '120px', duration: 0.45, ease: 'power2.inOut' }, 0.55);

    // Divider lines & footer details fade up (0.6 -> 1.0)
    tl.to(footer.querySelectorAll('.footer-line-anim'), { scaleX: 1, duration: 0.4, stagger: 0.1, ease: 'power2.out' }, 0.6);
    tl.to(footer.querySelectorAll('.footer-fade'), { y: 0, opacity: 1, duration: 0.4, stagger: 0.08, ease: 'power2.out' }, 0.7);

    // ── Smooth 60FPS Lerp Scrub ──────────────────
    let currentProgress = 0;
    let animFrameId: number;

    const updateScrollProgress = () => {
      if (ctaSectionRef.current) {
        const rect = ctaSectionRef.current.getBoundingClientRect();
        const vh = window.innerHeight;

        const rawProgress = (vh - rect.top) / (vh * 0.75);
        const targetProgress = Math.max(0, Math.min(1, rawProgress));

        currentProgress += (targetProgress - currentProgress) * 0.12;
        tl.progress(currentProgress);
      }
      animFrameId = requestAnimationFrame(updateScrollProgress);
    };

    animFrameId = requestAnimationFrame(updateScrollProgress);

    return () => {
      cancelAnimationFrame(animFrameId);
      tl.kill();
    };
  }, []);

  const year = new Date().getFullYear();

  return (
    <footer
      ref={footerRef}
      className="relative w-full bg-[#050505] text-white overflow-hidden pb-36"
    >
      <div className="footer-line-anim w-full h-px bg-white/10" />

      {/* Marquee ticker */}
      <div className="w-full overflow-hidden border-b border-white/[0.06] py-4">
        <div ref={marqueeRef} className="flex whitespace-nowrap gap-0" style={{ width: '200%' }}>
          {Array.from({ length: 2 }).map((_, gi) => (
            <div key={gi} className="flex items-center gap-10 px-5">
              {['WordPress Dev', 'Shopify Stores', 'UI/UX Design', 'React & Vite', 'Blender 3D', 'AI Workflows', 'Frontend Dev', 'Digital Studio'].map((item, i) => (
                <span key={i} className="flex items-center gap-10">
                  <span className="text-[9px] tracking-[0.45em] text-white/30 uppercase font-mono">{item}</span>
                  <span className="text-white/15">·</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="px-6 md:px-16 lg:px-24 pt-20 pb-16">

        {/* ── Giant Pensatori Irrazionali Kinetic BUILD CTA Section ── */}
        <div 
          ref={ctaSectionRef}
          className="relative w-full py-20 md:py-32 overflow-visible select-none flex flex-col items-center justify-center min-h-[460px] mb-24"
        >
          {/* Echo lines behind BUILD */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            {[1, 2, 3, 4].map((step) => (
              <span
                key={step}
                className="build-echo absolute font-black uppercase tracking-tighter text-transparent opacity-0 select-none"
                style={{
                  fontSize: 'clamp(70px,16vw,220px)',
                  lineHeight: '0.85',
                  WebkitTextStroke: `${1 + step * 0.5}px rgba(255,255,255,${0.25 - step * 0.05})`,
                  transform: `scale(${1 + step * 0.06}) translateY(${-step * 8}px)`,
                }}
              >
                BUILD
              </span>
            ))}
          </div>

          {/* Main Kinetic Interactive Row */}
          <div className="relative w-full flex items-center justify-center z-10">
            {/* BU (Left) */}
            <span
              ref={buRef}
              className="font-black uppercase tracking-tighter text-white will-change-transform z-20"
              style={{ fontSize: 'clamp(70px,16vw,220px)', lineHeight: '0.85' }}
            >
              BU
            </span>

            {/* Letter 'I' / Rotated Stem / Final Contact Button (Center) */}
            <div
              ref={iWrapperRef}
              className="relative flex items-center justify-center z-30 will-change-transform px-1"
            >
              <a
                href="mailto:iambairwabharat@gmail.com"
                data-cursor="CONTACT"
                className="group relative flex items-center justify-center text-white font-black uppercase tracking-tighter cursor-pointer"
                style={{ fontSize: 'clamp(70px,16vw,220px)', lineHeight: '0.85' }}
              >
                {/* Initial solid white letter 'I' */}
                <span ref={iTextRef} className="inline-block text-white transition-opacity duration-200">
                  I
                </span>

                {/* Final horizontal CONTACT US button (MUTUALLY EXCLUSIVE — ZERO OVERLAP) */}
                <span
                  ref={finalBtnRef}
                  className="absolute opacity-0 pointer-events-none bg-white text-black font-mono text-xs md:text-sm tracking-[0.3em] font-bold px-8 py-4 rounded-sm uppercase whitespace-nowrap shadow-2xl flex items-center gap-4 transition-all duration-300 hover:bg-white/90 hover:scale-105 border border-white"
                >
                  <span>CONTACT US</span>
                  <span className="text-base font-mono">→</span>
                </span>
              </a>
            </div>

            {/* LD (Right) */}
            <span
              ref={ldRef}
              className="font-black uppercase tracking-tighter text-white will-change-transform z-20"
              style={{ fontSize: 'clamp(70px,16vw,220px)', lineHeight: '0.85' }}
            >
              LD
            </span>
          </div>

        </div>

        <div className="footer-line-anim w-full h-px bg-white/[0.08] mb-14" />

        {/* Bottom grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-6">

          <div className="footer-fade flex flex-col gap-3">
            <p className="text-[10px] tracking-[0.4em] text-white/30 uppercase font-mono">BHARAT BAIRWA</p>
            <p className="text-xs leading-[1.8] text-white/40 max-w-xs font-light">
              Creative web developer & designer based in Sabarmati, Ahmedabad, India.
            </p>
            <p className="text-[10px] tracking-[0.3em] text-white/25 font-mono mt-1">+91 99740 33803</p>
          </div>

          <div className="footer-fade flex flex-col gap-2.5">
            <p className="text-[10px] tracking-[0.4em] text-white/30 uppercase font-mono mb-2">NAVIGATION</p>
            {NAV_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="group flex items-center gap-3 w-fit"
              >
                <span className="w-2.5 h-px bg-white/20 group-hover:w-5 group-hover:bg-white/60 transition-all duration-300" />
                <span className="text-xs tracking-[0.2em] text-white/40 group-hover:text-white uppercase font-mono transition-colors duration-300">
                  {link.label}
                </span>
              </a>
            ))}
          </div>

          <div className="footer-fade flex flex-col gap-2.5">
            <p className="text-[10px] tracking-[0.4em] text-white/30 uppercase font-mono mb-2">CONNECT</p>
            {SOCIAL_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noreferrer"
                className="group flex items-center gap-3 w-fit"
              >
                <span className="w-2.5 h-px bg-white/20 group-hover:w-5 group-hover:bg-white/60 transition-all duration-300" />
                <span className="text-xs tracking-[0.2em] text-white/40 group-hover:text-white uppercase font-mono transition-colors duration-300">
                  {link.label}
                </span>
              </a>
            ))}
          </div>

        </div>

        <div className="footer-line-anim w-full h-px bg-white/[0.06] mt-14 mb-8" />
        <div className="footer-fade flex flex-col md:flex-row items-start md:items-center justify-between gap-3 pb-8">
          <span className="text-[9px] tracking-[0.4em] text-white/20 uppercase font-mono">
            © {year} BHARAT BAIRWA. ALL RIGHTS RESERVED.
          </span>
          <span className="text-[9px] tracking-[0.4em] text-white/15 uppercase font-mono">
            CRAFTED WITH PRECISION IN AHMEDABAD
          </span>
        </div>

      </div>
    </footer>
  );
}
