import { useEffect, useRef, useState, useCallback } from 'react';
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

  // Maintain active ref to roomData to avoid stale closures in Peer callbacks
  const roomDataRef = useRef(null);
  useEffect(() => {
    roomDataRef.current = roomData;
  }, [roomData]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (peerRef.current) {
        peerRef.current.destroy();
      }
    };
  }, []);

  const broadcastToRoom = useCallback((type, payload) => {
    Object.values(connectionsRef.current).forEach(conn => {
      if (conn.open) {
        conn.send({ type, ...payload });
      }
    });
  }, []);

  const updatePlayersAndBroadcast = useCallback((playersMap) => {
    const playersArr = Object.values(playersMap);
    setRoomData(prev => ({ ...prev, players: playersArr }));
    broadcastToRoom('room_update', { players: playersArr, host: roomDataRef.current?.host });
  }, [broadcastToRoom]);

  const checkGameFinished = useCallback((playersMap) => {
      const room = roomDataRef.current;
      if (!room || room.state !== 'PLAYING') {
         setRoomData(prev => ({ ...prev, players: Object.values(playersMap) }));
         return;
      }
      
      const allFinished = Object.values(playersMap).every(p => p.finished);
      setRoomData(prev => ({ ...prev, players: Object.values(playersMap) }));

      if (allFinished) {
         setRoomData(prev => ({ ...prev, state: 'FINISHED' }));
         const leaderboardArr = Object.values(playersMap).sort((a,b) => b.score - a.score);
         setLeaderboard(leaderboardArr);
         broadcastToRoom('room_game_over', { leaderboard: leaderboardArr });
      }
  }, [broadcastToRoom]);

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
      setIsConnected(true);
      setSocketId(id);
      
      const hostState = { id, name: playerName || 'HACKER', score: 0, alive: true, finished: false, isReady: true };
      const initialRoom = { roomId, host: id, state: 'LOBBY', players: [hostState] };
      
      setRoomData(initialRoom);
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
           delete connectionsRef.current[conn.peer];
           updatePlayersAndBroadcast(playersMap);
           checkGameFinished(playersMap); // Safely checks and forces completion if last player left
         }
      });
    });

    peer.on('error', (err) => {
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
      setIsConnected(true);
      setSocketId(id);
      
      const conn = peer.connect(targetPeerId, { reliable: true });
      connRef.current = conn;

      conn.on('open', () => {
         // Auto handshake
         conn.send({ type: 'join_request', playerName });
      });

      conn.on('data', (data) => {
         switch (data.type) {
            case 'join_accept':
               if (onJoin) onJoin({ success: true, roomId: data.roomId, host: data.host, isHost: false });
               break;
            case 'room_update':
               setRoomData(prev => ({
                 ...(prev || {}),
                 roomId: prev?.roomId || roomId,
                 host: data.host,
                 players: data.players
               }));
               break;
            case 'player_update':
               setRoomData(prev => {
                  if (!prev) return prev;
                  const newPlayers = prev.players.map(p => 
                    p.id === data.playerId ? { ...p, score: data.score, alive: data.alive } : p
                  );
                  return { ...prev, players: newPlayers };
               });
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
         setIsConnected(false);
         setError('LINK DISCONNECTED: Host terminated session.');
      });
    });

    peer.on('error', (err) => {
       setError('P2P UPLINK ERROR: ' + err.message);
    });

  }, []);

  const startGame = useCallback((roomId) => {
     const room = roomDataRef.current;
     if (room && room.host === peerRef.current?.id) {
       setRoomData(prev => ({ ...prev, state: 'PLAYING' }));
       
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
           
           broadcastToRoom('player_update', { playerId: myId, score, alive });
           checkGameFinished(playersMap);
        }
     } else if (connRef.current?.open) {
        // If joinee: send to host
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
    if (peerRef.current) peerRef.current.destroy();
    setSocketId(null);
    setRoomData(null);
    setSyncedWords([]);
    setLeaderboard(null);
    setError('');
    setIsConnected(false);
  }, []);

  return {
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
  };
}
