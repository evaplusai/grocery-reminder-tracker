import type { GroceryItem } from '@/types/item';
import type { StoreId } from '@/types/store';

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

export async function fetchItems(storeId: StoreId): Promise<GroceryItem[]> {
  try {
    const response = await fetchWithError(`${API_BASE}/items?storeId=${storeId}`);
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch items:', error);
    throw error;
  }
}

export async function createItem(
  name: string,
  storeId: StoreId,
  quantity?: string
): Promise<GroceryItem> {
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
    console.error('Failed to create item:', error);
    throw error;
  }
}

export async function updateItem(
  id: string,
  updates: { name?: string; quantity?: string; completed?: boolean }
): Promise<GroceryItem> {
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
    console.error('Failed to update item:', error);
    throw error;
  }
}

export async function deleteItem(id: string): Promise<void> {
  try {
    await fetchWithError(`${API_BASE}/items/${id}`, {
      method: 'DELETE',
    });
  } catch (error) {
    console.error('Failed to delete item:', error);
    throw error;
  }
}