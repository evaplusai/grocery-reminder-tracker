'use client';

import { StoreId, STORES } from '@/types/store';

interface StoreNavigationProps {
  activeStore: StoreId;
  onStoreChange: (storeId: StoreId) => void;
}

export default function StoreNavigation({ activeStore, onStoreChange }: StoreNavigationProps) {
  return (
    <div className="mb-6">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
        {Object.values(STORES).map((store) => {
          const isActive = activeStore === store.id;
          
          return (
            <button
              key={store.id}
              onClick={() => onStoreChange(store.id)}
              className={`
                p-3 rounded-lg border-2 transition-all duration-200 text-center
                ${isActive 
                  ? `${store.bgColor} border-current ${store.color} shadow-md scale-105` 
                  : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 text-gray-700 dark:text-gray-300'
                }
              `}
            >
              <div className="text-2xl mb-1">{store.icon}</div>
              <div className="text-sm font-medium truncate">
                {store.name}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}