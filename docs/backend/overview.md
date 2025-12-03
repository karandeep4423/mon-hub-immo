# Backend Guide

> Express.js server architecture, controllers, middleware, and services

---

## 🏗 Architecture Overview

The backend is built with **Express.js** and **TypeScript**, following a layered architecture.

### Key Technologies

| Technology         | Purpose                 |
| ------------------ | ----------------------- |
| Express.js 4.x     | Web framework           |
| TypeScript 5.x     | Type safety             |
| MongoDB + Mongoose | Database                |
| Socket.IO          | Real-time communication |
| JWT                | Authentication          |
| Zod                | Validation              |
| Winston            | Logging                 |

---

## 📁 Directory Structure

```
server/src/
├── server.ts              # Application entry point
│
├── config/
│   └── database.ts       # MongoDB connection
│
├── chat/                  # Socket.IO module
│   ├── index.ts          # Module exports
│   ├── socketConfig.ts   # Socket server setup
│   ├── socketManager.ts  # Connection management
│   ├── socketService.ts  # Event emission service
│   ├── messageHandler.ts # Message event handlers
│   └── notificationSocket.ts
│
├── controllers/           # Request handlers
│   ├── authController.ts
│   ├── propertyController.ts
│   ├── collaborationController.ts
│   ├── chatController.ts
│   ├── searchAdController.ts
│   ├── appointmentController.ts
│   ├── favoritesController.ts
│   ├── contractController.ts
│   └── adminController.ts
│
├── middleware/            # Express middleware
│   ├── auth.ts           # JWT authentication
│   ├── authorize.ts      # Role-based access
│   ├── rateLimiter.ts    # Rate limiting
│   ├── loginRateLimiter.ts
│   ├── csrf.ts           # CSRF protection
│   ├── validation.ts     # Request validation
│   ├── subscription.ts   # Payment checking
│   ├── uploadMiddleware.ts
│   ├── requestLogger.ts
│   └── errorHandler.ts
│
├── models/                # Mongoose schemas
│   ├── User.ts
│   ├── Property.ts
│   ├── Collaboration.ts
│   ├── Chat.ts
│   ├── SearchAd.ts
│   ├── Appointment.ts
│   ├── Notification.ts
│   └── [Entity].ts
│
├── routes/                # Express routes
│   ├── auth.ts
│   ├── property.ts
│   ├── collaboration.ts
│   ├── chat.ts
│   ├── searchAds.ts
│   ├── appointments.ts
│   ├── favorites.ts
│   ├── payment.ts
│   ├── admin.ts
│   └── uploadRoutes.ts
│
├── services/              # Business logic
│   ├── s3Service.ts      # AWS S3 operations
│   ├── notificationService.ts
│   └── appointmentEmailService.ts
│
├── utils/                 # Utilities
│   ├── jwt.ts            # Token management
│   ├── emailService.ts   # Email sending
│   ├── logger.ts         # Winston logger
│   ├── sanitize.ts       # Input sanitization
│   ├── cookieHelper.ts   # Cookie management
│   ├── redisClient.ts    # Redis operations
│   ├── passwordValidator.ts
│   ├── passwordHistory.ts
│   └── securityLogger.ts
│
├── validation/            # Zod schemas
│   ├── schemas.ts        # Validation schemas
│   └── middleware.ts     # Validation middleware
│
└── types/                 # TypeScript types
    └── auth.ts           # Auth-related types
```

---

## 🚀 Server Setup

### Entry Point

```typescript
// server.ts
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { createServer } from 'http';
import { connectDB } from './config/database';
import { createSocketServer, createSocketService } from './chat';

const app = express();
const server = createServer(app);

// Create Socket.IO server
const io = createSocketServer(server);
const socketService = createSocketService(io);

// Middleware
app.set('trust proxy', 1);
app.use(helmet({ ... }));
app.use(cors({ origin: ALLOWED_ORIGINS, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/property', csrfProtection, propertyRoutes);
app.use('/api/collaboration', csrfProtection, collaborationRoutes);
// ... other routes

// Start server
const startServer = async () => {
  await connectDB();
  server.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`);
  });
};

startServer();
```

### Database Connection

```typescript
// config/database.ts
import mongoose from "mongoose";

export const connectDB = async (): Promise<void> => {
  await mongoose.connect(process.env.MONGODB_URL, {
    serverSelectionTimeoutMS: 10000,
    socketTimeoutMS: 45000,
    maxPoolSize: 10,
  });
  logger.info("MongoDB Connected");
};

// Handle connection events
mongoose.connection.on("disconnected", () =>
  logger.warn("MongoDB disconnected")
);
mongoose.connection.on("reconnected", () => logger.info("MongoDB reconnected"));
mongoose.connection.on("error", (err) => logger.error("MongoDB error:", err));
```

---

## 🛣 Routes

### Route Pattern

```typescript
// routes/property.ts
import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import { requireActiveSubscription } from '../middleware/subscription';
import { requireOwnership, requireRole } from '../middleware/authorize';
import { getProperties, createProperty, ... } from '../controllers/propertyController';

const router = Router();

// Public routes
router.get('/', getProperties);
router.get('/:id', getPropertyById);

// Protected routes (require auth + subscription)
router.post(
  '/create-property',
  authenticateToken,
  requireActiveSubscription,
  requireRole(['agent', 'apporteur', 'admin']),
  uploadProperty,
  createProperty
);

router.put(
  '/:id/update',
  authenticateToken,
  requireActiveSubscription,
  requireOwnership(Property),
  uploadProperty,
  updateProperty
);

router.delete(
  '/:id',
  authenticateToken,
  requireActiveSubscription,
  requireOwnership(Property),
  deleteProperty
);

export default router;
```

### Route Registration

```typescript
// server.ts
// API routes with CSRF protection for state-changing operations
app.use("/api/auth", authRoutes);
app.use("/api/message", messageRoutes);
app.use("/api/property", csrfProtection, propertyRoutes);
app.use("/api/collaboration", csrfProtection, collaborationRoutes);
app.use("/api/search-ads", csrfProtection, searchAdRoutes);
app.use("/api/appointments", csrfProtection, appointmentRoutes);
app.use("/api/favorites", csrfProtection, favoritesRoutes);
app.use("/api/admin", adminRouter);
app.use("/api/payment", paymentRoutes);
```

---

## 🎮 Controllers

### Controller Pattern

Controllers handle HTTP request/response and delegate to models:

```typescript
// controllers/propertyController.ts
import { Request, Response } from 'express';
import { Property } from '../models/Property';
import { S3Service } from '../services/s3Service';
import { logger } from '../utils/logger';
import { AuthRequest } from '../types/auth';

export const getProperties = async (req: Request, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 12, city, minPrice, maxPrice } = req.query;

    // Build query
    const query: Record<string, any> = { status: 'active' };
    if (city) query.city = city;
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // Execute query
    const properties = await Property.find(query)
      .populate('owner', 'firstName lastName profileImage')
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    const total = await Property.countDocuments(query);

    res.json({
      success: true,
      properties,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit)),
        limit: Number(limit),
      },
    });
  } catch (error) {
    logger.error('[PropertyController] getProperties error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const createProperty = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { title, description, price, ... } = req.body;
    const userId = req.userId;

    // Validate and sanitize
    const sanitizedTitle = sanitizeString(title);
    const sanitizedDescription = sanitizeHtmlContent(description);

    // Handle image upload
    const s3Service = new S3Service();
    let mainImage = null;

    if (req.files?.mainImage) {
      const result = await s3Service.uploadImage({
        buffer: req.files.mainImage[0].buffer,
        originalName: req.files.mainImage[0].originalname,
        userId,
        folder: 'properties',
      });
      mainImage = { url: result.url, key: result.key };
    }

    // Create property
    const property = await Property.create({
      title: sanitizedTitle,
      description: sanitizedDescription,
      price,
      mainImage,
      owner: userId,
      // ... other fields
    });

    res.status(201).json({ success: true, property });
  } catch (error) {
    logger.error('[PropertyController] createProperty error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
```

---

## 🔒 Middleware

### Authentication Middleware

```typescript
// middleware/auth.ts
import { Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt";
import { User } from "../models/User";
import { AuthRequest } from "../types/auth";
import { getAccessTokenFromCookies } from "../utils/cookieHelper";
import { isTokenBlacklisted } from "../utils/redisClient";

export const authenticateToken = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Get token from httpOnly cookie
    const token = getAccessTokenFromCookies(req.cookies);

    if (!token) {
      res
        .status(401)
        .json({ success: false, message: "Authentication required" });
      return;
    }

    // Check if token is blacklisted (revoked)
    if (await isTokenBlacklisted(token)) {
      res.status(401).json({ success: false, message: "Token revoked" });
      return;
    }

    // Verify token
    const decoded = verifyToken(token);

    // Get user from database
    const user = await User.findById(decoded.userId);
    if (!user) {
      res.status(401).json({ success: false, message: "User not found" });
      return;
    }

    // Check if blocked
    if (user.isBlocked) {
      res.status(403).json({ success: false, message: "Account blocked" });
      return;
    }

    // Check if validated
    if (!user.isValidated && user.userType !== "admin") {
      res
        .status(403)
        .json({ success: false, message: "Account not validated" });
      return;
    }

    // Attach user to request
    req.userId = user._id.toString();
    req.user = { id: user._id.toString(), userType: user.userType };

    next();
  } catch (error) {
    res.status(403).json({ success: false, message: "Invalid token" });
  }
};

// Admin-only middleware
export const requireAdmin = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  if (req.user?.userType !== "admin") {
    res.status(403).json({ success: false, message: "Admin access required" });
    return;
  }
  next();
};
```

### Authorization Middleware

```typescript
// middleware/authorize.ts
import { Response, NextFunction } from "express";
import { AuthRequest } from "../types/auth";
import mongoose from "mongoose";

// Role-based access
export const requireRole = (roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.userType)) {
      res.status(403).json({ success: false, message: "Access denied" });
      return;
    }
    next();
  };
};

// Ownership check
export const requireOwnership = (Model: mongoose.Model<any>) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const doc = await Model.findById(req.params.id);
      if (!doc) {
        res.status(404).json({ success: false, message: "Not found" });
        return;
      }

      const ownerId = doc.owner?.toString() || doc.authorId?.toString();
      if (ownerId !== req.userId) {
        res.status(403).json({ success: false, message: "Not authorized" });
        return;
      }

      next();
    } catch (error) {
      res.status(500).json({ success: false, message: "Server error" });
    }
  };
};

// Collaboration access (owner or collaborator)
export const requireCollaborationAccess = () => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { Collaboration } = await import("../models/Collaboration");
    const collab = await Collaboration.findById(req.params.id);

    if (!collab) {
      res
        .status(404)
        .json({ success: false, message: "Collaboration not found" });
      return;
    }

    const isOwner = collab.postOwnerId.toString() === req.userId;
    const isCollaborator = collab.collaboratorId.toString() === req.userId;

    if (!isOwner && !isCollaborator) {
      res.status(403).json({ success: false, message: "Access denied" });
      return;
    }

    req.collaboration = collab;
    req.isOwner = isOwner;
    next();
  };
};
```

### Rate Limiting

```typescript
// middleware/rateLimiter.ts
import rateLimit from "express-rate-limit";

export const generalLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 250,
  message: { success: false, message: "Too many requests" },
  standardHeaders: true,
  legacyHeaders: false,
});

export const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3,
  message: { success: false, message: "Too many reset attempts" },
  skipSuccessfulRequests: true,
});

export const emailVerificationLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 3,
  message: { success: false, message: "Too many verification requests" },
});
```

### Login Rate Limiter (Per-Email)

```typescript
// middleware/loginRateLimiter.ts
import { LoginAttempt } from "../models/LoginAttempt";

const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes

export const checkLoginRateLimit = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const { email } = req.body;
  const ip = getClientIp(req);

  const recentAttempts = await LoginAttempt.countDocuments({
    email: email.toLowerCase(),
    success: false,
    createdAt: { $gt: new Date(Date.now() - LOCKOUT_DURATION) },
  });

  if (recentAttempts >= MAX_ATTEMPTS) {
    res.status(429).json({
      success: false,
      message: "Account temporarily locked. Try again in 15 minutes.",
    });
    return;
  }

  next();
};

export const trackFailedLogin = async (
  email: string,
  ip: string,
  reason: string
) => {
  await LoginAttempt.create({
    email: email.toLowerCase(),
    ip,
    success: false,
    failureReason: reason,
  });
};

export const clearFailedAttempts = async (email: string) => {
  await LoginAttempt.deleteMany({ email: email.toLowerCase(), success: false });
};
```

### CSRF Protection

```typescript
// middleware/csrf.ts
import { Request, Response, NextFunction } from "express";
import crypto from "crypto";

const CSRF_COOKIE_NAME = "_csrf";
const CSRF_HEADER_NAME = "x-csrf-token";

export const csrfProtection = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Generate token if not exists
  let csrfCookie = req.cookies[CSRF_COOKIE_NAME];

  if (!csrfCookie) {
    csrfCookie = crypto.randomBytes(32).toString("hex");
    res.cookie(CSRF_COOKIE_NAME, csrfCookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });
  }

  // Validate on state-changing requests
  if (["POST", "PUT", "PATCH", "DELETE"].includes(req.method)) {
    const headerToken = req.headers[CSRF_HEADER_NAME];

    if (!headerToken || headerToken !== csrfCookie) {
      res.status(403).json({
        success: false,
        message: "Invalid CSRF token",
        code: "CSRF_TOKEN_INVALID",
      });
      return;
    }
  }

  next();
};

export const generateCsrfToken = (req: Request, res: Response) => {
  const token = req.cookies[CSRF_COOKIE_NAME];
  res.json({ csrfToken: token });
};
```

### Subscription Check

```typescript
// middleware/subscription.ts
import { Response, NextFunction } from "express";
import { AuthRequest } from "../types/auth";
import { User } from "../models/User";

export const requireActiveSubscription = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await User.findById(req.userId);

    // Admin always has access
    if (user?.userType === "admin") {
      next();
      return;
    }

    // Check for admin-granted access or paid subscription
    const hasAccess =
      user?.accessGrantedByAdmin ||
      user?.isPaid ||
      user?.subscriptionStatus === "active";

    if (!hasAccess) {
      res.status(402).json({
        success: false,
        message: "Active subscription required",
        code: "PAYMENT_REQUIRED",
      });
      return;
    }

    next();
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};
```

---

## 🔧 Services

### S3 Service

```typescript
// services/s3Service.ts
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import sharp from "sharp";
import crypto from "crypto";

export class S3Service {
  private s3Client: S3Client;
  private bucketName: string;

  constructor() {
    this.s3Client = new S3Client({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      },
    });
    this.bucketName = process.env.AWS_S3_BUCKET!;
  }

  async uploadImage(params: {
    buffer: Buffer;
    originalName: string;
    userId: string;
    folder: "properties" | "users" | "chat";
    propertyId?: string;
  }): Promise<{ key: string; url: string }> {
    // Optimize image with Sharp
    const optimized = await sharp(params.buffer)
      .resize(1920, 1080, { fit: "inside", withoutEnlargement: true })
      .jpeg({ quality: 85 })
      .toBuffer();

    const key = this.generateKey(params);

    await this.s3Client.send(
      new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        Body: optimized,
        ContentType: "image/jpeg",
        CacheControl: "max-age=31536000",
      })
    );

    return {
      key,
      url: `https://${this.bucketName}.s3.amazonaws.com/${key}`,
    };
  }

  async deleteObject(key: string): Promise<void> {
    await this.s3Client.send(
      new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      })
    );
  }

  private generateKey(params: any): string {
    const timestamp = Date.now();
    const random = crypto.randomBytes(8).toString("hex");
    const ext = params.originalName.split(".").pop() || "jpg";
    return `${params.folder}/${params.userId}/${timestamp}-${random}.${ext}`;
  }
}
```

### Notification Service

```typescript
// services/notificationService.ts
import { Notification } from "../models/Notification";
import { getSocketService } from "../server";

export const createNotification = async (params: {
  userId: string;
  type: string;
  title: string;
  message: string;
  data?: Record<string, string>;
}) => {
  const notification = await Notification.create(params);

  // Send real-time notification
  const socketService = getSocketService();
  socketService.emitToUser(params.userId, "notification:new", notification);

  return notification;
};

export const markAsRead = async (notificationId: string, userId: string) => {
  await Notification.findOneAndUpdate(
    { _id: notificationId, userId },
    { isRead: true, readAt: new Date() }
  );
};
```

---

## 🔌 Socket.IO Integration

### Socket Configuration

```typescript
// chat/socketConfig.ts
import { Server as HttpServer } from "http";
import { Server } from "socket.io";

export const SOCKET_EVENTS = {
  USER_CONNECT: "user:connect",
  USER_DISCONNECT: "disconnect",
  USERS_ONLINE: "users:online",
  MESSAGE_SEND: "message:send",
  MESSAGE_NEW: "message:new",
  MESSAGE_READ: "message:read",
  TYPING_START: "typing:start",
  TYPING_STOP: "typing:stop",
  TYPING_UPDATE: "typing:update",
};

export const createSocketServer = (httpServer: HttpServer): Server => {
  const io = new Server(httpServer, {
    cors: {
      origin: ALLOWED_ORIGINS,
      credentials: true,
    },
    transports: ["websocket", "polling"],
  });

  return io;
};
```

### Socket Service

```typescript
// chat/socketService.ts
import { Server, Socket } from "socket.io";

export interface SocketServiceAPI {
  emitToUser: (userId: string, event: string, data: any) => void;
  emitToAll: (event: string, data: any) => void;
  getOnlineUsers: () => string[];
}

export const createSocketService = (io: Server): SocketServiceAPI => {
  const userSockets = new Map<string, Set<string>>();

  io.on("connection", (socket: Socket) => {
    socket.on("user:connect", (userId: string) => {
      // Track user connection
      if (!userSockets.has(userId)) {
        userSockets.set(userId, new Set());
      }
      userSockets.get(userId)!.add(socket.id);

      // Broadcast online users
      const onlineUsers = Array.from(userSockets.keys());
      io.emit("users:online", onlineUsers);
    });

    socket.on("disconnect", () => {
      // Remove socket from user tracking
      for (const [userId, sockets] of userSockets) {
        if (sockets.has(socket.id)) {
          sockets.delete(socket.id);
          if (sockets.size === 0) {
            userSockets.delete(userId);
          }
          break;
        }
      }

      io.emit("users:online", Array.from(userSockets.keys()));
    });

    // ... other event handlers
  });

  return {
    emitToUser: (userId: string, event: string, data: any) => {
      const sockets = userSockets.get(userId);
      if (sockets) {
        sockets.forEach((socketId) => {
          io.to(socketId).emit(event, data);
        });
      }
    },

    emitToAll: (event: string, data: any) => {
      io.emit(event, data);
    },

    getOnlineUsers: () => Array.from(userSockets.keys()),
  };
};
```

---

## 🛡 Validation

### Zod Schemas

```typescript
// validation/schemas.ts
import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const signupSchema = z.object({
  firstName: z.string().min(2).max(50).trim(),
  lastName: z.string().min(2).max(50).trim(),
  email: z.string().email().toLowerCase().trim(),
  password: z
    .string()
    .min(12)
    .max(128)
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&_\-+=]).*$/),
  phone: z
    .string()
    .regex(/^(?:(?:\+33|0)[1-9])(?:[0-9]{8})$/)
    .optional(),
  userType: z.enum(["agent", "apporteur"]),
});

export const propertySchema = z.object({
  title: z.string().min(5).max(100),
  description: z.string().min(10).max(5000),
  price: z.number().positive(),
  surface: z.number().positive(),
  propertyType: z.enum([
    "Appartement",
    "Maison",
    "Terrain",
    "Local commercial",
    "Bureaux",
  ]),
  transactionType: z.enum(["Vente", "Location"]),
  city: z.string().min(2).max(100),
  postalCode: z.string().regex(/^\d{5}$/),
  // ... other fields
});
```

### Validation Middleware

```typescript
// validation/middleware.ts
import { Request, Response, NextFunction } from "express";
import { ZodSchema } from "zod";

export const validate = (
  schema: ZodSchema,
  target: "body" | "params" | "query" = "body"
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req[target]);

    if (!result.success) {
      res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: result.error.errors.map((err) => ({
          field: err.path.join("."),
          message: err.message,
        })),
      });
      return;
    }

    req[target] = result.data;
    next();
  };
};
```

---

## 📝 Logging

### Winston Logger

```typescript
// utils/logger.ts
import winston from "winston";

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    }),
    new winston.transports.File({
      filename: "logs/error.log",
      level: "error",
    }),
    new winston.transports.File({
      filename: "logs/combined.log",
    }),
  ],
});
```

---

## 🔐 Security Utilities

### JWT Management

```typescript
// utils/jwt.ts
import jwt from "jsonwebtoken";

const ACCESS_TOKEN_EXPIRY = "15m";
const REFRESH_TOKEN_EXPIRY = "7d";

export const generateToken = (userId: string): string => {
  return jwt.sign({ userId }, process.env.JWT_SECRET!, {
    expiresIn: ACCESS_TOKEN_EXPIRY,
  });
};

export const generateRefreshToken = (userId: string): string => {
  return jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET!, {
    expiresIn: REFRESH_TOKEN_EXPIRY,
  });
};

export const verifyToken = (token: string): { userId: string } => {
  return jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
};

export const verifyRefreshToken = (token: string): { userId: string } => {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET!) as {
    userId: string;
  };
};
```

### Input Sanitization

```typescript
// utils/sanitize.ts
import sanitizeHtml from "sanitize-html";
import validator from "validator";

export const sanitizeString = (input: string): string => {
  return validator.escape(validator.trim(input));
};

export const sanitizeEmail = (email: string): string => {
  return validator.normalizeEmail(email.toLowerCase().trim()) || "";
};

export const sanitizeHtmlContent = (html: string): string => {
  return sanitizeHtml(html, {
    allowedTags: ["b", "i", "em", "strong", "p", "br", "ul", "ol", "li"],
    allowedAttributes: {},
  });
};
```

---

_Next: [Authentication →](../features/authentication.md)_
