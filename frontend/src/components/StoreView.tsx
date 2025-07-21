'use client';

import { Store } from '@/types/store';

interface StoreViewProps {
  store: Store;
}

export default function StoreView({ store }: StoreViewProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <div className="text-center">
        <div className="text-6xl mb-4">{store.icon}</div>
        <h2 className={`text-2xl font-semibold mb-2 ${store.color}`}>
          {store.name}
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          {store.description}
        </p>
        
        <div className="space-y-4">
          <div className="text-gray-500 dark:text-gray-400">
            Your shopping list is empty
          </div>
          
          <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8">
            <div className="text-4xl mb-2">📝</div>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              No items yet
            </p>
            <p className="text-sm text-gray-400 dark:text-gray-500">
              Items you add will appear here
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}