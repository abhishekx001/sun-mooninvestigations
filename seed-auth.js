const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false }
})

async function seed() {
  console.log("Cleaning up corrupted users...")
  const { data: users, error: listError } = await supabase.auth.admin.listUsers()
  if (users?.users) {
    for (const u of users.users) {
      await supabase.auth.admin.deleteUser(u.id)
    }
  }

  console.log("Creating admin user via safe API...")
  const { data, error } = await supabase.auth.admin.createUser({
    email: 'admin@sunmoongroup.in',
    password: 'Admin@Sun2026',
    email_confirm: true
  })

  if (error) {
    console.error("Failed to create admin:", error.message)
    return
  }
  
  console.log("Admin user created successfully! ID:", data.user.id)
  
  // Create their profile
  const { error: profileError } = await supabase.from('profiles').upsert({
    id: data.user.id,
    full_name: 'Admin',
    email: 'admin@sunmoongroup.in',
    role: 'admin',
    is_active: true
  })
  
  if (profileError) {
    console.error("Failed to create profile:", profileError.message)
  } else {
    console.log("Profile created successfully! You can now log in.")
  }
}

seed()
