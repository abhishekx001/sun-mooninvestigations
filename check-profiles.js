const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY

async function check() {
  const res = await fetch(`${url}/rest/v1/profiles?select=*`, {
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`
    }
  })
  const profiles = await res.json()
  console.log("Total profiles:", profiles.length)
  if (profiles.length > 0) {
    console.log("Sample profiles:")
    profiles.slice(0, 5).forEach(p => console.log(p.full_name, p.role))
  }
}
check()
