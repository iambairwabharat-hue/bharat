import { useEffect, useRef } from 'react';
import gsap from 'gsap';

const NAV_LINKS = [
  { label: 'About', href: '#' },
  { label: 'Work', href: '#' },
  { label: 'Experience', href: '#' },
  { label: 'Contact', href: 'mailto:iambairwabharat@gmail.com' },
];

const SOCIAL_LINKS = [
  { label: 'Instagram', href: 'https://instagram.com' },
  { label: 'LinkedIn', href: 'https://linkedin.com' },
  { label: 'GitHub', href: 'https://github.com' },
  { label: 'Vercel', href: 'https://bharat-iota-beige.vercel.app' },
];

export default function Footer() {
  const footerRef = useRef<HTMLElement>(null);
  const animatedRef = useRef(false);
  const marqueeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const footer = footerRef.current;
    if (!footer) return;

    // Pre-hide all elements
    gsap.set(footer.querySelectorAll('.ftl-word'), { yPercent: 105, skewX: 6, opacity: 0 });
    gsap.set(footer.querySelector('.ftl-line2'), { clipPath: 'inset(0% 100% 0% 0%)', opacity: 1 });
    gsap.set(footer.querySelectorAll('.ftl-fill-letter'), { opacity: 1 });
    gsap.set(footer.querySelectorAll('.footer-line-anim'), { scaleX: 0, transformOrigin: 'left center' });
    gsap.set(footer.querySelectorAll('.footer-fade'), { y: 30, opacity: 0 });

    // Marquee
    if (marqueeRef.current) {
      gsap.to(marqueeRef.current, { xPercent: -50, duration: 18, ease: 'none', repeat: -1 });
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !animatedRef.current) {
          animatedRef.current = true;
          const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });

          // Line 1: LET'S + BUILD — word-by-word skew-slide up
          tl.to(footer.querySelectorAll('.ftl-word'), {
            yPercent: 0, skewX: 0, opacity: 1, duration: 1.0, stagger: 0.13,
          }, 0);

          // Line 2: SOMETHING — clip-path sweeps left to right
          tl.to(footer.querySelector('.ftl-line2'), {
            clipPath: 'inset(0% 0% 0% 0%)', duration: 1.05, ease: 'expo.out',
          }, 0.2);

          // Line 3: GREAT. — letters fill from outline to solid white, staggered
          tl.fromTo(footer.querySelectorAll('.ftl-fill-letter'),
            { color: 'transparent', webkitTextStrokeColor: 'rgba(255,255,255,0.15)' },
            { color: 'white', webkitTextStrokeColor: 'rgba(255,255,255,0)', duration: 0.5, stagger: 0.09, ease: 'none' },
          0.55);

          // Divider lines draw
          tl.to(footer.querySelectorAll('.footer-line-anim'), {
            scaleX: 1, duration: 1.1, stagger: 0.15, ease: 'power3.out',
          }, 0.4);

          // Footer content fades up
          tl.to(footer.querySelectorAll('.footer-fade'), {
            y: 0, opacity: 1, duration: 0.8, stagger: 0.08, ease: 'power3.out',
          }, 0.5);
        }
      },
      { threshold: 0.05 }
    );

    observer.observe(footer);
    return () => observer.disconnect();
  }, []);

  const year = new Date().getFullYear();

  return (
    <footer
      ref={footerRef}
      className="relative w-full bg-[#050505] text-white overflow-hidden"
    >
      {/* Top hairline */}
      <div className="footer-line-anim w-full h-px bg-white/10" />

      {/* Marquee strip */}
      <div className="w-full overflow-hidden border-b border-white/[0.06] py-5">
        <div ref={marqueeRef} className="flex whitespace-nowrap gap-0" style={{ width: '200%' }}>
          {Array.from({ length: 2 }).map((_, gi) => (
            <div key={gi} className="flex items-center gap-10 px-5">
              {['WordPress', 'Shopify', 'UI/UX Design', 'React', 'Blender 3D', 'AI-Powered Dev', 'Social Media Design', 'Frontend Development', 'E-commerce'].map((item, i) => (
                <span key={i} className="flex items-center gap-10">
                  <span className="text-[10px] tracking-[0.45em] text-white/25 uppercase font-mono">{item}</span>
                  <span className="text-white/10">·</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Main footer content */}
      <div className="px-6 md:px-16 lg:px-24 pt-20 pb-12">

        {/* ── Big CTA text ───────────────────────────────── */}
        <div className="mb-20">

          {/* Line 1: LET'S BUILD — word skew-slide */}
          <div className="flex flex-wrap items-end gap-x-6 leading-[0.85] overflow-hidden mb-1">
            {["LET'S", 'BUILD'].map((word, wi) => (
              <span
                key={wi}
                className="ftl-word inline-block font-black uppercase tracking-tighter will-change-transform"
                style={{
                  fontSize: 'clamp(60px,11vw,150px)',
                  color: wi === 1 ? 'transparent' : 'white',
                  WebkitTextStroke: wi === 1 ? '1.5px rgba(255,255,255,0.2)' : undefined,
                }}
              >
                {word}
              </span>
            ))}
          </div>

          {/* Line 2: SOMETHING — clip-path left→right sweep */}
          <div className="overflow-hidden leading-[0.85] mb-1">
            <span
              className="ftl-line2 inline-block font-black uppercase tracking-tighter text-white will-change-transform"
              style={{ fontSize: 'clamp(60px,11vw,150px)' }}
            >
              SOMETHING
            </span>
          </div>

          {/* Line 3: GREAT. — stroke-to-fill morph per letter */}
          <div className="flex flex-wrap items-end gap-x-1 leading-[0.85]">
            {'GREAT.'.split('').map((l, i) => (
              <span
                key={i}
                className="ftl-fill-letter inline-block font-black uppercase tracking-tighter will-change-transform"
                style={{
                  fontSize: 'clamp(60px,11vw,150px)',
                  color: 'transparent',
                  WebkitTextStroke: '1.5px rgba(255,255,255,0.15)',
                }}
              >
                {l}
              </span>
            ))}
          </div>
        </div>

        {/* Email CTA button */}
        <div className="footer-fade mb-24">
          <a
            href="mailto:iambairwabharat@gmail.com"
            className="group inline-flex items-center gap-5 border border-white/15 px-8 py-5 hover:bg-white hover:border-white transition-all duration-500"
          >
            <span className="text-sm tracking-[0.25em] text-white/70 group-hover:text-black uppercase font-mono transition-colors duration-300">
              iambairwabharat@gmail.com
            </span>
            <span className="text-white/40 group-hover:text-black/60 group-hover:translate-x-1 transition-all duration-300 text-base">→</span>
          </a>
        </div>

        {/* Divider */}
        <div className="footer-line-anim w-full h-px bg-white/[0.07] mb-14" />

        {/* Bottom bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-6">

          {/* Left — Brand */}
          <div className="footer-fade flex flex-col gap-4">
            <p className="text-[10px] tracking-[0.5em] text-white/25 uppercase font-mono">Bharat Bairwa</p>
            <p className="text-xs leading-[1.8] text-white/30 max-w-xs">
              Creative web developer & designer based in Sabarmati, Ahmedabad. Turning ideas into digital reality.
            </p>
            <p className="text-[10px] tracking-[0.3em] text-white/15 font-mono mt-2">+91 99740 33803</p>
          </div>

          {/* Center — Nav */}
          <div className="footer-fade flex flex-col gap-3">
            <p className="text-[10px] tracking-[0.5em] text-white/25 uppercase font-mono mb-2">Navigation</p>
            {NAV_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="group flex items-center gap-3 w-fit"
              >
                <span className="w-3 h-px bg-white/20 group-hover:w-6 group-hover:bg-white/60 transition-all duration-300" />
                <span className="text-xs tracking-[0.2em] text-white/35 group-hover:text-white uppercase font-mono transition-colors duration-300">
                  {link.label}
                </span>
              </a>
            ))}
          </div>

          {/* Right — Social */}
          <div className="footer-fade flex flex-col gap-3">
            <p className="text-[10px] tracking-[0.5em] text-white/25 uppercase font-mono mb-2">Socials</p>
            {SOCIAL_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noreferrer"
                className="group flex items-center gap-3 w-fit"
              >
                <span className="w-3 h-px bg-white/20 group-hover:w-6 group-hover:bg-white/60 transition-all duration-300" />
                <span className="text-xs tracking-[0.2em] text-white/35 group-hover:text-white uppercase font-mono transition-colors duration-300">
                  {link.label}
                </span>
              </a>
            ))}
          </div>

        </div>

        {/* Copyright bar */}
        <div className="footer-line-anim w-full h-px bg-white/[0.05] mt-14 mb-8" />
        <div className="footer-fade flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <span className="text-[9px] tracking-[0.4em] text-white/15 uppercase font-mono">
            © {year} Bharat Bairwa. All rights reserved.
          </span>
          <span className="text-[9px] tracking-[0.4em] text-white/10 uppercase font-mono">
            Designed & Built with ❤️ in Ahmedabad
          </span>
        </div>

      </div>
    </footer>
  );
}
