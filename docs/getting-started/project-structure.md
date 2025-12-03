# Project Structure

> Complete guide to MonHubImmo codebase organization

## Overview

MonHubImmo follows a **monorepo structure** with clear separation between frontend, backend, and shared resources.

```
mon-hub-immo/
├── client/                 # Next.js frontend application
├── server/                 # Express.js backend API
├── docs/                   # Documentation (you are here)
├── .github/                # GitHub workflows and configurations
└── README.md               # Project root README
```

---

## Client Directory Structure

```
client/
├── app/                    # Next.js 15 App Router pages
│   ├── layout.tsx          # Root layout component
│   ├── page.tsx            # Homepage (/)
│   ├── globals.css         # Global styles
│   ├── accueil/            # Landing page
│   ├── auth/               # Authentication pages
│   │   ├── login/          # Login page
│   │   ├── signup/         # Multi-step signup flow
│   │   ├── verify-email/   # Email verification
│   │   ├── forgot-password/# Password reset
│   │   └── complete-profile/# Profile completion wizard
│   ├── dashboard/          # User dashboards
│   │   ├── agent/          # Agent-specific dashboard
│   │   └── apporteur/      # Apporteur-specific dashboard
│   ├── chat/               # Real-time messaging
│   ├── collaboration/      # Collaboration management
│   ├── property/           # Property listings and details
│   ├── search-ads/         # Search ads (buyer criteria)
│   ├── admin/              # Admin panel
│   └── payment/            # Stripe integration pages
│
├── components/             # React components (organized by domain)
│   ├── auth/               # Authentication components
│   │   ├── LoginForm.tsx
│   │   ├── SignupForm.tsx
│   │   ├── SignupSteps/    # Multi-step signup wizard
│   │   │   ├── StepOne.tsx
│   │   │   ├── StepTwo.tsx
│   │   │   └── StepThree.tsx
│   │   └── index.ts        # Barrel export
│   ├── chat/               # Chat components
│   │   ├── ChatContainer.tsx
│   │   ├── MessageList.tsx
│   │   ├── MessageInput.tsx
│   │   ├── ConversationList.tsx
│   │   ├── TypingIndicator.tsx
│   │   └── README.md       # Component documentation
│   ├── collaboration/      # Collaboration components
│   │   ├── CollaborationCard.tsx
│   │   ├── CollaborationList.tsx
│   │   ├── ProgressTracker.tsx
│   │   └── ContractViewer.tsx
│   ├── property/           # Property components
│   │   ├── PropertyCard.tsx
│   │   ├── PropertyForm.tsx
│   │   ├── PropertyDetails.tsx
│   │   ├── ImageUploader.tsx
│   │   └── PropertyFilters.tsx
│   ├── dashboard-agent/    # Agent dashboard components
│   ├── dashboard-apporteur/# Apporteur dashboard components
│   ├── admin/              # Admin panel components
│   ├── ui/                 # Reusable UI components
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Modal.tsx
│   │   ├── LoadingSpinner.tsx
│   │   ├── UserAvatar.tsx
│   │   └── Toast.tsx
│   ├── header/             # Header and navigation
│   ├── footer/             # Footer components
│   └── landing/            # Landing page components
│
├── hooks/                  # Custom React hooks
│   ├── useAuth.ts          # Authentication hook (wrapper)
│   ├── useChat.ts          # Chat functionality
│   ├── useCollaboration.ts # Collaboration management
│   ├── useProperties.ts    # Property operations
│   ├── useFetch.ts         # Generic data fetching
│   ├── useMutation.ts      # Mutations with loading/error
│   ├── useDebounce.ts      # Debounce utility
│   ├── useClickOutside.ts  # Outside click detection
│   ├── useForm.ts          # Form handling
│   └── index.ts            # Barrel export
│
├── store/                  # Zustand state management
│   ├── authStore.ts        # Authentication state
│   ├── chatStore.ts        # Chat state (messages, conversations)
│   ├── favoritesStore.ts   # User favorites
│   ├── pageStateStore.ts   # UI state (modals, filters)
│   └── index.ts            # Combined store exports
│
├── context/                # React Context providers
│   ├── SocketContext.tsx   # Socket.IO connection context
│   ├── FormContext.tsx     # Multi-step form context
│   └── CookieConsentContext.tsx # GDPR cookie consent
│
├── lib/                    # Utility libraries and configurations
│   ├── api.ts              # Axios instance with interceptors
│   ├── constants/          # Application constants
│   │   ├── api/            # API endpoints
│   │   │   └── endpoints.ts
│   │   ├── auth.ts         # Auth constants
│   │   ├── properties.ts   # Property-related constants
│   │   ├── index.ts        # Feature flags
│   │   └── README.md
│   ├── config/             # App configurations
│   │   └── routes.config.ts# Route protection config
│   ├── utils/              # Utility functions
│   │   ├── logger.ts       # Client-side logging
│   │   ├── errorHandler.ts # Error handling utilities
│   │   ├── formatters.ts   # Data formatting
│   │   └── validators.ts   # Validation helpers
│   ├── validation.ts       # Zod schemas
│   ├── swrConfig.ts        # SWR configuration
│   └── gtag.ts             # Google Analytics
│
├── types/                  # TypeScript type definitions
│   ├── auth.ts             # Authentication types
│   ├── property.ts         # Property types
│   ├── chat.ts             # Chat types
│   ├── collaboration.ts    # Collaboration types
│   ├── user.ts             # User types
│   └── common.ts           # Common/shared types
│
├── public/                 # Static assets
│   ├── images/             # Images
│   ├── icons/              # Icons and logos
│   └── favicon.ico         # Favicon
│
├── middleware.ts           # Next.js Edge middleware (route protection)
├── next.config.ts          # Next.js configuration
├── tailwind.config.ts      # Tailwind CSS configuration
├── tsconfig.json           # TypeScript configuration
├── .eslintrc.json          # ESLint configuration
├── .prettierrc             # Prettier configuration
├── jest.config.mjs         # Jest testing configuration
├── package.json            # Dependencies and scripts
└── README.md               # Client documentation
```

### Key Client Patterns

#### Component Organization

- **Domain-based folders**: Components grouped by feature (auth, chat, property)
- **Index exports**: Each folder has `index.ts` for clean imports
- **UI components**: Shared, reusable components in `/ui`

#### Hooks Architecture

- **Wrapper hooks**: `useAuth()`, `useChat()` wrap store/context
- **Domain hooks**: Feature-specific logic (useProperties, useCollaboration)
- **Utility hooks**: Generic patterns (useFetch, useMutation, useDebounce)

#### State Management

- **Zustand stores**: Global state (auth, chat, favorites)
- **React Context**: Socket.IO connection only
- **Local state**: Component-level with useState

---

## Server Directory Structure

```
server/
├── src/                    # Source code
│   ├── server.ts           # Main entry point
│   ├── config/             # Configuration files
│   │   └── database.ts     # MongoDB connection
│   │
│   ├── models/             # Mongoose data models
│   │   ├── User.ts         # User schema and methods
│   │   ├── Property.ts     # Property listings
│   │   ├── Chat.ts         # Chat messages
│   │   ├── Collaboration.ts# Agent-apporteur collaborations
│   │   ├── SearchAd.ts     # Property search ads
│   │   ├── Appointment.ts  # Appointment bookings
│   │   ├── Notification.ts # User notifications
│   │   ├── UserFavorite.ts # Favorite properties
│   │   ├── SecurityLog.ts  # Security audit logs
│   │   └── LoginAttempt.ts # Login tracking
│   │
│   ├── controllers/        # Request handlers (business logic)
│   │   ├── authController.ts
│   │   ├── userController.ts
│   │   ├── propertyController.ts
│   │   ├── chatController.ts
│   │   ├── collaborationController.ts
│   │   ├── searchAdController.ts
│   │   ├── appointmentController.ts
│   │   ├── notificationController.ts
│   │   ├── paymentController.ts
│   │   └── adminController.ts
│   │
│   ├── routes/             # Express route definitions
│   │   ├── auth.ts         # Authentication routes
│   │   ├── property.ts     # Property CRUD routes
│   │   ├── chat.ts         # Chat routes
│   │   ├── collaboration.ts# Collaboration routes
│   │   ├── searchAds.ts    # Search ad routes
│   │   ├── appointments.ts # Appointment routes
│   │   ├── notifications.ts# Notification routes
│   │   ├── payment.ts      # Stripe payment routes
│   │   ├── stripeWebhook.ts# Stripe webhook handler
│   │   ├── uploadRoutes.ts # File upload routes
│   │   ├── favorites.ts    # Favorites routes
│   │   ├── admin.ts        # Admin routes
│   │   └── adminChat.ts    # Admin chat management
│   │
│   ├── middleware/         # Express middleware
│   │   ├── auth.ts         # JWT authentication
│   │   ├── authorize.ts    # Role-based authorization
│   │   ├── validation.ts   # Input validation middleware
│   │   ├── csrf.ts         # CSRF protection
│   │   ├── rateLimiter.ts  # Rate limiting
│   │   ├── loginRateLimiter.ts # Login-specific rate limiting
│   │   ├── errorHandler.ts # Global error handler
│   │   ├── requestLogger.ts# Request logging
│   │   ├── subscription.ts # Subscription check
│   │   └── uploadMiddleware.ts # File upload handling
│   │
│   ├── services/           # External service integrations
│   │   ├── s3Service.ts    # AWS S3 file storage
│   │   ├── notificationService.ts # Notification delivery
│   │   └── appointmentEmailService.ts # Email sending
│   │
│   ├── chat/               # Socket.IO real-time functionality
│   │   ├── socketConfig.ts # Socket.IO server setup
│   │   ├── socketManager.ts# User connection management
│   │   ├── socketService.ts# Event emission service
│   │   ├── messageHandler.ts# Chat message handling
│   │   ├── index.ts        # Module exports
│   │   └── README.md       # Socket.IO documentation
│   │
│   ├── validation/         # Zod validation schemas
│   │   ├── authValidation.ts
│   │   ├── propertyValidation.ts
│   │   ├── collaborationValidation.ts
│   │   └── userValidation.ts
│   │
│   ├── utils/              # Utility functions
│   │   ├── logger.ts       # Winston logging
│   │   ├── sanitize.ts     # HTML sanitization
│   │   ├── emailService.ts # Email utilities
│   │   ├── passwordUtils.ts# Password validation
│   │   ├── tokenUtils.ts   # JWT utilities
│   │   └── fileUtils.ts    # File handling
│   │
│   ├── types/              # TypeScript type definitions
│   │   ├── express.d.ts    # Express type extensions
│   │   └── socket.ts       # Socket.IO types
│   │
│   └── scripts/            # Utility scripts
│       ├── migrateProgressSteps.ts
│       └── clearAppointments.ts
│
├── dist/                   # Compiled JavaScript (generated)
├── logs/                   # Application logs
│   └── app.log
├── .env                    # Environment variables (not committed)
├── tsconfig.json           # TypeScript configuration
├── package.json            # Dependencies and scripts
├── jest.config.js          # Jest testing configuration
└── README.md               # Server documentation
```

### Key Server Patterns

#### MVC Architecture

- **Models**: Mongoose schemas with TypeScript interfaces
- **Controllers**: Business logic and request handling
- **Routes**: Express route definitions with middleware

#### Middleware Stack

- **Authentication**: JWT token verification
- **Authorization**: Role-based access control
- **Validation**: Zod schema validation
- **Security**: CSRF, rate limiting, helmet
- **Error handling**: Centralized error management

#### Service Layer

- **External services**: S3, Brevo, Stripe
- **Business logic**: Separated from controllers
- **Reusability**: Shared across controllers

---

## Documentation Structure

```
docs/
├── README.md               # This index
├── getting-started/        # Setup and installation
│   ├── quickstart.md
│   ├── installation.md
│   ├── configuration.md
│   ├── project-structure.md (you are here)
│   └── development-workflow.md
├── architecture/           # System architecture
│   ├── system-architecture.md
│   ├── design-patterns.md
│   ├── data-flow.md
│   ├── scalability.md
│   └── tech-stack.md
├── frontend/               # Client documentation
│   ├── overview.md
│   ├── components.md
│   ├── state-management.md
│   ├── routing.md
│   ├── forms.md
│   ├── hooks.md
│   ├── styling.md
│   └── performance.md
├── backend/                # Server documentation
│   ├── overview.md
│   ├── controllers.md
│   ├── middleware.md
│   ├── services.md
│   ├── error-handling.md
│   ├── logging.md
│   └── background-jobs.md
├── database/               # Database documentation
│   ├── schema.md
│   ├── models.md
│   ├── relationships.md
│   ├── indexes.md
│   ├── migrations.md
│   └── backup.md
├── api/                    # API reference
│   ├── overview.md
│   ├── authentication.md
│   ├── users.md
│   ├── properties.md
│   ├── collaborations.md
│   ├── chat.md
│   ├── searchads.md
│   ├── appointments.md
│   ├── payments.md
│   ├── admin.md
│   └── errors.md
├── features/               # Feature documentation
│   ├── authentication.md
│   ├── chat.md
│   ├── collaboration.md
│   ├── properties.md
│   ├── searchads.md
│   ├── appointments.md
│   ├── payments.md
│   ├── notifications.md
│   ├── file-uploads.md
│   ├── admin.md
│   └── emails.md
├── security/               # Security documentation
│   ├── overview.md
│   ├── authentication.md
│   ├── authorization.md
│   ├── input-validation.md
│   ├── csrf.md
│   ├── rate-limiting.md
│   ├── xss.md
│   ├── data-protection.md
│   ├── headers.md
│   └── vulnerabilities.md
├── deployment/             # Deployment guides
│   ├── overview.md
│   ├── environment.md
│   ├── cicd.md
│   ├── docker.md
│   ├── monitoring.md
│   ├── performance.md
│   └── troubleshooting.md
├── testing/                # Testing guides
│   ├── overview.md
│   ├── unit-tests.md
│   ├── integration-tests.md
│   ├── e2e-tests.md
│   ├── coverage.md
│   └── mocking.md
├── guides/                 # Developer guides
│   ├── code-style.md
│   ├── git-workflow.md
│   ├── debugging.md
│   ├── performance.md
│   ├── patterns.md
│   ├── troubleshooting.md
│   ├── vscode.md
│   ├── pr-process.md
│   └── issue-reporting.md
└── contributing.md         # Contribution guidelines
```

---

## File Naming Conventions

### Frontend (Client)

- **Components**: PascalCase (e.g., `UserProfile.tsx`, `PropertyCard.tsx`)
- **Hooks**: camelCase with `use` prefix (e.g., `useAuth.ts`, `useFetch.ts`)
- **Pages**: lowercase with hyphens (e.g., `complete-profile/page.tsx`)
- **Utilities**: camelCase (e.g., `formatters.ts`, `validators.ts`)
- **Types**: camelCase (e.g., `auth.ts`, `property.ts`)
- **Styles**: lowercase with hyphens (e.g., `globals.css`)

### Backend (Server)

- **Models**: PascalCase (e.g., `User.ts`, `Property.ts`)
- **Controllers**: camelCase with Controller suffix (e.g., `authController.ts`)
- **Routes**: camelCase (e.g., `auth.ts`, `property.ts`)
- **Middleware**: camelCase (e.g., `auth.ts`, `validation.ts`)
- **Services**: camelCase with Service suffix (e.g., `s3Service.ts`)
- **Utilities**: camelCase (e.g., `logger.ts`, `sanitize.ts`)

---

## Import Patterns

### Barrel Exports

Each component/hook folder has an `index.ts` for clean imports:

```typescript
// components/auth/index.ts
export { LoginForm } from "./LoginForm";
export { SignupForm } from "./SignupForm";
export { EmailVerification } from "./EmailVerification";

// Usage
import { LoginForm, SignupForm } from "@/components/auth";
```

### Path Aliases

Configured in `tsconfig.json`:

```typescript
// Client
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/Button";
import { api } from "@/lib/api";
import type { IUser } from "@/types/auth";

// Server (relative paths preferred)
import { User } from "../models/User";
import { logger } from "../utils/logger";
```

---

## Environment-Specific Files

### Not Committed (in .gitignore)

```
.env                    # Server environment variables
.env.local              # Client environment variables
.env.production         # Production overrides
node_modules/           # Dependencies
dist/                   # Compiled code
.next/                  # Next.js build output
logs/                   # Log files
*.log
```

### Committed

```
.env.example            # Template for environment variables
package.json            # Dependencies
tsconfig.json           # TypeScript config
next.config.ts          # Next.js config
tailwind.config.ts      # Tailwind config
```

---

## Module Boundaries

### Shared Code

Some types/constants are shared between client and server:

- User interfaces
- Property types
- Validation schemas
- API endpoint constants

**Location**: Currently duplicated, could be moved to `shared/` folder.

### Separation of Concerns

- **Client**: UI, state management, user interactions
- **Server**: Business logic, data persistence, external services
- **No client code in server**: Server has no React/Next.js dependencies
- **No server code in client**: Client doesn't import server modules

---

## Key Directories Explained

### `/components` vs `/app`

- **`/app`**: Next.js pages (routes), minimal logic
- **`/components`**: Reusable React components, extracted logic

### `/lib` vs `/utils`

- **`/lib`**: Configurations, clients, integrations (api.ts, validation.ts)
- **`/utils`**: Pure utility functions (formatters, validators)

### `/store` vs `/context`

- **Zustand stores**: Global state that changes frequently
- **React Context**: Rarely changing values (Socket.IO connection)

### `/controllers` vs `/services`

- **Controllers**: Handle HTTP requests/responses
- **Services**: Business logic, external API calls, reusable functions

---

## Next Steps

- 🔧 [Development Workflow](./development-workflow.md) - Learn development practices
- ⚙️ [Configuration Guide](./configuration.md) - Understand environment variables
- 🏗️ [System Architecture](../architecture/system-architecture.md) - High-level overview
- 📖 [Frontend Overview](../frontend/overview.md) - Deep dive into client
- ⚙️ [Backend Overview](../backend/overview.md) - Deep dive into server

---

**Understanding the structure is the first step to contributing effectively!**
