/**
 * Word Routes
 * Single Responsibility: Maps HTTP methods and paths to controller methods.
 */

const express = require('express');
const router = express.Router();
const wordController = require('../controllers/wordController');

router.get('/', (req, res) => wordController.getWords(req, res));

module.exports = router;
