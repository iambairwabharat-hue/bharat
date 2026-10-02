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

  useEffect(() => {
    const footer = footerRef.current;
    if (!footer) return;

    gsap.set(footer.querySelectorAll('.ftl-word'), { yPercent: 105, skewX: 6, opacity: 0 });
    gsap.set(footer.querySelector('.ftl-line2'), { clipPath: 'inset(0% 100% 0% 0%)', opacity: 1 });
    gsap.set(footer.querySelectorAll('.ftl-fill-letter'), { opacity: 1 });
    gsap.set(footer.querySelectorAll('.footer-line-anim'), { scaleX: 0, transformOrigin: 'left center' });
    gsap.set(footer.querySelectorAll('.footer-fade'), { y: 30, opacity: 0 });

    if (marqueeRef.current) {
      gsap.to(marqueeRef.current, { xPercent: -50, duration: 22, ease: 'none', repeat: -1 });
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !animatedRef.current) {
          animatedRef.current = true;
          const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });

          tl.to(footer.querySelectorAll('.ftl-word'), {
            yPercent: 0, skewX: 0, opacity: 1, duration: 1.0, stagger: 0.13,
          }, 0);

          tl.to(footer.querySelector('.ftl-line2'), {
            clipPath: 'inset(0% 0% 0% 0%)', duration: 1.05, ease: 'expo.out',
          }, 0.2);

          tl.fromTo(footer.querySelectorAll('.ftl-fill-letter'),
            { color: 'transparent', webkitTextStrokeColor: 'rgba(255,255,255,0.15)' },
            { color: 'white', webkitTextStrokeColor: 'rgba(255,255,255,0)', duration: 0.5, stagger: 0.09, ease: 'none' },
          0.55);

          tl.to(footer.querySelectorAll('.footer-line-anim'), {
            scaleX: 1, duration: 1.1, stagger: 0.15, ease: 'power3.out',
          }, 0.4);

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

        {/* ── Big CTA text ───────────────────────────────── */}
        <div className="mb-20">

          {/* Line 1 */}
          <div className="flex flex-wrap items-end gap-x-6 leading-[0.85] overflow-hidden mb-1">
            {["LET'S", 'BUILD'].map((word, wi) => (
              <span
                key={wi}
                className="ftl-word inline-block font-black uppercase tracking-tighter will-change-transform"
                style={{
                  fontSize: 'clamp(56px,11vw,145px)',
                  color: wi === 1 ? 'transparent' : 'white',
                  WebkitTextStroke: wi === 1 ? '1.5px rgba(255,255,255,0.2)' : undefined,
                }}
              >
                {word}
              </span>
            ))}
          </div>

          {/* Line 2 */}
          <div className="overflow-hidden leading-[0.85] mb-1">
            <span
              className="ftl-line2 inline-block font-black uppercase tracking-tighter text-white will-change-transform"
              style={{ fontSize: 'clamp(56px,11vw,145px)' }}
            >
              SOMETHING
            </span>
          </div>

          {/* Line 3 */}
          <div className="flex flex-wrap items-end gap-x-1 leading-[0.85]">
            {'GREAT.'.split('').map((l, i) => (
              <span
                key={i}
                className="ftl-fill-letter inline-block font-black uppercase tracking-tighter will-change-transform"
                style={{
                  fontSize: 'clamp(56px,11vw,145px)',
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
            data-cursor="EMAIL"
            className="group inline-flex items-center gap-6 border border-white/20 px-8 py-5 hover:bg-white hover:border-white transition-all duration-500 rounded-sm"
          >
            <span className="text-xs md:text-sm tracking-[0.25em] text-white/80 group-hover:text-black uppercase font-mono transition-colors duration-300">
              iambairwabharat@gmail.com
            </span>
            <span className="text-white/40 group-hover:text-black group-hover:translate-x-1.5 transition-all duration-300 text-sm font-mono">
              →
            </span>
          </a>
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
