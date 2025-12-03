# Quick Start Guide

> Get MonHubImmo up and running in 5 minutes

## Prerequisites

- **Node.js** 18+ ([Download](https://nodejs.org/))
- **MongoDB** 6+ ([MongoDB Atlas](https://www.mongodb.com/cloud/atlas) or local)
- **Git** ([Download](https://git-scm.com/))
- **npm** or **yarn** (comes with Node.js)

## Quick Setup

### 1. Clone the Repository

```bash
git clone https://github.com/karandeep4423/mon-hub-immo.git
cd mon-hub-immo
```

### 2. Install Dependencies

```bash
# Install client dependencies
cd client
npm install

# Install server dependencies
cd ../server
npm install
```

### 3. Environment Setup

Create `.env` files in both `client/` and `server/`:

**Server (.env)**

```env
# Database
MONGODB_URL=mongodb://localhost:27017/monhubimmo

# JWT Secrets
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_REFRESH_SECRET=your-refresh-secret-change-this

# Server
PORT=4000
NODE_ENV=development

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000

# Email (optional for development)
BREVO_API_KEY=your-brevo-key
EMAIL_FROM=noreply@monhubimmo.fr

# AWS S3 (optional for development)
AWS_ACCESS_KEY_ID=your-aws-key
AWS_SECRET_ACCESS_KEY=your-aws-secret
AWS_REGION=eu-west-3
AWS_S3_BUCKET=monhubimmo-bucket

# Stripe (optional for development)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

**Client (.env.local)**

```env
# API URL
NEXT_PUBLIC_API_URL=http://localhost:4000/api

# Stripe Public Key
NEXT_PUBLIC_STRIPE_PUBLIC_KEY=pk_test_...

# Google Analytics (optional)
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

### 4. Start the Servers

**Terminal 1 - Backend:**

```bash
cd server
npm run build  # Compile TypeScript
npm start      # Start server on port 4000
```

**Terminal 2 - Frontend:**

```bash
cd client
npm run dev    # Start Next.js on port 3000
```

### 5. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:4000/api
- **Health Check**: http://localhost:4000/api/health

## First Steps

1. **Create an Account**: Go to http://localhost:3000/auth/signup
2. **Choose User Type**: Select "Agent" or "Apporteur"
3. **Verify Email**: Check your console logs for verification code (in development)
4. **Complete Profile**: Fill in professional information
5. **Explore Features**: Dashboard, properties, chat, etc.

## Development Mode

For development with auto-reload:

```bash
# Server (with auto-restart)
cd server
npm run dev

# Client (with Turbopack)
cd client
npm run dev
```

## Default Users

In development, you can create test accounts:

- **Admin**: Sign up and manually change `userType` to `admin` in MongoDB
- **Agent**: Sign up as an agent
- **Apporteur**: Sign up as an apporteur

## Troubleshooting

### Port Already in Use

```bash
# Kill process on port 3000 (Windows)
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Kill process on port 4000
netstat -ano | findstr :4000
taskkill /PID <PID> /F
```

### MongoDB Connection Error

- Ensure MongoDB is running locally: `mongod`
- Or use MongoDB Atlas cloud connection string

### CORS Errors

- Check `FRONTEND_URL` in server `.env` matches client URL
- Ensure `NEXT_PUBLIC_API_URL` in client `.env` is correct

### Module Not Found

```bash
# Clear node_modules and reinstall
cd client && rm -rf node_modules && npm install
cd ../server && rm -rf node_modules && npm install
```

## Next Steps

- 📖 [Complete Installation Guide](./installation.md) - Detailed setup
- ⚙️ [Configuration Guide](./configuration.md) - Environment variables
- 🏗️ [Project Structure](./project-structure.md) - Codebase overview
- 🔧 [Development Workflow](./development-workflow.md) - Day-to-day practices

## Quick Commands Reference

```bash
# Client
npm run dev          # Start development server
npm run build        # Build for production
npm start            # Start production server
npm run lint         # Lint code
npm test             # Run tests

# Server
npm run dev          # Start development server with auto-reload
npm run build        # Compile TypeScript
npm start            # Start production server
npm test             # Run tests
npm run lint         # Lint code
```

---

**Need Help?** Check the [Troubleshooting Guide](../guides/troubleshooting.md) or [open an issue](https://github.com/karandeep4423/mon-hub-immo/issues).
