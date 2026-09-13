const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY

async function createBucket() {
  console.log("Creating bucket...")
  const res = await fetch(`${url}/storage/v1/bucket`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      id: 'case-documents',
      name: 'case-documents',
      public: false
    })
  })
  const data = await res.json()
  console.log("Result:", data)
}

createBucket()
