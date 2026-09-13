import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { usePortfolio } from '../../context/PortfolioContext';

/**
 * Curated Catalog of 12 Core Technologies with Authentic RGB Brand Colors
 */
const TECH_CATALOG = [
  { 
    id: 'python', 
    name: 'Python', 
    category: 'AI & Data Science', 
    icon: 'python', 
    color: '#387EB8', 
    secondaryColor: '#FFC331', 
    bgTint: 'rgba(56, 126, 184, 0.20)', 
    borderGlow: 'rgba(255, 195, 49, 0.65)' 
  },
  { 
    id: 'react', 
    name: 'React 19', 
    category: 'Frontend UI', 
    icon: 'react', 
    color: '#61DAFB', 
    secondaryColor: '#61DAFB', 
    bgTint: 'rgba(97, 218, 251, 0.18)', 
    borderGlow: 'rgba(97, 218, 251, 0.70)' 
  },
  { 
    id: 'pytorch', 
    name: 'PyTorch', 
    category: 'Deep Learning', 
    icon: 'pytorch', 
    color: '#EE4C2C', 
    secondaryColor: '#FFA116', 
    bgTint: 'rgba(238, 76, 44, 0.18)', 
    borderGlow: 'rgba(238, 76, 44, 0.70)' 
  },
  { 
    id: 'typescript', 
    name: 'TypeScript', 
    category: 'Languages', 
    icon: 'typescript', 
    color: '#3178C6', 
    secondaryColor: '#FFFFFF', 
    bgTint: 'rgba(49, 120, 198, 0.20)', 
    borderGlow: 'rgba(49, 120, 198, 0.70)' 
  },
  { 
    id: 'nextjs', 
    name: 'Next.js', 
    category: 'Fullstack Web', 
    icon: 'nextjs', 
    color: '#F8FAFC', 
    secondaryColor: '#000000', 
    bgTint: 'rgba(248, 250, 252, 0.15)', 
    borderGlow: 'rgba(255, 255, 255, 0.65)' 
  },
  { 
    id: 'javascript', 
    name: 'JavaScript', 
    category: 'Core Web', 
    icon: 'javascript', 
    color: '#F7DF1E', 
    secondaryColor: '#000000', 
    bgTint: 'rgba(247, 223, 30, 0.18)', 
    borderGlow: 'rgba(247, 223, 30, 0.70)' 
  },
  { 
    id: 'docker', 
    name: 'Docker', 
    category: 'Containers', 
    icon: 'docker', 
    color: '#2496ED', 
    secondaryColor: '#2496ED', 
    bgTint: 'rgba(36, 150, 237, 0.18)', 
    borderGlow: 'rgba(36, 150, 237, 0.70)' 
  },
  { 
    id: 'fastapi', 
    name: 'FastAPI', 
    category: 'Microservices', 
    icon: 'fastapi', 
    color: '#059669', 
    secondaryColor: '#10B981', 
    bgTint: 'rgba(5, 150, 105, 0.18)', 
    borderGlow: 'rgba(16, 185, 129, 0.70)' 
  },
  { 
    id: 'sql', 
    name: 'PostgreSQL', 
    category: 'Databases', 
    icon: 'sql', 
    color: '#336791', 
    secondaryColor: '#60A5FA', 
    bgTint: 'rgba(51, 103, 145, 0.20)', 
    borderGlow: 'rgba(96, 165, 250, 0.70)' 
  },
  { 
    id: 'tailwind', 
    name: 'Tailwind CSS', 
    category: 'Modern Styling', 
    icon: 'tailwind', 
    color: '#38BDF8', 
    secondaryColor: '#38BDF8', 
    bgTint: 'rgba(56, 189, 248, 0.18)', 
    borderGlow: 'rgba(56, 189, 248, 0.70)' 
  },
  { 
    id: 'git', 
    name: 'Git', 
    category: 'Version Control', 
    icon: 'git', 
    color: '#F05032', 
    secondaryColor: '#F05032', 
    bgTint: 'rgba(240, 80, 50, 0.18)', 
    borderGlow: 'rgba(240, 80, 50, 0.70)' 
  },
  { 
    id: 'algorithms', 
    name: 'DSA & LeetCode', 
    category: 'Problem Solving', 
    icon: 'algo', 
    color: '#FFA116', 
    secondaryColor: '#FFA116', 
    bgTint: 'rgba(255, 161, 22, 0.20)', 
    borderGlow: 'rgba(255, 161, 22, 0.75)' 
  }
];

/**
 * Draw Authentic RGB Vector Tech Icons on HTML5 Canvas
 */
function drawTechIcon(ctx, tech, cx, cy, size, isDark) {
  ctx.save();
  ctx.translate(cx, cy);

  const s = size * 0.5;

  switch (tech.icon) {
    case 'python': {
      ctx.lineWidth = 3.8;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      // Blue upper serpent
      ctx.strokeStyle = '#387EB8';
      ctx.beginPath();
      ctx.arc(0, -s * 0.28, s * 0.48, Math.PI * 0.8, Math.PI * 2.1);
      ctx.lineTo(s * 0.38, 0);
      ctx.arc(0, s * 0.16, s * 0.28, 0, Math.PI * 0.6);
      ctx.stroke();

      // Yellow eye dot
      ctx.fillStyle = '#FFC331';
      ctx.beginPath();
      ctx.arc(-s * 0.2, -s * 0.38, 4, 0, Math.PI * 2);
      ctx.fill();

      // Yellow lower serpent
      ctx.strokeStyle = '#FFC331';
      ctx.beginPath();
      ctx.arc(0, s * 0.28, s * 0.48, Math.PI * -0.2, Math.PI * 1.1);
      ctx.lineTo(-s * 0.38, 0);
      ctx.arc(0, -s * 0.16, s * 0.28, Math.PI, Math.PI * 1.6);
      ctx.stroke();

      // Blue eye dot
      ctx.fillStyle = '#387EB8';
      ctx.beginPath();
      ctx.arc(s * 0.2, s * 0.38, 4, 0, Math.PI * 2);
      ctx.fill();
      break;
    }

    case 'react': {
      ctx.strokeStyle = '#61DAFB';
      ctx.fillStyle = '#61DAFB';
      ctx.lineWidth = 3.2;

      // Nucleus
      ctx.beginPath();
      ctx.arc(0, 0, s * 0.24, 0, Math.PI * 2);
      ctx.fill();

      // 3 Orbits
      for (let i = 0; i < 3; i++) {
        ctx.save();
        ctx.rotate((i * Math.PI) / 3);
        ctx.beginPath();
        ctx.ellipse(0, 0, s * 0.95, s * 0.36, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }
      break;
    }

    case 'pytorch': {
      ctx.strokeStyle = '#EE4C2C';
      ctx.fillStyle = '#EE4C2C';
      ctx.lineWidth = 3.6;
      ctx.beginPath();
      ctx.moveTo(0, -s * 0.95);
      ctx.bezierCurveTo(s * 0.65, -s * 0.3, s * 0.85, s * 0.45, 0, s * 0.9);
      ctx.bezierCurveTo(-s * 0.85, s * 0.45, -s * 0.65, -s * 0.3, 0, -s * 0.95);
      ctx.stroke();

      // Inner flame dot
      ctx.fillStyle = '#FFA116';
      ctx.beginPath();
      ctx.arc(s * 0.05, s * 0.28, s * 0.28, 0, Math.PI * 2);
      ctx.fill();
      break;
    }

    case 'typescript': {
      ctx.fillStyle = '#3178C6';
      ctx.beginPath();
      ctx.roundRect(-s * 0.8, -s * 0.8, s * 1.6, s * 1.6, 8);
      ctx.fill();

      ctx.fillStyle = '#FFFFFF';
      ctx.font = `bold ${Math.round(size * 0.52)}px "JetBrains Mono", monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('TS', 0, 2);
      break;
    }

    case 'javascript': {
      ctx.fillStyle = '#F7DF1E';
      ctx.beginPath();
      ctx.roundRect(-s * 0.8, -s * 0.8, s * 1.6, s * 1.6, 8);
      ctx.fill();

      ctx.fillStyle = '#000000';
      ctx.font = `bold ${Math.round(size * 0.52)}px "JetBrains Mono", monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('JS', 0, 2);
      break;
    }

    case 'nextjs': {
      ctx.fillStyle = isDark ? '#FFFFFF' : '#0F172A';
      ctx.strokeStyle = isDark ? '#FFFFFF' : '#0F172A';
      ctx.lineWidth = 4.2;
      ctx.beginPath();
      ctx.moveTo(-s * 0.55, s * 0.7);
      ctx.lineTo(-s * 0.55, -s * 0.7);
      ctx.lineTo(s * 0.38, s * 0.7);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(s * 0.55, -s * 0.7);
      ctx.lineTo(s * 0.55, s * 0.25);
      ctx.stroke();
      break;
    }

    case 'docker': {
      ctx.strokeStyle = '#2496ED';
      ctx.lineWidth = 3.4;
      ctx.strokeRect(-s * 0.6, -s * 0.35, s * 0.36, s * 0.32);
      ctx.strokeRect(-s * 0.18, -s * 0.35, s * 0.36, s * 0.32);
      ctx.strokeRect(s * 0.24, -s * 0.35, s * 0.36, s * 0.32);
      ctx.beginPath();
      ctx.moveTo(-s * 0.8, s * 0.15);
      ctx.quadraticCurveTo(0, s * 0.85, s * 0.8, s * 0.15);
      ctx.stroke();
      break;
    }

    case 'fastapi': {
      ctx.fillStyle = '#059669';
      ctx.beginPath();
      ctx.moveTo(s * 0.1, -s * 0.9);
      ctx.lineTo(-s * 0.5, 0.05);
      ctx.lineTo(s * 0.05, 0.05);
      ctx.lineTo(-s * 0.1, s * 0.9);
      ctx.lineTo(s * 0.5, -s * 0.05);
      ctx.lineTo(s * 0.05, -s * 0.05);
      ctx.closePath();
      ctx.fill();
      break;
    }

    case 'sql': {
      ctx.strokeStyle = '#336791';
      ctx.lineWidth = 3.4;
      for (let i = -1; i <= 1; i++) {
        ctx.beginPath();
        ctx.ellipse(0, i * s * 0.48, s * 0.72, s * 0.24, 0, 0, Math.PI * 2);
        ctx.stroke();
      }
      break;
    }

    case 'tailwind': {
      ctx.strokeStyle = '#38BDF8';
      ctx.lineWidth = 3.8;
      ctx.beginPath();
      ctx.arc(-s * 0.32, 0, s * 0.38, Math.PI * 0.5, Math.PI * 1.8);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(s * 0.22, 0, s * 0.38, Math.PI * 0.5, Math.PI * 1.8);
      ctx.stroke();
      break;
    }

    case 'git': {
      ctx.strokeStyle = '#F05032';
      ctx.fillStyle = '#F05032';
      ctx.lineWidth = 3.6;
      ctx.beginPath();
      ctx.moveTo(-s * 0.38, s * 0.55);
      ctx.lineTo(-s * 0.38, -s * 0.55);
      ctx.lineTo(s * 0.38, 0);
      ctx.stroke();
      [-s * 0.55, 0, s * 0.55].forEach((y, i) => {
        ctx.beginPath();
        const x = i === 1 ? s * 0.38 : -s * 0.38;
        ctx.arc(x, y, 5.5, 0, Math.PI * 2);
        ctx.fill();
      });
      break;
    }

    case 'algo': {
      ctx.strokeStyle = '#FFA116';
      ctx.fillStyle = '#FFA116';
      ctx.lineWidth = 4.0;
      ctx.beginPath();
      ctx.moveTo(-s * 0.6, -s * 0.6);
      ctx.lineTo(s * 0.3, 0);
      ctx.lineTo(-s * 0.6, s * 0.6);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(s * 0.55, s * 0.55, 4.5, 0, Math.PI * 2);
      ctx.fill();
      break;
    }

    default: {
      ctx.strokeStyle = tech.color;
      ctx.lineWidth = 3.6;
      ctx.beginPath();
      ctx.arc(0, 0, s * 0.7, 0, Math.PI * 2);
      ctx.stroke();
      break;
    }
  }

  ctx.restore();
}

/**
 * Generate High-Resolution Frosted Glass Card with RGB Brand Glow
 */
function createTechBadgeTexture(tech, isDark) {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 220;
  const ctx = canvas.getContext('2d');

  // Background Frosted Plate with subtle ambient depth
  const grad = ctx.createLinearGradient(0, 0, 512, 220);
  if (isDark) {
    grad.addColorStop(0, 'rgba(28, 30, 38, 0.94)');
    grad.addColorStop(1, 'rgba(14, 16, 22, 0.98)');
  } else {
    grad.addColorStop(0, 'rgba(255, 255, 255, 0.97)');
    grad.addColorStop(1, 'rgba(244, 246, 250, 0.99)');
  }
  ctx.fillStyle = grad;

  // Rounded card body (38px radius)
  ctx.beginPath();
  ctx.roundRect(8, 8, 496, 204, 38);
  ctx.fill();

  // Subtle brand color wash across card
  const tintGrad = ctx.createRadialGradient(80, 110, 10, 80, 110, 240);
  tintGrad.addColorStop(0, tech.bgTint);
  tintGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = tintGrad;
  ctx.beginPath();
  ctx.roundRect(8, 8, 496, 204, 38);
  ctx.fill();

  // Vibrant RGB Luminous Border
  ctx.lineWidth = 4.0;
  ctx.strokeStyle = isDark ? tech.borderGlow : tech.color;
  ctx.stroke();

  // Top specular gleam rim
  ctx.lineWidth = 1.8;
  ctx.strokeStyle = isDark ? 'rgba(255, 255, 255, 0.25)' : 'rgba(255, 255, 255, 0.9)';
  ctx.beginPath();
  ctx.roundRect(14, 14, 484, 192, 32);
  ctx.stroke();

  // Icon Badge Container Circle
  ctx.save();
  ctx.fillStyle = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(15, 23, 42, 0.05)';
  ctx.beginPath();
  ctx.arc(80, 110, 50, 0, Math.PI * 2);
  ctx.fill();
  ctx.lineWidth = 2.0;
  ctx.strokeStyle = tech.color;
  ctx.stroke();

  // Draw Vibrant RGB Tech Icon
  drawTechIcon(ctx, tech, 80, 110, 56, isDark);
  ctx.restore();

  // Tech Name Label (Bold & prominent)
  ctx.fillStyle = isDark ? '#ffffff' : '#0f172a';
  ctx.font = 'bold 42px "Plus Jakarta Sans", "Inter", sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(tech.name, 150, 92);

  // Category Tagline in authentic brand color
  ctx.fillStyle = tech.color;
  ctx.font = '700 20px "Space Grotesk", "JetBrains Mono", monospace';
  ctx.fillText(tech.category.toUpperCase(), 152, 140);

  // Status Indicator Dot in brand color
  ctx.save();
  ctx.fillStyle = tech.color;
  ctx.beginPath();
  ctx.arc(465, 45, 6.5, 0, Math.PI * 2);
  ctx.fill();

  // Outer halo ring
  ctx.lineWidth = 2.2;
  ctx.strokeStyle = tech.borderGlow;
  ctx.beginPath();
  ctx.arc(465, 45, 12, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();

  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = false;
  return texture;
}

export default function FloatingTechBackground() {
  const mountRef = useRef(null);
  const { isDarkMode } = usePortfolio();

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    let width = window.innerWidth;
    let height = window.innerHeight;

    // 1. Unified Scene & Perspective Camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(55, width / height, 0.1, 1000);
    camera.position.set(0, 0, 28);

    // 2. High-Performance WebGL Renderer (1.5 DPR capped to eliminate fillrate lag)
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 3. Ambient 3D Dust Particle Field (160 particles)
    const particleCount = 160;
    const particleGeometry = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
      particlePositions[i] = (Math.random() - 0.5) * 85;
      particlePositions[i + 1] = Math.random() * 85 - 65;
      particlePositions[i + 2] = (Math.random() - 0.5) * 40 - 5;
    }

    particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particleMaterial = new THREE.PointsMaterial({
      color: isDarkMode ? 0xffffff : 0x64748b,
      size: 0.32,
      transparent: true,
      opacity: isDarkMode ? 0.5 : 0.35
    });
    const particleField = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particleField);

    // 4. Pre-baked Shared Textures Pool
    const texturePool = TECH_CATALOG.map(tech => createTechBadgeTexture(tech, isDarkMode));

    // 6. Zero-Congestion, Non-Overlapping Spatial Layout
    const badgeGroup = new THREE.Group();
    scene.add(badgeGroup);

    const badgeDataList = [];
    const geometry = new THREE.PlaneGeometry(6.2, 2.68);
    const totalBadges = TECH_CATALOG.length; // 12 distinct badges

    for (let i = 0; i < totalBadges; i++) {
      const texture = texturePool[i];

      // Ultra-fast MeshBasicMaterial: zero PBR light overhead, silky 60+ FPS
      const material = new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
        opacity: 0.95,
        side: THREE.DoubleSide
      });

      const mesh = new THREE.Mesh(geometry, material);

      // Dedicated, Non-Overlapping Spatial Slots distributed across the portfolio sections
      const side = (i % 2 === 0) ? -1 : 1;
      const section = Math.floor(i / 2); // 0, 1, 2, 3, 4, 5

      // Section mapping down the page:
      // section 0 (Hero Top): y = 6.0
      // section 1 (Hero Bottom): y = -3.0
      // section 2 (DSA Analytics): y = -13.0
      // section 3 (Projects): y = -23.0
      // section 4 (Skills): y = -33.0
      // section 5 (Education / Manifesto): y = -43.0
      const sectionYMap = [6.0, -3.0, -13.0, -23.0, -33.0, -43.0];
      const posY = sectionYMap[section];

      // Wide lateral clearance: ±21.5 to ±23.5 (center |x| < 17 is wide open)
      const stagger = (section % 2 === 0) ? 0 : 2.0;
      const posX = side * (21.5 + stagger);

      // Distinct subtle depths
      const posZ = -1.5 + (section % 3) * 2.0;

      mesh.position.set(posX, posY, posZ);

      // Gentle initial angle
      mesh.rotation.x = (section % 2 === 0 ? 0.05 : -0.05);
      mesh.rotation.y = (side === -1 ? 0.08 : -0.08);
      mesh.rotation.z = (section % 2 === 0 ? -0.02 : 0.02);

      badgeGroup.add(mesh);

      badgeDataList.push({
        mesh,
        material,
        texture,
        baseX: posX,
        baseY: posY,
        baseZ: posZ,
        side,
        floatFreq: 0.55 + (section * 0.08),
        phase: section * 1.15 + (side === 1 ? 2.2 : 0.0)
      });
    }

    // 7. Smooth Mouse & Instant Scroll Tracking
    let targetMouseX = 0;
    let targetMouseY = 0;
    let currentMouseX = 0;
    let currentMouseY = 0;
    let targetScrollY = window.scrollY || 0;

    const handleMouseMove = (e) => {
      targetMouseX = (e.clientX / window.innerWidth - 0.5) * 2;
      targetMouseY = -(e.clientY / window.innerHeight - 0.5) * 2;
    };

    const handleScroll = () => {
      targetScrollY = window.scrollY || document.documentElement.scrollTop || 0;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('scroll', handleScroll, { passive: true });

    // 8. Window Resize Handling
    const handleResize = () => {
      if (!container) return;
      width = window.innerWidth;
      height = window.innerHeight;
      camera.aspect = width / height;
      camera.position.z = width < 1280 ? 36 : 32;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.25));
    };

    window.addEventListener('resize', handleResize);

    // 9. Silky Smooth 60 FPS Animation Loop - Moving Background with 1:1 Scroll Synchronization
    const clock = new THREE.Clock();
    let animId;
    let isVisible = true;

    const handleVisibilityChange = () => {
      isVisible = !document.hidden;
      if (isVisible) clock.start();
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    const animate = () => {
      animId = requestAnimationFrame(animate);

      if (!isVisible) return;

      const delta = Math.min(clock.getDelta(), 0.05);
      const elapsed = clock.getElapsedTime();

      // Smooth camera mouse follow with buttery damping
      currentMouseX += (targetMouseX - currentMouseX) * (delta * 3.0);
      currentMouseY += (targetMouseY - currentMouseY) * (delta * 3.0);

      // Seamless 1:1 Scroll Synchronization across entire page height
      const maxScroll = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
      const scrollFraction = Math.min(Math.max(targetScrollY / maxScroll, 0), 1);
      const scrollY3D = - (scrollFraction * 46.0);

      camera.position.x = currentMouseX * 2.0;
      camera.position.y = scrollY3D + (currentMouseY * 1.5);
      camera.position.z = width < 1280 ? 36 : 32;
      camera.lookAt(currentMouseX * 0.5, scrollY3D + (currentMouseY * 0.4), 0);

      // Particle field subtle orbit
      particleField.rotation.y = elapsed * 0.008;
      particleField.rotation.x = elapsed * 0.004;

      // Badges: Continuous Smooth Sinusoidal 3D Floating Motion & Tilting in their sections
      badgeDataList.forEach((badge) => {
        const waveY = Math.sin(elapsed * badge.floatFreq + badge.phase) * 0.65;
        const waveX = Math.cos(elapsed * 0.45 + badge.phase) * 0.35;

        badge.mesh.position.y = badge.baseY + waveY;
        badge.mesh.position.x = badge.baseX + waveX;

        badge.mesh.rotation.y = (badge.side === -1 ? 0.08 : -0.08) + Math.sin(elapsed * 0.35 + badge.phase) * 0.08;
        badge.mesh.rotation.x = Math.cos(elapsed * 0.3 + badge.phase) * 0.06;
        badge.mesh.rotation.z = Math.sin(elapsed * 0.25 + badge.phase) * 0.04;
      });

      renderer.render(scene, camera);
    };

    animate();

    // 10. Memory Cleanup on Unmount
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('visibilitychange', handleVisibilityChange);

      texturePool.forEach(tex => tex.dispose());
      badgeDataList.forEach(item => {
        item.material?.dispose();
      });

      geometry.dispose();
      particleGeometry.dispose();
      particleMaterial.dispose();
      renderer.dispose();

      if (container && renderer.domElement) {
        container.innerHTML = '';
      }
    };
  }, [isDarkMode]);

  return (
    <div
      ref={mountRef}
      className={`fixed inset-0 pointer-events-none z-0 overflow-hidden transition-colors duration-500 ${
        isDarkMode ? 'bg-[#000000]' : 'bg-[#f8fafc]'
      }`}
      aria-hidden="true"
    />
  );
}
