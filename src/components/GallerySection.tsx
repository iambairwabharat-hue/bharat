import { forwardRef, Fragment } from 'react';
import ProductCard from './ProductCard';
import AboutSection from './AboutSection';
import ExperienceSection from './ExperienceSection';

export const PROJECT_ITEMS = [
  { id: "01", src: encodeURI("./home/mokups/11788a376563433844eea8179b784f74.webp"), title: "UTOPIA CREATIVE", category: "BRAND EXPERIENCE", year: "2026", aspect: "aspect-[4/5]", span: "col-span-1" },
  { id: "02", src: encodeURI("./home/mokups/402d13d169defc55bb84b20ebe64a8aa.webp"), title: "NEO SYSTEM", category: "WEB APPLICATION", year: "2026", aspect: "aspect-[4/5]", span: "col-span-1", emptyBefore: true },
  { id: "03", src: encodeURI("./home/mokups/4d7374dd4098e3ec026bd17abb9d8793.webp"), title: "AURA STUDIO", category: "DIGITAL IDENTITY", year: "2025", aspect: "aspect-video", span: "col-span-1 lg:col-span-2" },
  { id: "04", src: encodeURI("./home/mokups/5f267dfce59a11da85d2f9f588e54a96.webp"), title: "MONOCHROME ESSENCE", category: "E-COMMERCE", year: "2025", aspect: "aspect-[4/5]", span: "col-span-1" },
  { id: "05", src: encodeURI("./home/mokups/753fcafd8f110b50f4a7fc763e45b20a.webp"), title: "KINETIC ARCHIVE", category: "INTERACTIVE UI", year: "2026", aspect: "aspect-[2/3]", span: "col-span-1" },
  { id: "06", src: encodeURI("./home/mokups/b5a40ef7a2e31eccb0474d0f76227d89.webp"), title: "SYNTHESIS LAB", category: "3D EXPERIMENT", year: "2026", aspect: "aspect-video", span: "col-span-1 lg:col-span-2" },
  { id: "07", src: encodeURI("./home/mokups/b826b3aebdba9b537e7b4234906e0e8f.webp"), title: "CHRONO INTERFACE", category: "SYSTEM DESIGN", year: "2025", aspect: "aspect-[4/5]", span: "col-span-1" },
  { id: "08", src: encodeURI("./home/mokups/Change_logos_and_card_color_202607221203.webp"), title: "ORBIT BRANDING", category: "LOGOTYPE & DESIGN", year: "2026", aspect: "aspect-square", span: "col-span-1", emptyBefore: true },
  { id: "09", src: encodeURI("./home/mokups/image 43.webp"), title: "ECHO PORTFOLIO", category: "EDITORIAL DIRECTION", year: "2025", aspect: "aspect-[2/3]", span: "col-span-1" },
  { id: "10", src: encodeURI("./home/mokups/imageye___-_imgi_27_671208268_17869435935656926_1440188570236619620_n 1.webp"), title: "VECTORS & VISION", category: "VISUAL IDENTITY", year: "2026", aspect: "aspect-[4/5]", span: "col-span-1" },
  { id: "11", src: encodeURI("./home/mokups/imageye___-_imgi_99_624471918_17866948488555877_7674327359312499958_n 1.webp"), title: "STRUCTURE XI", category: "WEB PLATFORM", year: "2026", aspect: "aspect-[4/5]", span: "col-span-1" },
  { id: "12", src: encodeURI("./home/mokups/mayur bag 1 1.webp"), title: "MAYUR CRAFT", category: "PRODUCT PACKAGING", year: "2025", aspect: "aspect-[4/5]", span: "col-span-1" },
  { id: "13", src: encodeURI("./home/mokups/Overlay.webp"), title: "GRID PARADIGM", category: "UI ARCHITECTURE", year: "2026", aspect: "aspect-[3/4]", span: "col-span-1", emptyBefore: true },
  { id: "14", src: encodeURI("./home/mokups/Secondary_ Shirt Tag Detail (1).webp"), title: "APPAREL IDENTITY I", category: "TACTILE BRANDING", year: "2025", aspect: "aspect-square", span: "col-span-1" },
  { id: "15", src: encodeURI("./home/mokups/Secondary_ Shirt Tag Detail.webp"), title: "APPAREL IDENTITY II", category: "PACKAGING & TAGS", year: "2025", aspect: "aspect-square", span: "col-span-1" },
  { id: "16", src: encodeURI("./home/mokups/Thumbnail 10.webp"), title: "MOTION GRAPHICS", category: "CINEMATIC SHOWCASE", year: "2026", aspect: "aspect-video", span: "col-span-1 lg:col-span-2" },
  { id: "17", src: encodeURI("./home/mokups/WhatsApp Image 2026-07-08 at 11.35.47 AM 1.webp"), title: "CREATIVE STUDIO", category: "WORDPRESS / SHOPIFY", year: "2026", aspect: "aspect-[4/5]", span: "col-span-1" },
  { id: "18", src: encodeURI("./home/mokups/WhatsApp Image 2026-07-08 at 11.36.28 AM 1.webp"), title: "DIGITAL FRONTIER", category: "AI INTEGRATION", year: "2026", aspect: "aspect-[4/5]", span: "col-span-1" },
  { id: "19", src: encodeURI("./home/mokups/WhatsApp Image 2026-07-08 at 11.36.29 AM 1.webp"), title: "FUTURE SYSTEMS", category: "CUSTOM FRONTEND", year: "2026", aspect: "aspect-[4/5]", span: "col-span-1" }
];

interface GallerySectionProps {
  cols: number;
  cardRefs: React.MutableRefObject<(HTMLDivElement | null)[]>;
}

const GallerySection = forwardRef<HTMLDivElement, GallerySectionProps>(
  ({ cols, cardRefs }, ref) => {
    return (
      <div 
        id="gallery-inner-wrapper"
        ref={ref}
        className="w-full relative flex flex-col items-center pt-[25vh] overflow-hidden" 
      >
        <div 
          className="grid w-full gap-x-6 gap-y-20 lg:gap-x-12 lg:gap-y-36 px-6 lg:px-12 pb-36 grid-flow-row-dense"
          style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
        >
          {PROJECT_ITEMS.map((item, i) => (
            <Fragment key={`frag-${item.id}`}>
              {item.emptyBefore && cols === 3 && (
                <div className="col-span-1 hidden lg:block aspect-[4/5]" />
              )}
              
              <ProductCard 
                ref={(el) => { cardRefs.current[i] = el; }}
                src={item.src}
                id={item.id}
                title={item.title}
                category={item.category}
                year={item.year}
                className={`${item.span} ${item.aspect}`}
                style={{ transformOrigin: 'center bottom' }}
              />
            </Fragment>
          ))}
        </div>

        {/* About & Experience sections after the gallery */}
        <AboutSection />
        <ExperienceSection />
      </div>
    );
  }
);

GallerySection.displayName = 'GallerySection';

export default GallerySection;
