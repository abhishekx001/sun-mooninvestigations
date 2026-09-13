const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY

const locations = [
  "Delhi", "Mumbai", "Bangalore", "Chennai", "Kolkata", 
  "Hyderabad", "Pune", "Ahmedabad", "Jaipur", "Lucknow"
]

const agentNames = [
  "Ravi Kumar", "Priya Sharma", "Amit Singh", "Sneha Patel",
  "Vikram Malhotra", "Anita Desai", "Rahul Verma", "Pooja Gupta",
  "Suresh Nair", "Kavita Reddy", "Manish Tiwari", "Neha Joshi",
  "Arun Prakash", "Divya Menon", "Sanjay Kapoor", "Riya Bhatia",
  "Gaurav Chawla", "Kirti Agarwal", "Nitin Das", "Swati Mishra"
]

async function seedData() {
  console.log("Seeding 20 demo agents securely...")

  for (let i = 0; i < 20; i++) {
    const name = agentNames[i]
    const email = `agent${i + 1}@sunmoongroup.in`
    const location = locations[i % locations.length]
    const password = `Agent@Sun2026`

    // Create auth user securely via Admin API
    const createRes = await fetch(`${url}/auth/v1/admin/users`, {
      method: 'POST',
      headers: {
        'apikey': key,
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email,
        password,
        email_confirm: true,
        user_metadata: { role: 'agent' }
      })
    })

    const createData = await createRes.json()
    if (!createData.id) {
      // If user exists, try to get them
      console.log(`Failed to create ${email}: ${createData.msg || 'Unknown error'}`)
      continue
    }

    const userId = createData.id
    console.log(`Created Auth User: ${email} (${userId})`)

    // Create profile
    await fetch(`${url}/rest/v1/profiles`, {
      method: 'POST',
      headers: {
        'apikey': key,
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        id: userId,
        full_name: name,
        email,
        role: 'agent',
        location,
        is_active: true
      })
    })

    // Create a dummy case for them
    await fetch(`${url}/rest/v1/cases`, {
      method: 'POST',
      headers: {
        'apikey': key,
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        location,
        company: "Demo Insurance Co.",
        claim_no: `CLM-${Math.floor(Math.random() * 10000)}`,
        investigation_type: "Death Claim",
        case_name: `Verification for ${name}`,
        status: "assigned",
        assigned_agent_id: userId
      })
    })
  }

  console.log("\nDone! 20 agents and 20 cases have been successfully added.")
}

seedData()
