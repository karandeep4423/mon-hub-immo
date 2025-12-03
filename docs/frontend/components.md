# Components Library

> Reusable UI components, domain components, and component patterns

---

## 📋 Overview

Components in MonHubImmo are organized by **domain** with shared UI components in a dedicated folder.

```
components/
├── ui/                 # Shared, reusable UI components
├── auth/               # Authentication components
├── chat/               # Messaging components
├── collaboration/      # Collaboration workflow components
├── property/           # Property listing components
├── dashboard-agent/    # Agent dashboard components
├── dashboard-apporteur/# Apporteur dashboard components
├── admin/              # Admin panel components
├── header/             # Navigation header
├── footer/             # Page footer
└── landing/            # Landing page components
```

---

## 🎨 UI Components

### Button

```typescript
// components/ui/Button.tsx
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  children: ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
}

// Usage
<Button variant="primary" loading={isSubmitting}>
  Enregistrer
</Button>

<Button variant="outline" leftIcon={<PlusIcon />}>
  Ajouter un bien
</Button>

<Button variant="danger" onClick={handleDelete}>
  Supprimer
</Button>
```

### Input

```typescript
// components/ui/Input.tsx
interface InputProps {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  type?: "text" | "email" | "password" | "number" | "tel";
  // ...extends HTMLInputElement props
}

// Usage
<Input
  label="Email"
  type="email"
  error={errors.email}
  leftIcon={<MailIcon />}
  {...register("email")}
/>;
```

### Modal

```typescript
// components/ui/Modal.tsx
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size?: "sm" | "md" | "lg" | "xl";
  children: ReactNode;
  footer?: ReactNode;
  closeOnOverlay?: boolean;
}

// Usage
<Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Confirmer">
  <p>Êtes-vous sûr de vouloir supprimer ce bien ?</p>
  <Modal.Footer>
    <Button variant="outline" onClick={() => setShowModal(false)}>
      Annuler
    </Button>
    <Button variant="danger" onClick={handleConfirm}>
      Supprimer
    </Button>
  </Modal.Footer>
</Modal>;
```

### LoadingSpinner

```typescript
// components/ui/LoadingSpinner.tsx
interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'white' | 'gray';
  fullScreen?: boolean;
  text?: string;
}

// Usage
<LoadingSpinner />
<LoadingSpinner size="lg" fullScreen text="Chargement..." />
```

### Toast / Notifications

```typescript
// Using react-toastify
import { toast } from "react-toastify";

// Success
toast.success("Bien créé avec succès");

// Error
toast.error("Une erreur est survenue");

// Info with options
toast.info("Nouveau message reçu", {
  position: "bottom-right",
  autoClose: 3000,
});
```

### UserAvatar

```typescript
// components/ui/UserAvatar.tsx
interface UserAvatarProps {
  user: {
    firstName: string;
    lastName: string;
    profileImage?: string;
  };
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  showOnline?: boolean;
  isOnline?: boolean;
}

// Usage
<UserAvatar
  user={user}
  size="md"
  showOnline
  isOnline={onlineUsers.has(user._id)}
/>;
```

### Badge

```typescript
// components/ui/Badge.tsx
interface BadgeProps {
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  size?: 'sm' | 'md';
  children: ReactNode;
}

// Usage
<Badge variant="success">Actif</Badge>
<Badge variant="warning">En attente</Badge>
```

### Card

```typescript
// components/ui/Card.tsx
interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
}

// Usage
<Card hover onClick={handleClick}>
  <Card.Header>
    <h3>Titre</h3>
  </Card.Header>
  <Card.Body>
    <p>Contenu</p>
  </Card.Body>
  <Card.Footer>
    <Button>Action</Button>
  </Card.Footer>
</Card>;
```

---

## 🏠 Property Components

### PropertyCard

```typescript
// components/property/PropertyCard.tsx
interface PropertyCardProps {
  property: Property;
  onFavorite?: (id: string) => void;
  isFavorite?: boolean;
  showActions?: boolean;
}

// Usage
<PropertyCard
  property={property}
  onFavorite={toggleFavorite}
  isFavorite={favorites.includes(property._id)}
/>;
```

### PropertyList

```typescript
// components/property/PropertyList.tsx
interface PropertyListProps {
  properties: Property[];
  loading?: boolean;
  emptyMessage?: string;
  onLoadMore?: () => void;
  hasMore?: boolean;
}

// Usage
<PropertyList
  properties={properties}
  loading={loading}
  emptyMessage="Aucun bien trouvé"
  onLoadMore={loadMore}
  hasMore={hasNextPage}
/>;
```

### PropertyFilters

```typescript
// components/property/PropertyFilters.tsx
interface PropertyFiltersProps {
  filters: PropertyFilters;
  onChange: (filters: PropertyFilters) => void;
  onReset: () => void;
}

// Usage
<PropertyFilters
  filters={filters}
  onChange={setFilters}
  onReset={resetFilters}
/>;
```

### PropertyForm

```typescript
// components/property/PropertyForm.tsx
interface PropertyFormProps {
  initialData?: Partial<Property>;
  onSubmit: (data: PropertyFormData) => Promise<void>;
  isSubmitting?: boolean;
}

// Usage
<PropertyForm
  initialData={property}
  onSubmit={handleSubmit}
  isSubmitting={loading}
/>;
```

### ImageUploader

```typescript
// components/property/ImageUploader.tsx
interface ImageUploaderProps {
  images: string[];
  onChange: (images: string[]) => void;
  maxImages?: number;
  onError?: (error: string) => void;
}

// Usage
<ImageUploader
  images={formData.images}
  onChange={(images) => setFormData({ ...formData, images })}
  maxImages={10}
/>;
```

---

## 💬 Chat Components

### ChatContainer

Main chat interface component:

```typescript
// components/chat/ChatContainer.tsx
interface ChatContainerProps {
  initialConversationId?: string;
}

// Internal structure
<ChatContainer>
  ├── <ChatSidebar />        // Conversation list
  │   └── <ConversationItem />
  └── <ChatWindow>           // Active conversation
      ├── <ChatHeader />     // User info, actions
      ├── <MessageList />    // Messages
      │   └── <MessageBubble />
      ├── <TypingIndicator />
      └── <MessageInput />   // Compose area
</ChatContainer>
```

### MessageBubble

```typescript
// components/chat/MessageBubble.tsx
interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
  showAvatar?: boolean;
  showTime?: boolean;
}
```

### MessageInput

```typescript
// components/chat/MessageInput.tsx
interface MessageInputProps {
  onSend: (content: string) => void;
  onTyping: () => void;
  disabled?: boolean;
  placeholder?: string;
}
```

---

## 🤝 Collaboration Components

### CollaborationCard

```typescript
// components/collaboration/CollaborationCard.tsx
interface CollaborationCardProps {
  collaboration: Collaboration;
  userRole: "owner" | "collaborator";
  onAction?: (action: string) => void;
}
```

### ProgressTracker

```typescript
// components/collaboration/ProgressTracker.tsx
interface ProgressTrackerProps {
  steps: ProgressStep[];
  currentStep: string;
  onStepClick?: (stepId: string) => void;
}
```

### ContractViewer

```typescript
// components/collaboration/ContractViewer.tsx
interface ContractViewerProps {
  contract: string;
  onSign?: () => void;
  isSigned?: boolean;
  canSign?: boolean;
}
```

---

## 🔐 Auth Components

### LoginForm

```typescript
// components/auth/LoginForm.tsx
interface LoginFormProps {
  onSuccess?: () => void;
  redirectTo?: string;
}
```

### SignupForm (Multi-step)

```typescript
// components/auth/SignupForm.tsx
// Uses FormContext for multi-step state

<SignupForm>
  ├── <StepOne /> // Basic info (email, password) ├── <StepTwo /> // User type
  selection └── <StepThree /> // Professional info (agents)
</SignupForm>
```

### VerifyEmailForm

```typescript
// components/auth/VerifyEmailForm.tsx
interface VerifyEmailFormProps {
  email: string;
  onSuccess: () => void;
  onResend: () => void;
}
```

---

## 🧩 Component Patterns

### Barrel Exports

Every component folder has an `index.ts` for clean imports:

```typescript
// components/property/index.ts
export { PropertyCard } from "./PropertyCard";
export { PropertyList } from "./PropertyList";
export { PropertyForm } from "./PropertyForm";
export { PropertyFilters } from "./PropertyFilters";
export { ImageUploader } from "./ImageUploader";
```

```typescript
// Usage
import { PropertyCard, PropertyList } from "@/components/property";
```

### Loading States

Components handle their loading states:

```typescript
// Pattern: Skeleton loading
const PropertyList = ({ properties, loading }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <PropertyCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-4">
      {properties.map((p) => (
        <PropertyCard key={p._id} property={p} />
      ))}
    </div>
  );
};
```

### Empty States

```typescript
// Pattern: Empty state handling
const PropertyList = ({ properties }) => {
  if (properties.length === 0) {
    return (
      <EmptyState
        icon={<HomeIcon />}
        title="Aucun bien trouvé"
        description="Modifiez vos critères de recherche"
        action={<Button onClick={resetFilters}>Réinitialiser</Button>}
      />
    );
  }

  return <div>...</div>;
};
```

### Error States

```typescript
// Pattern: Error state with retry
const PropertyList = ({ properties, error, onRetry }) => {
  if (error) {
    return <ErrorState message={error.message} onRetry={onRetry} />;
  }

  return <div>...</div>;
};
```

---

## 📏 Component Guidelines

### 1. Single Responsibility

Each component should do one thing well:

```typescript
// ❌ BAD: Too many responsibilities
const PropertyPage = () => {
  // Fetches data, handles forms, manages state, renders UI
};

// ✅ GOOD: Split responsibilities
const PropertyPage = () => {
  return (
    <PropertyDataProvider>
      <PropertyHeader />
      <PropertyContent />
      <PropertySidebar />
    </PropertyDataProvider>
  );
};
```

### 2. Composition over Props

```typescript
// ❌ BAD: Too many props
<Modal
  showHeader={true}
  headerTitle="Title"
  showFooter={true}
  footerButtons={[...]}
  showClose={true}
/>

// ✅ GOOD: Composition
<Modal>
  <Modal.Header>Title</Modal.Header>
  <Modal.Body>Content</Modal.Body>
  <Modal.Footer>
    <Button>OK</Button>
  </Modal.Footer>
</Modal>
```

### 3. Controlled vs Uncontrolled

```typescript
// Controlled: Parent manages state
<Input value={email} onChange={setEmail} />

// Uncontrolled: Component manages own state
<Input defaultValue={email} ref={inputRef} />
```

---

## 📚 Related Documentation

- [Frontend Overview](./overview.md) - Frontend architecture
- [Hooks Reference](./hooks.md) - Custom hooks
- [State Management](./state-management.md) - Zustand and context
- [Code Style Guide](../guides/code-style.md) - Coding standards
