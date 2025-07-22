import { NextRequest, NextResponse } from 'next/server';
import { getItemsByStore, createItem, initializeDatabase } from '@/lib/db';
import { generateItemId } from '@/lib/items';

// Initialize database on first API call
let dbInitialized = false;

async function ensureDbInitialized() {
  if (!dbInitialized) {
    await initializeDatabase();
    dbInitialized = true;
  }
}

export async function GET(request: NextRequest) {
  try {
    await ensureDbInitialized();
    
    const { searchParams } = new URL(request.url);
    const storeId = searchParams.get('storeId');
    
    if (!storeId) {
      return NextResponse.json(
        { error: 'storeId parameter is required' },
        { status: 400 }
      );
    }

    const items = await getItemsByStore(storeId);
    
    // Convert database format to frontend format
    const formattedItems = items.map((item: any) => ({
      id: item.id,
      name: item.name,
      quantity: item.quantity,
      completed: item.completed,
      storeId: item.store_id,
      createdAt: new Date(item.created_at),
      updatedAt: new Date(item.updated_at)
    }));

    return NextResponse.json(formattedItems);
  } catch (error) {
    console.error('GET /api/items error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch items' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await ensureDbInitialized();
    
    const body = await request.json();
    const { name, quantity, storeId } = body;

    if (!name || !storeId) {
      return NextResponse.json(
        { error: 'name and storeId are required' },
        { status: 400 }
      );
    }

    const itemId = generateItemId();
    const item = await createItem(itemId, name, storeId, quantity);
    
    // Convert database format to frontend format
    const formattedItem = {
      id: item.id,
      name: item.name,
      quantity: item.quantity,
      completed: item.completed,
      storeId: item.store_id,
      createdAt: new Date(item.created_at),
      updatedAt: new Date(item.updated_at)
    };

    return NextResponse.json(formattedItem, { status: 201 });
  } catch (error) {
    console.error('POST /api/items error:', error);
    return NextResponse.json(
      { error: 'Failed to create item' },
      { status: 500 }
    );
  }
}