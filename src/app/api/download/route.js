import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const path = searchParams.get('path')

  if (!path) {
    return NextResponse.json({ error: 'Missing path' }, { status: 400 })
  }

  // 1. Verify user is logged in using the normal auth client
  const supabaseAuth = await createClient()
  const { data: { user } } = await supabaseAuth.auth.getUser()
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // 2. Generate signed URL using the Admin client to bypass Storage RLS
  const adminClient = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { persistSession: false, autoRefreshToken: false } }
  )
  
  const { data, error } = await adminClient.storage
    .from('case-documents')
    .createSignedUrl(path, 60) // valid for 60 seconds

  if (error || !data) {
    return NextResponse.json({ error: 'Failed to generate download link' }, { status: 500 })
  }

  // Redirect the user to the signed URL so the browser downloads it
  return NextResponse.redirect(data.signedUrl)
}
