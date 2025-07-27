import { zValidator } from '@hono/zod-validator'
import { Hono } from 'hono'
import { z } from 'astro:schema'

// UUID validation regex
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

// Helper function to validate UUID
function isValidUUID(uuid: string): boolean {
  return UUID_REGEX.test(uuid);
}

// Helper function to generate UUID v4
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Food item mapping - converts names to proper UUIDs
const FOOD_ITEMS: Record<string, string> = {
  'potato': '123e4567-e89b-12d3-a456-426614174000',
  'apple': '234e5678-e89b-12d3-a456-426614174001',
  'banana': '345e6789-e89b-12d3-a456-426614174002',
  'carrot': '456e7890-e89b-12d3-a456-426614174003',
};

// Helper function to get or create food item UUID
function getFoodItemId(foodName: string): string {
  // Check if we have a predefined UUID for this food item
  if (FOOD_ITEMS[foodName.toLowerCase()]) {
    return FOOD_ITEMS[foodName.toLowerCase()];
  }
  
  // If not found, generate a new UUID instead of using the raw name
  const newUUID = generateUUID();
  FOOD_ITEMS[foodName.toLowerCase()] = newUUID;
  return newUUID;
}

// Mock database operations
interface FoodEntry {
  id: string;
  user_id: string;
  food_item_id: string;
  quantity: number;
  meal_type: string;
  created_at: string;
}

// In-memory storage for demonstration
const foodEntries: FoodEntry[] = [];

// Schema for creating food entries
const createFoodEntrySchema = z.object({
  user_id: z.string().uuid('user_id must be a valid UUID'),
  food_item_name: z.string().min(1, 'food_item_name is required'),
  quantity: z.number().int().positive('quantity must be a positive integer'),
  meal_type: z.enum(['breakfast', 'lunch', 'dinner', 'snack'])
});

// Alternative schema if food_item_id is provided directly
const createFoodEntryWithIdSchema = z.object({
  user_id: z.string().uuid('user_id must be a valid UUID'),
  food_item_id: z.string().uuid('food_item_id must be a valid UUID'),
  quantity: z.number().int().positive('quantity must be a positive integer'),
  meal_type: z.enum(['breakfast', 'lunch', 'dinner', 'snack'])
});

const app = new Hono()
  .basePath('/food')
  
  // POST /api/food/entries - Create a new food entry
  .post(
    '/entries',
    zValidator('json', createFoodEntrySchema.or(createFoodEntryWithIdSchema)),
    async (c) => {
      try {
        const body = c.req.valid('json');
        
        let foodItemId: string;
        
        // Check if food_item_id is provided directly
        if ('food_item_id' in body) {
          // Validate that the provided UUID is valid
          if (!isValidUUID(body.food_item_id)) {
            return c.json({
              error: 'Invalid UUID format',
              details: `food_item_id "${body.food_item_id}" is not a valid UUID. UUIDs must be in format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`
            }, 400);
          }
          foodItemId = body.food_item_id;
        } else {
          // Convert food name to UUID (this is the fix for the original issue)
          foodItemId = getFoodItemId(body.food_item_name);
        }

        // Validate user_id UUID
        if (!isValidUUID(body.user_id)) {
          return c.json({
            error: 'Invalid UUID format',
            details: `user_id "${body.user_id}" is not a valid UUID`
          }, 400);
        }

        // Create new food entry
        const newEntry: FoodEntry = {
          id: generateUUID(),
          user_id: body.user_id,
          food_item_id: foodItemId, // This is now guaranteed to be a valid UUID
          quantity: body.quantity,
          meal_type: body.meal_type,
          created_at: new Date().toISOString()
        };

        // Mock database insertion (this would be the actual database call)
        // In real implementation with Supabase or similar:
        // const { data, error } = await supabase
        //   .from('food_entries')
        //   .insert(newEntry);
        
        // if (error) {
        //   if (error.code === '22P02') {
        //     return c.json({
        //       error: 'UUID format error',
        //       details: error.message
        //     }, 400);
        //   }
        //   throw error;
        // }

        // For demonstration, just add to our in-memory array
        foodEntries.push(newEntry);
        
        return c.json({
          success: true,
          data: newEntry
        }, 201);
        
      } catch (error) {
        console.error('Error creating food entry:', error);
        
        // Handle PostgreSQL UUID error specifically
        if (error instanceof Error && error.message.includes('22P02')) {
          return c.json({
            error: 'UUID format error',
            details: 'One of the provided IDs is not in valid UUID format',
            code: '22P02'
          }, 400);
        }
        
        return c.json({
          error: 'Internal server error',
          details: error instanceof Error ? error.message : 'Unknown error'
        }, 500);
      }
    }
  )
  
  // GET /api/food/entries - Get all food entries
  .get('/entries', async (c) => {
    return c.json({
      success: true,
      data: foodEntries
    });
  })
  
  // GET /api/food/items - Get available food items
  .get('/items', async (c) => {
    return c.json({
      success: true,
      data: Object.entries(FOOD_ITEMS).map(([name, id]) => ({
        name,
        id
      }))
    });
  });

export default app;