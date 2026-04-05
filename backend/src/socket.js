const wordService = require('./services/wordService');

// In-memory room store.
// rooms[roomId] = { host: socketId, players: { [socketId]: { name, score, ... } }, state: 'LOBBY' | 'PLAYING' | 'FINISHED', words: [] }
const rooms = {};

function initSockets(io) {
  io.on('connection', (socket) => {
    console.log(`🔌 Player connected: ${socket.id}`);

    // Create Room
    socket.on('create_room', (data, callback) => {
      // Generate a simple 4 letter random string code
      const roomId = Math.random().toString(36).substring(2, 6).toUpperCase();
      rooms[roomId] = {
        host: socket.id,
        state: 'LOBBY',
        players: {},
        words: []
      };
      
      rooms[roomId].players[socket.id] = {
        id: socket.id,
        name: data.playerName || 'HACKER',
        score: 0,
        alive: true,
        finished: false,
        isReady: true // Host is always implicitly ready or can choose to toggle. Let's start with true.
      };

      socket.join(roomId);
      console.log(`🏠 Room ${roomId} created by ${socket.id}`);
      
      if (callback) {
        callback({
          success: true,
          roomId,
          players: Object.values(rooms[roomId].players),
          host: rooms[roomId].host,
          isHost: true
        });
      }
    });

    // Join Room
    socket.on('join_room', (data, callback) => {
      const { roomId, playerName } = data;
      const room = rooms[roomId];

      if (!room) {
        return callback({ success: false, message: 'Room not found' });
      }
      
      if (room.state !== 'LOBBY') {
        return callback({ success: false, message: 'Game already in progress' });
      }

      room.players[socket.id] = {
        id: socket.id,
        name: playerName || 'HACKER',
        score: 0,
        alive: true,
        finished: false,
        isReady: false // Must toggle to ready
      };

      socket.join(roomId);
      console.log(`👤 ${socket.id} joined room ${roomId}`);
      
      // Broadcast to others in the room
      io.to(roomId).emit('room_update', {
        players: Object.values(room.players),
        host: room.host
      });

      if (callback) {
        callback({
          success: true,
          roomId,
          players: Object.values(room.players),
          host: room.host,
          isHost: false
        });
      }
    });

    // Toggle Ready
    socket.on('toggle_ready', (roomId) => {
      const room = rooms[roomId];
      if (room && room.players[socket.id]) {
        // Prevent toggle if game already started
        if (room.state !== 'LOBBY') return;
        
        room.players[socket.id].isReady = !room.players[socket.id].isReady;
        io.to(roomId).emit('room_update', {
          players: Object.values(room.players),
          host: room.host
        });
      }
    });

    // Start Game (triggered by host)
    socket.on('start_game', (roomId) => {
      const room = rooms[roomId];
      if (room && room.host === socket.id && room.state === 'LOBBY') {
        room.state = 'PLAYING';
        
        // Pre-generate a list of words for the whole game to keep it synchronized.
        // E.g., 500 words scaling up in difficulty.
        const synchronizedWords = [];
        for (let level = 1; level <= 10; level++) {
           const levelWords = wordService.getWordsForLevel(level, 50); // 50 words per level
           synchronizedWords.push(...levelWords.map(w => w.word));
        }
        room.words = synchronizedWords;

        io.to(roomId).emit('game_started', {
          words: room.words
        });
      }
    });

    // Player Progress
    socket.on('player_progress', (data) => {
      const { roomId, score, alive } = data;
      const room = rooms[roomId];
      if (room && room.players[socket.id]) {
        room.players[socket.id].score = score;
        room.players[socket.id].alive = alive;
        
        if (!alive) {
          room.players[socket.id].finished = true;
        }

        // Broadcast progress to others to show live stats or leaderboard
        socket.to(roomId).emit('player_update', {
          playerId: socket.id,
          score,
          alive
        });

        checkRoomFinished(roomId, io);
      }
    });

    // Player Finished the race (optional manual end or ran out of words)
    socket.on('player_finished', (data) => {
       const { roomId, score } = data;
       const room = rooms[roomId];
       if (room && room.players[socket.id]) {
         room.players[socket.id].score = score;
         room.players[socket.id].finished = true;
         
         checkRoomFinished(roomId, io);
       }
    });

    // Disconnect
    socket.on('disconnect', () => {
      // Find room the user was in
      for (const roomId in rooms) {
        const room = rooms[roomId];
        if (room.players[socket.id]) {
          delete room.players[socket.id];
          
          if (Object.keys(room.players).length === 0) {
            delete rooms[roomId]; // Clean up empty room
          } else {
            // Re-assign host if the host left
            if (room.host === socket.id) {
              room.host = Object.keys(room.players)[0];
            }
            io.to(roomId).emit('room_update', {
              players: Object.values(room.players),
              host: room.host
            });
            checkRoomFinished(roomId, io);
          }
        }
      }
      console.log(`🔌 Player disconnected: ${socket.id}`);
    });
  });
}

function checkRoomFinished(roomId, io) {
   const room = rooms[roomId];
   if (!room || room.state !== 'PLAYING') return;

   const allFinished = Object.values(room.players).every(p => p.finished);
   
   if (allFinished) {
      room.state = 'FINISHED';
      io.to(roomId).emit('room_game_over', {
        leaderboard: Object.values(room.players).sort((a, b) => b.score - a.score)
      });
   }
}

module.exports = { initSockets };
