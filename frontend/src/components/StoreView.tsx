'use client';

import { Store } from '@/types/store';
import { GroceryItem } from '@/types/item';
import ItemCard from './ItemCard';
import AddItemForm from './AddItemForm';

interface StoreViewProps {
  store: Store;
  items: GroceryItem[];
  onAddItem: (name: string, quantity?: string) => void;
  onToggleComplete: (itemId: string) => void;
  onEditItem: (itemId: string, name: string, quantity?: string) => void;
  onDeleteItem: (itemId: string) => void;
}

export default function StoreView({ 
  store, 
  items, 
  onAddItem, 
  onToggleComplete, 
  onEditItem, 
  onDeleteItem 
}: StoreViewProps) {
  const pendingItems = items.filter(item => !item.completed);
  const completedItems = items.filter(item => item.completed);

  return (
    <div className="space-y-6">
      {/* Store header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 text-center">
        <div className="text-4xl mb-2">{store.icon}</div>
        <h2 className={`text-xl font-semibold mb-1 ${store.color}`}>
          {store.name}
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          {store.description}
        </p>
        {items.length > 0 && (
          <div className="mt-3 text-sm text-gray-500 dark:text-gray-400">
            {pendingItems.length} pending • {completedItems.length} completed
          </div>
        )}
      </div>

      {/* Add item form */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <AddItemForm onAddItem={onAddItem} />
      </div>

      {/* Items list */}
      {items.length > 0 ? (
        <div className="space-y-4">
          {/* Pending items */}
          {pendingItems.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-3 px-1">
                Shopping List ({pendingItems.length})
              </h3>
              <div className="space-y-2">
                {pendingItems.map(item => (
                  <ItemCard
                    key={item.id}
                    item={item}
                    onToggleComplete={onToggleComplete}
                    onEdit={onEditItem}
                    onDelete={onDeleteItem}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Completed items */}
          {completedItems.length > 0 && (
            <div>
              <div className="flex items-center justify-between px-1 mb-3">
                <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Completed ({completedItems.length})
                </h3>
                <button
                  onClick={() => {
                    completedItems.forEach(item => onDeleteItem(item.id));
                  }}
                  className="text-xs text-gray-500 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                >
                  Clear All
                </button>
              </div>
              <div className="space-y-2">
                {completedItems.map(item => (
                  <ItemCard
                    key={item.id}
                    item={item}
                    onToggleComplete={onToggleComplete}
                    onEdit={onEditItem}
                    onDelete={onDeleteItem}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Empty state */
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
          <div className="text-4xl mb-4">📝</div>
          <p className="text-gray-500 dark:text-gray-400 mb-2">
            No items in your {store.name} list yet
          </p>
          <p className="text-sm text-gray-400 dark:text-gray-500">
            Add items using the form above
          </p>
        </div>
      )}
    </div>
  );
}