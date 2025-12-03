# Code Style Guide

> Coding standards and conventions for MonHubImmo

## TypeScript Standards

### Type Safety

**Always prefer explicit types over `any`:**

```typescript
// ❌ BAD
function processData(data: any): any {
  return data.map((item: any) => item.value);
}

// ✅ GOOD
interface DataItem {
  id: string;
  value: number;
}

function processData(data: DataItem[]): number[] {
  return data.map((item) => item.value);
}
```

**Use interfaces for object shapes:**

```typescript
// ✅ GOOD - Interface
interface User {
  id: string;
  name: string;
  email: string;
}

// ✅ ALSO GOOD - Type alias
type User = {
  id: string;
  name: string;
  email: string;
};

// Use interfaces for objects, types for unions/intersections
type UserType = "agent" | "apporteur" | "admin";
```

### Naming Conventions

**Variables and functions: camelCase**

```typescript
const userName = "John";
const isActive = true;
const getUserById = (id: string) => {};
```

**Classes and interfaces: PascalCase**

```typescript
class PropertyManager {}
interface UserProfile {}
type PropertyType = "Appartement" | "Maison";
```

**Constants: UPPER_CASE**

```typescript
const API_BASE_URL = "http://localhost:4000";
const MAX_FILE_SIZE = 5 * 1024 * 1024;
```

**Private members: prefix with underscore**

```typescript
class User {
  private _password: string;

  private _hashPassword() {
    // ...
  }
}
```

### Imports Organization

```typescript
// 1. External imports
import React, { useState, useEffect } from "react";
import axios from "axios";

// 2. Internal imports - absolute paths
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/Button";
import type { IUser } from "@/types/auth";

// 3. Relative imports
import { helper } from "./utils";
import "./styles.css";
```

### Function Declarations

**Prefer arrow functions for consistency:**

```typescript
// ✅ GOOD
const getUserById = async (id: string): Promise<User> => {
  return await api.get(`/users/${id}`);
};

// ✅ ALSO ACCEPTABLE for components
export function UserProfile({ user }: { user: User }) {
  return <div>{user.name}</div>;
}
```

**Always type parameters and return values:**

```typescript
// ❌ BAD
const calculateTotal = (items) => {
  return items.reduce((sum, item) => sum + item.price, 0);
};

// ✅ GOOD
interface Item {
  price: number;
}

const calculateTotal = (items: Item[]): number => {
  return items.reduce((sum, item) => sum + item.price, 0);
};
```

## React/Next.js Standards

### Component Structure

```typescript
// ComponentName.tsx

// 1. Imports
import { useState } from "react";
import type { FC } from "react";

// 2. Types/Interfaces
interface ComponentNameProps {
  title: string;
  onSubmit: (data: FormData) => void;
  optional?: boolean;
}

// 3. Component
export const ComponentName: FC<ComponentNameProps> = ({
  title,
  onSubmit,
  optional = false,
}) => {
  // 3a. Hooks
  const [state, setState] = useState("");

  // 3b. Derived state
  const derivedValue = state.toUpperCase();

  // 3c. Event handlers
  const handleClick = () => {
    setState("new value");
  };

  // 3d. Effects
  useEffect(() => {
    // Effect logic
  }, [state]);

  // 3e. Render helpers (if complex)
  const renderHeader = () => {
    return <h1>{title}</h1>;
  };

  // 3f. Main render
  return (
    <div>
      {renderHeader()}
      <button onClick={handleClick}>Click</button>
    </div>
  );
};
```

### Hooks Best Practices

**Custom hooks:**

```typescript
// useCustomHook.ts
export const useCustomHook = (initialValue: string) => {
  const [value, setValue] = useState(initialValue);

  const updateValue = (newValue: string) => {
    setValue(newValue);
  };

  return { value, updateValue };
};

// Usage
const { value, updateValue } = useCustomHook("initial");
```

**Dependency arrays:**

```typescript
// ❌ BAD - missing dependencies
useEffect(() => {
  fetchData(userId);
}, []);

// ✅ GOOD - all dependencies listed
useEffect(() => {
  fetchData(userId);
}, [userId]);
```

### Conditional Rendering

```typescript
// ✅ GOOD - Ternary for simple cases
{
  isLoading ? <Spinner /> : <Content />;
}

// ✅ GOOD - && for single condition
{
  isError && <ErrorMessage />;
}

// ✅ GOOD - Early return for complex logic
if (isLoading) return <Spinner />;
if (isError) return <ErrorMessage />;
return <Content />;
```

### Props Destructuring

```typescript
// ✅ GOOD - Destructure in parameters
const Component: FC<Props> = ({ title, description }) => {
  return <div>{title}</div>;
};

// ❌ AVOID - Using props object
const Component: FC<Props> = (props) => {
  return <div>{props.title}</div>;
};
```

## Backend Standards

### Controller Pattern

```typescript
// propertyController.ts
import { Request, Response } from "express";
import { Property } from "../models/Property";
import { logger } from "../utils/logger";

export const getProperties = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    const properties = await Property.find()
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    res.status(200).json({
      success: true,
      data: properties,
    });
  } catch (error) {
    logger.error("[PropertyController] Error fetching properties:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch properties",
    });
  }
};
```

### Error Handling

```typescript
// ✅ GOOD - Comprehensive error handling
try {
  const user = await User.findById(userId);

  if (!user) {
    return res.status(404).json({
      success: false,
      error: "User not found",
      code: "USER_NOT_FOUND",
    });
  }

  // Process user...
} catch (error) {
  logger.error("[UserController] Error:", error);
  res.status(500).json({
    success: false,
    error: "Internal server error",
    code: "INTERNAL_ERROR",
  });
}
```

### Logging

```typescript
import { logger } from "../utils/logger";

// Different log levels
logger.error("[Module] Critical error:", error);
logger.warn("[Module] Warning message");
logger.info("[Module] Info message");
logger.debug("[Module] Debug info", { data });

// ❌ AVOID console.log
console.log("This will not work in production");
```

## Code Organization

### File Structure

```
component/
├── Component.tsx       # Main component
├── Component.test.tsx  # Tests
├── types.ts           # Component-specific types
├── utils.ts           # Helper functions
├── styles.css         # Styles (if not using Tailwind)
└── index.ts           # Barrel export
```

### Barrel Exports

```typescript
// components/auth/index.ts
export { LoginForm } from "./LoginForm";
export { SignupForm } from "./SignupForm";
export { PasswordReset } from "./PasswordReset";

// Usage
import { LoginForm, SignupForm } from "@/components/auth";
```

## Comments and Documentation

### When to Comment

**DO comment:**

```typescript
// ✅ Complex business logic
// Calculate commission based on property value and agent tier
// Tier 1 (0-300k): 3%, Tier 2 (300k-600k): 2.5%, Tier 3 (600k+): 2%
const calculateCommission = (price: number): number => {
  if (price < 300000) return price * 0.03;
  if (price < 600000) return price * 0.025;
  return price * 0.02;
};

// ✅ Workarounds or non-obvious solutions
// Using setTimeout to avoid React strict mode double-render issue
// TODO: Remove when React 19 fixes this
setTimeout(() => {
  setData(newData);
}, 0);
```

**DON'T comment:**

```typescript
// ❌ Obvious code
// Set the user name to John
const userName = "John";

// ❌ Bad code that needs explanation
// Check if user is valid and not deleted and has permission
if (user && !user.deleted && user.role === "admin") {
  // Better: Extract to a well-named function
}

// ✅ Better
const isAdminUser = (user: User) => {
  return user && !user.deleted && user.role === "admin";
};

if (isAdminUser(user)) {
  // Clear without comments
}
```

### JSDoc for Public APIs

```typescript
/**
 * Fetches user by ID from the database
 * @param userId - The unique identifier of the user
 * @returns Promise resolving to User object
 * @throws {NotFoundError} When user doesn't exist
 */
export const getUserById = async (userId: string): Promise<User> => {
  // Implementation
};
```

## Testing Standards

### Test Structure

```typescript
// Component.test.tsx
import { render, screen, fireEvent } from "@testing-library/react";
import { Component } from "./Component";

describe("Component", () => {
  it("should render correctly", () => {
    render(<Component />);
    expect(screen.getByText("Expected text")).toBeInTheDocument();
  });

  it("should handle user interaction", () => {
    const onSubmit = jest.fn();
    render(<Component onSubmit={onSubmit} />);

    fireEvent.click(screen.getByRole("button"));
    expect(onSubmit).toHaveBeenCalled();
  });
});
```

## Performance Best Practices

### React Optimization

```typescript
// ✅ GOOD - Memoize expensive calculations
const expensiveValue = useMemo(() => {
  return calculateExpensiveValue(data);
}, [data]);

// ✅ GOOD - Memoize callbacks
const handleClick = useCallback(() => {
  doSomething(value);
}, [value]);

// ✅ GOOD - Lazy load components
const HeavyComponent = lazy(() => import("./HeavyComponent"));
```

### Database Optimization

```typescript
// ✅ GOOD - Use select to limit fields
const users = await User.find().select("name email");

// ✅ GOOD - Use lean for read-only data
const users = await User.find().lean();

// ✅ GOOD - Index frequently queried fields
userSchema.index({ email: 1 });
```

## Security Best Practices

### Input Validation

```typescript
// ✅ GOOD - Always validate and sanitize
import { z } from "zod";
import DOMPurify from "dompurify";

const schema = z.object({
  email: z.string().email(),
  description: z.string().max(5000),
});

const validated = schema.parse(req.body);
const sanitized = DOMPurify.sanitize(validated.description);
```

### Sensitive Data

```typescript
// ❌ BAD - Exposing password
const user = await User.findById(id);
res.json(user); // Contains password hash!

// ✅ GOOD - Exclude sensitive fields
const user = await User.findById(id).select("-password");
res.json(user);
```

## Git Commit Messages

### Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Examples

```bash
feat(auth): add email verification flow

- Implement verification code generation
- Add email sending service
- Create verification endpoint

Closes #123

---

fix(property): correct price calculation

Agency fees were calculated incorrectly when
price exceeded 500k euros.

Fixes #234

---

docs(api): update authentication endpoints

- Add examples for all auth endpoints
- Document error responses
- Add rate limiting information
```

## Code Review Checklist

**Before submitting PR:**

- [ ] Code follows style guide
- [ ] All tests pass
- [ ] No console.log statements
- [ ] No commented-out code
- [ ] Error handling implemented
- [ ] Types properly defined
- [ ] Documentation updated
- [ ] Sensitive data not exposed
- [ ] Performance considered

---

**Consistent code style improves maintainability and collaboration!**
