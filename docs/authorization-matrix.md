# Authorization Matrix

This document provides a comprehensive overview of route protection and access control across the MonHubImmo platform.

**Last Updated:** November 1, 2025

---

## 📋 Quick Reference

| Symbol | Meaning                 |
| ------ | ----------------------- |
| ✅     | Access Granted          |
| ❌     | Access Denied           |
| 🔒     | Authentication Required |
| 👤     | Ownership Required      |
| 🎭     | Role-Based Access       |

---

## 🔐 Backend API Routes

### Authentication Routes (`/api/auth/*`)

| Route                       | Method | Public | Agent | Apporteur | Notes                                   |
| --------------------------- | ------ | ------ | ----- | --------- | --------------------------------------- |
| `/auth/signup`              | POST   | ✅     | ✅    | ✅        | Rate limited (authLimiter)              |
| `/auth/login`               | POST   | ✅     | ✅    | ✅        | Rate limited (authLimiter)              |
| `/auth/forgot-password`     | POST   | ✅     | ✅    | ✅        | Rate limited (passwordResetLimiter)     |
| `/auth/reset-password`      | POST   | ✅     | ✅    | ✅        | Rate limited (passwordResetLimiter)     |
| `/auth/verify-email`        | POST   | ✅     | ✅    | ✅        | Rate limited (emailVerificationLimiter) |
| `/auth/resend-verification` | POST   | ✅     | ✅    | ✅        | Rate limited (emailVerificationLimiter) |
| `/auth/agents`              | GET    | ✅     | ✅    | ✅        | Public agent listing                    |
| `/auth/refresh`             | POST   | ✅     | ✅    | ✅        | Uses refresh token from cookie          |
| `/auth/logout`              | POST   | ✅     | ✅    | ✅        | Clears httpOnly cookies                 |
| `/auth/profile`             | GET    | 🔒     | ✅    | ✅        | Returns current user profile            |
| `/auth/profile`             | PUT    | 🔒     | ✅    | ✅        | Update user profile                     |
| `/auth/complete-profile`    | POST   | 🔒     | ✅    | ✅        | Complete profile after signup           |
| `/auth/change-password`     | POST   | 🔒     | ✅    | ✅        | Change password                         |
| `/auth/search-preferences`  | PATCH  | 🔒     | ✅    | ✅        | Update search preferences               |

---

### Property Routes (`/api/properties/*`)

| Route                         | Method | Public | Agent | Apporteur | Notes                                      |
| ----------------------------- | ------ | ------ | ----- | --------- | ------------------------------------------ |
| `/properties`                 | GET    | ✅     | ✅    | ✅        | Public property listings (rate limited)    |
| `/properties/:id`             | GET    | ✅     | ✅    | ✅        | View single property (rate limited)        |
| `/properties/create-property` | POST   | ❌     | ✅ 🎭 | ❌        | **Agents only** - `requireRole(['agent'])` |
| `/properties/:id/update`      | PUT    | 🔒     | ✅ 👤 | ❌        | Owner only - `requireOwnership`            |
| `/properties/:id`             | DELETE | 🔒     | ✅ 👤 | ❌        | Owner only - `requireOwnership`            |
| `/properties/my/properties`   | GET    | 🔒     | ✅    | ❌        | User's own properties                      |
| `/properties/my/stats`        | GET    | 🔒     | ✅    | ❌        | Property statistics                        |
| `/properties/:id/status`      | PATCH  | 🔒     | ✅ 👤 | ❌        | Owner only - `requireOwnership`            |

**Key Restrictions:**

- Only agents can create properties
- Only property owners can update, delete, or change status
- Public can view all active properties

---

### Search Ad Routes (`/api/search-ads/*`)

| Route                    | Method | Public | Agent | Apporteur | Notes                           |
| ------------------------ | ------ | ------ | ----- | --------- | ------------------------------- |
| `/search-ads`            | GET    | ✅     | ✅    | ✅        | Public search ad listings       |
| `/search-ads/:id`        | GET    | ✅     | ✅    | ✅        | View single search ad           |
| `/search-ads`            | POST   | 🔒     | ✅    | ✅        | Create search ad                |
| `/search-ads/my-ads`     | GET    | 🔒     | ✅    | ✅        | User's own search ads           |
| `/search-ads/:id`        | PUT    | 🔒     | ✅ 👤 | ✅ 👤     | Owner only - `requireOwnership` |
| `/search-ads/:id`        | DELETE | 🔒     | ✅ 👤 | ✅ 👤     | Owner only - `requireOwnership` |
| `/search-ads/:id/status` | PATCH  | 🔒     | ✅ 👤 | ✅ 👤     | Owner only - `requireOwnership` |

**Key Restrictions:**

- Both agents and apporteurs can create search ads
- Only search ad owners can update, delete, or change status

---

### Collaboration Routes (`/api/collaboration/*`)

| Route                                  | Method | Public | Agent | Apporteur | Notes                                                    |
| -------------------------------------- | ------ | ------ | ----- | --------- | -------------------------------------------------------- |
| `/collaboration`                       | POST   | 🔒     | ✅    | ✅        | Propose collaboration                                    |
| `/collaboration`                       | GET    | 🔒     | ✅    | ✅        | Get user's collaborations                                |
| `/collaboration/property/:propertyId`  | GET    | 🔒     | ✅    | ✅        | Collaborations for property                              |
| `/collaboration/search-ad/:searchAdId` | GET    | 🔒     | ✅    | ✅        | Collaborations for search ad                             |
| `/collaboration/:id/respond`           | POST   | 🔒     | ✅ 👤 | ✅ 👤     | **Owner or collaborator** - `requireCollaborationAccess` |
| `/collaboration/:id/notes`             | POST   | 🔒     | ✅ 👤 | ✅ 👤     | **Owner or collaborator** - `requireCollaborationAccess` |
| `/collaboration/:id/cancel`            | DELETE | 🔒     | ✅ 👤 | ✅ 👤     | **Owner or collaborator** - `requireCollaborationAccess` |
| `/collaboration/:id/progress`          | PUT    | 🔒     | ✅ 👤 | ✅ 👤     | **Owner or collaborator** - `requireCollaborationAccess` |
| `/collaboration/:id/sign`              | POST   | 🔒     | ✅ 👤 | ✅ 👤     | **Owner or collaborator** - `requireCollaborationAccess` |
| `/collaboration/:id/complete`          | POST   | 🔒     | ✅ 👤 | ✅ 👤     | **Owner or collaborator** - `requireCollaborationAccess` |

**Key Restrictions:**

- All collaboration routes require authentication
- Most actions require being either the post owner OR the collaborator
- Special middleware: `requireCollaborationAccess()` validates user is participant

---

### Favorites Routes (`/api/favorites/*`)

| Route                                      | Method | Public | Agent | Apporteur | Notes                                     |
| ------------------------------------------ | ------ | ------ | ----- | --------- | ----------------------------------------- |
| `/favorites`                               | GET    | 🔒     | ✅    | ✅        | User's favorite properties                |
| `/favorites/mixed`                         | GET    | 🔒     | ✅    | ✅        | Mixed favorites (properties + search ads) |
| `/favorites/status/:propertyId`            | GET    | 🔒     | ✅    | ✅        | Check if property is favorited            |
| `/favorites/search-ads/status/:searchAdId` | GET    | 🔒     | ✅    | ✅        | Check if search ad is favorited           |
| `/favorites/ids`                           | GET    | 🔒     | ✅    | ✅        | User's favorite property IDs              |
| `/favorites/search-ads/ids`                | GET    | 🔒     | ✅    | ✅        | User's favorite search ad IDs             |
| `/favorites/properties/:propertyId/toggle` | POST   | 🔒     | ✅    | ✅        | Toggle property favorite                  |
| `/favorites/search-ads/:searchAdId/toggle` | POST   | 🔒     | ✅    | ✅        | Toggle search ad favorite                 |

---

### Appointment Routes (`/api/appointments/*`)

| Route                                       | Method | Public | Agent | Apporteur | Notes                                               |
| ------------------------------------------- | ------ | ------ | ----- | --------- | --------------------------------------------------- |
| `/appointments/availability/:agentId`       | GET    | ✅     | ✅    | ✅        | View agent availability                             |
| `/appointments/availability/:agentId/slots` | GET    | ✅     | ✅    | ✅        | Available time slots                                |
| `/appointments`                             | POST   | ✅     | ✅    | ✅        | **Anonymous booking allowed** - uses `optionalAuth` |
| `/appointments/my`                          | GET    | 🔒     | ✅    | ✅        | User's appointments                                 |
| `/appointments/my/stats`                    | GET    | 🔒     | ✅    | ✅        | Appointment statistics                              |
| `/appointments/:id`                         | GET    | 🔒     | ✅    | ✅        | View specific appointment                           |
| `/appointments/:id/status`                  | PATCH  | 🔒     | ✅    | ✅        | Update appointment status                           |
| `/appointments/:id/reschedule`              | PATCH  | 🔒     | ✅    | ✅        | Reschedule appointment                              |
| `/appointments/availability`                | PATCH  | 🔒     | ✅    | ❌        | **Agents only** - Update availability               |

**Special Feature:**

- Anonymous users can book appointments (email required)
- `optionalAuth` middleware attaches user if logged in

---

### Chat Routes (`/api/chat/*`)

| Route              | Method | Public | Agent | Apporteur | Notes                  |
| ------------------ | ------ | ------ | ----- | --------- | ---------------------- |
| `/chat/users`      | GET    | 🔒     | ✅    | ✅        | Get users for sidebar  |
| `/chat/user/:id`   | GET    | 🔒     | ✅    | ✅        | Get user by ID         |
| `/chat/:id`        | GET    | 🔒     | ✅    | ✅        | Get messages with user |
| `/chat/send/:id`   | POST   | 🔒     | ✅    | ✅        | Send message           |
| `/chat/read/:id`   | PUT    | 🔒     | ✅    | ✅        | Mark messages as read  |
| `/chat/:messageId` | DELETE | 🔒     | ✅    | ✅        | Delete message         |

---

### Notifications Routes (`/api/notifications/*`)

| Route                     | Method | Public | Agent | Apporteur | Notes               |
| ------------------------- | ------ | ------ | ----- | --------- | ------------------- |
| `/notifications`          | GET    | 🔒     | ✅    | ✅        | List notifications  |
| `/notifications/count`    | GET    | 🔒     | ✅    | ✅        | Unread count        |
| `/notifications/:id/read` | PATCH  | 🔒     | ✅    | ✅        | Mark as read        |
| `/notifications/read-all` | PATCH  | 🔒     | ✅    | ✅        | Mark all as read    |
| `/notifications/:id`      | DELETE | 🔒     | ✅    | ✅        | Delete notification |

---

### Upload Routes (`/api/upload/*`)

| Route                   | Method | Public | Agent | Apporteur | Notes                    |
| ----------------------- | ------ | ------ | ----- | --------- | ------------------------ |
| `/upload/single`        | POST   | 🔒     | ✅    | ✅        | Upload single image      |
| `/upload/chat-file`     | POST   | 🔒     | ✅    | ✅        | Upload chat file         |
| `/upload/delete`        | DELETE | 🔒     | ✅    | ✅        | Delete uploaded file     |
| `/upload/identity-card` | POST   | 🔒     | ✅    | ✅        | Upload identity document |

---

### Contract Routes (`/api/contract/*`)

| Route                             | Method | Public | Agent | Apporteur | Notes                                    |
| --------------------------------- | ------ | ------ | ----- | --------- | ---------------------------------------- |
| `/contract/:collaborationId`      | GET    | 🔒     | ✅ 👤 | ✅ 👤     | Get contract (collaboration participant) |
| `/contract/:collaborationId`      | PUT    | 🔒     | ✅ 👤 | ✅ 👤     | Update contract                          |
| `/contract/:collaborationId/sign` | POST   | 🔒     | ✅ 👤 | ✅ 👤     | Sign contract                            |

---

## 🎨 Frontend Routes

### Public Routes (No authentication required)

| Route                   | Description                                     | Middleware Protection                   |
| ----------------------- | ----------------------------------------------- | --------------------------------------- |
| `/`                     | Landing page (redirects authenticated to /home) | ✅ Middleware                           |
| `/home`                 | Public home page                                | ✅ Middleware                           |
| `/auth/login`           | Login page (redirects authenticated away)       | ✅ Middleware                           |
| `/auth/signup`          | Signup page (redirects authenticated away)      | ✅ Middleware                           |
| `/auth/verify-email`    | Email verification                              | ✅ Middleware                           |
| `/auth/forgot-password` | Password reset request                          | ✅ Middleware                           |
| `/auth/reset-password`  | Password reset                                  | ✅ Middleware                           |
| `/auth/welcome`         | Welcome page after signup                       | ✅ Middleware                           |
| `/property/[id]`        | View property details                           | ✅ Public (optional auth for favorites) |
| `/search-ads`           | Browse search ads                               | ✅ Public                               |
| `/search-ads/[id]`      | View search ad details                          | ✅ Public (optional auth)               |
| `/monagentimmo`         | Public agent directory                          | ✅ Public                               |

### Protected Routes (Authentication required)

| Route                   | Description           | Component Protection  | Middleware Protection  |
| ----------------------- | --------------------- | --------------------- | ---------------------- |
| `/dashboard`            | User dashboard        | ✅ `<ProtectedRoute>` | ✅ Middleware          |
| `/search-ads/create`    | Create search ad      | ✅ `<ProtectedRoute>` | ✅ Middleware          |
| `/search-ads/edit/[id]` | Edit search ad        | ✅ `<ProtectedRoute>` | ✅ Middleware          |
| `/collaboration`        | Collaborations list   | ❌ Manual check       | ✅ Middleware          |
| `/collaboration/[id]`   | Collaboration details | ✅ `<ProtectedRoute>` | ✅ Middleware          |
| `/messages`             | Chat/messaging        | ❌ Not implemented    | ⚠️ Route doesn't exist |
| `/favorites`            | Favorites list        | ❌ Not implemented    | ⚠️ Route doesn't exist |
| `/appointments/my`      | My appointments       | ❌ Not implemented    | ⚠️ Route doesn't exist |

**Protection Layers:**

1. **Next.js Middleware** (Edge runtime) - Blocks at server level
2. **Component Wrapper** (`<ProtectedRoute>`) - Adds loading states and redirect UX
3. **Manual Checks** - Direct use of `useAuth()` hook

---

## 🔒 Security Patterns

### Token Management

- **Access Token:** 15 minutes validity, stored in httpOnly cookie
- **Refresh Token:** 7 days validity, stored in httpOnly cookie
- **Blacklisting:** Tokens revoked on logout (Redis-based)
- **CSRF Protection:** Required for state-changing requests (POST, PUT, PATCH, DELETE)

### Middleware Stack

1. **Rate Limiting:** Different limits for auth, password reset, email verification
2. **Authentication:** `authenticateToken` middleware validates JWT
3. **Authorization:**
   - `requireRole([roles])` - Role-based access
   - `requireOwnership(Model)` - Resource ownership
   - `requireCollaborationAccess()` - Collaboration participant check
4. **Validation:** Zod schemas validate request data

### Cookie Security

- `httpOnly: true` - Prevents XSS attacks
- `secure: true` (production) - HTTPS only
- `sameSite: 'lax'` - CSRF protection
- `maxAge: 15min/7days` - Time-based expiry

---

## 🚨 Common Authorization Errors

| Error Code | Message                  | Cause                      | Solution                        |
| ---------- | ------------------------ | -------------------------- | ------------------------------- |
| 401        | Authentification requise | No valid access token      | Login required                  |
| 401        | Token révoqué            | Token blacklisted          | Re-login required               |
| 403        | Token invalide ou expiré | JWT verification failed    | Refresh token or re-login       |
| 403        | Insufficient permissions | Role mismatch              | User doesn't have required role |
| 403        | Not owner                | Ownership check failed     | User not resource owner         |
| 403        | CSRF token invalid       | Missing/invalid CSRF token | Refresh page to get new token   |

---

## 📝 Implementation Notes

### Redundant Checks Removed (November 1, 2025)

- Removed `if (!req.user)` checks from controllers where routes already use `authenticateToken`
- Files cleaned: `propertyController.ts`, `searchAdController.ts`
- Reason: Middleware guarantees `req.user` exists, redundant checks add maintenance burden

### Route Organization Standard

All route files now follow this pattern:

```typescript
// 1. Public routes (explicitly grouped)
router.get("/public-endpoint", handler);

// 2. Apply authentication middleware
router.use(authenticateToken);

// 3. Protected routes (all below this point)
router.get("/protected", handler);
router.post("/protected", requireRole(["agent"]), handler);
```

### Optional Authentication

Routes that support both authenticated and anonymous users use `optionalAuth`:

- Appointment booking - Attaches user if logged in, allows anonymous with email
- Could be expanded to property viewing (track views for logged-in users)

---

## 🔄 Future Improvements

1. **Permission Constants:** Create centralized permission constants

   ```typescript
   const PERMISSIONS = {
     CREATE_PROPERTY: "agent",
     CREATE_SEARCH_AD: ["agent", "apporteur"],
   };
   ```

2. **Rate Limiting Per User:** Add user-based rate limiting (currently only IP-based)

3. **Audit Logging:** Track who accessed what and when (security compliance)

4. **Fine-grained Permissions:** Consider implementing CASL or similar for complex authorization

5. **API Documentation:** Generate OpenAPI/Swagger docs from route definitions

---

**Maintained by:** Development Team  
**Review Frequency:** Monthly or after major auth changes
