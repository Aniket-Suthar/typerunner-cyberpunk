/**
 * App Component — v4
 * BIGGER typing input, combo indicator, streak fire overlay.
 * Enhanced layout with full-width track and immersive input.
 */

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useGameContext } from './context/GameContext';
import { useGameEngine } from './hooks/useGameEngine';
import { useTypingHandler } from './hooks/useTypingHandler';
import { useWords } from './hooks/useWords';
import { useSoundEngine } from './hooks/useSoundEngine';
import MainMenu from './components/UI/MainMenu';
import HUD from './components/UI/HUD';
import GameTrack from './components/Game/GameTrack';
import GameOverScreen from './components/UI/GameOverScreen';
import Leaderboard from './components/UI/Leaderboard';
import ParticlesBackground from './components/UI/ParticlesBackground';

function GameApp() {
  const { state, actions, GAME_STATES: STATES } = useGameContext();
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const { getNextWord, fetchWords, resetWords } = useWords();
  const wpmIntervalRef = useRef(null);
  const correctKeysRef = useRef(0);
  const startTimeRef = useRef(null);
  const sound = useSoundEngine();

  useEffect(() => { correctKeysRef.current = state.correctKeystrokes; }, [state.correctKeystrokes]);
  useEffect(() => { startTimeRef.current = state.startTime; }, [state.startTime]);

  const engineRef = useRef(null);
  const stateRef = useRef(state);
  useEffect(() => { stateRef.current = state; }, [state]);

  // ─── Callbacks ──────────────────────────────────
  const handleWordMissed = useCallback((word) => {
    actions.loseLife();
    engineRef.current?.triggerShake();
    sound.playMissSound();
  }, [actions, sound]);

  const handleLevelUp = useCallback((newLevel) => {
    actions.setLevel(newLevel);
    sound.playLevelUpSound();
    sound.setBGMLevel(newLevel);
  }, [actions, sound]);

  const engine = useGameEngine({
    onWordMissed: handleWordMissed,
    onLevelUp: handleLevelUp,
    getNextWord,
  });

  engineRef.current = engine;

  const handleWordComplete = useCallback((word) => {
    actions.wordCompleted(word.text);
    const s = stateRef.current;
    sound.playCompleteSound(s.currentStreak);
    sound.playLaserSound(s.level);

    const trackEl = document.querySelector('[data-track]');
    const trackWidth = trackEl ? trackEl.offsetWidth : 600;
    const laneX = ((word.lane * 33.33) + 16.66) / 100 * trackWidth;
    engine.completeWord(word.id, laneX, word.y);
  }, [actions, engine, sound]);

  const {
    currentInput,
    targetWordId,
    inputRef,
    handleInputChange: rawHandleInputChange,
    handleKeyDown,
    resetInput,
  } = useTypingHandler({
    activeWords: engine.activeWords,
    onWordComplete: handleWordComplete,
    onKeyPress: () => actions.keyPressed(),
    onCorrectKey: () => {
      actions.correctKey();
      sound.playKeySound(stateRef.current.currentStreak);
    },
    updateWordProgress: engine.updateWordProgress,
    clearTargets: engine.clearTargets,
    isPlaying: state.gameState === STATES.PLAYING,
  });

  // ─── WPM Calculator ──────────────────────────────
  useEffect(() => {
    if (state.gameState === STATES.PLAYING && state.startTime) {
      wpmIntervalRef.current = setInterval(() => {
        const keys = correctKeysRef.current;
        const start = startTimeRef.current;
        if (!start) return;
        const elapsedMinutes = (Date.now() - start) / 60000;
        if (elapsedMinutes > 0.05) {
          actions.updateWpm(Math.round((keys / 5) / elapsedMinutes));
        }
      }, 500);
      return () => clearInterval(wpmIntervalRef.current);
    }
  }, [state.gameState, state.startTime, actions, STATES]);

  useEffect(() => {
    if (state.gameState === STATES.GAME_OVER) {
      engine.stopEngine();
      sound.stopBGM();
      sound.stopAmbience();
      sound.playGameOverSound();
      if (wpmIntervalRef.current) clearInterval(wpmIntervalRef.current);
    }
  }, [state.gameState, engine, STATES, sound]);

  const handleStartGame = useCallback(() => {
    sound.initAudio();
    resetWords();
    resetInput();
    fetchWords(1);
    actions.startGame();
    setShowLeaderboard(false);
    setTimeout(() => {
      engine.startEngine();
      sound.startBGM();
      sound.startAmbience();
      if (inputRef.current) inputRef.current.focus();
    }, 100);
  }, [actions, engine, resetWords, resetInput, fetchWords, inputRef, sound]);

  const handlePlayAgain = useCallback(() => handleStartGame(), [handleStartGame]);
  const handleMainMenu = useCallback(() => {
    actions.reset();
    engine.stopEngine();
    sound.stopBGM();
    sound.stopAmbience();
    setShowLeaderboard(false);
  }, [actions, engine, sound]);

  // ─── Combo text ────────────────────────────────────
  const getComboText = (streak) => {
    if (streak >= 15) return { text: 'GODLIKE!', color: '#ff0040', emoji: '☠️' };
    if (streak >= 10) return { text: 'UNSTOPPABLE!', color: '#ff4400', emoji: '💀' };
    if (streak >= 7) return { text: 'ON FIRE!', color: '#ff8800', emoji: '🔥' };
    if (streak >= 5) return { text: 'COMBO x' + streak, color: '#f0ff00', emoji: '⚡' };
    if (streak >= 3) return { text: 'NICE!', color: '#00ff88', emoji: '✨' };
    return null;
  };

  const comboInfo = getComboText(state.currentStreak);

  // Determine tier for background
  const tier = state.level <= 2 ? 1 : state.level <= 4 ? 2 : state.level <= 6 ? 3 : 4;

  return (
    <div className="relative w-full h-full overflow-hidden">
      <ParticlesBackground />
      <div className={`cyber-grid-bg level-bg-${tier}`} />
      <div className="scanline-overlay" />

      {/* Main Menu */}
      {state.gameState === STATES.IDLE && !showLeaderboard && (
        <MainMenu onStart={handleStartGame} />
      )}

      {/* Playing State */}
      {state.gameState === STATES.PLAYING && (
        <div className="relative flex flex-col h-full z-10">
          <HUD
            score={state.score}
            lives={state.lives}
            maxLives={state.maxLives}
            currentStreak={state.currentStreak}
            wpm={state.wpm}
            level={state.level}
            wordsCompleted={state.wordsCompleted}
            isMuted={sound.isMuted}
            onToggleMute={sound.toggleMute}
          />

          {/* Combo overlay — floats above everything */}
          <AnimatePresence>
            {comboInfo && (
              <motion.div
                key={`combo-${state.currentStreak}`}
                initial={{ opacity: 0, scale: 2, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.5, y: -20 }}
                transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                className="absolute top-16 left-1/2 -translate-x-1/2 z-40 pointer-events-none text-center"
              >
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{comboInfo.emoji}</span>
                  <span
                    className="font-orbitron text-2xl font-black tracking-widest"
                    style={{
                      color: comboInfo.color,
                      textShadow: `0 0 20px ${comboInfo.color}, 0 0 40px ${comboInfo.color}60`,
                    }}
                  >
                    {comboInfo.text}
                  </span>
                  <span className="text-2xl">{comboInfo.emoji}</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Streak fire borders */}
          {state.currentStreak >= 5 && (
            <>
              <div className="streak-fire-left" />
              <div className="streak-fire-right" />
            </>
          )}

          <div className="flex-1 flex items-center justify-center px-2 md:px-3 pb-1 h-[50vh] md:h-[60vh]">
            <div className="w-full max-w-4xl h-full" data-track>
              <GameTrack
                activeWords={engine.activeWords}
                particles={engine.particles}
                lasers={engine.lasers}
                isShaking={engine.isShaking}
                trackHeight={engine.trackHeight}
                dangerZoneY={engine.dangerZoneY}
                laneCount={engine.laneCount}
                targetWordId={targetWordId}
                jetLane={engine.jetLane}
                level={state.level}
              />

              {/* BIGGER Typing Input Area */}
              <div className="mt-4 flex justify-center">
                <div className="relative w-full max-w-2xl">
                  {/* Label */}
                  <div
                    className="absolute -top-3 left-5 px-3 font-orbitron text-xs tracking-widest uppercase z-10 flex items-center gap-2"
                    style={{ color: '#00f0ff', background: '#0a0a0f' }}
                  >
                    <span className="inline-block w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                    ⌨ COMMAND INPUT
                  </div>

                  {/* Input */}
                  <input
                    ref={inputRef}
                    type="text"
                    value={currentInput}
                    onChange={rawHandleInputChange}
                    onKeyDown={handleKeyDown}
                    autoFocus
                    spellCheck={false}
                    autoComplete="off"
                    className="typing-input-glow w-full px-4 py-3 md:px-8 md:py-5 rounded-xl md:rounded-2xl font-mono text-lg md:text-2xl tracking-widest text-center
                      bg-cyber-darker border-2 border-cyber-border text-cyber-text
                      focus:border-cyber-primary focus:outline-none transition-all duration-300"
                    style={{
                      caretColor: '#00f0ff',
                      letterSpacing: '0.12em',
                    }}
                    placeholder="start typing..."
                  />

                  {/* Match indicator dot */}
                  {currentInput && (
                    <motion.div
                      animate={{ scale: [1, 1.3, 1] }}
                      transition={{ duration: 0.5, repeat: Infinity }}
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full"
                      style={{
                        background: targetWordId ? '#00ff88' : '#ff0040',
                        boxShadow: targetWordId
                          ? '0 0 12px #00ff88, 0 0 24px rgba(0,255,136,0.4)'
                          : '0 0 12px #ff0040, 0 0 24px rgba(255,0,64,0.4)',
                      }}
                    />
                  )}

                  {/* Waveform visualizer bar */}
                  <div className="flex justify-center gap-0.5 mt-2 h-4 opacity-50">
                    {Array.from({ length: 32 }).map((_, i) => {
                      const isActive = i < (currentInput.length / 15) * 32;
                      return (
                        <motion.div
                          key={i}
                          animate={{
                            height: isActive ? `${6 + Math.random() * 10}px` : '2px',
                            opacity: isActive ? 0.8 : 0.15,
                          }}
                          transition={{ duration: 0.1 }}
                          style={{
                            width: '3px',
                            background: isActive ? '#00f0ff' : '#333',
                            borderRadius: '1px',
                          }}
                        />
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Game Over */}
      <AnimatePresence>
        {state.gameState === STATES.GAME_OVER && !showLeaderboard && (
          <GameOverScreen
            onPlayAgain={handlePlayAgain}
            onMainMenu={handleMainMenu}
            onShowLeaderboard={() => setShowLeaderboard(true)}
          />
        )}
      </AnimatePresence>

      {/* Leaderboard */}
      <AnimatePresence>
        {showLeaderboard && (
          <Leaderboard onBack={() => setShowLeaderboard(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}

export default GameApp;
