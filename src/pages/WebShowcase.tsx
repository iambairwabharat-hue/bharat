import { useState, useEffect, useRef, useMemo } from "react";
import { WEB_PROJECTS, type WebProject } from "../data/webProjectsData";
import Navigation from "../components/web-showcase/Navigation";
import ProfileModal from "../components/web-showcase/ProfileModal";
import NewsletterModal from "../components/web-showcase/NewsletterModal";
import ProjectModal from "../components/web-showcase/ProjectModal";
import ThreeCanvas from "../components/web-showcase/ThreeCanvas";
import CustomCursor from "../components/CustomCursor";
import SideMenu from "../components/SideMenu";
import { useAudio } from "../context/AudioContext";
import { ArrowUpRight } from "lucide-react";

export default function WebShowcase() {
  const { playHover, playClick } = useAudio();
  const [activeView, setActiveView] = useState("featured");
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNewsletterOpen, setIsNewsletterOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<WebProject | null>(null);
  const [hoveredSlug, setHoveredSlug] = useState<string | null>(null);

  // Repeat the 8 projects 3 times for a seamless infinite strip
  const repeatedProjects = useMemo(() => {
    return [
      ...WEB_PROJECTS.map((p, i) => ({ ...p, uniqueId: `set0-${i}-${p.slug}`, originalIndex: i })),
      ...WEB_PROJECTS.map((p, i) => ({ ...p, uniqueId: `set1-${i}-${p.slug}`, originalIndex: i })),
      ...WEB_PROJECTS.map((p, i) => ({ ...p, uniqueId: `set2-${i}-${p.slug}`, originalIndex: i })),
    ];
  }, []);

  const trackRef = useRef<HTMLDivElement>(null);
  const velocityRef = useRef(0);
  const singleWidthRef = useRef(0);

  // Physics state
  const scrollRef = useRef({
    current: 0,
    target: 0,
    velocity: 0,
    isDragging: false,
    dragStartX: 0,
    dragStartY: 0,
    lastX: 0,
    lastY: 0,
    dragStartTime: 0,
    dragDelta: 0,
  });

  // Measure one full loop width (8 cards + gaps)
  useEffect(() => {
    const measure = () => {
      if (!trackRef.current) return;
      const children = Array.from(trackRef.current.children) as HTMLElement[];
      if (children.length >= 16) {
        const firstCardSet1 = children[8];
        const firstCardSet2 = children[16];
        if (firstCardSet1 && firstCardSet2) {
          const w = firstCardSet2.offsetLeft - firstCardSet1.offsetLeft;
          if (w > 0) {
            singleWidthRef.current = w;
            if (scrollRef.current.current === 0) {
              const initialOffset = firstCardSet1.offsetLeft - (window.innerWidth - firstCardSet1.offsetWidth) / 2;
              scrollRef.current.current = initialOffset;
              scrollRef.current.target = initialOffset;
            }
          }
        }
      }
    };

    measure();
    window.addEventListener("resize", measure);
    const timer = setTimeout(measure, 300);

    return () => {
      window.removeEventListener("resize", measure);
      clearTimeout(timer);
    };
  }, [repeatedProjects]);

  // Virtual Scroll & Drag physics engine
  useEffect(() => {
    const s = scrollRef.current;
    let animId: number;

    const onWheel = (e: WheelEvent) => {
      if (activeView !== "featured") return;
      const factor = e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? window.innerHeight : 1;
      const delta = (Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY) * factor;
      s.target += delta * 0.9;
    };

    const onPointerDown = (e: PointerEvent) => {
      if (activeView !== "featured") return;
      const target = e.target as HTMLElement | null;
      if (target?.closest("button") || target?.closest("a")) return;

      s.isDragging = true;
      s.dragStartX = e.clientX;
      s.dragStartY = e.clientY;
      s.lastX = e.clientX;
      s.lastY = e.clientY;
      s.dragStartTime = performance.now();
      s.dragDelta = 0;

      document.documentElement.classList.add("grabbing");
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!s.isDragging) return;
      const delta = (s.lastX - e.clientX) * 1.3;
      s.dragDelta = delta;
      s.target += delta;
      s.lastX = e.clientX;
      s.lastY = e.clientY;
    };

    const onPointerUp = () => {
      if (!s.isDragging) return;
      s.isDragging = false;
      document.documentElement.classList.remove("grabbing");

      // Inertial throw momentum
      const duration = performance.now() - s.dragStartTime;
      if (duration < 180 && Math.abs(s.dragDelta) > 1.5) {
        s.target += s.dragDelta * 14;
      }
    };

    const onTouchStart = (e: TouchEvent) => {
      if (activeView !== "featured") return;
      s.isDragging = true;
      s.dragStartX = e.touches[0].clientX;
      s.dragStartY = e.touches[0].clientY;
      s.lastX = e.touches[0].clientX;
      s.lastY = e.touches[0].clientY;
      s.dragStartTime = performance.now();
      s.dragDelta = 0;
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!s.isDragging) return;
      const delta = (s.lastX - e.touches[0].clientX) * 1.5;
      s.dragDelta = delta;
      s.target += delta;
      s.lastX = e.touches[0].clientX;
      s.lastY = e.touches[0].clientY;
    };

    const onTouchEnd = () => {
      if (!s.isDragging) return;
      s.isDragging = false;
      const duration = performance.now() - s.dragStartTime;
      if (duration < 200 && Math.abs(s.dragDelta) > 2) {
        s.target += s.dragDelta * 15;
      }
    };

    window.addEventListener("wheel", onWheel, { passive: true });
    window.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    window.addEventListener("pointercancel", onPointerUp);
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("touchend", onTouchEnd);

    const tick = () => {
      animId = requestAnimationFrame(tick);

      s.current += (s.target - s.current) * 0.08;
      const vel = s.target - s.current;
      s.velocity = vel;
      velocityRef.current = vel;

      // Infinite loop wrap
      const singleW = singleWidthRef.current;
      if (singleW > 0) {
        while (s.current >= singleW * 2) {
          s.current -= singleW;
          s.target -= singleW;
        }
        while (s.current < singleW) {
          s.current += singleW;
          s.target += singleW;
        }
      }

      // Move track seamlessly
      if (trackRef.current && activeView === "featured") {
        trackRef.current.style.transform = `translate3d(${-s.current}px, -50%, 0px)`;
      }
    };

    tick();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("pointercancel", onPointerUp);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
      document.documentElement.classList.remove("grabbing");
    };
  }, [activeView]);

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-black text-white select-none">
      <CustomCursor />

      {/* Hamburger Menu Button */}
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

      {/* Three.js WebGL Layer (Renders 3D Curved Cards + Bending Text + Bending Button) */}
      {activeView === "featured" && (
        <ThreeCanvas
          repeatedProjects={repeatedProjects}
          velocityRef={velocityRef}
          hoveredSlug={hoveredSlug}
          onCardClick={(project) => setSelectedProject(project)}
        />
      )}

      {/* Floating Header & Navigation */}
      <Navigation
        isProfileOpen={isProfileOpen}
        setIsProfileOpen={setIsProfileOpen}
        isNewsletterOpen={isNewsletterOpen}
        setIsNewsletterOpen={setIsNewsletterOpen}
        activeView={activeView}
        setActiveView={setActiveView}
      />

      {/* Profile Modal */}
      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
      />

      {/* Newsletter Modal */}
      <NewsletterModal
        isOpen={isNewsletterOpen}
        onClose={() => setIsNewsletterOpen(false)}
      />

      {/* Project Detail Modal */}
      <ProjectModal
        project={selectedProject}
        onClose={() => setSelectedProject(null)}
      />

      {/* Featured View: Continuous Infinite Horizontal Track */}
      {activeView === "featured" && (
        <div
          ref={trackRef}
          className="fixed left-0 top-1/2 flex flex-row items-center gap-x-12 pointer-events-none z-20 will-change-transform"
          style={{ transform: "translate3d(0px, -50%, 0px)" }}
        >
          {repeatedProjects.map((project) => (
            <article
              key={project.uniqueId}
              data-card-id={project.uniqueId}
              data-slug={project.slug}
              data-gl="card"
              onClick={() => setSelectedProject(project)}
              onMouseEnter={() => setHoveredSlug(project.slug)}
              onMouseLeave={() => setHoveredSlug(null)}
              className="pointer-events-auto relative h-[42vh] max-h-[520px] w-auto flex-none cursor-pointer rounded-2xl group"
              style={{ aspectRatio: project.aspectRatio }}
            >
              <span className="sr-only">{project.title}</span>
            </article>
          ))}
        </div>
      )}

      {/* Full View: Clean Project Index List */}
      {activeView === "full" && (
        <div className="fixed inset-0 z-30 overflow-y-auto px-6 py-24 md:px-20 md:py-32 bg-black/90 backdrop-blur-md">
          <div className="max-w-4xl mx-auto space-y-6">
            <h1 className="label opacity-40 text-xs mb-8 tracking-widest font-mono">
              Full Index — Every Project by Name
            </h1>
            <ul className="divide-y divide-white/10">
              {WEB_PROJECTS.map((project) => (
                <li
                  key={project.slug}
                  onClick={() => setSelectedProject(project)}
                  className="py-5 flex items-center justify-between cursor-pointer group hover:text-white/70 transition-colors"
                >
                  <span className="text-2xl md:text-3xl font-light tracking-tight">
                    {project.title}
                  </span>
                  <div className="flex items-center space-x-6 text-sm font-mono">
                    <span className="label opacity-40">{project.year}</span>
                    <span className="label opacity-40 hidden md:inline">{project.role}</span>
                    <ArrowUpRight className="size-5 opacity-40 group-hover:opacity-100 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </main>
  );
}
