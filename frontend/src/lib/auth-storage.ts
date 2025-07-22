// Simple auth storage for development (fallback when no database)
import type { User } from '@/types/auth';
import { hashPassword, comparePassword } from './auth';

const USERS_KEY = 'grocery-tracker-users';
const CURRENT_USER_KEY = 'grocery-tracker-current-user';

interface StoredUser {
  id: number;
  email: string;
  name?: string;
  passwordHash: string;
  createdAt: string;
  updatedAt: string;
}

function getStoredUsers(): StoredUser[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const stored = localStorage.getItem(USERS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error loading stored users:', error);
    return [];
  }
}

function storeUsers(users: StoredUser[]): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  } catch (error) {
    console.error('Error storing users:', error);
  }
}

export async function createUser(email: string, password: string, name?: string): Promise<User> {
  const users = getStoredUsers();
  
  // Check if user already exists
  const existingUser = users.find(u => u.email === email);
  if (existingUser) {
    throw new Error('User already exists');
  }
  
  const now = new Date().toISOString();
  const passwordHash = await hashPassword(password);
  const newUser: StoredUser = {
    id: users.length + 1,
    email,
    name,
    passwordHash,
    createdAt: now,
    updatedAt: now
  };
  
  const updatedUsers = [...users, newUser];
  storeUsers(updatedUsers);
  
  return {
    id: newUser.id,
    email: newUser.email,
    name: newUser.name,
    createdAt: new Date(newUser.createdAt),
    updatedAt: new Date(newUser.updatedAt)
  };
}

export async function authenticateUser(email: string, password: string): Promise<User | null> {
  const users = getStoredUsers();
  const user = users.find(u => u.email === email);
  
  if (!user) return null;
  
  const isValid = await comparePassword(password, user.passwordHash);
  if (!isValid) return null;
  
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    createdAt: new Date(user.createdAt),
    updatedAt: new Date(user.updatedAt)
  };
}

export function getUserById(id: number): User | null {
  const users = getStoredUsers();
  const user = users.find(u => u.id === id);
  
  if (!user) return null;
  
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    createdAt: new Date(user.createdAt),
    updatedAt: new Date(user.updatedAt)
  };
}

export function setCurrentUser(user: User): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  } catch (error) {
    console.error('Error storing current user:', error);
  }
}

export function getCurrentUser(): User | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const stored = localStorage.getItem(CURRENT_USER_KEY);
    if (!stored) return null;
    
    const user = JSON.parse(stored);
    return {
      ...user,
      createdAt: new Date(user.createdAt),
      updatedAt: new Date(user.updatedAt)
    };
  } catch (error) {
    console.error('Error loading current user:', error);
    return null;
  }
}

export function clearCurrentUser(): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.removeItem(CURRENT_USER_KEY);
  } catch (error) {
    console.error('Error clearing current user:', error);
  }
}