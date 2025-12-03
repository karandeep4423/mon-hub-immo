# Design Patterns

> Architectural patterns, coding patterns, and best practices used in MonHubImmo

---

## 📋 Overview

MonHubImmo follows established design patterns to ensure maintainability, scalability, and code quality across both frontend and backend.

---

## 🏗️ Architectural Patterns

### 1. Layered Architecture (Backend)

The server follows a **clean layered architecture** with clear separation of concerns:

```
┌─────────────────────────────────────────────────────────────┐
│                     PRESENTATION LAYER                       │
│  Routes → Define endpoints and HTTP methods                 │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     MIDDLEWARE LAYER                         │
│  Auth, Validation, Rate Limiting, Error Handling            │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     CONTROLLER LAYER                         │
│  Handle requests, call services, format responses           │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      SERVICE LAYER                           │
│  Business logic, external API calls, complex operations     │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      DATA ACCESS LAYER                       │
│  Mongoose models, database queries, data validation         │
└─────────────────────────────────────────────────────────────┘
```

**Example Flow - Create Property:**

```typescript
// 1. Route (routes/property.ts)
router.post("/", authenticateToken, validatePropertyInput, createProperty);

// 2. Middleware (middleware/validation.ts)
export const validatePropertyInput = validate(propertySchema);

// 3. Controller (controllers/propertyController.ts)
export const createProperty = async (req: AuthRequest, res: Response) => {
  const property = await Property.create({
    ...req.body,
    owner: req.user.userId,
  });
  res.status(201).json({ success: true, property });
};

// 4. Model (models/Property.ts)
const PropertySchema = new Schema({
  title: { type: String, required: true },
  // ...
});
```

---

### 2. Component-Based Architecture (Frontend)

Components are organized by **feature/domain** with clear boundaries:

```
components/
├── auth/                  # Authentication domain
│   ├── LoginForm.tsx
│   ├── SignupForm.tsx
│   └── index.ts
├── property/              # Property domain
│   ├── PropertyCard.tsx
│   ├── PropertyList.tsx
│   ├── PropertyForm.tsx
│   └── index.ts
├── chat/                  # Chat domain
│   ├── ChatContainer.tsx
│   ├── MessageList.tsx
│   └── index.ts
└── ui/                    # Shared UI components
    ├── Button.tsx
    ├── Input.tsx
    └── Modal.tsx
```

---

## 🎯 Design Patterns

### Repository Pattern (Implicit)

Mongoose models act as repositories, encapsulating data access logic:

```typescript
// models/User.ts
const UserSchema = new Schema({...});

// Methods attached to schema
UserSchema.methods.comparePassword = async function(candidate: string) {
  return bcrypt.compare(candidate, this.password);
};

// Static methods for queries
UserSchema.statics.findByEmail = function(email: string) {
  return this.findOne({ email: email.toLowerCase() });
};

export const User = model<IUser, IUserModel>('User', UserSchema);
```

---

### Factory Pattern

Used for creating Socket.IO server and services:

```typescript
// chat/socketConfig.ts
export const createSocketServer = (httpServer: HttpServer): Server => {
  const io = new Server(httpServer, {
    cors: { origin: ALLOWED_ORIGINS, credentials: true },
  });
  return io;
};

// chat/socketService.ts
export const createSocketService = (io: Server): SocketService => {
  const manager = createSocketManager();

  return {
    emitToUser: (userId, event, data) => {
      const socketIds = manager.getSocketIds(userId);
      socketIds.forEach((id) => io.to(id).emit(event, data));
    },
    // ...
  };
};
```

---

### Singleton Pattern

Used for shared instances across the application:

```typescript
// Database connection singleton
let isConnected = false;

export const connectDB = async () => {
  if (isConnected) return;
  await mongoose.connect(process.env.MONGODB_URL);
  isConnected = true;
};

// Logger singleton
import winston from "winston";

export const logger = winston.createLogger({
  level: "info",
  format: winston.format.json(),
  transports: [new winston.transports.Console()],
});
```

---

### Observer Pattern (Event-Driven)

Socket.IO implements observer pattern for real-time updates:

```typescript
// Server - Publisher
socketService.emitToUser(userId, "message:new", message);
socketService.emitToUser(userId, "notification:new", notification);

// Client - Subscriber
socket.on("message:new", (message) => {
  addMessage(message);
});

socket.on("notification:new", (notification) => {
  showNotification(notification);
});
```

---

### Strategy Pattern

Used for different authentication strategies:

```typescript
// Middleware chooses strategy based on request
export const authenticateToken = async (req, res, next) => {
  // Strategy 1: Cookie-based auth
  const cookieToken = req.cookies.accessToken;

  // Strategy 2: Bearer token auth
  const authHeader = req.headers.authorization;
  const bearerToken = authHeader?.startsWith("Bearer ")
    ? authHeader.split(" ")[1]
    : null;

  const token = cookieToken || bearerToken;

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  // Verify and decode
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  req.user = decoded;
  next();
};
```

---

### Decorator Pattern (Middleware)

Express middleware decorates request handlers with additional functionality:

```typescript
// Compose middleware to decorate route handlers
router.post(
  "/properties",
  authenticateToken, // Add user to request
  requireActiveSubscription, // Check subscription
  uploadMiddleware, // Handle file uploads
  validatePropertyInput, // Validate input
  csrfProtection, // CSRF check
  createProperty // Final handler
);
```

---

## 🎨 Frontend Patterns

### Container/Presentational Pattern

Separation of logic and presentation:

```typescript
// Container - handles data and logic
const PropertyListContainer = () => {
  const {
    data: properties,
    loading,
    error,
  } = useFetch(() => api.get("/properties"));

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;

  return <PropertyList properties={properties} />;
};

// Presentational - pure rendering
interface PropertyListProps {
  properties: Property[];
}

const PropertyList: FC<PropertyListProps> = ({ properties }) => (
  <div className="grid grid-cols-3 gap-4">
    {properties.map((p) => (
      <PropertyCard key={p._id} property={p} />
    ))}
  </div>
);
```

---

### Compound Components Pattern

Used for complex UI components with shared state:

```typescript
// Usage
<Tabs defaultTab="details">
  <Tabs.List>
    <Tabs.Tab id="details">Details</Tabs.Tab>
    <Tabs.Tab id="images">Images</Tabs.Tab>
    <Tabs.Tab id="location">Location</Tabs.Tab>
  </Tabs.List>
  <Tabs.Panel id="details">
    <PropertyDetails />
  </Tabs.Panel>
  <Tabs.Panel id="images">
    <PropertyImages />
  </Tabs.Panel>
  <Tabs.Panel id="location">
    <PropertyLocation />
  </Tabs.Panel>
</Tabs>;

// Implementation uses Context for shared state
const TabsContext = createContext<TabsContextValue | null>(null);

const Tabs = ({ children, defaultTab }) => {
  const [activeTab, setActiveTab] = useState(defaultTab);

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      {children}
    </TabsContext.Provider>
  );
};
```

---

### Custom Hook Pattern

Encapsulate reusable logic in custom hooks:

```typescript
// hooks/useProperties.ts
export const useProperties = (filters?: PropertyFilters) => {
  const { data, loading, error, refetch } = useFetch(
    () => api.get("/properties", { params: filters }),
    { enabled: true }
  );

  const { mutate: createProperty } = useMutation((data: PropertyInput) =>
    api.post("/properties", data)
  );

  const { mutate: deleteProperty } = useMutation((id: string) =>
    api.delete(`/properties/${id}`)
  );

  return {
    properties: data || [],
    loading,
    error,
    refetch,
    createProperty,
    deleteProperty,
  };
};

// Usage in component
const PropertyPage = () => {
  const { properties, loading, createProperty } = useProperties();
  // ...
};
```

---

### Render Props Pattern

For flexible component composition:

```typescript
// InfiniteScroll with render props
<InfiniteScroll
  loadMore={loadMoreProperties}
  hasMore={hasNextPage}
  loader={<LoadingSpinner />}
>
  {(items) => items.map((p) => <PropertyCard key={p._id} property={p} />)}
</InfiniteScroll>
```

---

## 🔄 State Management Patterns

### Flux Pattern (Zustand)

Unidirectional data flow:

```typescript
// store/authStore.ts
export const useAuthStore = create<AuthState>((set, get) => ({
  // State
  user: null,
  loading: true,

  // Actions (modify state)
  setUser: (user) => set({ user, loading: false }),

  login: async (credentials) => {
    set({ loading: true });
    const response = await api.post("/auth/login", credentials);
    set({ user: response.data.user, loading: false });
  },

  logout: async () => {
    await api.post("/auth/logout");
    set({ user: null });
  },
}));
```

---

### Provider Pattern

Wrap application with context providers:

```typescript
// layout.tsx
export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <ErrorBoundary>
          <SWRConfig value={swrConfig}>
            <AuthInitializer>
              <SocketWrapper>{children}</SocketWrapper>
            </AuthInitializer>
          </SWRConfig>
        </ErrorBoundary>
      </body>
    </html>
  );
}
```

---

## 🛡️ Error Handling Patterns

### Try-Catch with Custom Errors

```typescript
// Custom error class
class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public isOperational = true
  ) {
    super(message);
  }
}

// Controller usage
export const getProperty = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) {
      throw new AppError(404, "Property not found");
    }
    res.json(property);
  } catch (error) {
    next(error);
  }
};

// Global error handler
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ message: err.message });
  }
  logger.error("Unexpected error:", err);
  res.status(500).json({ message: "Internal server error" });
};
```

---

## 📚 Related Documentation

- [System Architecture](./system-architecture.md) - High-level system design
- [Backend Guide](../backend/overview.md) - Backend implementation details
- [Frontend Guide](../frontend/overview.md) - Frontend implementation details
- [Code Style Guide](../guides/code-style.md) - Coding standards
