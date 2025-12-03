# Configuration Guide

> Complete guide to environment variables and configuration options

## Table of Contents

- [Environment Files](#environment-files)
- [Server Configuration](#server-configuration)
- [Client Configuration](#client-configuration)
- [Third-Party Services](#third-party-services)
- [Security Configuration](#security-configuration)
- [Production vs Development](#production-vs-development)
- [Configuration Validation](#configuration-validation)

---

## Environment Files

### File Locations

| File              | Location             | Purpose                      | Committed |
| ----------------- | -------------------- | ---------------------------- | --------- |
| `.env`            | `server/`            | Server environment variables | ❌ No     |
| `.env.local`      | `client/`            | Client environment variables | ❌ No     |
| `.env.example`    | `server/`, `client/` | Template file                | ✅ Yes    |
| `.env.production` | Optional             | Production overrides         | ❌ No     |
| `.env.test`       | Optional             | Test environment             | ❌ No     |

### Loading Priority

Next.js loads environment variables in this order (last wins):

1. `.env`
2. `.env.local`
3. `.env.development` / `.env.production`
4. `.env.development.local` / `.env.production.local`

---

## Server Configuration

### Required Variables

These must be set for the server to run:

```env
# Database - REQUIRED
MONGODB_URL=mongodb://localhost:27017/monhubimmo

# JWT Secrets - REQUIRED (generate with: openssl rand -base64 32)
JWT_SECRET=your-jwt-secret-min-32-characters
JWT_REFRESH_SECRET=your-refresh-secret-different-from-jwt-secret

# Server Port
PORT=4000

# Environment
NODE_ENV=development  # development | production | test

# Frontend URL for CORS
FRONTEND_URL=http://localhost:3000
```

### Database Configuration

#### MongoDB Connection String

**Local MongoDB:**

```env
MONGODB_URL=mongodb://localhost:27017/monhubimmo
```

**MongoDB Atlas (Cloud):**

```env
MONGODB_URL=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/monhubimmo?retryWrites=true&w=majority
```

**With Authentication:**

```env
MONGODB_URL=mongodb://admin:password@localhost:27017/monhubimmo?authSource=admin
```

**Connection Options:**

- Database name is specified at the end: `/monhubimmo`
- SSL/TLS for Atlas is automatic
- Connection pooling is configured in `config/database.ts`

### JWT Configuration

```env
# JWT Secret Keys
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long
JWT_REFRESH_SECRET=different-refresh-secret-also-minimum-32-characters

# Token Expiration
JWT_EXPIRES_IN=15m          # Access token: 15 minutes
JWT_REFRESH_EXPIRES_IN=7d   # Refresh token: 7 days

# Cookie Configuration (auto-configured based on NODE_ENV)
# Development: secure=false, sameSite=lax
# Production: secure=true, sameSite=strict
```

**Generate Secrets:**

```bash
# Linux/Mac
openssl rand -base64 32

# Windows PowerShell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))

# Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### Email Configuration

#### Brevo (Primary)

```env
BREVO_API_KEY=xkeysib-your-api-key-here
EMAIL_FROM=noreply@monhubimmo.fr
EMAIL_FROM_NAME=MonHubImmo
```

**Get Brevo API Key:**

1. Sign up at [brevo.com](https://www.brevo.com/)
2. Go to Settings → SMTP & API → API Keys
3. Create new API key with full permissions
4. Free tier: 300 emails/day

#### SMTP Fallback (Nodemailer)

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false           # true for 465, false for other ports
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-specific-password
EMAIL_FROM=noreply@yourdomain.com
EMAIL_FROM_NAME=MonHubImmo
```

**Gmail App Password:**

1. Enable 2FA on Google Account
2. Go to Security → 2-Step Verification → App passwords
3. Generate password for "Mail"
4. Use generated password (not your actual password)

### AWS S3 Configuration

```env
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=...
AWS_REGION=eu-west-3        # Paris region
AWS_S3_BUCKET=monhubimmo-uploads
```

**Setup Steps:**

1. Create AWS account at [aws.amazon.com](https://aws.amazon.com/)
2. Create S3 bucket:
   - Bucket name: `monhubimmo-uploads` (must be globally unique)
   - Region: `eu-west-3` (Paris) or closest to users
   - Block all public access: ✅ Yes (use presigned URLs)
   - Versioning: Optional
   - Encryption: AES-256 or KMS
3. Create IAM user:
   - Go to IAM → Users → Add user
   - Access type: Programmatic access
   - Attach policy: `AmazonS3FullAccess` (or custom restrictive policy)
   - Save access key ID and secret key

**Recommended IAM Policy (Least Privilege):**

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::monhubimmo-uploads",
        "arn:aws:s3:::monhubimmo-uploads/*"
      ]
    }
  ]
}
```

### Stripe Configuration

```env
STRIPE_SECRET_KEY=sk_test_... (test) or sk_live_... (production)
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_ID=price_...   # Your subscription price ID
```

**Setup:**

1. Sign up at [stripe.com](https://stripe.com/)
2. Dashboard → Developers → API keys
3. Copy publishable key (for client) and secret key (for server)
4. Create Product and Price:
   - Products → Add product
   - Set up recurring billing
   - Copy Price ID
5. Set up webhook:
   - Developers → Webhooks → Add endpoint
   - URL: `https://yourdomain.com/api/stripe/webhook`
   - Events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`
   - Copy webhook signing secret

### Security Configuration

```env
# CSRF Protection
CSRF_SECRET=your-csrf-secret-min-32-characters

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000     # 15 minutes in milliseconds
RATE_LIMIT_MAX_REQUESTS=100     # Max requests per window

# Login Rate Limiting (stricter)
LOGIN_RATE_LIMIT_WINDOW_MS=900000
LOGIN_RATE_LIMIT_MAX_ATTEMPTS=5

# Account Lockout
MAX_LOGIN_ATTEMPTS=5            # Attempts before account lock
ACCOUNT_LOCK_DURATION=900000    # Lock duration (15 minutes)
```

### Logging Configuration

```env
LOG_LEVEL=debug                 # error | warn | info | debug
LOG_FILE_PATH=./logs/app.log
LOG_MAX_SIZE=10m                # Max log file size
LOG_MAX_FILES=7                 # Number of log files to keep
LOG_DATE_PATTERN=YYYY-MM-DD     # Log rotation pattern
```

**Log Levels:**

- `error`: Critical errors only
- `warn`: Warnings and errors
- `info`: General info, warnings, errors (recommended for production)
- `debug`: Everything including debug info (development only)

---

## Client Configuration

### Required Variables

```env
# Backend API URL - REQUIRED
NEXT_PUBLIC_API_URL=http://localhost:4000/api

# Stripe Public Key
NEXT_PUBLIC_STRIPE_PUBLIC_KEY=pk_test_... (test) or pk_live_... (production)
```

### Optional Variables

```env
# Google Analytics
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX

# Feature Flags
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_ENABLE_CHAT=true
NEXT_PUBLIC_ENABLE_PAYMENTS=true

# Environment
NEXT_PUBLIC_ENV=development     # development | production
```

### Public vs Private Variables

**Public Variables** (`NEXT_PUBLIC_*`):

- ✅ Exposed to browser
- ✅ Can be used in components
- ❌ Never store secrets here
- Examples: API URL, Stripe public key, feature flags

**Private Variables** (no prefix):

- ✅ Server-side only
- ❌ Not accessible in browser
- ✅ Safe for secrets
- Examples: Database URL, API secrets

```typescript
// ✅ GOOD - Public variables in client
const apiUrl = process.env.NEXT_PUBLIC_API_URL;

// ❌ BAD - Private variables not accessible in client
const dbUrl = process.env.MONGODB_URL; // undefined in browser!
```

---

## Third-Party Services

### Brevo Email Service

**Free Tier:**

- 300 emails/day
- Transactional emails
- SMTP and API access

**Configuration:**

```env
BREVO_API_KEY=xkeysib-your-api-key
EMAIL_FROM=noreply@monhubimmo.fr
EMAIL_FROM_NAME=MonHubImmo
```

**Verify Domain:**

1. Add DNS records to verify domain ownership
2. Improves deliverability
3. Not required for development

### AWS S3 Storage

**Pricing:**

- First 50TB: $0.023/GB/month
- PUT/COPY requests: $0.005 per 1,000 requests
- GET requests: $0.0004 per 1,000 requests

**Best Practices:**

- Use presigned URLs for secure access
- Set up lifecycle policies for old files
- Enable versioning for critical files
- Configure CORS for client uploads

### Stripe Payments

**Test Mode:**

- No charges are processed
- Test card numbers available
- Full webhook testing

**Production Checklist:**

- ✅ Business verified
- ✅ Bank account connected
- ✅ Live mode API keys
- ✅ Webhook endpoint secured
- ✅ Error handling tested

---

## Security Configuration

### CORS Settings

Configured in `server.ts`:

```typescript
const FRONTEND_ORIGINS = [
  "http://localhost:3000", // Development
  "https://monhubimmo.fr", // Production
  "https://www.monhubimmo.fr", // Production www
];

cors({
  origin: FRONTEND_ORIGINS,
  credentials: true, // Allow cookies
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization", "X-CSRF-Token"],
});
```

### Helmet Security Headers

Configured automatically:

```typescript
helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true,
  },
});
```

### Rate Limiting

```typescript
// General rate limit: 100 requests per 15 minutes
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});

// Login rate limit: 5 attempts per 15 minutes
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
});
```

---

## Production vs Development

### Development Settings

```env
# Server
NODE_ENV=development
PORT=4000
FRONTEND_URL=http://localhost:3000

# Relaxed security
JWT_EXPIRES_IN=24h              # Longer for development
LOG_LEVEL=debug                 # Verbose logging

# Local services
MONGODB_URL=mongodb://localhost:27017/monhubimmo
```

**Development Features:**

- Detailed error messages
- Verbose logging
- Auto-reload on file changes
- Source maps enabled
- CORS allowing localhost

### Production Settings

```env
# Server
NODE_ENV=production
PORT=4000
FRONTEND_URL=https://monhubimmo.fr

# Strict security
JWT_EXPIRES_IN=15m              # Short-lived tokens
LOG_LEVEL=info                  # Production logging

# Production services
MONGODB_URL=mongodb+srv://...   # MongoDB Atlas
```

**Production Features:**

- Minimal error exposure
- Structured logging only
- Optimized builds
- Source maps disabled
- Strict CORS
- HTTPS only
- Secure cookies

### Environment Detection

**Server:**

```typescript
const isDevelopment = process.env.NODE_ENV === "development";
const isProduction = process.env.NODE_ENV === "production";
const isTest = process.env.NODE_ENV === "test";
```

**Client:**

```typescript
const isDev = process.env.NEXT_PUBLIC_ENV === "development";
const isProd = process.env.NEXT_PUBLIC_ENV === "production";
```

---

## Configuration Validation

### Server Validation

On startup, server validates required environment variables:

```typescript
// config/validateEnv.ts
const required = [
  "MONGODB_URL",
  "JWT_SECRET",
  "JWT_REFRESH_SECRET",
  "FRONTEND_URL",
];

required.forEach((key) => {
  if (!process.env[key]) {
    logger.error(`Missing required environment variable: ${key}`);
    process.exit(1);
  }
});
```

### Client Validation

Next.js validates at build time:

```typescript
// next.config.ts
if (!process.env.NEXT_PUBLIC_API_URL) {
  throw new Error("NEXT_PUBLIC_API_URL is required");
}
```

---

## Configuration Best Practices

### 1. Never Commit Secrets

```bash
# .gitignore
.env
.env.local
.env.production
.env.*.local
```

### 2. Use Environment Templates

```bash
# .env.example (committed)
MONGODB_URL=mongodb://localhost:27017/monhubimmo
JWT_SECRET=change-this-in-production
# ... rest of variables
```

### 3. Separate Concerns

- Database config → `.env`
- API keys → `.env`
- Feature flags → `.env.local` or constants file

### 4. Validate Early

- Check required variables on startup
- Fail fast if missing
- Provide helpful error messages

### 5. Document Everything

- Comment each variable
- Explain purpose and format
- Provide example values

### 6. Rotate Secrets Regularly

- Change JWT secrets periodically
- Rotate API keys every 90 days
- Update passwords quarterly

---

## Troubleshooting

### Variable Not Loading

**Check file location:**

```bash
# Server: .env should be in server/
ls server/.env

# Client: .env.local should be in client/
ls client/.env.local
```

**Check syntax:**

```env
# ✅ GOOD
API_KEY=abc123

# ❌ BAD (spaces around =)
API_KEY = abc123

# ❌ BAD (quotes not needed)
API_KEY="abc123"
```

**Restart servers:**

- Environment variables are loaded on startup
- Changes require restart (except in dev mode)

### CORS Errors

**Check FRONTEND_URL:**

```env
# ❌ BAD (trailing slash)
FRONTEND_URL=http://localhost:3000/

# ✅ GOOD (no trailing slash)
FRONTEND_URL=http://localhost:3000
```

### MongoDB Connection Errors

**Check connection string format:**

```env
# Local
mongodb://localhost:27017/database_name

# Atlas (with options)
mongodb+srv://user:pass@cluster.mongodb.net/database_name?retryWrites=true&w=majority
```

**Common issues:**

- URL encode password if it contains special characters
- Ensure IP is whitelisted in Atlas
- Check if MongoDB is running locally

---

## Next Steps

- 🚀 [Quick Start](./quickstart.md) - Get running quickly
- 🏗️ [Project Structure](./project-structure.md) - Understand the codebase
- 🔒 [Security Overview](../security/overview.md) - Security best practices
- 🚀 [Deployment Guide](../deployment/overview.md) - Production deployment

---

**Proper configuration is critical for security and functionality!**
