import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import gsap from 'gsap';

interface PartCardCanvasProps {
  modelPath: string;
}

export default function PartCardCanvas({ modelPath }: PartCardCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const width = container.clientWidth || 300;
    const height = container.clientHeight || 300;

    // Renderer setup with ACESFilmic tone mapping & local clipping enabled
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    renderer.localClippingEnabled = true;
    container.appendChild(renderer.domElement);

    // Scene & Camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 4);

    // Studio Environment Map for realistic metallic/gloss reflections
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    pmremGenerator.compileEquirectangularShader();

    const envScene = new THREE.Scene();
    envScene.background = new THREE.Color(0x1a1a22);

    const envLight1 = new THREE.DirectionalLight(0xffffff, 2.0);
    envLight1.position.set(5, 8, 5);
    envScene.add(envLight1);

    const envLight2 = new THREE.DirectionalLight(0xffffff, 1.5);
    envLight2.position.set(-5, 4, -5);
    envScene.add(envLight2);

    const envLight3 = new THREE.AmbientLight(0xffffff, 1.0);
    envScene.add(envLight3);

    const studioEnvTexture = pmremGenerator.fromScene(envScene).texture;
    scene.environment = studioEnvTexture;
    pmremGenerator.dispose();

    // Balanced Direct Studio Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    const mainLight = new THREE.DirectionalLight(0xffffff, 1.8);
    mainLight.position.set(5, 8, 5);
    const fillLight = new THREE.DirectionalLight(0xffb070, 0.8);
    fillLight.position.set(-5, -2, -5);
    const rimLight = new THREE.DirectionalLight(0x80b0ff, 1.0);
    rimLight.position.set(0, 5, -8);
    scene.add(ambientLight, mainLight, fillLight, rimLight);

    // Model Group for Multi-Directional 3D Rotation
    const modelGroup = new THREE.Group();
    scene.add(modelGroup);

    // Mouse tracking for dynamic interactive 3D tilt
    const mouseTarget = { x: 0, y: 0 };
    const mouseCurrent = { x: 0, y: 0 };

    const onMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const ny = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      mouseTarget.x = nx * 0.7; // Y-rotation offset
      mouseTarget.y = ny * 0.5; // X-rotation offset
    };

    const onMouseLeave = () => {
      mouseTarget.x = 0;
      mouseTarget.y = 0;
    };

    container.addEventListener('mousemove', onMouseMove);
    container.addEventListener('mouseleave', onMouseLeave);

    // Load Model
    let animationFrameId = 0;
    let observer: IntersectionObserver | null = null;
    let hasAnimatedEntrance = false;

    const loader = new GLTFLoader();
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/');
    loader.setDRACOLoader(dracoLoader);

    loader.load(
      modelPath,
      (gltf) => {
        const model = gltf.scene;

        model.updateMatrixWorld(true);

        const box = new THREE.Box3();
        model.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;
            mesh.castShadow = true;
            mesh.receiveShadow = true;

            if (mesh.geometry) {
              mesh.geometry.computeBoundingBox();
              const childBox = mesh.geometry.boundingBox?.clone();
              if (childBox) {
                childBox.applyMatrix4(mesh.matrixWorld);
                box.union(childBox);
              }
            }
          }
        });

        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());

        model.position.x = -center.x;
        model.position.y = -center.y;
        model.position.z = -center.z;

        const maxDim = Math.max(size.x, size.y, size.z);
        const targetScale = maxDim > 0 ? 2.4 / maxDim : 1;
        modelGroup.scale.setScalar(targetScale);

        modelGroup.add(model);
        modelGroup.updateMatrixWorld(true);

        // Calculate height bounds
        const groupBox = new THREE.Box3().setFromObject(modelGroup);
        const maxY = groupBox.max.y + 0.3;
        const minY = groupBox.min.y - 0.3;

        // 3D Clipping Planes - Start model clipped at top
        const planeSolid = new THREE.Plane(new THREE.Vector3(0, 1, 0), -maxY);
        const planeWire = new THREE.Plane(new THREE.Vector3(0, -1, 0), maxY);

        // Apply planeSolid to solid model materials
        modelGroup.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;
            if (mesh.material) {
              if (Array.isArray(mesh.material)) {
                mesh.material.forEach(m => m.clippingPlanes = [planeSolid]);
              } else {
                mesh.material.clippingPlanes = [planeSolid];
              }
            }
          }
        });

        // Create White Holographic Wireframe Mesh Clone
        const holoGroup = modelGroup.clone(true);
        const holoMat = new THREE.MeshBasicMaterial({
          color: 0xffffff,
          wireframe: true,
          transparent: true,
          opacity: 0.95,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
          clippingPlanes: [planeWire]
        });

        holoGroup.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;
            mesh.material = holoMat;
            mesh.castShadow = false;
            mesh.receiveShadow = false;
          }
        });
        scene.add(holoGroup);

        // Trigger entrance animation WHEN CARD REVEALS ON SCREEN
        const triggerEntranceAnimation = () => {
          if (hasAnimatedEntrance) return;
          hasAnimatedEntrance = true;

          const scanObj = { y: maxY };
          gsap.to(scanObj, {
            y: minY,
            duration: 0.85,
            ease: "power2.inOut",
            onUpdate: () => {
              planeSolid.constant = -scanObj.y;
              planeWire.constant = scanObj.y;
            },
            onComplete: () => {
              // Clean up wireframe mesh and restore normal material rendering
              scene.remove(holoGroup);
              holoMat.dispose();

              modelGroup.traverse((child) => {
                if ((child as THREE.Mesh).isMesh) {
                  const mesh = child as THREE.Mesh;
                  if (mesh.material) {
                    if (Array.isArray(mesh.material)) {
                      mesh.material.forEach(m => m.clippingPlanes = []);
                    } else {
                      mesh.material.clippingPlanes = [];
                    }
                  }
                }
              });
            }
          });
        };

        // Use IntersectionObserver to detect when model reveals on screen
        observer = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                triggerEntranceAnimation();
                observer?.disconnect();
              }
            });
          },
          { threshold: 0.15 }
        );

        observer.observe(container);
      },
      undefined,
      (error) => {
        console.error('Error loading card 3D model:', modelPath, error);
      }
    );

    // Render loop with multi-axis 3D continuous rotation & lerped mouse tilt
    const clock = new THREE.Clock();
    let autoRotY = 0;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      mouseCurrent.x += (mouseTarget.x - mouseCurrent.x) * 0.08;
      mouseCurrent.y += (mouseTarget.y - mouseCurrent.y) * 0.08;

      autoRotY += 0.009;
      modelGroup.rotation.y = autoRotY + mouseCurrent.x;
      modelGroup.rotation.x = Math.sin(elapsedTime * 1.3) * 0.20 - mouseCurrent.y;
      modelGroup.rotation.z = Math.cos(elapsedTime * 0.9) * 0.12;

      renderer.render(scene, camera);
    };
    animate();

    // Resize listener
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      observer?.disconnect();
      container.removeEventListener('mousemove', onMouseMove);
      container.removeEventListener('mouseleave', onMouseLeave);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [modelPath]);

  return <div ref={containerRef} className="w-full h-full relative cursor-grab active:cursor-grabbing" />;
}
