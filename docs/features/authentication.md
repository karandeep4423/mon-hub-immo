# Authentication System

> JWT-based authentication with email verification, password security, and session management

---

## 🔐 Overview

MonHubImmo uses a **cookie-based JWT authentication** system with:

- **Access Tokens**: Short-lived (15 minutes), stored in httpOnly cookies
- **Refresh Tokens**: Long-lived (7 days), for silent token renewal
- **Email Verification**: 6-character code verification before account activation
- **Profile Completion**: Required step for agents after email verification
- **Admin Validation**: Manual approval for new accounts

---

## 🔄 Authentication Flow

### Complete Registration Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        REGISTRATION FLOW                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   1. SIGNUP                                                                 │
│   ┌─────────┐     POST /api/auth/signup      ┌─────────┐                   │
│   │ Client  │ ────────────────────────────►  │ Server  │                   │
│   └─────────┘    { email, password, ... }    └────┬────┘                   │
│                                                   │                        │
│                                              Store in PendingVerification  │
│                                              Send verification email       │
│                                                   │                        │
│   ┌─────────┐    { success, codeSent: true }     │                        │
│   │ Client  │ ◄──────────────────────────────────┘                        │
│   └────┬────┘                                                              │
│        │                                                                   │
│   2. EMAIL VERIFICATION                                                    │
│        │                                                                   │
│   ┌────▼────┐     POST /api/auth/verify-email    ┌─────────┐               │
│   │ Client  │ ────────────────────────────────►  │ Server  │               │
│   └─────────┘      { email, code: "ABC123" }     └────┬────┘               │
│                                                       │                    │
│                                              Verify code                   │
│                                              Create User in database       │
│                                              Delete PendingVerification    │
│                                                       │                    │
│   ┌─────────┐    { success, requiresProfileCompletion }                   │
│   │ Client  │ ◄───────────────────────────────────────┘                   │
│   └────┬────┘                                                              │
│        │                                                                   │
│   3. PROFILE COMPLETION (Agents only)                                      │
│        │                                                                   │
│   ┌────▼────┐     POST /api/auth/complete-profile   ┌─────────┐            │
│   │ Client  │ ─────────────────────────────────────►│ Server  │            │
│   └─────────┘    { professionalInfo: { ... } }      └────┬────┘            │
│                                                          │                 │
│                                              Update user profile           │
│                                              Set profileCompleted = true   │
│                                                          │                 │
│   ┌─────────┐    { success, requiresAdminValidation }    │                 │
│   │ Client  │ ◄──────────────────────────────────────────┘                 │
│   └────┬────┘                                                              │
│        │                                                                   │
│   4. ADMIN VALIDATION                                                      │
│        │                                                                   │
│        ▼                                                                   │
│   Account pending until admin validates                                    │
│                                                                            │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Login Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           LOGIN FLOW                                        │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   ┌─────────┐        POST /api/auth/login          ┌─────────┐             │
│   │ Client  │ ───────────────────────────────────► │ Server  │             │
│   └─────────┘       { email, password }            └────┬────┘             │
│                                                         │                  │
│                                         1. Check rate limiting             │
│                                         2. Validate credentials            │
│                                         3. Check account status            │
│                                         4. Generate tokens                 │
│                                         5. Set httpOnly cookies            │
│                                                         │                  │
│   ┌─────────┐     Set-Cookie: accessToken=...          │                  │
│   │ Client  │     Set-Cookie: refreshToken=...         │                  │
│   │         │ ◄────────────────────────────────────────┘                  │
│   └─────────┘     { success, user }                                       │
│                                                                            │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Token Refresh Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        TOKEN REFRESH FLOW                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   Access token expires (401 response)                                       │
│                           │                                                │
│                           ▼                                                │
│   ┌─────────┐        POST /api/auth/refresh        ┌─────────┐             │
│   │ Client  │ ───────────────────────────────────► │ Server  │             │
│   └─────────┘   (refreshToken in cookie)           └────┬────┘             │
│                                                         │                  │
│                                         1. Verify refresh token            │
│                                         2. Check user still exists         │
│                                         3. Generate new access token       │
│                                         4. Set new cookie                  │
│                                                         │                  │
│   ┌─────────┐     Set-Cookie: accessToken=...          │                  │
│   │ Client  │ ◄────────────────────────────────────────┘                  │
│   └─────────┘     { success }                                             │
│                                                                            │
│   Retry original request with new token                                    │
│                                                                            │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 🍪 Cookie Configuration

### Security Settings

```typescript
// utils/cookieHelper.ts
const COOKIE_OPTIONS = {
  httpOnly: true, // Not accessible via JavaScript
  secure: process.env.NODE_ENV === "production", // HTTPS only in prod
  sameSite: "lax", // CSRF protection
  path: "/",
};

// Access token - short expiry
const ACCESS_TOKEN_OPTIONS = {
  ...COOKIE_OPTIONS,
  maxAge: 15 * 60 * 1000, // 15 minutes
};

// Refresh token - longer expiry
const REFRESH_TOKEN_OPTIONS = {
  ...COOKIE_OPTIONS,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

export const setAuthCookies = (
  res: Response,
  accessToken: string,
  refreshToken: string
) => {
  res.cookie("accessToken", accessToken, ACCESS_TOKEN_OPTIONS);
  res.cookie("refreshToken", refreshToken, REFRESH_TOKEN_OPTIONS);
};

export const clearAuthCookies = (res: Response) => {
  res.clearCookie("accessToken", COOKIE_OPTIONS);
  res.clearCookie("refreshToken", COOKIE_OPTIONS);
};
```

---

## 🔑 Password Security

### Requirements

| Requirement       | Value                      |
| ----------------- | -------------------------- |
| Minimum length    | 12 characters              |
| Maximum length    | 128 characters             |
| Uppercase         | At least 1                 |
| Lowercase         | At least 1                 |
| Number            | At least 1                 |
| Special character | At least 1 (@$!%\*?&\_-+=) |

### Strength Validation

```typescript
// utils/passwordValidator.ts
import zxcvbn from "zxcvbn";

export const validatePasswordStrength = (password: string) => {
  const result = zxcvbn(password);

  return {
    isValid: result.score >= 3, // 0-4 scale, require 3+
    score: result.score,
    feedback: result.feedback,
    crackTime: result.crack_times_display,
  };
};

export const meetsBasicRequirements = (password: string) => {
  const hasMinLength = password.length >= 12;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecial = /[@$!%*?&_\-+=]/.test(password);

  return {
    isValid:
      hasMinLength && hasUppercase && hasLowercase && hasNumber && hasSpecial,
    checks: { hasMinLength, hasUppercase, hasLowercase, hasNumber, hasSpecial },
  };
};
```

### Password History

Prevents reusing recent passwords:

```typescript
// utils/passwordHistory.ts
const PASSWORD_HISTORY_COUNT = 5;

export const isPasswordInHistory = async (
  password: string,
  passwordHistory: Array<{ hash: string }>
): Promise<boolean> => {
  for (const entry of passwordHistory) {
    if (await bcrypt.compare(password, entry.hash)) {
      return true;
    }
  }
  return false;
};

export const updatePasswordHistory = (
  currentHistory: Array<{ hash: string; changedAt: Date }>,
  newHash: string
): Array<{ hash: string; changedAt: Date }> => {
  const newEntry = { hash: newHash, changedAt: new Date() };
  const history = [newEntry, ...currentHistory].slice(
    0,
    PASSWORD_HISTORY_COUNT
  );
  return history;
};
```

---

## 🚫 Rate Limiting

### Login Rate Limiting

Per-email tracking to prevent brute force:

```typescript
// middleware/loginRateLimiter.ts
const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes

export const checkLoginRateLimit = async (req, res, next) => {
  const { email } = req.body;

  const recentAttempts = await LoginAttempt.countDocuments({
    email: email.toLowerCase(),
    success: false,
    createdAt: { $gt: new Date(Date.now() - LOCKOUT_DURATION) },
  });

  if (recentAttempts >= MAX_ATTEMPTS) {
    // Also lock account in database
    await User.findOneAndUpdate(
      { email: email.toLowerCase() },
      { accountLockedUntil: new Date(Date.now() + LOCKOUT_DURATION) }
    );

    res.status(429).json({
      success: false,
      message: "Compte temporairement verrouillé. Réessayez dans 15 minutes.",
    });
    return;
  }

  next();
};
```

### Account Lockout

```typescript
// On login failure
if (user.failedLoginAttempts >= 5) {
  user.accountLockedUntil = new Date(Date.now() + 15 * 60 * 1000);
  await user.save();

  // Send account locked email
  await sendEmail({
    to: user.email,
    subject: "Compte verrouillé",
    html: getAccountLockedTemplate(user.firstName),
  });
}
```

---

## ✉️ Email Verification

### Verification Code Generation

```typescript
// utils/emailService.ts
export const generateVerificationCode = (): string => {
  const chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code; // e.g., "A3B9K2"
};
```

### Pending Verification Storage

```typescript
// During signup
const verificationCode = generateVerificationCode();

await PendingVerification.create({
  email: email.toLowerCase(),
  verificationCode,
  userData: {
    firstName,
    lastName,
    phone,
    userType,
    password: hashedPassword,
    identityCardKey,
  },
  expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
});

// Send email
await sendEmail({
  to: email,
  subject: "Vérifiez votre email - MonHubImmo",
  html: getVerificationCodeTemplate(firstName, verificationCode),
});
```

### Verification Process

```typescript
// controllers/authController.ts - verifyEmail
export const verifyEmail = async (req, res) => {
  const { email, code } = req.body;

  const pending = await PendingVerification.findOne({
    email: email.toLowerCase(),
    expiresAt: { $gt: new Date() },
  });

  if (!pending) {
    return res.status(400).json({ success: false, message: "Code expiré" });
  }

  // Timing-safe comparison to prevent timing attacks
  if (!compareVerificationCode(code, pending.verificationCode)) {
    return res.status(400).json({ success: false, message: "Code invalide" });
  }

  // Create actual user
  const user = await User.create({
    ...pending.userData,
    email: pending.email,
    isEmailVerified: true,
    profileCompleted: pending.userData.userType !== "agent",
  });

  // Clean up
  await PendingVerification.deleteOne({ _id: pending._id });

  // Set auth cookies
  const accessToken = generateToken(user._id);
  const refreshToken = generateRefreshToken(user._id);
  setAuthCookies(res, accessToken, refreshToken);

  res.json({
    success: true,
    message: "Email vérifié",
    requiresProfileCompletion:
      user.userType === "agent" && !user.profileCompleted,
    user: sanitizeUser(user),
  });
};
```

---

## 🔓 Password Reset

### Flow

```
1. User requests reset → POST /api/auth/forgot-password
2. Server generates code, sends email
3. User enters code + new password → POST /api/auth/reset-password
4. Server verifies code, updates password
```

### Implementation

```typescript
// Forgot password
export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    // Return success even if user doesn't exist (security)
    return res.json({
      success: true,
      message: "Si ce compte existe, un email a été envoyé",
    });
  }

  const resetCode = generateVerificationCode();
  user.passwordResetCode = resetCode;
  user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
  await user.save();

  await sendEmail({
    to: email,
    subject: "Réinitialisation de mot de passe - MonHubImmo",
    html: getPasswordResetTemplate(user.firstName, resetCode),
  });

  res.json({ success: true, message: "Email envoyé" });
};

// Reset password
export const resetPassword = async (req, res) => {
  const { email, code, newPassword } = req.body;

  const user = await User.findOne({
    email: email.toLowerCase(),
    passwordResetCode: code,
    passwordResetExpires: { $gt: new Date() },
  });

  if (!user) {
    return res
      .status(400)
      .json({ success: false, message: "Code invalide ou expiré" });
  }

  // Check password history
  if (
    user.passwordHistory &&
    (await isPasswordInHistory(newPassword, user.passwordHistory))
  ) {
    return res.status(400).json({
      success: false,
      message: "Ce mot de passe a déjà été utilisé récemment",
    });
  }

  // Update password
  const hashedPassword = await bcrypt.hash(newPassword, 12);
  user.password = hashedPassword;
  user.passwordResetCode = undefined;
  user.passwordResetExpires = undefined;
  user.failedLoginAttempts = 0;
  user.accountLockedUntil = undefined;
  user.passwordHistory = updatePasswordHistory(
    user.passwordHistory || [],
    hashedPassword
  );
  await user.save();

  // Clear failed login attempts
  await clearFailedAttemptsForEmail(email);

  // Send confirmation email
  await sendEmail({
    to: email,
    subject: "Mot de passe modifié - MonHubImmo",
    html: getPasswordResetConfirmationTemplate(user.firstName),
  });

  res.json({ success: true, message: "Mot de passe modifié avec succès" });
};
```

---

## 👤 User Types

| Type        | Description             | Features                                     |
| ----------- | ----------------------- | -------------------------------------------- |
| `agent`     | Real estate agents      | Create properties, collaborate, appointments |
| `apporteur` | Lead providers          | Create search ads, collaborate               |
| `admin`     | Platform administrators | Full access, user management                 |
| `guest`     | Anonymous users         | Limited booking capabilities                 |

### Profile Completion (Agents)

Agents must complete professional information:

```typescript
// Required fields for agents
professionalInfo: {
  city: string;
  postalCode: string;
  interventionRadius: number;
  network?: string;
  siretNumber?: string;
  mandateTypes: ('simple' | 'exclusif' | 'co-mandat')[];
  yearsExperience?: number;
  personalPitch?: string;
}
```

---

## 🛡️ Security Measures

### CSRF Protection

```typescript
// All state-changing requests require CSRF token
app.use("/api/property", csrfProtection, propertyRoutes);
app.use("/api/collaboration", csrfProtection, collaborationRoutes);
```

### Token Blacklisting

On logout, tokens are blacklisted in Redis:

```typescript
// utils/redisClient.ts
export const blacklistToken = async (token: string, ttl: number) => {
  await redis.set(`blacklist:${token}`, "1", "EX", ttl);
};

export const isTokenBlacklisted = async (token: string): Promise<boolean> => {
  const result = await redis.get(`blacklist:${token}`);
  return result === "1";
};
```

### Security Logging

```typescript
// utils/securityLogger.ts
export const logSecurityEvent = async (event: {
  userId?: string;
  action: string;
  ip: string;
  userAgent?: string;
  metadata?: Record<string, any>;
}) => {
  await SecurityLog.create({
    ...event,
    createdAt: new Date(),
  });

  logger.info(`[Security] ${event.action}`, event);
};

// Usage
await logSecurityEvent({
  userId: user._id,
  action: "LOGIN_SUCCESS",
  ip: getClientIp(req),
  userAgent: req.headers["user-agent"],
});
```

---

## 📱 Frontend Integration

### Auth Store (Zustand)

```typescript
// store/authStore.ts
export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  loading: true,

  login: (userData: User) => {
    set({ user: userData, loading: false });
    useFavoritesStore.getState().initializeFavorites();
  },

  logout: async () => {
    await authService.logout();
    set({ user: null, loading: false });
    window.location.href = "/auth/login";
  },

  refreshUser: async () => {
    try {
      const response = await authService.getProfile();
      if (response.success) {
        set({ user: response.user, loading: false });
      } else {
        set({ user: null, loading: false });
      }
    } catch {
      set({ user: null, loading: false });
    }
  },
}));
```

### API Interceptors

```typescript
// lib/api.ts
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        await api.post("/auth/refresh");
        return api(originalRequest);
      } catch {
        window.location.href = "/auth/login";
      }
    }
    return Promise.reject(error);
  }
);
```

### Middleware Protection

```typescript
// middleware.ts (Next.js Edge)
export function middleware(request: NextRequest) {
  const hasSession = !!request.cookies.get("accessToken")?.value;

  if (isProtectedRoute(pathname) && !hasSession) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  return NextResponse.next();
}
```

---

_Next: [Real-time Features →](./realtime.md)_
