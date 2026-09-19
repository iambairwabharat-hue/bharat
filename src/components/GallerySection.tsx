import { forwardRef, useMemo, Fragment } from 'react';
import ProductCard from './ProductCard';

export const GALLERY_IMAGES = [
  { src: encodeURI("./home/mokups/11788a376563433844eea8179b784f74.webp"), aspect: "aspect-[4/5]", span: 1 },
  { src: encodeURI("./home/mokups/402d13d169defc55bb84b20ebe64a8aa.webp"), aspect: "aspect-[4/5]", span: 1 },
  { src: encodeURI("./home/mokups/4d7374dd4098e3ec026bd17abb9d8793.webp"), aspect: "aspect-[4/5]", span: 1 },
  { src: encodeURI("./home/mokups/5f267dfce59a11da85d2f9f588e54a96.webp"), aspect: "aspect-[4/5]", span: 1 },
  { src: encodeURI("./home/mokups/753fcafd8f110b50f4a7fc763e45b20a.webp"), aspect: "aspect-[2/3]", span: 1 },
  { src: encodeURI("./home/mokups/b5a40ef7a2e31eccb0474d0f76227d89.webp"), aspect: "aspect-video", span: 1 },
  { src: encodeURI("./home/mokups/b826b3aebdba9b537e7b4234906e0e8f.webp"), aspect: "aspect-[4/5]", span: 1 },
  { src: encodeURI("./home/mokups/Change_logos_and_card_color_202607221203.webp"), aspect: "aspect-square", span: 1 },
  { src: encodeURI("./home/mokups/image 43.webp"), aspect: "aspect-[2/3]", span: 1 },
  { src: encodeURI("./home/mokups/imageye___-_imgi_27_671208268_17869435935656926_1440188570236619620_n 1.webp"), aspect: "aspect-[4/5]", span: 1 },
  { src: encodeURI("./home/mokups/imageye___-_imgi_99_624471918_17866948488555877_7674327359312499958_n 1.webp"), aspect: "aspect-[4/5]", span: 1 },
  { src: encodeURI("./home/mokups/mayur bag 1 1.webp"), aspect: "aspect-[4/5]", span: 1 },
  { src: encodeURI("./home/mokups/Overlay.webp"), aspect: "aspect-[3/4]", span: 1 },
  { src: encodeURI("./home/mokups/Secondary_ Shirt Tag Detail (1).webp"), aspect: "aspect-square", span: 1 },
  { src: encodeURI("./home/mokups/Secondary_ Shirt Tag Detail.webp"), aspect: "aspect-square", span: 1 },
  { src: encodeURI("./home/mokups/Thumbnail 10.webp"), aspect: "aspect-video", span: 1 },
  { src: encodeURI("./home/mokups/WhatsApp Image 2026-07-08 at 11.35.47 AM 1.webp"), aspect: "aspect-[4/5]", span: 1 },
  { src: encodeURI("./home/mokups/WhatsApp Image 2026-07-08 at 11.36.28 AM 1.webp"), aspect: "aspect-[4/5]", span: 1 },
  { src: encodeURI("./home/mokups/WhatsApp Image 2026-07-08 at 11.36.29 AM 1.webp"), aspect: "aspect-[4/5]", span: 1 }
];

interface GallerySectionProps {
  cols: number;
  cardRefs: React.MutableRefObject<(HTMLDivElement | null)[]>;
}

const GallerySection = forwardRef<HTMLDivElement, GallerySectionProps>(
  ({ cols, cardRefs }, ref) => {
    
    // Generate layout once so it doesn't reshuffle on resize
    const layout = useMemo(() => {
      // 15 images (not 30, less scrolly)
      const images = [...GALLERY_IMAGES];
      images.sort(() => Math.random() - 0.5);

      return images.map((itemData, i) => {
        let spanClass = `col-span-${itemData.span}`;
        if (itemData.span > 1) {
          spanClass += " lg:col-span-3"; // Keep large items wider on desktop
        }
        
        return {
          img: itemData.src,
          index: i,
          spanClass,
          aspectClass: itemData.aspect,
          emptyBefore: Math.random() > 0.7
        };
      });
    }, []);

    return (
      <div 
        id="gallery-inner-wrapper"
        ref={ref}
        className="w-full relative flex flex-col items-center" 
        style={{ paddingTop: '23vh' }}
      >
        
        <div 
          className="grid w-full gap-x-4 gap-y-16 lg:gap-x-8 lg:gap-y-32 px-4 lg:px-8 pb-[100vh] grid-flow-row-dense"

          style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
        >
          {layout.map((item, i) => (
            <Fragment key={`frag-${i}`}>
              {item.emptyBefore && <div className="col-span-1 hidden lg:block aspect-[2/3]" />}
              
              <ProductCard 
                ref={(el) => { cardRefs.current[item.index] = el; }}
                src={item.img}
                className={`${item.spanClass} ${item.aspectClass} ${
                  item.emptyBefore ? 'lg:col-start-2 xl:col-start-auto' : ''
                }`}
                style={{ transformOrigin: 'center bottom' }}
              />
            </Fragment>
          ))}
        </div>
      </div>
    );
  }
);

GallerySection.displayName = 'GallerySection';

export default GallerySection;
