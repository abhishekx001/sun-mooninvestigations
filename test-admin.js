const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY

async function check() {
  const res = await fetch(`${url}/auth/v1/admin/users`, {
    method: 'GET',
    headers: {
      'apikey': key,
      'Authorization': `Bearer ${key}`
    }
  })
  const users = await res.json()
  console.log("Users:", users)

  const createRes = await fetch(`${url}/auth/v1/admin/users`, {
    method: 'POST',
    headers: {
      'apikey': key,
      'Authorization': `Bearer ${key}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      email: 'admin@sunmoongroup.in',
      password: 'Admin@Sun2026',
      email_confirm: true
    })
  })
  const createData = await createRes.json()
  console.log("Create user response:", createData)
}

check()
