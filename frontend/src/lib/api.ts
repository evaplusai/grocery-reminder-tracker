import type { GroceryItem } from '@/types/item';
import type { StoreId } from '@/types/store';
import * as storage from './storage';

const API_BASE = '/api';

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
    const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new ApiError(errorData.error || 'Request failed', response.status);
  }
  
  return response;
}

// Check if we have database connection
function hasDatabaseConnection(): boolean {
  return Boolean(process.env.POSTGRES_URL);
}

export async function fetchItems(storeId: StoreId): Promise<GroceryItem[]> {
  // Fallback to localStorage if no database
  if (!hasDatabaseConnection()) {
    // Simulate network delay for consistent UX
    await new Promise(resolve => setTimeout(resolve, 200));
    return storage.getItemsByStore(storeId);
  }
  
  try {
    const response = await fetchWithError(`${API_BASE}/items?storeId=${storeId}`);
    return await response.json();
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
  // Fallback to localStorage if no database
  if (!hasDatabaseConnection()) {
    await new Promise(resolve => setTimeout(resolve, 100));
    return storage.addItem(name, storeId, quantity);
  }
  
  try {
    const response = await fetchWithError(`${API_BASE}/items`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name,
        storeId,
        quantity
      }),
    });
    return await response.json();
  } catch (error) {
    console.error('Failed to create item, falling back to localStorage:', error);
    return storage.addItem(name, storeId, quantity);
  }
}

export async function updateItem(
  id: string,
  updates: { name?: string; quantity?: string; completed?: boolean }
): Promise<GroceryItem> {
  // Fallback to localStorage if no database
  if (!hasDatabaseConnection()) {
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
      },
      body: JSON.stringify(updates),
    });
    return await response.json();
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
  // Fallback to localStorage if no database
  if (!hasDatabaseConnection()) {
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
    });
  } catch (error) {
    console.error('Failed to delete item, falling back to localStorage:', error);
    const success = storage.removeItem(id);
    if (!success) {
      throw new ApiError('Item not found', 404);
    }
  }
}