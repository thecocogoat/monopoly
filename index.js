const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] }
});

const rooms = {};
const positions = {};
const currentTurns = {};
const balances = {};
const owned = {};

io.on('connection', (socket) => {

  socket.on('create_room', ({ roomId, nickname }) => {
    if (!rooms[roomId]) rooms[roomId] = [];
    rooms[roomId].push({ id: socket.id, name: nickname });
    socket.join(roomId);

    if (!positions[roomId]) positions[roomId] = {};
    positions[roomId][socket.id] = 0;

    if (!balances[roomId]) balances[roomId] = {};
    balances[roomId][socket.id] = 1500;

    if (!owned[roomId]) owned[roomId] = {};

    io.to(roomId).emit('room_update', rooms[roomId]);
    io.to(roomId).emit('position_update', positions[roomId]);
    io.to(roomId).emit('balance_update', balances[roomId]);
    io.to(roomId).emit('ownership_update', owned[roomId]);

    if (!currentTurns[roomId]) {
      currentTurns[roomId] = socket.id;
      io.to(roomId).emit('turn_update', socket.id);
    }
  });

  socket.on('join_room', ({ roomId, nickname }) => {
    if (!rooms[roomId]) return;

    const alreadyInRoom = rooms[roomId].some(p => p.id === socket.id);
    if (!alreadyInRoom) {
      rooms[roomId].push({ id: socket.id, name: nickname });
      socket.join(roomId);
    }

    if (!positions[roomId]) positions[roomId] = {};
    positions[roomId][socket.id] = 0;

    if (!balances[roomId]) balances[roomId] = {};
    balances[roomId][socket.id] = 1500;

    if (!owned[roomId]) owned[roomId] = {};

    io.to(roomId).emit('room_update', rooms[roomId]);
    io.to(roomId).emit('position_update', positions[roomId]);
    io.to(roomId).emit('balance_update', balances[roomId]);
    io.to(roomId).emit('ownership_update', owned[roomId]);

    if (!currentTurns[roomId]) {
      currentTurns[roomId] = socket.id;
      io.to(roomId).emit('turn_update', socket.id);
    }
  });

  socket.on('get_room_players', (roomId) => {
    socket.emit('room_update', rooms[roomId] || []);
  });

  socket.on('get_positions', (roomId) => {
    socket.emit('position_update', positions[roomId] || {});
  });

  socket.on('get_balances', (roomId) => {
    socket.emit('balance_update', balances[roomId] || {});
  });

  socket.on('get_ownership', (roomId) => {
    socket.emit('ownership_update', owned[roomId] || {});
  });

  socket.on('roll_dice', ({ roomId, rolled, playerId }) => {
    if (!positions[roomId]) return;

    const pos = positions[roomId][playerId] ?? 0;
    const newPos = (pos + rolled) % 40;
    positions[roomId][playerId] = newPos;

    if (pos + rolled >= 40) {
      balances[roomId][playerId] += 200;
    }

    const ownerId = owned[roomId]?.[newPos];
    const buyableTiles = [
      1, 3, 6, 8, 9, 11, 13, 14, 16, 18, 19,
      21, 23, 24, 26, 27, 29, 31, 32, 34, 37, 39,
      5, 15, 25, 35, 12, 28
    ];
    const isBuyable = buyableTiles.includes(newPos);

    if (isBuyable && ownerId && ownerId !== playerId) {
      balances[roomId][playerId] -= 200;
      balances[roomId][ownerId] += 200;
    }

    io.to(roomId).emit('position_update', positions[roomId]);
    io.to(roomId).emit('balance_update', balances[roomId]);
  });

  socket.on('buy_tile', ({ roomId, tileIndex, buyerId }) => {
    const buyableTiles = [1, 3, 5, 6, 8, 9, 11, 12, 13, 14, 15, 16, 18, 19, 21, 23, 24, 25, 26, 27, 28, 29, 31, 32, 34, 35, 37, 39];
    if (!buyableTiles.includes(tileIndex)) return;

    if (!owned[roomId]) owned[roomId] = {};
    if (!balances[roomId]) balances[roomId] = {};

    const alreadyOwned = !!owned[roomId][tileIndex];
    const hasMoney = balances[roomId][buyerId] >= 200;

    if (!alreadyOwned && hasMoney) {
      owned[roomId][tileIndex] = buyerId;
      balances[roomId][buyerId] -= 200;

      io.to(roomId).emit('ownership_update', owned[roomId]);
      io.to(roomId).emit('balance_update', balances[roomId]);
    }
  });

  socket.on('turn_update', ({ roomId, nextId }) => {
    currentTurns[roomId] = nextId;
    io.to(roomId).emit('turn_update', nextId);
  });

  socket.on('disconnect', () => {
    for (const roomId in rooms) {
      const wasCurrent = currentTurns[roomId] === socket.id;

      rooms[roomId] = rooms[roomId].filter(p => p.id !== socket.id);
      if (positions[roomId]) delete positions[roomId][socket.id];
      if (balances[roomId]) delete balances[roomId][socket.id];

      io.to(roomId).emit('room_update', rooms[roomId]);
      io.to(roomId).emit('position_update', positions[roomId]);
      io.to(roomId).emit('balance_update', balances[roomId]);

      if (rooms[roomId].length === 0) {
        delete rooms[roomId];
        delete positions[roomId];
        delete balances[roomId];
        delete currentTurns[roomId];
        delete owned[roomId];
      }

      if (wasCurrent && rooms[roomId]?.[0]) {
        const newTurnId = rooms[roomId][0].id;
        currentTurns[roomId] = newTurnId;
        io.to(roomId).emit('turn_update', newTurnId);
      }
    }

    console.log(`Отключён: ${socket.id}`);
  });
});

server.listen(3001, () => {
  console.log('Сервер запущен на http://localhost:3001');
});
