/**
 * localStorage utility for leaderboard persistence.
 * Single Responsibility: All localStorage operations in one place.
 */

const LEADERBOARD_KEY = 'typerunner_leaderboard';
const MAX_LEADERBOARD_ENTRIES = 10;

export const StorageService = {
  /**
   * Save a score entry to localStorage leaderboard.
   */
  saveScore(entry) {
    const leaderboard = this.getLeaderboard();
    leaderboard.push({
      ...entry,
      id: Date.now().toString(36) + Math.random().toString(36).slice(2),
      date: new Date().toISOString(),
    });

    // Sort by score descending and keep top N
    leaderboard.sort((a, b) => b.score - a.score);
    const trimmed = leaderboard.slice(0, MAX_LEADERBOARD_ENTRIES);

    try {
      localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(trimmed));
    } catch (e) {
      console.warn('Failed to save to localStorage:', e);
    }

    return trimmed;
  },

  /**
   * Retrieve the leaderboard from localStorage.
   */
  getLeaderboard() {
    try {
      const data = localStorage.getItem(LEADERBOARD_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  /**
   * Clear the leaderboard.
   */
  clearLeaderboard() {
    localStorage.removeItem(LEADERBOARD_KEY);
  },
};
