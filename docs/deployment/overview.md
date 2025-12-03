# Deployment Guide

> Production deployment, environment configuration, and CI/CD

---

## 🚀 Deployment Overview

MonHubImmo uses a split deployment:

| Component    | Platform      | URL               |
| ------------ | ------------- | ----------------- |
| **Frontend** | Vercel        | monhubimmo.fr     |
| **Backend**  | Render        | api.monhubimmo.fr |
| **Database** | MongoDB Atlas | Cloud cluster     |
| **Cache**    | Redis Cloud   | Rate limiting     |
| **Files**    | AWS S3        | eu-west-3 region  |

---

## 🏗 Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         PRODUCTION ARCHITECTURE                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   ┌───────────────┐                    ┌───────────────┐                   │
│   │   Cloudflare  │                    │   Cloudflare  │                   │
│   │   (DNS/CDN)   │                    │   (DNS/CDN)   │                   │
│   └───────┬───────┘                    └───────┬───────┘                   │
│           │                                    │                           │
│   ┌───────▼───────┐                    ┌───────▼───────┐                   │
│   │    Vercel     │                    │    Render     │                   │
│   │   (Frontend)  │──── HTTP/WS ─────► │   (Backend)   │                   │
│   │ monhubimmo.fr │                    │ api.monhubimmo│                   │
│   └───────────────┘                    └───────┬───────┘                   │
│                                                │                           │
│                         ┌──────────────────────┼──────────────────────┐    │
│                         │                      │                      │    │
│                  ┌──────▼──────┐        ┌──────▼──────┐        ┌──────▼──┐ │
│                  │   MongoDB   │        │    Redis    │        │  AWS S3 │ │
│                  │   Atlas     │        │   Cloud     │        │(Storage)│ │
│                  └─────────────┘        └─────────────┘        └─────────┘ │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## ⚙️ Environment Configuration

### Frontend (Vercel) Environment

```env
# API Configuration
NEXT_PUBLIC_API_URL=https://api.monhubimmo.fr/api
NEXT_PUBLIC_SOCKET_URL=https://api.monhubimmo.fr

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxxxxxxxxxxx

# Analytics
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

### Backend (Render) Environment

```env
# Server
PORT=4000
NODE_ENV=production

# MongoDB Atlas
MONGODB_URL=mongodb+srv://user:password@cluster.mongodb.net/monhubimmo?retryWrites=true&w=majority

# JWT Secrets (generate strong random strings)
JWT_SECRET=your-production-jwt-secret-min-64-chars
JWT_REFRESH_SECRET=your-production-refresh-secret-min-64-chars

# Cookie
COOKIE_SECRET=your-cookie-secret

# Frontend URL (CORS)
FRONTEND_URL=https://monhubimmo.fr
FRONTEND_ORIGINS=https://monhubimmo.fr,https://www.monhubimmo.fr

# AWS S3
AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
AWS_REGION=eu-west-3
AWS_S3_BUCKET=monhubimmo

# Stripe
STRIPE_SECRET_KEY=sk_live_xxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxx

# Email (Brevo)
BREVO_API_KEY=xkeysib-xxxxxxxxxxxx
EMAIL_FROM=noreply@monhubimmo.fr
EMAIL_FROM_NAME=MonHubImmo

# Redis
REDIS_URL=redis://default:password@redis-xxxxx.c1.eu-west-1-1.ec2.cloud.redislabs.com:xxxxx

# Security
ENABLE_RATE_LIMITING=true
```

---

## 📦 Frontend Deployment (Vercel)

### Setup

1. **Connect Repository**

   - Go to Vercel Dashboard
   - Import Git repository
   - Select `client` folder as root directory

2. **Configure Build Settings**

   ```
   Framework Preset: Next.js
   Root Directory: client
   Build Command: npm run build
   Output Directory: .next
   ```

3. **Add Environment Variables**
   - Add all `NEXT_PUBLIC_*` variables

### vercel.json

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "framework": "nextjs",
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    }
  ]
}
```

### Deployment

```bash
# Automatic deployment on push to main branch
git push origin main

# Manual deployment
vercel --prod
```

---

## 🖥 Backend Deployment (Render)

### Setup

1. **Create Web Service**

   - Connect Git repository
   - Select `server` folder
   - Runtime: Node

2. **Configure Build Settings**

   ```
   Build Command: npm install && npm run build
   Start Command: node dist/server.js
   Health Check Path: /api/health
   ```

3. **Add Environment Variables**
   - Add all production environment variables

### render.yaml (Blueprint)

```yaml
services:
  - type: web
    name: monhubimmo-api
    runtime: node
    region: frankfurt
    buildCommand: cd server && npm install && npm run build
    startCommand: cd server && node dist/server.js
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 4000
      # Add other variables from environment configuration
    healthCheckPath: /api/health
    autoDeploy: true
```

### Build Script

```json
// server/package.json
{
  "scripts": {
    "build": "tsc",
    "start": "node dist/server.js",
    "dev": "ts-node-dev --respawn src/server.ts"
  }
}
```

---

## 🗄 MongoDB Atlas Setup

### 1. Create Cluster

1. Go to MongoDB Atlas
2. Create new cluster (M10 or higher for production)
3. Select region close to backend (Frankfurt for EU)

### 2. Configure Network Access

```
# Allow Render IP ranges or use 0.0.0.0/0 with strong auth
IP Address: 0.0.0.0/0
Comment: Allow all (use VPC peering in production)
```

### 3. Create Database User

```
Username: monhubimmo_prod
Password: <strong-generated-password>
Role: readWrite@monhubimmo
```

### 4. Connection String

```
mongodb+srv://monhubimmo_prod:<password>@cluster0.xxxxx.mongodb.net/monhubimmo?retryWrites=true&w=majority
```

### 5. Indexes (Create via Atlas UI or script)

```javascript
// Important indexes for performance
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ userType: 1 });
db.properties.createIndex({ city: 1, postalCode: 1 });
db.properties.createIndex({ status: 1, createdAt: -1 });
db.collaborations.createIndex({ postOwnerId: 1, status: 1 });
db.collaborations.createIndex({ collaboratorId: 1, status: 1 });
db.messages.createIndex({ senderId: 1, receiverId: 1 });
db.messages.createIndex({ receiverId: 1, isRead: 1 });
```

---

## 📮 Redis Setup

### Redis Cloud

1. Create Redis Cloud account
2. Create new database (30MB free tier)
3. Copy connection string

```env
REDIS_URL=redis://default:password@redis-xxxxx.c1.eu-west-1-1.ec2.cloud.redislabs.com:xxxxx
```

### Usage

- Token blacklist (logout)
- Rate limiting counters
- Session caching (optional)

---

## ☁️ AWS S3 Setup

### 1. Create Bucket

```
Bucket name: monhubimmo
Region: eu-west-3 (Paris)
Block all public access: OFF (for public read)
```

### 2. Bucket Policy

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::monhubimmo/*"
    }
  ]
}
```

### 3. CORS Configuration

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
    "AllowedOrigins": [
      "https://monhubimmo.fr",
      "https://www.monhubimmo.fr",
      "http://localhost:3000"
    ],
    "ExposeHeaders": []
  }
]
```

### 4. IAM User

Create IAM user with these permissions:

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
      "Resource": ["arn:aws:s3:::monhubimmo", "arn:aws:s3:::monhubimmo/*"]
    }
  ]
}
```

---

## 💳 Stripe Configuration

### 1. Product Setup

Create subscription products in Stripe Dashboard:

- Monthly plan
- Annual plan

### 2. Webhook Endpoint

```
Endpoint URL: https://api.monhubimmo.fr/api/webhook/stripe
Events to listen:
- customer.subscription.created
- customer.subscription.updated
- customer.subscription.deleted
- invoice.payment_succeeded
- invoice.payment_failed
```

### 3. Test Webhooks Locally

```bash
stripe listen --forward-to localhost:4000/api/webhook/stripe
```

---

## 📧 Email Configuration (Brevo)

### 1. API Key

Get API key from Brevo Dashboard → SMTP & API

### 2. Verify Domain

Add DNS records for domain verification:

- SPF record
- DKIM record
- DMARC record

### 3. Sender Verification

Verify `noreply@monhubimmo.fr` as authorized sender

---

## 🔒 SSL/HTTPS

### Vercel (Frontend)

- Automatic SSL via Let's Encrypt
- HTTPS enforced by default

### Render (Backend)

- Automatic SSL provisioning
- Add custom domain and SSL will auto-configure

### Force HTTPS (Backend)

```typescript
// server.ts
if (process.env.NODE_ENV === "production") {
  app.use((req, res, next) => {
    if (req.header("x-forwarded-proto") !== "https") {
      res.redirect(301, `https://${req.header("host")}${req.url}`);
    } else {
      next();
    }
  });
}
```

---

## 📊 Monitoring

### Health Check

```bash
curl https://api.monhubimmo.fr/api/health
```

Expected response:

```json
{
  "status": "OK",
  "message": "HubImmo API is running",
  "timestamp": "2025-12-03T...",
  "socketIO": "Connected",
  "onlineUsers": 42
}
```

### Logging

- **Render**: Built-in log streaming
- **MongoDB Atlas**: Performance Advisor
- **Winston**: Application logs

### Recommended Monitoring Tools

- **Uptime Robot**: Uptime monitoring
- **Sentry**: Error tracking
- **LogDNA/Papertrail**: Log aggregation

---

## 🔄 CI/CD Pipeline

### GitHub Actions (Recommended)

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          working-directory: ./client

  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to Render
        uses: johnbeynon/render-deploy-action@v0.0.8
        with:
          service-id: ${{ secrets.RENDER_SERVICE_ID }}
          api-key: ${{ secrets.RENDER_API_KEY }}
```

### Pre-deployment Checks

```yaml
# .github/workflows/ci.yml
name: CI

on:
  pull_request:
    branches: [main]

jobs:
  test-frontend:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: ./client
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: "20"
      - run: npm ci
      - run: npm run lint
      - run: npm test

  test-backend:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: ./server
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: "20"
      - run: npm ci
      - run: npm run lint
      - run: npm run build
      - run: npm test
```

---

## 🔙 Rollback Procedures

### Vercel (Frontend)

1. Go to Vercel Dashboard → Deployments
2. Find previous working deployment
3. Click "..." → Promote to Production

### Render (Backend)

1. Go to Render Dashboard → Service → Events
2. Find previous deploy
3. Click "Rollback"

### Database

1. MongoDB Atlas → Backup/Restore
2. Point-in-time recovery available

---

## 📋 Deployment Checklist

### Pre-deployment

- [ ] Run tests locally
- [ ] Check environment variables
- [ ] Verify database migrations (if any)
- [ ] Test Stripe webhooks
- [ ] Verify S3 permissions

### Post-deployment

- [ ] Check health endpoint
- [ ] Verify login/signup flow
- [ ] Test real-time features (chat)
- [ ] Check error logs
- [ ] Verify email delivery
- [ ] Test payment flow

---

_Next: [Security Guide →](../security/overview.md)_
