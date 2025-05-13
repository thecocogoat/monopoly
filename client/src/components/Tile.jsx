import React from 'react';

const Tile = ({ name, width, height, color, rotate = 0 }) => {
  return (
    <div style={{
      width,
      height,
      backgroundColor: color || '#C7E6CF',
      transform: `rotate(${rotate}deg)`,
      transformOrigin: 'center',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      border: '1px solid black',
      fontSize: '10px',
      boxSizing: 'border-box',
    }}>
      <div>{name}</div>
    </div>
  );
};

export default Tile;
