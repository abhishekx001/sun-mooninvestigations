import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// Custom fetch wrapper to log detailed fetch errors
const customFetch = async (url, options) => {
  try {
    return await fetch(url, { ...options, cache: 'no-store' })
  } catch (err) {
    console.error("SUPABASE FETCH ERROR:", err.message, err.cause)
    throw err
  }
}

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
          }
        },
      },
      global: {
        fetch: customFetch
      }
    }
  )
}
