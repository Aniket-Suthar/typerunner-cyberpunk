import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useGameContext } from '../../context/GameContext';

export default function ModeSelection({ onCreateRoom, onJoinRoom }) {
  const { actions } = useGameContext();
  const [mode, setMode] = useState(null); // 'SINGLE' or 'MULTI'
  const [playerName, setPlayerName] = useState('');
  const [roomCode, setRoomCode] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const invite = params.get('invite');
    if (invite) {
      setMode('MULTI');
      actions.setGameMode('MULTI');
      setRoomCode(invite.toUpperCase());
    }
  }, [actions]);

  const handleSinglePlayer = () => {
    actions.setGameMode('SINGLE');
    // Proceeds back to IDLE which shows the MainMenu
  };

  const handleMultiPlayer = () => {
    setMode('MULTI');
    actions.setGameMode('MULTI');
  };

  const handleJoinOrCreate = (action) => {
    if (!playerName) return alert("Enter an alias!");
    actions.setPlayerName(playerName);
    
    if (action === 'CREATE') {
      onCreateRoom(playerName);
    } else if (action === 'JOIN') {
      if (!roomCode) return alert("Enter Room Code!");
      onJoinRoom(roomCode, playerName);
    }
  };

  if (!mode) {
    return (
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      >
        <div className="border border-cyber-border bg-cyber-dark p-8 md:p-12 text-center rounded-xl max-w-md w-full shadow-[0_0_50px_rgba(0,240,255,0.2)]">
          <h1 className="text-4xl md:text-5xl font-orbitron font-bold text-cyber-primary mb-8 tracking-wider mix-blend-screen" style={{ textShadow: "0 0 10px #00f0ff, 0 0 20px #00f0ff" }}>
            SELECT MODE
          </h1>

          <div className="flex flex-col gap-4">
            <button
              onClick={handleSinglePlayer}
              className="px-8 py-4 bg-cyber-darker border-2 border-green-500 text-green-400 font-orbitron font-bold text-xl tracking-widest uppercase hover:bg-green-500/20 hover:shadow-[0_0_30px_#00ff88] transition-all transform hover:scale-105 skew-x-[-10deg]"
            >
              <div className="skew-x-[10deg]">SOLO RUN</div>
            </button>
            <button
              onClick={handleMultiPlayer}
              className="px-8 py-4 bg-cyber-darker border-2 border-purple-500 text-purple-400 font-orbitron font-bold text-xl tracking-widest uppercase hover:bg-purple-500/20 hover:shadow-[0_0_30px_rgb(168,85,247)] transition-all transform hover:scale-105 skew-x-[-10deg]"
            >
              <div className="skew-x-[10deg]">MULTIPLAYER</div>
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  // Multiplayer sub-menu
  return (
    <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      >
        <div className="border border-cyber-border bg-cyber-dark p-8 md:p-12 text-center rounded-xl max-w-md w-full shadow-[0_0_50px_rgba(0,240,255,0.2)] flex flex-col gap-6">
          <h2 className="text-3xl font-orbitron font-bold text-purple-400 mb-2 tracking-wider" style={{ textShadow: "0 0 10px rgb(168,85,247)" }}>
            NETWORK LINK
          </h2>
          
          <div className="text-left">
            <label className="block text-xs font-mono text-gray-400 mb-1">OPERATIVE ALIAS</label>
            <input 
              type="text" 
              value={playerName}
              onChange={e => setPlayerName(e.target.value)}
              className="w-full bg-black/50 border border-cyber-border p-3 text-cyber-primary font-mono outline-none focus:border-cyber-primary"
              placeholder="HACKER_99"
            />
          </div>

          <div className="flex gap-4">
             <button
                onClick={() => handleJoinOrCreate('CREATE')}
                className="flex-1 py-3 bg-cyber-darker border border-purple-500 text-purple-400 font-orbitron font-bold text-sm hover:bg-purple-500/20 transition-all skew-x-[-10deg]"
              >
                <div className="skew-x-[10deg]">CREATE ROOM</div>
              </button>
          </div>

          <div className="relative border-t border-cyber-border my-2">
            <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-cyber-dark px-2 text-xs font-mono text-gray-500">OR</span>
          </div>

          <div className="flex items-center gap-2">
             <input 
                type="text" 
                value={roomCode}
                onChange={e => setRoomCode(e.target.value.toUpperCase())}
                maxLength={4}
                className="w-1/2 bg-black/50 border border-cyber-border p-3 text-center text-cyber-secondary font-mono text-xl uppercase tracking-[0.3em] outline-none focus:border-cyber-secondary"
                placeholder="XXXX"
              />
              <button
                onClick={() => handleJoinOrCreate('JOIN')}
                className="flex-1 py-3 h-full bg-cyber-darker border border-pink-500 text-pink-400 font-orbitron font-bold hover:bg-pink-500/20 transition-all"
              >
                JOIN
              </button>
          </div>

          <button
              onClick={() => setMode(null)}
              className="mt-4 text-xs font-mono text-gray-500 hover:text-white transition-colors"
            >
              [ RETURN TO SELECTION ]
          </button>
        </div>
    </motion.div>
  );
}
