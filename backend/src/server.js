/**
 * Express Server Entry Point
 * Configures middleware, routes, and starts the server.
 */

const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const wordRoutes = require('./routes/wordRoutes');
const { initSockets } = require('./socket');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000'],
    methods: ["GET", "POST"],
    credentials: true
  }
});

initSockets(io);

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
server.listen(PORT, () => {
  console.log(`⚡ TypeRunner API running on http://localhost:${PORT}`);
});

module.exports = { app, server };
