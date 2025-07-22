import type { StoreId } from './store';

export type ItemId = string;

export interface GroceryItem {
  id: ItemId;
  name: string;
  quantity?: string;
  completed: boolean;
  storeId: StoreId;
  createdAt: Date;
  updatedAt: Date;
}