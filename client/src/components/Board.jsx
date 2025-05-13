import React from 'react';

const tiles = Array.from({ length: 40 }, (_, i) => `/tiles/tile${i + 1}.svg`);

const tileStyles = (index) => {
  if ([0, 10, 20, 30].includes(index)) return { width: 100, height: 100 };
  if ((index >= 1 && index <= 9) || (index >= 21 && index <= 29)) return { width: 60, height: 100 };
  return { width: 100, height: 60 };
};

const calculatePosition = (index) => {
  const offset = 100 + 9 * 60;
  const shiftAllLeft = -20;

  if (index === 0) return { top: 0, left: 0 + shiftAllLeft };
  if (index >= 1 && index <= 9) return { top: 0, left: index * 60 + 45 + shiftAllLeft };
  if (index === 10) return { top: 0, left: offset + shiftAllLeft + 4 };
  if (index > 10 && index < 20) return {
    top: (index - 10) * 60 + 40,
    left: offset + 10 + shiftAllLeft - 5,
  };
  if (index === 20) return { top: offset, left: offset + shiftAllLeft + 5 };
  if (index === 21) return { top: offset, left: offset - 60 + shiftAllLeft };
  if (index === 22) return { top: offset, left: offset - 2 * 60 + shiftAllLeft };
  if (index > 22 && index < 30) return { top: offset, left: offset - (index - 20) * 60 + shiftAllLeft };
  if (index === 30) return { top: offset, left: 0 + shiftAllLeft };
  if (index > 30 && index < 40) return { top: offset - (index - 30) * 60, left: 0 + shiftAllLeft };

  return { top: 0, left: 0 };
};

const playerOffsets = [
  [5, 5], [40, 5], [5, 40], [40, 40]
];

const Board = ({ players, positions, owned }) => {
  const boardSize = 100 + 9 * 60;

  return (
    <div
      style={{
        position: 'relative',
        width: boardSize + 140,
        height: boardSize + 140,
        backgroundColor: 'transparent',
        marginLeft: '-60px',
        outline: 'none',
        border: 'none',
      }}
    >
      {tiles.map((src, index) => {
        const style = tileStyles(index);
        const pos = calculatePosition(index);
        const ownerId = owned?.[index];
        const ownerColor = players.find(p => p.id === ownerId)?.color;

        return (
          <img
            key={index}
            src={src}
            alt={`tile-${index}`}
            style={{
              position: 'absolute',
              top: pos.top,
              left: pos.left,
              width: style.width,
              height: style.height,
              outline: ownerColor ? `3px solid ${ownerColor}` : 'none'
            }}
          />
        );
      })}

      {players.map((player, i) => {
        const tileIndex = positions[player.id] ?? 0;
        const pos = calculatePosition(tileIndex);
        const [dx, dy] = playerOffsets[i % playerOffsets.length];

        return (
          <div
            key={player.id}
            style={{
              position: 'absolute',
              top: pos.top + dy,
              left: pos.left + dx,
              width: 12,
              height: 12,
              borderRadius: '50%',
              backgroundColor: player.color,
              border: '2px solid white',
              zIndex: 10,
              transition: 'top 0.3s, left 0.3s'
            }}
          />
        );
      })}
    </div>
  );
};

export default Board;
