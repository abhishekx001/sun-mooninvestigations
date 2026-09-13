const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY

async function clearCases() {
  console.log("Deleting all cases...")
  // The PostgREST API doesn't easily allow DELETE without a filter, so we filter where id is not null
  const res = await fetch(`${url}/rest/v1/cases?id=not.is.null`, {
    method: 'DELETE',
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`
    }
  })
  console.log("Status:", res.status)
}

clearCases()
