import type { GroceryItem, ItemId } from '@/types/item';
import type { StoreId } from '@/types/store';

export function generateItemId(): ItemId {
  return `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function createGroceryItem(
  name: string,
  storeId: StoreId,
  quantity?: string
): GroceryItem {
  const now = new Date();
  
  return {
    id: generateItemId(),
    name,
    quantity,
    completed: false,
    storeId,
    createdAt: now,
    updatedAt: now
  };
}