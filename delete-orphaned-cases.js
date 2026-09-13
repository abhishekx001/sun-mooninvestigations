const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY

async function cleanCases() {
  console.log("Fetching orphaned cases...")
  const res = await fetch(`${url}/rest/v1/cases?assigned_agent_id=is.null`, {
    method: 'DELETE',
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      'Prefer': 'return=representation' // To get the deleted rows back
    }
  })
  
  const deleted = await res.json()
  
  if (deleted && deleted.length > 0) {
    console.log(`Successfully deleted ${deleted.length} orphaned/fake cases!`)
  } else {
    console.log("No orphaned cases found to delete.", deleted)
  }
}

cleanCases()
