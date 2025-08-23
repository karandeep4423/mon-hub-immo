import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import { connectDB } from './config/database';
import authRoutes from './routes/auth';
import messageRoutes from './routes/message';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

const server = createServer(app);

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:3000", "http://localhost:3001"],
    methods: ["GET", "POST"],
    credentials: true
  },
});

const userSocketMap: Record<string, string> = {};

io.on("connection", (socket) => {
  console.log("🔌 User connected:", socket.id);
  const userId = socket.handshake.query.userId as string;

  if (userId && userId !== "undefined") {
    userSocketMap[userId] = socket.id;
    console.log("✅ User mapped:", userId, "->", socket.id);

    // Update user status to online
    socket.broadcast.emit("userStatusUpdate", {
      userId,
      status: "online",
      lastSeen: new Date(),
    });
  }

  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  // Handle typing events
  socket.on("typing", (data) => {
    const { receiverId, isTyping } = data;
    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("userTyping", {
        senderId: userId,
        isTyping,
      });
    }
  });

  // Handle user status updates
  socket.on("updateStatus", (status) => {
    socket.broadcast.emit("userStatusUpdate", {
      userId,
      status,
      lastSeen: new Date(),
    });
  });

  socket.on("disconnect", () => {
    console.log("❌ User disconnected:", socket.id);
    if (userId && userId !== "undefined") {
      delete userSocketMap[userId];
      console.log("🗑️ User unmapped:", userId);
      
      // Update user's last seen when disconnecting
      socket.broadcast.emit("userStatusUpdate", {
        userId,
        status: "offline",
        lastSeen: new Date(),
      });
    }
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

export function getReceiverSocketId(userId: string): string | undefined {
  return userSocketMap[userId];
}

export { io };

// Middleware
app.use(helmet());
app.use(cors({
  origin: ["http://localhost:3000", "http://localhost:3001"],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check route
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'HubImmo API is running',
    timestamp: new Date().toISOString(),
    socketIO: 'Connected'
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/message', messageRoutes);

// Handle 404 routes
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

// Start server
const startServer = async () => {
  try {
    await connectDB();
    server.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
      console.log(`🔌 Socket.IO: http://localhost:${PORT}/socket.io/`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

if (!process.env.MONGODB_URL) {
  console.error('❌ Environment variables not loaded. Please check your .env file');
  process.exit(1);
}

startServer();

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  if (io) {
    io.close(() => {
      console.log('Socket.IO server closed');
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  if (io) {
    io.close(() => {
      console.log('Socket.IO server closed');
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
});
