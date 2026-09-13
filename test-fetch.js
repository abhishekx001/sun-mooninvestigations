fetch("https://vjnzhkypxjoijjzjrrgz.supabase.co/auth/v1/health")
  .then(res => res.json())
  .then(console.log)
  .catch(console.error)
