import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://xfuhbjqqlgfxxkjvezhy.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhmdWhianFxbGdmeHhranZlemh5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY3NzM2MjIsImV4cCI6MjA1MjM0OTYyMn0.6JgFPX3U0zq3wS0gBF1xJP8QdGAQRNGGcDBW7qUBGPo'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testConnection() {
  try {
    console.log('Testing database connection...')
    
    // Test basic connection
    const { data: tables, error: tablesError } = await supabase
      .from('courses')
      .select('*', { count: 'exact', head: true })
    
    if (tablesError) {
      console.error('Error accessing courses table:', tablesError)
      return
    }
    
    console.log('✅ Connection successful')
    
    // Test categories table
    const { data: categories, error: catError } = await supabase
      .from('categories')
      .select('*')
    
    if (catError) {
      console.error('Categories error:', catError)
    } else {
      console.log('Categories:', categories)
    }
    
    // Test creating a course without category
    console.log('\n--- Testing course creation ---')
    const { data: newCourse, error: createError } = await supabase
      .from('courses')
      .insert({
        title: 'Test Course',
        description: 'Test description',
        price: 0,
        subscription_tier: 'free',
        is_published: false
      })
      .select()
      .single()
    
    if (createError) {
      console.error('Error creating course:', createError)
    } else {
      console.log('✅ Course created successfully:', newCourse)
      
      // Clean up - delete test course
      await supabase
        .from('courses')
        .delete()
        .eq('id', newCourse.id)
      console.log('✅ Test course deleted')
    }
    
  } catch (error) {
    console.error('Connection test failed:', error)
  }
}

testConnection()
