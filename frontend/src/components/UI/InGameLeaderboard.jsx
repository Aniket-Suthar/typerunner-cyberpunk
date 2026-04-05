import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function InGameLeaderboard({ roomData, socketId }) {
  if (!roomData || !roomData.players) return null;

  // Sort players by score
  const sortedPlayers = [...roomData.players].sort((a, b) => b.score - a.score);

  return (
    <div className="absolute top-24 right-4 z-40 w-64 pointer-events-none">
      <div className="bg-cyber-darker border border-cyber-border rounded-lg p-4 shadow-[0_0_20px_rgba(0,250,255,0.1)]">
        <h3 className="text-xs font-orbitron font-bold text-cyber-primary tracking-widest mb-3 border-b border-cyber-border/50 pb-2">
          LIVE RANKINGS
        </h3>
        <AnimatePresence>
          <div className="flex flex-col gap-2">
             {sortedPlayers.map((player, index) => {
               const isMe = player.id === socketId;
               return (
                 <motion.div
                   key={player.id}
                   layout
                   initial={{ opacity: 0, x: 20 }}
                   animate={{ opacity: 1, x: 0 }}
                   className={`flex justify-between items-center p-2 rounded border-l-2 ${isMe ? 'bg-cyan-900/30 border-cyan-400' : 'bg-black/40 border-cyber-border/30'}`}
                 >
                   <div className="flex items-center gap-2">
                     <span className={`text-[10px] font-mono ${index === 0 ? 'text-yellow-500' : 'text-gray-500'}`}>
                       #{index + 1}
                     </span>
                     <span className={`text-xs font-orbitron font-bold truncate max-w-[80px] ${!player.alive ? 'text-red-500 line-through' : isMe ? 'text-cyan-300' : 'text-gray-300'}`}>
                       {player.name}
                     </span>
                   </div>
                   <span className="text-xs font-mono font-bold text-cyber-secondary">
                     {player.score.toLocaleString()}
                   </span>
                 </motion.div>
               );
             })}
          </div>
        </AnimatePresence>
      </div>
    </div>
  );
}
