import { useEffect, useRef } from 'react';
import gsap from 'gsap';

interface HeroSectionProps {
  onComplete?: () => void;
}

export default function HeroSection({ onComplete }: HeroSectionProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const iTextRef = useRef<HTMLSpanElement>(null);
  const amTextRef = useRef<HTMLSpanElement>(null);
  const bottomTextRef = useRef<HTMLSpanElement>(null);
  const gapRef = useRef<HTMLDivElement>(null);
  const imageContainerRef = useRef<HTMLDivElement>(null);
  const img1Ref = useRef<HTMLImageElement>(null);
  const img2Ref = useRef<HTMLImageElement>(null);
  const img3Ref = useRef<HTMLImageElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const metadataRef = useRef<HTMLDivElement>(null);
  const scrollCueRef = useRef<HTMLDivElement>(null);

  const onCompleteRef = useRef(onComplete);
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    let tl: gsap.core.Timeline | null = null;
    let isCompleted = false;

    const finishEarly = () => {
      if (isCompleted || !tl) return;
      isCompleted = true;
      tl.progress(1);
    };

    // Listen for wheel/touch/click to skip animation gracefully if user interacts
    const handleUserInteraction = (e: Event) => {
      if (e.type === 'wheel' && (e as WheelEvent).deltaY > 5) {
        finishEarly();
      } else if (e.type === 'touchstart' || e.type === 'click') {
        finishEarly();
      }
    };

    window.addEventListener('wheel', handleUserInteraction, { passive: true });
    window.addEventListener('touchstart', handleUserInteraction, { passive: true });

    // Dynamically calculate the exact center of the gap between I and AM
    const animationFrameId = requestAnimationFrame(() => {
      if (gapRef.current && imageContainerRef.current && containerRef.current) {
        tl = gsap.timeline({
          onComplete: () => {
            isCompleted = true;
            onCompleteRef.current?.();
          }
        });

        const gapRect = gapRef.current.getBoundingClientRect();
        const sectionRect = containerRef.current.getBoundingClientRect();
        
        // Exact pixel coordinates relative to the section
        const relX = (gapRect.left - sectionRect.left) + gapRect.width / 2;
        const relY = (gapRect.top - sectionRect.top) + gapRect.height / 2;

        tl.set(imageContainerRef.current, { 
          left: relX, 
          top: relY, 
          xPercent: -50, 
          yPercent: -50,
          scale: 0.85, 
          opacity: 0 
        });

        tl.set(img2Ref.current, { opacity: 0 });
        tl.set(img3Ref.current, { opacity: 0 });
        tl.set(videoRef.current, { opacity: 0 });
        tl.set(metadataRef.current, { opacity: 0, y: -10 });
        tl.set(scrollCueRef.current, { opacity: 0, y: 10 });

        // Metadata fade in quickly
        tl.to(metadataRef.current, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }, 0.1);
        tl.to(scrollCueRef.current, { opacity: 0.6, y: 0, duration: 0.6, ease: 'power2.out' }, 0.2);

        // Stay stable for 0.75 seconds
        tl.add("split", "+=0.65");

        // I moves left, AM moves right smoothly
        tl.to(iTextRef.current, { x: '-10vw', duration: 0.8, ease: 'power4.inOut' }, "split")
          .to(amTextRef.current, { x: '10vw', duration: 0.8, ease: 'power4.inOut' }, "split");

        // Image reveal happens EXACTLY between I and AM
        tl.to(imageContainerRef.current, { scale: 1, opacity: 1, duration: 0.8, ease: 'power4.out' }, "split+=0.1")
          // Image sequence transition
          .to(img1Ref.current, { opacity: 0, duration: 0.15 }, "+=0.35")
          .to(img2Ref.current, { opacity: 1, duration: 0.15 }, "<")
          .to(img2Ref.current, { opacity: 0, duration: 0.15 }, "+=0.35")
          .to(img3Ref.current, { opacity: 1, duration: 0.15 }, "<")
          .to(img3Ref.current, { opacity: 0, duration: 0.15 }, "+=0.35")
          .to(videoRef.current, { opacity: 1, duration: 0.15 }, "<");

        tl.add("outro", "+=0.25");

        // Text & Metadata fade out smoothly
        tl.to([iTextRef.current, amTextRef.current], { y: '-100vh', opacity: 0, duration: 0.8, ease: 'power3.inOut' }, "outro")
          .to(bottomTextRef.current, { y: '100vh', opacity: 0, duration: 0.8, ease: 'power3.inOut' }, "outro+=0.1")
          .to([metadataRef.current, scrollCueRef.current], { opacity: 0, duration: 0.4 }, "outro");

        // Image expands perfectly to fullscreen
        tl.to(imageContainerRef.current, {
          width: '100vw',
          height: '100vh',
          left: '50vw',
          top: '50vh',
          xPercent: -50,
          yPercent: -50,
          borderRadius: '0px',
          duration: 1.1,
          ease: 'power3.inOut'
        }, "outro+=0.15");

        // Pull the black panel up
        tl.to('#black-panel', { marginTop: '-23vh', duration: 0.5, ease: 'power2.out' }, ">");
        // Fade in sticky header
        tl.to('#sticky-header', { opacity: 1, duration: 0.5, ease: 'power2.out' }, "<");
      }
    });

    return () => {
      window.removeEventListener('wheel', handleUserInteraction);
      window.removeEventListener('touchstart', handleUserInteraction);
      cancelAnimationFrame(animationFrameId);
      if (tl) tl.kill();
    };
  }, []);

  return (
    <section ref={containerRef} className="h-screen w-full relative bg-[#0a0a0a] overflow-hidden flex flex-col items-center justify-center">
      
      {/* Subtle fine noise texture overlay */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.035] z-30"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Editorial Metadata Header */}
      <div 
        ref={metadataRef} 
        className="absolute top-8 left-8 right-8 z-30 flex items-center justify-between pointer-events-none text-[10px] font-mono tracking-[0.35em] text-white/50 uppercase"
      >
        <span>BASED IN AHMEDABAD, IN</span>
        <span className="hidden md:inline">WEB / DESIGN / DIGITAL</span>
      </div>

      {/* Centered Split Text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-20">
        <div className="h-[12vw] sm:h-[15vw] flex items-center justify-center gap-6 sm:gap-10 w-full relative">
          <span ref={iTextRef} className="text-[#f4f4f4] text-[13vw] sm:text-[15vw] leading-[0.8] font-black uppercase tracking-tighter will-change-transform inline-block">
            I
          </span>
          <div ref={gapRef} className="w-0 h-full"></div>
          <span ref={amTextRef} className="text-[#f4f4f4] text-[13vw] sm:text-[15vw] leading-[0.8] font-black uppercase tracking-tighter will-change-transform inline-block">
            AM
          </span>
        </div>
        <div className="h-[12vw] sm:h-[15vw] flex items-center justify-center w-full relative">
          <span ref={bottomTextRef} className="text-[#f4f4f4] text-[13vw] sm:text-[15vw] leading-[0.8] font-black uppercase tracking-tighter will-change-transform inline-block">
            DEVELOPER
          </span>
        </div>
      </div>

      {/* Flashing Images Container */}
      <div 
        ref={imageContainerRef} 
        className="absolute z-10 w-[180px] h-[200px] sm:w-[240px] sm:h-[260px] rounded-md overflow-hidden will-change-transform shadow-2xl"
        style={{ transformOrigin: 'center center' }}
      >
        <img ref={img1Ref} src="./home/mokups/11788a376563433844eea8179b784f74.webp" className="absolute inset-0 w-full h-full object-cover" alt="mockup 1" />
        <img ref={img2Ref} src="./home/mokups/402d13d169defc55bb84b20ebe64a8aa.webp" className="absolute inset-0 w-full h-full object-cover opacity-0" alt="mockup 2" />
        <img ref={img3Ref} src="./home/mokups/4d7374dd4098e3ec026bd17abb9d8793.webp" className="absolute inset-0 w-full h-full object-cover opacity-0" alt="mockup 3" />
        <video 
          ref={videoRef} 
          src="./home/mokups/Hero Banner.mp4" 
          className="absolute inset-0 w-full h-full object-cover opacity-0" 
          autoPlay 
          muted 
          loop 
          playsInline
        />
      </div>

      {/* Subtle Scroll Cue at Bottom */}
      <div 
        ref={scrollCueRef} 
        className="absolute bottom-8 z-30 flex flex-col items-center gap-2 pointer-events-none text-[9px] font-mono tracking-[0.4em] text-white/40 uppercase"
      >
        <span>SCROLL TO EXPLORE</span>
        <div className="w-px h-6 bg-gradient-to-b from-white/40 to-transparent animate-pulse" />
      </div>

    </section>
  );
}
