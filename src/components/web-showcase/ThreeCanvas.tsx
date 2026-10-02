import { useEffect, useRef } from "react";
import * as THREE from "three";
import type { WebProject } from "../../data/webProjectsData";

interface ThreeCanvasProps {
  repeatedProjects: (WebProject & { uniqueId: string; originalIndex: number })[];
  velocityRef: React.MutableRefObject<number>;
  onCardClick?: (project: WebProject) => void;
  hoveredSlug: string | null;
}

const vertexShader = `
uniform float u_sheetW;     // Frustum half-width at z=0
uniform float u_sheetD;     // Wave amplitude in world units
uniform float u_sheetT;     // S-curve span across frame
uniform float u_sheetC;     // Curve blend (0 = bowl parabola, 1 = sine S)
uniform float u_sheetP;     // Strength (1 on carousel, eases to 0 on detail)
uniform float u_sheetV;     // Smoothed velocity magnitude (0..1)
uniform float u_leanA;      // Door lean signed depth
uniform float u_leanW;      // Frustum half-width for lean
uniform float u_hover;      // Pointer hover strength (0..1)
uniform float u_dent;       // Hover dent depth

varying vec2 vUv;
varying vec3 vWorld;

const float SHEET_PI = 3.141592653589793;
const float SHEET_BANK = -0.12;       // Gentle resting bank roll angle
const float SHEET_DIAG = 0.02;        // Subtle uphill shear
const float SHEET_TAIL = 0.9;         // Smooth Gaussian decay
const float SHEET_SHIFT = -0.15;      // Subtle crest shift left of center
const float SHEET_REAR_Y = 0.06;      // Velocity lift
const float SHEET_REAR_Z = 0.12;      // Velocity approach
const float SHEET_VTWIST = 0.8;       // Velocity edge wring

float sheetQ(float wx) {
    return (wx / max(u_sheetW, 0.0001)) * u_sheetT + SHEET_SHIFT;
}

float sheetShape(float q) {
    return mix(1.0 - q * q, sin(SHEET_PI * q), u_sheetC) * exp(-SHEET_TAIL * q * q);
}

float sheetShapeSlope(float q) {
    float g = exp(-SHEET_TAIL * q * q);
    float bowl = -2.0 * q * (1.0 + SHEET_TAIL * (1.0 - q * q));
    float ess = SHEET_PI * cos(SHEET_PI * q) - 2.0 * SHEET_TAIL * q * sin(SHEET_PI * q);
    return mix(bowl, ess, u_sheetC) * g;
}

float sheetZ(float wx) {
    return -u_sheetD * sheetShape(sheetQ(wx));
}

float sheetRoll(float wx) {
    if (u_sheetW < 0.001) return 0.0;
    return (SHEET_BANK * sheetShapeSlope(sheetQ(wx)) / SHEET_PI) * u_sheetC * u_sheetP;
}

vec4 sheetWind(vec4 w) {
    float a = sheetRoll(w.x);
    if (u_sheetV > 0.001 && u_sheetW > 0.001 && u_sheetP > 0.001) {
        float qe = w.x / u_sheetW;
        a += SHEET_VTWIST * u_sheetV * smoothstep(0.3, 0.9, abs(qe)) * sign(qe) * u_sheetP;
    }
    if (abs(a) < 0.0001) return w;
    float s = sin(a);
    float c = cos(a);
    return vec4(w.x, w.y * c - w.z * s, w.y * s + w.z * c, w.w);
}

float leanRamp(float s) {
    s = clamp(s, -1.0, 1.0);
    return s * (1.5 - 0.5 * s * s);
}

vec4 lean(vec4 w, float k) {
    if (u_leanW > 0.001 && k > 0.001) {
        w.z += u_leanA * leanRamp(w.x / u_leanW) * k;
    }
    return w;
}

float sheetDome(vec2 uv) {
    vec2 q = uv * 2.0 - 1.0;
    return (1.0 - q.x * q.x) * (1.0 - q.y * q.y);
}

void main() {
    vUv = uv;

    vec4 w = modelMatrix * vec4(position, 1.0);

    if (u_hover > 0.0001) {
        w.z -= u_hover * u_dent * sheetDome(uv);
    }

    w = sheetWind(w);
    w.z += sheetZ(w.x) * u_sheetP;

    if (u_sheetW > 0.001) {
        float qw = w.x / u_sheetW;
        w.y += SHEET_DIAG * w.x * u_sheetP;

        if (u_sheetV > 0.001) {
            float m = 1.0 - smoothstep(-1.0, 0.3, qw);
            w.y += SHEET_REAR_Y * u_sheetW * u_sheetV * m * u_sheetP;
            w.z += SHEET_REAR_Z * u_sheetW * u_sheetV * m * u_sheetP;
        }
    }

    w = lean(w, u_sheetP);

    vWorld = w.xyz;
    gl_Position = projectionMatrix * viewMatrix * w;
}
`;

const fragmentShader = `
uniform sampler2D u_texture;
uniform sampler2D u_hoverTex;
uniform vec2 u_res;         // Plane scale in world units
uniform vec2 u_size;        // Source texture resolution
uniform float u_alpha;
uniform float u_corner;     // Rounded corner radius normalized to height
uniform float u_hover;
uniform float u_dent;
uniform float u_sheetW;
uniform float u_sheetD;
uniform float u_sheetT;
uniform float u_sheetP;
uniform float u_sheetC;
uniform float u_leanA;
uniform float u_leanW;

varying vec2 vUv;
varying vec3 vWorld;

const float SHEET_PI = 3.141592653589793;
const float SHEET_BANK = -0.12;
const float SHEET_TAIL = 0.9;
const float SHEET_SHIFT = -0.15;

float sheetQ(float wx) {
    return (wx / max(u_sheetW, 0.0001)) * u_sheetT + SHEET_SHIFT;
}

float sheetShapeSlope(float q) {
    float g = exp(-SHEET_TAIL * q * q);
    float bowl = -2.0 * q * (1.0 + SHEET_TAIL * (1.0 - q * q));
    float ess = SHEET_PI * cos(SHEET_PI * q) - 2.0 * SHEET_TAIL * q * sin(SHEET_PI * q);
    return mix(bowl, ess, u_sheetC) * g;
}

float sheetRoll(float wx) {
    if (u_sheetW < 0.001) return 0.0;
    return (SHEET_BANK * sheetShapeSlope(sheetQ(wx)) / SHEET_PI) * u_sheetC * u_sheetP;
}

float leanSlope(float s) {
    s = min(abs(s), 1.0);
    return 1.5 * (1.0 - s * s);
}

vec3 calculateSheetNormal(float wx, vec2 uv, vec2 res) {
    float dzdx = 0.0;
    float dzdy = 0.0;

    if (u_sheetW > 0.001 && u_sheetP > 0.001 && u_sheetD > 0.001) {
        dzdx += -u_sheetD * sheetShapeSlope(sheetQ(wx)) * (u_sheetT / u_sheetW) * u_sheetP;
    }

    if (u_leanW > 0.001) {
        dzdx += (u_leanA / u_leanW) * leanSlope(wx / u_leanW) * u_sheetP;
    }

    if (u_hover > 0.0001) {
        vec2 q = uv * 2.0 - 1.0;
        float a = u_hover * u_dent;
        dzdx += 4.0 * a * res.y * q.x * (1.0 - q.y * q.y) / max(res.x, 0.0001);
        dzdy += 4.0 * a * q.y * (1.0 - q.x * q.x);
    }

    vec3 n = normalize(vec3(-dzdx, -dzdy, 1.0));

    float a = sheetRoll(wx);
    if (abs(a) > 0.0001) {
        float s = sin(a);
        float c = cos(a);
        n = vec3(n.x, n.y * c - n.z * s, n.y * s + n.z * c);
    }

    return n;
}

float roundedBoxSDF(vec2 p, vec2 b, float r) {
    vec2 d = abs(p) - b + vec2(r);
    return min(max(d.x, d.y), 0.0) + length(max(d, 0.0)) - r;
}

void main() {
    vec4 texNormal = texture2D(u_texture, vUv);
    vec4 texHover = texture2D(u_hoverTex, vUv);
    vec4 tex = mix(texNormal, texHover, u_hover);

    vec2 p = (vUv - 0.5) * u_res;
    float r = u_corner * u_res.y;
    float d = roundedBoxSDF(p, u_res * 0.5, r);
    float edgeAlpha = 1.0 - smoothstep(0.0, 1.5 / max(u_res.y, 1.0), d);

    vec3 n = calculateSheetNormal(vWorld.x, vUv, u_res);
    vec3 lightDir = normalize(vec3(-0.35, 0.8, 0.55));
    vec3 viewDir = normalize(vec3(0.0, 0.0, 1.0));
    vec3 halfVec = normalize(lightDir + viewDir);

    float lambert = max(dot(n, lightDir), 0.0) * 0.12;
    float spec = pow(max(dot(n, halfVec), 0.0), 28.0) * 0.35;
    float sheen = pow(1.0 - max(dot(n, viewDir), 0.0), 2.5) * 0.2;

    float depthFactor = clamp((vWorld.z + 3.0) / 6.0, 0.65, 1.0);

    vec3 col = tex.rgb * depthFactor + vec3(spec + sheen + lambert);

    gl_FragColor = vec4(col, tex.a * u_alpha * edgeAlpha);
}
`;

const floorVertexShader = `
uniform float u_leanA;
uniform float u_leanW;
varying vec2 vUv;
varying vec3 vWorld;

float leanRamp(float s) {
    s = clamp(s, -1.0, 1.0);
    return s * (1.5 - 0.5 * s * s);
}

void main() {
    vUv = uv;
    vec4 w = modelMatrix * vec4(position, 1.0);
    if (u_leanW > 0.001) {
        w.z += u_leanA * leanRamp(w.x / u_leanW);
    }
    vWorld = w.xyz;
    gl_Position = projectionMatrix * viewMatrix * w;
}
`;

const floorFragmentShader = `
uniform vec3 u_c0;
uniform vec3 u_c1;
uniform float u_alpha;
uniform vec2 u_gridF;
varying vec2 vUv;
varying vec3 vWorld;

void main() {
    vec2 g = abs(fract(vUv * u_gridF - 0.5) - 0.5) * 2.0;
    float line = max(smoothstep(0.92, 0.98, g.x), smoothstep(0.92, 0.98, g.y));
    float fade = smoothstep(0.0, 0.65, 1.0 - vUv.y);

    vec3 col = mix(u_c0, u_c1, line * 0.25);
    gl_FragColor = vec4(col, (line * 0.18 + 0.015) * u_alpha * fade);
}
`;

const createCardCanvasTexture = (image: HTMLImageElement, title: string, isHovered: boolean, aspectRatio = 1.7) => {
  const canvas = document.createElement("canvas");
  const w = 1600;
  const h = Math.round(w / aspectRatio);
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) return createPlaceholderTexture();

  const imgRatio = image.width / image.height;
  const canvasRatio = w / h;
  let sx = 0, sy = 0, sWidth = image.width, sHeight = image.height;
  if (imgRatio > canvasRatio) {
    sWidth = image.height * canvasRatio;
    sx = (image.width - sWidth) / 2;
  } else {
    sHeight = image.width / canvasRatio;
    sy = (image.height - sHeight) / 2;
  }
  ctx.drawImage(image, sx, sy, sWidth, sHeight, 0, 0, w, h);

  const scrim = ctx.createLinearGradient(0, h * 0.62, 0, h);
  scrim.addColorStop(0, "rgba(0, 0, 0, 0)");
  scrim.addColorStop(0.5, "rgba(0, 0, 0, 0.3)");
  scrim.addColorStop(1, "rgba(0, 0, 0, 0.7)");
  ctx.fillStyle = scrim;
  ctx.fillRect(0, h * 0.62, w, h * 0.38);

  ctx.save();
  ctx.font = "500 48px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";
  ctx.fillStyle = "#ffffff";
  ctx.shadowColor = "rgba(0, 0, 0, 0.8)";
  ctx.shadowBlur = 12;
  ctx.shadowOffsetY = 2;
  ctx.fillText(title, 55, h - 55);
  ctx.restore();

  const pillX = w - 80;
  const pillY = h - 72;
  const pillRadius = isHovered ? 40 : 35;

  ctx.save();
  ctx.beginPath();
  ctx.arc(pillX, pillY, pillRadius, 0, Math.PI * 2);

  if (isHovered) {
    ctx.fillStyle = "#ffffff";
    ctx.fill();
  } else {
    ctx.fillStyle = "rgba(0, 0, 0, 0.65)";
    ctx.fill();
    ctx.strokeStyle = "rgba(255, 255, 255, 0.25)";
    ctx.lineWidth = 2.5;
    ctx.stroke();
  }

  ctx.beginPath();
  ctx.strokeStyle = isHovered ? "#000000" : "#ffffff";
  ctx.lineWidth = isHovered ? 4.5 : 4;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  const sz = isHovered ? 16 : 13;
  ctx.moveTo(pillX - sz * 0.6, pillY + sz * 0.6);
  ctx.lineTo(pillX + sz * 0.6, pillY - sz * 0.6);
  ctx.moveTo(pillX + sz * 0.6 - sz * 0.8, pillY - sz * 0.6);
  ctx.lineTo(pillX + sz * 0.6, pillY - sz * 0.6);
  ctx.lineTo(pillX + sz * 0.6, pillY - sz * 0.6 + sz * 0.8);
  ctx.stroke();
  ctx.restore();

  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = false;
  return texture;
};

const createPlaceholderTexture = () => {
  const canvas = document.createElement("canvas");
  canvas.width = 2;
  canvas.height = 2;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    ctx.fillStyle = "#111111";
    ctx.fillRect(0, 0, 2, 2);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  return tex;
};

export default function ThreeCanvas({ repeatedProjects, velocityRef, hoveredSlug }: ThreeCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    let renderer: THREE.WebGLRenderer | undefined;
    let animationFrameId: number;

    try {
      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0x000000);

      const fov = 75;
      const camera = new THREE.PerspectiveCamera(
        fov,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
      );
      camera.position.set(0, 0, 27);

      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: "high-performance",
      });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      containerRef.current.appendChild(renderer.domElement);

      const cardGeometry = new THREE.PlaneGeometry(1, 1, 24, 24);
      const textureCache = new Map<string, { normal: THREE.Texture; hover: THREE.Texture }>();
      const placeholder = createPlaceholderTexture();

      const getCompositeTextures = (p: WebProject) => {
        if (!textureCache.has(p.slug)) {
          const entry = {
            normal: placeholder,
            hover: placeholder,
          };
          textureCache.set(p.slug, entry);

          const img = new Image();
          img.crossOrigin = "anonymous";
          img.src = p.image;
          img.onload = () => {
            const aspect = (p.width && p.height) ? (p.width / p.height) : (img.width / img.height);
            entry.normal = createCardCanvasTexture(img, p.title, false, aspect);
            entry.hover = createCardCanvasTexture(img, p.title, true, aspect);
          };
        }
        return textureCache.get(p.slug)!;
      };

      const cardMeshes: THREE.Mesh<THREE.PlaneGeometry, THREE.ShaderMaterial>[] = [];

      repeatedProjects.forEach((p) => {
        const texPair = getCompositeTextures(p);
        const sizeVec = new THREE.Vector2(p.width || 1920, p.height || 1080);

        const material = new THREE.ShaderMaterial({
          vertexShader,
          fragmentShader,
          uniforms: {
            u_texture: { value: texPair.normal },
            u_hoverTex: { value: texPair.hover },
            u_res: { value: new THREE.Vector2(1, 1) },
            u_size: { value: sizeVec },
            u_alpha: { value: 1.0 },
            u_corner: { value: 0.04 },
            u_hover: { value: 0.0 },
            u_dent: { value: 0.08 },
            u_sheetW: { value: 1.0 },
            u_sheetD: { value: 0.15 },
            u_sheetT: { value: 1.1 },
            u_sheetC: { value: 1.0 },
            u_sheetP: { value: 1.0 },
            u_sheetV: { value: 0.0 },
            u_leanA: { value: -0.06 },
            u_leanW: { value: 1.0 },
          },
          transparent: true,
          side: THREE.DoubleSide,
        });

        const mesh = new THREE.Mesh(cardGeometry, material);
        mesh.userData = { uniqueId: p.uniqueId, slug: p.slug, texPair };
        mesh.visible = false;
        scene.add(mesh);
        cardMeshes.push(mesh);
      });

      const floorGeo = new THREE.PlaneGeometry(1, 1, 32, 16);
      floorGeo.rotateX(-Math.PI / 2);
      const floorMat = new THREE.ShaderMaterial({
        vertexShader: floorVertexShader,
        fragmentShader: floorFragmentShader,
        uniforms: {
          u_c0: { value: new THREE.Color(0x000000) },
          u_c1: { value: new THREE.Color(0x333333) },
          u_alpha: { value: 0.8 },
          u_gridF: { value: new THREE.Vector2(40, 20) },
          u_leanA: { value: -0.06 },
          u_leanW: { value: 1.0 },
        },
        transparent: true,
        depthWrite: false,
      });
      const floorMesh = new THREE.Mesh(floorGeo, floorMat);
      scene.add(floorMesh);

      const calculateSheetParams = () => {
        const vFov = (camera.fov * Math.PI) / 180;
        const frustumHeight = 2 * Math.tan(vFov / 2) * camera.position.z;
        const frustumWidth = frustumHeight * camera.aspect;
        const halfW = frustumWidth / 2;

        return {
          W: halfW,
          H: frustumHeight / 2,
          D: halfW * 0.14,
          T: 1.1,
          C: 1.0,
          A: halfW * -0.06,
        };
      };

      const animate = () => {
        animationFrameId = requestAnimationFrame(animate);

        const ww = window.innerWidth;
        const wh = window.innerHeight;
        const sheet = calculateSheetParams();
        const currentVel = velocityRef?.current || 0;
        const smoothVel = Math.min(Math.abs(currentVel) / 250, 1.0);

        const vFov = (camera.fov * Math.PI) / 180;
        const frustumHeight = 2 * Math.tan(vFov / 2) * camera.position.z;
        const frustumWidth = frustumHeight * (ww / wh);

        floorMesh.scale.set(frustumWidth * 2.5, 1, frustumHeight * 2.5);
        floorMesh.position.set(0, -frustumHeight * 0.38, -frustumHeight * 0.4);
        floorMat.uniforms.u_leanA.value = sheet.A;
        floorMat.uniforms.u_leanW.value = sheet.W;

        cardMeshes.forEach((mesh) => {
          const domEl = document.querySelector(`[data-card-id="${mesh.userData.uniqueId}"]`);
          if (!domEl) {
            mesh.visible = false;
            return;
          }

          const rect = domEl.getBoundingClientRect();

          if (rect.right < -200 || rect.left > ww + 200) {
            mesh.visible = false;
            return;
          }

          mesh.visible = true;

          const scaleX = (rect.width / ww) * frustumWidth;
          const scaleY = (rect.height / wh) * frustumHeight;
          const posX = -frustumWidth / 2 + scaleX / 2 + (rect.left / ww) * frustumWidth;
          const posY = frustumHeight / 2 - scaleY / 2 - (rect.top / wh) * frustumHeight;

          mesh.scale.set(scaleX, scaleY, 1);
          mesh.position.set(posX, posY, 0);

          const u = mesh.material.uniforms;
          const pair = mesh.userData.texPair;
          if (u.u_texture.value !== pair.normal) {
            u.u_texture.value = pair.normal;
          }
          if (u.u_hoverTex.value !== pair.hover) {
            u.u_hoverTex.value = pair.hover;
          }

          u.u_res.value.set(scaleX, scaleY);
          u.u_sheetW.value = sheet.W;
          u.u_sheetD.value = sheet.D;
          u.u_sheetT.value = sheet.T;
          u.u_sheetC.value = sheet.C;
          u.u_sheetV.value = smoothVel;
          u.u_leanA.value = sheet.A;
          u.u_leanW.value = sheet.W;

          const isHovered = hoveredSlug === mesh.userData.slug;
          const targetHover = isHovered ? 1.0 : 0.0;
          u.u_hover.value += (targetHover - u.u_hover.value) * 0.15;
        });

        if (renderer) {
          renderer.render(scene, camera);
        }
      };

      animate();

      const handleResize = () => {
        const w = window.innerWidth;
        const h = window.innerHeight;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        if (renderer) {
          renderer.setSize(w, h);
        }
      };

      window.addEventListener("resize", handleResize);

      return () => {
        cancelAnimationFrame(animationFrameId);
        window.removeEventListener("resize", handleResize);
        if (containerRef.current && renderer?.domElement && renderer.domElement.parentNode === containerRef.current) {
          containerRef.current.removeChild(renderer.domElement);
        }
        renderer?.dispose();
      };
    } catch (e) {
      console.error("ThreeCanvas initialization error:", e);
    }
  }, [repeatedProjects, hoveredSlug, velocityRef]);

  return <div ref={containerRef} className="gl-canvas-container fixed inset-0 pointer-events-none z-10" />;
}
