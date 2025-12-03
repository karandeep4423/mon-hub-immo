# API Endpoints Reference

> Complete REST API endpoint documentation

---

## 🔐 Authentication

### POST /api/auth/signup

Create new user account.

**Body:**

```json
{
  "email": "user@example.com",
  "password": "Password123!",
  "userType": "agent",
  "firstName": "Jean",
  "lastName": "Dupont"
}
```

**Response:** `201 Created`

```json
{
  "message": "Account created. Please verify your email.",
  "user": {
    "_id": "...",
    "email": "user@example.com",
    "userType": "agent"
  }
}
```

---

### POST /api/auth/login

Authenticate user.

**Body:**

```json
{
  "email": "user@example.com",
  "password": "Password123!"
}
```

**Response:** `200 OK`

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "_id": "...",
    "email": "user@example.com",
    "userType": "agent",
    "firstName": "Jean",
    "lastName": "Dupont",
    "isValidated": true,
    "isPaid": true
  }
}
```

**Cookies Set:** `refreshToken` (HttpOnly)

---

### POST /api/auth/logout

Logout and invalidate tokens.

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`

```json
{
  "message": "Logged out successfully"
}
```

---

### POST /api/auth/refresh-token

Get new access token using refresh token.

**Cookies Required:** `refreshToken`

**Response:** `200 OK`

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

---

### GET /api/auth/profile

Get current user profile.

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`

```json
{
  "user": {
    "_id": "...",
    "email": "user@example.com",
    "userType": "agent",
    "firstName": "Jean",
    "lastName": "Dupont",
    "phone": "+33612345678",
    "company": "Immo Plus",
    "profileCompleted": true,
    "isValidated": true,
    "isPaid": true
  }
}
```

---

### PUT /api/auth/profile

Update user profile.

**Headers:** `Authorization: Bearer <token>`

**Body:**

```json
{
  "firstName": "Jean",
  "lastName": "Dupont",
  "phone": "+33612345678",
  "company": "Immo Plus",
  "bio": "Agent immobilier depuis 10 ans"
}
```

**Response:** `200 OK`

---

### POST /api/auth/verify-email

Verify email with token.

**Body:**

```json
{
  "token": "verification-token"
}
```

**Response:** `200 OK`

---

### POST /api/auth/resend-verification

Resend verification email.

**Body:**

```json
{
  "email": "user@example.com"
}
```

**Response:** `200 OK`

---

### POST /api/auth/forgot-password

Request password reset.

**Body:**

```json
{
  "email": "user@example.com"
}
```

**Response:** `200 OK`

---

### POST /api/auth/reset-password

Reset password with token.

**Body:**

```json
{
  "token": "reset-token",
  "password": "NewPassword123!"
}
```

**Response:** `200 OK`

---

## 🏠 Properties

### GET /api/properties

List active properties.

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| `city` | string | Filter by city |
| `postalCode` | string | Filter by postal code |
| `propertyType` | string | apartment, house, land, commercial |
| `transactionType` | string | sale, rent |
| `minPrice` | number | Minimum price |
| `maxPrice` | number | Maximum price |
| `minSurface` | number | Minimum surface (m²) |
| `maxSurface` | number | Maximum surface (m²) |
| `minRooms` | number | Minimum rooms |
| `page` | number | Page number (default: 1) |
| `limit` | number | Items per page (default: 20) |
| `sortBy` | string | price, surface, createdAt |
| `sortOrder` | string | asc, desc |

**Response:** `200 OK`

```json
{
  "properties": [...],
  "pagination": {
    "total": 150,
    "page": 1,
    "limit": 20,
    "totalPages": 8
  }
}
```

---

### GET /api/properties/:id

Get property details.

**Response:** `200 OK`

```json
{
  "property": {
    "_id": "...",
    "title": "Appartement T3 Paris",
    "description": "...",
    "price": 350000,
    "surface": 75,
    "rooms": 3,
    "city": "Paris",
    "postalCode": "75015",
    "images": ["https://..."],
    "owner": {
      "_id": "...",
      "firstName": "Jean",
      "lastName": "Dupont"
    }
  }
}
```

---

### POST /api/properties

Create new property.

**Auth:** Required + Subscription

**Body:**

```json
{
  "title": "Appartement T3 Paris",
  "description": "Bel appartement lumineux...",
  "propertyType": "apartment",
  "transactionType": "sale",
  "price": 350000,
  "surface": 75,
  "rooms": 3,
  "bedrooms": 2,
  "bathrooms": 1,
  "city": "Paris",
  "postalCode": "75015",
  "address": "15 Rue de la Convention",
  "hasBalcony": true,
  "hasParking": true,
  "energyRating": "C"
}
```

**Response:** `201 Created`

---

### PUT /api/properties/:id

Update property.

**Auth:** Required (Owner only)

**Body:** Same as POST (partial update allowed)

**Response:** `200 OK`

---

### DELETE /api/properties/:id

Delete property.

**Auth:** Required (Owner only)

**Response:** `200 OK`

---

### POST /api/properties/:id/images

Upload property images.

**Auth:** Required (Owner only)

**Content-Type:** `multipart/form-data`

**Body:** `images` (multiple files)

**Response:** `200 OK`

```json
{
  "images": ["https://s3.../image1.jpg", "https://s3.../image2.jpg"]
}
```

---

### GET /api/properties/mine

Get agent's own properties.

**Auth:** Required (Agent)

**Response:** `200 OK`

---

## 🤝 Collaborations

### GET /api/collaborations

List user's collaborations.

**Auth:** Required

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| `status` | string | pending, accepted, in_progress, completed |
| `role` | string | owner, collaborator |

**Response:** `200 OK`

```json
{
  "collaborations": [
    {
      "_id": "...",
      "postOwnerId": {...},
      "collaboratorId": {...},
      "status": "in_progress",
      "progress": {...},
      "createdAt": "2025-01-01T..."
    }
  ]
}
```

---

### GET /api/collaborations/:id

Get collaboration details.

**Auth:** Required (Participant only)

**Response:** `200 OK`

---

### POST /api/collaborations

Create collaboration request.

**Auth:** Required

**Body:**

```json
{
  "propertyId": "...",
  "searchAdId": "...",
  "message": "J'ai un bien qui pourrait correspondre"
}
```

**Response:** `201 Created`

---

### PUT /api/collaborations/:id/status

Update collaboration status.

**Auth:** Required (Participant)

**Body:**

```json
{
  "status": "accepted"
}
```

**Response:** `200 OK`

---

### PUT /api/collaborations/:id/progress

Update collaboration progress step.

**Auth:** Required (Participant)

**Body:**

```json
{
  "step": "visite_effectuee",
  "completed": true,
  "notes": "Visite positive"
}
```

**Response:** `200 OK`

---

### POST /api/collaborations/:id/validate

Validate progress step (dual validation).

**Auth:** Required (Participant)

**Body:**

```json
{
  "step": "visite_effectuee"
}
```

**Response:** `200 OK`

---

## 📝 Search Ads

### GET /api/search-ads

List active search ads.

**Auth:** Required (Agent)

**Query Parameters:** Similar to properties

**Response:** `200 OK`

---

### POST /api/search-ads

Create search ad.

**Auth:** Required (Apporteur)

**Body:**

```json
{
  "title": "Recherche T3+ Paris",
  "propertyTypes": ["apartment"],
  "transactionType": "sale",
  "maxBudget": 500000,
  "cities": ["Paris"],
  "minRooms": 3
}
```

**Response:** `201 Created`

---

### GET /api/search-ads/mine

Get apporteur's search ads.

**Auth:** Required (Apporteur)

---

## 📅 Appointments

### GET /api/appointments

List user's appointments.

**Auth:** Required

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| `status` | string | pending, confirmed, cancelled |
| `startDate` | string | ISO date |
| `endDate` | string | ISO date |

**Response:** `200 OK`

---

### POST /api/appointments

Create appointment.

**Auth:** Required

**Body:**

```json
{
  "title": "Visite appartement",
  "type": "property_visit",
  "attendeeId": "...",
  "propertyId": "...",
  "scheduledAt": "2025-01-15T14:00:00Z",
  "duration": 60,
  "location": "15 Rue de la Convention, Paris"
}
```

**Response:** `201 Created`

---

### PUT /api/appointments/:id/confirm

Confirm appointment.

**Auth:** Required (Attendee)

---

### PUT /api/appointments/:id/cancel

Cancel appointment.

**Auth:** Required (Participant)

---

## 💬 Chat

### GET /api/chat/conversations

List user's conversations.

**Auth:** Required

**Response:** `200 OK`

```json
{
  "conversations": [
    {
      "user": {...},
      "lastMessage": {...},
      "unreadCount": 3
    }
  ]
}
```

---

### GET /api/chat/messages/:userId

Get messages with specific user.

**Auth:** Required

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| `before` | string | Message ID for pagination |
| `limit` | number | Messages per page |

---

### POST /api/chat/messages

Send message.

**Auth:** Required

**Body:**

```json
{
  "receiverId": "...",
  "content": "Bonjour..."
}
```

---

### PUT /api/chat/messages/read

Mark messages as read.

**Auth:** Required

**Body:**

```json
{
  "senderId": "..."
}
```

---

## 💳 Payments

### POST /api/payment/create-checkout-session

Create Stripe checkout session.

**Auth:** Required

**Body:**

```json
{
  "priceId": "price_xxx",
  "plan": "monthly"
}
```

**Response:** `200 OK`

```json
{
  "sessionId": "cs_xxx",
  "url": "https://checkout.stripe.com/..."
}
```

---

### GET /api/payment/subscription

Get subscription details.

**Auth:** Required

**Response:** `200 OK`

```json
{
  "subscription": {
    "status": "active",
    "plan": "monthly",
    "currentPeriodEnd": "2025-02-01T...",
    "cancelAtPeriodEnd": false
  }
}
```

---

### POST /api/payment/cancel-subscription

Cancel subscription.

**Auth:** Required

---

### POST /api/payment/create-portal-session

Create Stripe billing portal session.

**Auth:** Required

---

## 🔔 Notifications

### GET /api/notifications

Get user's notifications.

**Auth:** Required

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| `unread` | boolean | Filter unread only |

---

### PUT /api/notifications/:id/read

Mark notification as read.

**Auth:** Required

---

### PUT /api/notifications/read-all

Mark all as read.

**Auth:** Required

---

## 👤 Admin

### GET /api/admin/users

List all users.

**Auth:** Required (Admin)

**Query Parameters:** Pagination, filters

---

### PUT /api/admin/users/:id/validate

Validate user account.

**Auth:** Required (Admin)

---

### PUT /api/admin/users/:id/block

Block user account.

**Auth:** Required (Admin)

---

### GET /api/admin/stats

Get admin dashboard statistics.

**Auth:** Required (Admin)

---

## ❤️ Health

### GET /api/health

Server health check.

**Response:** `200 OK`

```json
{
  "status": "OK",
  "message": "HubImmo API is running",
  "timestamp": "2025-01-01T12:00:00.000Z",
  "socketIO": "Connected",
  "onlineUsers": 42
}
```

---

## 📤 Webhooks

### POST /api/webhook/stripe

Stripe webhook handler.

**Headers:** `stripe-signature: ...`

**Handled Events:**

- `checkout.session.completed`
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.payment_succeeded`
- `invoice.payment_failed`

---

## ⚠️ Error Responses

All endpoints return consistent error format:

```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": {}
}
```

### Common Status Codes

| Code  | Meaning                          |
| ----- | -------------------------------- |
| `400` | Bad Request (validation error)   |
| `401` | Unauthorized (no/invalid token)  |
| `403` | Forbidden (no permission)        |
| `404` | Not Found                        |
| `409` | Conflict (duplicate resource)    |
| `429` | Too Many Requests (rate limited) |
| `500` | Internal Server Error            |

---

_Back to [API Overview →](./overview.md)_
