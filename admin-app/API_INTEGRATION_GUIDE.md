# 🔌 API Integration Guide

This guide will help you integrate the backend API endpoints into the admin app.

## 📋 Quick Integration Checklist

When you receive API endpoints, follow these steps:

### 1. Update API Configuration

Edit `src/config/api.config.ts` and update the endpoints:

```typescript
export const API_ENDPOINTS = {
  ADMIN_AUTH: {
    LOGIN: '/admin/auth/login',  // Update if different
    // ...
  },
  // ... other endpoints
};
```

### 2. Update Type Definitions

Add/update types in `src/types/api.types.ts`:

```typescript
export interface User {
  id: string;
  email: string;
  fullName: string;
  // ... other fields
}

export interface CreateUserRequest {
  email: string;
  fullName: string;
  // ... other fields
}
```

### 3. Create Service Methods

Add service methods in `src/services/api/user.service.ts`:

```typescript
import { api } from './client';
import { API_ENDPOINTS } from '@/config/api.config';

class UserService {
  async getAllUsers(params: PaginationParams): Promise<ApiResponse<PaginatedResponse<User>>> {
    return api.get(API_ENDPOINTS.ADMIN_USERS.LIST, { params });
  }
  
  async getUserById(id: string): Promise<ApiResponse<User>> {
    return api.get(API_ENDPOINTS.ADMIN_USERS.DETAILS(id));
  }
  
  async createUser(data: CreateUserRequest): Promise<ApiResponse<User>> {
    return api.post(API_ENDPOINTS.ADMIN_USERS.CREATE, data);
  }
  
  async updateUser(id: string, data: UpdateUserRequest): Promise<ApiResponse<User>> {
    return api.patch(API_ENDPOINTS.ADMIN_USERS.UPDATE(id), data);
  }
  
  async deleteUser(id: string): Promise<ApiResponse<void>> {
    return api.delete(API_ENDPOINTS.ADMIN_USERS.DELETE(id));
  }
}

export const userService = new UserService();
```

### 4. Create React Query Hooks

Create `src/hooks/useUsers.ts`:

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userService } from '@/services/api/user.service';
import { PaginationParams } from '@/types/api.types';

export function useUsers(params: PaginationParams) {
  return useQuery({
    queryKey: ['users', params],
    queryFn: () => userService.getAllUsers(params),
  });
}

export function useUser(id: string) {
  return useQuery({
    queryKey: ['users', id],
    queryFn: () => userService.getUserById(id),
    enabled: !!id,
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: userService.createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUserRequest }) =>
      userService.updateUser(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['users', variables.id] });
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: userService.deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}
```

### 5. Update Login Page

Replace mock login in `src/pages/auth/Login.tsx`:

```typescript
import { authService } from '@/services/api/auth.service';

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsLoading(true);

  try {
    const response = await authService.login({ email, password });
    
    if (response.success) {
      login(
        response.data.user,
        response.data.accessToken,
        response.data.refreshToken
      );
      toast.success('Login successful!');
      navigate(ROUTES.DASHBOARD);
    }
  } catch (error: any) {
    toast.error(error.message || 'Login failed. Please try again.');
  } finally {
    setIsLoading(false);
  }
};
```

## 📝 Service Template

Use this template for creating new services:

```typescript
import { api } from './client';
import { API_ENDPOINTS } from '@/config/api.config';
import { ApiResponse, PaginatedResponse, PaginationParams } from '@/types/api.types';

class EntityService {
  async getAll(params: PaginationParams): Promise<ApiResponse<PaginatedResponse<Entity>>> {
    return api.get(API_ENDPOINTS.ADMIN_ENTITY.LIST, { params });
  }
  
  async getById(id: string): Promise<ApiResponse<Entity>> {
    return api.get(API_ENDPOINTS.ADMIN_ENTITY.DETAILS(id));
  }
  
  async create(data: CreateEntityRequest): Promise<ApiResponse<Entity>> {
    return api.post(API_ENDPOINTS.ADMIN_ENTITY.CREATE, data);
  }
  
  async update(id: string, data: UpdateEntityRequest): Promise<ApiResponse<Entity>> {
    return api.patch(API_ENDPOINTS.ADMIN_ENTITY.UPDATE(id), data);
  }
  
  async delete(id: string): Promise<ApiResponse<void>> {
    return api.delete(API_ENDPOINTS.ADMIN_ENTITY.DELETE(id));
  }
}

export const entityService = new EntityService();
```

## 🔄 React Query Pattern

Always use this pattern for mutations:

```typescript
const mutation = useMutation({
  mutationFn: service.method,
  onSuccess: () => {
    // Invalidate related queries
    queryClient.invalidateQueries({ queryKey: ['entity'] });
    // Show success toast
    toast.success('Operation successful!');
  },
  onError: (error) => {
    // Show error toast
    toast.error(error.message || 'Operation failed');
  },
});
```

## 🎯 Error Handling

The API client automatically handles:
- ✅ Token refresh on 401
- ✅ Network errors
- ✅ Server errors
- ✅ Error logging (dev mode)

You just need to:
- Catch errors in try/catch
- Show user-friendly messages with toast
- Handle loading states

## 📦 File Upload

For file uploads (videos, images):

```typescript
const formData = new FormData();
formData.append('file', file);
formData.append('title', title);

const response = await api.upload('/admin/videos', formData, (progress) => {
  // Handle upload progress
  console.log('Upload progress:', progress);
});
```

---

**Ready to integrate!** Just follow these patterns when you receive the API endpoints.
