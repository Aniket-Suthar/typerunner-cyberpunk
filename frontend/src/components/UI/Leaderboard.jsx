/**
 * Leaderboard Component
 * Single Responsibility: Displays saved high scores from localStorage.
 * Features neon-styled table with rank highlighting.
 */

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { StorageService } from '../../utils/storage';

const rankColors = ['#f0ff00', '#c0c0c0', '#cd7f32']; // Gold, Silver, Bronze

export default function Leaderboard({ onBack }) {
  const scores = useMemo(() => StorageService.getLeaderboard(), []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{
        background: 'radial-gradient(ellipse at center, rgba(10, 10, 15, 0.98), rgba(6, 6, 10, 0.99))',
        backdropFilter: 'blur(10px)',
      }}
    >
      <div className="w-full max-w-lg">
        {/* Title */}
        <motion.h2
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center font-orbitron text-3xl font-black tracking-wider mb-6"
          style={{
            color: '#ff00e5',
            textShadow: '0 0 20px rgba(255, 0, 229, 0.5)',
          }}
        >
          🏅 LEADERBOARD
        </motion.h2>

        {/* Score Table */}
        <div
          className="rounded-xl overflow-hidden mb-6"
          style={{
            border: '1px solid rgba(255, 0, 229, 0.2)',
            background: 'rgba(18, 18, 26, 0.8)',
          }}
        >
          {/* Header */}
          <div
            className="grid grid-cols-12 gap-2 px-4 py-2.5 font-orbitron text-xs tracking-wider uppercase"
            style={{
              background: 'rgba(255, 0, 229, 0.08)',
              borderBottom: '1px solid rgba(255, 0, 229, 0.15)',
              color: '#6a6a8a',
            }}
          >
            <span className="col-span-1">#</span>
            <span className="col-span-4">Player</span>
            <span className="col-span-3 text-right">Score</span>
            <span className="col-span-2 text-right">WPM</span>
            <span className="col-span-2 text-right">ACC</span>
          </div>

          {/* Rows */}
          {scores.length > 0 ? (
            scores.map((entry, index) => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="grid grid-cols-12 gap-2 px-4 py-3 font-mono text-sm transition-all duration-200 hover:bg-white/[0.03]"
                style={{
                  borderBottom: '1px solid rgba(255, 255, 255, 0.03)',
                  color: index < 3 ? rankColors[index] : '#8888aa',
                }}
              >
                <span className="col-span-1 font-bold">
                  {index === 0 ? '👑' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1}
                </span>
                <span className="col-span-4 truncate font-rajdhani font-semibold text-base"
                  style={{ color: index < 3 ? '#e0e0ff' : '#8888aa' }}>
                  {entry.name}
                </span>
                <span className="col-span-3 text-right font-bold"
                  style={{ color: '#00f0ff', textShadow: index === 0 ? '0 0 8px rgba(0, 240, 255, 0.5)' : 'none' }}>
                  {entry.score?.toLocaleString()}
                </span>
                <span className="col-span-2 text-right"
                  style={{ color: '#f0ff00' }}>
                  {entry.wpm}
                </span>
                <span className="col-span-2 text-right"
                  style={{ color: '#00ff88' }}>
                  {entry.accuracy}%
                </span>
              </motion.div>
            ))
          ) : (
            <div className="px-4 py-8 text-center font-rajdhani text-cyber-muted">
              No scores yet. Play a game to set the first record!
            </div>
          )}
        </div>

        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          onClick={onBack}
          className="w-full py-3 rounded-lg font-orbitron text-sm font-bold tracking-widest
            cursor-pointer transition-all duration-300 hover:scale-[1.02]"
          style={{
            background: 'rgba(106, 106, 138, 0.1)',
            border: '1px solid rgba(106, 106, 138, 0.3)',
            color: '#6a6a8a',
          }}
        >
          ◀ BACK
        </motion.button>
      </div>
    </motion.div>
  );
}
