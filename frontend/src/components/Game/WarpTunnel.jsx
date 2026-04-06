import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Float } from '@react-three/drei';

function Stars({ count = 200, level = 1 }) {
  const mesh = useRef();
  const light = useRef();
  
  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      const x = (Math.random() - 0.5) * 50;
      const y = (Math.random() - 0.5) * 50;
      const z = (Math.random() - 0.5) * 100;
      temp.push({ x, y, z, speed: 0.1 + Math.random() * 0.4 });
    }
    return temp;
  }, [count]);

  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    const speedMultiplier = 1 + (level - 1) * 0.2;

    particles.forEach((p, i) => {
      p.z += p.speed * speedMultiplier;
      if (p.z > 20) p.z = -80;
      
      dummy.position.set(p.x, p.y, p.z);
      dummy.updateMatrix();
      mesh.current.setMatrixAt(i, dummy.matrix);
    });
    mesh.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={mesh} args={[null, null, count]}>
      <sphereGeometry args={[0.1, 8, 8]} />
      <meshBasicMaterial color="#ffffff" transparent opacity={0.6} />
    </instancedMesh>
  );
}

function GridFloor({ level = 1, accentColor = '#00f0ff' }) {
  const mesh = useRef();
  
  useFrame((state) => {
    const speed = 0.5 + (level - 1) * 0.1;
    mesh.current.material.uniforms.uTime.value = state.clock.elapsedTime * speed;
  });

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uColor: { value: new THREE.Color(accentColor) }
  }), [accentColor]);

  return (
    <mesh ref={mesh} rotation={[-Math.PI / 2, 0, 0]} position={[0, -8, -10]}>
      <planeGeometry args={[100, 100, 50, 50]} />
      <shaderMaterial
        transparent
        uniforms={uniforms}
        vertexShader={`
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `}
        fragmentShader={`
          varying vec2 vUv;
          uniform float uTime;
          uniform vec3 uColor;
          void main() {
            float grid = sin(vUv.y * 100.0 + uTime * 10.0);
            grid = step(0.98, grid);
            float alpha = grid * (1.0 - vUv.y);
            gl_FragColor = vec4(uColor, alpha * 0.3);
          }
        `}
      />
    </mesh>
  );
}

function Particlesystem({ particlesRef }) {
  const mesh = useRef();
  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame(() => {
    if (!particlesRef.current || !mesh.current) return;
    const parts = particlesRef.current;
    
    parts.forEach((p, i) => {
      // Map 2D screen coords to 3D space
      const x = (p.x / 100) * 40 - 20; 
      const y = -(p.y / 500) * 20 + 10;
      dummy.position.set(x, y, -5);
      dummy.scale.setScalar(p.size * 0.1 * p.life);
      dummy.updateMatrix();
      mesh.current.setMatrixAt(i, dummy.matrix);
    });
    
    mesh.current.count = parts.length;
    mesh.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={mesh} args={[null, null, 1000]}>
      <sphereGeometry args={[0.5, 8, 8]} />
      <meshBasicMaterial color="#00ff88" />
    </instancedMesh>
  );
}

function LaserSystem({ lasersRef, accentColor }) {
  const mesh = useRef();
  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame(() => {
    if (!lasersRef.current || !mesh.current) return;
    const lasers = lasersRef.current;
    
    lasers.forEach((l, i) => {
      const fromX = (l.fromLane / 3) * 40 - 13.33; // Rough lane mapping
      const toX = (l.toX / 600) * 40 - 20; // 600 is rough track width
      const toY = -(l.toY / 500) * 20 + 10;
      
      const dx = toX - fromX;
      const dy = toY - (-8); // Jet is at y ~ -8
      const dist = Math.sqrt(dx * dx + dy * dy);
      const angle = Math.atan2(dy, dx);
      
      dummy.position.set(fromX + dx / 2, -8 + dy / 2, -4);
      dummy.rotation.set(0, 0, angle);
      dummy.scale.set(dist, 0.1 * l.life, 1);
      dummy.updateMatrix();
      mesh.current.setMatrixAt(i, dummy.matrix);
    });
    
    mesh.current.count = lasers.length;
    mesh.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={mesh} args={[null, null, 10]}>
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial color={accentColor} transparent opacity={0.8} side={THREE.DoubleSide} />
    </instancedMesh>
  );
}

export default function WarpTunnel({ level = 1, accentColor = '#00f0ff', particlesRef, lasersRef }) {
  return (
    <div className="absolute inset-0 z-0">
      <Canvas camera={{ position: [0, 0, 10], fov: 60 }}>
        <color attach="background" args={['#030308']} />
        <fog attach="fog" args={['#030308', 5, 40]} />
        <ambientLight intensity={0.5} />
        
        <Stars count={300} level={level} />
        <GridFloor level={level} accentColor={accentColor} />
        
        {particlesRef && <Particlesystem particlesRef={particlesRef} />}
        {lasersRef && <LaserSystem lasersRef={lasersRef} accentColor={accentColor} />}
        
        <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
          <pointLight position={[0, 0, 5]} color={accentColor} intensity={2} distance={20} />
        </Float>
      </Canvas>
    </div>
  );
}
