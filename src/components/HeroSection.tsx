import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import FluidBlob from './FluidBlob';

interface HeroSectionProps {
  onComplete?: () => void;
}

/**
 * Lusion-inspired Hero:
 * - Full-screen fluid 3D metaball blob (centre-right, massive)
 * - Split kinetic text "I AM" + "DEVELOPER" with spring physics on scroll
 * - Chromatic text glow on hover
 * - Fade-in metadata corners
 * - Scroll cue with breathing animation
 */
export default function HeroSection({ onComplete }: HeroSectionProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLDivElement>(null);
  const subRef = useRef<HTMLDivElement>(null);
  const metaTopRef = useRef<HTMLDivElement>(null);
  const scrollCueRef = useRef<HTMLDivElement>(null);
  const blobWrapRef = useRef<HTMLDivElement>(null);
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    const els = [
      headlineRef.current,
      subRef.current,
      metaTopRef.current,
      scrollCueRef.current,
      blobWrapRef.current,
    ];

    // Set initial states
    gsap.set(headlineRef.current, { y: 80, opacity: 0 });
    gsap.set(subRef.current, { y: 60, opacity: 0 });
    gsap.set(metaTopRef.current, { opacity: 0, y: -12 });
    gsap.set(scrollCueRef.current, { opacity: 0, y: 16 });
    gsap.set(blobWrapRef.current, { opacity: 0, scale: 0.7 });

    const tl = gsap.timeline({
      delay: 0.2,
      onComplete: () => {
        onCompleteRef.current?.();
      }
    });

    // Blob appears first — pulls attention
    tl.to(blobWrapRef.current, {
      opacity: 1,
      scale: 1,
      duration: 1.4,
      ease: 'power4.out',
    });

    // Headline sweeps in from below
    tl.to(headlineRef.current, {
      y: 0,
      opacity: 1,
      duration: 1.1,
      ease: 'power4.out',
    }, '-=0.9');

    tl.to(subRef.current, {
      y: 0,
      opacity: 1,
      duration: 1.0,
      ease: 'power4.out',
    }, '-=0.75');

    tl.to(metaTopRef.current, {
      opacity: 1,
      y: 0,
      duration: 0.7,
      ease: 'power2.out',
    }, '-=0.6');

    tl.to(scrollCueRef.current, {
      opacity: 0.55,
      y: 0,
      duration: 0.7,
      ease: 'power2.out',
    }, '-=0.4');

    // Spring bounce on headline letters — kinetic feel
    tl.to(headlineRef.current, {
      y: -8,
      duration: 0.35,
      ease: 'power2.out',
      yoyo: true,
      repeat: 1,
    }, '-=0.1');

    // Skip on interaction
    const finishEarly = () => {
      tl.progress(1);
    };
    const onWheel = (e: WheelEvent) => { if (e.deltaY > 3) finishEarly(); };
    const onTouch = () => finishEarly();
    window.addEventListener('wheel', onWheel, { passive: true });
    window.addEventListener('touchstart', onTouch, { passive: true });

    return () => {
      tl.kill();
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('touchstart', onTouch);
    };
  }, []);

  // Spring physics: text nudges on mouse move
  useEffect(() => {
    const headline = headlineRef.current;
    const sub = subRef.current;
    if (!headline || !sub) return;

    let rafId: number;
    const state = { dx: 0, dy: 0, vx: 0, vy: 0 };

    const onMove = (e: MouseEvent) => {
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;
      state.dx += (e.clientX - cx) * 0.003;
      state.dy += (e.clientY - cy) * 0.003;
    };
    window.addEventListener('mousemove', onMove, { passive: true });

    const spring = () => {
      // Spring constant & damping
      const k = 0.07, damp = 0.88;
      state.vx += -state.dx * k;
      state.vy += -state.dy * k;
      state.vx *= damp;
      state.vy *= damp;
      state.dx += state.vx;
      state.dy += state.vy;

      const tx = state.dx * 18;
      const ty = state.dy * 12;
      headline.style.transform = `translate3d(${tx}px, ${ty}px, 0)`;
      sub.style.transform = `translate3d(${tx * 0.6}px, ${ty * 0.6}px, 0)`;

      rafId = requestAnimationFrame(spring);
    };
    rafId = requestAnimationFrame(spring);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('mousemove', onMove);
    };
  }, []);

  return (
    <section
      ref={containerRef}
      className="h-screen w-full relative overflow-hidden flex items-center"
      style={{ background: '#030308' }}
    >
      {/* Fine noise grain */}
      <div
        className="absolute inset-0 pointer-events-none z-30 opacity-[0.04]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundSize: '200px 200px',
        }}
      />

      {/* Radial gradient bg — deep space feel */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 80% 60% at 70% 50%, #0d0626 0%, #030308 65%)',
        }}
      />

      {/* ── BLOB (right side, huge, immersive) ── */}
      <div
        ref={blobWrapRef}
        className="absolute right-[-10vw] top-1/2 -translate-y-1/2 pointer-events-none z-10"
        style={{
          width: 'clamp(380px, 60vw, 820px)',
          height: 'clamp(380px, 60vw, 820px)',
          filter: 'blur(0.5px)',
        }}
      >
        <FluidBlob className="w-full h-full" />
      </div>

      {/* Soft glow behind blob */}
      <div
        className="absolute right-[-5vw] top-1/2 -translate-y-1/2 pointer-events-none z-[9]"
        style={{
          width: 'clamp(400px, 65vw, 900px)',
          height: 'clamp(400px, 65vw, 900px)',
          background: 'radial-gradient(circle, rgba(60,20,140,0.35) 0%, transparent 65%)',
          filter: 'blur(60px)',
        }}
      />

      {/* ── METADATA TOP ── */}
      <div
        ref={metaTopRef}
        className="absolute top-8 left-8 right-8 z-40 flex items-center justify-between pointer-events-none"
      >
        <span className="text-[10px] font-mono tracking-[0.4em] text-white/40 uppercase">
          BHARAT BAIRWA
        </span>
        <span className="text-[10px] font-mono tracking-[0.35em] text-white/30 uppercase hidden md:inline">
          BASED IN AHMEDABAD, IN
        </span>
      </div>

      {/* ── MAIN HEADLINE ── */}
      <div className="relative z-20 pl-[8vw] pr-[45vw] md:pr-[55vw] flex flex-col gap-0 select-none">
        <div
          ref={headlineRef}
          className="will-change-transform"
          style={{ transformOrigin: 'left center' }}
        >
          {/* "I" line */}
          <div className="overflow-hidden">
            <span
              className="block text-white font-black uppercase leading-[0.82]"
              style={{
                fontSize: 'clamp(72px, 13vw, 200px)',
                fontFamily: "'Inter Tight', sans-serif",
                letterSpacing: '-0.04em',
                textShadow: '0 0 80px rgba(120,60,255,0.25)',
              }}
            >
              I
            </span>
          </div>
          {/* "AM" line */}
          <div className="overflow-hidden">
            <span
              className="block text-white font-black uppercase leading-[0.82]"
              style={{
                fontSize: 'clamp(72px, 13vw, 200px)',
                fontFamily: "'Inter Tight', sans-serif",
                letterSpacing: '-0.04em',
                textShadow: '0 0 80px rgba(120,60,255,0.2)',
              }}
            >
              AM
            </span>
          </div>
        </div>

        {/* "DEVELOPER" — slightly offset, different weight feel */}
        <div
          ref={subRef}
          className="will-change-transform mt-1"
          style={{ transformOrigin: 'left center' }}
        >
          <div className="overflow-hidden">
            <span
              className="block font-black uppercase leading-[0.82]"
              style={{
                fontSize: 'clamp(72px, 13vw, 200px)',
                fontFamily: "'Inter Tight', sans-serif",
                letterSpacing: '-0.04em',
                WebkitTextStroke: '1.5px rgba(255,255,255,0.55)',
                color: 'transparent',
                background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(120,60,255,0.7) 60%, rgba(30,180,255,0.5) 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              DEVELOPER
            </span>
          </div>

          {/* Sub tagline */}
          <p
            className="mt-6 text-[11px] font-mono tracking-[0.35em] text-white/35 uppercase"
          >
            WEB&nbsp;·&nbsp;DESIGN&nbsp;·&nbsp;DIGITAL
          </p>
        </div>
      </div>

      {/* ── SCROLL CUE ── */}
      <div
        ref={scrollCueRef}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-40 flex flex-col items-center gap-2 pointer-events-none"
      >
        <span className="text-[9px] font-mono tracking-[0.5em] text-white/30 uppercase">
          SCROLL
        </span>
        <div className="relative w-px h-10 overflow-hidden">
          <div
            className="absolute inset-x-0 top-0 bg-gradient-to-b from-transparent via-white/50 to-transparent"
            style={{
              height: '100%',
              animation: 'scrollLine 1.8s ease-in-out infinite',
            }}
          />
        </div>
      </div>

      {/* Keyframe for scroll line */}
      <style>{`
        @keyframes scrollLine {
          0% { transform: translateY(-100%); opacity: 0; }
          30% { opacity: 1; }
          70% { opacity: 1; }
          100% { transform: translateY(200%); opacity: 0; }
        }
      `}</style>
    </section>
  );
}
