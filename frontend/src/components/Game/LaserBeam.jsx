/**
 * LaserBeam Component — v3 EVOLVED
 * Laser evolves with jet tier:
 *   Tier 1: Single cyan beam
 *   Tier 2: Twin helix beam (cyan + pink)
 *   Tier 3: Plasma cannon (wide gold beam with shockwave)
 *   Tier 4: Omega Lance (rainbow beam with screen-wide flash)
 */

import React from 'react';
import { motion } from 'framer-motion';

function getTier(level) {
  if (level <= 2) return 1;
  if (level <= 4) return 2;
  if (level <= 6) return 3;
  return 4;
}

export default function LaserBeam({ laser, laneCount, trackHeight, level = 1 }) {
  const tier = getTier(level);
  const laneWidth = 100 / laneCount;
  const fromX = (laser.fromLane * laneWidth) + (laneWidth / 2);

  return (
    <motion.div
      className="absolute z-25 pointer-events-none"
      initial={{ opacity: 1 }}
      animate={{ opacity: 0 }}
      transition={{ duration: tier >= 3 ? 0.5 : 0.3, ease: 'easeOut' }}
      style={{
        left: `${fromX}%`,
        bottom: '50px',
        top: `${Math.max(laser.toY, 0)}px`,
        transform: 'translateX(-50%)',
      }}
    >
      {/* Tier 1: Single beam */}
      {tier === 1 && (
        <motion.div
          initial={{ scaleY: 1, scaleX: 1 }}
          animate={{ scaleY: 0.2, scaleX: 0.5 }}
          transition={{ duration: 0.3 }}
          style={{
            width: '4px',
            height: '100%',
            margin: '0 auto',
            background: 'linear-gradient(to top, #00ff88, #00f0ff)',
            boxShadow: '0 0 8px #00ff88, 0 0 20px rgba(0, 240, 255, 0.5)',
            borderRadius: '2px',
            transformOrigin: 'bottom center',
          }}
        />
      )}

      {/* Tier 2: Twin helix */}
      {tier === 2 && (
        <div className="relative w-full h-full flex justify-center">
          <motion.div
            initial={{ scaleY: 1, rotate: 0 }}
            animate={{ scaleY: 0.1, rotate: 180 }}
            transition={{ duration: 0.35 }}
            style={{
              position: 'absolute',
              width: '3px',
              height: '100%',
              left: 'calc(50% - 4px)',
              background: 'linear-gradient(to top, #00ff88, #00f0ff)',
              boxShadow: '0 0 6px #00f0ff, 0 0 16px rgba(0, 240, 255, 0.4)',
              borderRadius: '2px',
              transformOrigin: 'bottom center',
            }}
          />
          <motion.div
            initial={{ scaleY: 1, rotate: 0 }}
            animate={{ scaleY: 0.1, rotate: -180 }}
            transition={{ duration: 0.35 }}
            style={{
              position: 'absolute',
              width: '3px',
              height: '100%',
              left: 'calc(50% + 1px)',
              background: 'linear-gradient(to top, #ff00e5, #ff66f0)',
              boxShadow: '0 0 6px #ff00e5, 0 0 16px rgba(255, 0, 229, 0.4)',
              borderRadius: '2px',
              transformOrigin: 'bottom center',
            }}
          />
        </div>
      )}

      {/* Tier 3: Plasma cannon */}
      {tier === 3 && (
        <div className="relative w-full h-full flex justify-center">
          <motion.div
            initial={{ scaleY: 1, scaleX: 1 }}
            animate={{ scaleY: 0.1, scaleX: 2 }}
            transition={{ duration: 0.45 }}
            style={{
              width: '8px',
              height: '100%',
              margin: '0 auto',
              background: 'linear-gradient(to top, #fff, #f0ff00, #ff8800)',
              boxShadow: '0 0 12px #f0ff00, 0 0 30px rgba(240, 255, 0, 0.5), 0 0 60px rgba(255, 136, 0, 0.3)',
              borderRadius: '4px',
              transformOrigin: 'bottom center',
            }}
          />
          {/* Shockwave ring at impact */}
          <motion.div
            initial={{ scale: 0, opacity: 1 }}
            animate={{ scale: 4, opacity: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="absolute top-0 left-1/2 -translate-x-1/2"
            style={{
              width: '30px',
              height: '30px',
              borderRadius: '50%',
              border: '2px solid #f0ff00',
              boxShadow: '0 0 15px #f0ff00',
            }}
          />
        </div>
      )}

      {/* Tier 4: Omega Lance */}
      {tier === 4 && (
        <div className="relative w-full h-full flex justify-center">
          {/* Central beam */}
          <motion.div
            initial={{ scaleY: 1, scaleX: 1 }}
            animate={{ scaleY: 0.05, scaleX: 3 }}
            transition={{ duration: 0.5 }}
            style={{
              width: '12px',
              height: '100%',
              margin: '0 auto',
              background: 'linear-gradient(to top, #fff, #ff4400, #ff00e5, #00f0ff)',
              boxShadow: '0 0 15px #ff4400, 0 0 40px rgba(255, 68, 0, 0.6), 0 0 80px rgba(255, 0, 229, 0.3)',
              borderRadius: '6px',
              transformOrigin: 'bottom center',
            }}
          />
          {/* Double shockwave */}
          <motion.div
            initial={{ scale: 0, opacity: 1 }}
            animate={{ scale: 6, opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="absolute top-0 left-1/2 -translate-x-1/2"
            style={{
              width: '40px', height: '40px',
              borderRadius: '50%',
              border: '3px solid #ff4400',
              boxShadow: '0 0 20px #ff4400, 0 0 40px rgba(255, 0, 229, 0.5)',
            }}
          />
          <motion.div
            initial={{ scale: 0, opacity: 1 }}
            animate={{ scale: 8, opacity: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="absolute top-0 left-1/2 -translate-x-1/2"
            style={{
              width: '30px', height: '30px',
              borderRadius: '50%',
              border: '2px solid #00f0ff',
              boxShadow: '0 0 15px #00f0ff',
            }}
          />
          {/* Screen flash */}
          <motion.div
            initial={{ opacity: 0.3 }}
            animate={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 pointer-events-none"
            style={{ background: 'rgba(255, 68, 0, 0.08)' }}
          />
        </div>
      )}

      {/* Impact flash at target (all tiers) */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: [0, tier >= 3 ? 3 : 2, 0] }}
        transition={{ duration: 0.3 }}
        className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2"
        style={{
          width: `${16 + tier * 4}px`,
          height: `${16 + tier * 4}px`,
          borderRadius: '50%',
          background: `radial-gradient(circle, #fff, ${tier >= 3 ? '#f0ff00' : '#00ff88'}, transparent)`,
          boxShadow: `0 0 ${10 + tier * 5}px ${tier >= 3 ? '#f0ff00' : '#00ff88'}`,
        }}
      />
    </motion.div>
  );
}
