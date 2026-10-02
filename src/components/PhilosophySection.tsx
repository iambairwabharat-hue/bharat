import { forwardRef, useImperativeHandle, useRef } from 'react';
import { PROJECT_ITEMS } from './GallerySection';

export interface PhilosophySectionRefs {
  container: HTMLDivElement | null;
  textRef: HTMLDivElement | null;
  imageRef: HTMLImageElement | null;
}

const PhilosophySection = forwardRef<PhilosophySectionRefs>((_, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  useImperativeHandle(ref, () => ({
    get container() { return containerRef.current; },
    get textRef() { return textRef.current; },
    get imageRef() { return imageRef.current; }
  }));

  const bgImage = PROJECT_ITEMS[PROJECT_ITEMS.length - 1].src;

  return (
    <div 
      ref={containerRef} 
      className="fixed inset-0 pointer-events-none z-15 flex flex-col items-center justify-center overflow-hidden opacity-0"
    >
      <img 
        ref={imageRef}
        src={bgImage} 
        alt="Philosophy Background" 
        className="absolute w-[60vw] max-w-[600px] h-[80vh] object-cover mix-blend-multiply opacity-50"
        style={{ transform: 'scale(1.5)' }}
      />
      
      <div 
        ref={textRef}
        className="text-black font-['Inter_Tight'] font-bold text-[120px] lg:text-[200px] whitespace-nowrap uppercase tracking-tighter mix-blend-exclusion"
        style={{ transform: 'translateX(100vw)' }}
      >
        NOT JUST CLOTHING. A ARCHIVE FOR THE FUTURE.
      </div>
    </div>
  );
});

PhilosophySection.displayName = 'PhilosophySection';

export default PhilosophySection;
