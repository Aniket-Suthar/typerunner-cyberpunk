import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function ThreeComboVisualizer({ streak = 0 }) {
  const mountRef = useRef(null);
  const meshRef = useRef(null);
  const materialRef = useRef(null);

  useEffect(() => {
    // 1. Setup Scene
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
    camera.position.z = 5;

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
      // Keep it small as it sits in the HUD
      renderer.setSize(120, 120);
      renderer.setPixelRatio(window.devicePixelRatio);
      
      if (mountRef.current) {
        mountRef.current.appendChild(renderer.domElement);
      }
    } catch (e) {
      console.warn('WebGLContextError: Could not initialize 3D HUD Visualizer.', e);
      return; // Gracefully abort visualizer boot
    }

    // 2. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0x00f0ff, 1.5);
    dirLight1.position.set(5, 5, 5);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0xff00e5, 1.5);
    dirLight2.position.set(-5, -5, -5);
    scene.add(dirLight2);

    // 3. Geometry (Octahedron crystal)
    const geometry = new THREE.OctahedronGeometry(1.2, 0); // Solid sharp crystal
    const material = new THREE.MeshPhysicalMaterial({
      color: 0x00f0ff,
      emissive: 0x00f0ff,
      emissiveIntensity: 0.2,
      roughness: 0.1,
      metalness: 0.9,
      transmission: 0.5,
      transparent: true,
      opacity: 0.9,
    });
    
    materialRef.current = material;
    const mesh = new THREE.Mesh(geometry, material);
    meshRef.current = mesh;
    scene.add(mesh);

    // Wireframe edge
    const edges = new THREE.EdgesGeometry(geometry);
    const line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.5 }));
    mesh.add(line);

    // 4. Animation loop
    let animationFrameId;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      if (renderer) renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      if (renderer) {
        if (mountRef.current && mountRef.current.contains(renderer.domElement)) {
          mountRef.current.removeChild(renderer.domElement);
        }
        renderer.dispose();
      }
      geometry.dispose();
      material.dispose();
    };
  }, []);

  // Update crystal spin and color based on streak
  useEffect(() => {
    if (!meshRef.current || !materialRef.current) return;
    
    // As streak goes up, color shifts towards red/orange and spin gets faster
    let targetColor = new THREE.Color(0x00f0ff);
    let targetEmissive = new THREE.Color(0x00f0ff);
    let spinSpeed = 0.01;

    if (streak >= 50) {
      targetColor.setHex(0xf43f5e); // Rose red
      targetEmissive.setHex(0xc81e3a);
      spinSpeed = 0.1;
    } else if (streak >= 30) {
      targetColor.setHex(0xf97316); // Orange
      targetEmissive.setHex(0xc2410c);
      spinSpeed = 0.06;
    } else if (streak >= 15) {
      targetColor.setHex(0xfbbf24); // Amber
      targetEmissive.setHex(0xd97706);
      spinSpeed = 0.03;
    } else if (streak > 0) {
      spinSpeed = 0.01 + (streak * 0.001);
    }

    // Assign the new spin inside a simple separate RAF attached to this effect
    let frameId;
    const updatePhysics = () => {
      frameId = requestAnimationFrame(updatePhysics);
      meshRef.current.rotation.y += spinSpeed;
      meshRef.current.rotation.x += spinSpeed * 0.5;
      
      // Lerp color smoothly
      materialRef.current.color.lerp(targetColor, 0.05);
      materialRef.current.emissive.lerp(targetEmissive, 0.05);
    };
    updatePhysics();

    return () => cancelAnimationFrame(frameId);
  }, [streak]);

  return (
    <div 
      ref={mountRef} 
      className="w-24 h-24 md:w-32 md:h-32 flex items-center justify-center drop-shadow-[0_0_15px_rgba(0,255,255,0.5)] transition-all duration-300"
    />
  );
}
