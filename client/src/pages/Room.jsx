import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { socket } from '../socket';
import Board from '../components/Board';

const Room = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [players, setPlayers] = useState([]);
  const [positions, setPositions] = useState({});
  const [balances, setBalances] = useState({});
  const [myId, setMyId] = useState(null);
  const [dice, setDice] = useState(null);
  const [currentTurnId, setCurrentTurnId] = useState(null);
  const [ownedTiles, setOwnedTiles] = useState({});
  const [purchasePrompt, setPurchasePrompt] = useState(null);

  const colorPalette = ['red', 'blue', 'green', 'purple', 'orange', 'magenta', 'cyan', 'yellow'];

  useEffect(() => {
    const action = sessionStorage.getItem('action');
    const nickname = sessionStorage.getItem('nickname') || 'Player';
    setMyId(socket.id);

    if (action === 'join') {
      socket.emit('join_room', { roomId, nickname });
    }

    socket.emit('get_room_players', roomId);
    socket.emit('get_positions', roomId);
    socket.emit('get_balances', roomId);
    socket.emit('get_ownership', roomId);

    socket.on('room_update', (roomPlayers) => {
      const withColors = roomPlayers.map((p, i) => ({
        ...p,
        color: colorPalette[i % colorPalette.length]
      }));
      setPlayers(withColors);
    });

    socket.on('position_update', (pos) => {
      setPositions(pos);
      const myPos = pos[socket.id];
      const buyableTiles = [
        1, 3, 4, 6, 7, 9, 11, 12, 14, 17, 19,
        21, 23, 26, 28, 29, 31, 33, 34, 36, 38, 39,
        5, 15, 25, 35, 8, 32
      ];
      const isBuyable = buyableTiles.includes(myPos);
      const isFree = isBuyable && !ownedTiles[myPos];

      if (isFree && socket.id === currentTurnId) {
        setPurchasePrompt(myPos);
      } else {
        setPurchasePrompt(null);
      }
    });

    socket.on('balance_update', (b) => setBalances(b));
    socket.on('ownership_update', (own) => {
      setOwnedTiles(own);
      setPurchasePrompt(null);
    });
    socket.on('turn_update', (id) => setCurrentTurnId(id));

    return () => {
      socket.off('room_update');
      socket.off('position_update');
      socket.off('balance_update');
      socket.off('ownership_update');
      socket.off('turn_update');
    };
  }, [roomId, currentTurnId]);

  useEffect(() => {
    if (!currentTurnId && players.length > 0 && myId && players[0].id === myId) {
      socket.emit('turn_update', { roomId, nextId: myId });
    }
  }, [players, myId, currentTurnId, roomId]);

  const rollDice = () => {
    if (myId !== currentTurnId) return;

    const dice1 = Math.ceil(Math.random() * 6);
    const dice2 = Math.ceil(Math.random() * 6);
    const total = dice1 + dice2;
    setDice([dice1, dice2]);

    socket.emit('roll_dice', {
      roomId,
      rolled: total,
      playerId: myId
    });

    const currentIndex = players.findIndex(p => p.id === currentTurnId);
    const nextIndex = (currentIndex + 1) % players.length;
    const nextId = players[nextIndex]?.id;
    socket.emit('turn_update', { roomId, nextId });
  };

  const isMyTurn = myId === currentTurnId;
  const currentPlayer = players.find(p => p.id === currentTurnId);
  const currentIndex = players.findIndex(p => p.id === currentTurnId);
  const nextPlayer = players[(currentIndex + 1) % players.length];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: '#d1dce5' }}>
      <div style={{
        display: 'flex',
        flex: 1,
        padding: '20px',
        gap: '20px'
      }}>
        <div style={{
          width: '20%',
          background: 'linear-gradient(145deg, #6ee7b7, #3b82f6)',
          padding: '10px',
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          color: 'white'
        }}>
          <div style={{ overflowY: 'auto', maxHeight: '60vh' }}>
            <h3>Игроки</h3>
            <ul>
              {players.map((player) => (
                <li key={player.id}>
                  <span style={{ color: player.color }}>⬤</span> {player.name} – поз. {positions[player.id] ?? 0} – 💰 ${balances[player.id] ?? 0}
                </li>
              ))}
            </ul>
          </div>

          {purchasePrompt !== null && (
            <div style={{ background: 'white', color: 'black', border: '2px dashed #aaa', padding: 14, borderRadius: 12, marginBottom: 10, textAlign: 'center' }}>
              <p style={{ fontWeight: 'bold' }}>Тайл {purchasePrompt} доступен для покупки</p>
              <button
                onClick={() => {
                  socket.emit('buy_tile', {
                    roomId,
                    tileIndex: purchasePrompt,
                    buyerId: myId
                  });
                  setPurchasePrompt(null);
                }}
                style={{
                  background: 'linear-gradient(145deg, #22c55e, #15803d)',
                  color: 'white',
                  padding: '12px 24px',
                  fontSize: '16px',
                  border: 'none',
                  borderRadius: '10px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  boxShadow: '0 8px 16px rgba(0,0,0,0.3)'
                }}
              >
                Купить за $200
              </button>
            </div>
          )}

          <div style={{ marginTop: 'auto', textAlign: 'center' }}>
            <button
              onClick={rollDice}
              disabled={!isMyTurn}
              style={{
                padding: '12px 24px',
                fontWeight: 'bold',
                background: isMyTurn ? '#facc15' : '#aaa',
                border: 'none',
                borderRadius: '10px',
                color: '#000',
                cursor: isMyTurn ? 'pointer' : 'not-allowed',
                fontSize: '16px'
              }}
            >
              {isMyTurn ? 'Бросить кубик' : 'Не твой ход'}
            </button>
            {dice && <p style={{ marginTop: 10 }}>Выпало: {dice[0]} и {dice[1]}</p>}
          </div>
        </div>

        <div style={{ flex: 1, backgroundColor: '#bde0fe', borderRadius: '12px', boxShadow: '0 0 20px rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ aspectRatio: '1 / 1', width: '100%', maxWidth: '700px' }}>
            <Board players={players} positions={positions} owned={ownedTiles} />
          </div>
        </div>

        <div style={{ width: '20%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '10px', background: 'linear-gradient(145deg, #f472b6, #c084fc)', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.3)', color: 'white' }}>
          <div style={{ padding: '10px' }}>
            <h3>Ход</h3>
            <p>Сейчас: {currentPlayer?.name || '—'}</p>
            <p>Следующий: {nextPlayer?.name || '—'}</p>
          </div>

          <div style={{ textAlign: 'center' }}>
            <button style={{ backgroundColor: '#3b82f6', color: 'white', padding: '12px 24px', borderRadius: '10px', border: 'none', fontWeight: 'bold' }}>
              Словарь
            </button>
          </div>

          <div style={{ padding: '10px' }}>
            <h3>Комната</h3>
            <p>{roomId}</p>
          </div>

          <div style={{ textAlign: 'center' }}>
            <button
              onClick={() => navigate('/')}
              style={{ backgroundColor: 'red', color: 'white', padding: '12px 24px', borderRadius: '10px', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}
            >
              🚪 Выйти
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Room;
