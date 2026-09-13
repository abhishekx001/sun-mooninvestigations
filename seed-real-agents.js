const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY

const agents = [
  { name: 'Dinesh',           location: 'MADURAI CIRCLE',       email: 'dinesh@sunmoongroup.in',           pass: 'Dinesh@Sun2026' },
  { name: 'Muthu Kumar',      location: 'TIRUNELVELI CIRCLE',   email: 'muthu.kumar@sunmoongroup.in',      pass: 'MuthuKumar@Sun2026' },
  { name: 'Muthu Mahalingam', location: 'MADURAI CIRCLE',       email: 'muthu.mahalingam@sunmoongroup.in', pass: 'MuthuMahalingam@Sun2026' },
  { name: 'Rajasekhar',       location: 'MYLADURAI',            email: 'rajasekhar@sunmoongroup.in',       pass: 'Rajasekhar@Sun2026' },
  { name: 'Ramachandran',     location: 'SALEM CIRCLE',         email: 'ramachandran@sunmoongroup.in',     pass: 'Ramachandran@Sun2026' },
  { name: 'Ramesh',           location: 'TIRUPPUR',             email: 'ramesh@sunmoongroup.in',           pass: 'Ramesh@Sun2026' },
  { name: 'Ramkumar',         location: 'COIMBATORE',           email: 'ramkumar@sunmoongroup.in',         pass: 'Ramkumar@Sun2026' },
  { name: 'Rudran',           location: 'THENI',                email: 'rudran@sunmoongroup.in',           pass: 'Rudran@Sun2026' },
  { name: 'Saravanan',        location: 'POLLACHI CIRCLE',      email: 'saravanan@sunmoongroup.in',        pass: 'Saravanan@Sun2026' },
  { name: 'Sasi',             location: 'COIMBATORE',           email: 'sasi@sunmoongroup.in',             pass: 'Sasi@Sun2026' },
  { name: 'Sathish',          location: 'NILGIRIS',             email: 'sathish@sunmoongroup.in',          pass: 'Sathish@Sun2026' },
  { name: 'Mohan',            location: 'SATHYAMANGALAM',       email: 'mohan@sunmoongroup.in',            pass: 'Mohan@Sun2026' },
  { name: 'Vignesh Cudd',     location: 'CUDDALORE, CHENNAI',   email: 'vignesh.cudd@sunmoongroup.in',     pass: 'VigneshCudd@Sun2026' },
  { name: 'Vignesh K',        location: 'THANJAVUR CIRCLE',     email: 'vignesh.k@sunmoongroup.in',        pass: 'VigneshK@Sun2026' },
  { name: 'Vimal',            location: 'CHENNAI',              email: 'vimal@sunmoongroup.in',            pass: 'Vimal@Sun2026' },
  { name: 'Vimaresh',         location: 'THANJAVUR CIRCLE',     email: 'vimaresh@sunmoongroup.in',         pass: 'Vimaresh@Sun2026' },
  { name: 'Babu A',           location: 'PALAKKAD',             email: 'babu.a@sunmoongroup.in',           pass: 'BabuA@Sun2026' },
  { name: 'Shafeeq',          location: 'MALAPPURAM',           email: 'shafeeq@sunmoongroup.in',          pass: 'Shafeeq@Sun2026' },
  { name: 'Kiran',            location: 'TRIVANDRUM',           email: 'kiran@sunmoongroup.in',            pass: 'Kiran@Sun2026' },
  { name: 'Yadhu',            location: 'COCHIN',               email: 'yadhu@sunmoongroup.in',            pass: 'Yadhu@Sun2026' }
]

async function seedData() {
  console.log("Seeding REAL agents securely...")

  for (const agent of agents) {
    const { name, location, email, pass } = agent

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
        password: pass,
        email_confirm: true,
        user_metadata: { role: 'agent' }
      })
    })

    const createData = await createRes.json()
    if (!createData.id) {
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
        'Content-Type': 'application/json',
        'Prefer': 'resolution=merge-duplicates'
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
  }

  console.log("\nDone! All REAL agents have been safely added.")
}

seedData()
