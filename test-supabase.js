const url = "https://vjnzhkypxjoijjzjrrgz.supabase.co/auth/v1/health";
fetch(url)
  .then(res => res.json())
  .then(data => console.log("Success:", data))
  .catch(err => console.error("Error:", err.message));
