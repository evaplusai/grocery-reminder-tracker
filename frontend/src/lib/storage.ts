import type { GroceryItem } from '@/types/item';
import type { StoreId } from '@/types/store';
import type { User } from '@/types/auth';
import { createGroceryItem } from './items';

const STORAGE_KEY = 'grocery-tracker-items';
const USERS_KEY = 'grocery-tracker-users';

export function getStoredItems(): GroceryItem[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    
    const items = JSON.parse(stored);
    return items.map((item: any) => ({
      ...item,
      createdAt: new Date(item.createdAt),
      updatedAt: new Date(item.updatedAt)
    }));
  } catch (error) {
    console.error('Error loading stored items:', error);
    return [];
  }
}

export function storeItems(items: GroceryItem[]): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch (error) {
    console.error('Error storing items:', error);
  }
}

export function getItemsByStore(storeId: StoreId): GroceryItem[] {
  const allItems = getStoredItems();
  return allItems.filter(item => item.storeId === storeId);
}

export function addItem(name: string, storeId: StoreId, quantity?: string): GroceryItem {
  const allItems = getStoredItems();
  const newItem = createGroceryItem(name, storeId, quantity);
  const updatedItems = [...allItems, newItem];
  storeItems(updatedItems);
  return newItem;
}

export function updateItem(id: string, updates: { name?: string; quantity?: string; completed?: boolean }): GroceryItem | null {
  const allItems = getStoredItems();
  const itemIndex = allItems.findIndex(item => item.id === id);
  
  if (itemIndex === -1) return null;
  
  const updatedItem = {
    ...allItems[itemIndex],
    ...updates,
    updatedAt: new Date()
  };
  
  const updatedItems = [...allItems];
  updatedItems[itemIndex] = updatedItem;
  storeItems(updatedItems);
  
  return updatedItem;
}

export function removeItem(id: string): boolean {
  const allItems = getStoredItems();
  const filteredItems = allItems.filter(item => item.id !== id);
  
  if (filteredItems.length === allItems.length) return false;
  
  storeItems(filteredItems);
  return true;
}

// Authentication functions for localStorage fallback
export function getStoredUsers(): User[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const stored = localStorage.getItem(USERS_KEY);
    if (!stored) return [];
    
    const users = JSON.parse(stored);
    return users.map((user: any) => ({
      ...user,
      createdAt: new Date(user.createdAt),
      updatedAt: user.updatedAt ? new Date(user.updatedAt) : new Date()
    }));
  } catch (error) {
    console.error('Error loading stored users:', error);
    return [];
  }
}

export function storeUsers(users: User[]): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  } catch (error) {
    console.error('Error storing users:', error);
  }
}

export function createUser(email: string, password: string, name?: string): User {
  // Allow hardcoded test user creation
  if (email === "test@test.com" && password === "password") {
    return {
      id: 1,
      email: "test@test.com",
      name: name || "Test User", 
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }
  
  const existingUsers = getStoredUsers();
  
  // Check if user already exists
  if (existingUsers.find(user => user.email === email)) {
    throw new Error('User already exists');
  }
  
  const newUser: User = {
    id: Date.now(), // Simple ID generation for demo
    email,
    name,
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  const updatedUsers = [...existingUsers, newUser];
  storeUsers(updatedUsers);
  
  return newUser;
}

export function authenticateUser(email: string, password: string): User | null {
  // Hardcoded test credentials for easy testing
  if (email === "test@test.com" && password === "password") {
    return {
      id: 1,
      email: "test@test.com", 
      name: "Test User",
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }
  
  const users = getStoredUsers();
  return users.find(user => user.email === email) || null;
}