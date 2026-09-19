import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function CyberpunkCar() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // ── Shared mutable mouse object — shared reference between event & RAF ──
    // Start WAY off screen so no mask shows until user actually moves mouse
    const mouse = { x: 0, y: 0, sx: -5.0, sy: -5.0 };

    // ── Renderer ─────────────────────────────────────────────────────────────
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    renderer.setClearColor(0x000000, 0);
    renderer.autoClear = false;
    mountRef.current.appendChild(renderer.domElement);

    // ── Two separate scenes — eliminates all layer-visibility issues ─────────
    const solidScene = new THREE.Scene();
    solidScene.fog = new THREE.FogExp2(0x0a0a10, 0.04);
    const holoScene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.set(0, 1, 8);

    // ── Render Targets ───────────────────────────────────────────────────────
    // Must multiply by pixelRatio — without this, render targets are low-res
    // and get blurry/stretched when the browser zooms or on high-DPI screens.
    const dpr = Math.min(window.devicePixelRatio, 2);
    const rtW = window.innerWidth  * dpr;
    const rtH = window.innerHeight * dpr;
    const rtParams = {
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      format: THREE.RGBAFormat,
      type: THREE.UnsignedByteType,
    };
    const solidRT = new THREE.WebGLRenderTarget(rtW, rtH, rtParams);
    const holoRT  = new THREE.WebGLRenderTarget(rtW, rtH, rtParams);

    // ── Composite Shader ──────────────────────────────────────────────────────
    const orthoCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const compScene   = new THREE.Scene();
    const compMat = new THREE.ShaderMaterial({
      uniforms: {
        tSolid:      { value: solidRT.texture },
        tHolo:       { value: holoRT.texture },
        uMouse:      { value: new THREE.Vector2(0.5, 0.5) },
        uResolution: { value: new THREE.Vector2(rtW, rtH) },
        uRadiusVw:   { value: 0.091 }, // 9.1vw (35% smaller than 14vw)
        uTime:       { value: 0.0 },
      },
      vertexShader: `
        varying vec2 vUv;
        void main() { vUv = uv; gl_Position = vec4(position, 1.0); }
      `,
      fragmentShader: `
        uniform sampler2D tSolid;
        uniform sampler2D tHolo;
        uniform vec2 uMouse;
        uniform vec2 uResolution;
        uniform float uRadiusVw;
        uniform float uTime;
        varying vec2 vUv;

        // Hash function for pseudo-random noise
        float hash(vec2 p) {
          p = fract(p * vec2(123.34, 456.21));
          p += dot(p, p + 45.32);
          return fract(p.x * p.y);
        }

        // Smooth 2D noise
        float noise(vec2 p) {
          vec2 i = floor(p);
          vec2 f = fract(p);
          f = f * f * (3.0 - 2.0 * f);
          float a = hash(i);
          float b = hash(i + vec2(1.0, 0.0));
          float c = hash(i + vec2(0.0, 1.0));
          float d = hash(i + vec2(1.0, 1.0));
          return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
        }

        // FBM (Fractal Brownian Motion) for organic fluid turbulence
        float fbm(vec2 p) {
          float value = 0.0;
          float amp = 0.5;
          for (int i = 0; i < 3; i++) {
            value += amp * noise(p);
            p *= 2.03;
            amp *= 0.5;
          }
          return value;
        }

        void main() {
          vec4 cSolid = texture2D(tSolid, vUv);
          vec4 cHolo  = texture2D(tHolo,  vUv);

          vec2 px  = vUv * uResolution;
          vec2 mpx = uMouse * uResolution;

          float radius = uResolution.x * uRadiusVw;
          float blk    = max(2.0, uResolution.x * 0.0052);
          vec2  bc     = floor(px / blk) * blk;

          vec2 delta = bc - mpx;
          float baseDist = length(delta);

          // Angle around cursor for perimeter wave generation
          float angle = atan(delta.y, delta.x);

          // Liquid perimeter oscillation (combining harmonics for fluid morphing)
          float liquidWave = sin(angle * 3.0 + uTime * 2.2) * 0.22
                           + cos(angle * 5.0 - uTime * 1.5) * 0.14
                           + sin(angle * 8.0 + uTime * 2.8) * 0.08;

          // Liquid turbulence field flowing through space over time
          vec2 noiseUv = (bc / uResolution.x) * 4.5 + vec2(uTime * 0.35, uTime * 0.25);
          float liquidField = (fbm(noiseUv) - 0.5) * 0.40;

          // Total organic liquid distortion multiplier
          float shapeDistortion = 1.0 + liquidWave + liquidField;
          float effectiveRadius = radius * shapeDistortion;

          // Pixel edge variation
          float n = (hash(bc) - 0.5) * blk * 0.6;
          float dist = baseDist + n;

          // Liquid blend boundary
          float inner = effectiveRadius - blk * 3.0;
          float outer = effectiveRadius + blk * 2.5;
          float mask  = smoothstep(inner, outer, dist);

          gl_FragColor = mix(cHolo, cSolid, mask);
        }
      `,
      transparent: true,
      depthWrite: false,
    });
    compScene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), compMat));

    // ── Environment ──────────────────────────────────────────────────────────
    const pmrem  = new THREE.PMREMGenerator(renderer);
    const envTex = pmrem.fromScene(new RoomEnvironment(), 0.5).texture;
    solidScene.environment = envTex;
    holoScene.environment  = envTex;

    // ── Lights ───────────────────────────────────────────────────────────────
    // Solid scene lights (we keep refs for dynamic updates)
    const sAmbient = new THREE.AmbientLight(0xffffff, 1.5);
    const sFront   = new THREE.DirectionalLight(0xffffff, 4.0);
    sFront.position.set(5, 5, 10);
    const sTop = new THREE.DirectionalLight(0xffffff, 5.0);
    sTop.position.set(0, 15, 5);
    sTop.castShadow = true;
    sTop.shadow.mapSize.set(2048, 2048);
    sTop.shadow.bias = -0.001;
    const sFill = new THREE.DirectionalLight(0xffffff, 2.0);
    sFill.position.set(-10, 0, 10);
    const sBack = new THREE.DirectionalLight(0xff9900, 8.0);
    sBack.position.set(0, 5, -10);
    solidScene.add(sAmbient, sFront, sTop, sFill, sBack);

    // Holo scene lights
    const hAmbient = new THREE.AmbientLight(0x00ffff, 0.5);
    const hFront   = new THREE.DirectionalLight(0x00ffff, 2.0);
    hFront.position.set(5, 5, 10);
    holoScene.add(hAmbient, hFront);

    // Floor (solid only)
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(100, 100),
      new THREE.ShadowMaterial({ opacity: 0.4 })
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -3;
    floor.receiveShadow = true;
    solidScene.add(floor);

    // ── Mouse tracking ───────────────────────────────────────────────────────
    const onMouseMove = (e: MouseEvent) => {
      mouse.x  = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.y  = -(e.clientY / window.innerHeight) * 2 + 1;
      mouse.sx = e.clientX / window.innerWidth;
      mouse.sy = 1.0 - e.clientY / window.innerHeight;
    };
    document.addEventListener('mousemove', onMouseMove, { capture: true });

    // ── Mouse groups (one per scene, synced in RAF) ──────────────────────────
    const sMG = new THREE.Group(); solidScene.add(sMG);
    const hMG = new THREE.Group(); holoScene.add(hMG);

    // ── Load model ───────────────────────────────────────────────────────────
    let floatTween: gsap.core.Tween | null = null;
    const loader = new GLTFLoader();
    const draco  = new DRACOLoader();
    draco.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/');
    loader.setDRACOLoader(draco);

    loader.load('/models/hovercar/scene-mr.gltf', (gltf) => {
      // Solid car
      const solidCar = gltf.scene;
      solidCar.traverse((obj) => {
        const mesh = obj as THREE.Mesh;
        if (!mesh.isMesh) return;
        const mat = mesh.material as THREE.MeshStandardMaterial;
        if (mat?.name === 'Plane.005_0') { mesh.visible = false; return; }
        if (mat) { mat.envMapIntensity = 2; mat.needsUpdate = true; }
        mesh.castShadow = mesh.receiveShadow = true;
      });

      // Holo car — clone and replace all materials
      const holoCar = gltf.scene.clone(true);
      const holoMat = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        wireframe: true,
        transparent: true,
        opacity: 0.9,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      holoCar.traverse((obj) => {
        const mesh = obj as THREE.Mesh;
        if (!mesh.isMesh) return;
        const mat = mesh.material as THREE.MeshStandardMaterial;
        if (mat?.name === 'Plane.005_0') { mesh.visible = false; return; }
        mesh.material = holoMat;
        mesh.castShadow = mesh.receiveShadow = false;
      });

      // Create identical wrappers for both scenes
      const makeWrapper = () => {
        const w = new THREE.Group();
        w.position.set(2, 0, 0);
        w.rotation.set(0.1, -Math.PI / 1.8, 0.1);
        w.scale.setScalar(1.2);
        return w;
      };

      const sw = makeWrapper(); sw.add(solidCar);
      const hw = makeWrapper(); hw.add(holoCar);

      const sf = new THREE.Group(); sf.position.set(0, -1, 0); sf.add(sw); sMG.add(sf);
      const hf = new THREE.Group(); hf.position.set(0, -1, 0); hf.add(hw); hMG.add(hf);

      // Float both simultaneously
      floatTween = gsap.to([sf.position, hf.position], {
        y: -0.5, duration: 2.5, yoyo: true, repeat: -1, ease: 'sine.inOut',
      });

      // Scroll — animate both wrappers identically until .horizontal-parts-section
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: '.preview-container',
          start: 'top top',
          endTrigger: '.horizontal-parts-section',
          end: 'top top',
          scrub: 1.5
        },
      });
      [sw, hw].forEach(w => {
        tl.to(w.rotation, { x: Math.PI / 2, y: 0, z: 0 }, 0);
        tl.to(w.position, { x: 0.3, y: -0.5, z: 0 }, 0);
        tl.to(w.scale,    { x: 1, y: 1, z: 1 }, 0);
        tl.to(w.rotation, { x: 0.1, y: Math.PI, z: 0 }, 1);
        tl.to(w.position, { x: -0.3, y: 0.2, z: 0.5 }, 1);
        tl.to(w.scale,    { x: 1.0, y: 1.0, z: 1.0 }, 1);
        // OUT animation — Model accelerates far into background fog & disappears rapidly
        tl.to(w.rotation, { x: -0.2, y: Math.PI * 1.8, z: 0.1 }, 1.35);
        tl.to(w.position, { x: 0, y: 4.5, z: -40 }, 1.35);
        tl.to(w.scale,    { x: 0, y: 0, z: 0 }, 1.35);
      });
    });

    // ── Render loop ──────────────────────────────────────────────────────────
    // Lerped mouse trails behind the real cursor — gives the smooth drag effect
    const lerpedMouse = { sx: -5, sy: -5 };
    let rafId = 0;
    const animate = () => {
      rafId = requestAnimationFrame(animate);

      // Slowly lerp towards actual mouse — lower = more trailing lag
      lerpedMouse.sx += (mouse.sx - lerpedMouse.sx) * 0.07;
      lerpedMouse.sy += (mouse.sy - lerpedMouse.sy) * 0.07;
      compMat.uniforms.uMouse.value.set(lerpedMouse.sx, lerpedMouse.sy);
      compMat.uniforms.uTime.value = performance.now() * 0.001;

      // Sync both mouse groups
      [sMG, hMG].forEach(g => {
        g.rotation.y += (mouse.x * 0.25 - g.rotation.y) * 0.08;
        g.rotation.x += (mouse.y * 0.15 - g.rotation.x) * 0.08;
      });

      // Dynamic lights
      sFront.position.x += (5 + mouse.x * 12 - sFront.position.x) * 0.05;
      sFront.position.y += (5 + mouse.y * 8  - sFront.position.y) * 0.05;
      sTop.position.x   += (mouse.x * 18  - sTop.position.x) * 0.05;

      // Pass 1 → solid scene into solidRT
      renderer.setRenderTarget(solidRT);
      renderer.clear(true, true, true);
      renderer.render(solidScene, camera);

      // Pass 2 → holo scene into holoRT
      renderer.setRenderTarget(holoRT);
      renderer.clear(true, true, true);
      renderer.render(holoScene, camera);

      // Pass 3 → composite to screen (NO clear here — preserve HTML background)
      renderer.setRenderTarget(null);
      renderer.clear(true, true, true);
      renderer.render(compScene, orthoCamera);
    };
    animate();

    // ── Resize ───────────────────────────────────────────────────────────────
    const onResize = () => {
      const w = window.innerWidth, h = window.innerHeight;
      const d = Math.min(window.devicePixelRatio, 2);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      solidRT.setSize(w * d, h * d);
      holoRT.setSize(w * d, h * d);
      compMat.uniforms.uResolution.value.set(w * d, h * d);
    };
    window.addEventListener('resize', onResize);

    // ── Cleanup ───────────────────────────────────────────────────────────────
    return () => {
      cancelAnimationFrame(rafId);
      document.removeEventListener('mousemove', onMouseMove, true);
      window.removeEventListener('resize', onResize);
      mountRef.current?.contains(renderer.domElement) && mountRef.current.removeChild(renderer.domElement);
      solidRT.dispose();
      holoRT.dispose();
      compMat.dispose();
      renderer.dispose();
      floatTween?.kill();
      ScrollTrigger.getAll().forEach(t => t.kill());
    };
  }, []);

  return <div ref={mountRef} className="fixed inset-0 z-0 pointer-events-none" />;
}
