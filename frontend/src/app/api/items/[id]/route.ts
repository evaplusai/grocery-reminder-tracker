import { NextRequest, NextResponse } from 'next/server';
import { updateItem, deleteItem } from '@/lib/db';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await request.json();
    const { name, quantity, completed } = body;
    
    const resolvedParams = await params;
    const updates: { name?: string; quantity?: string; completed?: boolean } = {};
    
    if (name !== undefined) updates.name = name;
    if (quantity !== undefined) updates.quantity = quantity;
    if (completed !== undefined) updates.completed = completed;

    const item = await updateItem(resolvedParams.id, updates);
    
    if (!item) {
      return NextResponse.json(
        { error: 'Item not found' },
        { status: 404 }
      );
    }
    
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

    return NextResponse.json(formattedItem);
  } catch (error) {
    console.error('PATCH /api/items/[id] error:', error);
    return NextResponse.json(
      { error: 'Failed to update item' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const item = await deleteItem(resolvedParams.id);
    
    if (!item) {
      return NextResponse.json(
        { error: 'Item not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/items/[id] error:', error);
    return NextResponse.json(
      { error: 'Failed to delete item' },
      { status: 500 }
    );
  }
}