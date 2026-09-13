const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

async function check() {
  console.log("Attempting sign in...")
  const res = await fetch(`${url}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: {
      'apikey': key,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      email: 'admin@sunmoongroup.in',
      password: 'Admin@Sun2026'
    })
  })
  const data = await res.json()
  console.log("Response:", res.status, data)
}

check()
