import { zValidator } from '@hono/zod-validator'
import { z } from 'astro:schema'
import { Hono } from 'hono'

// UUID validation regex
const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

// Helper function to validate UUID
function isValidUUID(uuid: string): boolean {
  return UUID_REGEX.test(uuid)
}

// Helper function to generate UUID v4
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

// Food item mapping - converts names to proper UUIDs
const FOOD_ITEMS: Record<string, string> = {
  potato: '123e4567-e89b-12d3-a456-426614174000',
  apple: '234e5678-e89b-12d3-a456-426614174001',
  banana: '345e6789-e89b-12d3-a456-426614174002',
  carrot: '456e7890-e89b-12d3-a456-426614174003'
}

// Helper function to get or create food item UUID
function getFoodItemId(foodName: string): string {
  // Check if we have a predefined UUID for this food item
  if (FOOD_ITEMS[foodName.toLowerCase()]) {
    return FOOD_ITEMS[foodName.toLowerCase()]
  }

  // If not found, generate a new UUID instead of using the raw name
  const newUUID = generateUUID()
  FOOD_ITEMS[foodName.toLowerCase()] = newUUID
  return newUUID
}

// Define types for Hono context with user_id
type Variables = {
  user_id: string
}

// Simple authentication middleware
async function authenticate(c: any, next: any) {
  const authHeader = c.req.header('Authorization')
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json(
      {
        error: 'Authentication required',
        details: 'Please provide a valid authentication token'
      },
      401
    )
  }

  const token = authHeader.substring(7) // Remove 'Bearer ' prefix
  
  // Simple token validation - in production, this should be more secure
  // For now, we'll use a simple password-based token
  const validTokens = [
    'food-logger-auth-token', // Simple token for demo
    process.env.FOOD_LOGGER_TOKEN || 'default-token'
  ]
  
  if (!validTokens.includes(token)) {
    return c.json(
      {
        error: 'Invalid authentication token',
        details: 'The provided token is not valid'
      },
      401
    )
  }

  // For demo purposes, we'll derive user_id from the token
  // In a real app, this would come from a JWT or session
  c.set('user_id', '550e8400-e29b-41d4-a716-446655440000')
  
  await next()
}

// Mock database operations
interface FoodEntry {
  id: string
  user_id: string
  food_item_id: string
  quantity: number
  meal_type: string
  created_at: string
}

// In-memory storage for demonstration
const foodEntries: FoodEntry[] = []

// Schema for creating food entries - remove user_id as it comes from auth
const createFoodEntrySchema = z.object({
  food_item_name: z.string().min(1, 'food_item_name is required'),
  quantity: z.number().int().positive('quantity must be a positive integer'),
  meal_type: z.enum(['breakfast', 'lunch', 'dinner', 'snack'])
})

// Alternative schema if food_item_id is provided directly - remove user_id
const createFoodEntryWithIdSchema = z.object({
  food_item_id: z.string().uuid('food_item_id must be a valid UUID'),
  quantity: z.number().int().positive('quantity must be a positive integer'),
  meal_type: z.enum(['breakfast', 'lunch', 'dinner', 'snack'])
})

const app = new Hono<{ Variables: Variables }>()
  .basePath('/food')

  // POST /api/food/entries - Create a new food entry (requires authentication)
  .post(
    '/entries',
    authenticate, // Add authentication middleware
    zValidator('json', createFoodEntrySchema.or(createFoodEntryWithIdSchema)),
    async (c) => {
      try {
        const body = c.req.valid('json')
        const user_id = c.get('user_id') // Get user_id from authenticated context

        let foodItemId: string

        // Check if food_item_id is provided directly
        if ('food_item_id' in body) {
          // Validate that the provided UUID is valid
          if (!isValidUUID(body.food_item_id)) {
            return c.json(
              {
                error: 'Invalid UUID format',
                details: `food_item_id "${body.food_item_id}" is not a valid UUID. UUIDs must be in format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`
              },
              400
            )
          }
          foodItemId = body.food_item_id
        } else {
          // Convert food name to UUID (this is the fix for the original issue)
          foodItemId = getFoodItemId(body.food_item_name)
        }

        // Create new food entry with authenticated user_id
        const newEntry: FoodEntry = {
          id: generateUUID(),
          user_id: user_id, // Use authenticated user_id instead of accepting it from request body
          food_item_id: foodItemId,
          quantity: body.quantity,
          meal_type: body.meal_type,
          created_at: new Date().toISOString()
        }

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
        foodEntries.push(newEntry)

        return c.json(
          {
            success: true,
            data: newEntry
          },
          201
        )
      } catch (error) {
        console.error('Error creating food entry:', error)

        // Handle PostgreSQL UUID error specifically
        if (error instanceof Error && error.message.includes('22P02')) {
          return c.json(
            {
              error: 'UUID format error',
              details: 'One of the provided IDs is not in valid UUID format',
              code: '22P02'
            },
            400
          )
        }

        return c.json(
          {
            error: 'Internal server error',
            details: error instanceof Error ? error.message : 'Unknown error'
          },
          500
        )
      }
    }
  )

  // GET /api/food/entries - Get all food entries (requires authentication)
  .get('/entries', authenticate, async (c) => {
    const user_id = c.get('user_id')
    
    // Filter entries by authenticated user
    const userEntries = foodEntries.filter(entry => entry.user_id === user_id)
    
    return c.json({
      success: true,
      data: userEntries
    })
  })

  // GET /api/food/items - Get available food items
  .get('/items', async (c) => {
    return c.json({
      success: true,
      data: Object.entries(FOOD_ITEMS).map(([name, id]) => ({
        name,
        id
      }))
    })
  })

export default app
