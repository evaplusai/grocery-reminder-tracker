'use client';

import { useState } from 'react';
import StoreNavigation from '@/components/StoreNavigation';
import StoreView from '@/components/StoreView';
import { StoreId, STORES } from '@/types/store';
import { GroceryItem } from '@/types/item';
import { createGroceryItem } from '@/lib/items';

export default function Home() {
  const [activeStore, setActiveStore] = useState<StoreId>('shoprite');
  const [items, setItems] = useState<GroceryItem[]>([]);

  // Get items for the current store
  const currentStoreItems = items.filter(item => item.storeId === activeStore);

  const handleAddItem = (name: string, quantity?: string) => {
    const newItem = createGroceryItem(name, activeStore, quantity);
    setItems(prev => [...prev, newItem]);
  };

  const handleToggleComplete = (itemId: string) => {
    setItems(prev => 
      prev.map(item => 
        item.id === itemId 
          ? { ...item, completed: !item.completed, updatedAt: new Date() }
          : item
      )
    );
  };

  const handleEditItem = (itemId: string, name: string, quantity?: string) => {
    setItems(prev => 
      prev.map(item => 
        item.id === itemId 
          ? { ...item, name, quantity, updatedAt: new Date() }
          : item
      )
    );
  };

  const handleDeleteItem = (itemId: string) => {
    setItems(prev => prev.filter(item => item.id !== itemId));
  };

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

        <main className="max-w-2xl mx-auto">
          <StoreNavigation 
            activeStore={activeStore} 
            onStoreChange={setActiveStore}
          />
          
          <StoreView 
            store={STORES[activeStore]}
            items={currentStoreItems}
            onAddItem={handleAddItem}
            onToggleComplete={handleToggleComplete}
            onEditItem={handleEditItem}
            onDeleteItem={handleDeleteItem}
          />
        </main>
      </div>
    </div>
  );
}
