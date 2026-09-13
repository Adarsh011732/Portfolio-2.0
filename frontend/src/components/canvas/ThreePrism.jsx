import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { usePortfolio } from '../../context/PortfolioContext';

/**
 * Original 3D Prism Component
 * Restored to original geometry: Icosahedron (1.8), Octahedron core (0.9), and single orbital ring (2.4)
 * with graceful rotation and smooth mouse parallax.
 */
export default function ThreePrism() {
  const containerRef = useRef(null);
  const { isDarkMode } = usePortfolio();

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let width = container.clientWidth || 600;
    let height = container.clientHeight || 600;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(70, width / height, 0.1, 1000);
    camera.position.z = 4.8;

    // High performance renderer with capped pixel ratio to eliminate fillrate lag
    const renderer = new THREE.WebGLRenderer({ 
      alpha: true, 
      antialias: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.25));
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Group for combined rotations & mouse follow
    const group = new THREE.Group();
    scene.add(group);

    // Theme-adaptive colors
    const primaryColor = isDarkMode ? 0xffffff : 0x0f172a;
    const coreColor = isDarkMode ? 0xffffff : 0x1e293b;
    const coreEmissive = isDarkMode ? 0x444444 : 0x0f172a;
    const ringColor = isDarkMode ? 0xffffff : 0x475569;

    // 1. Original Outer wireframe icosahedron (radius 1.8, detail 1)
    const outerGeo = new THREE.IcosahedronGeometry(1.8, 1);
    const outerMat = new THREE.MeshStandardMaterial({
      color: primaryColor,
      wireframe: true,
      transparent: true,
      opacity: isDarkMode ? 0.65 : 0.50,
      roughness: 0.1,
      metalness: 0.95
    });
    const outerPrism = new THREE.Mesh(outerGeo, outerMat);
    group.add(outerPrism);

    // 2. Original Inner glowing core (octahedron radius 0.9, detail 0)
    const innerGeo = new THREE.OctahedronGeometry(0.9, 0);
    const innerMat = new THREE.MeshPhongMaterial({
      color: coreColor,
      emissive: coreEmissive,
      shininess: 100,
      transparent: true,
      opacity: isDarkMode ? 0.85 : 0.75,
      wireframe: false
    });
    const innerCore = new THREE.Mesh(innerGeo, innerMat);
    group.add(innerCore);

    // 3. Original Single orbital ring (torus radius 2.4, tube 0.02)
    const ringGeo = new THREE.TorusGeometry(2.4, 0.022, 16, 100);
    const ringMat = new THREE.MeshBasicMaterial({
      color: ringColor,
      transparent: true,
      opacity: isDarkMode ? 0.40 : 0.28
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 3;
    group.add(ring);

    // 4. Lights (Optimized for 60 FPS performance)
    const ambientLight = new THREE.AmbientLight(0xffffff, isDarkMode ? 0.8 : 1.2);
    scene.add(ambientLight);

    const pointLight1 = new THREE.PointLight(primaryColor, isDarkMode ? 3.0 : 2.0, 50);
    pointLight1.position.set(5, 5, 5);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(isDarkMode ? 0xd4d4d8 : 0x64748b, isDarkMode ? 2.0 : 1.5, 50);
    pointLight2.position.set(-5, -5, 2);
    scene.add(pointLight2);

    // Mouse tracking with passive listener
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const handleMouseMove = (e) => {
      const rect = container.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      targetX = x * 1.5;
      targetY = -y * 1.5;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    // Responsive window resize
    const handleResize = () => {
      if (!container) return;
      width = container.clientWidth;
      height = container.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.25));
    };

    window.addEventListener('resize', handleResize);

    // Animation & visibility state declarations
    let animId;
    let isVisible = true;
    const handleVisibilityChange = () => {
      isVisible = !document.hidden;
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // IntersectionObserver to pause rendering when hero is scrolled out of view
    let isIntersecting = true;
    const observer = new IntersectionObserver(
      ([entry]) => {
        isIntersecting = entry.isIntersecting;
      },
      { threshold: 0 }
    );
    observer.observe(container);

    // Silky smooth animation loop
    function animate() {
      animId = requestAnimationFrame(animate);
      if (!isVisible || !isIntersecting) return;

      // Smooth mouse follow with damping
      mouseX += (targetX - mouseX) * 0.05;
      mouseY += (targetY - mouseY) * 0.05;

      // Original hypnotic rotation speeds
      outerPrism.rotation.x += 0.003;
      outerPrism.rotation.y += 0.005;

      innerCore.rotation.x -= 0.006;
      innerCore.rotation.y -= 0.004;

      ring.rotation.z += 0.002;

      // Original group transforms
      group.rotation.y = mouseX * 0.5;
      group.rotation.x = -mouseY * 0.5;
      group.position.x = mouseX * 0.3;
      group.position.y = mouseY * 0.3;

      renderer.render(scene, camera);
    }
    animate();

    return () => {
      cancelAnimationFrame(animId);
      observer.disconnect();
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('visibilitychange', handleVisibilityChange);

      outerGeo.dispose();
      outerMat.dispose();
      innerGeo.dispose();
      innerMat.dispose();
      ringGeo.dispose();
      ringMat.dispose();
      renderer.dispose();
      if (container && renderer.domElement) {
        container.innerHTML = '';
      }
    };
  }, [isDarkMode]);

  return (
    <div 
      ref={containerRef} 
      className="w-full h-full min-h-[440px] md:min-h-[620px] pointer-events-none flex items-center justify-center"
      aria-hidden="true"
    />
  );
}
