import { useEffect, useRef, useState, useLayoutEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import CustomCursor from '../components/CustomCursor';
import HeroSection from '../components/HeroSection';
import GallerySection from '../components/GallerySection';
import StickyHeader from '../components/StickyHeader';
import SideMenu from '../components/SideMenu';
import AudioController from '../components/AudioController';
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
  const stickyVisibleRef = useRef(false);

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
    stickyVisibleRef.current = true;
    stickyHeaderRef.current?.setVisible(true);
  };

  // Responsive columns
  useLayoutEffect(() => {
    const updateCols = () => {
      const w = window.innerWidth;
      if (w < 768) setCols(1);
      else if (w < 1100) setCols(2);
      else setCols(3);
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
    
    const getContentHeight = () => {
      if (!galleryInnerRef.current) return window.innerHeight;
      return Math.max(
        galleryInnerRef.current.scrollHeight,
        galleryInnerRef.current.offsetHeight,
        Math.round(galleryInnerRef.current.getBoundingClientRect().height)
      );
    };

    // Initial dynamic spacer height
    const calculateHeight = () => {
      vh = window.innerHeight;
      if (galleryInnerRef.current && scrollSpacerRef.current) {
        const wrapHeight = getContentHeight();
        const maxScroll = Math.max(0, wrapHeight - vh + 160);
        scrollSpacerRef.current.style.height = `${vh + maxScroll}px`;
      }
    };

    let resizeObs: ResizeObserver | null = null;
    if (galleryInnerRef.current) {
      resizeObs = new ResizeObserver(calculateHeight);
      resizeObs.observe(galleryInnerRef.current);
    }

    setTimeout(calculateHeight, 100);
    setTimeout(calculateHeight, 400);
    setTimeout(calculateHeight, 1000);
    setTimeout(calculateHeight, 2000);
    window.addEventListener('resize', calculateHeight);
    window.addEventListener('load', calculateHeight);

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

    // RAF for Gallery Cards & Sticky Header
    const updateGallery = () => {
      const scrollY = window.scrollY;
      vh = window.innerHeight;
      
      const wrapHeight = getContentHeight();
      const maxScroll = Math.max(0, wrapHeight - vh + 160);

      const stickyScrollDistance = vh * 5;
      const progress = Math.max(0, Math.min(1, scrollY / stickyScrollDistance));
      stickyHeaderRef.current?.setProgress(progress);

      const mainCanvas = document.getElementById('main-canvas');
      if (mainCanvas) {
        mainCanvas.style.visibility = scrollY > vh ? 'hidden' : 'visible';
      }

      if (galleryInnerRef.current) {
        if (scrollY > vh) {
          const translate = Math.min(maxScroll, scrollY - vh);
          galleryInnerRef.current.style.transform = `translateY(-${translate}px)`;
        } else {
          galleryInnerRef.current.style.transform = `translateY(0px)`;
        }
      }

      if (galleryInnerRef.current) {
        const aboutEl = galleryInnerRef.current.querySelector('.about-section-start') as HTMLElement | null;
        if (aboutEl) {
          const rect = aboutEl.getBoundingClientRect();
          const inGallery = rect.top > 60 && scrollY > vh * 0.5;
          if (inGallery !== stickyVisibleRef.current) {
            stickyVisibleRef.current = inGallery;
            stickyHeaderRef.current?.setVisible(inGallery);
          }
        }
      }

      // Dynamic card scroll scaling animation (safely clamped so cards never collapse to 0)
      cardRefs.current.forEach((card) => {
        if (!card) return;

        const rect = card.getBoundingClientRect();
        const top = rect.top;
        const bottom = rect.bottom;

        if (bottom > -50 && top < vh + 50) {
          const enter = Math.min(1, Math.max(0.7, (vh - top) / (vh * 0.45)));
          const exit = Math.min(1, Math.max(0.7, bottom / (vh * 0.35)));
          const scale = Math.min(enter, exit);
          const opacity = Math.min(1, Math.max(0.4, (scale - 0.7) / 0.3 * 1.2));

          card.style.transform = `scale(${scale})`;
          card.style.opacity = `${opacity}`;
        } else {
          card.style.transform = 'scale(0.85)';
          card.style.opacity = '0.5';
        }
      });

      if (blackPanelRef.current) {
        blackPanelRef.current.style.visibility = scrollY < 20 ? 'hidden' : 'visible';
      }

      rafId = requestAnimationFrame(updateGallery);
    };

    rafId = requestAnimationFrame(updateGallery);

    return () => {
      window.removeEventListener('resize', calculateHeight);
      cancelAnimationFrame(rafId);
      resizeObs?.disconnect();
      st.kill();
    };
  }, [cols, stop, start]);

  return (
    <div id="scroll-spacer" ref={scrollSpacerRef} className="relative select-none bg-[#06060a] min-h-[100vh] overflow-x-hidden">
      <CustomCursor />
      
      {/* Audio Toggle */}
      <AudioController />

      {/* Menu Button */}
      <button 
        onClick={() => {
          playClick();
          setIsMenuOpen(true);
        }}
        onMouseEnter={playHover}
        data-cursor="MENU"
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
        className="fixed inset-0 bg-[#06060a] z-10 translate-y-[100vh] will-change-transform overflow-hidden"
      >
        <GallerySection ref={galleryInnerRef} cols={cols} cardRefs={cardRefs} />
      </div>
    </div>
  );
}
