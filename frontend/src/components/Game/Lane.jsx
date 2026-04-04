/**
 * Lane Component
 * Single Responsibility: Renders one lane of the track with perspective grid lines.
 */

import React from 'react';

export default function Lane({ index, totalLanes, trackHeight }) {
  const laneWidth = 100 / totalLanes;

  return (
    <div
      className="absolute top-0 bottom-0"
      style={{
        left: `${index * laneWidth}%`,
        width: `${laneWidth}%`,
        borderLeft: index > 0 ? '1px solid rgba(0, 240, 255, 0.08)' : 'none',
        borderRight: index < totalLanes - 1 ? '1px solid rgba(0, 240, 255, 0.08)' : 'none',
      }}
    >
      {/* Perspective grid lines (horizontal) */}
      {Array.from({ length: 12 }).map((_, i) => (
        <div
          key={i}
          className="absolute w-full"
          style={{
            top: `${(i / 12) * 100}%`,
            height: '1px',
            background: `linear-gradient(90deg, transparent, rgba(0, 240, 255, ${0.02 + (i / 12) * 0.06}), transparent)`,
          }}
        />
      ))}

      {/* Center guide line */}
      <div
        className="absolute left-1/2 top-0 bottom-0 w-px"
        style={{
          background: 'linear-gradient(to bottom, transparent 0%, rgba(0, 240, 255, 0.04) 30%, rgba(0, 240, 255, 0.08) 70%, rgba(0, 240, 255, 0.12) 100%)',
        }}
      />
    </div>
  );
}
