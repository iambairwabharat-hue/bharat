// 3D Models Visualizer Engine - PRMPT Portfolio with Pure 3D Holographic Wireframe Mesh Transition
document.addEventListener('DOMContentLoaded', () => {
  // Model Data Array
  const models = [
    {
      id: 'earphone',
      file: '3d/port/earphone.glb',
      title: 'EARPHONE',
      subtitle: 'WIRELESS AUDIO DESIGN',
      category: 'Consumer Tech',
      description: 'High-fidelity wireless earphone 3D product visualizer featuring ergonomic form factor, metallic highlights, and precision driver geometry.',
      isNew: true
    },
    {
      id: 'perfume_bottle',
      file: '3d/port/perfume_bottle.glb',
      title: 'PERFUME BOTTLE',
      subtitle: 'LUXURY FRAGRANCE PACKAGING',
      category: 'Cosmetics & Beauty',
      description: 'Sculptural glass perfume bottle 3D model showcasing premium glass refraction, gold metallic cap, and sleek cosmetics branding.',
      isNew: true
    },
    {
      id: 'ball_bearing',
      file: '3d/port/ball_bearing.glb',
      title: 'BALL BEARING',
      subtitle: 'PRECISION INDUSTRIAL ASSEMBLY',
      category: 'Engineering',
      description: 'High-precision industrial ball bearing assembly with metallic finish, smooth race geometry, and steel balls.',
      isNew: true
    },
    {
      id: 'coffee_packaging',
      file: '3d/port/coffee_packaging.glb',
      title: 'COFFEE PACKAGING',
      subtitle: 'CRAFT COFFEE POUCH',
      category: 'Packaging',
      description: 'Matte craft paper coffee pouch packaging with custom roast branding, valve detail, and metallic foil highlights.',
      isNew: false
    },
    {
      id: 'keybord',
      file: '3d/port/keybord.glb',
      title: 'MECHANICAL KEYBOARD',
      subtitle: 'CUSTOM HARDWARE DESIGN',
      category: 'Peripherals',
      description: 'Low-profile custom mechanical keyboard model highlighting keycap ergonomics, switch layout, and matte anodized chassis.',
      isNew: false
    },
    {
      id: 'office_chair',
      file: '3d/port/office_chair.glb',
      title: 'OFFICE CHAIR',
      subtitle: 'ERGONOMIC SEATING',
      category: 'Furniture',
      description: 'Precision-engineered executive mesh chair model featuring adjustable lumbar support, metallic base, and ergonomic contours.',
      isNew: false
    },
    {
      id: 'tshirt',
      file: '3d/port/tshirt.glb',
      title: 'COTTON T-SHIRT',
      subtitle: 'APPAREL & TEXTILE',
      category: 'Fashion & Apparel',
      description: 'Realistically draped heavy-cotton boxy fit t-shirt visualizer with high-resolution fabric weave and natural folds.',
      isNew: false
    }
  ];

  let currentIndex = 0;
  let currentModelGroup = null;
  let currentModelMesh = null;
  let isAutoRotate = true;
  let isTransitioning = false;

  // DOM Elements
  const canvas = document.getElementById('gallery-canvas');
  const cardCounter = document.getElementById('card-counter');
  const cardNewTag = document.getElementById('card-new-tag');
  const cardTitle = document.getElementById('card-title');
  const cardSubtitle = document.getElementById('card-subtitle');
  const cardDesc = document.getElementById('card-desc');
  const trackEl = document.getElementById('carousel-track');
  const btnAutoRotate = document.getElementById('btn-autorotate');
  const btnReset = document.getElementById('btn-reset');

  // Three.js Core Setup
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0a0a0c);
  scene.fog = new THREE.FogExp2(0x0a0a0c, 0.02);

  // Static Camera - NO zoom in/out jumping
  const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, 0.4, 4.0);

  const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
    alpha: true,
    powerPreference: "high-performance"
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;
  renderer.localClippingEnabled = true;

  // PMREM Generator for High-Quality Studio Environment Reflections
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

  // OrbitControls Setup
  const controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.maxDistance = 15;
  controls.minDistance = 0.5;
  controls.autoRotate = true;
  controls.autoRotateSpeed = 2.0;

  // Balanced Direct Studio Lighting
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
  scene.add(ambientLight);

  const keyLight = new THREE.DirectionalLight(0xffffff, 1.8);
  keyLight.position.set(5, 8, 5);
  keyLight.castShadow = true;
  keyLight.shadow.mapSize.width = 2048;
  keyLight.shadow.mapSize.height = 2048;
  keyLight.shadow.bias = -0.0001;
  scene.add(keyLight);

  const fillLight = new THREE.DirectionalLight(0xffb070, 0.8);
  fillLight.position.set(-5, 3, -5);
  scene.add(fillLight);

  const rimLight = new THREE.DirectionalLight(0x80b0ff, 1.0);
  rimLight.position.set(0, 5, -6);
  scene.add(rimLight);

  // Soft Ground Shadow Plane
  const shadowPlaneGeo = new THREE.PlaneGeometry(30, 30);
  const shadowPlaneMat = new THREE.ShadowMaterial({ opacity: 0.35 });
  const shadowPlane = new THREE.Mesh(shadowPlaneGeo, shadowPlaneMat);
  shadowPlane.rotation.x = -Math.PI / 2;
  shadowPlane.position.y = -1.15;
  shadowPlane.receiveShadow = true;
  scene.add(shadowPlane);

  // Model Cache map
  const loadedModelsCache = new Map();

  // GLTF Loader instance
  const gltfLoader = new THREE.GLTFLoader();

  // Build Bottom Carousel Items
  function buildCarousel() {
    trackEl.innerHTML = '';
    models.forEach((model, idx) => {
      const card = document.createElement('div');
      card.className = `carousel-item ${idx === currentIndex ? 'active' : ''}`;
      card.innerHTML = `
        ${model.isNew ? '<span class="carousel-item__tag">NEW</span>' : ''}
        <div class="carousel-item__num">${String(idx + 1).padStart(2, '0')} / ${String(models.length).padStart(2, '0')}</div>
        <div class="carousel-item__title">${model.title}</div>
        <div class="carousel-item__sub">${model.category}</div>
      `;
      card.addEventListener('click', () => {
        if (idx !== currentIndex && !isTransitioning) {
          switchModel(idx);
        }
      });
      trackEl.appendChild(card);
    });
  }

  // Update UI Card Text cleanly
  function updateCardUI(index) {
    const model = models[index];
    cardCounter.innerText = `${String(index + 1).padStart(2, '0')} / ${String(models.length).padStart(2, '0')}`;
    cardTitle.innerText = model.title;
    cardSubtitle.innerText = model.subtitle;
    cardDesc.innerText = model.description;

    if (model.isNew) {
      cardNewTag.style.display = 'inline-block';
    } else {
      cardNewTag.style.display = 'none';
    }

    const items = trackEl.querySelectorAll('.carousel-item');
    items.forEach((item, i) => {
      if (i === index) {
        item.classList.add('active');
        item.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      } else {
        item.classList.remove('active');
      }
    });

    if (window.gsap) {
      gsap.fromTo([cardTitle, cardSubtitle, cardDesc],
        { opacity: 0, x: -10 },
        { opacity: 1, x: 0, duration: 0.3, stagger: 0.04, ease: "power2.out" }
      );
    }
  }

  // Frame Object to Static Camera Viewport without camera movement
  function frameModel(wrapperGroup, innerModel) {
    innerModel.updateMatrixWorld(true);

    const box = new THREE.Box3().setFromObject(innerModel);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());

    const maxDim = Math.max(size.x, size.y, size.z) || 1.0;
    const targetScale = 2.2 / maxDim;

    innerModel.scale.setScalar(targetScale);
    innerModel.position.set(
      -center.x * targetScale,
      -center.y * targetScale,
      -center.z * targetScale
    );

    // Keep camera fixed - NO zoom jumps!
    camera.position.set(0, 0.4, 4.0);
    controls.target.set(0, 0, 0);
    controls.update();
  }

  // Switch Model with Pure 3D Holographic Wireframe Transition (Wipe Out -> Wipe In)
  function switchModel(index) {
    if (isTransitioning) return;
    currentIndex = index;

    const modelData = models[index];

    // Initial load without transition
    if (!currentModelGroup) {
      loadTargetModel(modelData, (newGroup) => {
        currentModelGroup = newGroup;
        updateCardUI(index);
        preloadModels();
      });
      return;
    }

    isTransitioning = true;
    const oldGroup = currentModelGroup;

    // Bounds of old model for scan sweep
    const box = new THREE.Box3().setFromObject(oldGroup);
    const maxY = box.max.y + 0.3;
    const minY = box.min.y - 0.3;

    // 3D Clipping Planes for Old Model
    const planeSolidOld = new THREE.Plane(new THREE.Vector3(0, -1, 0), maxY);
    const planeWireOld = new THREE.Plane(new THREE.Vector3(0, 1, 0), -maxY);

    oldGroup.traverse((child) => {
      if (child.isMesh && child.material) {
        if (Array.isArray(child.material)) {
          child.material.forEach(m => m.clippingPlanes = [planeSolidOld]);
        } else {
          child.material.clippingPlanes = [planeSolidOld];
        }
      }
    });

    // Create White Holographic Wireframe Mesh Clone of Old Model
    const holoGroupOld = oldGroup.clone(true);
    const holoMatOld = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      wireframe: true,
      transparent: true,
      opacity: 0.95,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      clippingPlanes: [planeWireOld]
    });
    holoGroupOld.traverse((child) => {
      if (child.isMesh) {
        child.material = holoMatOld;
        child.castShadow = false;
        child.receiveShadow = false;
      }
    });
    scene.add(holoGroupOld);

    // ── STEP 1: WIPE OUT (Old Model converts to Hologram Mesh from top to bottom)
    const scanObj = { y: maxY };

    gsap.to(scanObj, {
      y: minY,
      duration: 0.38,
      ease: "power2.inOut",
      onUpdate: () => {
        planeSolidOld.constant = scanObj.y;
        planeWireOld.constant = -scanObj.y;
      },
      onComplete: () => {
        // Remove old model & old wireframe group
        scene.remove(oldGroup);
        scene.remove(holoGroupOld);
        holoMatOld.dispose();

        // ── STEP 2: WIPE IN (New Model Materializes from Hologram Mesh to Solid)
        loadTargetModel(modelData, (newGroup) => {
          currentModelGroup = newGroup;
          updateCardUI(index);

          const newBox = new THREE.Box3().setFromObject(newGroup);
          const newMaxY = newBox.max.y + 0.3;
          const newMinY = newBox.min.y - 0.3;

          const planeSolidNew = new THREE.Plane(new THREE.Vector3(0, 1, 0), -newMaxY);
          const planeWireNew = new THREE.Plane(new THREE.Vector3(0, -1, 0), newMaxY);

          newGroup.traverse((child) => {
            if (child.isMesh && child.material) {
              if (Array.isArray(child.material)) {
                child.material.forEach(m => m.clippingPlanes = [planeSolidNew]);
              } else {
                child.material.clippingPlanes = [planeSolidNew];
              }
            }
          });

          // Holographic Wireframe Mesh for New Model
          const holoGroupNew = newGroup.clone(true);
          const holoMatNew = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            wireframe: true,
            transparent: true,
            opacity: 0.95,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            clippingPlanes: [planeWireNew]
          });
          holoGroupNew.traverse((child) => {
            if (child.isMesh) {
              child.material = holoMatNew;
              child.castShadow = false;
              child.receiveShadow = false;
            }
          });
          scene.add(holoGroupNew);

          const newScanObj = { y: newMaxY };

          gsap.to(newScanObj, {
            y: newMinY,
            duration: 0.42,
            ease: "power2.inOut",
            onUpdate: () => {
              planeSolidNew.constant = -newScanObj.y;
              planeWireNew.constant = newScanObj.y;
            },
            onComplete: () => {
              // Clean up new wireframe mesh & restore normal material rendering
              scene.remove(holoGroupNew);
              holoMatNew.dispose();

              newGroup.traverse((child) => {
                if (child.isMesh && child.material) {
                  if (Array.isArray(child.material)) {
                    child.material.forEach(m => m.clippingPlanes = []);
                  } else {
                    child.material.clippingPlanes = [];
                  }
                }
              });

              isTransitioning = false;
            }
          });
        });
      }
    });
  }

  function loadTargetModel(modelData, callback) {
    if (loadedModelsCache.has(modelData.id)) {
      const cachedScene = loadedModelsCache.get(modelData.id).clone();
      const group = displayModel(cachedScene);
      if (callback) callback(group);
      return;
    }

    gltfLoader.load(
      modelData.file,
      (gltf) => {
        const loadedScene = gltf.scene;
        loadedScene.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });

        loadedModelsCache.set(modelData.id, loadedScene);
        const group = displayModel(loadedScene.clone());
        if (callback) callback(group);
      },
      undefined,
      (error) => {
        console.error('Error loading 3D model:', error);
        if (callback) callback(null);
      }
    );
  }

  // Preload remaining 3D models quietly in background
  function preloadModels() {
    models.forEach((m) => {
      if (!loadedModelsCache.has(m.id)) {
        gltfLoader.load(m.file, (gltf) => {
          gltf.scene.traverse((child) => {
            if (child.isMesh) {
              child.castShadow = true;
              child.receiveShadow = true;
            }
          });
          loadedModelsCache.set(m.id, gltf.scene);
        });
      }
    });
  }

  function displayModel(modelScene) {
    const wrapperGroup = new THREE.Group();
    currentModelMesh = modelScene;
    wrapperGroup.add(modelScene);
    scene.add(wrapperGroup);

    frameModel(wrapperGroup, currentModelMesh);
    return wrapperGroup;
  }

  // Toolbar Button Handlers
  btnAutoRotate.addEventListener('click', () => {
    isAutoRotate = !isAutoRotate;
    controls.autoRotate = isAutoRotate;
    if (isAutoRotate) {
      btnAutoRotate.classList.add('active');
    } else {
      btnAutoRotate.classList.remove('active');
    }
  });

  btnReset.addEventListener('click', () => {
    if (currentModelGroup && currentModelMesh) {
      frameModel(currentModelGroup, currentModelMesh);
    }
  });

  // Window Resize Listener
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  // Render Loop
  function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
  }

  // Get initial model index from URL query parameter or hash
  function getInitialIndex() {
    const urlParams = new URLSearchParams(window.location.search);
    const modelParam = urlParams.get('model') || urlParams.get('id') || window.location.hash.replace('#', '');
    if (modelParam) {
      const foundIdx = models.findIndex(m => m.id.toLowerCase() === modelParam.toLowerCase());
      if (foundIdx !== -1) return foundIdx;
      const numIdx = parseInt(modelParam, 10) - 1;
      if (!isNaN(numIdx) && numIdx >= 0 && numIdx < models.length) return numIdx;
    }
    return 0;
  }

  // Initialize
  buildCarousel();
  switchModel(getInitialIndex());
  animate();
});
