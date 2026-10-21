/* ==========================================================================
   KYNETIQ SIGNATURE 3D FEATURE
   Restrained Matte Graphite Biomechanical Kinetic Sculpture with
   Acid-Lime Rim Edge Lighting & Pointer Responsiveness
   ========================================================================== */

import * as THREE from 'three';

export function initSignature3D(containerId = 'hero-3d-canvas-wrap') {
  const container = document.getElementById(containerId);
  if (!container) return;

  // Check prefers-reduced-motion
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    container.style.display = 'none';
    return;
  }

  // WebGL support check
  function isWebGLAvailable() {
    try {
      const canvas = document.createElement('canvas');
      return !!(window.WebGLRenderingContext && (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
    } catch {
      return false;
    }
  }

  if (!isWebGLAvailable()) {
    container.style.display = 'none';
    return;
  }

  let width = container.clientWidth || 480;
  let height = container.clientHeight || 480;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
  camera.position.z = 8.5;

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    container.appendChild(renderer.domElement);
  } catch {
    container.style.display = 'none';
    return;
  }

  // Create Sculptural Biomechanical Kinetic Geometry
  // A dual interlaced structure: outer faceted geodesic cage + inner smooth kinetic torus knot
  const knotGeo = new THREE.TorusKnotGeometry(1.85, 0.45, 128, 32, 2, 3);
  
  // Premium Matte Graphite PBR Material
  const graphiteMaterial = new THREE.MeshStandardMaterial({
    color: 0x181B1D,
    roughness: 0.38,
    metalness: 0.88,
    flatShading: false,
  });

  const sculpture = new THREE.Mesh(knotGeo, graphiteMaterial);
  scene.add(sculpture);

  // Outer orbital accent ring with wireframe
  const ringGeo = new THREE.IcosahedronGeometry(2.8, 1);
  const ringMaterial = new THREE.MeshBasicMaterial({
    color: 0xC8FF3D,
    wireframe: true,
    transparent: true,
    opacity: 0.12,
  });
  const orbitalRing = new THREE.Mesh(ringGeo, ringMaterial);
  scene.add(orbitalRing);

  // Lighting Rig:
  // 1. Ambient low fill for deep charcoal shadows
  const ambientLight = new THREE.AmbientLight(0x0e1113, 1.2);
  scene.add(ambientLight);

  // 2. Cool directional key light
  const keyLight = new THREE.DirectionalLight(0xf5f4f0, 1.4);
  keyLight.position.set(-4, 5, 4);
  scene.add(keyLight);

  // 3. Energetic Acid-Lime Rim Light (#C8FF3D) from edge/behind
  const limeRimLight = new THREE.DirectionalLight(0xC8FF3D, 4.2);
  limeRimLight.position.set(5, -2, -3);
  scene.add(limeRimLight);

  // 4. Subtle secondary accent point light
  const fillPoint = new THREE.PointLight(0x4A5258, 2, 10);
  fillPoint.position.set(0, -4, 2);
  scene.add(fillPoint);

  // Pointer Interaction
  let targetRotationX = 0;
  let targetRotationY = 0;
  let mouseX = 0;
  let mouseY = 0;

  function onPointerMove(e) {
    if (e.pointerType === 'touch') return;
    const rect = container.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    mouseX = (x / rect.width) * 2;
    mouseY = (y / rect.height) * 2;
    targetRotationY = mouseX * 0.4;
    targetRotationX = mouseY * 0.4;
  }

  window.addEventListener('pointermove', onPointerMove, { passive: true });

  // Handle Resize
  const resizeObserver = new ResizeObserver(() => {
    if (!container || !renderer) return;
    width = container.clientWidth;
    height = container.clientHeight;
    if (width === 0 || height === 0) return;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  });
  resizeObserver.observe(container);

  // Pause rendering when offscreen
  let isVisible = true;
  const observer = new IntersectionObserver(([entry]) => {
    isVisible = entry.isIntersecting;
  }, { threshold: 0.1 });
  observer.observe(container);

  // Animation Loop with Smooth Damping (Lerp)
  let animationFrameId;
  function animate() {
    animationFrameId = requestAnimationFrame(animate);

    if (!isVisible) return;

    // Slow ambient kinetic rotation
    sculpture.rotation.y += 0.0035;
    sculpture.rotation.x += 0.0018;

    orbitalRing.rotation.y -= 0.002;
    orbitalRing.rotation.z += 0.0015;

    // Smooth response to pointer
    sculpture.rotation.x += (targetRotationX - sculpture.rotation.x) * 0.04;
    sculpture.rotation.y += (targetRotationY - sculpture.rotation.y) * 0.04;

    renderer.render(scene, camera);
  }

  animate();

  // Cleanup handler
  return () => {
    cancelAnimationFrame(animationFrameId);
    window.removeEventListener('pointermove', onPointerMove);
    resizeObserver.disconnect();
    observer.disconnect();
    knotGeo.dispose();
    ringGeo.dispose();
    graphiteMaterial.dispose();
    ringMaterial.dispose();
    renderer.dispose();
  };
}
