# System Architecture

> High-level architecture and design of MonHubImmo platform

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [System Components](#system-components)
- [Data Flow](#data-flow)
- [Technology Stack](#technology-stack)
- [Communication Patterns](#communication-patterns)
- [Deployment Architecture](#deployment-architecture)
- [Scalability Considerations](#scalability-considerations)

---

## Architecture Overview

MonHubImmo follows a **three-tier architecture** with a clear separation between presentation, application logic, and data layers.

```
┌─────────────────────────────────────────────────────────────┐
│                     PRESENTATION LAYER                       │
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │   Next.js    │  │  React 19    │  │  Tailwind    │       │
│  │  App Router  │  │  Components  │  │     CSS      │       │
│  └──────────────┘  └──────────────┘  └──────────────┘       │
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │   Zustand    │  │  Socket.IO   │  │    Axios     │       │
│  │  State Mgmt  │  │    Client    │  │  HTTP Client │       │
│  └──────────────┘  └──────────────┘  └──────────────┘       │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │  HTTPS / WSS    │
                    └─────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     APPLICATION LAYER                        │
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │   Express    │  │  Socket.IO   │  │  Middleware  │       │
│  │   Router     │  │    Server    │  │    Stack     │       │
│  └──────────────┘  └──────────────┘  └──────────────┘       │
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │ Controllers  │  │   Services   │  │  Validation  │       │
│  │              │  │              │  │              │       │
│  └──────────────┘  └──────────────┘  └──────────────┘       │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                       DATA LAYER                             │
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │   MongoDB    │  │    AWS S3    │  │  Third-Party │       │
│  │   Database   │  │  File Store  │  │   Services   │       │
│  └──────────────┘  └──────────────┘  └──────────────┘       │
│         │                 │                   │              │
│    ┌─────────┐      ┌──────────┐      ┌────────────┐        │
│    │ Mongoose│      │ S3 Client│      │ Stripe API │        │
│    │  Models │      │   SDK    │      │ Brevo API  │        │
│    └─────────┘      └──────────┘      └────────────┘        │
└─────────────────────────────────────────────────────────────┘
```

### Architecture Principles

1. **Separation of Concerns**: Clear boundaries between layers
2. **Stateless Backend**: JWT-based auth for horizontal scaling
3. **Real-time Capable**: Bidirectional communication via WebSockets
4. **API-First**: RESTful API with consistent patterns
5. **Type Safety**: End-to-end TypeScript for reliability
6. **Security-First**: Multiple layers of security (CSRF, XSS, rate limiting)
7. **Modular Design**: Feature-based organization for maintainability

---

## System Components

### 1. Frontend Application (Client)

**Framework**: Next.js 15 with App Router

**Responsibilities:**

- User interface rendering
- Client-side routing
- State management
- Form handling and validation
- Real-time updates via WebSocket
- API communication
- Session management

**Key Technologies:**

- React 19 for component architecture
- Zustand for global state
- Axios for HTTP requests
- Socket.IO for real-time communication
- Tailwind CSS for styling

**Architecture:**

```
┌─────────────────────────────────────┐
│         Next.js App Router          │
├─────────────────────────────────────┤
│  Pages (Routes)                     │
│  │                                  │
│  ├─ Layout Components               │
│  ├─ Page Components                 │
│  └─ Loading/Error States            │
├─────────────────────────────────────┤
│  Components Layer                   │
│  │                                  │
│  ├─ Feature Components              │
│  ├─ Shared UI Components            │
│  └─ Layout Components               │
├─────────────────────────────────────┤
│  State Management                   │
│  │                                  │
│  ├─ Zustand Stores                  │
│  ├─ React Context (Socket)          │
│  └─ Local Component State           │
├─────────────────────────────────────┤
│  Hooks & Utilities                  │
│  │                                  │
│  ├─ Custom Hooks                    │
│  ├─ API Client (Axios)              │
│  └─ Helper Functions                │
└─────────────────────────────────────┘
```

### 2. Backend API (Server)

**Framework**: Express.js with TypeScript

**Responsibilities:**

- Business logic execution
- Data persistence
- Authentication & authorization
- API endpoint handling
- Real-time event management
- External service integration
- File upload management

**Architecture:**

```
┌─────────────────────────────────────┐
│       Express Application           │
├─────────────────────────────────────┤
│  Middleware Stack                   │
│  │                                  │
│  ├─ Security (Helmet, CORS)         │
│  ├─ Authentication (JWT)            │
│  ├─ Validation                      │
│  ├─ Rate Limiting                   │
│  └─ Error Handling                  │
├─────────────────────────────────────┤
│  Routes                             │
│  │                                  │
│  ├─ Auth Routes                     │
│  ├─ Resource Routes                 │
│  └─ Admin Routes                    │
├─────────────────────────────────────┤
│  Controllers                        │
│  │                                  │
│  ├─ Request Handling                │
│  ├─ Response Formatting             │
│  └─ Error Management                │
├─────────────────────────────────────┤
│  Services                           │
│  │                                  │
│  ├─ Business Logic                  │
│  ├─ External APIs                   │
│  └─ Data Operations                 │
├─────────────────────────────────────┤
│  Data Access Layer                  │
│  │                                  │
│  ├─ Mongoose Models                 │
│  ├─ Database Queries                │
│  └─ Data Validation                 │
└─────────────────────────────────────┘
```

### 3. Database (MongoDB)

**Type**: NoSQL Document Database

**Responsibilities:**

- Persistent data storage
- Data indexing for performance
- Transaction support (where needed)
- Full-text search capabilities

**Collections:**

- `users` - User accounts and profiles
- `properties` - Property listings
- `chats` - Chat messages
- `collaborations` - Agent-apporteur partnerships
- `searchads` - Property search criteria
- `appointments` - Booking information
- `notifications` - User notifications
- `userfavorites` - Bookmarked properties
- `securitylogs` - Security audit trail
- `loginattempts` - Login tracking

### 4. Real-time Communication

**Technology**: Socket.IO (WebSocket + fallbacks)

**Responsibilities:**

- Live chat messaging
- Typing indicators
- Online/offline status
- Real-time notifications
- Collaboration updates

**Architecture:**

```
Client                    Server
  │                         │
  │  Socket.IO Connect      │
  ├────────────────────────►│
  │                         │
  │  Authentication         │
  ├────────────────────────►│
  │  (JWT token)            │
  │                         │
  │  ◄────────────────────┤
  │  Connected + User ID    │
  │                         │
  │  Emit Events            │
  ├────────────────────────►│
  │  (messages, typing)     │
  │                         │
  │  ◄────────────────────┤
  │  Receive Events         │
  │  (messages, status)     │
  │                         │
```

### 5. External Services

**AWS S3**: File storage for images and documents

- Property images
- Identity documents
- Profile pictures
- Contract PDFs

**Stripe**: Payment processing

- Subscription management
- Webhook handling
- Invoice generation

**Brevo**: Email delivery

- Verification emails
- Password reset
- Notifications
- Appointment confirmations

---

## Data Flow

### Request-Response Flow (REST API)

```
1. Client Request
   │
   ├─► [Next.js Middleware] - Route protection
   │
   ├─► [Axios Interceptor] - Add auth token
   │
   ▼
2. Server Receives Request
   │
   ├─► [Express Middleware Stack]
   │   ├─ CORS validation
   │   ├─ Rate limiting
   │   ├─ Body parsing
   │   ├─ CSRF validation
   │   ├─ JWT authentication
   │   └─ Input validation
   │
   ├─► [Controller]
   │   ├─ Business logic
   │   └─ Service calls
   │
   ├─► [Service Layer]
   │   ├─ Data operations
   │   └─ External API calls
   │
   ├─► [Database]
   │   ├─ Query execution
   │   └─ Data transformation
   │
   ◄── [Response]
       ├─ Format response
       ├─ Error handling
       └─ Send to client
```

### Real-time Event Flow (WebSocket)

```
Client A                Server                Client B
   │                      │                      │
   │  Emit Event          │                      │
   ├─────────────────────►│                      │
   │  (e.g., message)     │                      │
   │                      │                      │
   │                      ├─► Validate           │
   │                      ├─► Save to DB         │
   │                      ├─► Process            │
   │                      │                      │
   │                      │  Broadcast Event     │
   │                      ├─────────────────────►│
   │                      │                      │
   │  Acknowledgment      │                      │
   │◄─────────────────────┤                      │
   │                      │                      │
```

### Authentication Flow

```
1. Login Request
   └─► POST /api/auth/login
       ├─ Email/password
       └─ Validation

2. Server Processing
   ├─► Check credentials
   ├─► Verify account status
   ├─► Generate tokens
   │   ├─ Access token (15 min)
   │   └─ Refresh token (7 days)
   └─► Set httpOnly cookies

3. Client Storage
   ├─► Cookies set automatically
   ├─► User data in Zustand
   └─► Redirect to dashboard

4. Subsequent Requests
   ├─► Cookies sent automatically
   ├─► Server verifies JWT
   └─► Access granted

5. Token Refresh (on 401)
   ├─► Client intercepts 401
   ├─► POST /api/auth/refresh
   ├─► New access token
   └─► Retry original request
```

---

## Technology Stack

### Frontend Stack

| Technology      | Version | Purpose          | Why Chosen                         |
| --------------- | ------- | ---------------- | ---------------------------------- |
| Next.js         | 15.4.1  | React framework  | SSR, routing, optimization         |
| React           | 19.1.0  | UI library       | Component architecture, ecosystem  |
| TypeScript      | 5.x     | Type safety      | Developer experience, reliability  |
| Tailwind CSS    | 3.x     | Styling          | Utility-first, fast development    |
| Zustand         | 4.x     | State management | Lightweight, simple API            |
| Axios           | 1.10.0  | HTTP client      | Interceptors, request cancellation |
| Socket.IO       | 4.x     | Real-time        | Reliable WebSocket with fallbacks  |
| React Hook Form | 7.x     | Forms            | Performance, validation            |
| Zod             | 3.x     | Validation       | Type-safe schemas                  |
| Stripe.js       | 8.x     | Payments         | PCI compliance, secure             |

### Backend Stack

| Technology | Version | Purpose       | Why Chosen                          |
| ---------- | ------- | ------------- | ----------------------------------- |
| Node.js    | 18+     | Runtime       | JavaScript everywhere, async I/O    |
| Express.js | 4.21.2  | Web framework | Mature, flexible, middleware        |
| TypeScript | 5.x     | Type safety   | Code quality, refactoring           |
| MongoDB    | 6.x     | Database      | Flexible schema, horizontal scaling |
| Mongoose   | 8.x     | ODM           | Schema validation, middleware       |
| Socket.IO  | 4.x     | Real-time     | Bidirectional, reliable             |
| JWT        | 9.x     | Auth          | Stateless, scalable                 |
| bcryptjs   | 3.x     | Hashing       | Secure password storage             |
| Helmet     | 8.x     | Security      | Security headers                    |
| AWS SDK    | 3.x     | File storage  | Scalable, reliable                  |
| Stripe     | Latest  | Payments      | Industry standard                   |

### Development Tools

| Tool        | Purpose            |
| ----------- | ------------------ |
| ESLint      | Code linting       |
| Prettier    | Code formatting    |
| Husky       | Git hooks          |
| Jest        | Testing            |
| ts-node-dev | Development server |
| Turbopack   | Fast bundler       |

---

## Communication Patterns

### REST API Pattern

```
Resource: /api/properties

GET    /api/properties          # List all properties
GET    /api/properties/:id      # Get single property
POST   /api/properties          # Create property
PUT    /api/properties/:id      # Update property
DELETE /api/properties/:id      # Delete property
```

**Consistent Response Format:**

```json
{
  "success": true,
  "data": {
    /* resource data */
  },
  "message": "Operation successful"
}
```

**Error Response:**

```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE"
}
```

### WebSocket Event Pattern

**Client → Server:**

```typescript
socket.emit("message:send", {
  conversationId: "123",
  content: "Hello",
});
```

**Server → Client:**

```typescript
socket.on("message:new", (message) => {
  // Handle new message
});
```

**Event Naming Convention:**

```
<resource>:<action>

Examples:
- message:new
- message:read
- user:status
- typing:start
- typing:stop
```

---

## Deployment Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     CDN / Edge Network                   │
│                    (Static Assets)                       │
└─────────────────────────────────────────────────────────┘
                            │
┌─────────────────────────────────────────────────────────┐
│                   Load Balancer / Reverse Proxy          │
│                     (HTTPS Termination)                  │
└─────────────────────────────────────────────────────────┘
                            │
           ┌────────────────┴────────────────┐
           │                                 │
           ▼                                 ▼
┌──────────────────────┐         ┌──────────────────────┐
│   Frontend Server    │         │   Backend Server     │
│                      │         │                      │
│   Next.js (Node.js)  │         │   Express (Node.js)  │
│   Port 3000          │         │   Port 4000          │
│                      │         │                      │
│   ┌──────────────┐   │         │   ┌──────────────┐   │
│   │ Static Files │   │         │   │  Socket.IO   │   │
│   │ SSR Pages    │   │         │   │  WebSocket   │   │
│   └──────────────┘   │         │   └──────────────┘   │
└──────────────────────┘         └──────────────────────┘
                                           │
                   ┌───────────────────────┼────────────────────┐
                   │                       │                    │
                   ▼                       ▼                    ▼
          ┌────────────────┐    ┌──────────────────┐  ┌────────────────┐
          │   MongoDB      │    │    AWS S3        │  │   Stripe API   │
          │   Database     │    │  File Storage    │  │   Brevo API    │
          │                │    │                  │  │                │
          │  (Atlas Cloud) │    │  (Images, Docs)  │  │  (Payments)    │
          └────────────────┘    └──────────────────┘  └────────────────┘
```

---

## Scalability Considerations

### Horizontal Scaling

**Stateless Backend:**

- JWT tokens in cookies (no session store)
- Multiple server instances can run in parallel
- Load balancer distributes traffic

**Database Scaling:**

- MongoDB replica sets for high availability
- Read replicas for query distribution
- Sharding for large datasets

**File Storage:**

- AWS S3 auto-scales
- CDN for static assets
- Presigned URLs for direct uploads

### Performance Optimization

**Frontend:**

- Code splitting (Next.js automatic)
- Image optimization (Next.js Image component)
- Lazy loading components
- Client-side caching (React Query/SWR potential)

**Backend:**

- Database indexing on frequently queried fields
- Connection pooling (MongoDB)
- Request rate limiting
- Response caching (Redis potential)

**Real-time:**

- Socket.IO clustering with Redis adapter
- Room-based message broadcasting
- Namespace isolation

---

## Security Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    SECURITY LAYERS                       │
├─────────────────────────────────────────────────────────┤
│  1. Network Layer                                        │
│     ├─ HTTPS/TLS encryption                             │
│     ├─ WebSocket Secure (WSS)                           │
│     └─ DDoS protection                                  │
├─────────────────────────────────────────────────────────┤
│  2. Application Layer                                    │
│     ├─ Helmet security headers                          │
│     ├─ CORS configuration                               │
│     ├─ Rate limiting                                    │
│     ├─ CSRF protection                                  │
│     └─ Input sanitization                               │
├─────────────────────────────────────────────────────────┤
│  3. Authentication Layer                                 │
│     ├─ JWT tokens (access + refresh)                    │
│     ├─ httpOnly cookies                                 │
│     ├─ Password hashing (bcrypt)                        │
│     └─ Account lockout mechanism                        │
├─────────────────────────────────────────────────────────┤
│  4. Authorization Layer                                  │
│     ├─ Role-based access control                        │
│     ├─ Resource ownership validation                    │
│     └─ Permission checks                                │
├─────────────────────────────────────────────────────────┤
│  5. Data Layer                                           │
│     ├─ Data encryption at rest                          │
│     ├─ Sensitive data hashing                           │
│     └─ Secure file storage (S3)                         │
└─────────────────────────────────────────────────────────┘
```

---

## Next Steps

- 🎨 [Design Patterns](./design-patterns.md) - Code patterns used
- 🔄 [Data Flow](./data-flow.md) - Detailed flow diagrams
- 📊 [Scalability](./scalability.md) - Scaling strategies
- 💻 [Tech Stack Details](./tech-stack.md) - Technology deep dive

---

**Understanding the architecture helps you contribute effectively!**
