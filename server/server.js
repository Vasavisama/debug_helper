// Load env vars FIRST — before any route/controller imports
require('dotenv').config();

const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
const connectDB = require('./config/db');
const setupSocket = require('./socket');

// Route imports
const authRoutes = require('./routes/authRoutes');
const errorRoutes = require('./routes/errorRoutes');
const solutionRoutes = require('./routes/solutionRoutes');
const voteRoutes = require('./routes/voteRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const messageRoutes = require('./routes/messageRoutes');
const replyRoutes = require('./routes/replyRoutes');
const aiRoutes = require('./routes/aiRoutes');

// Connect to Database
connectDB();

const app = express();
const server = http.createServer(app);

// Enable CORS and JSON body parser
app.use(cors());
app.use(express.json());

// Socket.io initialization
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});
setupSocket(io);

// Pass io to routes if needed (though we handled most emit logic inside socket/index.js)
app.use((req, res, next) => {
    req.io = io;
    next();
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/errors', errorRoutes);
app.use('/api/solutions', solutionRoutes);
app.use('/api/votes', voteRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/replies', replyRoutes);
app.use('/api/ai', aiRoutes);

app.get('/', (req, res) => {
  res.send('DebugHelper API is running...');
});

const DEFAULT_PORT = parseInt(process.env.PORT, 10) || 5000;

server.listen(DEFAULT_PORT, () => {
  console.log(`✅ Server running on port ${DEFAULT_PORT}`);
});

