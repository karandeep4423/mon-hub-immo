# Frontend Guide

> Next.js client architecture, components, state management, and patterns

---

## 🏗 Architecture Overview

The frontend is built with **Next.js 15** using the **App Router** pattern.

### Key Technologies

| Technology       | Purpose                         |
| ---------------- | ------------------------------- |
| Next.js 15       | React framework with App Router |
| TypeScript       | Type safety                     |
| Tailwind CSS 4   | Styling                         |
| Zustand          | Global state management         |
| SWR              | Data fetching & caching         |
| Socket.IO Client | Real-time communication         |
| Axios            | HTTP client                     |
| Zod              | Schema validation               |

---

## 📁 Directory Structure

```
client/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Landing page (/)
│   ├── globals.css        # Global styles
│   ├── auth/              # Authentication pages
│   │   ├── login/
│   │   ├── signup/
│   │   ├── verify-email/
│   │   ├── forgot-password/
│   │   └── complete-profile/
│   ├── dashboard/         # User dashboard
│   ├── home/              # Home page (authenticated)
│   ├── chat/              # Messaging interface
│   ├── collaboration/     # Collaboration pages
│   ├── property/          # Property listings
│   ├── search-ads/        # Search advertisements
│   ├── appointments/      # Booking system
│   ├── admin/             # Admin panel
│   └── payment/           # Subscription payments
│
├── components/            # React components
│   ├── ui/               # Shared UI components
│   ├── auth/             # Auth-related components
│   ├── chat/             # Chat components
│   ├── collaboration/    # Collaboration components
│   ├── property/         # Property components
│   ├── dashboard-agent/  # Agent dashboard
│   ├── dashboard-apporteur/ # Apporteur dashboard
│   └── [domain]/         # Domain-specific
│
├── context/              # React contexts
│   ├── SocketContext.tsx
│   └── CookieConsentContext.tsx
│
├── hooks/                # Custom hooks
├── lib/                  # Utilities & services
├── providers/            # Provider components
├── store/                # Zustand stores
├── types/                # TypeScript interfaces
└── middleware.ts         # Edge middleware
```

---

## 🎯 Core Concepts

### 1. App Router Pages

Pages are organized in the `app/` directory following Next.js 15 conventions:

```typescript
// app/property/[id]/page.tsx
export default function PropertyPage({ params }: { params: { id: string } }) {
  return <PropertyDetail id={params.id} />;
}
```

### 2. Root Layout

The root layout wraps the entire application with necessary providers:

```tsx
// app/layout.tsx
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body>
        <ErrorBoundary>
          <SWRConfig value={swrConfig}>
            <AuthInitializer>
              <CookieConsentProvider>
                <SocketWrapper>
                  <RealtimeSyncProvider>
                    <Header />
                    {children}
                    <CookieConsentBanner />
                  </RealtimeSyncProvider>
                </SocketWrapper>
              </CookieConsentProvider>
            </AuthInitializer>
          </SWRConfig>
        </ErrorBoundary>
      </body>
    </html>
  );
}
```

### 3. Middleware (Edge Runtime)

Server-side route protection runs before page rendering:

```typescript
// middleware.ts
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSession = !!request.cookies.get("accessToken")?.value;

  // Protected routes require authentication
  if (isProtectedRoute(pathname) && !hasSession) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  // Auth pages redirect authenticated users
  if (shouldRedirectAuthenticated(pathname) && hasSession) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}
```

---

## 🧩 Component Architecture

### Component Organization

Components are organized by **domain** with single responsibilities:

```
components/
├── chat/                  # Chat feature
│   ├── ChatPage.tsx      # Main container
│   ├── ChatSidebar.tsx   # Conversation list
│   ├── ChatMessages.tsx  # Message list
│   ├── MessageInput.tsx  # Input interface
│   ├── MessageBubble.tsx # Individual message
│   ├── TypingIndicator.tsx
│   ├── ui/               # Micro components
│   │   ├── LoadingSpinner.tsx
│   │   ├── UserAvatar.tsx
│   │   └── UnreadBadge.tsx
│   ├── utils/            # Utility functions
│   │   └── messageUtils.ts
│   └── index.ts          # Barrel exports
```

### Component Patterns

#### Container/Presentational

```typescript
// Container - handles logic
const PropertyListContainer = () => {
  const { data, loading } = useFetch(() => PropertyService.getAll());
  return <PropertyList properties={data} loading={loading} />;
};

// Presentational - handles UI
const PropertyList = ({ properties, loading }) => {
  if (loading) return <LoadingSpinner />;
  return properties.map((p) => <PropertyCard key={p._id} property={p} />);
};
```

#### Composition

```typescript
// Composed component
const MessageInput = () => {
  return (
    <div>
      <TypingIndicator />
      <TextArea />
      <AttachmentButton />
      <SendButton />
    </div>
  );
};
```

---

## 📊 State Management

### Multi-Layer State

```
┌─────────────────────────────────────────┐
│            UI State (useState)          │
│  Component-specific, ephemeral          │
├─────────────────────────────────────────┤
│         Feature State (Hooks)           │
│  useChat, useCollaboration, etc.        │
├─────────────────────────────────────────┤
│        Global State (Zustand)           │
│  authStore, chatStore, favoritesStore   │
├─────────────────────────────────────────┤
│        Server State (SWR/useFetch)      │
│  Cached API data with revalidation      │
└─────────────────────────────────────────┘
```

### Zustand Stores

#### Auth Store

```typescript
// store/authStore.ts
interface AuthState {
  user: User | null;
  loading: boolean;
  isInitialized: boolean;
  login: (user: User) => void;
  logout: () => void;
  updateUser: (user: User) => void;
  refreshUser: () => Promise<void>;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  loading: true,
  isInitialized: false,

  login: (userData) => {
    set({ user: userData, loading: false });
    useFavoritesStore.getState().initializeFavorites();
  },

  logout: async () => {
    await authService.logout();
    set({ user: null, loading: false });
    window.location.href = "/auth/login";
  },

  // ... other actions
}));
```

#### Using the Auth Store

```typescript
// In components - use the wrapper hook
import { useAuth } from "@/hooks/useAuth";

const Component = () => {
  const { user, loading, logout } = useAuth();
  // ...
};

// For granular subscriptions - use direct access
const user = useAuthStore((state) => state.user);
```

---

## 🎣 Custom Hooks

### useFetch

Generic data fetching with loading states, error handling, and retry:

```typescript
// hooks/useFetch.ts
import { useFetch } from "@/hooks/useFetch";

const { data, loading, error, refetch } = useFetch(
  () => PropertyService.getAll(),
  {
    showErrorToast: true,
    errorMessage: "Failed to load properties",
    deps: [filters],
    onSuccess: (data) => console.log("Loaded:", data),
  }
);
```

### useMutation

Standardized write operations:

```typescript
// hooks/useMutation.ts
import { useMutation } from "@/hooks/useMutation";

const { mutate, loading } = useMutation(
  async (data) => PropertyService.create(data),
  {
    onSuccess: () => refetch(),
    successMessage: "Property created!",
    errorMessage: "Failed to create property",
  }
);

// Usage
await mutate(formData);
```

### useAuth

Authentication wrapper hook:

```typescript
// hooks/useAuth.ts
export const useAuth = () => {
  const user = useAuthStore(state => state.user);
  const loading = useAuthStore(state => state.loading);
  const login = useAuthStore(state => state.login);
  const logout = useAuthStore(state => state.logout);
  // ...
  return { user, loading, login, logout, ... };
};
```

### Feature-Specific Hooks

```typescript
// useChat.ts - Chat logic
// useCollaboration.ts - Collaboration logic
// useProperties.ts - Property management
// useAppointments.ts - Appointment booking
```

---

## 🔌 API Integration

### API Client Setup

```typescript
// lib/api.ts
import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000,
  headers: { "Content-Type": "application/json" },
  withCredentials: true, // Send cookies
});

// CSRF token management
let csrfToken: string | null = null;

api.interceptors.request.use(async (config) => {
  if (["post", "put", "patch", "delete"].includes(config.method)) {
    if (!csrfToken) {
      await fetchCsrfToken();
    }
    config.headers["X-CSRF-Token"] = csrfToken;
  }
  return config;
});

// Response interceptor - handle 401, 402, 403
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Try token refresh
    }
    if (error.response?.status === 402) {
      // Redirect to payment
    }
    return Promise.reject(error);
  }
);
```

### API Service Modules

```typescript
// lib/api/propertyApi.ts
export const PropertyService = {
  getAll: async (filters?: PropertyFilters) => {
    const response = await api.get("/property", { params: filters });
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get(`/property/${id}`);
    return response.data;
  },

  create: async (data: FormData) => {
    const response = await api.post("/property/create-property", data, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  // ... other methods
};
```

---

## 🔄 Real-time Integration

### Socket Context

```typescript
// context/SocketContext.tsx
export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user, loading } = useAuth();
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (loading || !user) {
      socketRef.current?.disconnect();
      return;
    }

    const socket = io(SOCKET_URL, {
      withCredentials: true,
      transports: ["websocket", "polling"],
    });

    socket.emit("user:connect", user._id);

    socket.on("users:online", (users) => setOnlineUsers(users));
    socket.on("message:new", handleNewMessage);
    socket.on("typing:update", handleTyping);

    socketRef.current = socket;

    return () => {
      socket.disconnect();
    };
  }, [user, loading]);

  return (
    <SocketContext.Provider value={{ socket: socketRef.current, onlineUsers }}>
      {children}
    </SocketContext.Provider>
  );
};
```

### Using Socket in Components

```typescript
const ChatPage = () => {
  const { socket, onlineUsers } = useSocket();

  useEffect(() => {
    if (!socket) return;

    socket.on("message:new", (message) => {
      // Handle new message
    });

    return () => {
      socket.off("message:new");
    };
  }, [socket]);

  const sendMessage = () => {
    socket?.emit("message:send", { receiverId, text });
  };
};
```

---

## 🎨 Styling

### Tailwind CSS 4

```tsx
// Component with Tailwind classes
const Button = ({ variant, children }) => (
  <button
    className={`
    px-4 py-2 rounded-lg font-medium transition-colors
    ${
      variant === "primary"
        ? "bg-primary text-white hover:bg-primary-dark"
        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
    }
  `}
  >
    {children}
  </button>
);
```

### Global Styles

```css
/* app/globals.css */
@import "tailwindcss";

:root {
  --primary: #3b82f6;
  --primary-dark: #2563eb;
  --background: #ffffff;
  --foreground: #171717;
}

.dark {
  --background: #0a0a0a;
  --foreground: #ededed;
}
```

---

## ✅ Form Handling

### useForm Hook

```typescript
// hooks/useForm.ts
export function useForm<T>(initialValues: T) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});

  const handleChange = (field: keyof T) => (value: T[keyof T]) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const handleBlur = (field: keyof T) => () => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const reset = () => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
  };

  return {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    setErrors,
    reset,
  };
}
```

### Zod Validation

```typescript
// lib/validation/propertySchema.ts
import { z } from "zod";

export const propertySchema = z.object({
  title: z.string().min(5).max(100),
  price: z.number().positive(),
  surface: z.number().positive(),
  city: z.string().min(2),
  // ...
});

// Usage
const result = propertySchema.safeParse(formData);
if (!result.success) {
  // Handle validation errors
}
```

---

## 🚨 Error Handling

### Error Handler Utility

```typescript
// lib/utils/errorHandler.ts
export interface ApiError {
  message: string;
  status?: number;
  code?: string;
}

export const handleApiError = (
  error: unknown,
  context: string,
  defaultMessage: string
): ApiError => {
  logger.error(`[${context}]`, error);

  if (axios.isAxiosError(error)) {
    return {
      message: error.response?.data?.message || defaultMessage,
      status: error.response?.status,
      code: error.response?.data?.code,
    };
  }

  return { message: defaultMessage };
};
```

### Usage

```typescript
try {
  await PropertyService.create(data);
  toast.success("Property created!");
} catch (error) {
  const apiError = handleApiError(error, "CreateProperty", "Failed to create");
  toast.error(apiError.message);
}
```

---

## 📱 Responsive Design

### Mobile-First Approach

```tsx
<div
  className="
  grid 
  grid-cols-1      /* Mobile: 1 column */
  sm:grid-cols-2   /* Tablet: 2 columns */
  lg:grid-cols-3   /* Desktop: 3 columns */
  xl:grid-cols-4   /* Large: 4 columns */
  gap-4
"
>
  {properties.map((p) => (
    <PropertyCard key={p._id} property={p} />
  ))}
</div>
```

---

## 🧪 Testing

### Jest + React Testing Library

```typescript
// __tests__/PropertyCard.test.tsx
import { render, screen } from "@testing-library/react";
import { PropertyCard } from "@/components/property/PropertyCard";

describe("PropertyCard", () => {
  it("renders property title", () => {
    const property = { title: "Test Property", price: 100000 };
    render(<PropertyCard property={property} />);
    expect(screen.getByText("Test Property")).toBeInTheDocument();
  });
});
```

---

_Next: [Backend Guide →](../backend/overview.md)_
