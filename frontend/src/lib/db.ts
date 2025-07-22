import { sql } from '@vercel/postgres';

// Initialize database tables
export async function initializeDatabase() {
  try {
    // Create users table
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        name VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Create stores table
    await sql`
      CREATE TABLE IF NOT EXISTS stores (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        icon VARCHAR(10) NOT NULL,
        color VARCHAR(50) NOT NULL,
        bg_color VARCHAR(100) NOT NULL,
        description TEXT
      )
    `;

    // Create items table
    await sql`
      CREATE TABLE IF NOT EXISTS items (
        id VARCHAR(100) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        quantity VARCHAR(100),
        completed BOOLEAN DEFAULT FALSE,
        store_id VARCHAR(50) NOT NULL REFERENCES stores(id),
        user_id INTEGER DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Insert default stores if they don't exist
    await sql`
      INSERT INTO stores (id, name, icon, color, bg_color, description) VALUES
      ('shoprite', 'ShopRite', '🏪', 'text-red-600', 'bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/30', 'General groceries and fresh produce'),
      ('costco', 'Costco', '🏬', 'text-blue-600', 'bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/30', 'Bulk items and warehouse shopping'),
      ('stop-and-shop', 'Stop and Shop', '🛍️', 'text-green-600', 'bg-green-50 hover:bg-green-100 dark:bg-green-900/20 dark:hover:bg-green-900/30', 'Full grocery with good produce'),
      ('cvs', 'CVS', '💊', 'text-purple-600', 'bg-purple-50 hover:bg-purple-100 dark:bg-purple-900/20 dark:hover:bg-purple-900/30', 'Pharmacy and convenience items')
      ON CONFLICT (id) DO NOTHING
    `;

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Database initialization error:', error);
    throw error;
  }
}

// Get all items for a user and store
export async function getItemsByStore(storeId: string, userId: number = 1) {
  try {
    const result = await sql`
      SELECT * FROM items 
      WHERE store_id = ${storeId} AND user_id = ${userId}
      ORDER BY created_at DESC
    `;
    return result.rows;
  } catch (error) {
    console.error('Error fetching items:', error);
    throw error;
  }
}

// Create a new item
export async function createItem(
  id: string,
  name: string,
  storeId: string,
  quantity?: string,
  userId: number = 1
) {
  try {
    const result = await sql`
      INSERT INTO items (id, name, quantity, store_id, user_id, completed)
      VALUES (${id}, ${name}, ${quantity || null}, ${storeId}, ${userId}, false)
      RETURNING *
    `;
    return result.rows[0];
  } catch (error) {
    console.error('Error creating item:', error);
    throw error;
  }
}

// Update an item
export async function updateItem(
  id: string,
  updates: { name?: string; quantity?: string; completed?: boolean }
) {
  try {
    const setClauses = [];
    const values = [];
    
    if (updates.name !== undefined) {
      setClauses.push(`name = $${setClauses.length + 1}`);
      values.push(updates.name);
    }
    if (updates.quantity !== undefined) {
      setClauses.push(`quantity = $${setClauses.length + 1}`);
      values.push(updates.quantity || null);
    }
    if (updates.completed !== undefined) {
      setClauses.push(`completed = $${setClauses.length + 1}`);
      values.push(updates.completed);
    }
    
    setClauses.push(`updated_at = CURRENT_TIMESTAMP`);
    
    const query = `
      UPDATE items 
      SET ${setClauses.join(', ')}
      WHERE id = $${values.length + 1}
      RETURNING *
    `;
    
    const result = await sql.query(query, [...values, id]);
    return result.rows[0];
  } catch (error) {
    console.error('Error updating item:', error);
    throw error;
  }
}

// Delete an item
export async function deleteItem(id: string) {
  try {
    const result = await sql`
      DELETE FROM items WHERE id = ${id}
      RETURNING *
    `;
    return result.rows[0];
  } catch (error) {
    console.error('Error deleting item:', error);
    throw error;
  }
}