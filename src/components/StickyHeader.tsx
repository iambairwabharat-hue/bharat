import { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import gsap from 'gsap';

export interface StickyHeaderRef {
  setProgress: (p: number) => void;
}

const StickyHeader = forwardRef<StickyHeaderRef, {}>((_, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const wordsContainerRef = useRef<HTMLDivElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);

  useImperativeHandle(ref, () => ({
    setProgress: (p: number) => {
      if (tlRef.current) {
        tlRef.current.progress(p);
      }
    }
  }));

  useEffect(() => {
    // Create a paused timeline that will be driven by scroll progress
    const tl = gsap.timeline({ paused: true });
    tlRef.current = tl;

    // Set initial states for words
    gsap.set('.word-0 .char', { yPercent: 0 });
    gsap.set('.word-1 .char', { yPercent: -100 });
    gsap.set('.word-2 .char', { yPercent: -100 });
    gsap.set('.word-3 .char', { yPercent: -100 });

    // Start state for "I WILL DESIGN YOUR" - perfectly centered inside the 23vh bottom black bar
    gsap.set(titleRef.current, {
      right: '50%',
      bottom: '11.5vh', // geometric center of the 23vh tall bottom bar
      xPercent: 50,
      yPercent: 50,
      scale: 1,
      transformOrigin: 'bottom right'
    });

    // TIME 0-1: Scale down and move "I WILL DESIGN YOUR" to bottom right
    tl.to(titleRef.current, { 
      right: '20px', 
      bottom: 'calc(20px + 8vw)', // tightly stacked above the words container (which is 8vw tall)
      xPercent: 0, 
      yPercent: 0,
      scale: 0.4, 
      duration: 1, 
      ease: 'power2.inOut' 
    }, 0);

    tl.fromTo(wordsContainerRef.current, { opacity: 0 }, { opacity: 1, duration: 1, ease: 'power2.inOut' }, 0);

    // TIME 1-1.5: Pause
    tl.to({}, { duration: 0.5 });

    // TIME 1.5-2.5: BRAND -> VISION
    tl.to('.word-0 .char', { yPercent: 100, stagger: 0.05, duration: 0.6, ease: 'power3.inOut' }, 1.5)
      .to('.word-1 .char', { yPercent: 0, stagger: 0.05, duration: 0.6, ease: 'power3.inOut' }, 1.5);

    // TIME 2.5-3.0: Pause
    tl.to({}, { duration: 0.5 });

    // TIME 3.0-4.0: VISION -> IDENTITY
    tl.to('.word-1 .char', { yPercent: 100, stagger: 0.05, duration: 0.6, ease: 'power3.inOut' }, 3.0)
      .to('.word-2 .char', { yPercent: 0, stagger: 0.05, duration: 0.6, ease: 'power3.inOut' }, 3.0);

    // TIME 4.0-4.5: Pause
    tl.to({}, { duration: 0.5 });

    // TIME 4.5-5.5: IDENTITY -> STORY
    tl.to('.word-2 .char', { yPercent: 100, stagger: 0.05, duration: 0.6, ease: 'power3.inOut' }, 4.5)
      .to('.word-3 .char', { yPercent: 0, stagger: 0.05, duration: 0.6, ease: 'power3.inOut' }, 4.5);

    // TIME 5.5-6.5: Pause at the end to keep it sticky before gallery ends
    tl.to({}, { duration: 1.0 });

    return () => {
      tl.kill();
    };
  }, []);

  const words = ["SOFTWARE", "SYSTEMS", "PLATFORMS", "WEB APPS"];

  return (
    <div id="sticky-header" ref={containerRef} className="fixed inset-0 w-full h-[100vh] pointer-events-none z-30 overflow-hidden mix-blend-difference" style={{ opacity: 0 }}>
      
      {/* The main scaling text */}
      <h2 
        ref={titleRef} 
        className="absolute text-[#f4f4f4] font-black text-[10.2vw] uppercase tracking-tighter leading-none whitespace-nowrap will-change-transform m-0 p-0"
      >
        I WILL BUILD YOUR
      </h2>
      
      {/* The changing words below it */}
      <div 
        ref={wordsContainerRef} 
        className="absolute bottom-[20px] right-[20px] w-[80vw] h-[12vw] sm:h-[8vw] flex justify-end overflow-visible"
      >
        {words.map((word, wIdx) => (
          <div key={wIdx} className={`word-${wIdx} absolute right-0 flex items-center top-0`}>
            {word.split('').map((char, cIdx) => (
              <span key={cIdx} className="overflow-hidden inline-block pb-2">
                <span className="char inline-block text-[#f4f4f4] font-black text-[10vw] sm:text-[7vw] uppercase tracking-tighter will-change-transform leading-none">
                  {char}
                </span>
              </span>
            ))}
          </div>
        ))}
      </div>
      
    </div>
  );
});

export default StickyHeader;
