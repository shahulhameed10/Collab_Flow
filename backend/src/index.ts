import http from 'http';
import express, { Request, Response } from 'express';
import { Server } from 'socket.io';
import sequelize from './utils/db';
import authRoutes from './routes/authRoutes';
import workspaceRoutes from './routes/workspaceRoutes';
import projectRoutes from './routes/projectRoutes';
import taskRoutes from './routes/taskRoutes';
import taskCommentRoutes from './routes/taskCommentRoutes';
import statsRoutes from './routes/statsRoutes';
import { errorHandler } from './middlewares/errorHandler';
import { seedData } from './utils/seed';
import * as dotenv from 'dotenv';
import cors from 'cors';
import './models/Association';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  })
);

app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/workspaces', workspaceRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/comments', taskCommentRoutes);
app.use('/api', statsRoutes);

// Basic test route
app.get('/', (_req: Request, res: Response) => {
  res.send('🚀 CollabFlow API is running!');
});

// Centralized error handler
app.use(errorHandler);

// Create HTTP server and attach Socket.IO
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Share io instance across the app
app.locals.io = io;

// Socket.IO Events
io.on('connection', (socket) => {
  console.log('🔗 A user connected');

  socket.on('new-task', (task) => {
    socket.broadcast.emit('task-updated', task);
  });

  socket.on('new-comment', (comment) => {
    socket.broadcast.emit('new-comment', comment);
  });

  socket.on('disconnect', () => {
    console.log('❌ User disconnected');
  });

  socket.on('error', (err) => {
    console.error('Socket error received:', err);
  });
});

// Start server with DB connection
const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('🟢 Database connected successfully.');

    // Sync models and seed data (optional in production)
    await sequelize.sync({ force: true });
    await seedData();

    server.listen(PORT, () => {
      console.log(`🚀 Server with Socket.IO running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Error starting the server:', error);
  }
};

startServer();
