/**
 * FighterJet Component — v4 EVOLVED
 * Enhanced visuals: shield effect, energy wings, particle trail, holographic HUD overlay.
 * 4 tiers with dramatically different appearances.
 */

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

const JET_TIERS = {
  1: {
    name: 'Scout', width: 44, height: 52,
    bodyColor1: '#0d1b2a', bodyColor2: '#1b2838',
    accentColor: '#00f0ff', glowColor: 'rgba(0, 240, 255, 0.6)',
    wingSpan: 36, engines: 1, auraSize: 0, shieldRings: 0,
  },
  2: {
    name: 'Interceptor', width: 58, height: 62,
    bodyColor1: '#1a0a2e', bodyColor2: '#2d1b4e',
    accentColor: '#ff00e5', glowColor: 'rgba(255, 0, 229, 0.6)',
    wingSpan: 52, engines: 2, auraSize: 40, shieldRings: 1,
  },
  3: {
    name: 'Phantom', width: 68, height: 72,
    bodyColor1: '#2a1a00', bodyColor2: '#3d2b00',
    accentColor: '#f0ff00', glowColor: 'rgba(240, 255, 0, 0.6)',
    wingSpan: 62, engines: 3, auraSize: 60, shieldRings: 2,
  },
  4: {
    name: 'Overlord', width: 80, height: 82,
    bodyColor1: '#1a002a', bodyColor2: '#2e0044',
    accentColor: '#ff4400', glowColor: 'rgba(255, 68, 0, 0.7)',
    wingSpan: 74, engines: 4, auraSize: 90, shieldRings: 3,
  },
};

function getTier(level) {
  if (level <= 2) return 1;
  if (level <= 4) return 2;
  if (level <= 6) return 3;
  return 4;
}

export default function FighterJet({ lane, laneCount, trackHeight, level = 1 }) {
  const tier = getTier(level);
  const cfg = JET_TIERS[tier];
  const laneWidth = 100 / laneCount;
  const jetX = (lane * laneWidth) + (laneWidth / 2);

  const enginePositions = useMemo(() => {
    switch (cfg.engines) {
      case 1: return [{ x: 0, size: 14 }];
      case 2: return [{ x: -9, size: 12 }, { x: 9, size: 12 }];
      case 3: return [{ x: -14, size: 10 }, { x: 0, size: 15 }, { x: 14, size: 10 }];
      case 4: return [{ x: -18, size: 9 }, { x: -7, size: 13 }, { x: 7, size: 13 }, { x: 18, size: 9 }];
      default: return [{ x: 0, size: 14 }];
    }
  }, [cfg.engines]);

  // Trail particles for tier 3+
  const trailParticles = useMemo(() => {
    if (tier < 3) return [];
    return Array.from({ length: tier * 3 }).map((_, i) => ({
      id: i,
      offsetX: (Math.random() - 0.5) * 20,
      delay: i * 0.15,
      size: 2 + Math.random() * 3,
    }));
  }, [tier]);

  return (
    <motion.div
      className="absolute z-30 pointer-events-none"
      animate={{ left: `${jetX}%` }}
      transition={{ type: 'spring', stiffness: 400, damping: 22 }}
      style={{ bottom: '20px', transform: 'translateX(-50%)' }}
    >
      <div className="relative flex flex-col items-center">
        {/* Shield rings */}
        {Array.from({ length: cfg.shieldRings }).map((_, i) => (
          <motion.div
            key={`shield-${i}`}
            className="absolute rounded-full -z-5"
            style={{
              width: `${cfg.auraSize + i * 20}px`,
              height: `${cfg.auraSize + i * 20}px`,
              left: '50%', top: '50%',
              transform: 'translate(-50%, -50%)',
              border: `1px solid ${cfg.accentColor}${30 - i * 8}`,
              boxShadow: `0 0 ${8 + i * 4}px ${cfg.glowColor}`,
            }}
            animate={{
              rotate: i % 2 === 0 ? 360 : -360,
              scale: [0.9, 1.05, 0.9],
            }}
            transition={{
              rotate: { duration: 6 + i * 2, repeat: Infinity, ease: 'linear' },
              scale: { duration: 2, repeat: Infinity },
            }}
          />
        ))}

        {/* Outer glow aura */}
        {cfg.auraSize > 0 && (
          <motion.div
            className="absolute rounded-full -z-10"
            style={{
              width: `${cfg.auraSize * 2.2}px`, height: `${cfg.auraSize * 2.2}px`,
              left: '50%', top: '50%',
              transform: 'translate(-50%, -50%)',
              background: `radial-gradient(circle, ${cfg.glowColor}, transparent 65%)`,
              filter: 'blur(12px)',
            }}
            animate={{ opacity: [0.25, 0.5, 0.25], scale: [0.85, 1.15, 0.85] }}
            transition={{ duration: 2.5, repeat: Infinity }}
          />
        )}

        {/* Engine flames */}
        {enginePositions.map((eng, i) => (
          <motion.div
            key={i}
            className="absolute"
            style={{
              bottom: `-${eng.size + 6}px`,
              left: '50%', marginLeft: `${eng.x}px`,
              width: `${eng.size}px`, height: `${eng.size * 2.5}px`,
              transform: 'translateX(-50%)',
            }}
            animate={{ opacity: [0.7, 1, 0.7], scaleY: [1, 1.6, 1], scaleX: [1, 0.7, 1] }}
            transition={{ duration: 0.12 + i * 0.04, repeat: Infinity }}
          >
            <div style={{
              width: '100%', height: '100%',
              background: `linear-gradient(to bottom, #fff, ${cfg.accentColor}, ${cfg.accentColor}66, transparent)`,
              borderRadius: '0 0 50% 50%',
              filter: 'blur(2px)',
            }} />
          </motion.div>
        ))}

        {/* Particle trail (tier 3+) */}
        {trailParticles.map((p) => (
          <motion.div
            key={p.id}
            className="absolute rounded-full"
            style={{
              bottom: `-${20 + p.id * 5}px`,
              left: '50%', marginLeft: `${p.offsetX}px`,
              width: `${p.size}px`, height: `${p.size}px`,
              background: cfg.accentColor,
            }}
            animate={{
              y: [0, 40, 80],
              opacity: [0.6, 0.3, 0],
              scale: [1, 0.5, 0],
            }}
            transition={{
              duration: 0.8,
              repeat: Infinity,
              delay: p.delay,
            }}
          />
        ))}

        {/* SVG Fighter — tier-specific */}
        <svg
          width={cfg.width} height={cfg.height}
          viewBox={`0 0 ${cfg.width} ${cfg.height}`}
          fill="none"
          style={{ filter: `drop-shadow(0 0 8px ${cfg.accentColor})` }}
        >
          <defs>
            <linearGradient id={`body4-${tier}`} x1="50%" y1="0%" x2="50%" y2="100%">
              <stop offset="0%" stopColor={cfg.bodyColor1} />
              <stop offset="100%" stopColor={cfg.bodyColor2} />
            </linearGradient>
            <linearGradient id={`wing4-${tier}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={cfg.bodyColor2} />
              <stop offset="100%" stopColor={cfg.bodyColor1} />
            </linearGradient>
          </defs>

          {/* Fuselage */}
          <path
            d={`M${cfg.width/2} 2 L${cfg.width/2+5} ${cfg.height*0.3} L${cfg.width/2+7} ${cfg.height*0.55} L${cfg.width/2+5} ${cfg.height*0.8} L${cfg.width/2+2} ${cfg.height-2} L${cfg.width/2} ${cfg.height} L${cfg.width/2-2} ${cfg.height-2} L${cfg.width/2-5} ${cfg.height*0.8} L${cfg.width/2-7} ${cfg.height*0.55} L${cfg.width/2-5} ${cfg.height*0.3} Z`}
            fill={`url(#body4-${tier})`}
            stroke={cfg.accentColor}
            strokeWidth="1.5"
          />

          {/* Left wing */}
          <path
            d={`M${cfg.width/2-7} ${cfg.height*0.48} L${cfg.width/2-cfg.wingSpan/2} ${cfg.height*0.68} L${cfg.width/2-cfg.wingSpan/2+8} ${cfg.height*0.74} L${cfg.width/2-5} ${cfg.height*0.62} Z`}
            fill={`url(#wing4-${tier})`}
            stroke={cfg.accentColor}
            strokeWidth="1"
          />
          {/* Right wing */}
          <path
            d={`M${cfg.width/2+7} ${cfg.height*0.48} L${cfg.width/2+cfg.wingSpan/2} ${cfg.height*0.68} L${cfg.width/2+cfg.wingSpan/2-8} ${cfg.height*0.74} L${cfg.width/2+5} ${cfg.height*0.62} Z`}
            fill={`url(#wing4-${tier})`}
            stroke={cfg.accentColor}
            strokeWidth="1"
          />

          {/* Energy wing lines (tier 2+) */}
          {tier >= 2 && (
            <>
              <line x1={cfg.width/2-5} y1={cfg.height*0.52} x2={cfg.width/2-cfg.wingSpan/2+5} y2={cfg.height*0.68}
                stroke={cfg.accentColor} strokeWidth="0.5" opacity="0.5" />
              <line x1={cfg.width/2+5} y1={cfg.height*0.52} x2={cfg.width/2+cfg.wingSpan/2-5} y2={cfg.height*0.68}
                stroke={cfg.accentColor} strokeWidth="0.5" opacity="0.5" />
            </>
          )}

          {/* Cockpit glow */}
          <ellipse cx={cfg.width/2} cy={cfg.height*0.28} rx={tier>=3?6:4} ry={tier>=3?8:5.5}
            fill={cfg.accentColor} opacity="0.5" />
          <ellipse cx={cfg.width/2} cy={cfg.height*0.28} rx={tier>=3?3.5:2.5} ry={tier>=3?5:3.5}
            fill="#ffffff" opacity="0.85" />

          {/* Cannons (tier 2+) */}
          {tier >= 2 && (
            <>
              <rect x={cfg.width/2-cfg.wingSpan/2+3} y={cfg.height*0.58} width="2.5" height="12" rx="1" fill={cfg.accentColor} opacity="0.7" />
              <rect x={cfg.width/2+cfg.wingSpan/2-5.5} y={cfg.height*0.58} width="2.5" height="12" rx="1" fill={cfg.accentColor} opacity="0.7" />
            </>
          )}

          {/* Crown ornament (tier 4) */}
          {tier >= 4 && (
            <>
              <path d={`M${cfg.width/2} -2 L${cfg.width/2+4} 7 L${cfg.width/2} 5 L${cfg.width/2-4} 7 Z`}
                fill={cfg.accentColor} opacity="0.85" />
              <path d={`M${cfg.width/2-1} ${cfg.height*0.12} L${cfg.width/2} ${cfg.height*0.02} L${cfg.width/2+1} ${cfg.height*0.12} Z`}
                fill={cfg.accentColor} opacity="0.6" />
            </>
          )}

          {/* Tail fins */}
          <path d={`M${cfg.width/2-3} ${cfg.height*0.85} L${cfg.width/2-8} ${cfg.height} L${cfg.width/2-2} ${cfg.height*0.92} Z`}
            fill={cfg.accentColor} opacity="0.3" />
          <path d={`M${cfg.width/2+3} ${cfg.height*0.85} L${cfg.width/2+8} ${cfg.height} L${cfg.width/2+2} ${cfg.height*0.92} Z`}
            fill={cfg.accentColor} opacity="0.3" />
        </svg>

        {/* Tier badge */}
        <motion.div
          className="absolute -bottom-9 left-1/2 -translate-x-1/2 font-orbitron text-center whitespace-nowrap"
          style={{
            fontSize: '9px', color: cfg.accentColor,
            textShadow: `0 0 6px ${cfg.glowColor}`,
            letterSpacing: '0.12em',
          }}
          animate={{ opacity: [0.4, 0.8, 0.4] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          ◆ {cfg.name.toUpperCase()} ◆
        </motion.div>

        {/* Holographic targeting reticle (tier 3+) */}
        {tier >= 3 && (
          <motion.div
            className="absolute -top-12 left-1/2 -translate-x-1/2"
            animate={{ opacity: [0.3, 0.6, 0.3], y: [0, -3, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <div className="flex flex-col items-center" style={{ color: cfg.accentColor, opacity: 0.5 }}>
              <div className="text-xs font-mono">▽</div>
              <div style={{ width: '1px', height: '8px', background: cfg.accentColor, opacity: 0.3 }} />
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
