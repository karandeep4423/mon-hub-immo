# Troubleshooting Guide

> Common issues and solutions for MonHubImmo development

## Table of Contents

- [Installation Issues](#installation-issues)
- [Server Issues](#server-issues)
- [Client Issues](#client-issues)
- [Database Issues](#database-issues)
- [Authentication Issues](#authentication-issues)
- [File Upload Issues](#file-upload-issues)
- [WebSocket Issues](#websocket-issues)
- [Build and Deployment Issues](#build-and-deployment-issues)

---

## Installation Issues

### Node Version Mismatch

**Problem:** `Error: The engine "node" is incompatible with this module`

**Solution:**

```powershell
# Check Node version
node --version

# Install correct version (18+ or 20+)
# Download from nodejs.org or use nvm

# Using nvm (Node Version Manager)
nvm install 20
nvm use 20
```

### npm Install Fails

**Problem:** `npm ERR! code EINTEGRITY`

**Solution:**

```powershell
# Clear npm cache
npm cache clean --force

# Delete package-lock and node_modules
Remove-Item package-lock.json
Remove-Item -Recurse node_modules

# Reinstall
npm install
```

### Port Already in Use

**Problem:** `Error: listen EADDRINUSE: address already in use :::3000`

**Solution:**

```powershell
# Find process using port 3000
netstat -ano | findstr :3000

# Kill process by PID
taskkill /PID <PID> /F

# Or for port 4000
netstat -ano | findstr :4000
taskkill /PID <PID> /F
```

### Permission Denied

**Problem:** `EACCES: permission denied`

**Solution:**

```powershell
# Run as administrator (Windows)
# Or fix npm permissions

# Alternative: Use npx instead of global install
npx create-next-app@latest
```

---

## Server Issues

### MongoDB Connection Failed

**Problem:** `MongoServerError: connection refused`

**Solution:**

1. **Check MongoDB is running:**

   ```powershell
   # Windows
   Get-Service MongoDB

   # Linux
   sudo systemctl status mongod
   ```

2. **Start MongoDB:**

   ```powershell
   # Windows
   net start MongoDB

   # Linux
   sudo systemctl start mongod
   ```

3. **Check connection string:**

   ```env
   # Local
   MONGODB_URL=mongodb://localhost:27017/monhubimmo

   # Atlas (check password encoding)
   MONGODB_URL=mongodb+srv://user:password@cluster.mongodb.net/monhubimmo
   ```

4. **MongoDB Atlas - Check IP whitelist:**
   - Go to Network Access
   - Add `0.0.0.0/0` for development
   - Or add your specific IP

### Server Won't Start

**Problem:** Server crashes on start

**Solutions:**

1. **Check environment variables:**

   ```powershell
   # Verify .env file exists
   Get-Content server\.env

   # Check required variables
   # MONGODB_URL, JWT_SECRET, JWT_REFRESH_SECRET, FRONTEND_URL
   ```

2. **TypeScript compilation errors:**

   ```powershell
   cd server
   npm run build
   # Fix any compilation errors shown
   ```

3. **Check for syntax errors:**
   ```powershell
   # Server logs should show specific error
   npm run dev
   # Read error message carefully
   ```

### CORS Errors

**Problem:** `Access to XMLHttpRequest blocked by CORS policy`

**Solutions:**

1. **Check FRONTEND_URL in server .env:**

   ```env
   # NO trailing slash
   FRONTEND_URL=http://localhost:3000
   ```

2. **Verify client API URL:**

   ```env
   # client/.env.local
   NEXT_PUBLIC_API_URL=http://localhost:4000/api
   ```

3. **Check CORS configuration in server.ts:**
   ```typescript
   cors({
     origin: ["http://localhost:3000"],
     credentials: true,
   });
   ```

### JWT Token Errors

**Problem:** `JsonWebTokenError: invalid token`

**Solutions:**

1. **Regenerate JWT secrets:**

   ```powershell
   # Generate new secrets
   node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
   ```

2. **Clear cookies and re-login:**

   - Open DevTools → Application → Cookies
   - Delete all cookies for localhost
   - Login again

3. **Check token expiration:**
   ```env
   JWT_EXPIRES_IN=15m
   JWT_REFRESH_EXPIRES_IN=7d
   ```

---

## Client Issues

### Next.js Build Errors

**Problem:** `Error: Failed to compile`

**Solutions:**

1. **Clear Next.js cache:**

   ```powershell
   cd client
   Remove-Item -Recurse .next
   npm run dev
   ```

2. **Check for TypeScript errors:**

   ```powershell
   # Type check
   npx tsc --noEmit
   ```

3. **Fix import paths:**

   ```typescript
   // ✅ GOOD
   import { Component } from "@/components/Component";

   // ❌ BAD - Wrong path
   import { Component } from "../../../components/Component";
   ```

### Module Not Found

**Problem:** `Module not found: Can't resolve '@/components/...'`

**Solutions:**

1. **Check tsconfig.json paths:**

   ```json
   {
     "compilerOptions": {
       "paths": {
         "@/*": ["./*"]
       }
     }
   }
   ```

2. **Restart development server:**
   ```powershell
   # Stop server (Ctrl+C)
   # Start again
   npm run dev
   ```

### Environment Variables Not Working

**Problem:** `process.env.NEXT_PUBLIC_API_URL is undefined`

**Solutions:**

1. **Check file name is correct:**

   ```
   .env.local  (✅ Correct for Next.js)
   .env        (❌ Wrong for client)
   ```

2. **Prefix with NEXT*PUBLIC*:**

   ```env
   # ✅ Works in browser
   NEXT_PUBLIC_API_URL=http://localhost:4000/api

   # ❌ Server-only
   API_URL=http://localhost:4000/api
   ```

3. **Restart development server:**
   - Environment variables are loaded on startup
   - Changes require restart

### Hydration Errors

**Problem:** `Warning: Text content did not match`

**Solutions:**

1. **Check for server/client mismatch:**

   ```typescript
   // ❌ BAD - Different on server/client
   <div>{new Date().toString()}</div>;

   // ✅ GOOD - Use useEffect for client-only
   const [time, setTime] = useState("");
   useEffect(() => {
     setTime(new Date().toString());
   }, []);
   ```

2. **Use `suppressHydrationWarning`:**
   ```typescript
   <div suppressHydrationWarning>
     {browserOnly Content}
   </div>
   ```

---

## Database Issues

### MongoDB Atlas Connection Timeout

**Problem:** `MongoServerSelectionError: connection timed out`

**Solutions:**

1. **Check IP whitelist:**

   - MongoDB Atlas → Network Access
   - Add current IP or `0.0.0.0/0`

2. **Check connection string:**

   ```env
   # Correct format
   mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority

   # URL encode special characters in password
   # @ → %40
   # : → %3A
   # / → %2F
   ```

3. **Increase timeout:**
   ```typescript
   // config/database.ts
   mongoose.connect(MONGODB_URL, {
     serverSelectionTimeoutMS: 30000, // 30 seconds
   });
   ```

### Duplicate Key Error

**Problem:** `MongoServerError: E11000 duplicate key error`

**Solutions:**

1. **Check unique fields:**

   ```typescript
   // User model - email must be unique
   // Either use different email or delete existing user
   ```

2. **Drop and recreate index:**
   ```javascript
   // In MongoDB Compass or mongosh
   db.users.dropIndex("email_1");
   ```

### Validation Errors

**Problem:** `ValidationError: ... is required`

**Solutions:**

1. **Check required fields:**

   ```typescript
   // Ensure all required fields are provided
   const user = new User({
     firstName: "John", // required
     lastName: "Doe", // required
     email: "john@example.com", // required
     password: "password123", // required
   });
   ```

2. **Review schema definition:**
   ```typescript
   // Check model schema for required fields
   // Provide default values if appropriate
   ```

---

## Authentication Issues

### Login Not Working

**Problem:** User can't login with correct credentials

**Solutions:**

1. **Check email verification:**

   ```typescript
   // User must verify email before login
   // Check isEmailVerified field in database
   ```

2. **Check account lock:**

   ```typescript
   // Too many failed attempts lock account
   // Check accountLockedUntil field
   // Wait for lock to expire or clear in database
   ```

3. **Clear login attempts:**
   ```javascript
   // In MongoDB
   db.users.updateOne(
     { email: "user@example.com" },
     { $set: { failedLoginAttempts: 0, accountLockedUntil: null } }
   );
   ```

### Session Expires Immediately

**Problem:** User logged out immediately after login

**Solutions:**

1. **Check cookie settings:**

   ```typescript
   // server/src/controllers/authController.ts
   res.cookie("accessToken", token, {
     httpOnly: true,
     secure: process.env.NODE_ENV === "production", // false in development
     sameSite: "lax",
     maxAge: 15 * 60 * 1000,
   });
   ```

2. **Check browser settings:**

   - Ensure cookies are enabled
   - Check for cookie blocking extensions

3. **Verify axios configuration:**
   ```typescript
   // client/lib/api.ts
   const api = axios.create({
     withCredentials: true, // Required for cookies
   });
   ```

### 401 Unauthorized

**Problem:** API returns 401 for authenticated requests

**Solutions:**

1. **Check token in cookies:**

   - DevTools → Application → Cookies
   - Verify accessToken exists

2. **Token refresh not working:**

   ```typescript
   // Check interceptor in client/lib/api.ts
   // Verify refresh endpoint works
   ```

3. **Check middleware order:**
   ```typescript
   // server/src/routes/
   // Ensure authenticateToken middleware is applied
   router.get("/protected", authenticateToken, controller);
   ```

---

## File Upload Issues

### Upload Fails

**Problem:** `Error uploading file` or `413 Payload Too Large`

**Solutions:**

1. **Check file size limit:**

   ```typescript
   // Server allows up to 5MB per file
   const MAX_FILE_SIZE = 5 * 1024 * 1024;
   ```

2. **Check AWS S3 credentials:**

   ```env
   AWS_ACCESS_KEY_ID=your-key
   AWS_SECRET_ACCESS_KEY=your-secret
   AWS_REGION=eu-west-3
   AWS_S3_BUCKET=your-bucket
   ```

3. **Test S3 connection:**
   ```typescript
   // Create a test script to verify S3 upload
   import { uploadToS3 } from "./services/s3Service";
   ```

### Image Not Displaying

**Problem:** Uploaded image URL not working

**Solutions:**

1. **Check S3 bucket permissions:**

   - Bucket should allow presigned URLs
   - CORS configuration needed for client access

2. **Verify image URL format:**

   ```typescript
   // Should be full S3 URL
   https://bucket-name.s3.region.amazonaws.com/key
   ```

3. **Check presigned URL expiration:**
   ```typescript
   // URLs expire after set time (default: 1 hour)
   // Generate new presigned URL if expired
   ```

---

## WebSocket Issues

### Socket Connection Failed

**Problem:** `WebSocket connection failed`

**Solutions:**

1. **Check server is running:**

   ```powershell
   # Verify server running on port 4000
   curl http://localhost:4000/api/health
   ```

2. **Check Socket.IO configuration:**

   ```typescript
   // Verify CORS allows frontend origin
   io.on("connection", (socket) => {
     console.log("Client connected");
   });
   ```

3. **Check client connection:**
   ```typescript
   // client/context/SocketContext.tsx
   const socket = io("http://localhost:4000", {
     auth: { token: accessToken },
   });
   ```

### Messages Not Received

**Problem:** Chat messages not appearing in real-time

**Solutions:**

1. **Check event names:**

   ```typescript
   // Must match exactly
   // Client: socket.on('message:new', ...)
   // Server: socket.emit('message:new', ...)
   ```

2. **Check room join:**

   ```typescript
   // Ensure user joined correct room/conversation
   socket.join(conversationId);
   ```

3. **Check authentication:**
   ```typescript
   // Socket.IO connection requires valid JWT
   // Verify token in socket handshake
   ```

---

## Build and Deployment Issues

### Production Build Fails

**Problem:** `npm run build` fails

**Solutions:**

1. **Fix TypeScript errors:**

   ```powershell
   # Check for type errors
   npx tsc --noEmit
   ```

2. **Fix ESLint errors:**

   ```powershell
   npm run lint
   # Fix all linting errors
   ```

3. **Clear cache and rebuild:**

   ```powershell
   # Client
   Remove-Item -Recurse .next
   npm run build

   # Server
   Remove-Item -Recurse dist
   npm run build
   ```

### Environment Variables in Production

**Problem:** Environment variables not working in production

**Solutions:**

1. **Set production environment variables:**

   ```bash
   # On server or in deployment platform
   export NODE_ENV=production
   export MONGODB_URL=mongodb+srv://...
   # ... all other variables
   ```

2. **Check Next.js environment:**

   ```env
   # Must use NEXT_PUBLIC_ prefix for client-side
   NEXT_PUBLIC_API_URL=https://api.production.com/api
   ```

3. **Rebuild after env changes:**
   ```powershell
   npm run build
   # Environment variables are bundled at build time
   ```

---

## General Debugging Tips

### Enable Debug Logging

**Server:**

```env
LOG_LEVEL=debug
```

**Client:**

```typescript
// Use browser DevTools Console
// Check Network tab for API calls
// Check Application tab for cookies/storage
```

### Check Logs

**Server logs:**

```powershell
# Check server terminal output
# Check logs/app.log file

Get-Content server/logs/app.log -Tail 50
```

**Browser console:**

- Open DevTools (F12)
- Check Console tab for errors
- Check Network tab for failed requests

### Use Debugger

**VS Code:**

```json
// .vscode/launch.json
{
  "type": "node",
  "request": "launch",
  "name": "Debug Server",
  "runtimeExecutable": "npm",
  "runtimeArgs": ["run", "dev"],
  "cwd": "${workspaceFolder}/server"
}
```

**Browser:**

```typescript
debugger; // Pauses execution in DevTools
```

---

## Getting Help

**Still stuck?**

1. **Search existing issues**: Check GitHub issues
2. **Read error message carefully**: Often contains solution
3. **Google the error**: Likely someone had same issue
4. **Check documentation**: Reference docs for clarification
5. **Ask for help**: Open GitHub issue with details

**When asking for help, provide:**

- Error message (full stack trace)
- Steps to reproduce
- Environment (OS, Node version, etc.)
- What you've tried
- Relevant code snippets

---

**Most issues have simple solutions - don't give up!**
