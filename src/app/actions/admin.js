'use server'

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'

import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { createClient } from '@/utils/supabase/server'

// Helper to get an admin client that uses the service role key
// It DOES NOT use cookies, so it won't be downgraded by the user's session token.
async function getAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { persistSession: false, autoRefreshToken: false } }
  )
}

export async function createAgent(formData) {
  const supabase = await getAdminClient()
  
  const email = formData.get('email')
  const password = formData.get('password')
  const fullName = formData.get('full_name')
  const location = formData.get('location')
  const phone = formData.get('phone')

  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  })

  if (authError) {
    return { error: authError.message }
  }

  const { error: profileError } = await supabase
    .from('profiles')
    .upsert({
      id: authData.user.id,
      email: email,
      full_name: fullName,
      role: 'agent',
      location: location,
      phone: phone,
    })

  if (profileError) {
    return { error: profileError.message }
  }

  revalidatePath('/admin/agents')
  return { success: true }
}

export async function createCase(formData) {
  const supabaseAuth = await createClient()
  const adminClient = await getAdminClient()
  
  const { data: { user } } = await supabaseAuth.auth.getUser()
  
  const assignedAgentId = formData.get('assigned_agent_id')

  // Handle server-side file uploads securely
  const files = formData.getAll('documents')
  const uploadedPaths = []
  
  for (const file of files) {
    if (file && file.size > 0) {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`
      
      const arrayBuffer = await file.arrayBuffer()
      const { error: uploadError } = await adminClient.storage
        .from('case-documents')
        .upload(fileName, arrayBuffer, {
          contentType: file.type
        })
        
      if (uploadError) {
        return { error: `File upload failed: ${uploadError.message}` }
      }
      uploadedPaths.push(fileName)
    }
  }
  
  const caseData = {
    location: formData.get('location'),
    company: formData.get('company'),
    claim_no: formData.get('claim_no'),
    investigation_type: formData.get('investigation_type'),
    case_name: formData.get('case_name'),
    fir_no_police_station: formData.get('fir_no_police_station'),
    documents_enclosed: formData.get('documents_enclosed'),
    tat_target: formData.get('tat_target') || null,
    created_by: user.id,
    status: assignedAgentId ? 'assigned' : 'unassigned',
    assigned_agent_id: assignedAgentId || null,
    date_of_allocation: assignedAgentId ? new Date().toISOString() : null,
    document_urls: uploadedPaths
  }

  const { data: insertedCase, error } = await adminClient
    .from('cases')
    .insert(caseData)
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  // If assigned immediately, create the progress row
  if (assignedAgentId) {
    await adminClient.from('case_progress').insert({
      case_id: insertedCase.id,
      accept_reject: 'pending'
    })
  }

  revalidatePath('/admin/cases')
  return { success: true, caseId: insertedCase.id }
}

export async function assignAgent(caseId, agentId, tatTarget) {
  const supabase = await getAdminClient()
  const now = new Date().toISOString()
  
  const { error } = await supabase
    .from('cases')
    .update({ 
      assigned_agent_id: agentId,
      status: 'assigned',
      date_of_allocation: now,
      tat_target: tatTarget || null
    })
    .eq('id', caseId)

  if (error) {
    return { error: error.message }
  }

  // Create case_progress row
  const { error: progressError } = await supabase
    .from('case_progress')
    .insert({
      case_id: caseId,
      accept_reject: 'pending'
    })

  if (progressError) {
    // If it already exists (e.g., reassignment), just update it
    await supabase
      .from('case_progress')
      .update({ accept_reject: 'pending' })
      .eq('case_id', caseId)
  }

  revalidatePath(`/admin/cases/${caseId}`)
  revalidatePath('/admin/cases')
  return { success: true }
}

export async function updateAgent(agentId, formData) {
  const supabase = await getAdminClient()
  
  const fullName = formData.get('full_name')
  const location = formData.get('location')
  const phone = formData.get('phone')
  const isActive = formData.get('is_active') === 'true'

  const { error } = await supabase
    .from('profiles')
    .update({
      full_name: fullName,
      location: location,
      phone: phone,
      is_active: isActive
    })
    .eq('id', agentId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath(`/admin/agents/${agentId}`)
  revalidatePath('/admin/agents')
  return { success: true }
}

export async function updateCase(caseId, formData) {
  const supabase = await getAdminClient()
  
  const caseData = {
    location: formData.get('location'),
    company: formData.get('company'),
    claim_no: formData.get('claim_no'),
    investigation_type: formData.get('investigation_type'),
    case_name: formData.get('case_name'),
    fir_no_police_station: formData.get('fir_no_police_station'),
    documents_enclosed: formData.get('documents_enclosed'),
    tat_target: formData.get('tat_target') || null,
  }

  const { error } = await supabase
    .from('cases')
    .update(caseData)
    .eq('id', caseId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath(`/admin/cases/${caseId}`)
  revalidatePath('/admin/cases')
  return { success: true }
}

export async function markAsRead(notificationId) {
  const supabase = await getAdminClient()
  
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', notificationId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/admin/notifications')
  revalidatePath('/admin/dashboard') // layout fetches count
  return { success: true }
}

export async function deleteCase(caseId) {
  const supabase = await getAdminClient()
  
  const { error } = await supabase
    .from('cases')
    .delete()
    .eq('id', caseId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/admin/cases')
  revalidatePath('/admin/dashboard')
  return { success: true }
}
