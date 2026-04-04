/**
 * WordEntity Component — v2
 * Fixed: removed `layout` prop that caused overlapping/jitter.
 * Uses CSS positioning directly instead of Framer Motion for Y movement.
 * Framer Motion only handles enter/exit animations.
 */

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

export default function WordEntity({ word, isTargeted, trackHeight }) {
  const { text, y, typedCount, lane } = word;

  // Calculate danger level based on Y position
  const dangerLevel = Math.min(Math.max(y, 0) / trackHeight, 1);

  // Split text into typed and untyped portions
  const letters = useMemo(() => {
    return text.split('').map((char, index) => ({
      char,
      isTyped: index < typedCount,
      index,
    }));
  }, [text, typedCount]);

  // Dynamic color based on danger level
  const borderColor = dangerLevel > 0.8
    ? '#ff0040'
    : dangerLevel > 0.6
      ? '#ff8800'
      : isTargeted
        ? '#00ff88'
        : '#00f0ff';

  const glowColor = dangerLevel > 0.8
    ? 'rgba(255, 0, 64, 0.6)'
    : dangerLevel > 0.6
      ? 'rgba(255, 136, 0, 0.4)'
      : isTargeted
        ? 'rgba(0, 255, 136, 0.5)'
        : 'rgba(0, 240, 255, 0.3)';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.3 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{
        scale: 1.8,
        opacity: 0,
        filter: 'blur(8px) brightness(3)',
        transition: { duration: 0.25 },
      }}
      className="absolute font-mono tracking-wider select-none pointer-events-none"
      style={{
        top: `${y}px`,
        left: `${(lane * 33.33) + 16.66}%`,
        transform: 'translateX(-50%)',
        zIndex: isTargeted ? 20 : 10,
        willChange: 'top',
      }}
    >
      {/* Word card container */}
      <div
        className="relative px-3 py-1.5 rounded-md"
        style={{
          background: `linear-gradient(135deg, rgba(8, 8, 14, 0.95), rgba(14, 14, 22, 0.95))`,
          border: `1.5px solid ${borderColor}`,
          boxShadow: `0 0 8px ${glowColor}, 0 0 20px ${glowColor}, inset 0 0 8px rgba(0,0,0,0.4)`,
          backdropFilter: 'blur(2px)',
          transition: 'border-color 0.2s, box-shadow 0.2s',
        }}
      >
        {/* Danger progress bar */}
        <div
          className="absolute bottom-0 left-0 h-0.5 rounded-b-md"
          style={{
            width: `${dangerLevel * 100}%`,
            background: dangerLevel > 0.8
              ? 'linear-gradient(90deg, #ff0040, #ff4444)'
              : dangerLevel > 0.6
                ? 'linear-gradient(90deg, #ff8800, #ffaa00)'
                : 'linear-gradient(90deg, #00f0ff, #00ff88)',
            transition: 'width 0.3s linear',
          }}
        />

        {/* Letters */}
        <div className="flex gap-px">
          {letters.map(({ char, isTyped, index }) => (
            <span
              key={index}
              style={{
                color: isTyped ? '#00ff88' : (isTargeted ? '#e0e0ff' : '#666688'),
                textShadow: isTyped
                  ? '0 0 6px #00ff88, 0 0 12px rgba(0, 255, 136, 0.5)'
                  : 'none',
                fontWeight: isTyped ? 700 : 500,
                fontSize: '1rem',
                letterSpacing: '0.04em',
                transition: 'color 0.1s, text-shadow 0.1s',
              }}
            >
              {char}
            </span>
          ))}
        </div>

        {/* Targeting crosshair indicator */}
        {isTargeted && (
          <motion.div
            className="absolute -top-1 -right-1 w-2 h-2 rounded-full"
            style={{ background: '#00ff88', boxShadow: '0 0 6px #00ff88, 0 0 12px rgba(0,255,136,0.5)' }}
            animate={{ scale: [1, 1.5, 1] }}
            transition={{ duration: 0.5, repeat: Infinity }}
          />
        )}

        {/* Targeting bracket indicators */}
        {isTargeted && (
          <>
            <div className="absolute -left-1 top-0 bottom-0 w-0.5" style={{ background: '#00ff88', boxShadow: '0 0 4px #00ff88' }} />
            <div className="absolute -right-1 top-0 bottom-0 w-0.5" style={{ background: '#00ff88', boxShadow: '0 0 4px #00ff88' }} />
          </>
        )}
      </div>

      {/* Motion trail */}
      <div
        className="absolute left-1/2 -translate-x-1/2 -z-10 rounded"
        style={{
          top: '-8px',
          width: '70%',
          height: '10px',
          background: `linear-gradient(to top, ${glowColor}, transparent)`,
          opacity: Math.min(dangerLevel + 0.1, 0.4),
          filter: 'blur(3px)',
        }}
      />
    </motion.div>
  );
}
