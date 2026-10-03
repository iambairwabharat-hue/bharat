import { forwardRef, useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';
import { useAudio } from '../context/AudioContext';

interface ProductCardProps {
  src: string;
  className?: string;
  style?: React.CSSProperties;
  id?: string;
  title?: string;
  category?: string;
  year?: string;
  onClickAction?: () => void;
}

const vertexShader = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const fragmentShader = `
uniform sampler2D tDiffuse;
uniform float uHover;
uniform float uTime;
uniform vec2 uMouse;
uniform float uImageAspect;
uniform float uPlaneAspect;
varying vec2 vUv;

float random (vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
}

float noise (in vec2 st) {
    vec2 i = floor(st);
    vec2 f = fract(st);

    float a = random(i);
    float b = random(i + vec2(1.0, 0.0));
    float c = random(i + vec2(0.0, 1.0));
    float d = random(i + vec2(1.0, 1.0));

    vec2 u = f*f*(3.0-2.0*f);

    return mix(a, b, u.x) +
            (c - a)* u.y * (1.0 - u.x) +
            (d - b) * u.x * u.y;
}

void main() {
  vec2 uv = vUv;
  
  vec2 ratio = vec2(
    min((uPlaneAspect / uImageAspect), 1.0),
    min((uImageAspect / uPlaneAspect), 1.0)
  );
  
  vec2 sampleUv = vec2(
    uv.x * ratio.x + (1.0 - ratio.x) * 0.5,
    uv.y * ratio.y + (1.0 - ratio.y) * 0.5
  );

  // Aspect-corrected distance to cursor for circular ripple
  vec2 diff = uv - uMouse;
  diff.y /= max(uPlaneAspect, 0.001);
  float dist = length(diff);

  // Localized radius around cursor (~0.32 UV radius)
  float radius = 0.32;
  float influence = smoothstep(radius, 0.03, dist) * uHover;

  // Localized wave ripple & organic noise near the cursor
  float n1 = noise(uv * 4.0 + uTime * 0.6);
  float n2 = noise(uv * 4.0 - uTime * 0.5 + 40.0);
  vec2 noiseDistort = vec2(n1 - 0.5, n2 - 0.5) * 0.06;

  vec2 dir = (dist > 0.001) ? normalize(diff) : vec2(0.0);
  vec2 waveDistort = dir * sin(dist * 26.0 - uTime * 3.5) * 0.032;

  vec2 finalDistortion = (noiseDistort + waveDistort) * influence;

  vec2 distortedUv = clamp(sampleUv + finalDistortion, 0.001, 0.999);

  // Localized chromatic aberration only within cursor ripple
  float chromatic = 0.009 * influence;
  float r = texture2D(tDiffuse, distortedUv + vec2(chromatic, 0.0)).r;
  float g = texture2D(tDiffuse, distortedUv).g;
  float b = texture2D(tDiffuse, distortedUv - vec2(chromatic, 0.0)).b;
  float a = texture2D(tDiffuse, distortedUv).a;

  gl_FragColor = vec4(r, g, b, a);
}
`;

const ProductCard = forwardRef<HTMLDivElement, ProductCardProps>(
  ({ src, className = '', style, id = '01', title = 'PROJECT', category = 'CREATIVE DEV', year = '2026', onClickAction }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    
    // Store three.js objects
    const sceneRef = useRef<THREE.Scene | null>(null);
    const cameraRef = useRef<THREE.OrthographicCamera | null>(null);
    const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
    const materialRef = useRef<THREE.ShaderMaterial | null>(null);
    const rafRef = useRef<number | null>(null);
    
    // Animation state
    const hoverState = useRef({ progress: 0, time: 0, isHovered: false });
    const mouseRef = useRef({ currentX: 0.5, currentY: 0.5, targetX: 0.5, targetY: 0.5 });

    const [inViewport, setInViewport] = useState(false);
    const [webglActive, setWebglActive] = useState(false);

    // Monitor viewport entry to dynamically mount/demount WebGL renderer
    useEffect(() => {
      if (!containerRef.current) return;
      const observer = new IntersectionObserver(
        ([entry]) => {
          setInViewport(entry.isIntersecting);
        },
        { rootMargin: '150px' }
      );
      observer.observe(containerRef.current);
      return () => observer.disconnect();
    }, []);

    // Initialize WebGL
    useEffect(() => {
      if (!inViewport || !canvasRef.current || !containerRef.current) {
        setWebglActive(false);
        return;
      }
      
      const canvas = canvasRef.current;
      const container = containerRef.current;
      
      const renderer = new THREE.WebGLRenderer({ 
        canvas, 
        alpha: true, 
        antialias: false,
        powerPreference: "low-power"
      });
      rendererRef.current = renderer;
      
      const scene = new THREE.Scene();
      sceneRef.current = scene;
      
      const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
      cameraRef.current = camera;
      
      const geometry = new THREE.PlaneGeometry(2, 2);
      
      const textureLoader = new THREE.TextureLoader();
      textureLoader.setCrossOrigin('anonymous');
      textureLoader.load(
        src, 
        (texture) => {
          texture.minFilter = THREE.LinearFilter;
          texture.generateMipmaps = false;
          
          const material = new THREE.ShaderMaterial({
            vertexShader,
            fragmentShader,
            uniforms: {
              tDiffuse: { value: texture },
              uHover: { value: 0 },
              uTime: { value: 0 },
              uMouse: { value: new THREE.Vector2(0.5, 0.5) },
              uImageAspect: { value: texture.image.width / texture.image.height },
              uPlaneAspect: { value: 1.0 }
            }
          });
          materialRef.current = material;
          
          const mesh = new THREE.Mesh(geometry, material);
          scene.add(mesh);
          
          resize();
          renderer.render(scene, camera);
          setWebglActive(true);
        },
        undefined,
        (err) => {
          console.error("Failed to load WebGL texture:", err);
        }
      );

      const resize = () => {
        if (!containerRef.current || !rendererRef.current) return;
        const width = containerRef.current.clientWidth;
        const height = Math.round(containerRef.current.clientHeight * 1.24);
        rendererRef.current.setSize(width, height, false);
        if (materialRef.current) {
          materialRef.current.uniforms.uPlaneAspect.value = width / height;
        }
        if (sceneRef.current && cameraRef.current) {
          rendererRef.current.render(sceneRef.current, cameraRef.current);
        }
      };

      const observer = new ResizeObserver(resize);
      observer.observe(container);

      const render = () => {
        if (!rendererRef.current || !sceneRef.current || !cameraRef.current || !materialRef.current) {
          rafRef.current = requestAnimationFrame(render);
          return;
        }

        const state = hoverState.current;
        materialRef.current.uniforms.uHover.value = state.progress;

        const mouse = mouseRef.current;
        mouse.currentX += (mouse.targetX - mouse.currentX) * 0.15;
        mouse.currentY += (mouse.targetY - mouse.currentY) * 0.15;
        materialRef.current.uniforms.uMouse.value.set(mouse.currentX, mouse.currentY);
        
        if (state.isHovered || state.progress > 0) {
          state.time += 0.02;
          materialRef.current.uniforms.uTime.value = state.time;
        }
        
        if (state.progress > 0.001 || state.isHovered) {
          rendererRef.current.render(sceneRef.current, cameraRef.current);
        } else if (state.progress === 0 && !state.isHovered) {
          rendererRef.current.render(sceneRef.current, cameraRef.current);
        }

        rafRef.current = requestAnimationFrame(render);
      };

      const handleContextLost = (e: Event) => {
        e.preventDefault();
        setWebglActive(false);
      };
      canvas.addEventListener('webglcontextlost', handleContextLost);

      rafRef.current = requestAnimationFrame(render);

      return () => {
        canvas.removeEventListener('webglcontextlost', handleContextLost);
        observer.disconnect();
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        if (rendererRef.current) {
          rendererRef.current.dispose();
        }
        geometry.dispose();
      };
    }, [src, inViewport]);

    const { playHover, playClick } = useAudio();

    const onMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      mouseRef.current.targetX = Math.max(0, Math.min(1, x));
      mouseRef.current.targetY = Math.max(0, Math.min(1, 1.0 - y));
    };

    const onMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
      playHover();
      hoverState.current.isHovered = true;
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;
        const y = (e.clientY - rect.top) / rect.height;
        mouseRef.current.targetX = Math.max(0, Math.min(1, x));
        mouseRef.current.targetY = Math.max(0, Math.min(1, 1.0 - y));
        mouseRef.current.currentX = mouseRef.current.targetX;
        mouseRef.current.currentY = mouseRef.current.targetY;
      }
      gsap.to(hoverState.current, {
        progress: 1,
        duration: 0.8,
        ease: "power2.out",
        overwrite: true
      });
    };

    const onMouseLeave = () => {
      hoverState.current.isHovered = false;
      gsap.to(hoverState.current, {
        progress: 0,
        duration: 0.9,
        ease: "power3.out",
        overwrite: true
      });
    };

    const handleClick = () => {
      playClick();
      if (onClickAction) onClickAction();
    };

    return (
      <div 
        ref={(node) => {
          containerRef.current = node;
          if (typeof ref === 'function') ref(node);
          else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
        }}
        data-cursor="VIEW +"
        className={`bp-card group relative w-full overflow-hidden cursor-pointer select-none border border-white/10 rounded-sm bg-[#0a0a0f] ${className}`}
        style={{ ...style }}
        onMouseEnter={onMouseEnter}
        onMouseMove={onMouseMove}
        onMouseLeave={onMouseLeave}
        onClick={handleClick}
      >
        {/* Parallax Media Mask Window */}
        <div 
          className="parallax-media absolute inset-x-0 -top-[12%] -bottom-[12%] w-full h-[124%] pointer-events-none will-change-transform"
        >
          {/* Fallback image */}
          <img 
            src={src} 
            alt={title} 
            className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 ease-out group-hover:scale-105 ${
              webglActive ? 'opacity-0' : 'opacity-100'
            }`} 
            draggable={false}
          />
          
          {/* WebGL Canvas */}
          <canvas 
            ref={canvasRef} 
            className={`absolute inset-0 w-full h-full object-cover z-10 pointer-events-none transition-all duration-700 ease-out group-hover:scale-105 ${
              webglActive ? 'opacity-100' : 'opacity-0'
            }`}
          />
        </div>

        {/* Gradient dark overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent z-20 pointer-events-none opacity-80 group-hover:opacity-95 transition-opacity duration-300" />

        {/* Minimal Editorial Index Badge (Top Left) */}
        <div className="absolute top-4 left-4 z-30 pointer-events-none flex items-center gap-2">
          <span className="text-[10px] font-mono tracking-widest text-white/50 group-hover:text-white transition-colors duration-300">
            {id}
          </span>
          <div className="w-1 h-1 rounded-full bg-white/30 group-hover:bg-white transition-colors duration-300" />
        </div>

        {/* Minimal Editorial Metadata Bar (Bottom) */}
        <div className="absolute bottom-0 left-0 right-0 p-5 z-30 pointer-events-none flex flex-col gap-1 transform group-hover:-translate-y-1 transition-transform duration-300">
          <div className="flex items-center justify-between">
            <h3 className="text-white font-['Inter_Tight'] font-bold text-sm md:text-base tracking-tight uppercase group-hover:text-white transition-colors">
              {title}
            </h3>
            <span className="text-white/40 group-hover:text-white group-hover:translate-x-1 transition-all duration-300 text-xs font-mono">
              →
            </span>
          </div>
          <div className="flex items-center justify-between text-[9px] font-mono tracking-[0.25em] text-white/40 uppercase">
            <span>{category}</span>
            <span>{year}</span>
          </div>
        </div>
      </div>
    );
  }
);

ProductCard.displayName = 'ProductCard';

export default ProductCard;
