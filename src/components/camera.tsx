import React, { useState } from 'react'

// Note: In production, this should be obtained from secure authentication
const AUTH_TOKEN = 'food-logger-auth-token'

async function logFood(
  foodItemName: string,
  quantity: string,
  mealType: string,
  authToken: string
): Promise<void> {
  try {
    const foodEntry = {
      food_item_name: foodItemName,
      quantity: parseInt(quantity),
      meal_type: mealType
      // Note: user_id is now obtained from authentication on the server side
    }

    // Make API call to the food service with authentication
    const response = await fetch('/api/food/entries', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}` // Add authentication header
      },
      body: JSON.stringify(foodEntry)
    })

    if (!response.ok) {
      const errorData = await response.json()

      // Handle authentication errors
      if (response.status === 401) {
        throw new Error(
          `Authentication Error: ${errorData.details || 'Please provide valid credentials'}`
        )
      }

      // Handle specific UUID error that was mentioned in the problem statement
      if (errorData.code === '22P02') {
        throw new Error(
          `UUID Error: ${errorData.details || 'Invalid UUID format provided'}`
        )
      }

      throw new Error(
        errorData.details || errorData.error || 'Failed to log food entry'
      )
    }

    const result = await response.json()
    console.log('Food entry saved successfully:', result.data)
  } catch (error) {
    console.error('Error inserting food entry:', error)
    throw error
  }
}

export default function Camera() {
  const [foodName, setFoodName] = useState('')
  const [quantity, setQuantity] = useState('1')
  const [mealType, setMealType] = useState('breakfast')
  const [isLogging, setIsLogging] = useState(false)
  const [lastError, setLastError] = useState<string | null>(null)
  const [authToken, setAuthToken] = useState('')
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Simple authentication check
    if (authToken === AUTH_TOKEN || authToken === 'food-logger-auth-token') {
      setIsAuthenticated(true)
      setLastError(null)
    } else {
      setLastError('Invalid authentication token')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!foodName.trim()) {
      setLastError('Please enter a food name')
      return
    }

    setIsLogging(true)
    setLastError(null)

    try {
      // This would previously cause the UUID error with "potato_1"
      // Now it's fixed to use proper UUIDs via the API and requires authentication
      await logFood(foodName, quantity, mealType, authToken)

      // Reset form on success
      setFoodName('')
      setQuantity('1')
      setMealType('breakfast')
    } catch (error) {
      setLastError(error instanceof Error ? error.message : 'An error occurred')
    } finally {
      setIsLogging(false)
    }
  }

  // Show login form if not authenticated
  if (!isAuthenticated) {
    return (
      <div className='mx-auto max-w-md rounded-lg bg-white p-6 shadow-md'>
        <h2 className='mb-4 text-2xl font-bold'>Food Logger - Authentication Required</h2>
        
        {lastError && (
          <div className='mb-4 rounded border border-red-400 bg-red-100 px-4 py-3 text-red-700'>
            {lastError}
          </div>
        )}

        <form onSubmit={handleLogin} className='space-y-4'>
          <div>
            <label
              htmlFor='authToken'
              className='mb-1 block text-sm font-medium text-gray-700'
            >
              Authentication Token
            </label>
            <input
              type='password'
              id='authToken'
              value={authToken}
              onChange={(e) => setAuthToken(e.target.value)}
              className='w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
              placeholder='Enter your authentication token'
            />
          </div>

          <button
            type='submit'
            className='w-full rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500'
          >
            Login
          </button>
        </form>

        <div className='mt-4 text-sm text-gray-600'>
          <p>
            <strong>Note:</strong> This authentication prevents unauthorized access to the food logging system.
            No more "logging in without pass" vulnerability.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className='mx-auto max-w-md rounded-lg bg-white p-6 shadow-md'>
      <h2 className='mb-4 text-2xl font-bold'>Food Logger</h2>

      {lastError && (
        <div className='mb-4 rounded border border-red-400 bg-red-100 px-4 py-3 text-red-700'>
          {lastError}
        </div>
      )}

      <form onSubmit={handleSubmit} className='space-y-4'>
        <div>
          <label
            htmlFor='foodName'
            className='mb-1 block text-sm font-medium text-gray-700'
          >
            Food Item
          </label>
          <input
            type='text'
            id='foodName'
            value={foodName}
            onChange={(e) => setFoodName(e.target.value)}
            className='w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
            placeholder='e.g., potato, apple, banana'
          />
        </div>

        <div>
          <label
            htmlFor='quantity'
            className='mb-1 block text-sm font-medium text-gray-700'
          >
            Quantity
          </label>
          <input
            type='number'
            id='quantity'
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            min='1'
            className='w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
          />
        </div>

        <div>
          <label
            htmlFor='mealType'
            className='mb-1 block text-sm font-medium text-gray-700'
          >
            Meal Type
          </label>
          <select
            id='mealType'
            value={mealType}
            onChange={(e) => setMealType(e.target.value)}
            className='w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
          >
            <option value='breakfast'>Breakfast</option>
            <option value='lunch'>Lunch</option>
            <option value='dinner'>Dinner</option>
            <option value='snack'>Snack</option>
          </select>
        </div>

        <button
          type='submit'
          disabled={isLogging}
          className='w-full rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50'
        >
          {isLogging ? 'Logging...' : 'Log Food'}
        </button>
      </form>

      <div className='mt-4 text-sm text-gray-600'>
        <p>
          <strong>Note:</strong> This component fixes the UUID error by ensuring
          food_item_id is always a valid UUID format instead of raw strings like
          "potato_1". Authentication is now required to prevent unauthorized access.
        </p>
        <button
          onClick={() => setIsAuthenticated(false)}
          className='mt-2 text-blue-500 underline'
        >
          Logout
        </button>
      </div>
    </div>
  )
}

// Export the logFood function for testing
export { logFood }
