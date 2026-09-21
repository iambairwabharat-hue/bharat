import { useEffect, useRef, useState, useLayoutEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import CustomCursor from '../components/CustomCursor';
import HeroSection from '../components/HeroSection';
import GallerySection from '../components/GallerySection';
import StickyHeader from '../components/StickyHeader';
import SideMenu from '../components/SideMenu';
import type { StickyHeaderRef } from '../components/StickyHeader';
import { useAudio } from '../context/AudioContext';
import { useLenis } from '../context/LenisContext';

gsap.registerPlugin(ScrollTrigger);

export default function Home() {
  const { playHover, playClick } = useAudio();
  const { stop, start } = useLenis();
  const scrollSpacerRef = useRef<HTMLDivElement>(null);
  const blackPanelRef = useRef<HTMLDivElement>(null);
  const galleryInnerRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const stickyHeaderRef = useRef<StickyHeaderRef>(null);
  const isAnimationDoneRef = useRef(false);

  const [cols, setCols] = useState(3);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Lock scroll on mount until hero animation finishes
  useEffect(() => {
    window.scrollTo(0, 0);
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    stop();

    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
      start();
    };
  }, [stop, start]);

  const handleHeroComplete = () => {
    isAnimationDoneRef.current = true;
    document.body.style.overflow = '';
    document.documentElement.style.overflow = '';
    start();
  };

  // Responsive columns
  useLayoutEffect(() => {
    const updateCols = () => {
      const w = window.innerWidth;
      if (w < 768) setCols(1); // Single column on mobile
      else if (w < 1100) setCols(2); // 2 columns on tablet
      else setCols(3); // 3 columns on desktop
    };
    updateCols();
    window.addEventListener('resize', updateCols);
    return () => window.removeEventListener('resize', updateCols);
  }, []);

  useLayoutEffect(() => {
    if (!isAnimationDoneRef.current) {
      stop();
    } else {
      start();
    }

    let rafId: number;
    let vh = window.innerHeight;
    
    // Initial dynamic spacer height
    const calculateHeight = () => {
      vh = window.innerHeight;
      if (galleryInnerRef.current && scrollSpacerRef.current) {
        const wrapHeight = galleryInnerRef.current.getBoundingClientRect().height;
        const maxScroll = Math.max(0, wrapHeight - vh);
        scrollSpacerRef.current.style.height = `${vh + maxScroll}px`;
      }
    };
    
    setTimeout(calculateHeight, 100);
    window.addEventListener('resize', calculateHeight);

    // GSAP ScrollTrigger for black panel
    const st = ScrollTrigger.create({
      trigger: scrollSpacerRef.current,
      start: "top top",
      end: () => `+=${vh}`,
      scrub: true,
      animation: gsap.fromTo(
        blackPanelRef.current,
        { y: vh },
        { y: 0, ease: "none" }
      )
    });

    // RAF for Gallery Cards
    const updateGallery = () => {
      const scrollY = window.scrollY;
      vh = window.innerHeight;
      
      const wrapHeight = galleryInnerRef.current ? galleryInnerRef.current.getBoundingClientRect().height : vh;
      const maxScroll = Math.max(0, wrapHeight - vh);

      // Update sticky header progress immediately as user scrolls
      // We map the 6.5s timeline to 5vh of scrolling distance
      const stickyScrollDistance = vh * 5;
      const progress = Math.max(0, Math.min(1, scrollY / stickyScrollDistance));
      stickyHeaderRef.current?.setProgress(progress);

      // Main video visibility
      const mainCanvas = document.getElementById('main-canvas');
      if (mainCanvas) {
        if (scrollY > vh) {
          mainCanvas.style.visibility = 'hidden';
        } else {
          mainCanvas.style.visibility = 'visible';
        }
      }

      // Phase 2: Inner wrapper translate
      if (galleryInnerRef.current) {
        if (scrollY > vh) {
          // Translate up
          const translate = Math.min(maxScroll, scrollY - vh);
          galleryInnerRef.current.style.transform = `translateY(-${translate}px)`;
        } else {
          galleryInnerRef.current.style.transform = `translateY(0px)`;
        }
      }

      // Card scaling
      if (scrollY > vh * 0.5 && scrollY < vh + maxScroll + vh) {
        cardRefs.current.forEach((card) => {
          if (!card) return;
          const rect = card.getBoundingClientRect();
          const top = rect.top;
          const bottom = rect.bottom;
          
          let scale = 0;
          if (bottom > 0 && top < vh) {
            const enter = Math.min(1, (vh - top) / (vh * 0.6));
            const exit = Math.min(1, bottom / (vh * 0.4));
            scale = Math.min(enter, exit);
          }
          
          card.style.transform = `scale(${scale})`;
        });
      }

      rafId = requestAnimationFrame(updateGallery);
    };

    rafId = requestAnimationFrame(updateGallery);

    return () => {
      window.removeEventListener('resize', calculateHeight);
      cancelAnimationFrame(rafId);
      st.kill();
    };
  }, [cols, stop, start]); // Re-run if cols changes since layout height changes

  return (
    <div id="scroll-spacer" ref={scrollSpacerRef} className="relative select-none bg-white min-h-[100vh]">
      <CustomCursor />
      
      {/* Menu Button */}
      <button 
        onClick={() => {
          playClick();
          setIsMenuOpen(true);
        }}
        onMouseEnter={playHover}
        className={`fixed top-8 right-8 z-[80] mix-blend-difference text-white flex flex-col items-end justify-center gap-2 w-10 h-10 group hover:opacity-70 transition-opacity duration-300 ${isMenuOpen ? 'hidden' : 'flex'}`}
      >
        <div className="w-8 h-[2px] bg-white group-hover:w-10 transition-all duration-300"></div>
        <div className="w-6 h-[2px] bg-white group-hover:w-8 transition-all duration-300"></div>
      </button>

      <SideMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />

      <HeroSection onComplete={handleHeroComplete} />

      <StickyHeader ref={stickyHeaderRef} />
      
      <div 
        id="black-panel"
        ref={blackPanelRef} 
        className="fixed inset-0 bg-black z-10 translate-y-[100vh] will-change-transform"
      >
        <GallerySection ref={galleryInnerRef} cols={cols} cardRefs={cardRefs} />
      </div>
    </div>
  );
}
