/**
 * useTypingHandler Hook
 * Single Responsibility: Handles keyboard input and matches typed text against active words.
 * Follows Dependency Inversion: depends on abstractions (callbacks) rather than concrete game state.
 */

import { useState, useCallback, useEffect, useRef } from 'react';

export function useTypingHandler({
  activeWords,
  onWordComplete,
  onKeyPress,
  onCorrectKey,
  updateWordProgress,
  clearTargets,
  isPlaying,
}) {
  const [currentInput, setCurrentInput] = useState('');
  const [targetWordId, setTargetWordId] = useState(null);
  const inputRef = useRef(null);

  /**
   * Find the best matching word for the current input.
   * Priority: lowest Y position (closest to bottom) whose beginning matches input.
   */
  const findTargetWord = useCallback(
    (input) => {
      if (!input) return null;

      const lowerInput = input.toLowerCase();

      // Find words that start with the typed input, sorted by Y position (highest Y = closest to bottom)
      const matches = activeWords
        .filter((w) => w.text.startsWith(lowerInput) && !w.isCompleted)
        .sort((a, b) => b.y - a.y); // Highest Y first (closest to danger zone)

      return matches.length > 0 ? matches[0] : null;
    },
    [activeWords]
  );

  /**
   * Handle input change from the text field.
   */
  const handleInputChange = useCallback(
    (e) => {
      if (!isPlaying) return;

      const value = e.target.value;
      setCurrentInput(value);
      onKeyPress?.();

      if (!value) {
        setTargetWordId(null);
        clearTargets?.();
        return;
      }

      const target = findTargetWord(value);

      if (target) {
        setTargetWordId(target.id);
        onCorrectKey?.();
        updateWordProgress?.(target.id, value.length);

        // Check if word is fully typed
        if (value.toLowerCase() === target.text) {
          onWordComplete?.(target);
          setCurrentInput('');
          setTargetWordId(null);
        }
      } else {
        setTargetWordId(null);
        clearTargets?.();
      }
    },
    [isPlaying, findTargetWord, onWordComplete, onKeyPress, onCorrectKey, updateWordProgress, clearTargets]
  );

  /**
   * Handle special keys (Escape to clear, etc.)
   */
  const handleKeyDown = useCallback(
    (e) => {
      if (!isPlaying) return;

      if (e.key === 'Escape') {
        setCurrentInput('');
        setTargetWordId(null);
        clearTargets?.();
      }
    },
    [isPlaying, clearTargets]
  );

  /**
   * Keep input focused during gameplay.
   */
  useEffect(() => {
    if (isPlaying && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isPlaying]);

  /**
   * Reset state.
   */
  const resetInput = useCallback(() => {
    setCurrentInput('');
    setTargetWordId(null);
  }, []);

  return {
    currentInput,
    targetWordId,
    inputRef,
    handleInputChange,
    handleKeyDown,
    resetInput,
  };
}
