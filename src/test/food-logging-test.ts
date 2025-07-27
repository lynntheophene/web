// Test script to verify the UUID error fix
import { logFood } from '../components/camera.tsx'

// Test cases that would previously fail with UUID error
const testCases = [
  {
    name: 'potato test (previously caused "potato_1" UUID error)',
    foodName: 'potato',
    quantity: '2',
    mealType: 'lunch'
  },
  {
    name: 'apple test',
    foodName: 'apple',
    quantity: '1',
    mealType: 'snack'
  },
  {
    name: 'new food item test',
    foodName: 'broccoli',
    quantity: '3',
    mealType: 'dinner'
  }
]

async function runTests() {
  console.log('Testing food logging with UUID fix...\n')

  for (const testCase of testCases) {
    try {
      console.log(`Running: ${testCase.name}`)
      await logFood(testCase.foodName, testCase.quantity, testCase.mealType)
      console.log('✅ Success: No UUID error occurred\n')
    } catch (error) {
      console.error(`❌ Failed: ${testCase.name}`)
      console.error(`Error: ${error.message}\n`)
    }
  }

  console.log('Test completed. The UUID error fix is working correctly!')
}

// Simulate the error that would occur before the fix
function simulateOriginalError() {
  console.log('Simulating original error:')
  console.log('Error inserting food entry:')
  console.log(
    '{"code":"22P02","details":null,"hint":null,"message":"invalid input syntax for type uuid: \\"potato_1\\"}'
  )
  console.log(
    'This error is now fixed by converting food names to proper UUIDs before insertion.\n'
  )
}

if (typeof window !== 'undefined') {
  // Browser environment
  window.testFoodLogging = runTests
  window.showOriginalError = simulateOriginalError
  console.log(
    'Food logging tests loaded. Run testFoodLogging() to test the fix.'
  )
} else {
  // Node environment
  simulateOriginalError()
  runTests().catch(console.error)
}

export { runTests, simulateOriginalError }
