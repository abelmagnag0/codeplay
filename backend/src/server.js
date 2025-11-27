require('dotenv').config();

const http = require('http');
const { Server } = require('socket.io');
const app = require('./app');
const connectDatabase = require('./config/database');
const { loadEnv } = require('./config/env');
const registerSocketHandlers = require('./sockets');
const tokenService = require('./services/tokenService');
const userRepository = require('./repositories/userRepository');
const roomService = require('./services/roomService');

const port = Number(process.env.PORT) || 4000;

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_ORIGIN || '*',
    methods: ['GET', 'POST'],
  },
});

app.set('io', io);

io.use(async (socket, next) => {
  try {
    const authToken =
      socket.handshake.auth?.token || socket.handshake.headers.authorization?.split(' ')[1];

    if (!authToken) {
      return next(new Error('Authentication required'));
    }

    const decoded = tokenService.verify(authToken, process.env.JWT_SECRET);
    const enriched = { ...decoded };

    if (!enriched.email || !enriched.name) {
      const user = await userRepository.findById(decoded.id).select('email name avatar role');
      if (!user) {
        return next(new Error('Invalid token'));
      }

      if (!enriched.email) {
        enriched.email = user.email;
      }
      if (!enriched.name) {
        enriched.name = user.name;
      }
      if (!enriched.avatar && user.avatar) {
        enriched.avatar = user.avatar;
      }
      if (!enriched.role && user.role) {
        enriched.role = user.role;
      }
    }

    socket.user = {
      id: enriched.id,
      role: enriched.role,
      email: enriched.email,
      name: enriched.name,
      avatar: enriched.avatar,
    };
    return next();
  } catch (error) {
    return next(new Error('Invalid token'));
  }
});

io.on('connection', (socket) => {
  registerSocketHandlers(io, socket);
});

const scheduleEmptyRoomCleanup = (ioInstance) => {
  const intervalMs = Number(process.env.EMPTY_ROOM_CLEANUP_INTERVAL_MS) || 10_000;

  const runCleanup = async () => {
    try {
      const removedRoomIds = await roomService.pruneEmptyRooms();
      removedRoomIds.forEach((roomId) => {
        ioInstance.emit('room:closed', { roomId });
      });
    } catch (error) {
      console.error('Failed to prune empty rooms', error);
    }
  };

  runCleanup();
  const timer = setInterval(runCleanup, intervalMs);
  if (typeof timer.unref === 'function') {
    timer.unref();
  }
};

scheduleEmptyRoomCleanup(io);

const bootstrap = async () => {
  try {
    loadEnv();
    await connectDatabase();
    server.listen(port, () => {
      /* eslint-disable no-console */
      console.log(`Server listening on port ${port}`);
      /* eslint-enable no-console */
    });
  } catch (error) {
    console.error('Failed to start server', error);
    process.exit(1);
  }
};

bootstrap();
