import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';

/**
 * Lusion-style custom cursor:
 * - Small precision dot (tracks fast)
 * - Outer glowing ring (tracks with spring lag)  
 * - On hover: ring expands to pill, fills with text label
 * - On click: burst scale + glow flash
 * - Magnetic pull toward interactive elements
 */
export default function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);

  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    if (window.matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window) {
      setIsTouchDevice(true);
      return;
    }

    let mouseX = -200, mouseY = -200;
    let dotX = -200, dotY = -200;
    let ringX = -200, ringY = -200;
    let rafId: number;
    let isHovered = false;

    const lerp = (a: number, b: number, f: number) => a + (b - a) * f;

    // Hide native cursor
    document.documentElement.style.cursor = 'none';

    const onMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;

      // Magnetic: check for interactive targets
      const target = e.target as HTMLElement | null;
      const magnetEl = target?.closest('[data-cursor], a, button') as HTMLElement | null;
      const cursorTarget = target?.closest('[data-cursor]') as HTMLElement | null;

      if (magnetEl) {
        const rect = magnetEl.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dx = e.clientX - cx;
        const dy = e.clientY - cy;
        // Slight magnetic nudge
        mouseX = e.clientX - dx * 0.08;
        mouseY = e.clientY - dy * 0.08;
      }

      const label = cursorTarget?.getAttribute('data-cursor') ?? null;

      if (!isHovered && cursorTarget) {
        isHovered = true;
        if (ringRef.current) {
          gsap.to(ringRef.current, {
            width: label ? 88 : 56,
            height: label ? 88 : 56,
            backgroundColor: 'rgba(255,255,255,0.92)',
            borderColor: 'transparent',
            duration: 0.35,
            ease: 'power3.out',
          });
        }
        if (dotRef.current) gsap.to(dotRef.current, { opacity: 0, duration: 0.2 });
        if (glowRef.current) gsap.to(glowRef.current, { opacity: 0.6, scale: 1.8, duration: 0.4 });
        if (labelRef.current) {
          labelRef.current.textContent = label ?? '';
          gsap.to(labelRef.current, { opacity: 1, scale: 1, duration: 0.25 });
        }
      } else if (isHovered && !cursorTarget) {
        isHovered = false;
        if (ringRef.current) {
          gsap.to(ringRef.current, {
            width: 36,
            height: 36,
            backgroundColor: 'transparent',
            borderColor: 'rgba(255,255,255,0.55)',
            duration: 0.4,
            ease: 'power3.out',
          });
        }
        if (dotRef.current) gsap.to(dotRef.current, { opacity: 1, duration: 0.25 });
        if (glowRef.current) gsap.to(glowRef.current, { opacity: 0, scale: 1, duration: 0.35 });
        if (labelRef.current) gsap.to(labelRef.current, { opacity: 0, scale: 0.8, duration: 0.15 });
      }
    };

    const onMouseDown = () => {
      gsap.to(ringRef.current, { scale: 0.82, duration: 0.12, ease: 'power2.out' });
      gsap.to(glowRef.current, { opacity: 0.9, scale: 2.2, duration: 0.15 });
    };

    const onMouseUp = () => {
      gsap.to(ringRef.current, { scale: 1, duration: 0.35, ease: 'elastic.out(1.2, 0.5)' });
      gsap.to(glowRef.current, { opacity: isHovered ? 0.6 : 0, scale: isHovered ? 1.8 : 1, duration: 0.4 });
    };

    const render = () => {
      // Dot tracks fast (precise)
      dotX = lerp(dotX, mouseX, 0.42);
      dotY = lerp(dotY, mouseY, 0.42);

      // Ring springs behind (smooth lag)
      ringX = lerp(ringX, mouseX, 0.13);
      ringY = lerp(ringY, mouseY, 0.13);

      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${dotX}px,${dotY}px,0) translate(-50%,-50%)`;
      }
      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ringX}px,${ringY}px,0) translate(-50%,-50%)`;
      }
      if (glowRef.current) {
        glowRef.current.style.transform = `translate3d(${ringX}px,${ringY}px,0) translate(-50%,-50%)`;
      }

      rafId = requestAnimationFrame(render);
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);
    rafId = requestAnimationFrame(render);

    return () => {
      document.documentElement.style.cursor = '';
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
      cancelAnimationFrame(rafId);
    };
  }, []);

  if (isTouchDevice) return null;

  return (
    <>
      {/* Glow halo — behind everything */}
      <div
        ref={glowRef}
        className="fixed top-0 left-0 pointer-events-none z-[990] hidden lg:block"
        style={{
          width: 80,
          height: 80,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(120,60,255,0.45) 0%, transparent 70%)',
          opacity: 0,
          willChange: 'transform, opacity',
          filter: 'blur(6px)',
        }}
      />

      {/* Outer ring */}
      <div
        ref={ringRef}
        className="fixed top-0 left-0 pointer-events-none z-[995] hidden lg:flex items-center justify-center"
        style={{
          width: 36,
          height: 36,
          borderRadius: '50%',
          border: '1.5px solid rgba(255,255,255,0.55)',
          backgroundColor: 'transparent',
          willChange: 'transform, width, height',
          mixBlendMode: 'difference',
        }}
      >
        <span
          ref={labelRef}
          className="text-[8px] font-mono font-bold tracking-widest uppercase text-black"
          style={{ opacity: 0, transform: 'scale(0.8)', transformOrigin: 'center', transition: 'none' }}
        />
      </div>

      {/* Precision dot */}
      <div
        ref={dotRef}
        className="fixed top-0 left-0 pointer-events-none z-[999] hidden lg:block"
        style={{
          width: 5,
          height: 5,
          borderRadius: '50%',
          backgroundColor: 'white',
          willChange: 'transform, opacity',
          mixBlendMode: 'difference',
        }}
      />
    </>
  );
}
