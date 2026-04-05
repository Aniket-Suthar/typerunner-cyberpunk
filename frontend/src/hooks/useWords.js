/**
 * useWords Hook
 * Single Responsibility: Fetches word batches from the backend API and queues them.
 * Follows Interface Segregation — consumers only see getNextWord().
 */

import { useState, useCallback, useRef } from 'react';

const API_BASE = '/api/words';

// Fallback words in case API is unavailable — includes all difficulty tiers
export const FALLBACK_WORDS = [
  // Easy (2-4)
  'run', 'code', 'type', 'fast', 'neon', 'glow', 'fire', 'hack',
  'byte', 'loop', 'grid', 'data', 'node', 'flux', 'core', 'void',
  // Medium (5-6)
  'cyber', 'pixel', 'stack', 'query', 'debug', 'frame', 'parse', 'fetch',
  'async', 'cache', 'event', 'state', 'route', 'build', 'merge', 'server',
  'engine', 'vector', 'matrix', 'module', 'deploy', 'signal', 'kernel',
  // Hard (7-9)
  'runtime', 'webpack', 'promise', 'compile', 'gateway', 'handler',
  'express', 'network', 'backend', 'session', 'cluster', 'encrypt',
  'database', 'endpoint', 'function', 'generate', 'pipeline', 'security',
  // Extreme (9-16)
  'algorithm', 'benchmark', 'container', 'dashboard', 'generator',
  'localhost', 'namespace', 'processor', 'recursion', 'rendering',
  'cyberpunk', 'framework', 'interface', 'encryption', 'refactoring',
  'asynchronous', 'architecture', 'microservice', 'optimization',
  'authentication', 'configuration', 'synchronization', 
];

export function useWords() {
  const [wordQueue, setWordQueue] = useState([]);
  const isFetchingRef = useRef(false);
  const wordIndexRef = useRef(0);
  const isMultiplayerRef = useRef(false);

  /**
   * Set words explicitly for synchronized multiplayer
   */
  const setSyncedWords = useCallback((words) => {
    isMultiplayerRef.current = true;
    setWordQueue(words);
    wordIndexRef.current = 0;
  }, []);

  /**
   * Fetch a batch of words from the API.
   */
  const fetchWords = useCallback(async (level = 1) => {
    if (isFetchingRef.current || isMultiplayerRef.current) return;
    isFetchingRef.current = true;

    try {
      const response = await fetch(`${API_BASE}?level=${level}&count=30`);
      if (!response.ok) throw new Error('API unavailable');
      const json = await response.json();

      if (json.success && json.data) {
        setWordQueue((prev) => [...prev, ...json.data.map((w) => w.word)]);
      }
    } catch {
      // Use fallback words if API is down
      const shuffled = [...FALLBACK_WORDS].sort(() => Math.random() - 0.5);
      setWordQueue((prev) => [...prev, ...shuffled.slice(0, 30)]);
    } finally {
      isFetchingRef.current = false;
    }
  }, []);

  /**
   * Get the next word from the queue.
   * Automatically fetches more if running low.
   */
  const getNextWord = useCallback((level = 1) => {
    const currentIndex = wordIndexRef.current;

    // If queue is running low, fetch more (bypassed if MULTIPLAYER)
    if (currentIndex >= wordQueue.length - 5) {
      fetchWords(level);
    }

    if (currentIndex < wordQueue.length) {
      wordIndexRef.current += 1;
      return wordQueue[currentIndex];
    }

    // Emergency fallback
    return FALLBACK_WORDS[Math.floor(Math.random() * FALLBACK_WORDS.length)];
  }, [wordQueue, fetchWords]);

  /**
   * Reset the word queue for a new game.
   */
  const resetWords = useCallback(() => {
    setWordQueue([]);
    wordIndexRef.current = 0;
    isMultiplayerRef.current = false;
  }, []);

  return { getNextWord, fetchWords, resetWords, setSyncedWords, queueLength: wordQueue.length };
}
