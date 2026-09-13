const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY

async function checkBuckets() {
  const res = await fetch(`${url}/storage/v1/bucket`, {
    headers: {
      Authorization: `Bearer ${key}`
    }
  })
  const buckets = await res.json()
  console.log("Buckets:", buckets)
}

checkBuckets()
