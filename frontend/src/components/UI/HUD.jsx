/**
 * HUD (Heads-Up Display) Component
 * Single Responsibility: Displays real-time game statistics overlay during gameplay.
 * Shows score, WPM, lives, streak, and level.
 */

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ThreeComboVisualizer from './ThreeComboVisualizer';

export default function HUD({ score, lives, maxLives, currentStreak, wpm, level, wordsCompleted, isMuted, onToggleMute }) {
  const [prevScore, setPrevScore] = useState(score);
  const [scorePopups, setScorePopups] = useState([]);
  const [livesFlash, setLivesFlash] = useState(false);

  // Score popup animation
  useEffect(() => {
    if (score > prevScore) {
      const diff = score - prevScore;
      const popup = {
        id: Date.now(),
        value: `+${diff}`,
      };
      setScorePopups((prev) => [...prev, popup]);
      setTimeout(() => {
        setScorePopups((prev) => prev.filter((p) => p.id !== popup.id));
      }, 800);
    }
    setPrevScore(score);
  }, [score, prevScore]);

  // Lives flash animation
  useEffect(() => {
    setLivesFlash(true);
    const t = setTimeout(() => setLivesFlash(false), 600);
    return () => clearTimeout(t);
  }, [lives]);

  return (
    <div className="relative w-full flex flex-col md:flex-row items-center justify-between px-2 md:px-4 py-2 md:py-3 z-20 gap-2 md:gap-0"
      style={{
        background: 'linear-gradient(180deg, rgba(10, 10, 15, 0.95), rgba(10, 10, 15, 0.7), transparent)',
        borderBottom: '1px solid rgba(0, 240, 255, 0.1)',
      }}
    >
      {/* 3D Combo Visualizer Background Element */}
      <div className="absolute right-0 top-12 md:top-8 pointer-events-none opacity-80 mix-blend-screen scale-75 md:scale-100 origin-right">
        <ThreeComboVisualizer streak={currentStreak} />
      </div>

      {/* Left: Score & Words */}
      <div className="flex items-center gap-2 md:gap-4 w-full md:w-auto justify-between md:justify-start">
        <div className="text-center md:text-left">
          <div className="hidden md:block text-xs font-orbitron text-cyber-muted tracking-widest uppercase">Score</div>
          <div className="relative">
            <motion.div
              key={score}
              initial={{ scale: 1.3 }}
              animate={{ scale: 1 }}
              className="text-2xl font-orbitron font-bold"
              style={{
                color: '#00f0ff',
                textShadow: '0 0 10px rgba(0, 240, 255, 0.5)',
              }}
            >
              {score.toLocaleString()}
            </motion.div>

            {/* Score Popups */}
            <AnimatePresence>
              {scorePopups.map((popup) => (
                <motion.div
                  key={popup.id}
                  initial={{ opacity: 1, y: 0, scale: 1 }}
                  animate={{ opacity: 0, y: -30, scale: 1.2 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.8 }}
                  className="absolute left-0 right-0 text-center font-bold font-rajdhani text-xl"
                  style={{
                    color: '#00ff88',
                    textShadow: '0 0 8px rgba(0, 255, 136, 0.6)',
                  }}
                >
                  {popup.value}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Center: Lives & Level */}
      <div className="flex items-center gap-4 md:gap-8 justify-between w-full md:w-auto">
        <div className="text-center">
          <div className="hidden md:block text-xs font-orbitron text-cyber-muted tracking-widest uppercase mb-1">Lives</div>
          <motion.div
            animate={{
              scale: livesFlash ? 1.2 : 1,
              color: livesFlash ? '#ff0040' : '#00f0ff',
            }}
            className="flex gap-1 md:gap-2 text-sm md:text-xl"
          >
            {[...Array(maxLives)].map((_, i) => (
              <span key={i} style={{ opacity: i < lives ? 1 : 0.2 }}>
                {i < lives ? '❤️' : '🖤'}
              </span>
            ))}
          </motion.div>
        </div>

        <div className="text-center px-4 md:px-8 py-1 md:py-2 rounded-lg border border-cyber-primary/30"
          style={{ background: 'rgba(0, 240, 255, 0.05)' }}
        >
          <div className="hidden md:block text-[10px] font-orbitron text-cyber-muted tracking-widest uppercase">Encryption Tier</div>
          <div className="text-lg md:text-2xl font-black font-orbitron"
            style={{
              color: '#00f0ff',
              textShadow: '0 0 10px rgba(0, 240, 255, 0.5)',
            }}
          >
            LVL {level}
          </div>
        </div>
      </div>

      {/* Right Section: Streak & Mute */}
      <div className="flex items-center gap-2 md:gap-6 justify-between w-full md:w-auto mt-2 md:mt-0">
        <div className="text-center md:text-right">
          <div className="hidden md:block text-xs font-orbitron text-cyber-muted tracking-widest uppercase mb-1">Streak Combo</div>
          <div className="flex items-center justify-end gap-2">
            <motion.span
              key={currentStreak}
              initial={{ scale: 1.5 }}
              animate={{ scale: 1 }}
              className="text-xl md:text-2xl font-orbitron font-bold"
              style={{
                color: currentStreak >= 5 ? '#ff00e5' : currentStreak >= 3 ? '#ff8800' : '#00ff88',
                textShadow: currentStreak >= 5
                  ? '0 0 10px rgba(255, 0, 229, 0.5)'
                  : '0 0 10px rgba(0, 255, 136, 0.3)',
              }}
            >
              {currentStreak}
            </motion.span>
            {currentStreak >= 3 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="text-base md:text-lg"
              >
                🔥
              </motion.span>
            )}
          </div>
        </div>

        {/* Mute Toggle */}
        <button
          onClick={onToggleMute}
          className="text-lg md:text-xl cursor-pointer transition-all duration-200 hover:scale-110"
          style={{
            filter: isMuted ? 'grayscale(1) opacity(0.4)' : 'none',
            background: 'none',
            border: 'none',
          }}
          title={isMuted ? 'Unmute' : 'Mute'}
        >
          {isMuted ? '🔇' : '🔊'}
        </button>
      </div>
    </div>
  );
}
