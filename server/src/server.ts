import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { createServer } from 'http';
import dotenv from 'dotenv';
import { connectDB } from './config/database';
import authRoutes from './routes/auth';
import messageRoutes from './routes/chat';
import { createSocketServer, createSocketService } from './chat';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

const server = createServer(app);

// Create Socket.IO server
const io = createSocketServer(server);

// Initialize socket service using functional factory
const socketService = createSocketService(io);

// ============================================================================
// MIDDLEWARE
// ============================================================================

app.use(helmet());
app.use(
	cors({
		origin: ['http://localhost:3000', 'http://localhost:3001'],
		credentials: true,
	}),
);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ============================================================================
// ROUTES
// ============================================================================

// Health check route
app.get('/api/health', (req, res) => {
	res.json({
		status: 'OK',
		message: 'HubImmo API is running',
		timestamp: new Date().toISOString(),
		socketIO: 'Connected',
		onlineUsers: socketService.getOnlineUsers().length,
	});
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/message', messageRoutes);

// Handle 404 routes
app.use('*', (req, res) => {
	res.status(404).json({
		success: false,
		message: 'Route not found',
	});
});

// ============================================================================
// SOCKET INTEGRATION
// ============================================================================

// Make socket service available to message controller for real-time updates
// This allows the controller to emit socket events after database operations
export const getSocketService = () => socketService;

// ============================================================================
// SERVER STARTUP
// ============================================================================

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
	console.error(
		'❌ Environment variables not loaded. Please check your .env file',
	);
	process.exit(1);
}

startServer();

// ============================================================================
// GRACEFUL SHUTDOWN
// ============================================================================

process.on('SIGTERM', () => {
	console.log('SIGTERM received, shutting down gracefully');
	io.close(() => {
		console.log('Socket.IO server closed');
		process.exit(0);
	});
});

process.on('SIGINT', () => {
	console.log('SIGINT received, shutting down gracefully');
	io.close(() => {
		console.log('Socket.IO server closed');
		process.exit(0);
	});
});
