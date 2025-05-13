import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { socket } from '../socket';

const Home = () => {
  const [roomId, setRoomId] = useState('');
  const [nickname, setNickname] = useState('');
  const navigate = useNavigate();

  const generateRoomId = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let id = '';
    for (let i = 0; i < 6; i++) {
      id += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return id;
  };

  const createRoom = () => {
    const finalRoomId = roomId.trim() !== '' ? roomId : generateRoomId();
    if (!nickname.trim()) return;
    sessionStorage.setItem('action', 'create');
    sessionStorage.setItem('nickname', nickname);
    socket.emit('create_room', { roomId: finalRoomId, nickname });
    navigate(`/room/${finalRoomId}`);
  };

  const joinRoom = () => {
    if (!roomId.trim() || !nickname.trim()) return;
    sessionStorage.setItem('action', 'join');
    sessionStorage.setItem('nickname', nickname);
    navigate(`/room/${roomId}`);
  };

  return (
    <div style={{
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #2b5876, #4e4376)',
      color: 'white',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h1 style={{ fontSize: '3em', marginBottom: '40px', textShadow: '2px 2px 8px rgba(0,0,0,0.3)' }}>Монополия Онлайн</h1>

      <input
        placeholder="Ваш никнейм"
        value={nickname}
        onChange={e => setNickname(e.target.value)}
        style={{
          padding: '15px',
          fontSize: '16px',
          marginBottom: '20px',
          borderRadius: '10px',
          border: 'none',
          width: '250px',
          boxShadow: '0 0 10px rgba(0,0,0,0.2)'
        }}
      />
      <input
        placeholder="ID комнаты (опционально)"
        value={roomId}
        onChange={e => setRoomId(e.target.value)}
        style={{
          padding: '15px',
          fontSize: '16px',
          marginBottom: '30px',
          borderRadius: '10px',
          border: 'none',
          width: '250px',
          boxShadow: '0 0 10px rgba(0,0,0,0.2)'
        }}
      />

      <div style={{ display: 'flex', gap: '20px' }}>
        <button
          onClick={createRoom}
          style={{
            background: 'linear-gradient(145deg, #6ee7b7, #3b82f6)',
            padding: '15px 30px',
            fontSize: '18px',
            border: 'none',
            borderRadius: '12px',
            color: 'white',
            fontWeight: 'bold',
            boxShadow: '0 10px 20px rgba(0,0,0,0.3)',
            cursor: 'pointer',
            transition: 'transform 0.2s'
          }}
          onMouseOver={e => e.currentTarget.style.transform = 'scale(1.05)'}
          onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
        >
          Создать комнату
        </button>
        <button
          onClick={joinRoom}
          style={{
            background: 'linear-gradient(145deg, #f472b6, #c084fc)',
            padding: '15px 30px',
            fontSize: '18px',
            border: 'none',
            borderRadius: '12px',
            color: 'white',
            fontWeight: 'bold',
            boxShadow: '0 10px 20px rgba(0,0,0,0.3)',
            cursor: 'pointer',
            transition: 'transform 0.2s'
          }}
          onMouseOver={e => e.currentTarget.style.transform = 'scale(1.05)'}
          onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
        >
          Присоединиться
        </button>
      </div>
    </div>
  );
};

export default Home;
