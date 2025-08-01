import fetch from 'node-fetch'

const SUPABASE_URL = 'https://xfuhbjqqlgfxxkjvezhy.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhmdWhianFxbGdmeHhranZlemh5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY3NzM2MjIsImV4cCI6MjA1MjM0OTYyMn0.6JgFPX3U0zq3wS0gBF1xJP8QdGAQRNGGcDBW7qUBGPo'

async function testEdgeFunction() {
  try {
    console.log('Testing Simplified Edge Function...')
    
    // Test GET request - debe funcionar sin autenticación ya que eliminamos la verificación
    console.log('\n--- Testing GET request ---')
    const getResponse = await fetch(`${SUPABASE_URL}/functions/v1/admin-courses`, {
      method: 'GET',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Content-Type': 'application/json'
      }
    })
    
    const getData = await getResponse.text()
    console.log('GET Response status:', getResponse.status)
    console.log('GET Response body:', getData.substring(0, 200) + '...')
    
    // Test POST request con instructor_id válido
    console.log('\n--- Testing POST request ---')
    const postResponse = await fetch(`${SUPABASE_URL}/functions/v1/admin-courses`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        title: 'Test Course from Simplified Function',
        description: 'Test description from simplified edge function',
        price: 0,
        instructor_id: '7ee127dd-cf89-4593-88c8-252f46cb1118', // ID válido de la tabla profiles
        subscription_tier: 'free',
        is_published: false
      })
    })
    
    const postData = await postResponse.text()
    console.log('POST Response status:', postResponse.status)
    console.log('POST Response body:', postData)
    
  } catch (error) {
    console.error('Error testing edge function:', error)
  }
}

testEdgeFunction()
