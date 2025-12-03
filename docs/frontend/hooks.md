# Hooks Reference

> Custom React hooks for common patterns and functionality

---

## 📋 Overview

MonHubImmo provides a comprehensive set of custom hooks for:

- **Data Fetching**: `useFetch`, `useMutation`
- **Authentication**: `useAuth`, `useRequireAuth`
- **Domain Logic**: `useCollaboration`, `useProperties`, etc.
- **Utilities**: `useDebounce`, `useClickOutside`, etc.

---

## 🔄 Data Fetching Hooks

### useFetch

Generic hook for data fetching with loading, error, and retry.

```typescript
// hooks/useFetch.ts
interface UseFetchOptions<T> {
  enabled?: boolean;
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
  showErrorToast?: boolean;
  errorMessage?: string;
  retryCount?: number;
}

interface UseFetchResult<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

const useFetch = <T>(
  fetcher: () => Promise<{ data: T }>,
  options?: UseFetchOptions<T>
): UseFetchResult<T>
```

**Usage:**

```typescript
// Basic usage
const { data, loading, error, refetch } = useFetch(() =>
  api.get("/properties")
);

// With options
const { data: user } = useFetch(() => api.get(`/users/${userId}`), {
  enabled: !!userId,
  onSuccess: (data) => console.log("User loaded:", data),
  showErrorToast: true,
  errorMessage: "Failed to load user",
});

// With dependencies (refetch when filters change)
const { data } = useFetch(() => api.get("/properties", { params: filters }), {
  enabled: !!filters.city,
});
```

---

### useMutation

Hook for write operations (POST, PUT, DELETE) with optimistic updates.

```typescript
// hooks/useMutation.ts
interface UseMutationOptions<T, V> {
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
  successMessage?: string;
  errorMessage?: string;
  confirmMessage?: string;  // Shows confirmation dialog
}

interface UseMutationResult<T, V> {
  mutate: (variables: V) => Promise<T | undefined>;
  loading: boolean;
  error: Error | null;
  data: T | null;
  reset: () => void;
}

const useMutation = <T, V = void>(
  mutationFn: (variables: V) => Promise<{ data: T }>,
  options?: UseMutationOptions<T, V>
): UseMutationResult<T, V>
```

**Usage:**

```typescript
// Create property
const { mutate: createProperty, loading } = useMutation(
  (data: PropertyFormData) => api.post("/properties", data),
  {
    successMessage: "Bien créé avec succès",
    onSuccess: (data) => router.push(`/property/${data._id}`),
  }
);

// Delete with confirmation
const { mutate: deleteProperty } = useMutation(
  (id: string) => api.delete(`/properties/${id}`),
  {
    confirmMessage: "Êtes-vous sûr de vouloir supprimer ce bien ?",
    successMessage: "Bien supprimé",
    onSuccess: () => refetchProperties(),
  }
);

// Form submission
const handleSubmit = async (e: FormEvent) => {
  e.preventDefault();
  await createProperty(formData);
};
```

---

## 🔐 Authentication Hooks

### useAuth

Wrapper hook for authentication state and actions.

```typescript
// hooks/useAuth.ts
interface UseAuthResult {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const useAuth = (): UseAuthResult
```

**Usage:**

```typescript
const { user, loading, isAuthenticated, login, logout } = useAuth();

// Conditional rendering
if (loading) return <LoadingSpinner />;
if (!isAuthenticated) return <LoginPrompt />;

// Login form
const handleLogin = async (e: FormEvent) => {
  e.preventDefault();
  await login({ email, password });
};
```

---

### useRequireAuth

Redirects unauthenticated users to login.

```typescript
// hooks/useRequireAuth.ts
interface UseRequireAuthOptions {
  redirectTo?: string;
  requireValidation?: boolean;  // Require admin validation
  requireSubscription?: boolean; // Require active subscription
}

const useRequireAuth = (options?: UseRequireAuthOptions): {
  user: User;
  loading: boolean;
}
```

**Usage:**

```typescript
// In protected page
const DashboardPage = () => {
  const { user, loading } = useRequireAuth();

  if (loading) return <LoadingSpinner />;

  return <Dashboard user={user} />;
};

// With subscription requirement
const CreatePropertyPage = () => {
  const { user } = useRequireAuth({
    requireSubscription: true,
    redirectTo: "/payment",
  });
  // ...
};
```

---

### useAuthRedirect

Redirects authenticated users away from auth pages.

```typescript
// hooks/useAuthRedirect.ts
const useAuthRedirect = (redirectTo?: string): void
```

**Usage:**

```typescript
// In login page
const LoginPage = () => {
  useAuthRedirect("/dashboard"); // Redirect if already logged in

  return <LoginForm />;
};
```

---

## 📊 Domain Hooks

### useProperties

```typescript
// hooks/useProperties.ts
interface UsePropertiesOptions {
  filters?: PropertyFilters;
  enabled?: boolean;
}

const useProperties = (options?: UsePropertiesOptions) => {
  properties: Property[];
  pagination: Pagination;
  loading: boolean;
  error: Error | null;
  refresh: () => void;
}
```

**Usage:**

```typescript
const { properties, loading, pagination } = useProperties({
  filters: { city: "Paris", minPrice: 200000 },
});
```

---

### usePropertyForm

```typescript
// hooks/usePropertyForm.ts
const usePropertyForm = (propertyId?: string) => {
  formData: PropertyFormData;
  setFormData: (data: Partial<PropertyFormData>) => void;
  images: File[];
  setImages: (files: File[]) => void;
  save: () => Promise<Property>;
  saving: boolean;
  uploadImages: (propertyId: string) => Promise<void>;
  errors: Record<string, string>;
  isValid: boolean;
}
```

---

### useCollaboration

```typescript
// hooks/useCollaboration.ts
const useCollaboration = (collaborationId: string) => {
  collaboration: Collaboration | null;
  loading: boolean;
  error: Error | null;
  updateStatus: (status: string) => Promise<void>;
  addActivity: (activity: Activity) => Promise<void>;
  refresh: () => void;
}
```

---

### useCollaborations

```typescript
// hooks/useCollaborations.ts
const useCollaborations = (filters?: CollaborationFilters) => {
  collaborations: Collaboration[];
  loading: boolean;
  stats: {
    total: number;
    pending: number;
    active: number;
    completed: number;
  };
  refresh: () => void;
}
```

---

### useChat

```typescript
// hooks/useChat.ts
const useChat = (recipientId?: string) => {
  messages: Message[];
  loading: boolean;
  sendMessage: (content: string) => Promise<void>;
  sending: boolean;
  isTyping: boolean;
  setTyping: (typing: boolean) => void;
  markAsRead: () => void;
}
```

---

### useSearchAds

```typescript
// hooks/useSearchAds.ts
const useSearchAds = (filters?: SearchAdFilters) => {
  searchAds: SearchAd[];
  loading: boolean;
  error: Error | null;
  refresh: () => void;
}
```

---

### useAppointments

```typescript
// hooks/useAppointments.ts
const useAppointments = (filters?: AppointmentFilters) => {
  appointments: Appointment[];
  loading: boolean;
  upcoming: Appointment[];
  past: Appointment[];
  refresh: () => void;
}
```

---

## 🛠 Utility Hooks

### useDebounce

Debounces a value for a specified delay.

```typescript
// hooks/useDebounce.ts
const useDebounce = <T>(value: T, delay: number): T
```

**Usage:**

```typescript
const [searchTerm, setSearchTerm] = useState("");
const debouncedSearch = useDebounce(searchTerm, 300);

// Only fetch when debounced value changes
useEffect(() => {
  if (debouncedSearch) {
    fetchResults(debouncedSearch);
  }
}, [debouncedSearch]);
```

---

### useDebouncedSearch

Combined hook for search with debouncing.

```typescript
// hooks/useDebouncedSearch.ts
const useDebouncedSearch = <T>(
  searchFn: (query: string) => Promise<T[]>,
  delay?: number
) => {
  query: string;
  setQuery: (query: string) => void;
  results: T[];
  loading: boolean;
  clearResults: () => void;
}
```

**Usage:**

```typescript
const { query, setQuery, results, loading } = useDebouncedSearch(
  (q) => api.get(`/search?q=${q}`).then((r) => r.data),
  300
);

<input value={query} onChange={(e) => setQuery(e.target.value)} />;
{
  loading && <Spinner />;
}
{
  results.map((r) => <ResultItem key={r.id} {...r} />);
}
```

---

### useClickOutside

Detects clicks outside a ref element.

```typescript
// hooks/useClickOutside.ts
const useClickOutside = (
  ref: RefObject<HTMLElement>,
  handler: () => void
): void
```

**Usage:**

```typescript
const dropdownRef = useRef<HTMLDivElement>(null);
const [isOpen, setIsOpen] = useState(false);

useClickOutside(dropdownRef, () => setIsOpen(false));

<div ref={dropdownRef}>{isOpen && <DropdownMenu />}</div>;
```

---

### useForm

Generic form state management.

```typescript
// hooks/useForm.ts
interface UseFormOptions<T> {
  initialValues: T;
  validate?: (values: T) => Record<string, string>;
  onSubmit: (values: T) => Promise<void>;
}

const useForm = <T extends Record<string, any>>(options: UseFormOptions<T>) => {
  values: T;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  handleChange: (name: keyof T, value: any) => void;
  handleBlur: (name: keyof T) => void;
  handleSubmit: (e: FormEvent) => Promise<void>;
  setFieldValue: (name: keyof T, value: any) => void;
  setFieldError: (name: keyof T, error: string) => void;
  isValid: boolean;
  isSubmitting: boolean;
  reset: () => void;
}
```

**Usage:**

```typescript
const { values, errors, handleChange, handleSubmit, isSubmitting } = useForm({
  initialValues: { email: "", password: "" },
  validate: (values) => {
    const errors: Record<string, string> = {};
    if (!values.email) errors.email = "Email requis";
    if (!values.password) errors.password = "Mot de passe requis";
    return errors;
  },
  onSubmit: async (values) => {
    await login(values);
  },
});

<form onSubmit={handleSubmit}>
  <input
    value={values.email}
    onChange={(e) => handleChange("email", e.target.value)}
  />
  {errors.email && <span>{errors.email}</span>}
  <button disabled={isSubmitting}>Connexion</button>
</form>;
```

---

### useFormValidation

Validation-focused hook with Zod support.

```typescript
// hooks/useFormValidation.ts
const useFormValidation = <T>(schema: ZodSchema<T>) => {
  validate: (data: unknown) => {
    success: boolean;
    errors: Record<string, string>;
  };
  validateField: (field: string, value: unknown) => string | null;
};
```

---

### usePageState

Manages page state (loading, error, data) with localStorage persistence.

```typescript
// hooks/usePageState.ts
const usePageState = <T>(key: string, initialValue: T) => {
  state: T;
  setState: (value: T | ((prev: T) => T)) => void;
  resetState: () => void;
}
```

---

### useScrollRestoration

Restores scroll position when navigating back.

```typescript
// hooks/useScrollRestoration.ts
const useScrollRestoration = (): void
```

**Usage:**

```typescript
// In layout or page component
const PropertiesPage = () => {
  useScrollRestoration();
  // ...
};
```

---

### useLocationHistory

Tracks navigation history.

```typescript
// hooks/useLocationHistory.ts
const useLocationHistory = () => {
  history: string[];
  goBack: () => void;
  canGoBack: boolean;
}
```

---

### useSocketListener

Typed Socket.IO event listener.

```typescript
// hooks/useSocketListener.ts
const useSocketListener = <T>(
  event: string,
  handler: (data: T) => void
): void
```

**Usage:**

```typescript
useSocketListener<Message>("message:new", (message) => {
  addMessage(message);
});
```

---

### useNotification

Browser notification API wrapper.

```typescript
// hooks/useNotification.ts
const useNotification = () => {
  permission: NotificationPermission;
  requestPermission: () => Promise<void>;
  showNotification: (title: string, options?: NotificationOptions) => void;
}
```

---

### useAutocomplete

Autocomplete functionality for inputs.

```typescript
// hooks/useAutocomplete.ts
const useAutocomplete = <T>(
  fetchSuggestions: (query: string) => Promise<T[]>,
  options?: { minChars?: number; delay?: number }
) => {
  query: string;
  setQuery: (q: string) => void;
  suggestions: T[];
  loading: boolean;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  highlightedIndex: number;
  setHighlightedIndex: (i: number) => void;
  handleKeyDown: (e: KeyboardEvent) => void;
  selectSuggestion: (suggestion: T) => void;
}
```

---

### useAddressSearch

French address search using API Adresse.

```typescript
// hooks/useAddressSearch.ts
const useAddressSearch = () => {
  query: string;
  setQuery: (q: string) => void;
  suggestions: Address[];
  loading: boolean;
  selectAddress: (address: Address) => void;
  selectedAddress: Address | null;
}
```

---

## 📁 Hook Index

All hooks are exported from `hooks/index.ts`:

```typescript
// hooks/index.ts
export { useAuth } from "./useAuth";
export { useRequireAuth } from "./useRequireAuth";
export { useFetch } from "./useFetch";
export { useMutation } from "./useMutation";
export { useProperties } from "./useProperties";
export { usePropertyForm } from "./usePropertyForm";
export { useCollaboration } from "./useCollaboration";
export { useCollaborations } from "./useCollaborations";
export { useChat } from "./useChat";
export { useSearchAds } from "./useSearchAds";
export { useAppointments } from "./useAppointments";
export { useDebounce } from "./useDebounce";
export { useDebouncedSearch } from "./useDebouncedSearch";
export { useClickOutside } from "./useClickOutside";
export { useForm } from "./useForm";
// ... etc
```

---

_Next: [Components Guide →](./components.md)_
