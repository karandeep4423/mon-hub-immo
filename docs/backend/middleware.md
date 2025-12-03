# Middleware Reference

> Express middleware stack, authentication, validation, and security

---

## 📋 Overview

MonHubImmo uses a layered middleware stack for request processing:

```
Request → Security → Auth → Validation → Rate Limit → Controller → Response
```

---

## 🔐 Authentication Middleware

### authenticateToken

Verifies JWT access token and attaches user to request:

```typescript
// middleware/auth.ts
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { User } from "../models/User";

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    userType: "agent" | "apporteur" | "admin";
    email: string;
  };
}

export const authenticateToken = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    // Get token from cookie or header
    const token =
      req.cookies.accessToken ||
      req.headers.authorization?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    // Check if token is blacklisted
    const isBlacklisted = await redisClient.get(`blacklist:${token}`);
    if (isBlacklisted) {
      return res.status(401).json({
        message: "Token has been revoked",
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;

    // Verify user still exists
    const user = await User.findById(decoded.userId).select("userType email");
    if (!user) {
      return res.status(401).json({
        message: "User no longer exists",
      });
    }

    req.user = {
      userId: decoded.userId,
      userType: user.userType,
      email: user.email,
    };

    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({
        message: "Token expired",
        code: "TOKEN_EXPIRED",
      });
    }
    return res.status(401).json({
      message: "Invalid token",
    });
  }
};
```

### optionalAuth

Attaches user if authenticated, but allows unauthenticated access:

```typescript
// middleware/auth.ts
export const optionalAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const token =
    req.cookies.accessToken ||
    req.headers.authorization?.replace("Bearer ", "");

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
      req.user = { userId: decoded.userId, userType: decoded.userType };
    } catch {
      // Token invalid, continue without user
    }
  }

  next();
};
```

---

## 🛡️ Authorization Middleware

### requireRole

Restricts access to specific user types:

```typescript
// middleware/authorize.ts
export const requireRole = (...allowedRoles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    if (!allowedRoles.includes(req.user.userType)) {
      return res.status(403).json({
        message: "Access denied. Insufficient permissions.",
      });
    }

    next();
  };
};

// Usage
router.get("/admin/users", authenticateToken, requireRole("admin"), getUsers);

router.post(
  "/properties",
  authenticateToken,
  requireRole("agent"),
  createProperty
);
```

### requireOwnership

Verifies user owns the resource:

```typescript
// middleware/authorize.ts
export const requireOwnership = (
  getOwnerId: (req: Request) => Promise<string | null>
) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    const ownerId = await getOwnerId(req);

    if (!ownerId) {
      return res.status(404).json({
        message: "Resource not found",
      });
    }

    if (ownerId !== req.user?.userId) {
      return res.status(403).json({
        message: "Access denied. You do not own this resource.",
      });
    }

    next();
  };
};

// Usage
router.put(
  "/properties/:id",
  authenticateToken,
  requireOwnership(async (req) => {
    const property = await Property.findById(req.params.id);
    return property?.owner.toString() || null;
  }),
  updateProperty
);
```

---

## ✅ Validation Middleware

### Zod Validation

```typescript
// middleware/validation.ts
import { Request, Response, NextFunction } from "express";
import { z, ZodSchema } from "zod";

export const validate = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          message: "Validation failed",
          errors: error.errors.map((e) => ({
            field: e.path.join("."),
            message: e.message,
          })),
        });
      }
      next(error);
    }
  };
};

// Schema examples
// validation/schemas.ts
export const createPropertySchema = z.object({
  body: z.object({
    title: z.string().min(5).max(200),
    description: z.string().min(20).max(5000),
    price: z.number().positive(),
    surface: z.number().positive(),
    propertyType: z.enum(["Appartement", "Maison", "Terrain"]),
    city: z.string().min(2),
    postalCode: z.string().regex(/^\d{5}$/),
  }),
});

// Usage
router.post(
  "/properties",
  authenticateToken,
  validate(createPropertySchema),
  createProperty
);
```

---

## 🚦 Rate Limiting Middleware

### General Rate Limiter

```typescript
// middleware/rateLimiter.ts
import rateLimit from "express-rate-limit";
import RedisStore from "rate-limit-redis";
import { redisClient } from "../utils/redisClient";

export const rateLimiter = rateLimit({
  store: new RedisStore({
    sendCommand: (...args: string[]) => redisClient.call(...args),
  }),
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  message: {
    message: "Too many requests. Please try again later.",
    retryAfter: "15 minutes",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply to all routes
app.use("/api", rateLimiter);
```

### Login Rate Limiter

Stricter limits for authentication endpoints:

```typescript
// middleware/loginRateLimiter.ts
export const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 login attempts per window
  skipSuccessfulRequests: true, // Only count failures
  message: {
    message: "Too many login attempts. Please try again in 15 minutes.",
  },
});

// Usage
router.post("/auth/login", loginRateLimiter, login);
```

---

## 🔒 CSRF Protection

```typescript
// middleware/csrf.ts
import csrf from "csurf";
import { Request, Response, NextFunction } from "express";

export const csrfProtection = csrf({
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  },
});

// Route to get CSRF token
export const getCsrfToken = (req: Request, res: Response) => {
  res.json({ csrfToken: req.csrfToken() });
};

// Usage
router.get("/csrf-token", csrfProtection, getCsrfToken);

// Apply to write operations
router.post("/properties", csrfProtection, authenticateToken, createProperty);
router.put(
  "/properties/:id",
  csrfProtection,
  authenticateToken,
  updateProperty
);
```

---

## 📁 File Upload Middleware

```typescript
// middleware/uploadMiddleware.ts
import multer from "multer";
import path from "path";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

const storage = multer.memoryStorage();

const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  if (ALLOWED_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type. Only JPEG, PNG, and WebP allowed."));
  }
};

export const uploadMiddleware = multer({
  storage,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 10, // Max 10 files
  },
  fileFilter,
});

// Usage
router.post(
  "/properties/:id/images",
  authenticateToken,
  uploadMiddleware.array("images", 10),
  uploadPropertyImages
);

router.post("/auth/signup", uploadMiddleware.single("identityCard"), signup);
```

---

## 💳 Subscription Middleware

```typescript
// middleware/subscription.ts
import { User } from "../models/User";

export const requireActiveSubscription = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const user = await User.findById(req.user?.userId);

  if (!user?.isPaid) {
    return res.status(402).json({
      message: "Active subscription required",
      code: "SUBSCRIPTION_REQUIRED",
    });
  }

  next();
};

// Usage - premium features only
router.post(
  "/properties",
  authenticateToken,
  requireActiveSubscription,
  createProperty
);
```

---

## 📝 Request Logging Middleware

```typescript
// middleware/requestLogger.ts
import { Request, Response, NextFunction } from "express";
import { logger } from "../utils/logger";

export const requestLogger = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const start = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - start;
    const logData = {
      method: req.method,
      path: req.path,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.get("user-agent"),
    };

    if (res.statusCode >= 400) {
      logger.warn("Request error:", logData);
    } else if (process.env.ENABLE_REQUEST_LOGGING === "true") {
      logger.info("Request:", logData);
    }
  });

  next();
};

// Apply to all routes
app.use(requestLogger);
```

---

## ⚠️ Error Handler Middleware

```typescript
// middleware/errorHandler.ts
import { Request, Response, NextFunction } from "express";
import { logger } from "../utils/logger";

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  logger.error("Error:", {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  // Known error types
  if (err.name === "ValidationError") {
    return res.status(400).json({ message: err.message });
  }

  if (err.name === "CastError") {
    return res.status(400).json({ message: "Invalid ID format" });
  }

  // Default server error
  res.status(500).json({
    message:
      process.env.NODE_ENV === "production"
        ? "Internal server error"
        : err.message,
  });
};

// Must be last middleware
app.use(errorHandler);
```

---

## 📊 Middleware Stack Order

```typescript
// server.ts
const app = express();

// 1. Trust proxy (for Render/Vercel)
app.set("trust proxy", 1);

// 2. Security headers
app.use(helmet());

// 3. CORS
app.use(cors({ origin: ALLOWED_ORIGINS, credentials: true }));

// 4. Body parsers
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// 5. Cookie parser
app.use(cookieParser());

// 6. Request logging
app.use(requestLogger);

// 7. Rate limiting
app.use("/api", rateLimiter);

// 8. Routes (with their own middleware)
app.use("/api/auth", authRoutes);
app.use("/api/properties", propertyRoutes);

// 9. 404 handler
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// 10. Error handler (must be last)
app.use(errorHandler);
```

---

## 📚 Related Documentation

- [Backend Overview](./overview.md) - Server architecture
- [Error Handling](./error-handling.md) - Error management
- [Security Guide](../security/overview.md) - Security practices
- [API Overview](../api/overview.md) - API documentation
