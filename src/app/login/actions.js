'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export async function loginAction(formData) {
  const email = formData.get('email')
  const password = formData.get('password')
  const supabase = await createClient()

  console.log("SERVER SUPABASE URL:", process.env.NEXT_PUBLIC_SUPABASE_URL)

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    console.error("Login Server Error:", error)
    return { error: error.message || JSON.stringify(error) || 'Login failed.' }
  }

  // Determine redirect based on role
  if (data?.user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', data.user.id)
      .single()

    if (profile?.role === 'admin') {
      redirect('/admin/dashboard')
    } else if (profile?.role === 'agent') {
      redirect('/agent/dashboard')
    }
  }

  redirect('/')
}
