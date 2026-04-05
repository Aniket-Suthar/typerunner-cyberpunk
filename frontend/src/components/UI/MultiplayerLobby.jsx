import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function MultiplayerLobby({ roomData, socketId, onStart, onLeave, onToggleReady, error }) {
  if (!roomData) return null;

  const isHost = roomData.host === socketId;
  const players = roomData.players || [];
  const [copied, setCopied] = useState(false);

  // Consider it ready if all non-host players have clicked ready, or if host is playing solo.
  const nonHostPlayers = players.filter(p => p.id !== roomData.host);
  const allReady = nonHostPlayers.length > 0 && nonHostPlayers.every(p => p.isReady);

  const handleCopyLink = () => {
    const link = `${window.location.origin}/?invite=${roomData.roomId}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
    >
      <div className="border border-purple-500/50 bg-cyber-dark p-8 md:p-12 text-center rounded-xl max-w-2xl w-full shadow-[0_0_50px_rgba(168,85,247,0.2)]">
        <div className="flex justify-between items-start mb-8">
           <div className="text-left">
             <h2 className="text-3xl font-orbitron font-bold text-purple-400 tracking-wider">
               ACCESS GRANTED
             </h2>
             <p className="text-xs font-mono text-gray-400 mt-1">WAITING FOR OPERATIVES...</p>
           </div>
           <div className="flex flex-col gap-2">
             <div className="bg-black/50 border border-cyber-border px-6 py-2">
               <div className="text-xs font-mono text-gray-500">ROOM CODE</div>
               <div className="text-3xl font-mono text-cyber-secondary tracking-widest">{roomData.roomId}</div>
             </div>
             <button 
               onClick={handleCopyLink}
               className="text-xs font-mono px-2 py-1 border border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/20 transition-colors"
             >
               {copied ? 'COPIED!' : 'COPY INVITE LINK'}
             </button>
           </div>
        </div>

        {error && (
            <div className="bg-red-900/50 border border-red-500 text-red-300 px-4 py-2 mb-6 font-mono text-sm">
              {error}
            </div>
        )}

        <div className="bg-black/60 border border-cyber-border mb-8 max-h-[40vh] overflow-y-auto">
          <ul className="text-left w-full">
             <AnimatePresence>
              {players.map((p, index) => (
                <motion.li 
                  key={p.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className={`border-b border-cyber-border/30 px-6 py-4 flex justify-between items-center ${p.id === socketId ? 'bg-purple-900/20' : ''}`}
                >
                  <div className="flex items-center gap-4">
                    <span className="text-gray-600 font-mono text-sm">{String(index + 1).padStart(2, '0')}</span>
                    <span className={`font-orbitron font-bold ${p.id === socketId ? 'text-cyber-primary' : 'text-gray-300'}`}>
                      {p.name} {p.id === socketId && '(YOU)'}
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    {p.id === roomData.host ? (
                      <span className="bg-purple-500/20 text-purple-400 px-2 py-1 text-xs font-mono border border-purple-500/30">HOST</span>
                    ) : (
                      <span className={`px-2 py-1 text-xs font-mono border ${p.isReady ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-red-500/20 text-red-400 border-red-500/30'}`}>
                        {p.isReady ? 'READY' : 'STANDBY'}
                      </span>
                    )}
                  </div>
                </motion.li>
              ))}
             </AnimatePresence>
          </ul>
          {players.length === 0 && <div className="p-8 text-gray-500 font-mono">NO DATA</div>}
        </div>

        <div className="flex justify-between items-center gap-4">
           <button
              onClick={onLeave}
              className="px-6 py-3 border border-red-500/50 text-red-400 font-mono hover:bg-red-500/10 transition-colors"
           >
             ABORT CONNECTION
           </button>
           
           {isHost ? (
             <button
               onClick={onStart}
               disabled={!allReady && nonHostPlayers.length > 0}
               className="px-8 py-3 bg-purple-600/20 border-2 border-purple-500 text-purple-400 font-orbitron font-bold text-xl hover:bg-purple-500 hover:text-white hover:shadow-[0_0_20px_rgb(168,85,247)] transition-all disabled:opacity-50 disabled:cursor-not-allowed skew-x-[-10deg]"
               title={(!allReady && nonHostPlayers.length > 0) ? "Waiting for operatives to be ready" : "Start the game"}
             >
               <div className="skew-x-[10deg]">INITIATE SEQUENCE</div>
             </button>
           ) : (
             <button
               onClick={() => onToggleReady(roomData.roomId)}
               className={`px-8 py-3 border-2 font-orbitron font-bold text-xl transition-all skew-x-[-10deg] ${
                 players.find(p => p.id === socketId)?.isReady 
                 ? 'bg-green-600/20 border-green-500 text-green-400 hover:bg-green-500 hover:text-white hover:shadow-[0_0_20px_rgb(34,197,94)]'
                 : 'bg-yellow-600/20 border-yellow-500 text-yellow-400 hover:bg-yellow-500 hover:text-white hover:shadow-[0_0_20px_rgb(234,179,8)]'
               }`}
             >
               <div className="skew-x-[10deg]">
                 {players.find(p => p.id === socketId)?.isReady ? "READY (CLICK TO CANCEL)" : "MARK READY"}
               </div>
             </button>
           )}
        </div>
      </div>
    </motion.div>
  );
}
