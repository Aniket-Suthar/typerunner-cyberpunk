/**
 * MainMenu Component
 * Single Responsibility: Start screen with player name input and game start button.
 * Features cyberpunk glitch text title and neon-styled UI elements.
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useGameContext } from '../../context/GameContext';

export default function MainMenu({ onStart }) {
  const { actions } = useGameContext();
  const [name, setName] = useState('');
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  const handleStart = () => {
    const playerName = name.trim() || 'ANONYMOUS';
    actions.setPlayerName(playerName);
    onStart?.();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && name.trim()) {
      handleStart();
    }
  };

  return (
    <div className="relative w-full h-[100dvh] overflow-y-auto overflow-x-hidden flex flex-col items-center justify-start md:justify-center px-4 py-8 md:py-4 z-10 custom-scrollbar">
      {/* Decorative circles */}
      <div
        className="absolute w-64 md:w-96 h-64 md:h-96 rounded-full opacity-10 blur-3xl pointer-events-none"
        style={{
          top: '10%',
          left: '20%',
          background: 'radial-gradient(circle, #00f0ff, transparent)',
        }}
      />
      <div
        className="absolute w-48 md:w-80 h-48 md:h-80 rounded-full opacity-10 blur-3xl pointer-events-none"
        style={{
          bottom: '15%',
          right: '15%',
          background: 'radial-gradient(circle, #ff00e5, transparent)',
        }}
      />

      {/* Title */}
      <motion.div
        initial={{ opacity: 0, y: -40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="mb-2 md:mb-4 text-center shrink-0"
      >
        <h1
          className="glitch-text font-orbitron text-5xl md:text-7xl lg:text-8xl font-black tracking-wider"
          data-text="TYPE"
          style={{
            color: '#00f0ff',
            textShadow: '0 0 20px rgba(0, 240, 255, 0.5), 0 0 40px rgba(0, 240, 255, 0.2)',
            lineHeight: 1,
          }}
        >
          TYPE
        </h1>
        <h1
          className="font-orbitron text-4xl md:text-6xl lg:text-7xl font-black tracking-wider -mt-1 md:-mt-2"
          style={{
            color: '#ff00e5',
            textShadow: '0 0 20px rgba(255, 0, 229, 0.5), 0 0 40px rgba(255, 0, 229, 0.2)',
            lineHeight: 1,
          }}
        >
          RUNNER
        </h1>
      </motion.div>

      {/* Subtitle */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.6 }}
        className="font-rajdhani text-sm md:text-lg text-cyber-muted tracking-widest uppercase mb-6 md:mb-10 text-center px-4"
      >
        ⚡ Type fast. Stay alive. Break records. ⚡
      </motion.p>

      {/* Name Input */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.5 }}
        className="w-full max-w-xs md:max-w-sm mb-6 shrink-0"
      >
        <label
          className="block text-xs font-orbitron text-cyber-muted tracking-widest uppercase mb-2 text-center"
          htmlFor="player-name-input"
        >
          Enter Player Handle
        </label>
        <input
          id="player-name-input"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value.toUpperCase())}
          onKeyDown={handleKeyDown}
          maxLength={16}
          placeholder="ANONYMOUS"
          className="typing-input-glow w-full px-4 py-3 rounded-lg font-mono text-base md:text-lg tracking-wider text-center
            bg-cyber-darker border-2 border-cyber-border text-cyber-text
            focus:border-cyber-primary focus:outline-none
            placeholder:text-cyber-muted/30 transition-all duration-300"
          autoFocus
        />
      </motion.div>

      {/* Start Button */}
      <motion.button
        id="start-game-btn"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.8, duration: 0.4 }}
        whileHover={{
          scale: 1.05,
          boxShadow: '0 0 20px #00f0ff, 0 0 40px rgba(0, 240, 255, 0.3)',
        }}
        whileTap={{ scale: 0.95 }}
        onClick={handleStart}
        className="relative px-8 md:px-12 py-3 md:py-4 rounded-lg font-orbitron text-lg md:text-xl font-bold tracking-widest
          cursor-pointer transition-all duration-300 overflow-hidden shrink-0"
        style={{
          background: 'linear-gradient(135deg, rgba(0, 240, 255, 0.15), rgba(255, 0, 229, 0.15))',
          border: '2px solid #00f0ff',
          color: '#00f0ff',
          boxShadow: '0 0 10px rgba(0, 240, 255, 0.2)',
        }}
      >
        {/* Button shimmer effect */}
        <motion.div
          className="absolute inset-0"
          animate={{
            background: [
              'linear-gradient(90deg, transparent 0%, rgba(0, 240, 255, 0.1) 50%, transparent 100%)',
              'linear-gradient(90deg, transparent 100%, rgba(0, 240, 255, 0.1) 150%, transparent 200%)',
            ],
          }}
          transition={{ duration: 2, repeat: Infinity }}
        />
        <span className="relative z-10">▶ ENGAGE</span>
      </motion.button>

      {/* Instructions */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.6 }}
        className="mt-6 md:mt-10 max-w-xs md:max-w-md text-center w-full shrink-0 mb-8 md:mb-0"
      >
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 md:gap-4 text-center">
          <div className="p-2 md:p-3 rounded-lg flex flex-row sm:flex-col items-center sm:justify-start gap-2 sm:gap-0" style={{ background: 'rgba(0, 240, 255, 0.05)', border: '1px solid rgba(0, 240, 255, 0.1)' }}>
            <div className="text-xl md:text-2xl sm:mb-1">⌨️</div>
            <p className="text-[10px] md:text-xs font-rajdhani text-cyber-muted text-left sm:text-center flex-1">Type the words before they reach danger.</p>
          </div>
          <div className="p-2 md:p-3 rounded-lg flex flex-row sm:flex-col items-center sm:justify-start gap-2 sm:gap-0" style={{ background: 'rgba(255, 0, 229, 0.05)', border: '1px solid rgba(255, 0, 229, 0.1)' }}>
            <div className="text-xl md:text-2xl sm:mb-1">💔</div>
            <p className="text-[10px] md:text-xs font-rajdhani text-cyber-muted text-left sm:text-center flex-1">3 misses and it's game over.</p>
          </div>
          <div className="p-2 md:p-3 rounded-lg flex flex-row sm:flex-col items-center sm:justify-start gap-2 sm:gap-0" style={{ background: 'rgba(0, 255, 136, 0.05)', border: '1px solid rgba(0, 255, 136, 0.1)' }}>
            <div className="text-xl md:text-2xl sm:mb-1">🔥</div>
            <p className="text-[10px] md:text-xs font-rajdhani text-cyber-muted text-left sm:text-center flex-1">Build streaks for score multipliers.</p>
          </div>
        </div>
      </motion.div>

      {/* Version tag */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.3 }}
        transition={{ delay: 1.5 }}
        className="relative md:absolute bottom-2 md:bottom-4 font-mono text-[10px] md:text-xs text-cyber-muted mt-4 md:mt-0"
      >
        v1.0.0 // CYBERPUNK EDITION
      </motion.div>
    </div>
  );
}
