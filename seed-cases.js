const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY

async function seedCases() {
  console.log("Fetching agents...")
  const res = await fetch(`${url}/rest/v1/profiles?role=eq.agent&select=*`, {
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`
    }
  })
  
  const agents = await res.json()
  
  if (!agents || agents.length === 0) {
    console.log("No agents found!")
    return
  }

  console.log(`Found ${agents.length} agents. Seeding 1 case for each...`)

  for (const agent of agents) {
    const caseData = {
      location: agent.location || "Head Office",
      company: "LIC of India",
      claim_no: `CLM-${Math.floor(Math.random() * 90000) + 10000}`,
      investigation_type: "Death Claim",
      case_name: `Background Check - ${agent.full_name}`,
      status: "assigned",
      assigned_agent_id: agent.id
    }

    const createRes = await fetch(`${url}/rest/v1/cases`, {
      method: 'POST',
      headers: {
        'apikey': key,
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(caseData)
    })

    if (createRes.ok) {
      console.log(`Assigned case to ${agent.full_name}`)
    } else {
      console.error(`Failed for ${agent.full_name}:`, await createRes.text())
    }
  }

  console.log("Done! Cases have been successfully added.")
}

seedCases()
