/**
 * GameOverScreen Component
 * Single Responsibility: Displays comprehensive game statistics and options after the game ends.
 * Features animated stat reveals and leaderboard integration.
 */

import React, { useEffect, useMemo, useRef } from 'react';
import { motion } from 'framer-motion';
import { useGameContext } from '../../context/GameContext';
import { StorageService } from '../../utils/storage';

export default function GameOverScreen({ onPlayAgain, onMainMenu, onShowLeaderboard }) {
  const { state } = useGameContext();
  const savedRef = useRef(false);

  const stats = useMemo(() => {
    const timePlayed = state.endTime && state.startTime
      ? (state.endTime - state.startTime) / 1000
      : 0;
    const timeMinutes = timePlayed / 60;
    const wpm = timeMinutes > 0 ? Math.round((state.correctKeystrokes / 5) / timeMinutes) : 0;
    const accuracy = state.totalKeystrokes > 0
      ? Math.round((state.correctKeystrokes / state.totalKeystrokes) * 100)
      : 0;

    return {
      score: state.score,
      wpm,
      accuracy,
      wordsCompleted: state.wordsCompleted,
      highestStreak: state.highestStreak,
      level: state.level,
      timePlayed: Math.round(timePlayed),
      totalKeystrokes: state.totalKeystrokes,
      correctKeystrokes: state.correctKeystrokes,
    };
  }, [state]);

  // Save score ONCE on mount
  useEffect(() => {
    if (!savedRef.current && state.playerName) {
      StorageService.saveScore({
        name: state.playerName,
        score: stats.score,
        wpm: stats.wpm,
        accuracy: stats.accuracy,
        wordsCompleted: stats.wordsCompleted,
        level: stats.level,
      });
      savedRef.current = true;
    }
  }, []); // Empty deps — run only on mount

  const statItems = [
    { label: 'FINAL SCORE', value: stats.score.toLocaleString(), color: '#00f0ff', icon: '🏆' },
    { label: 'WPM', value: stats.wpm, color: '#f0ff00', icon: '⚡' },
    { label: 'ACCURACY', value: `${stats.accuracy}%`, color: '#00ff88', icon: '🎯' },
    { label: 'WORDS TYPED', value: stats.wordsCompleted, color: '#ff00e5', icon: '📝' },
    { label: 'BEST STREAK', value: stats.highestStreak, color: '#ff8800', icon: '🔥' },
    { label: 'LEVEL REACHED', value: stats.level, color: '#00f0ff', icon: '📊' },
    { label: 'TIME SURVIVED', value: `${stats.timePlayed}s`, color: '#ff00e5', icon: '⏱️' },
    { label: 'KEYSTROKES', value: stats.totalKeystrokes, color: '#f0ff00', icon: '⌨️' },
  ];

  // Rating based on WPM
  const getRating = () => {
    if (stats.wpm >= 80) return { text: 'LEGENDARY', color: '#ff00e5', icon: '👑' };
    if (stats.wpm >= 60) return { text: 'ELITE', color: '#f0ff00', icon: '⭐' };
    if (stats.wpm >= 40) return { text: 'SKILLED', color: '#00ff88', icon: '💪' };
    if (stats.wpm >= 25) return { text: 'ROOKIE', color: '#00f0ff', icon: '🔰' };
    return { text: 'BEGINNER', color: '#8888aa', icon: '🌱' };
  };

  const rating = getRating();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-start md:justify-center px-4 py-10 overflow-y-auto custom-scrollbar"
      style={{
        background: 'radial-gradient(ellipse at center, rgba(10, 10, 15, 0.95), rgba(6, 6, 10, 0.98))',
        backdropFilter: 'blur(10px)',
      }}
    >
      <div className="w-full max-w-lg shrink-0 pb-10">
        {/* Game Over Title */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="text-center mb-6"
        >
          <h2
            className="glitch-text font-orbitron text-4xl md:text-5xl font-black tracking-wider"
            data-text="GAME OVER"
            style={{
              color: '#ff0040',
              textShadow: '0 0 20px rgba(255, 0, 64, 0.6), 0 0 40px rgba(255, 0, 64, 0.3)',
            }}
          >
            GAME OVER
          </h2>

          {/* Player Name */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="font-mono text-sm text-cyber-muted mt-2"
          >
            PLAYER: <span style={{ color: '#00f0ff' }}>{state.playerName || 'ANONYMOUS'}</span>
          </motion.p>

          {/* Rating */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="mt-3 inline-flex items-center gap-2 px-4 py-1.5 rounded-full"
            style={{
              background: `${rating.color}15`,
              border: `1px solid ${rating.color}40`,
            }}
          >
            <span className="text-lg">{rating.icon}</span>
            <span
              className="font-orbitron text-sm font-bold tracking-widest"
              style={{ color: rating.color }}
            >
              {rating.text}
            </span>
          </motion.div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {statItems.map((item, index) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8 + index * 0.1 }}
              className="p-3 rounded-lg text-center"
              style={{
                background: `linear-gradient(135deg, rgba(18, 18, 26, 0.9), rgba(10, 10, 15, 0.9))`,
                border: `1px solid ${item.color}25`,
                boxShadow: `inset 0 0 20px ${item.color}08`,
              }}
            >
              <div className="text-lg mb-1">{item.icon}</div>
              <div className="text-xs font-orbitron text-cyber-muted tracking-wider uppercase">
                {item.label}
              </div>
              <div
                className="text-xl font-orbitron font-bold mt-1"
                style={{
                  color: item.color,
                  textShadow: `0 0 8px ${item.color}60`,
                }}
              >
                {item.value}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.6 }}
          className="flex flex-col gap-3"
        >
          <button
            id="play-again-btn"
            onClick={onPlayAgain}
            className="w-full py-3 rounded-lg font-orbitron text-base font-bold tracking-widest
              cursor-pointer transition-all duration-300 hover:scale-[1.02]"
            style={{
              background: 'linear-gradient(135deg, rgba(0, 240, 255, 0.2), rgba(0, 255, 136, 0.2))',
              border: '2px solid #00f0ff',
              color: '#00f0ff',
              boxShadow: '0 0 15px rgba(0, 240, 255, 0.15)',
            }}
          >
            ▶ PLAY AGAIN
          </button>

          <div className="flex gap-3">
            <button
              id="leaderboard-btn"
              onClick={onShowLeaderboard}
              className="flex-1 py-2.5 rounded-lg font-orbitron text-sm font-bold tracking-wider
                cursor-pointer transition-all duration-300 hover:scale-[1.02]"
              style={{
                background: 'rgba(255, 0, 229, 0.1)',
                border: '1px solid rgba(255, 0, 229, 0.3)',
                color: '#ff00e5',
              }}
            >
              🏅 LEADERBOARD
            </button>

            <button
              id="main-menu-btn"
              onClick={onMainMenu}
              className="flex-1 py-2.5 rounded-lg font-orbitron text-sm font-bold tracking-wider
                cursor-pointer transition-all duration-300 hover:scale-[1.02]"
              style={{
                background: 'rgba(106, 106, 138, 0.1)',
                border: '1px solid rgba(106, 106, 138, 0.3)',
                color: '#6a6a8a',
              }}
            >
              ◀ MENU
            </button>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
