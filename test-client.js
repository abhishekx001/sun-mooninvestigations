const { createBrowserClient } = require('@supabase/ssr')
try {
  createBrowserClient(undefined, undefined)
} catch (e) {
  console.log("Error:", e.message)
}
