import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { Peer } from 'peerjs';
import { FALLBACK_WORDS } from './useWords'; 

const PREFIX = 'typerunner-v2-';

export function useMultiplayer() {
  const peerRef = useRef(null);
  const connRef = useRef(null); // Joinee's connection
  const connectionsRef = useRef({}); // Host's connections map

  const [socketId, setSocketId] = useState(null);
  const [roomData, setRoomData] = useState(null); 
  const [syncedWords, setSyncedWords] = useState([]);
  const [leaderboard, setLeaderboard] = useState(null);
  const [error, setError] = useState('');
  const [isConnected, setIsConnected] = useState(false);

  // Helper: Synchronously update state and ref with structural equality check
  const updateRoomData = useCallback((newData) => {
    if (!newData) {
      setRoomData(null);
      roomDataRef.current = null;
      return;
    }

    setRoomData(prev => {
      // Deep Check: Only update if structural data changed to prevent infinite loops
      const playersChanged = JSON.stringify(prev?.players) !== JSON.stringify(newData.players);
      const stateChanged = prev?.state !== newData.state;
      const hostChanged = prev?.host !== newData.host;

      if (!playersChanged && !stateChanged && !hostChanged && prev?.roomId === newData.roomId) {
        return prev; // Return original reference to avoid re-render
      }

      const merged = { ...prev, ...newData };
      roomDataRef.current = merged; // Synchronous update to ref
      return merged;
    });
  }, []);

  // Maintain active ref to roomData to avoid stale closures in Peer callbacks
  const roomDataRef = useRef(null);
  const broadcastThrottleRef = useRef(0);
  const lastScoreRef = useRef(-1);
  // Debounce buffer for joinee progress updates
  const pendingProgressRef = useRef(null);
  const progressTimerRef = useRef(null);
  const lastUpdateRef = useRef(0);

  // Helper: send pending progress after debounce interval
  const flushPendingProgress = () => {
    if (!pendingProgressRef.current) return;
    const { score, alive } = pendingProgressRef.current;
    if (connRef.current?.open) {
      console.log(`[P2P Joinee] 📤 Flushed debounced progress: ${score}, alive=${alive}`);
      connRef.current.send({ type: 'player_progress', score, alive });
    }
    pendingProgressRef.current = null;
    progressTimerRef.current = null;
  };

  const scheduleProgressFlush = () => {
    if (progressTimerRef.current) return; // already scheduled
    progressTimerRef.current = setTimeout(flushPendingProgress, 200); // 200 ms debounce
  };
  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (peerRef.current) {
        peerRef.current.destroy();
      }
    };
  }, []);

  const broadcastToRoom = useCallback((type, payload) => {
    let packetCount = 0;
    Object.values(connectionsRef.current).forEach(conn => {
      if (conn.open) {
        conn.send({ type, ...payload });
        packetCount++;
      }
    });
    console.log(`[P2P Serverless] 📡 Broadcasted '${type}' packet to ${packetCount} peers.`);
  }, []);

  const updatePlayersAndBroadcast = useCallback((playersMap) => {
    const playersArr = Object.values(playersMap);
    updateRoomData({ ...roomDataRef.current, players: playersArr });
    broadcastToRoom('room_update', { players: playersArr, host: roomDataRef.current?.host });
  }, [broadcastToRoom, updateRoomData]);

  const checkGameFinished = useCallback((playersMap) => {
      const room = roomDataRef.current;
      if (!room || room.state !== 'PLAYING') {
         updateRoomData({ ...room, players: Object.values(playersMap) });
         return;
      }
      
      const playersArr = Object.values(playersMap);
      const allFinished = playersArr.every(p => p.finished);
      
      if (allFinished) {
         updateRoomData({ ...room, players: playersArr, state: 'FINISHED' });
         const leaderboardArr = playersArr.sort((a,b) => b.score - a.score);
         setLeaderboard(leaderboardArr);
         broadcastToRoom('room_game_over', { leaderboard: leaderboardArr });
      } else {
         updateRoomData({ ...room, players: playersArr });
      }
  }, [broadcastToRoom, updateRoomData]);

  const createRoom = useCallback((playerName, onJoin) => {
    setError('');
    const roomId = Math.random().toString(36).substring(2, 6).toUpperCase();
    const peerId = `${PREFIX}${roomId}`;
    
    // Explicitly configure public PeerJS broker for ultra-reliable signaling
    const peer = new Peer(peerId, {
       debug: 1, // log warnings
       secure: true
    });
    
    peerRef.current = peer;

    peer.on('open', (id) => {
      console.log(`[P2P Engine] 🚀 HOST Node created securely. Peer ID: ${id}`);
      setIsConnected(true);
      setSocketId(id);
      
      const hostState = { id, name: playerName || 'HACKER', score: 0, alive: true, finished: false, isReady: true };
      const initialRoom = { roomId, host: id, state: 'LOBBY', players: [hostState] };
      
      updateRoomData(initialRoom);
      roomDataRef.current = initialRoom;
      
      if (onJoin) onJoin({ success: true, roomId, host: id, isHost: true });
    });

    peer.on('connection', (conn) => {
      connectionsRef.current[conn.peer] = conn;

      conn.on('data', (data) => {
        const room = roomDataRef.current;
        if (!room) return;

        // Map array to object for quick manipulation
        const playersMap = room.players.reduce((acc, p) => ({...acc, [p.id]: p}), {});

        switch (data.type) {
          case 'join_request':
             if (room.state !== 'LOBBY') {
                conn.send({ type: 'room_error', message: 'ERROR: Match sequence already initiated.' });
                return;
             }
             playersMap[conn.peer] = {
                id: conn.peer,
                name: data.playerName || 'OPERATIVE',
                score: 0,
                alive: true,
                finished: false,
                isReady: false
             };
             // Push an accept back to the joinee with initial structural data
             conn.send({ type: 'join_accept', roomId: room.roomId, host: room.host });
             updatePlayersAndBroadcast(playersMap);
             break;

          case 'toggle_ready':
             if (room.state !== 'LOBBY') return;
             if (playersMap[conn.peer]) {
               playersMap[conn.peer].isReady = !playersMap[conn.peer].isReady;
               updatePlayersAndBroadcast(playersMap);
             }
             break;

          case 'player_progress':
             if (playersMap[conn.peer]) {
               playersMap[conn.peer].score = data.score;
               playersMap[conn.peer].alive = data.alive;
               if (!data.alive) playersMap[conn.peer].finished = true;
               
               console.log(`[P2P Host] 📥 Received Progress from ${conn.peer} - Score: ${data.score}`);
               // Lightweight broadcast
               broadcastToRoom('player_update', { playerId: conn.peer, score: data.score, alive: data.alive });
               
               checkGameFinished(playersMap);
             }
             break;

          case 'player_finished':
             if (playersMap[conn.peer]) {
               playersMap[conn.peer].score = data.score;
               playersMap[conn.peer].finished = true;
               checkGameFinished(playersMap);
             }
             break;
          default:
             break;
        }
      });

      conn.on('close', () => {
         const room = roomDataRef.current;
         if (room) {
           const playersMap = room.players.reduce((acc, p) => ({...acc, [p.id]: p}), {});
           delete playersMap[conn.peer];
           if (connectionsRef.current[conn.peer]) {
             connectionsRef.current[conn.peer].close();
             delete connectionsRef.current[conn.peer];
           }
           updatePlayersAndBroadcast(playersMap);
           checkGameFinished(playersMap); 
         }
      });
    });

    peer.on('error', (err) => {
       console.error('[P2P SERVER PROTOCOL ERROR] The WebRTC connection threw a terminal error:', err);
       setError('P2P SERVER PROTOCOL ERROR: ' + err.message);
    });

  }, [updatePlayersAndBroadcast, broadcastToRoom, checkGameFinished]);

  const joinRoom = useCallback((roomId, playerName, onJoin) => {
    setError('');
    const targetPeerId = `${PREFIX}${roomId}`;
    
    // Create random ID for Joinee
    const peer = new Peer({ secure: true });
    peerRef.current = peer;

    peer.on('open', (id) => {
      console.log(`[P2P Engine] 🔗 JOINEE Node resolved. Connecting to Host ID: ${targetPeerId}`);
      setIsConnected(true);
      setSocketId(id);
      
      const conn = peer.connect(targetPeerId, { reliable: true });
      connRef.current = conn;

      conn.on('open', () => {
         console.log(`[P2P Engine] ✅ Direct WebRTC connection to Host confirmed! Handshaking...`);
         // Auto handshake
         conn.send({ type: 'join_request', playerName });
      });

      conn.on('data', (data) => {
         switch (data.type) {
            case 'join_accept':
               if (onJoin) onJoin({ success: true, roomId: data.roomId, host: data.host, isHost: false });
               break;
            case 'room_update':
               const now = Date.now();
               if (now - lastUpdateRef.current < 100) return; // Throttle to 10fps
               lastUpdateRef.current = now;
                updateRoomData({
                  roomId: roomDataRef.current?.roomId || roomId,
                  host: data.host,
                  players: data.players
                });
               break;
            case 'player_update':
               const pNow = Date.now();
               if (pNow - lastUpdateRef.current < 50) return; // Throttle to 20fps for specific updates
               lastUpdateRef.current = pNow;
                const prev = roomDataRef.current;
                if (!prev) return;
                const newPlayers = prev.players.map(p => 
                  p.id === data.playerId ? { ...p, score: data.score, alive: data.alive } : p
                );
                updateRoomData({ ...prev, players: newPlayers });
               break;
            case 'game_started':
               setSyncedWords(data.words);
               break;
            case 'room_error':
               setError(data.message);
               break;
            case 'room_game_over':
               setLeaderboard(data.leaderboard);
               break;
            default:
               break;
         }
      });

      conn.on('close', () => {
         console.warn(`[P2P Link Warning] Host closed the connection socket permanently.`);
         setIsConnected(false);
         setError('LINK DISCONNECTED: Host terminated session.');
      });
    });

    peer.on('error', (err) => {
       console.error('[P2P UPLINK ERROR]', err);
       setError('P2P UPLINK ERROR: ' + err.message);
    });

  }, []);

  const startGame = useCallback((roomId) => {
     const room = roomDataRef.current;
     if (room && room.host === peerRef.current?.id) {
        updateRoomData({ ...room, state: 'PLAYING' });
       
       // Pre-generate pseudo-random fallback words locally
       // Generate 15 full loops to ensure they don't run out fast.
       const synchronizedWords = [];
       for (let i = 0; i < 15; i++) {
          const shuffled = [...FALLBACK_WORDS].sort(() => Math.random() - 0.5);
          synchronizedWords.push(...shuffled);
       }
       setSyncedWords(synchronizedWords);

       // Broadcast to all clients
       broadcastToRoom('game_started', { words: synchronizedWords });
     }
  }, [broadcastToRoom]);

  const reportProgress = useCallback((roomId, score, alive) => {
     // [EXTREME OPTIMIZATION]: Throttle logic. 
     // We cannot blast the P2P connection 50 times a second if there are 10 players typing constantly.
     // It will trigger massive React tree re-renders and blackout the browser.
     const now = Date.now();
     const isDeathEvent = !alive;
     const scoreChanged = score !== lastScoreRef.current;
     
     // Only broadcast if the player died OR if the score updated and 250ms have passed.
     if (!isDeathEvent && (!scoreChanged || now - broadcastThrottleRef.current < 250)) {
        return; // Suppress packet to save CPU
     }
     
     broadcastThrottleRef.current = now;
     lastScoreRef.current = score;

     // If host: mutate own state and broadcast
     if (peerRef.current?.id === roomDataRef.current?.host) {
        const room = roomDataRef.current;
        if (!room) return;
        const playersMap = room.players.reduce((acc, p) => ({...acc, [p.id]: p}), {});
        const myId = peerRef.current.id;
        
        if (playersMap[myId]) {
           playersMap[myId].score = score;
           playersMap[myId].alive = alive;
           if (!alive) playersMap[myId].finished = true;
           
           console.log(`[P2P Host System] 📤 Throttled Self-Broadcast. Score: ${score}`);
           broadcastToRoom('player_update', { playerId: myId, score, alive });
           checkGameFinished(playersMap);
        }
     } else if (connRef.current?.open) {
        // If joinee: send to host
        console.log(`[P2P Joinee System] 📤 Emitting Data Packet to Host. Score: ${score}`);
        connRef.current.send({ type: 'player_progress', score, alive });
     }
  }, [broadcastToRoom, checkGameFinished]);

  const reportFinished = useCallback((roomId, score) => {
     if (peerRef.current?.id === roomDataRef.current?.host) {
        const room = roomDataRef.current;
        if (!room) return;
        const playersMap = room.players.reduce((acc, p) => ({...acc, [p.id]: p}), {});
        const myId = peerRef.current.id;
        
        if (playersMap[myId]) {
           playersMap[myId].score = score;
           playersMap[myId].finished = true;
           checkGameFinished(playersMap);
        }
     } else if (connRef.current?.open) {
        connRef.current.send({ type: 'player_finished', score });
     }
  }, [checkGameFinished]);

  const toggleReady = useCallback((roomId) => {
     if (connRef.current?.open) {
        connRef.current.send({ type: 'toggle_ready' });
     }
  }, []);

   const resetMultiplayerState = useCallback(() => {
    Object.values(connectionsRef.current).forEach(conn => {
      if (conn.open) conn.close();
    });
    connectionsRef.current = {};
    if (connRef.current?.open) connRef.current.close();
    connRef.current = null;
    
    if (peerRef.current) {
      peerRef.current.destroy();
      peerRef.current = null;
    }
    
    if (progressTimerRef.current) {
      clearTimeout(progressTimerRef.current);
      progressTimerRef.current = null;
    }
    pendingProgressRef.current = null;
    setSocketId(null);
    updateRoomData(null);
    setSyncedWords([]);
    setLeaderboard(null);
    setError('');
    setIsConnected(false);
  }, [updateRoomData]);

  return useMemo(() => ({
    socket: { id: socketId }, // Legacy map for UI compatibility
    isConnected,
    roomData,
    syncedWords,
    leaderboard,
    error,
    createRoom,
    joinRoom,
    startGame,
    reportProgress,
    reportFinished,
    toggleReady,
    resetMultiplayerState
  }), [socketId, isConnected, roomData, syncedWords, leaderboard, error, createRoom, joinRoom, startGame, reportProgress, reportFinished, toggleReady, resetMultiplayerState]);
}
