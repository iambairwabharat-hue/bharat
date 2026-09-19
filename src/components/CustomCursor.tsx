import { useEffect, useRef } from 'react';

export default function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Hidden on mobile, so we can just track globally but CSS will hide it
    const onMouseMove = (e: MouseEvent) => {
      if (cursorRef.current) {
        cursorRef.current.style.left = `${e.clientX}px`;
        cursorRef.current.style.top = `${e.clientY}px`;
      }
    };

    window.addEventListener('mousemove', onMouseMove);
    return () => window.removeEventListener('mousemove', onMouseMove);
  }, []);

  return (
    <div
      ref={cursorRef}
      className="fixed pointer-events-none z-50 hidden lg:flex items-center justify-center mix-blend-exclusion"
      style={{ transform: 'translate(-50%, -50%)', left: '-100px', top: '-100px' }}
    >
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="24" cy="24" r="22.75" stroke="white" strokeWidth="2.5" />
        <path
          d="M19 16C19 16 19.5 17 21 17C22.5 17 23 16 23 16M29 16C29 16 28.5 17 27 17C25.5 17 25 16 25 16M24 22V28M24 28L21 25M24 28L27 25M17 33H31"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}
