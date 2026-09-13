'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function respondToAssignment(caseId, status) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  // Double check if the case is assigned to this agent
  const { data: caseItem } = await supabase
    .from('cases')
    .select('assigned_agent_id')
    .eq('id', caseId)
    .single()

  if (caseItem?.assigned_agent_id !== user.id) {
    return { error: 'Not authorized' }
  }

  const { error } = await supabase
    .from('case_progress')
    .update({ accept_reject: status })
    .eq('case_id', caseId)

  if (error) {
    return { error: error.message }
  }

  // If rejected, unassign the case
  if (status === 'rejected') {
    await supabase
      .from('cases')
      .update({ 
        assigned_agent_id: null,
        status: 'unassigned'
      })
      .eq('id', caseId)
      
    await supabase.from('notifications').insert({
      case_id: caseId,
      agent_id: user.id,
      message: 'Agent rejected the case assignment.'
    })
  } else if (status === 'accepted') {
    await supabase
      .from('cases')
      .update({ 
        status: 'in_progress'
      })
      .eq('id', caseId)
      
    await supabase.from('notifications').insert({
      case_id: caseId,
      agent_id: user.id,
      message: 'Agent accepted the case assignment.'
    })
  }

  revalidatePath('/agent/dashboard')
  revalidatePath(`/agent/cases/${caseId}`)
  return { success: true }
}

export async function submitReport(formData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return { error: 'Not authenticated' }

  const caseId = formData.get('case_id')
  const updateText = formData.get('update_text')
  const isFinal = formData.get('is_final') === 'true'
  const files = formData.getAll('attachments')

  let attachmentUrls = []

  // Handle multiple file uploads
  for (const file of files) {
    if (file && file.size > 0) {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`
      
      const { error: uploadError, data: uploadData } = await supabase.storage
        .from('report-attachments')
        .upload(`cases/${caseId}/${fileName}`, file)
        
      if (!uploadError && uploadData) {
        attachmentUrls.push(uploadData.path)
      }
    }
  }

  // Insert report
  const { error: reportError } = await supabase
    .from('reports')
    .insert({
      case_id: caseId,
      agent_id: user.id,
      update_text: updateText,
      is_final: isFinal,
      attachment_urls: attachmentUrls
    })

  if (reportError) {
    return { error: reportError.message }
  }

  // If final, update case status and case_progress date_of_final_submission
  if (isFinal) {
    const now = new Date().toISOString()
    
    await supabase
      .from('cases')
      .update({ status: 'submitted' })
      .eq('id', caseId)

    await supabase
      .from('case_progress')
      .update({ date_of_final_submission: now })
      .eq('case_id', caseId)
  }

  // Insert notification for admin
  await supabase.from('notifications').insert({
    case_id: caseId,
    agent_id: user.id,
    message: isFinal ? 'Agent submitted the final report for the case.' : 'Agent submitted a new update for the case.'
  })

  revalidatePath(`/agent/cases/${caseId}`)
  return { success: true }
}

export async function updateCommitDate(caseId, commitDate) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase
    .from('case_progress')
    .update({ commit_date: commitDate })
    .eq('case_id', caseId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath(`/agent/cases/${caseId}`)
  return { success: true }
}
