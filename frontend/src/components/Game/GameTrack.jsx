import React, { useMemo, useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Lane from './Lane';
import WordEntity from './WordEntity';
import FighterJet from './FighterJet';
import WarpTunnel from './WarpTunnel';

function getTier(level) {
  if (level <= 2) return 1;
  if (level <= 4) return 2;
  if (level <= 6) return 3;
  return 4;
}

const TIER_BG = {
  1: { gradient: '#030308, #06060d, #0a0a14, #0d0810', accent: '0, 240, 255', accentHex: '#00f0ff' },
  2: { gradient: '#080310, #0d061a, #130a22, #0d0810', accent: '255, 0, 229', accentHex: '#ff00e5' },
  3: { gradient: '#0a0800, #121000, #1a1600, #0d0a00', accent: '240, 255, 0', accentHex: '#f0ff00' },
  4: { gradient: '#100003, #1a0008, #0f0315, #0a0010', accent: '255, 68, 0', accentHex: '#ff4400' },
};

export default function GameTrack({
  activeWords,
  particlesRef,
  lasersRef,
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
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ═══ 3D Track Overlay ═══ */}
      <div
        className={`relative w-full overflow-hidden rounded-xl ${isShaking ? 'screen-shake' : ''}`}
        style={{
          height: `${trackHeight}px`,
          border: `1px solid rgba(${bg.accent}, 0.15)`,
          boxShadow: `inset 0 0 60px rgba(0, 0, 0, 0.6), 0 0 40px rgba(${bg.accent}, 0.06)`,
          background: 'transparent',
          zIndex: 1
        }}
      >
        {/* Three.js Background Component */}
        <WarpTunnel level={level} accentColor={bg.accentHex} particlesRef={particlesRef} />

        {/* Lane dividers */}
        {Array.from({ length: laneCount }).map((_, i) => (
          <Lane key={i} index={i} totalLanes={laneCount} trackHeight={trackHeight} />
        ))}

        {/* Danger zone */}
        <div
          className="absolute left-0 right-0 z-5"
          style={{
            top: `${dangerZoneY}px`, bottom: '0',
            background: 'linear-gradient(to top, rgba(255, 0, 64, 0.2), transparent)',
            borderTop: '2px solid rgba(255, 0, 64, 0.5)',
          }}
        >
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

        {/* Fighter Jet */}
        <FighterJet lane={jetLane} laneCount={laneCount} trackHeight={trackHeight} level={level} />

        {/* Top vignette */}
        <div className="absolute top-0 left-0 right-0 h-16 z-10 pointer-events-none"
          style={{ background: `linear-gradient(to bottom, #030308, transparent)` }}
        />
        {/* Bottom vignette */}
        <div className="absolute bottom-0 left-0 right-0 h-16 z-5 pointer-events-none"
          style={{ background: `linear-gradient(to top, #030308dd, transparent)` }}
        />
      </div>
    </div>
  );
}
