# 🔐 API Authorization Documentation

**Last Updated:** November 1, 2025

This document provides a comprehensive overview of all API routes and their authorization requirements in the MonHubImmo application.

## Authorization Levels

- **🌐 Public**: No authentication required
- **🔒 Private**: Requires authentication (JWT token)
- **👤 Owner Only**: Requires authentication + ownership verification
- **👥 Participants**: Requires authentication + collaboration participation
- **🎭 Role-Specific**: Requires specific user role (agent/apporteur)

## Middleware Legend

- `authenticateToken`: Verifies JWT token and attaches user to request
- `requireRole([roles])`: Verifies user has one of the specified roles
- `requireOwnership(Model)`: Verifies user owns the resource
- `requireCollaborationAccess()`: Verifies user is collaboration participant
- `optionalAuth`: Allows both authenticated and unauthenticated access

---

## 🏠 Property Routes

**Base Path:** `/api/property`

| Method | Endpoint           | Access Level  | Middleware                                        | Description                        |
| ------ | ------------------ | ------------- | ------------------------------------------------- | ---------------------------------- |
| GET    | `/`                | 🌐 Public     | `generalLimiter`                                  | Get all properties with pagination |
| GET    | `/:id`             | 🌐 Public     | `generalLimiter`                                  | Get property by ID                 |
| POST   | `/create-property` | 🎭 Agent Only | `authenticateToken`, `requireRole(['agent'])`     | Create new property (agents only)  |
| PUT    | `/:id/update`      | 👤 Owner Only | `authenticateToken`, `requireOwnership(Property)` | Update property (owner only)       |
| DELETE | `/:id`             | 👤 Owner Only | `authenticateToken`, `requireOwnership(Property)` | Delete property (owner only)       |
| GET    | `/my/properties`   | 🔒 Private    | `authenticateToken`                               | Get current user's properties      |
| GET    | `/my/stats`        | 🔒 Private    | `authenticateToken`                               | Get property statistics            |
| PATCH  | `/:id/status`      | 👤 Owner Only | `authenticateToken`, `requireOwnership(Property)` | Update property status             |

---

## 🔍 Search Ads Routes

**Base Path:** `/api/search-ads`

| Method | Endpoint      | Access Level  | Middleware                                        | Description                   |
| ------ | ------------- | ------------- | ------------------------------------------------- | ----------------------------- |
| GET    | `/`           | 🌐 Public     | -                                                 | Get all active search ads     |
| GET    | `/:id`        | 🌐 Public     | -                                                 | Get search ad by ID           |
| POST   | `/`           | 🔒 Private    | `authenticateToken`                               | Create new search ad          |
| GET    | `/my-ads`     | 🔒 Private    | `authenticateToken`                               | Get current user's search ads |
| PUT    | `/:id`        | 👤 Owner Only | `authenticateToken`, `requireOwnership(SearchAd)` | Update search ad (owner only) |
| DELETE | `/:id`        | 👤 Owner Only | `authenticateToken`, `requireOwnership(SearchAd)` | Delete search ad (owner only) |
| PATCH  | `/:id/status` | 👤 Owner Only | `authenticateToken`, `requireOwnership(SearchAd)` | Update search ad status       |

---

## 🤝 Collaboration Routes

**Base Path:** `/api/collaboration`

| Method | Endpoint                 | Access Level    | Middleware                                          | Description                      |
| ------ | ------------------------ | --------------- | --------------------------------------------------- | -------------------------------- |
| POST   | `/`                      | 🔒 Private      | `authenticateToken`                                 | Create collaboration request     |
| GET    | `/`                      | 🔒 Private      | `authenticateToken`                                 | Get user's collaborations        |
| GET    | `/property/:propertyId`  | 🔒 Private      | `authenticateToken`                                 | Get collaborations for property  |
| GET    | `/search-ad/:searchAdId` | 🔒 Private      | `authenticateToken`                                 | Get collaborations for search ad |
| GET    | `/:id`                   | 🔒 Private      | `authenticateToken`                                 | Get collaboration by ID          |
| POST   | `/:id/respond`           | 👥 Participants | `authenticateToken`, `requireCollaborationAccess()` | Respond to collaboration         |
| POST   | `/:id/notes`             | 👥 Participants | `authenticateToken`, `requireCollaborationAccess()` | Add notes to collaboration       |
| DELETE | `/:id/cancel`            | 👥 Participants | `authenticateToken`, `requireCollaborationAccess()` | Cancel collaboration             |
| PUT    | `/:id/progress-status`   | 👥 Participants | `authenticateToken`, `requireCollaborationAccess()` | Update progress status           |
| POST   | `/:id/sign`              | 👥 Participants | `authenticateToken`, `requireCollaborationAccess()` | Sign collaboration               |
| POST   | `/:id/complete`          | 👥 Participants | `authenticateToken`, `requireCollaborationAccess()` | Complete collaboration           |

---

## 📄 Contract Routes

**Base Path:** `/api/contract`

| Method | Endpoint    | Access Level    | Middleware                                          | Description             |
| ------ | ----------- | --------------- | --------------------------------------------------- | ----------------------- |
| GET    | `/:id`      | 👥 Participants | `authenticateToken`, `requireCollaborationAccess()` | Get contract details    |
| PUT    | `/:id`      | 👥 Participants | `authenticateToken`, `requireCollaborationAccess()` | Update contract content |
| POST   | `/:id/sign` | 👥 Participants | `authenticateToken`, `requireCollaborationAccess()` | Sign contract           |

---

## 💬 Message/Chat Routes

**Base Path:** `/api/message`

| Method | Endpoint      | Access Level | Middleware          | Description            |
| ------ | ------------- | ------------ | ------------------- | ---------------------- |
| GET    | `/users`      | 🔒 Private   | `authenticateToken` | Get users for sidebar  |
| GET    | `/user/:id`   | 🔒 Private   | `authenticateToken` | Get user by ID         |
| GET    | `/:id`        | 🔒 Private   | `authenticateToken` | Get messages with user |
| POST   | `/send/:id`   | 🔒 Private   | `authenticateToken` | Send message to user   |
| PUT    | `/read/:id`   | 🔒 Private   | `authenticateToken` | Mark messages as read  |
| DELETE | `/:messageId` | 🔒 Private   | `authenticateToken` | Delete message         |

---

## 📅 Appointment Routes

**Base Path:** `/api/appointments`

| Method | Endpoint                       | Access Level | Middleware          | Description                                    |
| ------ | ------------------------------ | ------------ | ------------------- | ---------------------------------------------- |
| GET    | `/availability/:agentId`       | 🌐 Public    | -                   | Get agent availability                         |
| GET    | `/availability/:agentId/slots` | 🌐 Public    | -                   | Get available time slots                       |
| POST   | `/`                            | 🌐 Public\*  | `optionalAuth`      | Create appointment (public with optional auth) |
| GET    | `/my`                          | 🔒 Private   | `authenticateToken` | Get user's appointments                        |
| GET    | `/my/stats`                    | 🔒 Private   | `authenticateToken` | Get appointment statistics                     |
| GET    | `/:id`                         | 🔒 Private   | `authenticateToken` | Get appointment by ID                          |
| PATCH  | `/:id/status`                  | 🔒 Private   | `authenticateToken` | Update appointment status                      |
| PATCH  | `/:id/reschedule`              | 🔒 Private   | `authenticateToken` | Reschedule appointment                         |
| PATCH  | `/availability`                | 🔒 Private   | `authenticateToken` | Update agent availability                      |

_Note: Appointment creation is public to allow guests to book, but authenticated users get enhanced UX_

---

## 📤 Upload Routes

**Base Path:** `/api/upload`

| Method | Endpoint         | Access Level | Middleware          | Description            |
| ------ | ---------------- | ------------ | ------------------- | ---------------------- |
| POST   | `/single`        | 🔒 Private   | `authenticateToken` | Upload single file     |
| POST   | `/chat-file`     | 🔒 Private   | `authenticateToken` | Upload chat attachment |
| DELETE | `/delete`        | 🔒 Private   | `authenticateToken` | Delete uploaded file   |
| POST   | `/identity-card` | 🔒 Private   | `authenticateToken` | Upload identity card   |

---

## 🔔 Notification Routes

**Base Path:** `/api/notifications`

| Method | Endpoint    | Access Level | Middleware          | Description               |
| ------ | ----------- | ------------ | ------------------- | ------------------------- |
| GET    | `/`         | 🔒 Private   | `authenticateToken` | List user notifications   |
| GET    | `/count`    | 🔒 Private   | `authenticateToken` | Get unread count          |
| PATCH  | `/:id/read` | 🔒 Private   | `authenticateToken` | Mark notification as read |
| PATCH  | `/read-all` | 🔒 Private   | `authenticateToken` | Mark all as read          |
| DELETE | `/:id`      | 🔒 Private   | `authenticateToken` | Delete notification       |

---

## ⭐ Favorites Routes

**Base Path:** `/api/favorites`

| Method | Endpoint                         | Access Level | Middleware          | Description                     |
| ------ | -------------------------------- | ------------ | ------------------- | ------------------------------- |
| POST   | `/properties/:propertyId/toggle` | 🔒 Private   | `authenticateToken` | Toggle property favorite        |
| POST   | `/search-ads/:searchAdId/toggle` | 🔒 Private   | `authenticateToken` | Toggle search ad favorite       |
| GET    | `/`                              | 🔒 Private   | `authenticateToken` | Get user's favorite properties  |
| GET    | `/mixed`                         | 🔒 Private   | `authenticateToken` | Get mixed favorites             |
| GET    | `/status/:propertyId`            | 🔒 Private   | `authenticateToken` | Check property favorite status  |
| GET    | `/search-ads/status/:searchAdId` | 🔒 Private   | `authenticateToken` | Check search ad favorite status |
| GET    | `/ids`                           | 🔒 Private   | `authenticateToken` | Get favorite property IDs       |
| GET    | `/search-ads/ids`                | 🔒 Private   | `authenticateToken` | Get favorite search ad IDs      |

---

## 🔐 Authentication Routes

**Base Path:** `/api/auth`

| Method | Endpoint               | Access Level | Middleware          | Description              |
| ------ | ---------------------- | ------------ | ------------------- | ------------------------ |
| POST   | `/signup`              | 🌐 Public    | -                   | User registration        |
| POST   | `/login`               | 🌐 Public    | -                   | User login               |
| POST   | `/logout`              | 🔒 Private   | `authenticateToken` | User logout              |
| POST   | `/refresh-token`       | 🌐 Public    | -                   | Refresh JWT token        |
| POST   | `/verify-email`        | 🌐 Public    | -                   | Verify email with code   |
| POST   | `/resend-verification` | 🌐 Public    | -                   | Resend verification code |
| POST   | `/forgot-password`     | 🌐 Public    | -                   | Request password reset   |
| POST   | `/reset-password`      | 🌐 Public    | -                   | Reset password with code |
| GET    | `/profile`             | 🔒 Private   | `authenticateToken` | Get user profile         |
| PUT    | `/profile`             | 🔒 Private   | `authenticateToken` | Update user profile      |
| PATCH  | `/change-password`     | 🔒 Private   | `authenticateToken` | Change password          |

---

## 🛡️ Security Implementation Details

### Role-Based Access Control (RBAC)

The system implements two user roles:

- **Agent**: Can create properties, manage listings
- **Apporteur**: Can create search ads, request collaborations

```typescript
// Example: Only agents can create properties
requireRole(["agent"]);
```

### Ownership Verification

Resources are protected at the middleware level:

- Verifies user owns the resource before allowing modifications
- Attaches resource to `req.resource` for controller use
- Prevents unauthorized access to other users' data

```typescript
// Example: Only owners can update their search ads
requireOwnership(SearchAd);
```

### Collaboration Access

Special authorization for collaboration resources:

- Verifies user is either post owner or collaborator
- Used for contracts, signing, notes, etc.
- Ensures only participants can access collaboration data

```typescript
// Example: Only participants can sign contracts
requireCollaborationAccess();
```

### Authentication Flow

1. **Client Login** → Server validates credentials
2. **JWT Token** → Stored in httpOnly cookies
3. **Request** → Token sent automatically with requests
4. **Middleware** → Validates token, attaches user to `req.user`
5. **Authorization** → Role/ownership checks
6. **Controller** → Business logic execution

---

## 🔧 Using Authorization in Code

### Backend (Adding Protected Routes)

```typescript
// Public route
router.get("/properties", getProperties);

// Authenticated route
router.get("/my-properties", authenticateToken, getMyProperties);

// Role-specific route
router.post(
  "/property",
  authenticateToken,
  requireRole(["agent"]),
  createProperty
);

// Ownership-protected route
router.put(
  "/:id",
  authenticateToken,
  requireOwnership(Property),
  updateProperty
);

// Collaboration-protected route
router.post(
  "/:id/sign",
  authenticateToken,
  requireCollaborationAccess(),
  signContract
);
```

### Frontend (Accessing Protected Routes)

```typescript
// Authenticated requests automatically include JWT cookie
const response = await api.get("/api/property/my/properties");

// Error handling for unauthorized access
try {
  await api.put(`/api/property/${id}`, data);
} catch (error) {
  if (error.response?.status === 403) {
    toast.error("Vous n'avez pas la permission");
  }
}
```

---

## 🚨 Error Responses

### 401 Unauthorized

```json
{
  "success": false,
  "message": "Authentification requise"
}
```

### 403 Forbidden - Insufficient Role

```json
{
  "success": false,
  "message": "Accès refusé - rôle insuffisant"
}
```

### 403 Forbidden - Not Owner

```json
{
  "success": false,
  "message": "Accès refusé - vous ne pouvez modifier que vos propres ressources"
}
```

### 403 Forbidden - Not Participant

```json
{
  "success": false,
  "message": "Accès refusé - vous devez être propriétaire ou collaborateur"
}
```

### 404 Not Found

```json
{
  "success": false,
  "message": "Ressource non trouvée"
}
```

---

## 📊 Authorization Summary

| Authorization Type | Routes Count | Use Case                                   |
| ------------------ | ------------ | ------------------------------------------ |
| 🌐 Public          | ~10 routes   | Property listing, search ads, appointments |
| 🔒 Private         | ~35 routes   | User-specific data, messaging              |
| 👤 Owner Only      | ~10 routes   | Modify own properties/search ads           |
| 👥 Participants    | ~9 routes    | Collaboration management                   |
| 🎭 Role-Specific   | ~1 route     | Agent-only property creation               |

---

## ✅ Best Practices

1. **Always use middleware** - Never implement authorization in controllers
2. **Fail closed** - Deny access by default, explicitly allow
3. **Verify ownership** - Check resource ownership at middleware level
4. **Log failures** - Track authorization failures for security monitoring
5. **Consistent errors** - Use centralized error messages
6. **Test thoroughly** - Test all authorization paths (success + failure)

---

## 🔗 Related Documentation

- [Authentication Security Audit](./auth-security-audit.md)
- [Authorization Middleware](../server/src/middleware/authorize.ts)
- [Auth Helpers](../server/src/utils/authHelpers.ts)
- [Route Protection Implementation](./route-protection-implementation.md)

---

**For security issues or questions, contact the development team.**
