import { useEffect, useRef, useState } from 'react';
import CyberpunkCar from '../components/CyberpunkCar';
import CustomCursor from '../components/CustomCursor';
import PartCardCanvas from '../components/PartCardCanvas';
import SideMenu from '../components/SideMenu';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Link } from 'react-router-dom';
import Lenis from 'lenis';
import { useAudio } from '../context/AudioContext';

gsap.registerPlugin(ScrollTrigger);

const SPECS = [
  { label: 'Polygons', value: '842K' },
  { label: 'Render Engine', value: 'Cycles X' },
  { label: 'Textures', value: '4K PBR' },
  { label: 'Rigged', value: 'Yes' },
];

const SKILLS = ['MODELING', 'UV UNWRAPPING', 'PBR TEXTURING', 'LIGHTING', 'RENDERING', 'ANIMATION'];

const PARTS = [
  { id: '01', modelId: 'earphone', name: 'EARPHONE WIRELESS AUDIO', category: 'CONSUMER TECH', model: '/models/port/earphone.glb' },
  { id: '02', modelId: 'perfume_bottle', name: 'LUXURY PERFUME BOTTLE', category: 'COSMETICS DESIGN', model: '/models/port/perfume_bottle.glb' },
  { id: '03', modelId: 'ball_bearing', name: 'PRECISION BALL BEARING', category: 'INDUSTRIAL HARDWARE', model: '/models/port/ball_bearing.glb' },
  { id: '04', modelId: 'coffee_packaging', name: 'COFFEE PACKAGING PBR', category: 'PRODUCT DESIGN', model: '/models/port/coffee_packaging.glb' },
  { id: '05', modelId: 'keybord', name: 'CYBER KEYBOARD HARDWARE', category: 'HARDWARE MODEL', model: '/models/port/keybord.glb' },
  { id: '06', modelId: 'office_chair', name: 'OFFICE CHAIR ERGONOMIC', category: 'FURNITURE 3D', model: '/models/port/office_chair.glb' },
  { id: '07', modelId: 'tshirt', name: 'APPAREL T-SHIRT MODEL', category: 'CLOTHING RIG', model: '/models/port/tshirt.glb' },
];

export default function Preview3D() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { playHover, playClick } = useAudio();

  useEffect(() => {
    const lenis = new Lenis({ autoRaf: true, duration: 1.2 });
    lenis.on('scroll', ScrollTrigger.update);

    // Animate every element with data-animate attribute
    const items = document.querySelectorAll('[data-animate]');
    items.forEach((el) => {
      gsap.fromTo(el,
        { y: 60, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 1, ease: 'power3.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 88%',
            toggleActions: 'play none none reverse',
          }
        }
      );
    });

    // Stagger skill items
    gsap.fromTo('.skill-item',
      { x: -30, opacity: 0 },
      {
        x: 0, opacity: 1, duration: 0.6, stagger: 0.08, ease: 'power2.out',
        scrollTrigger: { trigger: '.skills-list', start: 'top 80%' }
      }
    );

    // Stagger spec cards
    gsap.fromTo('.spec-card',
      { y: 40, opacity: 0 },
      {
        y: 0, opacity: 1, duration: 0.7, stagger: 0.1, ease: 'power2.out',
        scrollTrigger: { trigger: '.specs-grid', start: 'top 82%' }
      }
    );

    // Horizontal scan line
    gsap.to('.scan-line', {
      x: '100vw', duration: 3, ease: 'none', repeat: -1, repeatDelay: 4,
    });

    // Out animation triggers — fade out Section 3 UI, nav bar & scan line seamlessly as horizontal parts section approaches
    gsap.to('.section-3-content', {
      opacity: 0,
      y: -80,
      scale: 0.95,
      scrollTrigger: {
        trigger: '.horizontal-parts-section',
        start: 'top 95%',
        end: 'top 30%',
        scrub: 0.8,
      }
    });

    gsap.to('.scan-line', {
      opacity: 0,
      scrollTrigger: {
        trigger: '.horizontal-parts-section',
        start: 'top 90%',
        end: 'top 40%',
        scrub: 0.8,
      }
    });

    // Horizontal scroll pinning & fast bottom-right one-by-one card entrance for cards 3-8
    const partsTrack = document.querySelector('.parts-track') as HTMLElement;
    if (partsTrack) {
      const getScrollAmount = () => partsTrack.scrollWidth - window.innerWidth;

      const horizontalTween = gsap.to(partsTrack, {
        x: () => -getScrollAmount(),
        ease: 'none',
        scrollTrigger: {
          trigger: '.horizontal-parts-section',
          start: 'top top',
          end: () => `+=${getScrollAmount() * 0.75}`,
          pin: true,
          scrub: 0.4,
          invalidateOnRefresh: true,
        }
      });

      // Cards 1 & 2 start visible; Cards 3 to 8 swoop in ONE BY ONE from bottom-right as you scroll further
      const cards = document.querySelectorAll('.parts-card-item');
      cards.forEach((card, index) => {
        if (index >= 2) {
          gsap.fromTo(card,
            {
              x: 240,       // Bottom-right X offset
              y: 200,       // Bottom-right Y offset
              opacity: 0,
              scale: 0.85,
              rotate: 4,
            },
            {
              x: 0,
              y: 0,
              opacity: 1,
              scale: 1,
              rotate: 0,
              ease: 'power3.out',
              scrollTrigger: {
                trigger: card,
                containerAnimation: horizontalTween,
                start: 'left 98%',    // starts at right edge of screen
                end: 'left 75%',      // finishes FAST at 25% from right edge!
                scrub: 0.3,           // snappy, fast response
              }
            }
          );
        }
      });
    }

    return () => {
      ScrollTrigger.getAll().forEach(t => t.kill());
      lenis.destroy();
    };
  }, []);

  return (
    <div ref={containerRef} className="preview-container bg-[#06060a] text-white font-['Inter_Tight',sans-serif] overflow-x-hidden">
      <CustomCursor />
      <CyberpunkCar />

      {/* Scan line effect */}
      <div className="scan-line fixed top-0 left-[-100vw] w-[2px] h-full z-20 pointer-events-none"
        style={{ background: 'linear-gradient(to bottom, transparent, rgba(255,153,0,0.3), transparent)' }} />

      {/* Hamburger Menu Button */}
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

      {/* ── SECTION 1 — HERO ─────────────────────────────────────────────── */}
      <section className="relative h-screen flex flex-col justify-center px-8 md:px-16 lg:px-24 pt-20">

        {/* Left vertical label */}
        <div className="absolute left-4 top-1/2 -translate-y-1/2 hidden lg:flex flex-col items-center gap-4">
          <div className="w-[1px] h-16 bg-gray-700" />
          <span className="text-[9px] tracking-[0.4em] text-gray-600 [writing-mode:vertical-rl] rotate-180">PORTFOLIO / 3D</span>
          <div className="w-[1px] h-16 bg-gray-700" />
        </div>

        <div className="max-w-3xl">
          <p data-animate className="opacity-0 text-[10px] md:text-xs tracking-[0.5em] text-orange-400 font-medium mb-6 uppercase">
            I Create
          </p>

          <div data-animate className="opacity-0">
            <div className="flex items-end flex-wrap leading-[0.85] mb-3">
              <span className="text-[clamp(80px,14vw,160px)] font-black uppercase tracking-tighter bg-gradient-to-b from-white to-gray-500 bg-clip-text text-transparent">
                3D
              </span>
              <span className="text-[clamp(80px,14vw,160px)] font-black uppercase tracking-tighter text-transparent ml-4"
                style={{ WebkitTextStroke: '1.5px rgba(255,255,255,0.25)' }}>
                Models
              </span>
            </div>
            <p className="text-[clamp(36px,5vw,64px)] font-extralight tracking-[0.2em] uppercase text-gray-400">
              IN <span className="font-black text-orange-400">BLENDER</span>
            </p>
          </div>

          <div data-animate className="opacity-0 flex items-center gap-6 mt-12">
            <div className="w-12 h-[1px] bg-orange-400/50" />
            <p className="text-[10px] tracking-[0.35em] text-gray-500 uppercase">
              Modeling &nbsp;/&nbsp; Texturing &nbsp;/&nbsp; Lighting
            </p>
          </div>
        </div>

        {/* Bottom hint */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3">
          <span className="text-[9px] tracking-[0.4em] text-gray-600">SCROLL</span>
          <div className="w-[1px] h-10 bg-gradient-to-b from-gray-600 to-transparent animate-pulse" />
        </div>

        {/* Corner bracket */}
        <div className="absolute top-24 right-8 hidden md:block">
          <div className="w-8 h-8 border-t border-r border-gray-700" />
        </div>
        <div className="absolute bottom-16 right-8 hidden md:block">
          <div className="w-8 h-8 border-b border-r border-gray-700" />
        </div>
      </section>

      {/* ── SECTION 2 — SPECS ────────────────────────────────────────────── */}
      <section className="relative h-screen flex flex-col justify-center px-8 md:px-16 lg:px-24">

        {/* Full-width thin divider */}
        <div data-animate className="opacity-0 w-full h-[1px] bg-gradient-to-r from-transparent via-gray-700 to-transparent mb-20" />

        <div className="flex flex-col md:flex-row justify-between items-start gap-16 w-full">

          {/* Left — heading */}
          <div className="max-w-xl">
            <p data-animate className="opacity-0 text-[10px] tracking-[0.5em] text-gray-500 mb-4 uppercase">
              Design &nbsp;/&nbsp; Model &nbsp;/&nbsp; Animate
            </p>
            <div data-animate className="opacity-0 leading-[0.85] mb-6">
              <span className="text-[clamp(60px,10vw,120px)] font-black uppercase tracking-tighter bg-gradient-to-b from-white to-gray-500 bg-clip-text text-transparent block">
                3D
              </span>
              <span className="text-[clamp(60px,10vw,120px)] font-black uppercase tracking-tighter text-transparent block"
                style={{ WebkitTextStroke: '1.5px rgba(255,255,255,0.25)' }}>
                Work
              </span>
            </div>
            <p data-animate className="opacity-0 text-xl md:text-2xl font-extralight tracking-widest uppercase text-gray-500">
              IN <span className="font-black text-orange-400">BLENDER</span>
            </p>
          </div>

          {/* Right — spec cards */}
          <div className="specs-grid grid grid-cols-2 gap-4 w-full max-w-sm">
            {SPECS.map(({ label, value }) => (
              <div key={label} onMouseEnter={playHover} className="spec-card opacity-0 border border-gray-800 bg-white/[0.02] backdrop-blur-sm p-5 hover:border-orange-400/40 transition-colors duration-500 group cursor-default">
                <p className="text-[9px] tracking-[0.4em] text-gray-600 uppercase mb-2 group-hover:text-orange-400/60 transition-colors">{label}</p>
                <p className="text-2xl font-black text-white tracking-tight">{value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Hover hint */}
        <div data-animate className="opacity-0 mt-16 flex items-center gap-4">
          <div className="w-8 h-8 rounded-full border border-gray-700 flex items-center justify-center">
            <div className="w-1.5 h-1.5 rounded-full bg-orange-400" />
          </div>
          <p className="text-[10px] tracking-[0.3em] text-gray-600 uppercase">Hover over model to reveal wireframe</p>
        </div>
      </section>

      {/* ── SECTION 3 — SKILLS + CTA ─────────────────────────────────────── */}
      <section className="section-3-content relative h-screen flex flex-col justify-center px-8 md:px-16 lg:px-24">

        <div className="flex flex-col md:flex-row items-start justify-between gap-16 w-full">

          {/* Left — heading */}
          <div className="max-w-lg">
            <p data-animate className="opacity-0 text-[10px] tracking-[0.5em] text-gray-500 mb-6 uppercase">From Ideas To</p>
            <div data-animate className="opacity-0 leading-[0.85] mb-4">
              <span className="text-[clamp(60px,10vw,130px)] font-black uppercase tracking-tighter bg-gradient-to-b from-white to-gray-500 bg-clip-text text-transparent block">
                3D
              </span>
              <span className="text-[clamp(60px,10vw,130px)] font-black uppercase tracking-tighter bg-gradient-to-br from-orange-300 to-orange-600 bg-clip-text text-transparent block">
                Reality
              </span>
            </div>
            <p data-animate className="opacity-0 text-lg md:text-xl font-extralight tracking-[0.2em] uppercase text-gray-500">
              BUILT IN <span className="font-black text-orange-400">BLENDER</span>
            </p>

            <div data-animate className="opacity-0 mt-10">
              <Link to="/"
                onMouseEnter={playHover}
                onClick={playClick}
                className="inline-flex items-center gap-4 border border-orange-400/40 hover:border-orange-400 px-8 py-4 text-[10px] tracking-[0.4em] uppercase text-gray-300 hover:text-white transition-all duration-500 hover:bg-orange-400/5 group">
                <span>View Full Portfolio</span>
                <span className="inline-block transition-transform duration-300 group-hover:translate-x-1">→</span>
              </Link>
            </div>
          </div>

          {/* Right — skills list */}
          <div className="skills-list w-full max-w-xs">
            <p className="text-[9px] tracking-[0.5em] text-gray-600 mb-8 uppercase">Capabilities</p>
            <div className="flex flex-col gap-0">
              {SKILLS.map((skill, i) => (
                <div key={skill} onMouseEnter={playHover} className="skill-item opacity-0 flex items-center justify-between py-4 border-b border-gray-800/60 hover:border-orange-400/30 transition-colors group cursor-default">
                  <div className="flex items-center gap-4">
                    <span className="text-[8px] text-gray-700 font-mono">0{i + 1}</span>
                    <span className="text-xs tracking-[0.25em] text-gray-400 group-hover:text-white transition-colors duration-300">{skill}</span>
                  </div>
                  <span className="text-gray-800 group-hover:text-orange-400 transition-colors duration-300 text-xs">→</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom watermark */}
        <div className="absolute bottom-8 right-8 hidden md:block">
          <p className="text-[9px] tracking-[0.5em] text-gray-800 uppercase">Bharat Portfolio / 2025</p>
        </div>
      </section>

      {/* ── SECTION 4 — HORIZONTAL PARTS GALLERY ───────────────────────── */}
      <section className="horizontal-parts-section relative min-h-screen bg-transparent overflow-hidden flex flex-col justify-center py-16">
        <div className="parts-entrance-wrapper w-full flex flex-col justify-between h-full px-8 md:px-16">
          
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 pb-6 border-b border-gray-800">
            <div>
              <p className="text-[10px] tracking-[0.5em] text-orange-400 uppercase font-mono mb-2">04 / COMPONENT ARCHIVE</p>
              <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-white">
                VEHICLE <span className="text-transparent" style={{ WebkitTextStroke: '1.5px white' }}>PARTS</span>
              </h2>
            </div>
            <p className="text-[10px] tracking-[0.3em] text-gray-500 uppercase mt-4 md:mt-0 font-mono">
              [ SCROLL DOWN TO EXPLORE GALLERY → ]
            </p>
          </div>

          {/* Horizontal Track Container */}
          <div className="overflow-hidden w-full">
            <div className="parts-track flex gap-8 md:gap-14 w-max py-4 pl-[35vw] md:pl-[61vw] pr-[25vw]">
              {PARTS.map((part) => (
                <a
                  key={part.id}
                  href={`/3d.html?model=${part.modelId}`}
                  onMouseEnter={playHover}
                  onClick={playClick}
                  className="parts-card-item w-[82vw] md:w-[28vw] h-[68vh] flex-shrink-0 bg-[#0a0a12] border-2 border-white flex flex-col group transition-all duration-300 hover:shadow-[0_0_35px_rgba(255,255,255,0.35)] relative no-underline cursor-pointer block"
                >
                  {/* 3D Model Canvas Viewport (78% height) */}
                  <div className="h-[78%] w-full relative overflow-hidden bg-[#06060c]">
                    <PartCardCanvas modelPath={part.model} />
                  </div>

                  {/* Name & category underneath with white outline boundary (compact 22% height) */}
                  <div className="h-[22%] px-5 py-3 border-t-2 border-white bg-[#06060c] flex flex-col justify-between">
                    <div>
                      <span className="text-[9px] tracking-[0.3em] text-gray-400 uppercase font-mono block">
                        {part.category}
                      </span>
                      <h3 className="text-sm md:text-base font-black tracking-wide text-white uppercase group-hover:text-orange-400 transition-colors truncate">
                        {part.name}
                      </h3>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-gray-800/80 text-[9px] text-gray-500 font-mono">
                      <span>3D MODEL MESH</span>
                      <span className="text-orange-400/90 group-hover:text-orange-400 font-bold">INSPECT →</span>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
