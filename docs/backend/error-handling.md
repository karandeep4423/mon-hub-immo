# Error Handling

> Comprehensive error management strategy for backend and frontend

---

## 📋 Overview

MonHubImmo implements a multi-layered error handling strategy to ensure graceful error recovery, helpful error messages, and proper logging.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         ERROR HANDLING ARCHITECTURE                         │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   CLIENT                                                                    │
│   ┌─────────────────────────────────────────────────────────────────────┐  │
│   │  Component → handleApiError() → Toast/Logger → User Feedback        │  │
│   └─────────────────────────────────────────────────────────────────────┘  │
│                                    │                                        │
│                              HTTP Request                                   │
│                                    │                                        │
│   SERVER                           ▼                                        │
│   ┌─────────────────────────────────────────────────────────────────────┐  │
│   │  Route → Controller → try/catch → Error Middleware → JSON Response  │  │
│   └─────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 🔧 Backend Error Handling

### Custom Error Class

```typescript
// utils/AppError.ts
export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;
  public code?: string;

  constructor(
    statusCode: number,
    message: string,
    isOperational = true,
    code?: string
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.code = code;

    Error.captureStackTrace(this, this.constructor);
  }
}

// Predefined errors
export const NotFoundError = (resource: string) =>
  new AppError(404, `${resource} not found`, true, "NOT_FOUND");

export const UnauthorizedError = () =>
  new AppError(401, "Authentication required", true, "UNAUTHORIZED");

export const ForbiddenError = () =>
  new AppError(403, "Access denied", true, "FORBIDDEN");

export const ValidationError = (message: string) =>
  new AppError(400, message, true, "VALIDATION_ERROR");
```

### Global Error Handler Middleware

```typescript
// middleware/errorHandler.ts
import { Request, Response, NextFunction } from "express";
import { logger } from "../utils/logger";
import { AppError } from "../utils/AppError";

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Default error values
  let statusCode = 500;
  let message = "Internal server error";
  let code = "INTERNAL_ERROR";

  // Known operational errors
  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
    code = err.code || "APP_ERROR";

    // Only log unexpected operational errors
    if (!err.isOperational) {
      logger.error("Unexpected operational error:", err);
    }
  }

  // Mongoose validation errors
  if (err.name === "ValidationError") {
    statusCode = 400;
    message = Object.values((err as any).errors)
      .map((e: any) => e.message)
      .join(", ");
    code = "VALIDATION_ERROR";
  }

  // Mongoose duplicate key error
  if ((err as any).code === 11000) {
    statusCode = 400;
    message = "Duplicate entry";
    code = "DUPLICATE_ERROR";
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Invalid token";
    code = "INVALID_TOKEN";
  }

  if (err.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Token expired";
    code = "TOKEN_EXPIRED";
  }

  // Multer file upload errors
  if (err.name === "MulterError") {
    statusCode = 400;
    message = err.message;
    code = "FILE_UPLOAD_ERROR";
  }

  // Log server errors (500s)
  if (statusCode >= 500) {
    logger.error("Server error:", {
      error: err.message,
      stack: err.stack,
      path: req.path,
      method: req.method,
    });
  }

  // Send response
  res.status(statusCode).json({
    success: false,
    message,
    code,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};
```

### Controller Error Handling

```typescript
// controllers/propertyController.ts
import { Request, Response, NextFunction } from "express";
import { Property } from "../models/Property";
import { NotFoundError, ValidationError } from "../utils/AppError";

export const getProperty = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const property = await Property.findById(req.params.id).populate(
      "owner",
      "firstName lastName email"
    );

    if (!property) {
      throw NotFoundError("Property");
    }

    res.json({ success: true, property });
  } catch (error) {
    next(error); // Pass to error middleware
  }
};

export const createProperty = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Validation already done by middleware
    const property = await Property.create({
      ...req.body,
      owner: req.user.userId,
    });

    res.status(201).json({ success: true, property });
  } catch (error) {
    next(error);
  }
};
```

### Async Handler Wrapper

```typescript
// utils/asyncHandler.ts
import { Request, Response, NextFunction } from "express";

type AsyncHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<any>;

export const asyncHandler = (fn: AsyncHandler) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Usage - cleaner controllers without try/catch
export const getProperty = asyncHandler(async (req, res) => {
  const property = await Property.findById(req.params.id);
  if (!property) throw NotFoundError("Property");
  res.json({ success: true, property });
});
```

---

## 🎨 Frontend Error Handling

### API Error Handler Utility

```typescript
// lib/utils/errorHandler.ts
import { AxiosError } from "axios";
import { logger } from "./logger";

export interface ApiError {
  message: string;
  code?: string;
  statusCode: number;
  originalError: unknown;
}

export const handleApiError = (
  error: unknown,
  context: string,
  defaultMessage = "Une erreur est survenue"
): ApiError => {
  // Axios error with response
  if (error instanceof AxiosError && error.response) {
    const { status, data } = error.response;
    const message = data?.message || defaultMessage;
    const code = data?.code;

    logger.error(`[${context}] API Error:`, {
      status,
      message,
      code,
    });

    return {
      message,
      code,
      statusCode: status,
      originalError: error,
    };
  }

  // Network error
  if (error instanceof AxiosError && error.request) {
    logger.error(`[${context}] Network Error:`, error.message);
    return {
      message: "Erreur de connexion. Vérifiez votre connexion internet.",
      code: "NETWORK_ERROR",
      statusCode: 0,
      originalError: error,
    };
  }

  // Generic error
  const message = error instanceof Error ? error.message : defaultMessage;
  logger.error(`[${context}] Error:`, message);

  return {
    message,
    code: "UNKNOWN_ERROR",
    statusCode: 500,
    originalError: error,
  };
};
```

### Logger Utility

```typescript
// lib/utils/logger.ts
type LogLevel = "debug" | "info" | "warn" | "error";

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  data?: unknown;
}

const isDev = process.env.NODE_ENV === "development";

const formatLog = (level: LogLevel, message: string, data?: unknown): void => {
  const timestamp = new Date().toISOString();

  if (isDev) {
    const styles = {
      debug: "color: gray",
      info: "color: blue",
      warn: "color: orange",
      error: "color: red; font-weight: bold",
    };

    console.log(
      `%c[${level.toUpperCase()}] ${timestamp}`,
      styles[level],
      message,
      data || ""
    );
  } else {
    // Production: could send to logging service
    const entry: LogEntry = { level, message, timestamp, data };
    if (level === "error") {
      console.error(JSON.stringify(entry));
    }
  }
};

export const logger = {
  debug: (message: string, data?: unknown) => formatLog("debug", message, data),
  info: (message: string, data?: unknown) => formatLog("info", message, data),
  warn: (message: string, data?: unknown) => formatLog("warn", message, data),
  error: (message: string, data?: unknown) => formatLog("error", message, data),
};
```

### useFetch Hook with Error Handling

```typescript
// hooks/useFetch.ts
import { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import { handleApiError, ApiError } from "@/lib/utils/errorHandler";

interface UseFetchOptions<T> {
  enabled?: boolean;
  onSuccess?: (data: T) => void;
  onError?: (error: ApiError) => void;
  showErrorToast?: boolean;
  errorMessage?: string;
}

export const useFetch = <T>(
  fetcher: () => Promise<{ data: T }>,
  options: UseFetchOptions<T> = {}
) => {
  const {
    enabled = true,
    onSuccess,
    onError,
    showErrorToast = false,
    errorMessage,
  } = options;

  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState<ApiError | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetcher();
      setData(response.data);
      onSuccess?.(response.data);
    } catch (err) {
      const apiError = handleApiError(err, "useFetch", errorMessage);
      setError(apiError);

      if (showErrorToast) {
        toast.error(apiError.message);
      }

      onError?.(apiError);
    } finally {
      setLoading(false);
    }
  }, [fetcher, onSuccess, onError, showErrorToast, errorMessage]);

  useEffect(() => {
    if (enabled) {
      fetchData();
    }
  }, [enabled, fetchData]);

  return { data, loading, error, refetch: fetchData };
};
```

### useMutation Hook with Error Handling

```typescript
// hooks/useMutation.ts
import { useState, useCallback } from "react";
import { toast } from "react-toastify";
import { handleApiError, ApiError } from "@/lib/utils/errorHandler";

interface UseMutationOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: ApiError) => void;
  successMessage?: string;
  errorMessage?: string;
}

export const useMutation = <T, V = void>(
  mutationFn: (variables: V) => Promise<{ data: T }>,
  options: UseMutationOptions<T> = {}
) => {
  const { onSuccess, onError, successMessage, errorMessage } = options;

  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  const mutate = useCallback(
    async (variables: V): Promise<T | undefined> => {
      setLoading(true);
      setError(null);

      try {
        const response = await mutationFn(variables);
        setData(response.data);

        if (successMessage) {
          toast.success(successMessage);
        }

        onSuccess?.(response.data);
        return response.data;
      } catch (err) {
        const apiError = handleApiError(err, "useMutation", errorMessage);
        setError(apiError);
        toast.error(apiError.message);
        onError?.(apiError);
        return undefined;
      } finally {
        setLoading(false);
      }
    },
    [mutationFn, onSuccess, onError, successMessage, errorMessage]
  );

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  return { mutate, loading, error, data, reset };
};
```

### Component Error Handling Pattern

```typescript
// components/property/PropertyDetails.tsx
import { useFetch } from "@/hooks/useFetch";
import { handleApiError } from "@/lib/utils/errorHandler";
import { logger } from "@/lib/utils/logger";
import api from "@/lib/api";

const PropertyDetails = ({ propertyId }: { propertyId: string }) => {
  const {
    data: property,
    loading,
    error,
    refetch,
  } = useFetch(() => api.get(`/properties/${propertyId}`), {
    showErrorToast: true,
    errorMessage: "Impossible de charger les détails du bien",
  });

  if (loading) return <LoadingSpinner />;

  if (error) {
    return <ErrorDisplay message={error.message} onRetry={refetch} />;
  }

  return <PropertyView property={property} />;
};
```

---

## 🌐 Error Boundary (React)

```typescript
// components/ErrorBoundary.tsx
"use client";

import { Component, ReactNode } from "react";
import { logger } from "@/lib/utils/logger";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    logger.error("React Error Boundary caught error:", {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="p-8 text-center">
            <h2 className="text-xl font-bold text-red-600">
              Une erreur est survenue
            </h2>
            <p className="text-gray-600 mt-2">
              Veuillez rafraîchir la page ou réessayer plus tard.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded"
            >
              Rafraîchir la page
            </button>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
```

---

## 📊 Error Response Format

### Standard Error Response

```json
{
  "success": false,
  "message": "Email already registered",
  "code": "DUPLICATE_ERROR"
}
```

### Validation Error Response

```json
{
  "success": false,
  "message": "Validation failed",
  "code": "VALIDATION_ERROR",
  "errors": [
    { "field": "email", "message": "Invalid email format" },
    {
      "field": "password",
      "message": "Password must be at least 12 characters"
    }
  ]
}
```

### HTTP Status Code Reference

| Code | Meaning               | Usage                             |
| ---- | --------------------- | --------------------------------- |
| 400  | Bad Request           | Validation errors, malformed data |
| 401  | Unauthorized          | Missing or invalid authentication |
| 403  | Forbidden             | Valid auth but insufficient perms |
| 404  | Not Found             | Resource doesn't exist            |
| 409  | Conflict              | Duplicate entry, state conflict   |
| 422  | Unprocessable Entity  | Business logic validation failed  |
| 429  | Too Many Requests     | Rate limit exceeded               |
| 500  | Internal Server Error | Unexpected server error           |

---

## 📚 Related Documentation

- [API Overview](../api/overview.md) - API error responses
- [Security Guide](../security/overview.md) - Security-related errors
- [Testing Guide](../testing/overview.md) - Testing error scenarios
