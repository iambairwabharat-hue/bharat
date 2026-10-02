import { useEffect, useRef } from 'react';
import { PROJECT_ITEMS } from './GallerySection';

const lerp = (start: number, end: number, t: number) => {
  return start * (1 - t) + end * t;
};

export default function PortfolioSection() {
  const carouselRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    let rafId: number;
    let rotation = 0;
    let lastScrollY = window.scrollY;
    let currentPull = 0;
    
    const tick = () => {
      const scrollY = window.scrollY;
      const velocity = scrollY - lastScrollY;
      
      const targetPull = Math.max(-30, Math.min(30, velocity * 0.15));
      currentPull = lerp(currentPull, targetPull, 0.1);
      rotation += (velocity * 0.2) + 0.05;
      
      if (carouselRef.current) {
        carouselRef.current.style.transform = `translateZ(-800px) rotateY(${rotation}deg) skewX(${currentPull}deg)`;
      }
      
      lastScrollY = scrollY;
      rafId = requestAnimationFrame(tick);
    };
    
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, []);

  const items = PROJECT_ITEMS.map((item: { src: string }) => item.src).slice(0, 8);
  const angleStep = 360 / items.length;
  const radius = (300 / 2) / Math.tan(Math.PI / items.length) + 100;

  return (
    <div className="relative w-full h-[200vh] bg-[#f5f5f5] z-10">
      <div className="sticky top-0 h-screen w-full overflow-hidden flex items-center justify-center" style={{ perspective: '1200px' }}>
        
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-10 mix-blend-difference">
          <h2 className="text-white font-['Inter_Tight'] font-bold text-6xl md:text-8xl tracking-tighter uppercase text-center">
            Portfolio
          </h2>
        </div>

        <div 
          ref={carouselRef}
          className="relative w-[300px] h-[450px]"
          style={{ transformStyle: 'preserve-3d' }}
        >
          {items.map((src: string, i: number) => {
            const angle = i * angleStep;
            return (
              <div 
                key={i}
                className="absolute inset-0 w-full h-full"
                style={{
                  transform: `rotateY(${angle}deg) translateZ(${radius}px)`,
                  transformStyle: 'preserve-3d'
                }}
              >
                <img 
                  src={src} 
                  alt="Portfolio item"
                  className="w-full h-full object-cover shadow-2xl"
                  style={{ backfaceVisibility: 'hidden' }}
                  draggable={false}
                />
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}
