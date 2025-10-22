# MonHubImmo - AI Coding Assistant Instructions

## Project Architecture

This is a **dual-domain real estate platform** with separate client/server codebases:

- **Client**: Next.js 15 + TypeScript + Tailwind CSS (port 3000)
- **Server**: Express.js + MongoDB + Socket.IO (port 4000)
- **Real-time**: Socket.IO for chat, collaboration, and live updates

### Key Domains

- **Authentication**: Multi-step signup flow with email verification and profile completion
- **User Types**: `agent` (real estate agents) and `apporteur` (lead providers)
- **Chat**: Real-time messaging with Socket.IO, typing indicators, read receipts
- **Collaboration**: Agent-apporteur partnership workflows
- **Properties**: Real estate property management system

## Development Workflows

### Running the Project

```bash
# Client (from /client)
npm run dev  # Uses --turbopack for faster builds

# Server (from /server)
npm run build  # Compiles TypeScript to /dist(before running "npm start" command)
npm start  # Uses ts-node-dev with auto-restart
```

### Testing

- Server uses Jest with TypeScript (`npm test`)
- Client has lint-staged with Prettier + ESLint
- Both use Husky for pre-commit hooks

## Project-Specific Patterns

### Component Architecture

- **Modular components**: See `client/components/chat/README.md` for exemplary structure
- **Composition over inheritance**: Components like `MessageInput` compose smaller parts
- **Micro UI components**: Reusable components in `/ui` folders (LoadingSpinner, UserAvatar)
- **Index exports**: Each component folder has `index.ts` for clean imports

### State Management

- **Zustand**: Global state for auth, chat, and favorites (see `client/store/`)
- **React Context**: Socket.IO only (`SocketContext.tsx`)
- **Custom hooks**: Domain-specific logic (`useAuth.ts`, `useChat.ts`, `useCollaboration.ts`)

### API Patterns

```typescript
// Client: Axios with interceptors in lib/api.ts
api.interceptors.request.use(); // Auto-adds Bearer token
api.interceptors.response.use(); // Handles 401 redirects

// Server: Express routes with middleware
router.post("/signup", signupValidation, signup);
router.get("/profile", authenticateToken, getProfile);
```

### Type Safety

- **Shared interfaces**: Client `types/auth.ts` mirrors server `models/User.ts`
- **Zod validation**: Server-side input validation
- **No any types**: Strict TypeScript enforcement

### Socket.IO Integration

- **Functional factories**: `createSocketServer()` and `createSocketService()` in server
- **Client wrapper**: `SocketWrapper.tsx` provides context to entire app
- **Real-time features**: Chat messages, typing indicators, user status

## Critical Implementation Details

### Authentication Flow

1. Signup → Email verification → Profile completion → Dashboard
2. JWT tokens stored in localStorage with auto-refresh
3. Profile completion required for full app access

### File Organization

```
client/
├── app/           # Next.js App Router pages
├── components/    # Organized by domain (auth/, chat/, collaboration/)
├── context/       # React contexts
├── hooks/         # Custom hooks
├── lib/           # Utilities and services
├── types/         # TypeScript interfaces
└── store/         # Zustand stores

server/src/
├── controllers/   # Route handlers
├── models/        # Mongoose schemas
├── routes/        # Express routes
├── middleware/    # Auth, validation, etc.
├── chat/          # Socket.IO logic
└── utils/         # Shared utilities
```

### Database Patterns

- **Mongoose models**: TypeScript interfaces extend `Document`
- **Validation**: Mongoose schemas + Zod for API validation
- **No transactions for external APIs**: Database transactions only for DB operations

## Component Examples

### Standard Component Pattern

```typescript
// Use functional components with hooks
const MyComponent = () => {
  const [state, setState] = useState();
  return <div>...</div>;
};

// Export from index.ts
export { MyComponent } from "./MyComponent";
```

### Socket Integration

```typescript
// Server: Emit events after DB operations
const socketService = getSocketService();
socketService.emitToUser(userId, "message:new", message);

// Client: Listen in components or hooks
useEffect(() => {
  socket.on("message:new", handleNewMessage);
  return () => socket.off("message:new", handleNewMessage);
}, []);
```

## Debugging & Development

- **Auto-restart**: Both client/server auto-restart on file changes
- **Health check**: `GET /api/health` shows server status and online users
- **Socket debugging**: Health endpoint includes Socket.IO connection count
- **Error handling**: Client redirects to login on 401, server returns structured errors

## Code Style

- **Tab indentation** (not spaces)
- **Single quotes** for strings
- **Trailing newlines** required
- **Prettier + ESLint** configured with lint-staged
- **PascalCase** components, **camelCase** hooks, **kebab-case** files

# Rules for agent for frontend & backend

## General

- Use TypeScript everywhere. Always infer or define explicit types - never use the any type
- Follow modern JavaScript/TypeScript best practices (ES modules, no `var`).
- Prefer concise, readable code over verbose solutions.
- always be very concise when implementing code for me
- never edit code that you were not asked to, that is not explicitly relevant and necessary to change for the current task
- when implementing util functions, check first in the utils dir of either the client or server project that it doesn't already exist. add new util functions to the relevant existing util file, don't create more util files unless sufficiently different in domain from the current files
  ⦁ Always prefer simple, elegant solutions (KISS principle).
  ⦁ Avoid duplication of code (DRY principle); check existing codebase first.
  ⦁ Only add functionality when explicitly needed (YAGNI principle).
  ⦁ Adhere to SOLID principles where applicable (e.g., single responsibility, dependency inversion).
  ⦁ Keep code clean, organized, and under 200-300 lines per file; refactor proactively.
  ⦁ You are careful to only make changes that are requested or you are confident are well understood and related to the change being requested
  ⦁ – When fixing an issue or bug, do not introduce a new pattern or technology without first exhausting all options for the existing implementation. And if you finally do this, make sure to remove the old implementation afterwards so we don’t have duplicate logic.

##Implementation Guidelines
⦁ Write code that respects dev, test, and prod environments.
⦁ !You never mock data for dev or prod—only for tests.
⦁ !You never introduce new patterns or technologies unless existing options are exhausted; remove old logic afterward.
⦁ !You never overwrite .env without my explicit confirmation.

##Quality and Documentation
⦁ After each major feature, generate a brief markdown doc in /docs/[feature].md and update /docs/overview.md.
⦁ Start every response with a random emoji (e.g., 🐳, 🌟) to signal context retention.
⦁ Optimize your outputs to minimize token usage while retaining clarity.

## Frontend (Next js with typescript)

- Use functional components with React hooks (e.g., useState, useEffect).
- Prefer arrow functions for component definitions: `const MyComponent = () => {...}`.
- Avoid class components or outdated React patterns.
- where posisble break big UIs down into smaller components

## Backend (Express js + mongodb)

- Validate inputs with Zod: `import { z } from 'zod'` when needed.
- Keep mongoose models in sync and use generated types.
- never make external api calls within database transactions. database transactions are only for database queries.

## File Structure

- the project resides in `app`, which contains three folders: `app` for front end, `server` for the backend api (app), and `shared` where we have some types/consts to be imported in both client/server
- Frontend files: Place in `app/` (e.g., `/components/`, `/hooks/`).
- Backend files: Place in `src` (e.g., `/api/`, `/db.ts`).
- Shared types/consts: Place in `shared`

## Formatting

- Use tab indentation.
- Prefer single quotes for strings.
- End files with a newline.
- Follow Prettier defaults (assume Prettier is in use unless specified).

## Naming Conventions

- Components: PascalCase (e.g., `MyComponent.tsx`).
- Hooks: camelCase with `use` prefix (e.g., `useMyHook.ts`).

## help

- do not edit code that isn't directly relevant to what I'm asking you to do. be concise and focussed on exactly the task at hand only
- don't add loads of pointless commentary - be very sparing.
- never modify existing commentary unless you have changed the code which the comment covers
- DO NOT give me commands to re-run the project to test the changes you've made, that is not needed since my project is running constantly and auto-restarts on file changes
- never change copy in the app unless I have told you to
