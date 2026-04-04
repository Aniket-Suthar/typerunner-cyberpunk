/**
 * WordService
 * Single Responsibility: Manages word selection and difficulty scaling.
 * Follows Open/Closed Principle - easily extendable with new difficulty tiers.
 */

const wordDictionary = require('../data/words');

class WordService {
  constructor() {
    this.difficulties = Object.keys(wordDictionary);
  }

  /**
   * Get a batch of random words based on difficulty level.
   * @param {string} difficulty - 'easy' | 'medium' | 'hard' | 'extreme' | 'mixed'
   * @param {number} count - Number of words to return
   * @returns {Array<{word: string, difficulty: string}>}
   */
  getWords(difficulty = 'mixed', count = 20) {
    if (difficulty === 'mixed') {
      return this._getMixedWords(count);
    }

    const pool = wordDictionary[difficulty];
    if (!pool) {
      throw new Error(`Invalid difficulty: ${difficulty}`);
    }

    return this._sampleFromPool(pool, count, difficulty);
  }

  /**
   * Get words from mixed difficulties, weighted toward easier words.
   * @param {number} count
   * @returns {Array<{word: string, difficulty: string}>}
   */
  _getMixedWords(count) {
    const weights = { easy: 0.3, medium: 0.35, hard: 0.25, extreme: 0.1 };
    const result = [];

    for (let i = 0; i < count; i++) {
      const roll = Math.random();
      let cumulative = 0;
      let selectedDifficulty = 'easy';

      for (const [diff, weight] of Object.entries(weights)) {
        cumulative += weight;
        if (roll <= cumulative) {
          selectedDifficulty = diff;
          break;
        }
      }

      const pool = wordDictionary[selectedDifficulty];
      const word = pool[Math.floor(Math.random() * pool.length)];
      result.push({ word: word.toLowerCase(), difficulty: selectedDifficulty });
    }

    return result;
  }

  /**
   * Sample N random words from a pool without replacement.
   */
  _sampleFromPool(pool, count, difficulty) {
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, Math.min(count, shuffled.length)).map((word) => ({
      word: word.toLowerCase(),
      difficulty,
    }));
  }

  /**
   * Get difficulty-appropriate words based on the player's current score/level.
   * Progressive mixing: higher levels = more hard/extreme words + longer words.
   * @param {number} level - Current game level (1-based)
   * @param {number} count
   */
  getWordsForLevel(level, count = 20) {
    if (level <= 1) return this.getWords('easy', count);
    if (level <= 2) {
      // Quick ramp: mostly easy + some medium
      const easy = this.getWords('easy', Math.ceil(count * 0.5));
      const medium = this.getWords('medium', Math.ceil(count * 0.5));
      return [...easy, ...medium].sort(() => Math.random() - 0.5).slice(0, count);
    }
    if (level <= 3) {
      // Medium dominated
      const medium = this.getWords('medium', Math.ceil(count * 0.7));
      const hard = this.getWords('hard', Math.ceil(count * 0.3));
      return [...medium, ...hard].sort(() => Math.random() - 0.5).slice(0, count);
    }
    if (level <= 5) {
      // Hard mix
      const medium = this.getWords('medium', Math.ceil(count * 0.3));
      const hard = this.getWords('hard', Math.ceil(count * 0.7));
      return [...medium, ...hard].sort(() => Math.random() - 0.5).slice(0, count);
    }
    if (level <= 7) {
      // Hard + extreme
      const hard = this.getWords('hard', Math.ceil(count * 0.4));
      const extreme = this.getWords('extreme', Math.ceil(count * 0.6));
      return [...hard, ...extreme].sort(() => Math.random() - 0.5).slice(0, count);
    }
    // Level 8+: mostly extreme (long words!)
    return this.getWords('extreme', count);
  }
}

module.exports = new WordService();
