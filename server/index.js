import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Get current file path and directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables with explicit path
dotenv.config({ path: join(__dirname, '../.env') });

// Import routes
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import communityRoutes from './routes/communities.js';
import courseRoutes from './routes/courses.js';

// Create Express app
const app = express();
const httpServer = createServer(app);

// Socket.io setup
const io = new Server(httpServer, {
  cors: {
    origin: process.env.VITE_API_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/communities', communityRoutes);
app.use('/api/courses', courseRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to ProConnect API' });
});

// Socket.io connection handler
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on('join-room', (roomId) => {
    socket.join(roomId);
    console.log(`User ${socket.id} joined room: ${roomId}`);
  });

  socket.on('leave-room', (roomId) => {
    socket.leave(roomId);
    console.log(`User ${socket.id} left room: ${roomId}`);
  });

  socket.on('send-message', (data) => {
    io.to(data.roomId).emit('receive-message', data);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// MongoDB connection options
const mongooseOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 30000,
  socketTimeoutMS: 45000,
  family: 4,
  authSource: 'admin',
  retryWrites: true,
  w: 'majority'
};

// Verify MongoDB URI
if (!process.env.MONGODB_URI) {
  console.error('MONGODB_URI is not defined in environment variables');
  process.exit(1);
}

// Connect to MongoDB with enhanced error handling
mongoose.connect(process.env.MONGODB_URI, mongooseOptions)
  .then(() => {
    console.log('Connected to MongoDB successfully');
    
    // Start server only after successful database connection
    const PORT = process.env.PORT || 5000;
    httpServer.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('MongoDB connection error details:');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error code:', error.code);
    if (error.reason) {
      console.error('Error reason:', error.reason);
    }
    process.exit(1);
  });

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.log('UNHANDLED REJECTION! Shutting down...');
  console.error(err.name, err.message);
  process.exit(1);
});