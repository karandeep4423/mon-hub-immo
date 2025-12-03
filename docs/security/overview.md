# Security Guide

> Security measures, best practices, and configuration

---

## 🔐 Security Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           SECURITY LAYERS                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   CLIENT                                                                    │
│   ┌─────────────────────────────────────────────────────────────────────┐  │
│   │  • HTTPS only                                                        │  │
│   │  • CSRF token (double-submit cookie)                                │  │
│   │  • XSS prevention (React auto-escaping)                             │  │
│   │  • Secure cookie storage                                            │  │
│   └─────────────────────────────────────────────────────────────────────┘  │
│                                    │                                        │
│                                    ▼                                        │
│   NETWORK                                                                   │
│   ┌─────────────────────────────────────────────────────────────────────┐  │
│   │  • Cloudflare DDoS protection                                        │  │
│   │  • TLS 1.3 encryption                                               │  │
│   │  • CORS validation                                                   │  │
│   │  • Rate limiting                                                     │  │
│   └─────────────────────────────────────────────────────────────────────┘  │
│                                    │                                        │
│                                    ▼                                        │
│   SERVER                                                                    │
│   ┌─────────────────────────────────────────────────────────────────────┐  │
│   │  • Helmet.js security headers                                        │  │
│   │  • JWT token authentication                                          │  │
│   │  • Input validation (Zod)                                           │  │
│   │  • SQL/NoSQL injection prevention                                    │  │
│   │  • Token blacklisting (Redis)                                        │  │
│   └─────────────────────────────────────────────────────────────────────┘  │
│                                    │                                        │
│                                    ▼                                        │
│   DATABASE                                                                  │
│   ┌─────────────────────────────────────────────────────────────────────┐  │
│   │  • Encrypted at rest (MongoDB Atlas)                                 │  │
│   │  • Network isolation (VPC)                                           │  │
│   │  • Role-based access control                                         │  │
│   │  • Bcrypt password hashing                                           │  │
│   └─────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 🛡 Helmet.js Configuration

Security headers applied to all responses:

```typescript
// server.ts
import helmet from "helmet";

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'", process.env.FRONTEND_URL],
        fontSrc: ["'self'"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"],
      },
    },
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);
```

### Headers Set

| Header                      | Value              | Purpose               |
| --------------------------- | ------------------ | --------------------- |
| `X-Content-Type-Options`    | `nosniff`          | Prevent MIME sniffing |
| `X-Frame-Options`           | `DENY`             | Prevent clickjacking  |
| `X-XSS-Protection`          | `1; mode=block`    | XSS filter            |
| `Strict-Transport-Security` | `max-age=31536000` | Force HTTPS           |
| `Content-Security-Policy`   | Configured         | Prevent XSS           |

---

## 🔑 Authentication Security

### JWT Token Strategy

```
┌─────────────────────────────────────────────────────────────────┐
│                    TOKEN ARCHITECTURE                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   ACCESS TOKEN                     REFRESH TOKEN                │
│   ┌─────────────────┐              ┌─────────────────┐         │
│   │ Short-lived     │              │ Long-lived      │         │
│   │ (15 minutes)    │              │ (7 days)        │         │
│   │ In memory/header│              │ HttpOnly cookie │         │
│   │ Bearer auth     │              │ Secure flag     │         │
│   └─────────────────┘              └─────────────────┘         │
│                                                                 │
│   USAGE FLOW                                                    │
│   1. Login → Both tokens issued                                │
│   2. API calls → Access token in Authorization header          │
│   3. Token expired → Auto-refresh via refresh token            │
│   4. Refresh expired → User must re-login                      │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Token Generation

```typescript
// Auth controller
const generateTokens = (userId: string) => {
  const accessToken = jwt.sign({ userId }, process.env.JWT_SECRET!, {
    expiresIn: "15m",
  });

  const refreshToken = jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET!, {
    expiresIn: "7d",
  });

  return { accessToken, refreshToken };
};
```

### Token Blacklisting

On logout, tokens are blacklisted in Redis:

```typescript
// Logout - blacklist access token
await redisClient.setex(
  `blacklist:${token}`,
  15 * 60, // TTL matches token expiry
  "true"
);

// Auth middleware - check blacklist
const isBlacklisted = await redisClient.get(`blacklist:${token}`);
if (isBlacklisted) {
  throw new Error("Token has been revoked");
}
```

---

## 🔒 Password Security

### Hashing Configuration

```typescript
// Bcrypt with 12 salt rounds
const SALT_ROUNDS = 12;

const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, SALT_ROUNDS);
};

const verifyPassword = async (
  password: string,
  hash: string
): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};
```

### Password Policy

```typescript
// Zod validation schema
const passwordSchema = z
  .string()
  .min(8, "Minimum 8 characters")
  .regex(/[A-Z]/, "Must contain uppercase letter")
  .regex(/[a-z]/, "Must contain lowercase letter")
  .regex(/[0-9]/, "Must contain digit")
  .regex(/[!@#$%^&*]/, "Must contain special character");
```

### Password History

Prevents reuse of last 5 passwords:

```typescript
// User model
passwordHistory: [
  {
    hash: String,
    changedAt: Date,
  },
];

// Before password change
const isReused = await Promise.any(
  user.passwordHistory
    .slice(0, 5)
    .map((prev) => bcrypt.compare(newPassword, prev.hash))
);

if (isReused) {
  throw new Error("Cannot reuse recent passwords");
}
```

---

## 🛑 Rate Limiting

### Configuration

```typescript
// middleware/rateLimiter.ts
import rateLimit from "express-rate-limit";
import RedisStore from "rate-limit-redis";

// General API limit
export const generalLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 250, // 250 requests per minute
  message: "Too many requests",
  store: new RedisStore({ client: redisClient }),
});

// Password reset limit
export const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 attempts per hour
  message: "Too many password reset attempts",
});

// Email verification limit
export const emailVerificationLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 3, // 3 attempts per 5 minutes
  message: "Too many verification attempts",
});

// Login limit
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 attempts
  message: "Too many login attempts",
});
```

### Applied Routes

```typescript
// routes/auth.ts
router.post("/login", loginLimiter, login);
router.post("/reset-password", passwordResetLimiter, resetPassword);
router.post(
  "/resend-verification",
  emailVerificationLimiter,
  resendVerification
);

// server.ts - global
app.use("/api", generalLimiter);
```

---

## 🔄 CSRF Protection

### Double-Submit Cookie Pattern

```typescript
// server.ts
import cookieParser from "cookie-parser";

app.use(cookieParser(process.env.COOKIE_SECRET));

// Generate CSRF token
app.use((req, res, next) => {
  if (!req.cookies["csrf-token"]) {
    const token = crypto.randomBytes(32).toString("hex");
    res.cookie("csrf-token", token, {
      httpOnly: false, // Readable by JS
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });
  }
  next();
});

// Validate CSRF on state-changing requests
const csrfMiddleware = (req, res, next) => {
  if (["POST", "PUT", "DELETE", "PATCH"].includes(req.method)) {
    const cookieToken = req.cookies["csrf-token"];
    const headerToken = req.headers["x-csrf-token"];

    if (!cookieToken || cookieToken !== headerToken) {
      return res.status(403).json({ error: "CSRF validation failed" });
    }
  }
  next();
};
```

### Client-Side Implementation

```typescript
// lib/api.ts
api.interceptors.request.use((config) => {
  // Get CSRF token from cookie
  const csrfToken = document.cookie
    .split("; ")
    .find((row) => row.startsWith("csrf-token="))
    ?.split("=")[1];

  if (csrfToken) {
    config.headers["X-CSRF-Token"] = csrfToken;
  }

  return config;
});
```

---

## 🌐 CORS Configuration

```typescript
// server.ts
const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = (process.env.FRONTEND_ORIGINS || "")
      .split(",")
      .map((o) => o.trim());

    // Allow requests with no origin (mobile apps, Postman)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("CORS not allowed"));
    }
  },
  credentials: true, // Allow cookies
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization", "X-CSRF-Token"],
};

app.use(cors(corsOptions));
```

### Production Origins

```env
FRONTEND_ORIGINS=https://monhubimmo.fr,https://www.monhubimmo.fr
```

---

## ✅ Input Validation

### Server-Side (Zod)

```typescript
// validation/authSchema.ts
import { z } from "zod";

export const signupSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(8).regex(/[A-Z]/).regex(/[0-9]/),
  userType: z.enum(["agent", "apporteur"]),
  firstName: z.string().min(2).max(50),
  lastName: z.string().min(2).max(50),
});

// Middleware wrapper
export const validate = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: "Validation failed",
          details: error.errors,
        });
      }
      next(error);
    }
  };
};
```

### NoSQL Injection Prevention

```typescript
// Sanitize MongoDB queries
import mongoSanitize from "express-mongo-sanitize";

app.use(
  mongoSanitize({
    replaceWith: "_", // Replace $ and . characters
  })
);

// Query example - always use parameterized
const user = await User.findOne({ email }); // ✓ Safe
// Never: await User.findOne({ $where: userInput }); // ✗ Dangerous
```

---

## 🔐 Data Protection

### Sensitive Data Handling

```typescript
// User model - exclude sensitive fields by default
userSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.password;
  delete user.passwordHistory;
  delete user.verificationToken;
  delete user.resetPasswordToken;
  return user;
};

// Or use projection
const user = await User.findById(id).select("-password -passwordHistory");
```

### S3 File Access

```typescript
// Presigned URLs for private files
const getSecureUrl = async (key: string): Promise<string> => {
  const command = new GetObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET,
    Key: key,
  });

  return getSignedUrl(s3Client, command, {
    expiresIn: 3600, // 1 hour
  });
};
```

---

## 🏷 Authorization

### Role-Based Access Control

```typescript
// middleware/auth.ts
export const requireRole = (...roles: UserType[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.userType)) {
      return res.status(403).json({
        error: "Insufficient permissions",
      });
    }
    next();
  };
};

// Usage
router.get("/admin/users", authenticateToken, requireRole("admin"), getUsers);
```

### Resource Ownership

```typescript
// Check ownership before modification
const property = await Property.findById(id);

if (property.owner.toString() !== req.user.userId) {
  return res.status(403).json({
    error: "Not authorized to modify this property",
  });
}
```

### Admin Validation Requirement

```typescript
// middleware/auth.ts
export const requireValidated = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  if (!req.user?.isValidated) {
    return res.status(403).json({
      error: "Account pending admin validation",
      code: "VALIDATION_PENDING",
    });
  }
  next();
};
```

---

## 🔍 Audit Logging

### Activity Tracking

```typescript
// Collaboration activities
collaboration.activities.push({
  type: "status_change",
  performedBy: req.user.userId,
  details: `Status changed from ${oldStatus} to ${newStatus}`,
  timestamp: new Date(),
});

// Winston logging for security events
logger.info("Security event", {
  event: "login_success",
  userId: user._id,
  ip: req.ip,
  userAgent: req.headers["user-agent"],
});

logger.warn("Security event", {
  event: "login_failed",
  email,
  ip: req.ip,
  reason: "invalid_password",
});
```

---

## ⚠️ Security Checklist

### Production Deployment

- [ ] All secrets in environment variables (not in code)
- [ ] HTTPS enforced everywhere
- [ ] Secure cookies enabled
- [ ] CORS configured for specific origins
- [ ] Rate limiting enabled
- [ ] CSRF protection active
- [ ] Input validation on all endpoints
- [ ] Password policy enforced
- [ ] JWT secrets are strong (64+ characters)
- [ ] Helmet.js security headers
- [ ] MongoDB injection protection
- [ ] Error messages don't leak info
- [ ] Logs don't contain sensitive data
- [ ] File uploads validated and sanitized
- [ ] Dependencies regularly updated

### Monitoring

- [ ] Failed login attempts logged
- [ ] Unusual activity alerts
- [ ] Rate limit violations tracked
- [ ] Error rates monitored
- [ ] Security headers verified (securityheaders.com)

---

## 🚨 Incident Response

### Token Compromise

1. Identify compromised user
2. Invalidate all tokens (blacklist pattern + increment version)
3. Force password reset
4. Investigate access logs

### Data Breach

1. Identify scope
2. Notify affected users
3. GDPR notification (72 hours)
4. Rotate all secrets
5. Post-incident review

---

_Next: [Testing Guide →](../testing/overview.md)_
