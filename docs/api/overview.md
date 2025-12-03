# API Reference

> Complete REST API documentation for MonHubImmo backend

---

## 📡 Base URL

| Environment     | URL                             |
| --------------- | ------------------------------- |
| **Development** | `http://localhost:4000/api`     |
| **Production**  | `https://api.monhubimmo.fr/api` |

---

## 🔐 Authentication

All protected endpoints require authentication via **httpOnly cookies**. Tokens are set automatically after login.

### Headers Required for Write Operations

```http
X-CSRF-Token: {csrf_token}
Content-Type: application/json
```

### Getting CSRF Token

```http
GET /api/csrf-token
```

**Response:**

```json
{
  "csrfToken": "abc123..."
}
```

---

## 📚 API Endpoints

### Authentication (`/api/auth`)

#### Sign Up

```http
POST /api/auth/signup
Content-Type: multipart/form-data
```

**Body (FormData):**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `firstName` | string | ✅ | 2-50 characters |
| `lastName` | string | ✅ | 2-50 characters |
| `email` | string | ✅ | Valid email |
| `password` | string | ✅ | Min 12 chars, strong |
| `phone` | string | ⚡ | French format |
| `userType` | string | ✅ | `agent` or `apporteur` |
| `identityCard` | file | ⚡ | For agents |

**Response (201):**

```json
{
  "success": true,
  "message": "Code de vérification envoyé",
  "requiresVerification": true,
  "codeSent": true
}
```

#### Verify Email

```http
POST /api/auth/verify-email
```

**Body:**

```json
{
  "email": "user@example.com",
  "code": "ABC123"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Email vérifié avec succès",
  "requiresProfileCompletion": true,
  "user": { ... }
}
```

#### Login

```http
POST /api/auth/login
```

**Body:**

```json
{
  "email": "user@example.com",
  "password": "securePassword123!"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Connexion réussie",
  "user": {
    "_id": "...",
    "firstName": "John",
    "lastName": "Doe",
    "email": "user@example.com",
    "userType": "agent",
    "profileCompleted": true
  }
}
```

#### Logout

```http
POST /api/auth/logout
```

**Response:**

```json
{
  "success": true,
  "message": "Déconnexion réussie"
}
```

#### Get Profile

```http
GET /api/auth/profile
```

**Response:**

```json
{
  "success": true,
  "user": {
    "_id": "...",
    "firstName": "John",
    "lastName": "Doe",
    "email": "user@example.com",
    "userType": "agent",
    "profileCompleted": true,
    "professionalInfo": {
      "city": "Paris",
      "postalCode": "75001",
      "interventionRadius": 50
    }
  }
}
```

#### Update Profile

```http
PUT /api/auth/profile
X-CSRF-Token: {token}
```

**Body:**

```json
{
  "firstName": "John",
  "lastName": "Doe",
  "phone": "0612345678",
  "professionalInfo": {
    "city": "Paris",
    "interventionRadius": 50
  }
}
```

#### Forgot Password

```http
POST /api/auth/forgot-password
```

**Body:**

```json
{
  "email": "user@example.com"
}
```

#### Reset Password

```http
POST /api/auth/reset-password
```

**Body:**

```json
{
  "email": "user@example.com",
  "code": "ABC123",
  "newPassword": "newSecurePassword123!"
}
```

#### Refresh Token

```http
POST /api/auth/refresh
```

**Response:**

```json
{
  "success": true,
  "message": "Token refreshed"
}
```

---

### Properties (`/api/property`)

#### Get All Properties

```http
GET /api/property
```

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| `page` | number | Page number (default: 1) |
| `limit` | number | Items per page (default: 12) |
| `city` | string | Filter by city |
| `minPrice` | number | Minimum price |
| `maxPrice` | number | Maximum price |
| `propertyType` | string | Type filter |
| `transactionType` | string | `Vente` or `Location` |

**Response:**

```json
{
  "success": true,
  "properties": [...],
  "pagination": {
    "total": 150,
    "page": 1,
    "pages": 13,
    "limit": 12
  }
}
```

#### Get Property by ID

```http
GET /api/property/:id
```

**Response:**

```json
{
  "success": true,
  "property": {
    "_id": "...",
    "title": "Appartement 3 pièces",
    "description": "...",
    "price": 350000,
    "surface": 75,
    "propertyType": "Appartement",
    "transactionType": "Vente",
    "address": "123 Rue Example",
    "city": "Paris",
    "postalCode": "75001",
    "owner": {
      "_id": "...",
      "firstName": "John",
      "lastName": "D."
    }
  }
}
```

#### Create Property

```http
POST /api/property/create-property
Content-Type: multipart/form-data
X-CSRF-Token: {token}
```

**Body (FormData):**
| Field | Type | Required |
|-------|------|----------|
| `title` | string | ✅ |
| `description` | string | ✅ |
| `price` | number | ✅ |
| `surface` | number | ✅ |
| `propertyType` | string | ✅ |
| `transactionType` | string | ✅ |
| `address` | string | ✅ |
| `city` | string | ✅ |
| `postalCode` | string | ✅ |
| `mainImage` | file | ✅ |
| `galleryImages` | file[] | ⚡ |

#### Update Property

```http
PUT /api/property/:id/update
Content-Type: multipart/form-data
X-CSRF-Token: {token}
```

#### Delete Property

```http
DELETE /api/property/:id
X-CSRF-Token: {token}
```

#### Get My Properties

```http
GET /api/property/my/properties
```

---

### Collaborations (`/api/collaboration`)

#### Propose Collaboration

```http
POST /api/collaboration
X-CSRF-Token: {token}
```

**Body:**

```json
{
  "postId": "property_or_searchad_id",
  "postType": "Property",
  "proposedCommission": 40,
  "proposalMessage": "Je souhaite collaborer..."
}
```

#### Get My Collaborations

```http
GET /api/collaboration
```

**Response:**

```json
{
  "success": true,
  "collaborations": [
    {
      "_id": "...",
      "postId": { ... },
      "postType": "Property",
      "status": "active",
      "proposedCommission": 40,
      "currentProgressStep": "premier_contact",
      "postOwnerId": { ... },
      "collaboratorId": { ... }
    }
  ]
}
```

#### Respond to Collaboration

```http
POST /api/collaboration/:id/respond
X-CSRF-Token: {token}
```

**Body:**

```json
{
  "action": "accept", // or "reject"
  "message": "Optional response message"
}
```

#### Sign Contract

```http
POST /api/collaboration/:id/sign
X-CSRF-Token: {token}
```

#### Update Progress Step

```http
POST /api/collaboration/:id/progress
X-CSRF-Token: {token}
```

**Body:**

```json
{
  "targetStep": "visite_programmee",
  "notes": "Visite prévue le 15/12"
}
```

**Progress Steps:**

1. `accord_collaboration`
2. `premier_contact`
3. `visite_programmee`
4. `visite_realisee`
5. `retour_client`
6. `offre_en_cours`
7. `negociation_en_cours`
8. `compromis_signe`
9. `signature_notaire`
10. `affaire_conclue`

#### Complete Collaboration

```http
POST /api/collaboration/:id/complete
X-CSRF-Token: {token}
```

**Body:**

```json
{
  "completionReason": "vente_conclue_collaboration"
}
```

---

### Search Ads (`/api/search-ads`)

#### Get All Search Ads

```http
GET /api/search-ads
```

#### Create Search Ad

```http
POST /api/search-ads
X-CSRF-Token: {token}
```

**Body:**

```json
{
  "title": "Recherche appartement Paris",
  "description": "...",
  "propertyTypes": ["apartment"],
  "budget": {
    "max": 500000,
    "financingType": "loan",
    "hasBankApproval": true
  },
  "location": {
    "cities": ["Paris"],
    "postalCodes": ["75001", "75002"]
  }
}
```

#### Get My Search Ads

```http
GET /api/search-ads/my
```

---

### Chat (`/api/message`)

#### Get Conversations

```http
GET /api/message/users
```

**Response:**

```json
{
  "users": [
    {
      "_id": "...",
      "firstName": "John",
      "lastName": "Doe",
      "profileImage": "...",
      "lastMessage": {
        "text": "Bonjour!",
        "createdAt": "..."
      },
      "unreadCount": 3
    }
  ]
}
```

#### Get Messages with User

```http
GET /api/message/:userId
```

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| `page` | number | Page number |
| `limit` | number | Messages per page |

#### Send Message

```http
POST /api/message/send/:userId
X-CSRF-Token: {token}
```

**Body:**

```json
{
  "text": "Hello!",
  "image": "optional_image_url"
}
```

---

### Appointments (`/api/appointments`)

#### Get Agent Availability

```http
GET /api/appointments/agent/:agentId/availability
```

#### Book Appointment

```http
POST /api/appointments
X-CSRF-Token: {token}
```

**Body:**

```json
{
  "agentId": "...",
  "appointmentType": "estimation",
  "scheduledDate": "2025-12-15",
  "scheduledTime": "14:00",
  "contactDetails": {
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "0612345678"
  }
}
```

#### Update Appointment Status

```http
PATCH /api/appointments/:id/status
X-CSRF-Token: {token}
```

**Body:**

```json
{
  "status": "confirmed" // pending, confirmed, completed, cancelled, rejected
}
```

---

### Favorites (`/api/favorites`)

#### Get Favorites

```http
GET /api/favorites
```

#### Add to Favorites

```http
POST /api/favorites/:propertyId
X-CSRF-Token: {token}
```

#### Remove from Favorites

```http
DELETE /api/favorites/:propertyId
X-CSRF-Token: {token}
```

---

### Admin (`/api/admin`)

> All admin routes require `admin` role

#### Get Users

```http
GET /api/admin/users
```

#### Validate User

```http
PUT /api/admin/users/:id/validate
X-CSRF-Token: {token}
```

**Body:**

```json
{
  "isValidated": true
}
```

#### Block/Unblock User

```http
POST /api/admin/users/:id/block
POST /api/admin/users/:id/unblock
X-CSRF-Token: {token}
```

#### Get Admin Stats

```http
GET /api/admin/stats
```

---

### Payments (`/api/payment`)

#### Create Subscription

```http
POST /api/payment/create-subscription
X-CSRF-Token: {token}
```

**Body:**

```json
{
  "priceId": "price_xxx",
  "paymentMethodId": "pm_xxx"
}
```

---

## 📦 Response Format

### Success Response

```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

### Error Response

```json
{
  "success": false,
  "message": "Error description",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

---

## 🔢 HTTP Status Codes

| Code  | Meaning                          |
| ----- | -------------------------------- |
| `200` | Success                          |
| `201` | Created                          |
| `400` | Bad Request (validation error)   |
| `401` | Unauthorized (not logged in)     |
| `402` | Payment Required                 |
| `403` | Forbidden (no permission)        |
| `404` | Not Found                        |
| `429` | Too Many Requests (rate limited) |
| `500` | Server Error                     |

---

## ⚡ Rate Limits

| Endpoint Type          | Limit                         |
| ---------------------- | ----------------------------- |
| **General**            | 250 req/min                   |
| **Login**              | 5 attempts/15 min (per email) |
| **Password Reset**     | 3 req/hour                    |
| **Email Verification** | 3 req/5 min                   |

---

## 🔌 WebSocket Events

See [Real-time Features](../features/realtime.md) for Socket.IO events documentation.

---

_Next: [Database Schema →](../database/schema.md)_
