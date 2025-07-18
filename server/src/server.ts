import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { connectDB } from './config/database';
import authRoutes from './routes/auth';
// import { errorHandler } from './middleware/errorHandler';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Rate limiting
const limiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 100, // limit each IP to 100 requests per windowMs
	message: 'Too many requests from this IP, please try again later.',
});

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(limiter);

// Health check route
app.get('/api/health', (req, res) => {
	res.json({
		status: 'OK',
		message: 'HubImmo API is running',
		timestamp: new Date().toISOString(),
	});
});

// Routes
app.use('/api/auth', authRoutes);

// Error handling middleware
// app.use(errorHandler);

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
		// First connect to database
		await connectDB();

		// Then start the server
		app.listen(PORT, () => {
			console.log(`🚀 Server is running on port ${PORT}`);
			console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
		});
	} catch (error) {
		console.error('❌ Failed to start server:', error);
		process.exit(1);
	}
};

// Ensure environment is loaded before starting
if (!process.env.MONGODB_URL) {
	console.error(
		'❌ Environment variables not loaded. Please check your .env file',
	);
	process.exit(1);
}

startServer();

// Graceful shutdown
process.on('SIGTERM', () => {
	console.log('SIGTERM received, shutting down gracefully');
	process.exit(0);
});

process.on('SIGINT', () => {
	console.log('SIGINT received, shutting down gracefully');
	process.exit(0);
});
