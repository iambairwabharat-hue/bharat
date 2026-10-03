import { useEffect, useRef } from 'react';
import * as THREE from 'three';

/**
 * ScrollDistortion — Full-screen post-process chromatic aberration + blur
 * that activates based on scroll velocity (Lusion-style transition feel).
 * Renders as a fixed overlay canvas using an orthographic quad.
 */

const VERT = /* glsl */`
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`;

const FRAG = /* glsl */`
precision highp float;
uniform sampler2D tDiffuse;
uniform float uChromatic;   // 0..1 chromatic aberration strength
uniform float uBlur;        // 0..1 radial blur
uniform float uVignette;    // 0..1 vignette
uniform float uTime;
varying vec2 vUv;

void main() {
  vec2 uv = vUv;
  vec2 center = vec2(0.5);
  vec2 dir = uv - center;
  float dist = length(dir);
  
  // Chromatic aberration (RGB split)
  float ca = uChromatic * 0.018;
  float r = texture2D(tDiffuse, uv + dir * ca * 1.2).r;
  float g = texture2D(tDiffuse, uv).g;
  float b = texture2D(tDiffuse, uv - dir * ca * 0.8).b;
  float a = texture2D(tDiffuse, uv).a;
  
  vec3 col = vec3(r, g, b);
  
  // Radial blur (sample multiple times along dir)
  if (uBlur > 0.001) {
    float blurAmt = uBlur * dist * 0.08;
    vec3 blurred = vec3(0.0);
    const int SAMPLES = 8;
    for (int i = 0; i < SAMPLES; i++) {
      float t = (float(i) / float(SAMPLES - 1)) - 0.5;
      vec2 offset = dir * t * blurAmt;
      vec2 sampleUv = clamp(uv + offset, 0.0, 1.0);
      blurred += texture2D(tDiffuse, sampleUv).rgb;
    }
    blurred /= float(SAMPLES);
    col = mix(col, blurred, uBlur);
  }
  
  // Edge vignette (always on, subtle)
  float vign = 1.0 - smoothstep(0.35, 0.85, dist) * (0.55 + uVignette * 0.45);
  col *= vign;
  
  gl_FragColor = vec4(col, a);
}
`;

export default function ScrollDistortion() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const velRef = useRef(0);
  const lastScrollRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // --- Three.js setup ---
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false });
    renderer.setPixelRatio(1); // intentionally low-res for performance
    renderer.setClearColor(0x000000, 0);

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    // Render target to capture the current page
    let rtWidth = window.innerWidth;
    let rtHeight = window.innerHeight;
    const rt = new THREE.WebGLRenderTarget(rtWidth, rtHeight);

    const geo = new THREE.PlaneGeometry(2, 2);
    const mat = new THREE.ShaderMaterial({
      vertexShader: VERT,
      fragmentShader: FRAG,
      uniforms: {
        tDiffuse: { value: null },
        uChromatic: { value: 0 },
        uBlur: { value: 0 },
        uVignette: { value: 0 },
        uTime: { value: 0 },
      },
      transparent: true,
      depthTest: false,
      depthWrite: false,
    });

    const mesh = new THREE.Mesh(geo, mat);
    scene.add(mesh);

    // Resize
    const resize = () => {
      rtWidth = window.innerWidth;
      rtHeight = window.innerHeight;
      renderer.setSize(rtWidth, rtHeight);
      rt.setSize(rtWidth, rtHeight);
    };
    resize();
    window.addEventListener('resize', resize);

    // Scroll velocity tracking
    const onScroll = () => {
      const sy = window.scrollY;
      const delta = Math.abs(sy - lastScrollRef.current);
      lastScrollRef.current = sy;
      velRef.current = Math.min(delta / 30, 1.0); // normalize to 0..1
    };
    window.addEventListener('scroll', onScroll, { passive: true });

    // RAF loop
    let rafId: number;
    let t = 0;
    const lerp = (a: number, b: number, f: number) => a + (b - a) * f;
    let chromatic = 0;
    let blur = 0;

    const tick = () => {
      t += 0.016;
      const vel = velRef.current;
      velRef.current *= 0.88; // decay

      // Lerp shader values toward velocity
      chromatic = lerp(chromatic, vel, 0.12);
      blur = lerp(blur, vel * 0.5, 0.08);

      mat.uniforms.uChromatic.value = chromatic;
      mat.uniforms.uBlur.value = blur;
      mat.uniforms.uVignette.value = chromatic * 0.6;
      mat.uniforms.uTime.value = t;
      mat.uniforms.tDiffuse.value = rt.texture;

      renderer.render(scene, camera);
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', resize);
      window.removeEventListener('scroll', onScroll);
      renderer.dispose();
      geo.dispose();
      mat.dispose();
      rt.dispose();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[50]"
      style={{ width: '100%', height: '100%', mixBlendMode: 'screen', opacity: 0.65 }}
    />
  );
}
