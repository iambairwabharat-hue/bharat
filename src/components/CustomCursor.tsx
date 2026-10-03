import { useEffect, useRef, useState } from 'react';

export default function CustomCursor() {
  const cursorDotRef = useRef<HTMLDivElement>(null);
  const cursorRingRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);

  const [cursorText, setCursorText] = useState<string | null>(null);
  const [isHovering, setIsHovering] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    // Check for touch capability
    if (window.matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window) {
      setIsTouchDevice(true);
      return;
    }

    let mouseX = -100;
    let mouseY = -100;
    let dotX = -100;
    let dotY = -100;
    let ringX = -100;
    let ringY = -100;

    let animFrameId: number;

    const onMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;

      // Check hover target for data-cursor attribute
      const target = e.target as HTMLElement | null;
      const cursorTarget = target?.closest('[data-cursor]') as HTMLElement | null;

      if (cursorTarget) {
        const text = cursorTarget.getAttribute('data-cursor');
        setCursorText(text);
        setIsHovering(true);
      } else {
        setCursorText(null);
        setIsHovering(false);
      }
    };

    const lerp = (start: number, end: number, factor: number) => start + (end - start) * factor;

    const render = () => {
      // Fast lerp for dot, slightly smoother lerp for ring
      dotX = lerp(dotX, mouseX, 0.35);
      dotY = lerp(dotY, mouseY, 0.35);

      ringX = lerp(ringX, mouseX, 0.15);
      ringY = lerp(ringY, mouseY, 0.15);

      if (cursorDotRef.current) {
        cursorDotRef.current.style.transform = `translate3d(${dotX}px, ${dotY}px, 0) translate(-50%, -50%)`;
      }
      if (cursorRingRef.current) {
        cursorRingRef.current.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) translate(-50%, -50%)`;
      }

      animFrameId = requestAnimationFrame(render);
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    animFrameId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      cancelAnimationFrame(animFrameId);
    };
  }, []);

  if (isTouchDevice) return null;

  return (
    <>
      {/* Central minimal dot */}
      <div
        ref={cursorDotRef}
        className={`fixed top-0 left-0 pointer-events-none z-[999] hidden lg:block rounded-full bg-white transition-opacity duration-300 ${
          isHovering ? 'w-2 h-2 opacity-0' : 'w-2 h-2 opacity-100 mix-blend-difference'
        }`}
        style={{ willChange: 'transform' }}
      />

      {/* Smooth outer ring / context pill */}
      <div
        ref={cursorRingRef}
        className={`fixed top-0 left-0 pointer-events-none z-[998] hidden lg:flex items-center justify-center rounded-full border border-white/60 transition-all duration-300 ease-out mix-blend-difference ${
          isHovering
            ? 'w-20 h-20 bg-white text-black border-transparent scale-100'
            : 'w-10 h-10 bg-transparent scale-100'
        }`}
        style={{ willChange: 'transform' }}
      >
        <span
          ref={labelRef}
          className={`text-[9px] font-mono tracking-widest uppercase font-bold text-black transition-opacity duration-200 ${
            isHovering && cursorText ? 'opacity-100 scale-100' : 'opacity-0 scale-75'
          }`}
        >
          {cursorText}
        </span>
      </div>
    </>
  );
}
