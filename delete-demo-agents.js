const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY

async function cleanDemoData() {
  console.log("Fetching all users...")
  const usersRes = await fetch(`${url}/auth/v1/admin/users`, {
    headers: { apikey: key, Authorization: `Bearer ${key}` }
  })
  const usersData = await usersRes.json()
  const users = usersData.users || []

  // Find users that start with 'agent' and end with '@sunmoongroup.in'
  // e.g., agent1@sunmoongroup.in
  const demoUsers = users.filter(u => /^agent\d+@sunmoongroup\.in$/.test(u.email))
  
  console.log(`Found ${demoUsers.length} demo users to delete.`)

  for (const u of demoUsers) {
    console.log(`Deleting ${u.email}...`)
    // Because we have ON DELETE CASCADE in the database, 
    // deleting the auth.user will automatically delete their profile and cases!
    await fetch(`${url}/auth/v1/admin/users/${u.id}`, {
      method: 'DELETE',
      headers: { apikey: key, Authorization: `Bearer ${key}` }
    })
  }

  console.log("Done! Only the real agents and admin are left.")
}

cleanDemoData()
