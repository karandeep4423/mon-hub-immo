# Complete Installation Guide

> Detailed step-by-step installation for MonHubImmo platform

## Table of Contents

- [System Requirements](#system-requirements)
- [Development Environment Setup](#development-environment-setup)
- [Database Setup](#database-setup)
- [Application Installation](#application-installation)
- [Environment Configuration](#environment-configuration)
- [Running the Application](#running-the-application)
- [Verification](#verification)
- [Optional Services](#optional-services)

---

## System Requirements

### Minimum Requirements

- **Operating System**: Windows 10+, macOS 10.15+, or Linux (Ubuntu 20.04+)
- **RAM**: 4GB minimum, 8GB recommended
- **Storage**: 2GB free space
- **CPU**: Dual-core processor minimum

### Software Dependencies

| Software | Version      | Required       | Purpose                              |
| -------- | ------------ | -------------- | ------------------------------------ |
| Node.js  | 18.x or 20.x | ✅ Yes         | Runtime environment                  |
| npm      | 9.x+         | ✅ Yes         | Package manager (comes with Node.js) |
| MongoDB  | 6.x+         | ✅ Yes         | Database                             |
| Git      | 2.x+         | ✅ Yes         | Version control                      |
| VS Code  | Latest       | ⚠️ Recommended | Code editor                          |

---

## Development Environment Setup

### 1. Install Node.js

**Windows:**

1. Download from [nodejs.org](https://nodejs.org/)
2. Run installer (LTS version recommended)
3. Verify installation:

```powershell
node --version  # Should show v18.x or v20.x
npm --version   # Should show v9.x or higher
```

**macOS:**

```bash
# Using Homebrew
brew install node@20

# Verify
node --version
npm --version
```

**Linux (Ubuntu/Debian):**

```bash
# Using NodeSource
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify
node --version
npm --version
```

### 2. Install Git

**Windows:**

- Download from [git-scm.com](https://git-scm.com/)
- Run installer with default options

**macOS:**

```bash
brew install git
```

**Linux:**

```bash
sudo apt-get install git
```

Verify:

```bash
git --version
```

### 3. Install Code Editor (VS Code)

Download from [code.visualstudio.com](https://code.visualstudio.com/)

**Recommended Extensions:**

- ESLint
- Prettier - Code formatter
- Tailwind CSS IntelliSense
- MongoDB for VS Code
- GitLens
- Thunder Client (API testing)
- Error Lens

---

## Database Setup

### Option 1: MongoDB Atlas (Cloud - Recommended for Development)

1. **Create Account**

   - Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
   - Sign up for free account

2. **Create Cluster**

   - Click "Build a Database"
   - Choose "FREE" tier (M0)
   - Select region closest to you
   - Click "Create"

3. **Configure Access**

   - Create database user with username/password
   - Add IP address: `0.0.0.0/0` (for development)
   - Click "Finish and Close"

4. **Get Connection String**
   - Click "Connect" → "Connect your application"
   - Copy connection string
   - Replace `<password>` with your database user password
   - Example: `mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/monhubimmo`

### Option 2: Local MongoDB Installation

**Windows:**

1. Download from [mongodb.com/try/download/community](https://www.mongodb.com/try/download/community)
2. Run installer, choose "Complete" installation
3. Install as a Service (check option during install)
4. MongoDB Compass is included (GUI tool)

**macOS:**

```bash
brew tap mongodb/brew
brew install mongodb-community@6.0
brew services start mongodb-community@6.0
```

**Linux:**

```bash
# Import public key
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -

# Add repository
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list

# Install
sudo apt-get update
sudo apt-get install -y mongodb-org

# Start service
sudo systemctl start mongod
sudo systemctl enable mongod
```

**Verify Installation:**

```bash
mongosh --version  # Should show MongoDB shell version
```

**Default Connection String:**

```
mongodb://localhost:27017/monhubimmo
```

---

## Application Installation

### 1. Clone Repository

```bash
# Clone the repository
git clone https://github.com/karandeep4423/mon-hub-immo.git

# Navigate to project directory
cd mon-hub-immo

# Check structure
ls  # Should see: client/, server/, docs/, .github/
```

### 2. Install Backend Dependencies

```bash
# Navigate to server directory
cd server

# Install dependencies
npm install

# This installs all packages from package.json including:
# - express, mongoose, socket.io
# - jsonwebtoken, bcryptjs
# - aws-sdk, stripe, brevo
# - helmet, cors, express-validator
# - and all development dependencies
```

**Expected output:**

```
added XXX packages in XXs
```

### 3. Install Frontend Dependencies

```bash
# Navigate to client directory (from project root)
cd ../client

# Install dependencies
npm install

# This installs:
# - next, react, react-dom
# - axios, socket.io-client
# - zustand, react-hook-form, zod
# - tailwindcss, lucide-react
# - stripe, dompurify
# - and all development dependencies
```

### 4. Verify Installation

```bash
# Check for node_modules in both directories
ls client/node_modules    # Should exist
ls server/node_modules    # Should exist
```

---

## Environment Configuration

### Server Environment Variables

Create `server/.env`:

```bash
cd server
touch .env  # Linux/Mac
# OR
New-Item .env  # Windows PowerShell
```

Add the following configuration:

```env
# ============================================================================
# DATABASE
# ============================================================================
MONGODB_URL=mongodb://localhost:27017/monhubimmo
# For MongoDB Atlas:
# MONGODB_URL=mongodb+srv://username:password@cluster.xxxxx.mongodb.net/monhubimmo

# ============================================================================
# JWT AUTHENTICATION
# ============================================================================
# Generate strong secrets: openssl rand -base64 32
JWT_SECRET=your-super-secret-jwt-key-min-32-characters-change-this-in-production
JWT_REFRESH_SECRET=your-refresh-secret-also-min-32-characters-different-from-jwt-secret

# Token expiration
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# ============================================================================
# SERVER CONFIGURATION
# ============================================================================
PORT=4000
NODE_ENV=development

# Frontend URL (for CORS) - NO trailing slash
FRONTEND_URL=http://localhost:3000

# ============================================================================
# EMAIL SERVICE (Brevo)
# ============================================================================
# Sign up at https://www.brevo.com/ for free tier
BREVO_API_KEY=your-brevo-api-key-here
EMAIL_FROM=noreply@monhubimmo.fr
EMAIL_FROM_NAME=MonHubImmo

# Fallback SMTP (optional - for Nodemailer)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-specific-password

# ============================================================================
# AWS S3 STORAGE
# ============================================================================
# Sign up for AWS and create S3 bucket
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_REGION=eu-west-3
AWS_S3_BUCKET=monhubimmo-uploads

# ============================================================================
# STRIPE PAYMENT
# ============================================================================
# Get from https://dashboard.stripe.com/test/apikeys
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
STRIPE_PRICE_ID=price_your_subscription_price_id

# ============================================================================
# SECURITY
# ============================================================================
# CSRF Secret - generate with: openssl rand -base64 32
CSRF_SECRET=your-csrf-secret-min-32-characters

# Rate limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# ============================================================================
# LOGGING
# ============================================================================
LOG_LEVEL=debug
LOG_FILE_PATH=./logs/app.log
```

### Client Environment Variables

Create `client/.env.local`:

```bash
cd ../client
touch .env.local  # Linux/Mac
# OR
New-Item .env.local  # Windows PowerShell
```

Add the following configuration:

```env
# ============================================================================
# API CONFIGURATION
# ============================================================================
# Backend API URL - NO trailing slash
NEXT_PUBLIC_API_URL=http://localhost:4000/api

# ============================================================================
# STRIPE
# ============================================================================
# Get from https://dashboard.stripe.com/test/apikeys
NEXT_PUBLIC_STRIPE_PUBLIC_KEY=pk_test_your_stripe_publishable_key

# ============================================================================
# GOOGLE ANALYTICS (Optional)
# ============================================================================
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX

# ============================================================================
# FEATURE FLAGS (Optional)
# ============================================================================
NEXT_PUBLIC_ENABLE_ANALYTICS=false
NEXT_PUBLIC_ENABLE_CHAT=true
NEXT_PUBLIC_ENABLE_PAYMENTS=true

# ============================================================================
# DEVELOPMENT
# ============================================================================
NEXT_PUBLIC_ENV=development
```

### Generate Secure Secrets

**For JWT Secrets:**

```bash
# Linux/Mac
openssl rand -base64 32

# Windows (PowerShell)
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))

# Node.js (any platform)
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

---

## Running the Application

### 1. Build Server (TypeScript Compilation)

```bash
cd server
npm run build

# This compiles TypeScript to JavaScript in dist/
# Output: "Successfully compiled XX files with TypeScript"
```

### 2. Start Backend Server

**Production mode:**

```bash
npm start
# Server runs on http://localhost:4000
```

**Development mode (with auto-reload):**

```bash
npm run dev
# Server runs with ts-node-dev
# Auto-restarts on file changes
```

**Expected output:**

```
[Server] Server started on port 4000
[Database] MongoDB Connected: cluster0-shard-00-00.xxxxx.mongodb.net
[Socket] Socket.IO server initialized
```

### 3. Start Frontend (in new terminal)

```bash
cd client
npm run dev

# Next.js starts on http://localhost:3000
# Uses Turbopack for fast rebuilds
```

**Expected output:**

```
  ▲ Next.js 15.4.1
  - Local:        http://localhost:3000
  - Turbopack:    enabled

 ✓ Ready in 2.1s
```

---

## Verification

### 1. Check Backend Health

Open browser or use curl:

```bash
curl http://localhost:4000/api/health
```

**Expected response:**

```json
{
  "status": "ok",
  "timestamp": "2025-12-03T10:30:00.000Z",
  "uptime": 10.5,
  "environment": "development",
  "database": "connected",
  "socketIO": {
    "connected": true,
    "onlineUsers": 0
  }
}
```

### 2. Check Frontend

1. Open http://localhost:3000
2. Should see landing page
3. Check browser console for errors (should be none)

### 3. Test API Connection

From browser console:

```javascript
fetch("http://localhost:4000/api/health")
  .then((r) => r.json())
  .then(console.log);
```

### 4. Test Database Connection

```bash
# Using MongoDB Compass
# Connect to: mongodb://localhost:27017
# Should see 'monhubimmo' database

# Using mongosh
mongosh
use monhubimmo
db.stats()
```

---

## Optional Services

### Email Service (Brevo)

1. Sign up at [brevo.com](https://www.brevo.com/)
2. Free tier: 300 emails/day
3. Get API key from Settings → SMTP & API → API Keys
4. Add to `server/.env`: `BREVO_API_KEY=...`

**Alternative: Gmail SMTP**

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password  # Generate in Google Account settings
```

### AWS S3 Storage

1. Create AWS account at [aws.amazon.com](https://aws.amazon.com/)
2. Create S3 bucket:
   - Go to S3 console
   - Create bucket (e.g., `monhubimmo-dev`)
   - Set region: `eu-west-3` (Paris)
   - Block public access (handle via presigned URLs)
3. Create IAM user:
   - Go to IAM → Users → Add user
   - Enable "Programmatic access"
   - Attach policy: `AmazonS3FullAccess`
   - Save access key and secret key
4. Add to `server/.env`

**Alternative: Local file storage (development only)**
Files can be stored locally in `server/uploads/` by modifying upload middleware.

### Stripe Payment

1. Sign up at [stripe.com](https://stripe.com/)
2. Use test mode for development
3. Get API keys from Dashboard → Developers → API keys
4. Create subscription products and prices
5. Set up webhook endpoint:
   - URL: `http://localhost:4000/api/stripe/webhook`
   - Events: `checkout.session.completed`, `customer.subscription.updated`, etc.
6. Get webhook signing secret
7. Add all to `.env`

**Test Cards:**

```
Success: 4242 4242 4242 4242
Decline: 4000 0000 0000 0002
```

---

## Development Workflow

### Daily Development

1. **Pull latest changes**

   ```bash
   git pull origin main
   ```

2. **Install new dependencies** (if package.json changed)

   ```bash
   cd client && npm install
   cd ../server && npm install
   ```

3. **Start both servers**

   ```bash
   # Terminal 1 - Backend
   cd server && npm run dev

   # Terminal 2 - Frontend
   cd client && npm run dev
   ```

4. **Make changes** - Both servers auto-reload

5. **Check for errors**
   - Backend: Check terminal output
   - Frontend: Check browser console and terminal
   - Database: Use MongoDB Compass

---

## Troubleshooting

See [Troubleshooting Guide](../guides/troubleshooting.md) for detailed solutions.

### Common Issues

**Port already in use:**

```powershell
# Windows - Kill process on port 4000
netstat -ano | findstr :4000
taskkill /PID <PID> /F
```

**MongoDB connection refused:**

- Check if MongoDB is running: `sudo systemctl status mongod` (Linux)
- Verify connection string in `.env`
- Check network access in MongoDB Atlas

**Module not found errors:**

```bash
rm -rf node_modules package-lock.json
npm install
```

**CORS errors:**

- Verify `FRONTEND_URL` in server `.env` matches client URL
- Ensure no trailing slashes in URLs
- Check `withCredentials: true` in axios config

---

## Next Steps

- ⚙️ [Configuration Guide](./configuration.md) - Detailed env variable docs
- 🏗️ [Project Structure](./project-structure.md) - Understand the codebase
- 🔧 [Development Workflow](./development-workflow.md) - Best practices
- 📖 [API Documentation](../api/overview.md) - Explore the API

---

**Installation complete!** 🎉 Start building with MonHubImmo.
