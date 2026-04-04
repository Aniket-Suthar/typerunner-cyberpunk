/**
 * WordController
 * Single Responsibility: Handles HTTP request/response for word-related endpoints.
 * Delegates business logic to WordService.
 */

const wordService = require('../services/wordService');

class WordController {
  /**
   * GET /api/words
   * Query params: difficulty (string), count (number), level (number)
   */
  getWords(req, res) {
    try {
      const { difficulty = 'mixed', count = 20, level } = req.query;
      const parsedCount = parseInt(count, 10) || 20;

      let words;
      if (level) {
        words = wordService.getWordsForLevel(parseInt(level, 10), parsedCount);
      } else {
        words = wordService.getWords(difficulty, parsedCount);
      }

      res.json({
        success: true,
        data: words,
        meta: {
          count: words.length,
          difficulty: level ? `level-${level}` : difficulty,
        },
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }
}

module.exports = new WordController();
