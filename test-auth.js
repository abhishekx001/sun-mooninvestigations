const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseKey, {
  realtime: {
    // Disable realtime to prevent the ws error in Node
    disabled: true
  }
})

async function test() {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: 'admin@sunmoongroup.in',
    password: 'Admin@Sun2026',
  })
  if (error) {
    console.log("Error:", error)
    console.log("Error object keys:", Object.keys(error))
    console.log("Error stringified:", JSON.stringify(error))
  } else {
    console.log("Data:", data)
  }
}
test()
