# Testing Guide

> Testing strategies, patterns, and tooling for both client and server

---

## 🧪 Testing Overview

| Layer      | Framework            | Coverage Focus                    |
| ---------- | -------------------- | --------------------------------- |
| **Server** | Jest                 | Controllers, Services, Middleware |
| **Client** | Jest + RTL           | Components, Hooks, Utils          |
| **E2E**    | Playwright (planned) | Critical user flows               |

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         TESTING PYRAMID                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│                           ┌─────────┐                                       │
│                           │   E2E   │  ◄── Few, slow, high confidence       │
│                          ─┴─────────┴─                                      │
│                        ─────────────────                                    │
│                       │  Integration   │  ◄── API routes, DB queries        │
│                      ───────────────────                                    │
│                    ───────────────────────                                  │
│                   │      Unit Tests      │  ◄── Fast, many, isolated        │
│                  ─────────────────────────                                  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## ⚙️ Server Testing Setup

### Jest Configuration

```javascript
// server/jest.config.mjs
export default {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/src"],
  testMatch: ["**/__tests__/**/*.ts", "**/*.test.ts"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  collectCoverageFrom: ["src/**/*.ts", "!src/**/*.d.ts", "!src/server.ts"],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
};
```

### Test Setup

```javascript
// server/jest.setup.js
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  // Clean all collections after each test
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});
```

### Running Server Tests

```bash
cd server

# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Watch mode
npm run test:watch

# Run specific file
npm test -- auth.test.ts
```

---

## 🖥 Client Testing Setup

### Jest Configuration

```javascript
// client/jest.config.mjs
import nextJest from "next/jest.js";

const createJestConfig = nextJest({
  dir: "./",
});

const customJestConfig = {
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  testEnvironment: "jsdom",
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
  },
  testPathIgnorePatterns: ["<rootDir>/node_modules/", "<rootDir>/.next/"],
  collectCoverageFrom: [
    "components/**/*.{ts,tsx}",
    "hooks/**/*.{ts,tsx}",
    "lib/**/*.{ts,tsx}",
    "!**/*.d.ts",
  ],
};

export default createJestConfig(customJestConfig);
```

### Test Setup

```javascript
// client/jest.setup.js
import "@testing-library/jest-dom";

// Mock next/navigation
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => "/",
}));

// Mock environment variables
process.env.NEXT_PUBLIC_API_URL = "http://localhost:4000/api";

// Suppress console errors in tests (optional)
const originalError = console.error;
beforeAll(() => {
  console.error = (...args) => {
    if (args[0]?.includes?.("Warning:")) return;
    originalError.call(console, ...args);
  };
});
afterAll(() => {
  console.error = originalError;
});
```

### Running Client Tests

```bash
cd client

# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Watch mode
npm run test:watch
```

---

## 📝 Unit Testing Patterns

### Testing Controllers

```typescript
// server/src/controllers/__tests__/authController.test.ts
import { Request, Response } from "express";
import { signup, login } from "../authController";
import { User } from "../../models/User";

describe("AuthController", () => {
  describe("signup", () => {
    const mockReq = {
      body: {
        email: "test@example.com",
        password: "Password123!",
        userType: "agent",
        firstName: "John",
        lastName: "Doe",
      },
    } as Request;

    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it("should create a new user successfully", async () => {
      await signup(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.any(String),
          user: expect.objectContaining({
            email: "test@example.com",
          }),
        })
      );

      // Verify user was created in DB
      const user = await User.findOne({ email: "test@example.com" });
      expect(user).toBeTruthy();
    });

    it("should return 400 if email already exists", async () => {
      // Create existing user
      await User.create(mockReq.body);

      await signup(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.any(String),
        })
      );
    });
  });

  describe("login", () => {
    it("should return tokens for valid credentials", async () => {
      // Setup user
      await User.create({
        email: "test@example.com",
        password: await hashPassword("Password123!"),
        isVerified: true,
        isValidated: true,
      });

      const req = {
        body: { email: "test@example.com", password: "Password123!" },
      } as Request;

      await login(req, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          accessToken: expect.any(String),
          user: expect.any(Object),
        })
      );
    });
  });
});
```

### Testing Services

```typescript
// server/src/services/__tests__/emailService.test.ts
import { sendVerificationEmail, sendPasswordResetEmail } from "../emailService";
import * as brevo from "@sendinblue/client";

jest.mock("@sendinblue/client");

describe("EmailService", () => {
  const mockSendEmail = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (brevo.TransactionalEmailsApi as jest.Mock).mockImplementation(() => ({
      sendTransacEmail: mockSendEmail,
    }));
  });

  describe("sendVerificationEmail", () => {
    it("should send email with verification link", async () => {
      mockSendEmail.mockResolvedValue({ messageId: "123" });

      await sendVerificationEmail({
        to: "test@example.com",
        name: "John",
        verificationToken: "abc123",
      });

      expect(mockSendEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: [{ email: "test@example.com" }],
          templateId: expect.any(Number),
          params: expect.objectContaining({
            name: "John",
            verificationLink: expect.stringContaining("abc123"),
          }),
        })
      );
    });
  });
});
```

### Testing Middleware

```typescript
// server/src/middleware/__tests__/auth.test.ts
import { authenticateToken } from "../auth";
import jwt from "jsonwebtoken";
import { User } from "../../models/User";

describe("authenticateToken middleware", () => {
  const mockNext = jest.fn();

  const createMockReq = (token?: string) => ({
    headers: token ? { authorization: `Bearer ${token}` } : {},
  });

  const mockRes = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should call next() with valid token", async () => {
    const user = await User.create({
      email: "test@example.com",
      password: "hashed",
      isValidated: true,
    });

    const token = jwt.sign(
      { userId: user._id.toString() },
      process.env.JWT_SECRET!
    );

    const req = createMockReq(token);

    await authenticateToken(req as any, mockRes as any, mockNext);

    expect(mockNext).toHaveBeenCalled();
    expect(req.user).toBeDefined();
    expect(req.user.userId).toBe(user._id.toString());
  });

  it("should return 401 with no token", async () => {
    const req = createMockReq();

    await authenticateToken(req as any, mockRes as any, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockNext).not.toHaveBeenCalled();
  });

  it("should return 403 with invalid token", async () => {
    const req = createMockReq("invalid-token");

    await authenticateToken(req as any, mockRes as any, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(403);
  });
});
```

---

## ⚛️ Component Testing

### Testing with React Testing Library

```tsx
// client/components/__tests__/PropertyCard.test.tsx
import { render, screen, fireEvent } from "@testing-library/react";
import { PropertyCard } from "../property/PropertyCard";

const mockProperty = {
  _id: "123",
  title: "Appartement T3 Paris",
  price: 350000,
  surface: 75,
  rooms: 3,
  city: "Paris",
  postalCode: "75001",
  images: ["/image1.jpg"],
  propertyType: "apartment",
  transactionType: "sale",
};

describe("PropertyCard", () => {
  it("renders property information correctly", () => {
    render(<PropertyCard property={mockProperty} />);

    expect(screen.getByText("Appartement T3 Paris")).toBeInTheDocument();
    expect(screen.getByText("350 000 €")).toBeInTheDocument();
    expect(screen.getByText("75 m²")).toBeInTheDocument();
    expect(screen.getByText("3 pièces")).toBeInTheDocument();
    expect(screen.getByText("Paris 75001")).toBeInTheDocument();
  });

  it("calls onFavorite when favorite button clicked", () => {
    const onFavorite = jest.fn();
    render(
      <PropertyCard
        property={mockProperty}
        onFavorite={onFavorite}
        showActions
      />
    );

    fireEvent.click(screen.getByRole("button", { name: /favoris/i }));

    expect(onFavorite).toHaveBeenCalledWith(mockProperty._id);
  });

  it("displays correct property type badge", () => {
    render(<PropertyCard property={mockProperty} />);

    expect(screen.getByText("Appartement")).toBeInTheDocument();
    expect(screen.getByText("Vente")).toBeInTheDocument();
  });
});
```

### Testing Hooks

```tsx
// client/hooks/__tests__/useFetch.test.ts
import { renderHook, waitFor } from "@testing-library/react";
import { useFetch } from "../useFetch";

describe("useFetch", () => {
  it("should fetch data successfully", async () => {
    const mockData = { id: 1, name: "Test" };
    const fetcher = jest.fn().mockResolvedValue({ data: mockData });

    const { result } = renderHook(() => useFetch(fetcher));

    // Initially loading
    expect(result.current.loading).toBe(true);
    expect(result.current.data).toBeNull();

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toEqual(mockData);
    expect(result.current.error).toBeNull();
    expect(fetcher).toHaveBeenCalledTimes(1);
  });

  it("should handle errors", async () => {
    const error = new Error("Network error");
    const fetcher = jest.fn().mockRejectedValue(error);

    const { result } = renderHook(() => useFetch(fetcher));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBeTruthy();
    expect(result.current.data).toBeNull();
  });

  it("should refetch when called", async () => {
    const fetcher = jest.fn().mockResolvedValue({ data: "test" });

    const { result } = renderHook(() => useFetch(fetcher));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Call refetch
    result.current.refetch();

    await waitFor(() => {
      expect(fetcher).toHaveBeenCalledTimes(2);
    });
  });
});
```

### Testing Store (Zustand)

```tsx
// client/store/__tests__/authStore.test.ts
import { useAuthStore } from "../authStore";
import { act } from "@testing-library/react";

describe("authStore", () => {
  beforeEach(() => {
    // Reset store state
    useAuthStore.setState({
      user: null,
      loading: false,
      isAuthenticated: false,
    });
  });

  it("should set user on login", () => {
    const mockUser = {
      _id: "123",
      email: "test@example.com",
      userType: "agent",
    };

    act(() => {
      useAuthStore.getState().setUser(mockUser);
    });

    const state = useAuthStore.getState();
    expect(state.user).toEqual(mockUser);
    expect(state.isAuthenticated).toBe(true);
  });

  it("should clear user on logout", () => {
    // Setup logged in state
    act(() => {
      useAuthStore.getState().setUser({ _id: "123" });
    });

    act(() => {
      useAuthStore.getState().logout();
    });

    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.isAuthenticated).toBe(false);
  });
});
```

---

## 🔗 Integration Testing

### API Route Testing

```typescript
// server/src/routes/__tests__/property.test.ts
import request from "supertest";
import { app } from "../../server";
import { User } from "../../models/User";
import { Property } from "../../models/Property";
import { generateTestToken } from "../../utils/testHelpers";

describe("Property Routes", () => {
  let agentToken: string;
  let agent: any;

  beforeEach(async () => {
    agent = await User.create({
      email: "agent@test.com",
      password: "hashed",
      userType: "agent",
      isValidated: true,
      isPaid: true,
    });
    agentToken = generateTestToken(agent._id);
  });

  describe("GET /api/properties", () => {
    it("should return list of active properties", async () => {
      await Property.create([
        { title: "Property 1", status: "active", owner: agent._id },
        { title: "Property 2", status: "active", owner: agent._id },
        { title: "Property 3", status: "draft", owner: agent._id },
      ]);

      const res = await request(app).get("/api/properties").expect(200);

      expect(res.body.properties).toHaveLength(2);
      expect(res.body.properties[0].status).toBe("active");
    });

    it("should filter by city", async () => {
      await Property.create([
        { title: "Paris 1", city: "Paris", status: "active", owner: agent._id },
        { title: "Lyon 1", city: "Lyon", status: "active", owner: agent._id },
      ]);

      const res = await request(app)
        .get("/api/properties?city=Paris")
        .expect(200);

      expect(res.body.properties).toHaveLength(1);
      expect(res.body.properties[0].city).toBe("Paris");
    });
  });

  describe("POST /api/properties", () => {
    it("should create property with valid data", async () => {
      const propertyData = {
        title: "New Property",
        propertyType: "apartment",
        transactionType: "sale",
        price: 300000,
        surface: 60,
        city: "Paris",
        postalCode: "75001",
      };

      const res = await request(app)
        .post("/api/properties")
        .set("Authorization", `Bearer ${agentToken}`)
        .send(propertyData)
        .expect(201);

      expect(res.body.property.title).toBe("New Property");
      expect(res.body.property.owner).toBe(agent._id.toString());
    });

    it("should return 401 without auth", async () => {
      await request(app)
        .post("/api/properties")
        .send({ title: "Test" })
        .expect(401);
    });

    it("should return 403 without subscription", async () => {
      const freeAgent = await User.create({
        email: "free@test.com",
        password: "hashed",
        userType: "agent",
        isValidated: true,
        isPaid: false,
      });
      const freeToken = generateTestToken(freeAgent._id);

      await request(app)
        .post("/api/properties")
        .set("Authorization", `Bearer ${freeToken}`)
        .send({ title: "Test" })
        .expect(403);
    });
  });
});
```

---

## 🎭 Mocking Strategies

### Mock API Responses

```typescript
// client/__mocks__/api.ts
export const mockApi = {
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
};

jest.mock("@/lib/api", () => ({
  api: mockApi,
}));

// Usage in test
import { mockApi } from "../__mocks__/api";

test("fetches properties", async () => {
  mockApi.get.mockResolvedValue({
    data: { properties: [{ id: 1 }] },
  });

  // ... test code
});
```

### Mock Socket.IO

```typescript
// client/__mocks__/socket.ts
export const mockSocket = {
  on: jest.fn(),
  off: jest.fn(),
  emit: jest.fn(),
  connect: jest.fn(),
  disconnect: jest.fn(),
  connected: true,
};

jest.mock("socket.io-client", () => ({
  io: () => mockSocket,
}));
```

### Mock External Services

```typescript
// server/__mocks__/stripe.ts
export const mockStripe = {
  customers: {
    create: jest.fn().mockResolvedValue({ id: "cus_123" }),
  },
  checkout: {
    sessions: {
      create: jest.fn().mockResolvedValue({
        id: "sess_123",
        url: "https://checkout.stripe.com",
      }),
    },
  },
  subscriptions: {
    update: jest.fn(),
    cancel: jest.fn(),
  },
};

jest.mock("stripe", () => {
  return jest.fn().mockImplementation(() => mockStripe);
});
```

---

## 📊 Code Coverage

### Coverage Report

```bash
# Generate coverage report
npm run test:coverage

# Coverage output
-------------------------------|---------|----------|---------|---------|
File                           | % Stmts | % Branch | % Funcs | % Lines |
-------------------------------|---------|----------|---------|---------|
All files                      |   82.45 |    75.32 |   85.12 |   83.21 |
 controllers/                  |   88.12 |    82.45 |   90.00 |   88.56 |
  authController.ts            |   92.30 |    85.00 |   95.00 |   92.50 |
  propertyController.ts        |   85.00 |    80.00 |   88.00 |   85.20 |
 middleware/                   |   95.00 |    90.00 |   98.00 |   95.50 |
 services/                     |   75.00 |    68.00 |   80.00 |   76.00 |
-------------------------------|---------|----------|---------|---------|
```

### Coverage Goals

| Metric     | Target | Current |
| ---------- | ------ | ------- |
| Statements | 80%    | 82.45%  |
| Branches   | 70%    | 75.32%  |
| Functions  | 80%    | 85.12%  |
| Lines      | 80%    | 83.21%  |

---

## 🏃 CI/CD Testing

### GitHub Actions Workflow

```yaml
# .github/workflows/test.yml
name: Test

on:
  pull_request:
    branches: [main, develop]

jobs:
  test-server:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: ./server
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: "npm"
          cache-dependency-path: server/package-lock.json

      - run: npm ci
      - run: npm run lint
      - run: npm test -- --coverage

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./server/coverage/lcov.info
          flags: server

  test-client:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: ./client
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: "npm"
          cache-dependency-path: client/package-lock.json

      - run: npm ci
      - run: npm run lint
      - run: npm test -- --coverage

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./client/coverage/lcov.info
          flags: client
```

---

## ✅ Testing Checklist

### Before PR

- [ ] All tests passing locally
- [ ] Coverage not decreased
- [ ] New features have tests
- [ ] Edge cases covered
- [ ] No skipped tests (unless documented)
- [ ] Mocks cleaned up properly

### Code Review

- [ ] Tests actually test behavior
- [ ] No testing implementation details
- [ ] Readable test descriptions
- [ ] Proper setup/teardown
- [ ] No flaky tests

---

_Next: [Contributing Guide →](./contributing.md)_
