# MonHubImmo - Technical Documentation

> **Comprehensive Documentation for MonHubImmo Real Estate Collaboration Platform**
>
> _Last Updated: December 2025 | Version 1.0_

---

## 📚 Documentation Index

### 🚀 Getting Started

| Document                                                            | Description                                |
| ------------------------------------------------------------------- | ------------------------------------------ |
| [Quick Start Guide](./getting-started/quickstart.md)                | Get up and running in 5 minutes            |
| [Installation Guide](./getting-started/installation.md)             | Detailed setup for development environment |
| [Configuration](./getting-started/configuration.md)                 | Environment variables and config files     |
| [Environment Variables](./getting-started/environment-variables.md) | Complete env var reference                 |
| [Project Structure](./getting-started/project-structure.md)         | Complete codebase organization             |
| [Development Workflow](./getting-started/development-workflow.md)   | Day-to-day development practices           |

### 🏗️ Architecture

| Document                                                     | Description                               |
| ------------------------------------------------------------ | ----------------------------------------- |
| [System Architecture](./architecture/system-architecture.md) | High-level system design and components   |
| [Design Patterns](./architecture/design-patterns.md)         | Architectural patterns and best practices |

### 🎨 Frontend

| Document                                           | Description                        |
| -------------------------------------------------- | ---------------------------------- |
| [Frontend Overview](./frontend/overview.md)        | Next.js architecture and structure |
| [Component Library](./frontend/components.md)      | Reusable components documentation  |
| [State Management](./frontend/state-management.md) | Zustand stores and patterns        |
| [Hooks Reference](./frontend/hooks.md)             | Custom hooks documentation         |

### ⚙️ Backend

| Document                                      | Description                                |
| --------------------------------------------- | ------------------------------------------ |
| [Backend Overview](./backend/overview.md)     | Express.js server architecture             |
| [Middleware](./backend/middleware.md)         | Authentication, validation, error handling |
| [Error Handling](./backend/error-handling.md) | Comprehensive error management             |

### 🗄️ Database

| Document                                | Description                    |
| --------------------------------------- | ------------------------------ |
| [Database Schema](./database/schema.md) | MongoDB collections and models |

### 🔌 API

| Document                            | Description                     |
| ----------------------------------- | ------------------------------- |
| [API Overview](./api/overview.md)   | REST API design and conventions |
| [API Endpoints](./api/endpoints.md) | Complete endpoint reference     |

### ✨ Features

| Document                                              | Description                       |
| ----------------------------------------------------- | --------------------------------- |
| [Authentication System](./features/authentication.md) | Multi-step auth flow and security |
| [Real-time Features](./features/realtime.md)          | Socket.IO messaging system        |
| [Collaboration Workflow](./features/collaboration.md) | Agent-apporteur partnerships      |
| [Property Management](./features/properties.md)       | Property listings and management  |
| [Search Ads](./features/searchads.md)                 | Property search criteria system   |
| [Appointments](./features/appointments.md)            | Booking and scheduling            |
| [Payment Integration](./features/payments.md)         | Stripe subscription system        |
| [Notifications](./features/notifications.md)          | Real-time notification system     |
| [Admin Dashboard](./features/admin.md)                | Administration panel              |

### 🔒 Security

| Document                                    | Description                          |
| ------------------------------------------- | ------------------------------------ |
| [Security Overview](./security/overview.md) | Security architecture and principles |

### 🚀 Deployment

| Document                                        | Description                      |
| ----------------------------------------------- | -------------------------------- |
| [Deployment Overview](./deployment/overview.md) | Production deployment strategies |

### 🧪 Testing

| Document                                  | Description                     |
| ----------------------------------------- | ------------------------------- |
| [Testing Overview](./testing/overview.md) | Testing strategy and philosophy |

### 📖 Developer Guides

| Document                                       | Description                      |
| ---------------------------------------------- | -------------------------------- |
| [Code Style Guide](./guides/code-style.md)     | Coding standards and conventions |
| [Troubleshooting](./guides/troubleshooting.md) | Common issues and solutions      |

### 📝 Contributing

| Document                                     | Description                      |
| -------------------------------------------- | -------------------------------- |
| [Contributing Guidelines](./contributing.md) | How to contribute to the project |

---

## 🏢 Project Overview

**MonHubImmo** is a dual-domain real estate collaboration platform connecting:

- **Real Estate Agents** (_agents immobiliers_) - List properties, manage leads
- **Lead Providers** (_apporteurs d'affaires_) - Post search criteria, connect buyers

### Key Features

| Feature                | Description                                       |
| ---------------------- | ------------------------------------------------- |
| 🔐 **Authentication**  | Multi-step signup, email verification, JWT tokens |
| 👥 **User Management** | Agents, apporteurs, guests, admins                |
| 🏠 **Properties**      | Full CRUD with images, filtering, favorites       |
| 🔍 **Search Ads**      | Buyer criteria matching with agents               |
| 🤝 **Collaborations**  | Partnership workflows with contract signing       |
| 💬 **Real-time Chat**  | Socket.IO messaging with typing indicators        |
| 📅 **Appointments**    | Scheduling with email reminders                   |
| 💳 **Payments**        | Stripe subscriptions (monthly/annual)             |
| 👨‍💼 **Admin Panel**     | User validation, moderation, statistics           |

### Technology Stack

```
Frontend                Backend                 Services
─────────────────────   ─────────────────────   ─────────────────────
Next.js 15              Express.js              MongoDB Atlas
React 19                TypeScript              Redis (rate limiting)
TypeScript              Socket.IO               AWS S3 (files)
Tailwind CSS            JWT Auth                Stripe (payments)
Zustand                 Mongoose                Brevo (email)
Axios                   Helmet                  Vercel (frontend)
Socket.IO Client        Rate Limiting           Render (backend)
```

---

## 🚀 Quick Start

```bash
# Clone repository
git clone https://github.com/karandeep4423/mon-hub-immo.git
cd mon-hub-immo

# Install dependencies
cd client && npm install
cd ../server && npm install

# Configure environment
# Create .env files in client/ and server/

# Start development
# Terminal 1 (server)
cd server && npm run build && npm start

# Terminal 2 (client)
cd client && npm run dev
```

**Access Points:**

- Frontend: http://localhost:3000
- Backend API: http://localhost:4000/api
- Health Check: http://localhost:4000/api/health

---

## 📁 Project Structure

```
mon-hub-immo/
├── client/                 # Next.js frontend
│   ├── app/               # App Router pages
│   ├── components/        # React components by domain
│   ├── hooks/             # Custom React hooks
│   ├── lib/               # Utilities, API, constants
│   ├── store/             # Zustand state management
│   └── types/             # TypeScript interfaces
│
├── server/                 # Express.js backend
│   └── src/
│       ├── chat/          # Socket.IO handlers
│       ├── controllers/   # Route handlers
│       ├── middleware/    # Auth, validation
│       ├── models/        # Mongoose schemas
│       ├── routes/        # Express routes
│       └── services/      # Business logic
│
├── docs/                   # This documentation
└── .github/               # GitHub configurations
```

---

## 🌐 Domain Model

```
┌─────────────────────────────────────────────────────────────────┐
│                          USER                                   │
│  (Agent / Apporteur / Admin)                                    │
├─────────────────────────────────────────────────────────────────┤
│                              │                                  │
│          ┌───────────────────┼───────────────────┐              │
│          ▼                   ▼                   ▼              │
│    ┌──────────┐       ┌───────────┐       ┌───────────┐        │
│    │ Property │       │ SearchAd  │       │   Chat    │        │
│    │ Listing  │       │  (Buyer   │       │ (Messages)│        │
│    └────┬─────┘       │   Need)   │       └───────────┘        │
│         │             └─────┬─────┘                             │
│         │                   │                                   │
│         └───────────────────┼───────────────────────────────────┤
│                             ▼                                   │
│                    ┌────────────────┐                           │
│                    │ COLLABORATION  │                           │
│                    │ (Partnership)  │                           │
│                    └───────┬────────┘                           │
│                            │                                    │
│              ┌─────────────┼─────────────┐                      │
│              ▼             ▼             ▼                      │
│      ┌───────────┐  ┌───────────┐  ┌───────────┐               │
│      │ Contract  │  │ Progress  │  │Appointment│               │
│      │ Signing   │  │ Tracking  │  │ Booking   │               │
│      └───────────┘  └───────────┘  └───────────┘               │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔗 Quick Links

- **[Quick Start](./getting-started/quickstart.md)** - Start in 5 minutes
- **[API Reference](./api/overview.md)** - API documentation
- **[Database Schema](./database/schema.md)** - Data models
- **[Security Guide](./security/overview.md)** - Security practices
- **[Contributing](./contributing.md)** - How to contribute

---

## 📞 Support

- **Repository**: [github.com/karandeep4423/mon-hub-immo](https://github.com/karandeep4423/mon-hub-immo)
- **Issues**: [Report bugs](https://github.com/karandeep4423/mon-hub-immo/issues)

---

_Documentation maintained with ❤️ by the MonHubImmo team_
