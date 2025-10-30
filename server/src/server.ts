import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { createServer } from 'http';
import dotenv from 'dotenv';
import { connectDB } from './config/database';
import authRoutes from './routes/auth';
import messageRoutes from './routes/chat';
import propertyRoutes from './routes/property';
import collaborationRoutes from './routes/collaboration';
import contractRoutes from './routes/contract';
import searchAdRoutes from './routes/searchAds';
import uploadRoutes from './routes/uploadRoutes';
import notificationRoutes from './routes/notifications';
import favoritesRoutes from './routes/favorites';
import appointmentRoutes from './routes/appointments';
import { createSocketServer, createSocketService } from './chat';
import { requestLogger } from './middleware/requestLogger';
import { logger } from './utils/logger';
import {
	csrfProtection,
	generateCsrfToken,
	csrfErrorHandler,
} from './middleware/csrf';

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

app.use(
	helmet({
		contentSecurityPolicy: {
			directives: {
				defaultSrc: ["'self'"],
				scriptSrc: ["'self'", "'unsafe-inline'"],
				styleSrc: [
					"'self'",
					"'unsafe-inline'",
					'https://fonts.googleapis.com',
				],
				fontSrc: ["'self'", 'https://fonts.gstatic.com'],
				imgSrc: [
					"'self'",
					'data:',
					'blob:',
					'https://*.amazonaws.com',
					'https://mon-hub-immo.s3.eu-west-3.amazonaws.com',
				],
				connectSrc: [
					"'self'",
					'http://localhost:3000',
					'http://localhost:4000',
					'ws://localhost:4000',
					'wss://*.vercel.app',
					process.env.FRONTEND_URL ||
						'https://mon-hub-immo.vercel.app',
				],
				mediaSrc: ["'self'", 'https://*.amazonaws.com'],
				objectSrc: ["'none'"],
				frameSrc: ["'none'"],
				baseUri: ["'self'"],
				formAction: ["'self'"],
				upgradeInsecureRequests:
					process.env.NODE_ENV === 'production' ? [] : null,
			},
		},
		hsts: {
			maxAge: 31536000, // 1 year
			includeSubDomains: true,
			preload: true,
		},
		frameguard: { action: 'deny' },
		noSniff: true,
		xssFilter: true,
		referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
		// Additional security headers
		permittedCrossDomainPolicies: { permittedPolicies: 'none' },
		dnsPrefetchControl: { allow: false },
	}),
);

// Additional security headers not covered by Helmet
app.use((req, res, next) => {
	// Permissions-Policy: Control browser features
	res.setHeader(
		'Permissions-Policy',
		'camera=(), microphone=(), geolocation=(self), payment=(), usb=(), interest-cohort=()',
	);

	// Expect-CT: Certificate Transparency enforcement
	if (process.env.NODE_ENV === 'production') {
		res.setHeader('Expect-CT', 'max-age=86400, enforce');
	}

	// X-Permitted-Cross-Domain-Policies: Restrict cross-domain policy files
	res.setHeader('X-Permitted-Cross-Domain-Policies', 'none');

	next();
});
app.use(
	cors({
		origin: [
			'http://localhost:3000',
			'http://localhost:3001',
			process.env.FRONTEND_URL || 'https://mon-hub-immo.vercel.app',
		],
		credentials: true,
	}),
);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Force HTTPS in production
if (process.env.NODE_ENV === 'production') {
	app.use((req, res, next) => {
		if (req.header('x-forwarded-proto') !== 'https') {
			res.redirect(301, `https://${req.header('host')}${req.url}`);
		} else {
			next();
		}
	});
}

// Request logging middleware (only in development or with explicit flag)
if (
	process.env.NODE_ENV !== 'production' ||
	process.env.ENABLE_REQUEST_LOGGING === 'true'
) {
	app.use(requestLogger);
}

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

// CSRF token endpoint (must be before protected routes)
app.get('/api/csrf-token', csrfProtection, generateCsrfToken);

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/message', messageRoutes);
app.use('/api/property', csrfProtection, propertyRoutes);
app.use('/api/collaboration', csrfProtection, collaborationRoutes);
app.use('/api/contract', csrfProtection, contractRoutes);
app.use('/api/search-ads', csrfProtection, searchAdRoutes);
app.use('/api/upload', csrfProtection, uploadRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/favorites', csrfProtection, favoritesRoutes);
app.use('/api/appointments', csrfProtection, appointmentRoutes);

// CSRF error handler (must be after routes that use CSRF)
app.use(csrfErrorHandler);

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
			logger.info(`🚀 Server is running on port ${PORT}`);
			logger.info(`📊 Health check: http://localhost:${PORT}/api/health`);
			logger.info(`🔌 Socket.IO: http://localhost:${PORT}/socket.io/`);
		});
	} catch (error) {
		logger.error('❌ Failed to start server:', error);
		process.exit(1);
	}
};

if (!process.env.MONGODB_URL) {
	logger.error(
		'❌ Environment variables not loaded. Please check your .env file',
	);
	process.exit(1);
}

startServer();

// ============================================================================
// GRACEFUL SHUTDOWN
// ============================================================================

process.on('SIGTERM', () => {
	logger.info('SIGTERM received, shutting down gracefully');
	io.close(() => {
		logger.info('Socket.IO server closed');
		process.exit(0);
	});
});

process.on('SIGINT', () => {
	logger.info('SIGINT received, shutting down gracefully');
	io.close(() => {
		logger.info('Socket.IO server closed');
		process.exit(0);
	});
});
