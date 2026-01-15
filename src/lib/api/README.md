# API Service Layer Documentation

This document describes the API service layer architecture used in the Roadmap Application. All frontend API interactions **must** go through these service classes.

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [File Structure](#file-structure)
3. [Service Class Pattern](#service-class-pattern)
4. [Request/Response Flow](#requestresponse-flow)
5. [Error Handling](#error-handling)
6. [Integration with React Query](#integration-with-react-query)
7. [Creating New Services](#creating-new-services)
8. [Best Practices](#best-practices)
9. [Complete Example](#complete-example)

---

## Architecture Overview

The API service layer acts as an **abstraction layer** between React components and Next.js API endpoints:

```
React Components (Client)
        ↓
  React Query (TanStack Query)
        ↓
  Service Classes (src/lib/api/[resource]/service.ts)
        ↓
  Native Fetch API
        ↓
  API Endpoints (app/api/[resource]/route.ts)
        ↓
  Database (Prisma)
```

### Key Responsibilities

1. **API abstraction**: Centralize all API calls in one place
2. **Type safety**: Enforce TypeScript types for requests and responses
3. **Data transformation**: Convert date strings to Date objects
4. **Error handling**: Provide consistent error messages and logging
5. **React Query integration**: Serve as query/mutation functions

---

## File Structure

```
src/lib/api/
├── README.md                    # This file
├── api-service-error.ts         # Unified error class
├── queryClient.ts               # Query client factory
├── queryKeyFactory.ts           # Query key & mutation key factory
├── features/
│   └── service.ts               # FeatureService class
├── votes/
│   └── service.ts               # VoteService class
└── [other-resources]/
    └── service.ts
```

### Naming Convention

- **File name**: `service.ts` (always singular)
- **Class name**: `{Resource}Service` (e.g., `FeatureService`, `VoteService`)
- **Directory name**: Plural resource name (e.g., `features/`, `votes/`)

---

## Service Class Pattern

All service classes follow this consistent pattern:

### Basic Structure

```typescript
'use client';

import { ApiServiceError } from '@/lib/api/api-service-error';
import type { Feature, FeatureCreateRequest, ApiSuccessResponse } from '@/types';

/**
 * FeatureService handles all feature-related API calls
 * This service is client-side only and integrates with React Query
 * 
 * All methods throw ApiServiceError on failure
 */
export default class FeatureService {
  /**
   * Get all features
   * @see {@link file://./../../../app/api/dashboard/features/route.ts API Route Implementation}
   * @throws {ApiServiceError} When API call fails
   */
  public static async getFeatures(): Promise<Feature[]> {
    try {
      const response = await fetch('/api/dashboard/features', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const error: any = new Error(`HTTP ${response.status}`);
        error.response = { data: errorData, status: response.status };
        throw error;
      }

      const data: ApiSuccessResponse<Feature[]> = await response.json();

      // Transform dates from strings to Date objects
      return data.data.map((feature) => ({
        ...feature,
        createdAt: new Date(feature.createdAt),
        updatedAt: new Date(feature.updatedAt),
      }));
    } catch (error) {
      throw ApiServiceError.fromError(error, 'fetching features');
    }
  }
}
```

### Key Characteristics

1. **'use client' directive**: Services are client-side only
2. **Static class methods**: No instantiation needed
3. **JSDoc comments**: Document purpose, parameters, and link to API routes
4. **Type safety**: Strong typing for parameters and return values
5. **Date transformation**: Convert date strings to Date objects
6. **Error handling**: Use `ApiServiceError` for consistent error handling

---

## Request/Response Flow

### 1. Making API Calls

Services use native `fetch` with consistent patterns:

```typescript
public static async getFeatures(): Promise<Feature[]> {
  try {
    const response = await fetch('/api/dashboard/features', {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const error: any = new Error(`HTTP ${response.status}`);
      error.response = { data: errorData, status: response.status };
      throw error;
    }

    const data: ApiSuccessResponse<Feature[]> = await response.json();

    // Transform and return data
    return data.data.map((feature) => ({
      ...feature,
      createdAt: new Date(feature.createdAt),
      updatedAt: new Date(feature.updatedAt),
    }));
  } catch (error) {
    throw ApiServiceError.fromError(error, 'fetching features');
  }
}
```

**Key patterns:**
- Always use `credentials: 'include'` for authentication
- Set proper headers (Content-Type: application/json)
- Check `response.ok` and throw structured errors
- Parse response data with proper typing
- Wrap in try-catch and use `ApiServiceError.fromError()`

### 2. Parameter Handling

**Use descriptive parameter objects:**

```typescript
// ✅ DO: Use named parameters with optional filters
public static async getUsers(
  by: { role?: string; guardianId?: string } = {}
): Promise<User[]> { }

// ✅ DO: Use required parameters for single resource
public static async getFeature(featureId: string): Promise<Feature> { }

// ❌ DON'T: Use positional parameters for multiple filters
public static async getUsers(role?: string, guardianId?: string): Promise<User[]> { }
```

### 3. URL Construction

```typescript
// Collection endpoints
const url = '/api/dashboard/features';

// Single resource endpoints
const url = `/api/dashboard/features/${featureId}`;

// Nested resources
const url = `/api/features/${featureId}/vote`;
```

### 4. Data Transformation

Always transform dates from strings to Date objects:

```typescript
// Single object
return {
  ...response.data.data,
  createdAt: new Date(response.data.data.createdAt),
  updatedAt: new Date(response.data.data.updatedAt),
};

// Array of objects
return response.data.data.map((item) => ({
  ...item,
  createdAt: new Date(item.createdAt),
  updatedAt: new Date(item.updatedAt),
}));
```

---

## Error Handling

**⚠️ IMPORTANT**: All service methods **MUST** use `ApiServiceError` for consistent error handling.

### ApiServiceError Overview

`ApiServiceError` is a unified error class that handles three types of errors:

1. **Validation Errors** (`VALIDATION`) - Zod schema validation failures
2. **API Errors** (`API_ERROR`) - Errors returned from API endpoints
3. **Network Errors** (`NETWORK`) - Network failures, timeouts, connection errors

### Basic Usage Pattern

**Always use `ApiServiceError.fromError()` in service methods:**

```typescript
import { ApiServiceError } from '@/lib/api/api-service-error';

public static async getFeatures(): Promise<Feature[]> {
  try {
    const response = await request({ method: 'GET', url: '/api/dashboard/features' });
    
    return response.data.data.map((feature) => ({
      ...feature,
      createdAt: new Date(feature.createdAt),
      updatedAt: new Date(feature.updatedAt),
    }));
  } catch (error) {
    // Automatically detects error type and creates appropriate ApiServiceError
    throw ApiServiceError.fromError(error, 'fetching features');
  }
}
```

### Error Handling in Components

```typescript
import { ApiServiceError } from '@/lib/api/api-service-error';

const createMutation = useMutation({
  mutationKey: mutationKeys.features.create,
  mutationFn: (data: FeatureCreateRequest) => FeatureService.createFeature(data),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.features.all() });
    toast.success('Feature created successfully');
  },
  onError: (error) => {
    if (error instanceof ApiServiceError) {
      // Use user-friendly message
      toast.error(error.userMessage);
      
      // Handle specific error conditions
      if (error.isAuthenticationError()) {
        toast.error('Please log in again');
      } else if (error.isAuthorizationError()) {
        toast.error("You don't have permission to create features");
      } else if (error.isNotFoundError()) {
        toast.error('Resource not found');
      } else if (error.isConflictError()) {
        toast.error('Resource already exists');
      }
    } else {
      // Fallback for unexpected errors
      toast.error('An unexpected error occurred');
    }
  },
});
```

### Helper Methods

**Error Type Checks:**
- `isValidationError(): boolean` - Check if validation error
- `isApiError(): boolean` - Check if API error
- `isNetworkError(): boolean` - Check if network error

**Error Condition Checks:**
- `isAuthenticationError(): boolean` - Check if authentication failed (401)
- `isAuthorizationError(): boolean` - Check if authorization failed (403)
- `isValidationFailure(): boolean` - Check if validation failed (400)
- `isNotFoundError(): boolean` - Check if resource not found (404)
- `isConflictError(): boolean` - Check if conflict occurred (409)

**Data Access:**
- `getErrorName(): string | null` - Get error name (for API errors)
- `getErrorContext(): unknown` - Get error context (for API errors)
- `getValidationIssues(): ValidationErrorDetails['issues'] | null` - Get validation issues
- `userMessage: string` - User-friendly error message (always available)

---

## Integration with React Query

Services are designed to work seamlessly with React Query (TanStack Query).

### Query Pattern

```typescript
// In component
import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/api/queryKeyFactory';
import FeatureService from '@/lib/api/features/service';

function FeaturesPage() {
  const { data: features, isLoading, error } = useQuery({
    queryKey: queryKeys.features.list(),
    queryFn: () => FeatureService.getFeatures()
  });

  // Use features (typed as Feature[])...
}
```

### Mutation Pattern

```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { mutationKeys, queryKeys } from '@/lib/api/queryKeyFactory';
import FeatureService from '@/lib/api/features/service';
import { ApiServiceError } from '@/lib/api/api-service-error';
import { toast } from 'sonner';

function CreateFeatureButton() {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationKey: mutationKeys.features.create,
    mutationFn: (data: FeatureCreateRequest) => FeatureService.createFeature(data),
    onSuccess: () => {
      // Invalidate queries to refetch
      queryClient.invalidateQueries({ queryKey: queryKeys.features.all() });
      toast.success('Feature created successfully!');
    },
    onError: (error) => {
      if (error instanceof ApiServiceError) {
        toast.error(error.userMessage);
        
        if (error.isAuthenticationError()) {
          router.push('/login');
        }
      } else {
        toast.error('An unexpected error occurred');
      }
    }
  });

  const handleCreate = () => {
    createMutation.mutate({ 
      title: 'New Feature',
      description: 'Feature description',
      status: 'planned'
    });
  };
}
```

### Query Keys

Query keys are managed centrally in `queryKeyFactory.ts`:

```typescript
export const queryKeys = {
  features: {
    all: () => ['features'] as const,
    lists: () => ['features', 'list'] as const,
    list: () => ['features', 'list'] as const,
    details: () => ['features', 'detail'] as const,
    detail: (id: string) => ['features', 'detail', id] as const,
  },
  // ... other resources
};
```

**Invalidation examples:**

```typescript
// Invalidate all features
queryClient.invalidateQueries({ queryKey: queryKeys.features.all() });

// Invalidate all feature lists (but not details)
queryClient.invalidateQueries({ queryKey: queryKeys.features.lists() });

// Invalidate a specific feature
queryClient.invalidateQueries({ queryKey: queryKeys.features.detail(id) });
```

---

## Creating New Services

Follow this step-by-step guide when adding a new resource:

### 1. Create Service File

```bash
# Create directory and file
mkdir -p src/lib/api/users
touch src/lib/api/users/service.ts
```

### 2. Define Types

Update `src/types/index.ts` with the resource types:

```typescript
export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserCreateRequest {
  name: string;
  email: string;
  role: string;
}

export interface UserUpdateRequest {
  name?: string;
  email?: string;
  role?: string;
}
```

### 3. Implement Service Class

```typescript
'use client';

import request from '@/lib/api/request';
import { ApiServiceError } from '@/lib/api/api-service-error';
import {
  User,
  UserCreateRequest,
  UserUpdateRequest,
  ApiSuccessResponse,
} from '@/types';

/**
 * UserService handles all user-related API calls
 * This service is client-side only and integrates with React Query
 */
export default class UserService {
  /**
   * Get all users
   * @see {@link file://./../../../app/api/users/route.ts API Route Implementation}
   */
  public static async getUsers(): Promise<User[]> {
    try {
      const response = await request<ApiSuccessResponse<User[]>>({
        method: 'GET',
        url: '/api/users',
      });

      return response.data.data.map((user) => ({
        ...user,
        createdAt: new Date(user.createdAt),
        updatedAt: new Date(user.updatedAt),
      }));
    } catch (error) {
      throw ApiServiceError.fromError(error, 'fetching users');
    }
  }

  /**
   * Get a single user by ID
   */
  public static async getUser(userId: string): Promise<User> {
    try {
      const response = await request<ApiSuccessResponse<User>>({
        method: 'GET',
        url: `/api/users/${userId}`,
      });

      return {
        ...response.data.data,
        createdAt: new Date(response.data.data.createdAt),
        updatedAt: new Date(response.data.data.updatedAt),
      };
    } catch (error) {
      throw ApiServiceError.fromError(error, 'fetching user');
    }
  }

  /**
   * Create a new user
   */
  public static async createUser(data: UserCreateRequest): Promise<User> {
    try {
      const response = await request<ApiSuccessResponse<User>>({
        method: 'POST',
        url: '/api/users',
        data,
      });

      return {
        ...response.data.data,
        createdAt: new Date(response.data.data.createdAt),
        updatedAt: new Date(response.data.data.updatedAt),
      };
    } catch (error) {
      throw ApiServiceError.fromError(error, 'creating user');
    }
  }

  /**
   * Update a user
   */
  public static async updateUser(userId: string, data: UserUpdateRequest): Promise<User> {
    try {
      const response = await request<ApiSuccessResponse<User>>({
        method: 'PUT',
        url: `/api/users/${userId}`,
        data,
      });

      return {
        ...response.data.data,
        createdAt: new Date(response.data.data.createdAt),
        updatedAt: new Date(response.data.data.updatedAt),
      };
    } catch (error) {
      throw ApiServiceError.fromError(error, 'updating user');
    }
  }

  /**
   * Delete a user by ID
   */
  public static async deleteUser(userId: string): Promise<void> {
    try {
      await request({
        method: 'DELETE',
        url: `/api/users/${userId}`,
      });
    } catch (error) {
      throw ApiServiceError.fromError(error, 'deleting user');
    }
  }
}
```

### 4. Add Query Keys

Update `@/lib/api/queryKeyFactory.ts`:

```typescript
export const queryKeys = {
  users: {
    all: () => ['users'] as const,
    lists: () => ['users', 'list'] as const,
    list: () => ['users', 'list'] as const,
    details: () => ['users', 'detail'] as const,
    detail: (id: string) => ['users', 'detail', id] as const,
  },
  // ... other resources
};

export const mutationKeys = {
  users: {
    create: ['users', 'create'] as const,
    update: ['users', 'update'] as const,
    delete: ['users', 'delete'] as const,
  },
  // ... other resources
};
```

---

## Best Practices

### ✅ DO

1. **Always use 'use client' directive**
   ```typescript
   'use client';

   import request from "@/lib/api/request";
   // ...
   ```

2. **Use static methods**
   ```typescript
   export default class FeatureService {
     public static async getFeatures(): Promise<Feature[]> { }
   }
   ```

3. **Transform dates from strings to Date objects**
   ```typescript
   return response.data.data.map((item) => ({
     ...item,
     createdAt: new Date(item.createdAt),
     updatedAt: new Date(item.updatedAt),
   }));
   ```

4. **Use descriptive JSDoc comments**
   ```typescript
   /**
    * Get all features
    * @see {@link file://./../../../app/api/dashboard/features/route.ts API Route Implementation}
    * @throws {ApiServiceError} When API call fails
    */
   ```

5. **Always use ApiServiceError for error handling**
   ```typescript
   try {
     // ... API call
   } catch (error) {
     throw ApiServiceError.fromError(error, 'fetching features');
   }
   ```

6. **Use typed parameters and return values**
   ```typescript
   public static async createFeature(data: FeatureCreateRequest): Promise<Feature> { }
   ```

7. **Use consistent fetch patterns**
   ```typescript
   const response = await fetch('/api/dashboard/features', {
     method: 'GET',
     credentials: 'include',
     headers: { 'Content-Type': 'application/json' },
   });
   
   if (!response.ok) {
     const errorData = await response.json().catch(() => ({}));
     const error: any = new Error(`HTTP ${response.status}`);
     error.response = { data: errorData, status: response.status };
     throw error;
   }
   ```

### ❌ DON'T

1. **Don't instantiate service classes**
   ```typescript
   // BAD: Creating instances
   const featureService = new FeatureService();
   featureService.getFeatures();

   // GOOD: Use static methods
   FeatureService.getFeatures();
   ```

2. **Don't skip date transformation**
   ```typescript
   // BAD: Returning raw response with string dates
   return response.data.data;

   // GOOD: Transform dates
   return response.data.data.map((item) => ({
     ...item,
     createdAt: new Date(item.createdAt),
   }));
   ```

3. **Don't call API endpoints directly in components**
   ```typescript
   // BAD: Direct fetch in component
   useEffect(() => {
     fetch('/api/features').then(res => res.json());
   }, []);

   // GOOD: Use service with React Query
   const { data } = useQuery({
     queryKey: queryKeys.features.list(),
     queryFn: () => FeatureService.getFeatures()
   });
   ```

4. **Don't call API endpoints from components**
   ```typescript
   // BAD: Direct API call in component
   useEffect(() => {
     fetch('/api/features').then(res => res.json());
   }, []);

   // GOOD: Use service with React Query
   const { data } = useQuery({
     queryKey: queryKeys.features.list(),
     queryFn: () => FeatureService.getFeatures()
   });
   ```

5. **Don't ignore TypeScript types**
   ```typescript
   // BAD: Using any
   public static async getFeatures(): Promise<any> { }

   // GOOD: Proper typing
   public static async getFeatures(): Promise<Feature[]> { }
   ```

6. **Don't hardcode error messages or manually handle errors**
   ```typescript
   // BAD: Manual error handling
   catch (error) {
     throw new Error('Failed to fetch features');
   }

   // GOOD: Use ApiServiceError
   catch (error) {
     throw ApiServiceError.fromError(error, 'fetching features');
   }
   ```

---

## Complete Example

See the following files for complete reference implementations:

- **Features Service**: [`src/lib/api/features/service.ts`](./features/service.ts)
- **Votes Service**: [`src/lib/api/votes/service.ts`](./votes/service.ts)
- **Features Page**: [`src/app/dashboard/features/page.tsx`](../../app/dashboard/features/page.tsx)

---

## Quick Reference Checklist

When creating a new service:

- [ ] Create service file in `src/lib/api/[resource]/service.ts`
- [ ] Add `'use client'` directive at the top
- [ ] Import types and `ApiServiceError`
- [ ] Create service class with descriptive name
- [ ] Implement static methods for each operation
- [ ] Use native `fetch` with consistent error handling pattern
- [ ] Add JSDoc comments with `@see` tags linking to API routes
- [ ] Transform date strings to Date objects
- [ ] Wrap all operations in try-catch and use `ApiServiceError.fromError()`
- [ ] Use typed parameters and return values
- [ ] Add query keys to `@/lib/api/queryKeyFactory.ts`
- [ ] Add mutation keys to `@/lib/api/queryKeyFactory.ts`
- [ ] Test with React Query in components

---

## Additional Resources

- **Type Definitions**: [`@/types/index.ts`](../../types/index.ts)
- **Error Class**: [`@/lib/api/api-service-error.ts`](./api-service-error.ts)
- **Query Client**: [`@/lib/api/queryClient.ts`](./queryClient.ts)
- **Query Keys**: [`@/lib/api/queryKeyFactory.ts`](./queryKeyFactory.ts)
- **Features Service**: [`@/lib/api/features/service.ts`](./features/service.ts)
- **Votes Service**: [`@/lib/api/votes/service.ts`](./votes/service.ts)

---

**This README is designed for both human developers and AI code generators (like Claude). Always follow these patterns when implementing or modifying service classes.**
