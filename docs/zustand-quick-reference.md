# 🎯 Zustand-Only Architecture - Quick Reference

## 📊 Before vs After

### BEFORE (Dual Pattern - Confusing!)

```
❌ TWO Authentication Systems
├── Context/AuthContext.tsx (React Context)
├── providers/AuthProvider.tsx (Wrapper)
├── store/authStore.ts (Zustand)
└── hooks/useAuth.ts (Confused which to use)

Result: Duplication, confusion, potential bugs
```

### AFTER (Single Pattern - Clean!)

```
✅ ONE Authentication System
├── store/authStore.ts (Zustand - ONLY source)
├── hooks/useAuth.ts (Wrapper around Zustand)
└── components/auth/AuthInitializer.tsx (Initializer)

Result: Single source of truth, clear pattern
```

---

## 🏗️ Current Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    app/layout.tsx                        │
│                                                          │
│  <AuthInitializer>  ← Initializes Zustand on mount     │
│    <SocketWrapper>  ← Only Context (Socket.IO)         │
│      <Header />                                         │
│      {children}                                         │
│    </SocketWrapper>                                     │
│  </AuthInitializer>                                     │
└─────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────┐
│              Zustand Stores (Global State)               │
├─────────────────────────────────────────────────────────┤
│  useAuthStore        ← User, login, logout              │
│  useFavoritesStore   ← Favorites, sync with auth        │
│  chatStore           ← Messages, users, typing          │
└─────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────┐
│              Custom Hooks (Clean API)                    │
├─────────────────────────────────────────────────────────┤
│  useAuth()           ← Wraps useAuthStore               │
│  useRequireAuth()    ← Auth + loading helpers           │
│  useProtectedRoute() ← Route protection logic           │
│  useProfileStatus()  ← Profile completion checks        │
└─────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────┐
│                    Components                            │
│              (Use hooks, never stores directly)          │
└─────────────────────────────────────────────────────────┘
```

---

## 🎓 How to Use

### ✅ For Authentication

```typescript
// In any component
import { useAuth } from "@/hooks/useAuth";

const MyComponent = () => {
  const { user, loading, login, logout } = useAuth();

  if (loading) return <LoadingSpinner />;
  if (!user) return <LoginPrompt />;

  return <div>Hello, {user.firstName}!</div>;
};
```

### ✅ For Favorites

```typescript
import { useFavoritesStore } from "@/store/favoritesStore";

const MyComponent = () => {
  const { favoriteIds, toggleFavorite } = useFavoritesStore();

  const isFavorite = favoriteIds.has(itemId);

  return (
    <button onClick={() => toggleFavorite("property", itemId)}>
      {isFavorite ? "❤️" : "🤍"}
    </button>
  );
};
```

### ✅ For Chat

```typescript
import { useChat } from "@/hooks/useChat";

const MyComponent = () => {
  const { messages, sendMessage, selectedUser } = useChat();

  return <ChatInterface messages={messages} onSend={sendMessage} />;
};
```

### ✅ For Socket (Only Context)

```typescript
import { useSocket } from "@/context/SocketContext";

const MyComponent = () => {
  const { socket, isConnected, onlineUsers } = useSocket();

  useEffect(() => {
    if (!socket || !isConnected) return;

    socket.on("custom-event", handleEvent);
    return () => socket.off("custom-event", handleEvent);
  }, [socket, isConnected]);
};
```

---

## ⚠️ DON'T DO THIS

### ❌ Don't create new Context for state

```typescript
// ❌ BAD - Don't do this!
const MyStateContext = createContext();

export const MyStateProvider = ({ children }) => {
  const [state, setState] = useState();
  return (
    <MyStateContext.Provider value={{ state, setState }}>
      {children}
    </MyStateContext.Provider>
  );
};
```

### ✅ Do this instead

```typescript
// ✅ GOOD - Create Zustand store
import { create } from "zustand";

interface MyState {
  state: string;
  setState: (state: string) => void;
}

export const useMyStore = create<MyState>((set) => ({
  state: "",
  setState: (state) => set({ state }),
}));
```

---

## 🎯 Decision Matrix

| Need               | Use This                   | Example          |
| ------------------ | -------------------------- | ---------------- |
| User auth state    | `useAuth()`                | Get current user |
| Favorites          | `useFavoritesStore()`      | Toggle favorite  |
| Chat               | `useChat()`                | Send message     |
| Socket connection  | `useSocket()`              | Listen to events |
| Component-specific | `useState()`               | Form inputs      |
| Server data        | Custom hook + `useState()` | Fetch properties |

---

## 🔍 How to Find Things

### "Where is user state?"

→ `client/store/authStore.ts`

### "How do I check if user is logged in?"

→ `const { user, loading } = useAuth()`

### "How do I login/logout?"

→ `const { login, logout } = useAuth()`

### "How do I access favorites?"

→ `const { favoriteIds, toggleFavorite } = useFavoritesStore()`

### "How do I send a chat message?"

→ `const { sendMessage } = useChat()`

### "How do I use Socket.IO?"

→ `const { socket, isConnected } = useSocket()`

---

## 📈 Performance Benefits

### Before (Context)

```typescript
// ❌ ANY auth change re-renders EVERYTHING
<AuthContext.Provider value={{ user, loading, login, logout }}>
  <AllYourComponents /> {/* All re-render on any change */}
</AuthContext.Provider>
```

### After (Zustand)

```typescript
// ✅ Only components that use specific state re-render
const user = useAuthStore((state) => state.user); // Only re-renders on user change
const loading = useAuthStore((state) => state.loading); // Only re-renders on loading change
```

---

## 🎨 Code Style

### Always subscribe to specific state

```typescript
// ✅ GOOD - Granular subscriptions
const user = useAuthStore((state) => state.user);
const loading = useAuthStore((state) => state.loading);

// ❌ BAD - Over-subscribing
const { user, loading, login, logout } = useAuthStore();
// ^ Re-renders even if only login/logout reference changes
```

### Use custom hooks for convenience

```typescript
// ✅ GOOD - Clean API
const { user, loading } = useAuth();

// ✅ Also GOOD - Direct store access when needed
const user = useAuthStore((state) => state.user);
```

---

## 🔒 Type Safety

All stores are fully typed:

```typescript
interface AuthState {
  user: User | null;
  loading: boolean;
  isInitialized: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  updateUser: (user: User) => void;
  refreshUser: () => Promise<void>;
  initialize: () => Promise<void>;
}
```

TypeScript will catch:

- ✅ Wrong property names
- ✅ Wrong types
- ✅ Missing required params
- ✅ Return type mismatches

---

## 🚀 Quick Start

1. **Need auth?** → `const { user } = useAuth()`
2. **Need favorites?** → `const { favoriteIds } = useFavoritesStore()`
3. **Need chat?** → `const { messages } = useChat()`
4. **Need socket?** → `const { socket } = useSocket()`
5. **Need component state?** → `useState()`

**That's it!** No Context API needed (except Socket).

---

## ✅ Verification

Run these checks:

```bash
# No AuthContext imports
grep -r "AuthContext" client/ --include="*.tsx" --include="*.ts"
# Should only find in docs and tests

# No AuthProvider imports
grep -r "AuthProvider" client/ --include="*.tsx" --include="*.ts"
# Should only find references, no actual file

# Only SocketContext exists
ls client/context/
# Should show only SocketContext.tsx
```

---

**Status:** ✅ Complete  
**Pattern:** Zustand for state, Context only for Socket  
**Last Updated:** October 22, 2025
