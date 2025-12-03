# Environment Variables Reference

> Complete reference for all environment variables in MonHubImmo

---

## 📋 Overview

MonHubImmo uses environment variables for configuration. Variables are split between client (public) and server (private).

| Location | File         | Access               |
| -------- | ------------ | -------------------- |
| Client   | `.env.local` | `NEXT_PUBLIC_*` only |
| Server   | `.env`       | All variables        |

---

## 🖥️ Server Environment Variables

### Required Variables

These must be set for the server to function:

```env
# ═══════════════════════════════════════════════════════════════════════════
# REQUIRED CONFIGURATION
# ═══════════════════════════════════════════════════════════════════════════

# Database connection string
# Local: mongodb://localhost:27017/monhubimmo
# Atlas: mongodb+srv://user:pass@cluster.mongodb.net/monhubimmo
MONGODB_URL=mongodb://localhost:27017/monhubimmo

# JWT secrets - Generate with: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
JWT_SECRET=your-jwt-secret-minimum-32-characters
JWT_REFRESH_SECRET=your-refresh-secret-different-from-jwt-secret

# Frontend URL for CORS (no trailing slash)
FRONTEND_URL=http://localhost:3000
```

### Server Configuration

```env
# ═══════════════════════════════════════════════════════════════════════════
# SERVER CONFIGURATION
# ═══════════════════════════════════════════════════════════════════════════

# Server port
PORT=4000

# Environment mode
NODE_ENV=development  # development | production | test

# Additional CORS origins (comma-separated)
FRONTEND_ORIGINS=http://localhost:3000,https://monhubimmo.fr

# Cookie secret for session
COOKIE_SECRET=your-cookie-secret-key
```

### JWT Configuration

```env
# ═══════════════════════════════════════════════════════════════════════════
# JWT CONFIGURATION
# ═══════════════════════════════════════════════════════════════════════════

# Access token expiration (default: 15m)
JWT_EXPIRES_IN=15m

# Refresh token expiration (default: 7d)
JWT_REFRESH_EXPIRES_IN=7d
```

### Email Configuration (Brevo)

```env
# ═══════════════════════════════════════════════════════════════════════════
# EMAIL CONFIGURATION (BREVO/SENDINBLUE)
# ═══════════════════════════════════════════════════════════════════════════

# Brevo API key (get from brevo.com dashboard)
BREVO_API_KEY=xkeysib-your-api-key

# Sender email address
EMAIL_FROM=noreply@monhubimmo.fr

# Sender name
EMAIL_FROM_NAME=MonHubImmo
```

### AWS S3 Configuration

```env
# ═══════════════════════════════════════════════════════════════════════════
# AWS S3 CONFIGURATION
# ═══════════════════════════════════════════════════════════════════════════

# AWS credentials
AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY

# AWS region (Paris: eu-west-3)
AWS_REGION=eu-west-3

# S3 bucket name
AWS_S3_BUCKET=monhubimmo-uploads
```

### Stripe Configuration

```env
# ═══════════════════════════════════════════════════════════════════════════
# STRIPE PAYMENT CONFIGURATION
# ═══════════════════════════════════════════════════════════════════════════

# Stripe secret key (starts with sk_test_ or sk_live_)
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key

# Stripe webhook secret (starts with whsec_)
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Stripe price IDs for subscription plans
STRIPE_PRICE_MONTHLY=price_monthly_id
STRIPE_PRICE_ANNUAL=price_annual_id
```

### Redis Configuration

```env
# ═══════════════════════════════════════════════════════════════════════════
# REDIS CONFIGURATION (FOR RATE LIMITING)
# ═══════════════════════════════════════════════════════════════════════════

# Redis connection URL
# Local: redis://localhost:6379
# Cloud: redis://default:password@host:port
REDIS_URL=redis://localhost:6379

# Enable/disable rate limiting (disable in dev if no Redis)
ENABLE_RATE_LIMITING=false
```

### Security Configuration

```env
# ═══════════════════════════════════════════════════════════════════════════
# SECURITY CONFIGURATION
# ═══════════════════════════════════════════════════════════════════════════

# CSRF secret
CSRF_SECRET=your-csrf-secret

# Password hashing rounds (default: 12)
BCRYPT_ROUNDS=12

# Account lockout after failed attempts
MAX_LOGIN_ATTEMPTS=5
LOCKOUT_DURATION=15  # minutes
```

### Debug Configuration

```env
# ═══════════════════════════════════════════════════════════════════════════
# DEBUG CONFIGURATION (DEVELOPMENT ONLY)
# ═══════════════════════════════════════════════════════════════════════════

# Enable auth debugging
AUTH_DEBUG=false

# Enable request logging
ENABLE_REQUEST_LOGGING=true

# Log level
LOG_LEVEL=info  # error | warn | info | debug
```

---

## 🌐 Client Environment Variables

All client-side variables must be prefixed with `NEXT_PUBLIC_`:

```env
# ═══════════════════════════════════════════════════════════════════════════
# CLIENT CONFIGURATION (.env.local)
# ═══════════════════════════════════════════════════════════════════════════

# API base URL
NEXT_PUBLIC_API_URL=http://localhost:4000/api

# Socket.IO URL (same as API host)
NEXT_PUBLIC_SOCKET_URL=http://localhost:4000

# Stripe publishable key (starts with pk_test_ or pk_live_)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_key

# Google Analytics measurement ID
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX

# Google Maps API key (if using maps)
NEXT_PUBLIC_GOOGLE_MAPS_KEY=your-google-maps-key

# Feature flags
NEXT_PUBLIC_ENABLE_CHAT=true
NEXT_PUBLIC_ENABLE_APPOINTMENTS=true
```

---

## 🔐 Security Best Practices

### 1. Never Commit Secrets

```gitignore
# .gitignore
.env
.env.local
.env.production
```

### 2. Use Strong Secrets

```bash
# Generate secure secrets
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Or with OpenSSL
openssl rand -base64 64
```

### 3. Different Secrets Per Environment

```
Development:  JWT_SECRET=dev-secret-xxx
Staging:      JWT_SECRET=staging-secret-yyy
Production:   JWT_SECRET=prod-secret-zzz
```

### 4. Rotate Secrets Regularly

- Change JWT secrets quarterly
- Rotate API keys annually
- Update after any team member leaves

---

## 📦 Environment Files

### Development

```bash
# server/.env
NODE_ENV=development
PORT=4000
MONGODB_URL=mongodb://localhost:27017/monhubimmo
JWT_SECRET=dev-jwt-secret-change-in-production
JWT_REFRESH_SECRET=dev-refresh-secret-change-in-production
FRONTEND_URL=http://localhost:3000
ENABLE_RATE_LIMITING=false
```

```bash
# client/.env.local
NEXT_PUBLIC_API_URL=http://localhost:4000/api
NEXT_PUBLIC_SOCKET_URL=http://localhost:4000
```

### Production

```bash
# server/.env
NODE_ENV=production
PORT=4000
MONGODB_URL=mongodb+srv://user:pass@cluster.mongodb.net/monhubimmo
JWT_SECRET=super-long-secure-production-secret-min-64-chars
JWT_REFRESH_SECRET=different-super-long-secure-production-secret
FRONTEND_URL=https://monhubimmo.fr
FRONTEND_ORIGINS=https://monhubimmo.fr,https://www.monhubimmo.fr
ENABLE_RATE_LIMITING=true
```

```bash
# client/.env.production
NEXT_PUBLIC_API_URL=https://api.monhubimmo.fr/api
NEXT_PUBLIC_SOCKET_URL=https://api.monhubimmo.fr
```

---

## ✅ Validation

### Required Variables Check

The server validates required variables on startup:

```typescript
// config/validateEnv.ts
const requiredEnvVars = [
  "MONGODB_URL",
  "JWT_SECRET",
  "JWT_REFRESH_SECRET",
  "FRONTEND_URL",
];

requiredEnvVars.forEach((varName) => {
  if (!process.env[varName]) {
    throw new Error(`Missing required environment variable: ${varName}`);
  }
});
```

### Type-Safe Environment

```typescript
// types/env.d.ts
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: "development" | "production" | "test";
      PORT: string;
      MONGODB_URL: string;
      JWT_SECRET: string;
      JWT_REFRESH_SECRET: string;
      FRONTEND_URL: string;
      // ... other variables
    }
  }
}

export {};
```

---

## 📚 Related Documentation

- [Configuration Guide](./configuration.md) - Detailed setup
- [Installation Guide](./installation.md) - Initial setup
- [Deployment Guide](../deployment/overview.md) - Production deployment
- [Security Guide](../security/overview.md) - Security best practices
