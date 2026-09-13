'use client'

import { useRouter } from 'next/navigation'
import ReportForm from '@/components/forms/ReportForm'
import { submitReport } from '@/app/actions/agent'

export default function ReportFormClient({ caseId, agentId }) {
  const router = useRouter()

  const handleSubmitReport = async (data) => {
    const formData = new FormData()
    formData.append('case_id', caseId)
    formData.append('agent_id', agentId)
    formData.append('update_text', data.update_text)
    formData.append('is_final', data.isFinal.toString())
    
    if (data.attachments && data.attachments.length > 0) {
      for (let i = 0; i < data.attachments.length; i++) {
        formData.append('attachments', data.attachments[i])
      }
    }

    const result = await submitReport(formData)

    if (result.error) {
      throw new Error(result.error)
    }

    router.refresh()
  }

  return <ReportForm caseId={caseId} onSubmitReport={handleSubmitReport} />
}
