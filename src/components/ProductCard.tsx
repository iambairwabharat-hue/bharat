import { forwardRef, useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';
import { useAudio } from '../context/AudioContext';

interface ProductCardProps {
  src: string;
  className?: string;
  style?: React.CSSProperties;
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
uniform float uImageAspect;
uniform float uPlaneAspect;
varying vec2 vUv;

// 2D Random
float random (vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
}

// 2D Noise based on Morgan McGuire @morgan3d
// https://www.shadertoy.com/view/4dS3Wd
float noise (in vec2 st) {
    vec2 i = floor(st);
    vec2 f = fract(st);

    // Four corners in 2D of a tile
    float a = random(i);
    float b = random(i + vec2(1.0, 0.0));
    float c = random(i + vec2(0.0, 1.0));
    float d = random(i + vec2(1.0, 1.0));

    // Smooth Interpolation
    vec2 u = f*f*(3.0-2.0*f);

    // Mix 4 coorners percentages
    return mix(a, b, u.x) +
            (c - a)* u.y * (1.0 - u.x) +
            (d - b) * u.x * u.y;
}

void main() {
  vec2 uv = vUv;
  
  // Object-cover logic
  vec2 ratio = vec2(
    min((uPlaneAspect / uImageAspect), 1.0),
    min((uImageAspect / uPlaneAspect), 1.0)
  );
  
  uv = vec2(
    uv.x * ratio.x + (1.0 - ratio.x) * 0.5,
    uv.y * ratio.y + (1.0 - ratio.y) * 0.5
  );
  
  // Calculate noise based on UV and time to create a liquid flow
  // Scale UV to control the size of the waves
  float n1 = noise(uv * 3.0 + uTime * 0.5);
  float n2 = noise(uv * 3.0 - uTime * 0.4 + 100.0);
  
  // Create a smooth directional distortion vector
  vec2 distortion = vec2(n1 - 0.5, n2 - 0.5) * 0.15 * uHover;
  
  // Add a pinch/pull effect towards the center (like the screenshot)
  vec2 center = vec2(0.5, 0.5);
  float distToCenter = distance(uv, center);
  vec2 dirToCenter = normalize(uv - center);
  
  // Combine noise distortion with a radial pull
  vec2 finalDistortion = distortion + dirToCenter * sin(distToCenter * 10.0 - uTime) * 0.05 * uHover;
  
  // Apply distortion to UV
  vec2 distortedUv = uv + finalDistortion;
  
  // Prevent harsh wrapping by clamping
  distortedUv = clamp(distortedUv, 0.001, 0.999);
  
  vec4 color = texture2D(tDiffuse, distortedUv);
  
  // Optional: subtle RGB shift during movement
  float r = texture2D(tDiffuse, distortedUv + vec2(0.01 * uHover, 0.0)).r;
  float b = texture2D(tDiffuse, distortedUv - vec2(0.01 * uHover, 0.0)).b;
  
  gl_FragColor = vec4(r, color.g, b, color.a);
}
`;

const ProductCard = forwardRef<HTMLDivElement, ProductCardProps>(
  ({ src, className = '', style }, ref) => {
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

    const [inViewport, setInViewport] = useState(false);
    const [webglActive, setWebglActive] = useState(false);

    // Monitor viewport entry to dynamically mount/demount WebGL renderer
    useEffect(() => {
      if (!containerRef.current) return;
      const observer = new IntersectionObserver(
        ([entry]) => {
          setInViewport(entry.isIntersecting);
        },
        { rootMargin: '150px' } // Pre-load slightly before scrolling into view
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
      
      // Setup Renderer
      const renderer = new THREE.WebGLRenderer({ 
        canvas, 
        alpha: true, 
        antialias: false,
        powerPreference: "low-power" // Help with multiple contexts
      });
      rendererRef.current = renderer;
      
      // Setup Scene
      const scene = new THREE.Scene();
      sceneRef.current = scene;
      
      // Setup Camera
      const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
      cameraRef.current = camera;
      
      // Setup Geometry
      const geometry = new THREE.PlaneGeometry(2, 2);
      
      // Load Texture
      const textureLoader = new THREE.TextureLoader();
      textureLoader.setCrossOrigin('anonymous');
      textureLoader.load(
        src, 
        (texture) => {
          texture.minFilter = THREE.LinearFilter;
          texture.generateMipmaps = false;
          
          // Match texture aspect ratio with container if needed, but for simplicity
          // we'll rely on the object-cover class approach combined with GLSL clamping.
          
          // Setup Material
          const material = new THREE.ShaderMaterial({
            vertexShader,
            fragmentShader,
            uniforms: {
              tDiffuse: { value: texture },
              uHover: { value: 0 },
              uTime: { value: 0 },
              uImageAspect: { value: texture.image.width / texture.image.height },
              uPlaneAspect: { value: 1.0 } // Set dynamically in resize
            }
          });
          materialRef.current = material;
          
          // Setup Mesh
          const mesh = new THREE.Mesh(geometry, material);
          scene.add(mesh);
          
          // Initial render
          resize();
          renderer.render(scene, camera);
          setWebglActive(true);
        },
        undefined,
        (err) => {
          console.error("Failed to load WebGL texture:", err);
          // Fallback image will be visible
        }
      );

      const resize = () => {
        if (!containerRef.current || !rendererRef.current) return;
        const width = containerRef.current.clientWidth;
        const height = containerRef.current.clientHeight;
        rendererRef.current.setSize(width, height, false);
        if (materialRef.current) {
          materialRef.current.uniforms.uPlaneAspect.value = width / height;
        }
        // Force a render on resize
        if (sceneRef.current && cameraRef.current) {
          rendererRef.current.render(sceneRef.current, cameraRef.current);
        }
      };

      const observer = new ResizeObserver(resize);
      observer.observe(container);

      // Render loop (only active during animation or hover)
      const render = () => {
        if (!rendererRef.current || !sceneRef.current || !cameraRef.current || !materialRef.current) {
          rafRef.current = requestAnimationFrame(render);
          return;
        }

        const state = hoverState.current;
        
        // Update uniforms
        materialRef.current.uniforms.uHover.value = state.progress;
        
        if (state.isHovered || state.progress > 0) {
          state.time += 0.02; // Speed of the fluid
          materialRef.current.uniforms.uTime.value = state.time;
        }
        
        // Only render if there's active effect to save battery/perf
        if (state.progress > 0.001 || state.isHovered) {
          rendererRef.current.render(sceneRef.current, cameraRef.current);
        } else if (state.progress === 0 && !state.isHovered) {
           // Ensure it renders clean at least once at 0
           rendererRef.current.render(sceneRef.current, cameraRef.current);
        }

        rafRef.current = requestAnimationFrame(render);
      };
      
      rafRef.current = requestAnimationFrame(render);

      return () => {
        observer.disconnect();
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        if (rendererRef.current) {
          rendererRef.current.dispose();
          rendererRef.current.forceContextLoss();
        }
        geometry.dispose();
      };
    }, [src, inViewport]);

    // Handle Hover
    const { playHover, playClick } = useAudio();

    const onMouseEnter = () => {
      playHover();
      hoverState.current.isHovered = true;
      gsap.to(hoverState.current, {
        progress: 1,
        duration: 1.2,
        ease: "power2.out",
        overwrite: true
      });
    };

    const onMouseLeave = () => {
      hoverState.current.isHovered = false;
      gsap.to(hoverState.current, {
        progress: 0,
        duration: 1.2,
        ease: "power3.out",
        overwrite: true
      });
    };

    return (
      <div 
        ref={(node) => {
          // Combine both refs
          if (typeof ref === 'function') ref(node);
          else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
        }}
        className={`bp-card relative w-full overflow-hidden cursor-pointer ${className}`}
        style={{ ...style, transform: 'scale(0)' }}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        onClick={playClick}
      >
        {/* Fallback image if WebGL fails, loads, or is out of viewport */}
        <img 
          src={src} 
          alt="Archive Collection" 
          className={`absolute inset-0 w-full h-full object-cover -z-10 transition-opacity duration-300 ${
            webglActive ? 'opacity-0' : 'opacity-100'
          }`} 
          draggable={false}
        />
        <canvas 
          ref={canvasRef} 
          className={`absolute inset-0 w-full h-full object-cover z-10 pointer-events-none transition-opacity duration-300 ${
            webglActive ? 'opacity-100' : 'opacity-0'
          }`}
        />
      </div>
    );
  }
);

ProductCard.displayName = 'ProductCard';

export default ProductCard;
