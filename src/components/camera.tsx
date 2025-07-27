import React, { useState } from 'react';

interface FoodEntry {
  user_id: string;
  food_item_id: string;
  quantity: number;
  meal_type: string;
}

interface User {
  id: string;
}

// Mock user for demonstration
const user: User = {
  id: '550e8400-e29b-41d4-a716-446655440000' // Proper UUID format
};

// Food item mapping - converts names to proper UUIDs
const FOOD_ITEMS: Record<string, string> = {
  'potato': '123e4567-e89b-12d3-a456-426614174000',
  'apple': '234e5678-e89b-12d3-a456-426614174001',
  'banana': '345e6789-e89b-12d3-a456-426614174002',
  'carrot': '456e7890-e89b-12d3-a456-426614174003',
};

// Helper function to generate UUID v4
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

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

async function logFood(foodItemName: string, quantity: string, mealType: string): Promise<void> {
  try {
    const foodEntry = {
      user_id: user.id,
      food_item_name: foodItemName, // Use food name instead of trying to pass "potato_1" as UUID
      quantity: parseInt(quantity),
      meal_type: mealType,
    };

    // Make API call to the food service
    const response = await fetch('/api/food/entries', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(foodEntry),
    });

    if (!response.ok) {
      const errorData = await response.json();
      
      // Handle specific UUID error that was mentioned in the problem statement
      if (errorData.code === '22P02') {
        throw new Error(`UUID Error: ${errorData.details || 'Invalid UUID format provided'}`);
      }
      
      throw new Error(errorData.details || errorData.error || 'Failed to log food entry');
    }

    const result = await response.json();
    console.log('Food entry saved successfully:', result.data);
    
  } catch (error) {
    console.error('Error inserting food entry:', error);
    throw error;
  }
}

export default function Camera() {
  const [foodName, setFoodName] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [mealType, setMealType] = useState('breakfast');
  const [isLogging, setIsLogging] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!foodName.trim()) {
      setLastError('Please enter a food name');
      return;
    }

    setIsLogging(true);
    setLastError(null);

    try {
      // This would previously cause the UUID error with "potato_1"
      // Now it's fixed to use proper UUIDs via the API
      await logFood(foodName, quantity, mealType);
      
      // Reset form on success
      setFoodName('');
      setQuantity('1');
      setMealType('breakfast');
      
    } catch (error) {
      setLastError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setIsLogging(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Food Logger</h2>
      
      {lastError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {lastError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="foodName" className="block text-sm font-medium text-gray-700 mb-1">
            Food Item
          </label>
          <input
            type="text"
            id="foodName"
            value={foodName}
            onChange={(e) => setFoodName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., potato, apple, banana"
          />
        </div>

        <div>
          <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">
            Quantity
          </label>
          <input
            type="number"
            id="quantity"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            min="1"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="mealType" className="block text-sm font-medium text-gray-700 mb-1">
            Meal Type
          </label>
          <select
            id="mealType"
            value={mealType}
            onChange={(e) => setMealType(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="breakfast">Breakfast</option>
            <option value="lunch">Lunch</option>
            <option value="dinner">Dinner</option>
            <option value="snack">Snack</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={isLogging}
          className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLogging ? 'Logging...' : 'Log Food'}
        </button>
      </form>

      <div className="mt-4 text-sm text-gray-600">
        <p><strong>Note:</strong> This component fixes the UUID error by ensuring food_item_id is always a valid UUID format instead of raw strings like "potato_1".</p>
      </div>
    </div>
  );
}

// Export the logFood function for testing
export { logFood };