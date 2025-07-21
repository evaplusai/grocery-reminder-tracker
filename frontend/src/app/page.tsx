'use client';

import { useState } from 'react';
import StoreNavigation from '@/components/StoreNavigation';
import StoreView from '@/components/StoreView';
import { StoreId, STORES } from '@/types/store';

export default function Home() {
  const [activeStore, setActiveStore] = useState<StoreId>('shoprite');

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
          
          <StoreView store={STORES[activeStore]} />
        </main>
      </div>
    </div>
  );
}
