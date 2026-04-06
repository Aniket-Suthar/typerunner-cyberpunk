/**
 * useGameEngine Hook — v2
 * Fixes: word overlap, premature miss detection, level scaling.
 * New: laser/projectile system for fighter jet, configurable difficulty curve.
 */

import { useState, useCallback, useRef, useEffect } from 'react';

// ─── Configuration ────────────────────────────────────
const TRACK_HEIGHT = 560;         // Usable track (excluding danger zone)
const DANGER_ZONE_Y = 480;       // Where danger zone STARTS visually
const MISS_THRESHOLD = 550;      // Word must reach this Y before it's counted as miss
const LANE_COUNT = 3;
const BASE_SPEED = 0.55;          // Comfortable start
const SPEED_INCREMENT = 0.22;     // Strong speed increase per level
const BASE_SPAWN_INTERVAL = 2800; // ms between spawns
const MIN_SPAWN_INTERVAL = 700;
const SPAWN_REDUCTION = 200;      // Spawn rate increase
const MIN_LANE_GAP_Y = 75;        // Minimum Y gap between words in same lane

let wordIdCounter = 0;

export function useGameEngine({ onWordMissed, onLevelUp, getNextWord }) {
  const [activeWords, setActiveWords] = useState([]);
  const [isShaking, setIsShaking] = useState(false);
  const [jetLane, setJetLane] = useState(1); // Fighter jet current lane (0,1,2)

  const animationFrameRef = useRef(null);
  const spawnTimerRef = useRef(null);
  const isRunningRef = useRef(false);
  const lastTimeRef = useRef(0);
  const wordsCompletedInLevelRef = useRef(0);
  const currentLevelRef = useRef(1);
  const activeWordsRef = useRef([]);

  // High-performance refs for transient visuals
  const particlesRef = useRef([]);
  const lasersRef = useRef([]);

  // Particle pooling for GC optimization
  const particlePoolRef = useRef([]);

  // Keep ref in sync for spawn collision avoidance
  useEffect(() => { activeWordsRef.current = activeWords; }, [activeWords]);

  /** Current speed based on level */
  const getCurrentSpeed = useCallback(() => {
    return BASE_SPEED + (currentLevelRef.current - 1) * SPEED_INCREMENT;
  }, []);

  /** Current spawn interval based on level */
  const getSpawnInterval = useCallback(() => {
    const interval = BASE_SPAWN_INTERVAL - (currentLevelRef.current - 1) * SPAWN_REDUCTION;
    return Math.max(interval, MIN_SPAWN_INTERVAL);
  }, []);

  /**
   * Pick a lane that doesn't have a word too close to the top.
   * Prevents overlapping words in the same lane.
   */
  const pickSafeLane = useCallback(() => {
    const current = activeWordsRef.current;
    const laneScores = [0, 1, 2].map((lane) => {
      const wordsInLane = current.filter((w) => w.lane === lane);
      if (wordsInLane.length === 0) return { lane, score: 1000 };
      const minY = Math.min(...wordsInLane.map((w) => w.y));
      return { lane, score: minY };
    });
    // Sort by highest score (most room) and pick best
    laneScores.sort((a, b) => b.score - a.score);
    // Only spawn if best lane has enough room
    if (laneScores[0].score < MIN_LANE_GAP_Y) return -1; // Skip spawn
    return laneScores[0].lane;
  }, []);

  /** Spawn a new word on a safe lane */
  const spawnWord = useCallback(() => {
    if (!isRunningRef.current) return;

    const word = getNextWord(currentLevelRef.current);
    if (!word) return;

    const lane = pickSafeLane();
    if (lane === -1) return; // Skip if all lanes are too crowded

    const newWord = {
      id: `word_${++wordIdCounter}`,
      text: word.toLowerCase(),
      lane,
      y: -50,
      typedCount: 0,
      isTargeted: false,
      isCompleted: false,
      speed: getCurrentSpeed() * (0.9 + Math.random() * 0.2),
    };

    setActiveWords((prev) => [...prev, newWord]);
  }, [getNextWord, getCurrentSpeed, pickSafeLane]);

  /** Create explosion particles with pooling */
  const createParticles = useCallback((x, y, color = '#00f0ff', count = 16) => {
    const now = Date.now();
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5;
      const velocity = 2 + Math.random() * 4;

      let p = particlePoolRef.current.pop();
      if (!p) {
        p = { id: 0, x: 0, y: 0, vx: 0, vy: 0, life: 1, color: '', size: 0 };
      }

      p.id = `p_${now}_${i}_${Math.random()}`;
      p.x = x;
      p.y = y;
      p.vx = Math.cos(angle) * velocity;
      p.vy = Math.sin(angle) * velocity;
      p.life = 1.0;
      p.color = color;
      p.size = 2 + Math.random() * 5;

      particlesRef.current.push(p);
    }
  }, []);

  /** Fire a laser */
  const fireLaser = useCallback((fromLane, toX, toY) => {
    const laser = {
      id: `laser_${Date.now()}_${Math.random()}`,
      fromLane,
      toX,
      toY,
      life: 1.0,
    };
    lasersRef.current.push(laser);
    // Auto-remove after animation
    const t = setTimeout(() => {
      lasersRef.current = lasersRef.current.filter((l) => l.id !== laser.id);
    }, 400);
    return () => clearTimeout(t);
  }, []);

  /** Trigger screen shake */
  const triggerShake = useCallback(() => {
    setIsShaking(true);
    const t = setTimeout(() => setIsShaking(false), 400);
    return () => clearTimeout(t);
  }, []);

  /** Main game loop */
  const gameLoop = useCallback((timestamp) => {
    if (!isRunningRef.current) return;

    // Cap deltaTime to prevent huge jumps on tab-switch
    const rawDelta = lastTimeRef.current ? (timestamp - lastTimeRef.current) / 16.67 : 1;
    const deltaTime = Math.min(rawDelta, 3); // Cap at 3x normal speed
    lastTimeRef.current = timestamp;

    // Update word positions
    setActiveWords((prev) => {
      if (prev.length === 0) return prev;

      const updated = [];
      const missed = [];

      for (const word of prev) {
        if (word.isCompleted) continue;

        const newY = word.y + word.speed * deltaTime;

        // Word must reach MISS_THRESHOLD before it's counted as missed
        if (newY >= MISS_THRESHOLD) {
          missed.push(word);
        } else {
          updated.push({ ...word, y: newY });
        }
      }

      // Handle missed words — schedule callbacks outside of setState
      if (missed.length > 0) {
        const t = setTimeout(() => {
          for (const word of missed) {
            onWordMissed?.(word);
          }
        }, 0);
      }

      return updated;
    });

    // Update particles (Direct mutation of Ref, Three.js reads this)
    const activeParticles = [];
    for (const p of particlesRef.current) {
      p.x += p.vx * deltaTime;
      p.y += p.vy * deltaTime;
      p.vy += 0.08 * deltaTime;
      p.life -= 0.025 * deltaTime;
      p.size *= 0.97;

      if (p.life > 0) {
        activeParticles.push(p);
      } else {
        particlePoolRef.current.push(p);
      }
    }
    particlesRef.current = activeParticles;

    // Update lasers
    for (const l of lasersRef.current) {
      l.life -= 0.05 * deltaTime;
    }

    animationFrameRef.current = requestAnimationFrame(gameLoop);
  }, [onWordMissed]);

  /** Start spawning words */
  const startSpawning = useCallback(() => {
    const scheduleSpawn = () => {
      if (!isRunningRef.current) return;
      spawnWord();
      spawnTimerRef.current = setTimeout(scheduleSpawn, getSpawnInterval());
    };
    // Small initial delay so player can orient
    spawnTimerRef.current = setTimeout(scheduleSpawn, 1200);
  }, [spawnWord, getSpawnInterval]);

  /** Start the game engine */
  const startEngine = useCallback(() => {
    wordIdCounter = 0;
    isRunningRef.current = true;
    currentLevelRef.current = 1;
    wordsCompletedInLevelRef.current = 0;
    lastTimeRef.current = 0;
    setActiveWords([]);
    particlesRef.current = [];
    lasersRef.current = [];
    setJetLane(1);

    animationFrameRef.current = requestAnimationFrame(gameLoop);
    startSpawning();
  }, [gameLoop, startSpawning]);

  /** Stop the game engine */
  const stopEngine = useCallback(() => {
    isRunningRef.current = false;
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    if (spawnTimerRef.current) {
      clearTimeout(spawnTimerRef.current);
    }
  }, []);

  /** Mark a word as completed — fires laser + explodes */
  const completeWord = useCallback((wordId, laneX, wordY) => {
    // Find the word's lane to move jet there
    const word = activeWordsRef.current.find((w) => w.id === wordId);
    if (word) {
      setJetLane(word.lane);
      fireLaser(word.lane, laneX, wordY);
    }

    setActiveWords((prev) => prev.filter((w) => w.id !== wordId));
    createParticles(laneX, wordY, '#00ff88', 20);

    // Level up check
    wordsCompletedInLevelRef.current += 1;
    
    // Dynamically scale level up requirement so audio doesn't surround and crash the browser
    const requiredWordsToLevelUp = 4 + (currentLevelRef.current * 2);

    if (wordsCompletedInLevelRef.current >= requiredWordsToLevelUp) {
      wordsCompletedInLevelRef.current = 0;
      currentLevelRef.current += 1;
      onLevelUp?.(currentLevelRef.current);

      // Create level-up particle burst
      createParticles(laneX, wordY, '#f0ff00', 30);

      if (spawnTimerRef.current) {
        clearTimeout(spawnTimerRef.current);
      }
      startSpawning();
    }
  }, [createParticles, fireLaser, onLevelUp, startSpawning]);

  /** Update typed progress */
  const updateWordProgress = useCallback((wordId, typedCount) => {
    setActiveWords((prev) =>
      prev.map((w) =>
        w.id === wordId ? { ...w, typedCount, isTargeted: true } : { ...w, isTargeted: false }
      )
    );
    // Move jet to the targeted word's lane
    const word = activeWordsRef.current.find((w) => w.id === wordId);
    if (word) setJetLane(word.lane);
  }, []);

  /** Clear all targets */
  const clearTargets = useCallback(() => {
    setActiveWords((prev) => prev.map((w) => ({ ...w, isTargeted: false })));
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => stopEngine();
  }, [stopEngine]);

  return {
    activeWords,
    particlesRef,
    lasersRef,
    isShaking,
    jetLane,
    startEngine,
    stopEngine,
    completeWord,
    updateWordProgress,
    clearTargets,
    triggerShake,
    trackHeight: TRACK_HEIGHT,
    dangerZoneY: DANGER_ZONE_Y,
    laneCount: LANE_COUNT,
  };
}
