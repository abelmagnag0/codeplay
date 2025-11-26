require('dotenv').config();

const http = require('http');
const { Server } = require('socket.io');
const app = require('./app');
const connectDatabase = require('./config/database');
const { loadEnv } = require('./config/env');
const registerSocketHandlers = require('./sockets');

const port = Number(process.env.PORT) || 4000;

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_ORIGIN || '*',
    methods: ['GET', 'POST'],
  },
});

io.on('connection', (socket) => {
  registerSocketHandlers(io, socket);
});

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
