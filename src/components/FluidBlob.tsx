import { useEffect, useRef } from 'react';
import * as THREE from 'three';

const VERT = /* glsl */`
varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vPosition;
uniform float uTime;
uniform float uMouse;
uniform vec2 uMousePos;

// Simplex 3D noise
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x*34.0)+10.0)*x); }
vec4 taylorInvSqrt(vec4 r){ return 1.79284291400159 - 0.85373472095314 * r; }

float snoise(vec3 v) {
  const vec2 C = vec2(1.0/6.0, 1.0/3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;
  i = mod289(i);
  vec4 p = permute(permute(permute(
    i.z + vec4(0.0, i1.z, i2.z, 1.0))
    + i.y + vec4(0.0, i1.y, i2.y, 1.0))
    + i.x + vec4(0.0, i1.x, i2.x, 1.0));
  float n_ = 0.142857142857;
  vec3 ns = n_ * D.wyz - D.xzx;
  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);
  vec4 x = x_ *ns.x + ns.yyyy;
  vec4 y = y_ *ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);
  vec4 s0 = floor(b0)*2.0 + 1.0;
  vec4 s1 = floor(b1)*2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
  vec3 p0 = vec3(a0.xy,h.x);
  vec3 p1 = vec3(a0.zw,h.y);
  vec3 p2 = vec3(a1.xy,h.z);
  vec3 p3 = vec3(a1.zw,h.w);
  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
  p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
}

void main() {
  vUv = uv;
  vec3 pos = position;
  
  // Multi-layer noise for organic morphing
  float n1 = snoise(pos * 1.2 + uTime * 0.22);
  float n2 = snoise(pos * 2.5 - uTime * 0.15 + vec3(10.0));
  float n3 = snoise(pos * 4.0 + uTime * 0.30 + vec3(30.0));
  
  // Mouse attraction: pull surface toward mouse position in screen space
  vec3 mouseAttract = vec3(uMousePos * 2.0 - 1.0, 0.0);
  float mouseDist = length(pos.xy - mouseAttract.xy);
  float mouseWave = exp(-mouseDist * 2.5) * uMouse * 0.35;
  
  float displacement = n1 * 0.38 + n2 * 0.18 + n3 * 0.08 + mouseWave;
  
  vNormal = normalize(normalMatrix * normal);
  vPosition = pos + normal * displacement;
  
  gl_Position = projectionMatrix * modelViewMatrix * vec4(vPosition, 1.0);
}
`;

const FRAG = /* glsl */`
uniform float uTime;
uniform float uMouse;
precision highp float;
varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vPosition;

void main() {
  // Fresnel rim
  vec3 viewDir = normalize(cameraPosition - vPosition);
  float fresnel = pow(1.0 - max(dot(viewDir, vNormal), 0.0), 3.5);
  
  // Iridescent colour cycling
  float hue = vUv.x * 1.2 + vUv.y * 0.8 + uTime * 0.08;
  
  // Deep purple/teal/white colour palette (Lusion-like)
  vec3 col1 = vec3(0.07, 0.02, 0.15); // deep purple
  vec3 col2 = vec3(0.01, 0.12, 0.22); // dark teal
  vec3 col3 = vec3(0.45, 0.28, 0.85); // bright violet
  vec3 col4 = vec3(0.08, 0.52, 0.72); // cyan
  vec3 col5 = vec3(0.96, 0.95, 1.00); // near-white
  
  float t1 = sin(hue * 3.14159) * 0.5 + 0.5;
  float t2 = sin(hue * 3.14159 + 2.094) * 0.5 + 0.5;
  float t3 = sin(hue * 3.14159 + 4.189) * 0.5 + 0.5;
  
  vec3 baseCol = mix(col1, col2, t1);
  baseCol = mix(baseCol, col3, t2 * 0.6);
  baseCol = mix(baseCol, col4, t3 * 0.4);
  
  // Rim glow
  vec3 rimCol = mix(col3, col5, 0.4 + uMouse * 0.3);
  vec3 finalCol = mix(baseCol, rimCol, fresnel * (0.7 + uMouse * 0.3));
  
  // Soft specular highlight
  vec3 lightDir = normalize(vec3(1.0, 1.0, 1.5));
  float spec = pow(max(dot(reflect(-lightDir, vNormal), viewDir), 0.0), 32.0);
  finalCol += spec * 0.25 * mix(col5, col3, 0.5);
  
  // Transparency at edges for a "liquid" look
  float alpha = mix(0.72, 1.0, fresnel) * 0.92;
  alpha = min(alpha + uMouse * 0.08, 1.0);
  
  gl_FragColor = vec4(finalCol, alpha);
}
`;

interface FluidBlobProps {
  className?: string;
  mouseInfluence?: number;
}

export default function FluidBlob({ className = '' }: FluidBlobProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const mouseRef = useRef({ x: 0.5, y: 0.5, target: 0, current: 0 });

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.z = 3.5;

    // High-res icosphere for smooth blob
    const geo = new THREE.IcosahedronGeometry(1.0, 64);
    const mat = new THREE.ShaderMaterial({
      vertexShader: VERT,
      fragmentShader: FRAG,
      uniforms: {
        uTime: { value: 0 },
        uMouse: { value: 0 },
        uMousePos: { value: new THREE.Vector2(0.5, 0.5) },
      },
      transparent: true,
      side: THREE.FrontSide,
    });

    const mesh = new THREE.Mesh(geo, mat);
    scene.add(mesh);

    // Soft ambient + point lights for depth
    const ambient = new THREE.AmbientLight(0x3311aa, 0.4);
    scene.add(ambient);
    const ptLight = new THREE.PointLight(0x6633ff, 2.0, 10);
    ptLight.position.set(2, 2, 3);
    scene.add(ptLight);

    // Resize
    const resize = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(container);

    // Mouse tracking
    const onMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = e.clientX / window.innerWidth;
      mouseRef.current.y = 1.0 - e.clientY / window.innerHeight;
      mouseRef.current.target = 1;
    };
    const onMouseLeave = () => {
      mouseRef.current.target = 0;
    };
    window.addEventListener('mousemove', onMouseMove, { passive: true });
    document.addEventListener('mouseleave', onMouseLeave);

    // Render loop
    let rafId: number;
    let t = 0;
    const lerp = (a: number, b: number, f: number) => a + (b - a) * f;

    const tick = () => {
      t += 0.007;
      mat.uniforms.uTime.value = t;

      // Lerp mouse influence
      mouseRef.current.current = lerp(mouseRef.current.current, mouseRef.current.target, 0.05);
      mat.uniforms.uMouse.value = mouseRef.current.current;
      mat.uniforms.uMousePos.value.set(mouseRef.current.x, mouseRef.current.y);

      // Slow auto-rotate
      mesh.rotation.y = t * 0.12;
      mesh.rotation.x = Math.sin(t * 0.09) * 0.15;

      renderer.render(scene, camera);
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafId);
      ro.disconnect();
      window.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseleave', onMouseLeave);
      renderer.dispose();
      geo.dispose();
      mat.dispose();
      container.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className={`w-full h-full ${className}`}
      style={{ filter: 'blur(0px)' }}
    />
  );
}
