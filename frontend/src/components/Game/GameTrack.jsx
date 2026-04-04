/**
 * GameTrack Component — v4
 * Warp tunnel rings, holographic grid floor, dynamic aurora,
 * enhanced 3D perspective, and tier-evolving visuals.
 */

import React, { useMemo, useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Lane from './Lane';
import WordEntity from './WordEntity';
import FighterJet from './FighterJet';
import LaserBeam from './LaserBeam';

function getTier(level) {
  if (level <= 2) return 1;
  if (level <= 4) return 2;
  if (level <= 6) return 3;
  return 4;
}

const TIER_BG = {
  1: { gradient: '#030308, #06060d, #0a0a14, #0d0810', accent: '0, 240, 255', nebula: 'rgba(0, 240, 255, 0.04)', accentHex: '#00f0ff' },
  2: { gradient: '#080310, #0d061a, #130a22, #0d0810', accent: '255, 0, 229', nebula: 'rgba(255, 0, 229, 0.05)', accentHex: '#ff00e5' },
  3: { gradient: '#0a0800, #121000, #1a1600, #0d0a00', accent: '240, 255, 0', nebula: 'rgba(240, 255, 0, 0.04)', accentHex: '#f0ff00' },
  4: { gradient: '#100003, #1a0008, #0f0315, #0a0010', accent: '255, 68, 0', nebula: 'rgba(255, 68, 0, 0.05)', accentHex: '#ff4400' },
};

export default function GameTrack({
  activeWords,
  particles,
  lasers = [],
  isShaking,
  trackHeight,
  dangerZoneY,
  laneCount,
  targetWordId,
  jetLane,
  level = 1,
}) {
  const tier = getTier(level);
  const bg = TIER_BG[tier];
  const [levelFlash, setLevelFlash] = useState(false);
  const [prevLevel, setPrevLevel] = useState(level);

  useEffect(() => {
    if (level > prevLevel) {
      setLevelFlash(true);
      const t = setTimeout(() => setLevelFlash(false), 1200);
      setPrevLevel(level);
      return () => clearTimeout(t);
    }
    setPrevLevel(level);
  }, [level, prevLevel]);

  // 3-layer parallax star field
  const starLayers = useMemo(() => [
    ...Array.from({ length: 35 }).map((_, i) => ({
      id: `far-${i}`, left: `${Math.random() * 100}%`, size: 1 + Math.random(),
      opacity: 0.12 + Math.random() * 0.18, layer: 'far',
      animDuration: `${22 + Math.random() * 12}s`,
    })),
    ...Array.from({ length: 20 }).map((_, i) => ({
      id: `mid-${i}`, left: `${Math.random() * 100}%`, size: 1.5 + Math.random() * 1.5,
      opacity: 0.2 + Math.random() * 0.3, layer: 'mid',
      animDuration: `${13 + Math.random() * 7}s`,
    })),
    ...Array.from({ length: 10 }).map((_, i) => ({
      id: `near-${i}`, left: `${Math.random() * 100}%`, size: 2 + Math.random() * 2,
      opacity: 0.35 + Math.random() * 0.4, layer: 'near',
      animDuration: `${5 + Math.random() * 4}s`,
    })),
  ], []);

  // Speed lines
  const speedLines = useMemo(() => {
    const count = Math.min(8 + level * 6, 55);
    return Array.from({ length: count }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      height: `${15 + Math.random() * 40 + level * 4}px`,
      duration: `${Math.max(0.25, 0.9 - level * 0.04 + Math.random() * 0.3)}s`,
      delay: `${Math.random() * 2}s`,
      opacity: 0.03 + Math.random() * 0.08 + level * 0.01,
    }));
  }, [level]);

  // Warp tunnel rings — get more intense with tier
  const warpRings = useMemo(() => {
    const count = tier * 3;
    return Array.from({ length: count }).map((_, i) => ({
      id: i,
      delay: i * 0.8,
      size: 200 + i * 40,
    }));
  }, [tier]);

  // Nebula clouds
  const nebulaClouds = useMemo(() =>
    Array.from({ length: 5 }).map((_, i) => ({
      id: i,
      left: `${8 + i * 20}%`,
      top: `${5 + (i % 3) * 25}%`,
      width: 100 + Math.random() * 200,
      height: 70 + Math.random() * 120,
    })), []);

  return (
    <div className="relative w-full" style={{ perspective: '900px' }}>
      {/* ═══ Level-up WARP flash ═══ */}
      <AnimatePresence>
        {levelFlash && (
          <>
            <motion.div
              key="warp-flash"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.8, 0.4, 0] }}
              transition={{ duration: 1.2 }}
              className="absolute inset-0 z-50 rounded-xl pointer-events-none"
              style={{
                background: `radial-gradient(ellipse at 50% 90%, rgba(${bg.accent}, 0.5), transparent 60%)`,
              }}
            />
            {/* Expanding ring */}
            <motion.div
              key="warp-ring"
              initial={{ scale: 0.3, opacity: 1 }}
              animate={{ scale: 3, opacity: 0 }}
              transition={{ duration: 1 }}
              className="absolute bottom-20 left-1/2 -translate-x-1/2 z-50 pointer-events-none"
              style={{
                width: '200px', height: '100px',
                borderRadius: '50%',
                border: `3px solid rgba(${bg.accent}, 0.8)`,
                boxShadow: `0 0 30px rgba(${bg.accent}, 0.6), inset 0 0 30px rgba(${bg.accent}, 0.3)`,
              }}
            />
            <motion.div
              key="level-text-v4"
              initial={{ opacity: 0, scale: 4, y: 50 }}
              animate={{ opacity: [0, 1, 1, 0], scale: [4, 1, 1, 0.3], y: [50, 0, 0, -40] }}
              transition={{ duration: 1.2, times: [0, 0.2, 0.7, 1] }}
              className="absolute top-1/3 left-1/2 -translate-x-1/2 z-50 pointer-events-none"
            >
              <div className="text-center">
                <div
                  className="font-orbitron text-4xl font-black tracking-widest"
                  style={{
                    color: bg.accentHex,
                    textShadow: `0 0 30px ${bg.accentHex}, 0 0 60px ${bg.accentHex}80, 0 0 100px ${bg.accentHex}40`,
                  }}
                >
                  LEVEL {level}
                </div>
                <div
                  className="font-orbitron text-sm tracking-wider mt-1"
                  style={{ color: `rgba(${bg.accent}, 0.6)` }}
                >
                  {tier === 1 ? '▸ SCOUT' : tier === 2 ? '▸ INTERCEPTOR' : tier === 3 ? '▸ PHANTOM' : '▸ OVERLORD'}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ═══ 3D Track ═══ */}
      <div
        className={`relative w-full overflow-hidden rounded-xl ${isShaking ? 'screen-shake' : ''}`}
        style={{
          height: `${trackHeight}px`,
          background: `linear-gradient(180deg, ${bg.gradient})`,
          border: `1px solid rgba(${bg.accent}, 0.15)`,
          boxShadow: `inset 0 0 60px rgba(0, 0, 0, 0.6), 0 0 40px rgba(${bg.accent}, 0.06)`,
          transformStyle: 'preserve-3d',
          transform: 'rotateX(2.5deg)',
          transformOrigin: 'center bottom',
        }}
      >
        {/* Warp tunnel rings */}
        {warpRings.map((ring) => (
          <motion.div
            key={`warp-${ring.id}`}
            className="absolute left-1/2 pointer-events-none"
            style={{
              top: '50%',
              width: `${ring.size}px`,
              height: `${ring.size * 0.4}px`,
              borderRadius: '50%',
              border: `1px solid rgba(${bg.accent}, 0.04)`,
              transform: 'translate(-50%, -50%)',
            }}
            animate={{
              scale: [0.3, 1.8],
              opacity: [0.15, 0],
              y: [0, 150],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              delay: ring.delay,
              ease: 'linear',
            }}
          />
        ))}

        {/* Holographic grid floor lines */}
        {Array.from({ length: 10 }).map((_, i) => {
          const yPct = 20 + i * 8;
          const intensity = 0.01 + i * 0.005;
          return (
            <div
              key={`hgrid-${i}`}
              className="absolute left-0 right-0 pointer-events-none"
              style={{
                top: `${yPct}%`,
                height: '1px',
                background: `linear-gradient(90deg, transparent 5%, rgba(${bg.accent}, ${intensity}) 30%, rgba(${bg.accent}, ${intensity * 1.5}) 50%, rgba(${bg.accent}, ${intensity}) 70%, transparent 95%)`,
              }}
            />
          );
        })}

        {/* Parallax stars */}
        {starLayers.map((star) => (
          <div
            key={star.id}
            className="star-parallax absolute rounded-full"
            style={{
              left: star.left,
              width: `${star.size}px`,
              height: `${star.size}px`,
              background: star.layer === 'near' ? `rgb(${bg.accent})` : '#ffffff',
              opacity: star.opacity,
              '--star-speed': star.animDuration,
              animationDuration: star.animDuration,
              boxShadow: star.layer === 'near' ? `0 0 ${star.size * 3}px rgba(${bg.accent}, 0.5)` : 'none',
            }}
          />
        ))}

        {/* Nebula clouds */}
        {nebulaClouds.map((cloud) => (
          <motion.div
            key={cloud.id}
            className="absolute rounded-full pointer-events-none"
            style={{
              left: cloud.left, top: cloud.top,
              width: `${cloud.width}px`, height: `${cloud.height}px`,
              background: `radial-gradient(ellipse, ${bg.nebula}, transparent)`,
              filter: 'blur(20px)',
            }}
            animate={{
              x: [0, 25, -15, 0],
              opacity: [0.5, 1, 0.4, 0.5],
            }}
            transition={{ duration: 18 + cloud.id * 3, repeat: Infinity, ease: 'easeInOut' }}
          />
        ))}

        {/* Aurora bands — tier 2+ */}
        {tier >= 2 && (
          <motion.div
            className="absolute inset-0 pointer-events-none"
            animate={{
              background: [
                `linear-gradient(${45 + tier * 10}deg, transparent, rgba(${bg.accent}, 0.02), transparent, rgba(${bg.accent}, 0.01), transparent)`,
                `linear-gradient(${90 + tier * 10}deg, transparent, rgba(${bg.accent}, 0.03), transparent, rgba(${bg.accent}, 0.015), transparent)`,
                `linear-gradient(${45 + tier * 10}deg, transparent, rgba(${bg.accent}, 0.02), transparent, rgba(${bg.accent}, 0.01), transparent)`,
              ],
            }}
            transition={{ duration: 8, repeat: Infinity }}
          />
        )}

        {/* Speed lines */}
        {speedLines.map((line) => (
          <div
            key={line.id}
            className="speed-line"
            style={{
              left: line.left, height: line.height,
              '--duration': line.duration,
              animationDelay: line.delay,
              opacity: line.opacity,
              background: `linear-gradient(to bottom, transparent, rgba(${bg.accent}, 0.3), transparent)`,
            }}
          />
        ))}

        {/* Lane dividers */}
        {Array.from({ length: laneCount }).map((_, i) => (
          <Lane key={i} index={i} totalLanes={laneCount} trackHeight={trackHeight} />
        ))}

        {/* Danger zone */}
        <div
          className="absolute left-0 right-0 z-5"
          style={{
            top: `${dangerZoneY}px`, bottom: '0',
            background: 'linear-gradient(to top, rgba(255, 0, 64, 0.25), rgba(255, 0, 64, 0.05), transparent)',
            borderTop: '2px solid rgba(255, 0, 64, 0.5)',
            boxShadow: '0 -8px 40px rgba(255, 0, 64, 0.12)',
          }}
        >
          <motion.div
            className="absolute inset-0"
            animate={{ opacity: [0.15, 0.5, 0.15] }}
            transition={{ duration: 1, repeat: Infinity }}
            style={{ background: 'linear-gradient(to top, rgba(255, 0, 64, 0.15), transparent)' }}
          />
          <div
            className="absolute top-2 left-1/2 -translate-x-1/2 font-orbitron text-xs tracking-widest"
            style={{ color: 'rgba(255, 0, 64, 0.6)' }}
          >
            ▼ DANGER ZONE ▼
          </div>
        </div>

        {/* Active words */}
        <AnimatePresence>
          {activeWords.map((word) => (
            <WordEntity key={word.id} word={word} isTargeted={word.id === targetWordId} trackHeight={trackHeight} level={level} />
          ))}
        </AnimatePresence>

        {/* Laser beams */}
        <AnimatePresence>
          {lasers.map((laser) => (
            <LaserBeam key={laser.id} laser={laser} laneCount={laneCount} trackHeight={trackHeight} level={level} />
          ))}
        </AnimatePresence>

        {/* Fighter Jet */}
        <FighterJet lane={jetLane} laneCount={laneCount} trackHeight={trackHeight} level={level} />

        {/* Particles */}
        {particles.map((p) => (
          <div
            key={p.id}
            className="absolute rounded-full pointer-events-none"
            style={{
              left: `${p.x}px`, top: `${p.y}px`,
              width: `${p.size}px`, height: `${p.size}px`,
              background: p.color, opacity: p.life,
              boxShadow: `0 0 ${p.size * 3}px ${p.color}`,
              transform: `scale(${p.life})`,
            }}
          />
        ))}

        {/* Top vignette */}
        <div className="absolute top-0 left-0 right-0 h-16 z-10 pointer-events-none"
          style={{ background: `linear-gradient(to bottom, ${bg.gradient.split(',')[0].trim()}, transparent)` }}
        />
        {/* Bottom vignette */}
        <div className="absolute bottom-0 left-0 right-0 h-16 z-5 pointer-events-none"
          style={{ background: `linear-gradient(to top, ${bg.gradient.split(',')[0].trim()}dd, transparent)` }}
        />
        {/* Radial vignette */}
        <div className="absolute inset-0 pointer-events-none z-5" style={{
          background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.5) 100%)',
        }} />
      </div>
    </div>
  );
}
