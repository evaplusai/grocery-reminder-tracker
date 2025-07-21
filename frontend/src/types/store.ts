export type StoreId = 'shoprite' | 'costco' | 'stop-and-shop' | 'cvs';

export interface Store {
  id: StoreId;
  name: string;
  icon: string;
  color: string;
  bgColor: string;
  description: string;
}

export const STORES: Record<StoreId, Store> = {
  'shoprite': {
    id: 'shoprite',
    name: 'ShopRite',
    icon: '🏪',
    color: 'text-red-600',
    bgColor: 'bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/30',
    description: 'General groceries and fresh produce'
  },
  'costco': {
    id: 'costco',
    name: 'Costco',
    icon: '🏬',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/30',
    description: 'Bulk items and warehouse shopping'
  },
  'stop-and-shop': {
    id: 'stop-and-shop',
    name: 'Stop and Shop',
    icon: '🛍️',
    color: 'text-green-600',
    bgColor: 'bg-green-50 hover:bg-green-100 dark:bg-green-900/20 dark:hover:bg-green-900/30',
    description: 'Full grocery with good produce'
  },
  'cvs': {
    id: 'cvs',
    name: 'CVS',
    icon: '💊',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50 hover:bg-purple-100 dark:bg-purple-900/20 dark:hover:bg-purple-900/30',
    description: 'Pharmacy and convenience items'
  }
};