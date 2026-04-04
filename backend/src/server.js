/**
 * Express Server Entry Point
 * Configures middleware, routes, and starts the server.
 */

const express = require('express');
const cors = require('cors');
const wordRoutes = require('./routes/wordRoutes');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
}));
app.use(express.json());

// Routes
app.use('/api/words', wordRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(`⚡ TypeRunner API running on http://localhost:${PORT}`);
});

module.exports = app;
