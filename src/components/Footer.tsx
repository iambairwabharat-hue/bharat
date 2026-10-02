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
  const animatedRef = useRef(false);
  const marqueeRef = useRef<HTMLDivElement>(null);

  // Kinetic BUILD letter refs
  const buRef = useRef<HTMLSpanElement>(null);
  const iStemRef = useRef<HTMLAnchorElement>(null);
  const ldRef = useRef<HTMLSpanElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const footer = footerRef.current;
    if (!footer) return;

    // Pre-hide elements
    gsap.set(footer.querySelectorAll('.ftl-word'), { yPercent: 105, skewX: 6, opacity: 0 });
    gsap.set(footer.querySelector('.ftl-line2'), { clipPath: 'inset(0% 100% 0% 0%)', opacity: 1 });
    gsap.set(footer.querySelectorAll('.ftl-fill-letter'), { opacity: 1 });
    gsap.set(footer.querySelectorAll('.footer-line-anim'), { scaleX: 0, transformOrigin: 'left center' });
    gsap.set(footer.querySelectorAll('.footer-fade'), { y: 30, opacity: 0 });

    // Initial kinetic states for B U  I  L D — perfectly unified word
    gsap.set(buRef.current, { x: 0 });
    gsap.set(ldRef.current, { x: 0 });
    gsap.set(iStemRef.current, { x: 0, y: 0, rotation: 0, transformOrigin: 'top center' });
    gsap.set(labelRef.current, { opacity: 0 });

    if (marqueeRef.current) {
      gsap.to(marqueeRef.current, { xPercent: -50, duration: 22, ease: 'none', repeat: -1 });
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !animatedRef.current) {
          animatedRef.current = true;
          const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });

          // 1. Initial word reveal
          tl.to(footer.querySelectorAll('.ftl-word'), {
            yPercent: 0, skewX: 0, opacity: 1, duration: 0.9, stagger: 0.12,
          }, 0);

          tl.to(footer.querySelector('.ftl-line2'), {
            clipPath: 'inset(0% 0% 0% 0%)', duration: 1.0, ease: 'expo.out',
          }, 0.2);

          tl.fromTo(footer.querySelectorAll('.ftl-fill-letter'),
            { color: 'transparent', webkitTextStrokeColor: 'rgba(255,255,255,0.15)' },
            { color: 'white', webkitTextStrokeColor: 'rgba(255,255,255,0)', duration: 0.5, stagger: 0.08, ease: 'none' },
          0.5);

          // 2. KINETIC SEPARATION TIMELINE
          // "BU" slides left, "LD" slides right
          tl.to(buRef.current, {
            x: '-3.5vw', duration: 1.2, ease: 'expo.inOut'
          }, 0.9);

          tl.to(ldRef.current, {
            x: '3.5vw', duration: 1.2, ease: 'expo.inOut'
          }, 0.9);

          // The giant solid white letter 'I' rotates 45 degrees diagonally & drops stem down
          tl.to(iStemRef.current, {
            y: '30px',
            rotation: 45,
            duration: 1.2,
            ease: 'expo.inOut'
          }, 0.9);

          // Reveal "CONTACT" label printed along the rotated stem of 'I'
          tl.to(labelRef.current, {
            opacity: 1,
            duration: 0.5,
            ease: 'power2.out'
          }, 1.4);

          // Lines draw & footer fades up
          tl.to(footer.querySelectorAll('.footer-line-anim'), {
            scaleX: 1, duration: 1.1, stagger: 0.15, ease: 'power3.out',
          }, 0.4);

          tl.to(footer.querySelectorAll('.footer-fade'), {
            y: 0, opacity: 1, duration: 0.8, stagger: 0.08, ease: 'power3.out',
          }, 0.6);
        }
      },
      { threshold: 0.05 }
    );

    observer.observe(footer);
    return () => observer.disconnect();
  }, []);

  const handleMouseEnterBuild = () => {
    gsap.to(buRef.current, { x: '-5vw', duration: 0.6, ease: 'power3.out' });
    gsap.to(ldRef.current, { x: '5vw', duration: 0.6, ease: 'power3.out' });
    gsap.to(iStemRef.current, { y: '45px', rotation: 50, duration: 0.6, ease: 'power3.out' });
    gsap.to(labelRef.current, { opacity: 1, duration: 0.3 });
  };

  const handleMouseLeaveBuild = () => {
    gsap.to(buRef.current, { x: '-3.5vw', duration: 0.6, ease: 'power3.out' });
    gsap.to(ldRef.current, { x: '3.5vw', duration: 0.6, ease: 'power3.out' });
    gsap.to(iStemRef.current, { y: '30px', rotation: 45, duration: 0.6, ease: 'power3.out' });
  };

  const year = new Date().getFullYear();

  return (
    <footer
      ref={footerRef}
      className="relative w-full bg-[#050505] text-white overflow-hidden"
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

      <div className="px-6 md:px-16 lg:px-24 pt-24 pb-12">

        {/* ── Kinetic Typography CTA Section ───────────────── */}
        <div 
          className="mb-32 relative select-none"
          onMouseEnter={handleMouseEnterBuild}
          onMouseLeave={handleMouseLeaveBuild}
        >

          {/* Line 1: LET'S */}
          <div className="flex flex-wrap items-end gap-x-6 leading-[0.85] overflow-hidden mb-2">
            <span
              className="ftl-word inline-block font-black uppercase tracking-tighter text-white"
              style={{ fontSize: 'clamp(60px,12vw,160px)' }}
            >
              LET'S
            </span>
          </div>

          {/* Line 2: B U [I] L D — Solid typography blending 100% seamlessly */}
          <div className="relative flex items-center leading-[0.85] py-2">
            {/* BU */}
            <span
              ref={buRef}
              className="inline-block font-black uppercase tracking-tighter text-white will-change-transform z-10"
              style={{ fontSize: 'clamp(60px,12vw,160px)' }}
            >
              BU
            </span>

            {/* Kinetic Letter 'I' — Solid white character that detaches and rotates 45 deg */}
            <a
              ref={iStemRef}
              href="mailto:iambairwabharat@gmail.com"
              data-cursor="CONTACT"
              className="relative inline-block font-black uppercase tracking-tighter text-white will-change-transform z-30 group cursor-pointer"
              style={{
                fontSize: 'clamp(60px,12vw,160px)',
                lineHeight: '0.85',
              }}
            >
              <span className="inline-block text-white transition-colors duration-300 group-hover:text-white/80">
                I
              </span>

              {/* Monospace "CONTACT" label printed along the stem of rotated 'I' */}
              <span 
                ref={labelRef}
                className="absolute left-1/2 bottom-2 -translate-x-1/2 translate-y-full text-[9px] font-mono tracking-[0.4em] text-white/90 bg-black/80 px-2 py-0.5 rounded-xs border border-white/20 uppercase whitespace-nowrap opacity-0 transition-opacity duration-300 pointer-events-none"
                style={{ transform: 'translate(-50%, 100%) rotate(-45deg)', transformOrigin: 'top center' }}
              >
                CONTACT →
              </span>
            </a>

            {/* LD */}
            <span
              ref={ldRef}
              className="inline-block font-black uppercase tracking-tighter text-white will-change-transform z-10"
              style={{ fontSize: 'clamp(60px,12vw,160px)' }}
            >
              LD
            </span>
          </div>

          {/* Line 3: SOMETHING */}
          <div className="overflow-hidden leading-[0.85] my-2">
            <span
              className="ftl-line2 inline-block font-black uppercase tracking-tighter text-white will-change-transform"
              style={{ fontSize: 'clamp(60px,12vw,160px)' }}
            >
              SOMETHING
            </span>
          </div>

          {/* Line 4: GREAT. */}
          <div className="flex flex-wrap items-end gap-x-1 leading-[0.85]">
            {'GREAT.'.split('').map((l, i) => (
              <span
                key={i}
                className="ftl-fill-letter inline-block font-black uppercase tracking-tighter will-change-transform"
                style={{
                  fontSize: 'clamp(60px,12vw,160px)',
                  color: 'transparent',
                  WebkitTextStroke: '1.5px rgba(255,255,255,0.15)',
                }}
              >
                {l}
              </span>
            ))}
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
        <div className="footer-fade flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
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
