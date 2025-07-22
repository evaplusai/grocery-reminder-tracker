'use client';

import { useState, useEffect } from 'react';
import StoreNavigation from '@/components/StoreNavigation';
import StoreView from '@/components/StoreView';
import AuthForm from '@/components/AuthForm';
import { StoreId, STORES } from '@/types/store';
import { GroceryItem } from '@/types/item';
import { User } from '@/types/auth';
import { fetchItems, createItem, updateItem, deleteItem, logout } from '@/lib/api';
import { getCurrentUser, setCurrentUser, clearCurrentUser } from '@/lib/auth-storage';

export default function Home() {
  const [activeStore, setActiveStore] = useState<StoreId>('shoprite');
  const [items, setItems] = useState<GroceryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [authChecked, setAuthChecked] = useState(false);

  // Get items for the current store
  const currentStoreItems = items.filter(item => item.storeId === activeStore);

  // Check for existing user session on mount
  useEffect(() => {
    const existingUser = getCurrentUser();
    if (existingUser) {
      setUser(existingUser);
    }
    setAuthChecked(true);
  }, []);

  // Load items when store changes or user changes
  useEffect(() => {
    if (user && authChecked) {
      loadItems(activeStore);
    } else if (authChecked && !user) {
      setLoading(false);
    }
  }, [activeStore, user, authChecked]);

  const loadItems = async (storeId: StoreId) => {
    try {
      setLoading(true);
      setError(null);
      const storeItems = await fetchItems(storeId);
      setItems(prev => [
        ...prev.filter(item => item.storeId !== storeId), // Remove old items for this store
        ...storeItems // Add fresh items from API
      ]);
    } catch (err) {
      setError('Failed to load items');
      console.error('Load items error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = async (name: string, quantity?: string) => {
    try {
      const newItem = await createItem(name, activeStore, quantity);
      setItems(prev => [...prev, newItem]);
    } catch (err) {
      setError('Failed to add item');
      console.error('Add item error:', err);
    }
  };

  const handleToggleComplete = async (itemId: string) => {
    const item = items.find(i => i.id === itemId);
    if (!item) return;

    try {
      const updatedItem = await updateItem(itemId, { completed: !item.completed });
      setItems(prev => 
        prev.map(item => 
          item.id === itemId ? updatedItem : item
        )
      );
    } catch (err) {
      setError('Failed to update item');
      console.error('Toggle complete error:', err);
    }
  };

  const handleEditItem = async (itemId: string, name: string, quantity?: string) => {
    try {
      const updatedItem = await updateItem(itemId, { name, quantity });
      setItems(prev => 
        prev.map(item => 
          item.id === itemId ? updatedItem : item
        )
      );
    } catch (err) {
      setError('Failed to edit item');
      console.error('Edit item error:', err);
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    try {
      await deleteItem(itemId);
      setItems(prev => prev.filter(item => item.id !== itemId));
    } catch (err) {
      setError('Failed to delete item');
      console.error('Delete item error:', err);
    }
  };

  const handleAuthSuccess = (authUser: User, token: string) => {
    setUser(authUser);
    setCurrentUser(authUser);
    setError(null);
    // Token would be stored for API calls in a real implementation
  };

  const handleAuthError = (errorMessage: string) => {
    setError(errorMessage);
  };

  const handleLogout = () => {
    logout(); // Clear API token
    setUser(null);
    clearCurrentUser(); // Clear localStorage user
    setItems([]);
    setError(null);
  };

  // Show loading while checking auth
  if (!authChecked) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  // Show auth form if not logged in
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 py-8">
          <header className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
              🛒 Grocery Reminder Tracker
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Voice-powered shopping lists that remember what you need
            </p>
          </header>

          <main className="max-w-md mx-auto">
            {error && (
              <div className="mb-4 bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-700 text-red-800 dark:text-red-200 px-4 py-3 rounded-lg">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {error}
                </div>
              </div>
            )}
            
            <AuthForm onAuthSuccess={handleAuthSuccess} onError={handleAuthError} />
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-8">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                🛒 Grocery Reminder Tracker
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-300">
                Welcome back, {user.name || user.email}!
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors"
            >
              Logout
            </button>
          </div>
        </header>

        <main className="max-w-2xl mx-auto">
          <StoreNavigation 
            activeStore={activeStore} 
            onStoreChange={setActiveStore}
          />
          
          {error && (
            <div className="mb-4 bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-700 text-red-800 dark:text-red-200 px-4 py-3 rounded-lg">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {error}
              </div>
            </div>
          )}
          
          <StoreView 
            store={STORES[activeStore]}
            items={currentStoreItems}
            onAddItem={handleAddItem}
            onToggleComplete={handleToggleComplete}
            onEditItem={handleEditItem}
            onDeleteItem={handleDeleteItem}
            loading={loading}
          />
        </main>
      </div>
    </div>
  );
}
