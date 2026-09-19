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

  const onCompleteRef = useRef(onComplete);
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    let tl: gsap.core.Timeline;

    // Dynamically calculate the exact center of the gap between I and AM
    const animationFrameId = requestAnimationFrame(() => {
      if (gapRef.current && imageContainerRef.current && containerRef.current) {
        tl = gsap.timeline({
          onComplete: () => {
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
          scale: 0.8, 
          opacity: 0 
        });

        tl.set(img2Ref.current, { opacity: 0 });
        tl.set(img3Ref.current, { opacity: 0 });
        tl.set(videoRef.current, { opacity: 0 });

        // Stay stable for 0.75 seconds
        tl.add("split", "+=0.75");

        // I moves left, AM moves right just a little bit
        tl.to(iTextRef.current, { x: '-10vw', duration: 0.8, ease: 'power4.inOut' }, "split")
          .to(amTextRef.current, { x: '10vw', duration: 0.8, ease: 'power4.inOut' }, "split");

        // Image reveal happens EXACTLY between I and AM
        tl.to(imageContainerRef.current, { scale: 1, opacity: 1, duration: 0.8, ease: 'power4.out' }, "split+=0.1")
          // Image changes 2 times
          .to(img1Ref.current, { opacity: 0, duration: 0.15 }, "+=0.4")
          .to(img2Ref.current, { opacity: 1, duration: 0.15 }, "<")
          .to(img2Ref.current, { opacity: 0, duration: 0.15 }, "+=0.4")
          .to(img3Ref.current, { opacity: 1, duration: 0.15 }, "<")
          // Finally change to video
          .to(img3Ref.current, { opacity: 0, duration: 0.15 }, "+=0.4")
          .to(videoRef.current, { opacity: 1, duration: 0.15 }, "<");

        tl.add("outro", "+=0.3");

        // Text goes completely out of frame (up and down)
        tl.to([iTextRef.current, amTextRef.current], { y: '-100vh', opacity: 0, duration: 0.8, ease: 'power3.inOut' }, "outro")
          .to(bottomTextRef.current, { y: '100vh', opacity: 0, duration: 0.8, ease: 'power3.inOut' }, "outro+=0.1");

        // Image expands perfectly to fullscreen
        tl.to(imageContainerRef.current, {
          width: '100vw',
          height: '100vh',
          left: '50vw', // absolute 50vw matches center of screen
          top: '50vh',
          xPercent: -50,
          yPercent: -50,
          borderRadius: '0px',
          duration: 1.2,
          ease: 'power3.inOut'
        }, "outro+=0.2");

        // Pull the gallery up slightly when the image gets full size, creating a 23vh black bar
        tl.to('#black-panel', { marginTop: '-23vh', duration: 0.5, ease: 'power2.out' }, ">");
        // Fade in the sticky header exactly simultaneously so it appears inside the black bar
        tl.to('#sticky-header', { opacity: 1, duration: 0.5, ease: 'power2.out' }, "<");
      }
    });

    return () => {
      cancelAnimationFrame(animationFrameId);
      if (tl) tl.kill();
    };
  }, []);

  return (
    <section ref={containerRef} className="h-screen w-full relative bg-[#111111] overflow-hidden flex flex-col items-center justify-center">
      
      {/* Centered Split Text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-20">
        <div className="h-[12vw] sm:h-[15vw] flex items-center justify-center gap-6 sm:gap-10 w-full relative">
          <span ref={iTextRef} className="text-[#f4f4f4] text-[13vw] sm:text-[15vw] leading-[0.8] font-black uppercase tracking-tighter will-change-transform inline-block">
            I
          </span>
          {/* This empty div defines the exact center of the gap */}
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

      {/* Flashing Images Container (Initially absolute) */}
      <div 
        ref={imageContainerRef} 
        className="absolute z-10 w-[180px] h-[200px] sm:w-[240px] sm:h-[260px] rounded-md overflow-hidden will-change-transform"
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

    </section>
  );
}
