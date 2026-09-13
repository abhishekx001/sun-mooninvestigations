const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY

async function sync() {
  const usersRes = await fetch(`${url}/auth/v1/admin/users`, {
    headers: { apikey: key, Authorization: `Bearer ${key}` }
  })
  const users = await usersRes.json()
  const admin = users.users?.find(u => u.email === 'admin@sunmoongroup.in')
  
  if (!admin) return console.log("Admin not found")
  
  console.log("Upserting profile for:", admin.id)
  
  const profileRes = await fetch(`${url}/rest/v1/profiles?id=eq.${admin.id}`, {
    method: 'POST',
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
      'Prefer': 'resolution=merge-duplicates'
    },
    body: JSON.stringify({
      id: admin.id,
      full_name: 'Admin',
      email: 'admin@sunmoongroup.in',
      role: 'admin',
      is_active: true
    })
  })
  
  console.log("Profile sync status:", profileRes.status)
}
sync()
