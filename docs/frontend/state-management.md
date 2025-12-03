# State Management

> Zustand stores, React Context, and data flow patterns

---

## 📋 Overview

MonHubImmo uses a combination of state management solutions:

| Solution          | Use Case                                 |
| ----------------- | ---------------------------------------- |
| **Zustand**       | Global app state (auth, chat, favorites) |
| **React Context** | Provider-based features (Socket.IO)      |
| **SWR**           | Server state & caching                   |
| **useState**      | Local component state                    |

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         STATE ARCHITECTURE                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   ┌─────────────────────────────────────────────────────────────────────┐  │
│   │                        GLOBAL STATE (Zustand)                        │  │
│   │  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐           │  │
│   │  │   authStore   │  │   chatStore   │  │ favoritesStore│           │  │
│   │  │  • user       │  │  • messages   │  │  • favorites  │           │  │
│   │  │  • loading    │  │  • typing     │  │               │           │  │
│   │  │  • login()    │  │  • unread     │  │  • toggle()   │           │  │
│   │  └───────────────┘  └───────────────┘  └───────────────┘           │  │
│   └─────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│   ┌─────────────────────────────────────────────────────────────────────┐  │
│   │                       CONTEXT (React Context)                        │  │
│   │  ┌───────────────────────────────────────────────────────────────┐  │  │
│   │  │                     SocketContext                              │  │  │
│   │  │  • socket instance                                             │  │  │
│   │  │  • connection status                                           │  │  │
│   │  └───────────────────────────────────────────────────────────────┘  │  │
│   └─────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│   ┌─────────────────────────────────────────────────────────────────────┐  │
│   │                        SERVER STATE (SWR)                            │  │
│   │  • Properties, Collaborations, Appointments, etc.                   │  │
│   │  • Auto-revalidation, caching, deduplication                        │  │
│   └─────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 🏪 Zustand Stores

### Auth Store

```typescript
// store/authStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface User {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  userType: "agent" | "apporteur" | "admin";
  isValidated: boolean;
  isPaid: boolean;
  profileCompleted?: boolean;
}

interface AuthState {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;

  // Actions
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      loading: true,
      isAuthenticated: false,

      setUser: (user) =>
        set({
          user,
          isAuthenticated: !!user,
          loading: false,
        }),

      setLoading: (loading) => set({ loading }),

      login: async (credentials) => {
        set({ loading: true });
        try {
          const response = await api.post("/auth/login", credentials);
          const { user, accessToken } = response.data;

          localStorage.setItem("accessToken", accessToken);
          set({ user, isAuthenticated: true, loading: false });

          // Redirect based on profile completion
          if (user.userType === "agent" && !user.profileCompleted) {
            router.push("/auth/complete-profile");
          }
        } catch (error) {
          set({ loading: false });
          throw error;
        }
      },

      logout: async () => {
        try {
          await api.post("/auth/logout");
        } finally {
          localStorage.removeItem("accessToken");
          set({ user: null, isAuthenticated: false });
        }
      },

      refreshUser: async () => {
        try {
          const response = await api.get("/auth/profile");
          set({ user: response.data.user });
        } catch {
          get().logout();
        }
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({ user: state.user }),
    }
  )
);
```

### Usage Patterns

```typescript
// ✅ RECOMMENDED: Use wrapper hook in components
import { useAuth } from "@/hooks/useAuth";

const Component = () => {
  const { user, loading, login, logout } = useAuth();
  // ...
};

// ✅ GOOD: Direct store for granular subscriptions
import { useAuthStore } from "@/store/authStore";

const Header = () => {
  // Only re-renders when user changes
  const user = useAuthStore((state) => state.user);
};

// ✅ GOOD: Outside React (in utils, services)
const userId = useAuthStore.getState().user?._id;
```

---

### Chat Store

```typescript
// store/chatStore.ts
import { create } from "zustand";

interface Message {
  _id: string;
  content: string;
  senderId: string;
  receiverId: string;
  createdAt: string;
  isRead: boolean;
}

interface ChatState {
  conversations: Map<string, Message[]>;
  activeConversation: string | null;
  typingUsers: Set<string>;
  unreadCounts: Map<string, number>;

  // Actions
  setActiveConversation: (userId: string | null) => void;
  addMessage: (message: Message) => void;
  markAsRead: (conversationId: string) => void;
  setTyping: (userId: string, isTyping: boolean) => void;
  clearConversation: (userId: string) => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  conversations: new Map(),
  activeConversation: null,
  typingUsers: new Set(),
  unreadCounts: new Map(),

  setActiveConversation: (userId) => {
    set({ activeConversation: userId });
    if (userId) {
      get().markAsRead(userId);
    }
  },

  addMessage: (message) => {
    set((state) => {
      const conversationId =
        message.senderId === get().activeConversation
          ? message.senderId
          : message.receiverId;

      const existing = state.conversations.get(conversationId) || [];
      const updated = new Map(state.conversations);
      updated.set(conversationId, [...existing, message]);

      // Update unread if not active conversation
      const unread = new Map(state.unreadCounts);
      if (state.activeConversation !== conversationId) {
        unread.set(conversationId, (unread.get(conversationId) || 0) + 1);
      }

      return {
        conversations: updated,
        unreadCounts: unread,
      };
    });
  },

  markAsRead: (conversationId) => {
    set((state) => {
      const unread = new Map(state.unreadCounts);
      unread.set(conversationId, 0);
      return { unreadCounts: unread };
    });
  },

  setTyping: (userId, isTyping) => {
    set((state) => {
      const typing = new Set(state.typingUsers);
      if (isTyping) {
        typing.add(userId);
      } else {
        typing.delete(userId);
      }
      return { typingUsers: typing };
    });
  },

  clearConversation: (userId) => {
    set((state) => {
      const conversations = new Map(state.conversations);
      conversations.delete(userId);
      return { conversations };
    });
  },
}));
```

---

### Favorites Store

```typescript
// store/favoritesStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface FavoritesState {
  favorites: Set<string>;

  // Actions
  addFavorite: (propertyId: string) => void;
  removeFavorite: (propertyId: string) => void;
  toggleFavorite: (propertyId: string) => void;
  isFavorite: (propertyId: string) => boolean;
  syncWithServer: () => Promise<void>;
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      favorites: new Set(),

      addFavorite: (propertyId) => {
        set((state) => ({
          favorites: new Set([...state.favorites, propertyId]),
        }));
        // Sync with server
        api.post(`/favorites/${propertyId}`).catch(console.error);
      },

      removeFavorite: (propertyId) => {
        set((state) => {
          const updated = new Set(state.favorites);
          updated.delete(propertyId);
          return { favorites: updated };
        });
        // Sync with server
        api.delete(`/favorites/${propertyId}`).catch(console.error);
      },

      toggleFavorite: (propertyId) => {
        if (get().isFavorite(propertyId)) {
          get().removeFavorite(propertyId);
        } else {
          get().addFavorite(propertyId);
        }
      },

      isFavorite: (propertyId) => get().favorites.has(propertyId),

      syncWithServer: async () => {
        try {
          const response = await api.get("/favorites");
          set({ favorites: new Set(response.data.favorites) });
        } catch (error) {
          console.error("Failed to sync favorites:", error);
        }
      },
    }),
    {
      name: "favorites-storage",
      storage: {
        getItem: (name) => {
          const str = localStorage.getItem(name);
          if (!str) return null;
          const data = JSON.parse(str);
          return {
            ...data,
            state: {
              ...data.state,
              favorites: new Set(data.state.favorites),
            },
          };
        },
        setItem: (name, value) => {
          const data = {
            ...value,
            state: {
              ...value.state,
              favorites: [...value.state.favorites],
            },
          };
          localStorage.setItem(name, JSON.stringify(data));
        },
        removeItem: (name) => localStorage.removeItem(name),
      },
    }
  )
);
```

---

## 🔌 React Context

### Socket Context

```typescript
// context/SocketContext.tsx
import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { io, Socket } from "socket.io-client";
import { useAuthStore } from "@/store/authStore";

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
});

export const SocketProvider = ({ children }: { children: ReactNode }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    if (!user) {
      socket?.disconnect();
      setSocket(null);
      setIsConnected(false);
      return;
    }

    const newSocket = io(process.env.NEXT_PUBLIC_SOCKET_URL!, {
      auth: {
        token: localStorage.getItem("accessToken"),
      },
      transports: ["websocket"],
    });

    newSocket.on("connect", () => {
      setIsConnected(true);
      console.log("Socket connected");
    });

    newSocket.on("disconnect", () => {
      setIsConnected(false);
      console.log("Socket disconnected");
    });

    newSocket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [user?._id]);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
```

### Usage

```typescript
// In component
import { useSocket } from "@/context/SocketContext";

const ChatComponent = () => {
  const { socket, isConnected } = useSocket();

  useEffect(() => {
    if (!socket) return;

    socket.on("message:new", handleNewMessage);

    return () => {
      socket.off("message:new", handleNewMessage);
    };
  }, [socket]);

  const sendMessage = (content: string) => {
    socket?.emit("message:send", { content, receiverId });
  };
};
```

---

## 📦 SWR for Server State

### Configuration

```typescript
// lib/swrConfig.ts
import { SWRConfiguration } from "swr";

export const swrConfig: SWRConfiguration = {
  revalidateOnFocus: true,
  revalidateOnReconnect: true,
  dedupingInterval: 2000,
  errorRetryCount: 3,
  onError: (error) => {
    if (error.status === 401) {
      // Handle unauthorized
    }
  },
};
```

### SWR Keys

```typescript
// lib/swrKeys.ts
export const SWR_KEYS = {
  PROPERTIES: "properties",
  PROPERTY: (id: string) => `property/${id}`,
  COLLABORATIONS: "collaborations",
  COLLABORATION: (id: string) => `collaboration/${id}`,
  APPOINTMENTS: "appointments",
  SEARCH_ADS: "search-ads",
  USER_PROFILE: "user/profile",
  NOTIFICATIONS: "notifications",
} as const;
```

### Using SWR in Hooks

```typescript
// hooks/useProperties.ts
import useSWR from "swr";
import { SWR_KEYS } from "@/lib/swrKeys";
import { propertyService } from "@/lib/services/propertyService";

export const useProperties = (filters?: PropertyFilters) => {
  const { data, error, isLoading, mutate } = useSWR(
    [SWR_KEYS.PROPERTIES, filters],
    () => propertyService.getAll(filters),
    {
      keepPreviousData: true,
    }
  );

  return {
    properties: data?.properties || [],
    pagination: data?.pagination,
    loading: isLoading,
    error,
    refresh: mutate,
  };
};

// Single property
export const useProperty = (id: string) => {
  const { data, error, isLoading, mutate } = useSWR(
    id ? SWR_KEYS.PROPERTY(id) : null,
    () => propertyService.getById(id)
  );

  return {
    property: data,
    loading: isLoading,
    error,
    refresh: mutate,
  };
};
```

---

## 🔄 Data Flow Patterns

### Component → Store → Server

```typescript
// Example: Adding a property to favorites

// 1. User clicks favorite button
const handleFavorite = () => {
  toggleFavorite(property._id);
};

// 2. Store updates optimistically
toggleFavorite: (propertyId) => {
  // Update local state immediately
  set((state) => ({
    favorites: new Set([...state.favorites, propertyId]),
  }));

  // Sync with server in background
  api.post(`/favorites/${propertyId}`);
};

// 3. UI updates instantly from store subscription
const isFavorite = useFavoritesStore((state) =>
  state.favorites.has(property._id)
);
```

### Real-time Updates

```typescript
// Socket event → Store update → UI re-render

// 1. Setup listener in hook
useEffect(() => {
  socket?.on("message:new", (message) => {
    // 2. Update store
    addMessage(message);
  });
}, [socket]);

// 3. Component subscribes to store
const messages = useChatStore((state) => state.conversations.get(activeUserId));
```

### Server State Revalidation

```typescript
// Mutation → Revalidate SWR cache

const { mutate: createProperty } = useMutation(
  (data) => propertyService.create(data),
  {
    onSuccess: () => {
      // Revalidate properties list
      mutate(SWR_KEYS.PROPERTIES);
    },
  }
);
```

---

## ⚡ Performance Tips

### Selective Subscriptions

```typescript
// ❌ Bad: Re-renders on any store change
const store = useAuthStore();

// ✅ Good: Only re-renders when user changes
const user = useAuthStore((state) => state.user);
```

### Shallow Comparison

```typescript
// For objects/arrays, use shallow
import { shallow } from "zustand/shallow";

const { user, isAuthenticated } = useAuthStore(
  (state) => ({
    user: state.user,
    isAuthenticated: state.isAuthenticated,
  }),
  shallow
);
```

### Memoized Selectors

```typescript
// Create reusable selectors
const selectUnreadCount = (state: ChatState) =>
  Array.from(state.unreadCounts.values()).reduce((a, b) => a + b, 0);

const totalUnread = useChatStore(selectUnreadCount);
```

---

_Next: [Hooks Reference →](./hooks.md)_
