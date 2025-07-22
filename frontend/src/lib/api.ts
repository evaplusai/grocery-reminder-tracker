import type { GroceryItem } from '@/types/item';
import type { StoreId } from '@/types/store';
import { User, AuthResponse, LoginRequest, RegisterRequest } from '@/types/auth';
import * as storage from './storage';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function fetchWithError(url: string, options?: RequestInit) {
  const response = await fetch(url, options);
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
    throw new ApiError(errorData.detail || errorData.error || 'Request failed', response.status);
  }
  
  return response;
}

// Check if backend is available
async function isBackendAvailable(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE}/health`, { method: 'GET' });
    return response.ok;
  } catch {
    return false;
  }
}

// Get auth token from localStorage
function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('auth-token');
}

// Store auth token
function setAuthToken(token: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('auth-token', token);
}

// Clear auth token
function clearAuthToken(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('auth-token');
}

// Authentication functions
export async function login(credentials: LoginRequest): Promise<AuthResponse> {
  const backendAvailable = await isBackendAvailable();
  
  if (!backendAvailable) {
    // Fallback to localStorage auth
    const user = await storage.authenticateUser(credentials.email, credentials.password);
    if (!user) {
      throw new ApiError('Invalid email or password', 401);
    }
    const token = 'fake-jwt-token';
    setAuthToken(token);
    return { user, token };
  }

  try {
    const response = await fetchWithError(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    const data = await response.json();
    setAuthToken(data.access_token);
    return { user: data.user, token: data.access_token };
  } catch (error) {
    console.error('Backend login failed, falling back to localStorage');
    const user = await storage.authenticateUser(credentials.email, credentials.password);
    if (!user) {
      throw new ApiError('Invalid email or password', 401);
    }
    const token = 'fake-jwt-token';
    setAuthToken(token);
    return { user, token };
  }
}

export async function register(userData: RegisterRequest): Promise<AuthResponse> {
  const backendAvailable = await isBackendAvailable();
  
  if (!backendAvailable) {
    // Fallback to localStorage auth
    try {
      const user = await storage.createUser(userData.email, userData.password, userData.name);
      const token = 'fake-jwt-token';
      setAuthToken(token);
      return { user, token };
    } catch (error) {
      throw new ApiError('User already exists', 409);
    }
  }

  try {
    const response = await fetchWithError(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    const data = await response.json();
    setAuthToken(data.access_token);
    return { user: data.user, token: data.access_token };
  } catch (error) {
    console.error('Backend register failed, falling back to localStorage');
    try {
      const user = await storage.createUser(userData.email, userData.password, userData.name);
      const token = 'fake-jwt-token';
      setAuthToken(token);
      return { user, token };
    } catch (storageError) {
      throw new ApiError('User already exists', 409);
    }
  }
}

export function logout(): void {
  clearAuthToken();
}

export async function fetchItems(storeId: StoreId): Promise<GroceryItem[]> {
  const backendAvailable = await isBackendAvailable();
  const token = getAuthToken();
  
  if (!backendAvailable || !token) {
    // Fallback to localStorage
    await new Promise(resolve => setTimeout(resolve, 200));
    return storage.getItemsByStore(storeId);
  }
  
  try {
    const response = await fetchWithError(`${API_BASE}/stores/${storeId}/items`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    const data = await response.json();
    return data.items.map((item: any) => ({
      ...item,
      storeId: item.store_id,
      createdAt: new Date(item.created_at),
      updatedAt: new Date(item.updated_at || item.created_at)
    }));
  } catch (error) {
    console.error('Failed to fetch items, falling back to localStorage:', error);
    return storage.getItemsByStore(storeId);
  }
}

export async function createItem(
  name: string,
  storeId: StoreId,
  quantity?: string
): Promise<GroceryItem> {
  const backendAvailable = await isBackendAvailable();
  const token = getAuthToken();
  
  if (!backendAvailable || !token) {
    await new Promise(resolve => setTimeout(resolve, 100));
    return storage.addItem(name, storeId, quantity);
  }
  
  try {
    const response = await fetchWithError(`${API_BASE}/stores/${storeId}/items`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ name, quantity }),
    });
    const item = await response.json();
    return {
      ...item,
      storeId: item.store_id,
      createdAt: new Date(item.created_at),
      updatedAt: new Date(item.updated_at || item.created_at)
    };
  } catch (error) {
    console.error('Failed to create item, falling back to localStorage:', error);
    return storage.addItem(name, storeId, quantity);
  }
}

export async function updateItem(
  id: string,
  updates: { name?: string; quantity?: string; completed?: boolean }
): Promise<GroceryItem> {
  const backendAvailable = await isBackendAvailable();
  const token = getAuthToken();
  
  if (!backendAvailable || !token) {
    await new Promise(resolve => setTimeout(resolve, 100));
    const item = storage.updateItem(id, updates);
    if (!item) {
      throw new ApiError('Item not found', 404);
    }
    return item;
  }
  
  try {
    const response = await fetchWithError(`${API_BASE}/items/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(updates),
    });
    const item = await response.json();
    return {
      ...item,
      storeId: item.store_id,
      createdAt: new Date(item.created_at),
      updatedAt: new Date(item.updated_at || item.created_at)
    };
  } catch (error) {
    console.error('Failed to update item, falling back to localStorage:', error);
    const item = storage.updateItem(id, updates);
    if (!item) {
      throw new ApiError('Item not found', 404);
    }
    return item;
  }
}

export async function deleteItem(id: string): Promise<void> {
  const backendAvailable = await isBackendAvailable();
  const token = getAuthToken();
  
  if (!backendAvailable || !token) {
    await new Promise(resolve => setTimeout(resolve, 100));
    const success = storage.removeItem(id);
    if (!success) {
      throw new ApiError('Item not found', 404);
    }
    return;
  }
  
  try {
    await fetchWithError(`${API_BASE}/items/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  } catch (error) {
    console.error('Failed to delete item, falling back to localStorage:', error);
    const success = storage.removeItem(id);
    if (!success) {
      throw new ApiError('Item not found', 404);
    }
  }
}