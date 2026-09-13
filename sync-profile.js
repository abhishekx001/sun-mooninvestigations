const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, serviceRoleKey)

async function syncProfile() {
  console.log("Looking up admin user...")
  const { data: { users }, error: listError } = await supabase.auth.admin.listUsers()
  
  if (listError || !users || users.length === 0) {
    console.error("Could not find the user you just created!", listError?.message)
    return
  }

  const adminUser = users.find(u => u.email === 'admin@sunmoongroup.in')
  if (!adminUser) {
    console.error("Could not find admin@sunmoongroup.in in auth users!")
    return
  }

  console.log("Found admin user! ID:", adminUser.id)
  console.log("Creating profile...")

  const { error } = await supabase.from('profiles').upsert({
    id: adminUser.id,
    full_name: 'Admin',
    email: 'admin@sunmoongroup.in',
    role: 'admin',
    is_active: true
  })

  if (error) {
    console.error("Failed to create profile:", error.message)
  } else {
    console.log("SUCCESS! The profile is linked. You can now log in.")
  }
}

syncProfile()
