import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import StatusTag from '@/components/StatusTag'
import DeadlineCountdown from '@/components/DeadlineCountdown'
import LocationAgentAssign from '@/components/forms/LocationAgentAssign'
import EditCaseForm from '@/components/forms/EditCaseForm'

export default async function AdminCaseDetailPage({ params }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: caseItem } = await supabase
    .from('cases')
    .select(`
      *,
      agent:profiles!assigned_agent_id(full_name, location),
      reports(*)
    `)
    .eq('id', id)
    .single()

  if (!caseItem) {
    notFound()
  }

  // Fetch all agents for the LocationAgentAssign component
  const { data: allAgentsData } = await supabase
    .from('profiles')
    .select(`
      id, 
      full_name, 
      location,
      cases!assigned_agent_id(id, status)
    `)
    .eq('role', 'agent')
    .eq('is_active', true)

  const agentsWithCounts = (allAgentsData || []).map(a => ({
    id: a.id,
    full_name: a.full_name,
    location: a.location,
    open_cases_count: a.cases ? a.cases.filter(c => c.status !== 'submitted' && c.status !== 'closed').length : 0
  }))

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-light text-gray-900 tracking-tight">{caseItem.case_name || caseItem.case_title}</h2>
          <p className="mt-1 text-sm text-gray-500">{caseItem.company || caseItem.client_name} • Claim: {caseItem.claim_no || 'N/A'}</p>
        </div>
        <StatusTag status={caseItem.status} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          
          <div className="bg-white border border-gray-200 p-6">
            <h3 className="text-sm font-medium text-gray-900 uppercase tracking-wider mb-4 border-b border-gray-200 pb-2">Edit Case Details</h3>
            <EditCaseForm caseItem={caseItem} />
          </div>

          <div className="bg-white border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Report Thread</h3>
            {caseItem.reports && caseItem.reports.length > 0 ? (
              <div className="space-y-6">
                {caseItem.reports.map((report) => (
                  <div key={report.id} className="border-l-2 border-gray-200 pl-4 py-2">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {new Date(report.submitted_at).toLocaleString()}
                      </span>
                      {report.is_final && (
                        <span className="px-2 py-1 text-[10px] font-medium tracking-wider uppercase bg-accent text-white">
                          Final Report
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{report.update_text}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No updates submitted yet.</p>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white border border-gray-200 p-6">
            <h3 className="text-sm font-medium text-gray-900 uppercase tracking-wider mb-4 border-b border-gray-200 pb-2">Assignment Details</h3>
            <dl className="space-y-4">
              <div>
                <dt className="text-xs text-gray-500 uppercase tracking-wider">Location</dt>
                <dd className="mt-1 text-sm text-gray-900">{caseItem.location}</dd>
              </div>
              <div>
                <dt className="text-xs text-gray-500 uppercase tracking-wider">Assigned Agent</dt>
                <dd className="mt-1 text-sm text-gray-900 mb-3">
                  {caseItem.agent ? caseItem.agent.full_name : 'Unassigned'}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-gray-500 uppercase tracking-wider mb-2">Deadline</dt>
                <dd className="text-sm flex items-center">
                  <span className="mr-2 text-sm text-gray-900">
                    {caseItem.tat_target || caseItem.deadline ? new Date(caseItem.tat_target || caseItem.deadline).toLocaleString() : 'None set'}
                  </span>
                  <DeadlineCountdown deadline={caseItem.tat_target || caseItem.deadline} />
                </dd>
              </div>
            </dl>
          </div>

          {caseItem.document_urls && caseItem.document_urls.length > 0 && (
            <div className="bg-white border border-gray-200 p-6 border-l-4 border-l-accent">
              <h3 className="text-sm font-medium text-gray-900 uppercase tracking-wider mb-2 border-b border-gray-200 pb-2">
                Attached Documents
              </h3>
              <ul className="space-y-2 mt-4">
                {caseItem.document_urls.map((path, idx) => {
                  const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/case-documents/${path}`
                  // We are building a public URL here assuming we might make the bucket public, 
                  // but if private, they need signed URLs. Let's just use the direct Supabase URL 
                  // which will work if the browser has the auth cookie (since we use SSR auth).
                  // Actually, RLS on storage requires the auth token in headers, which normal links don't have.
                  // We should generate signed URLs.
                  return (
                    <li key={idx}>
                      <a href={`/api/download?path=${path}`} target="_blank" className="text-sm text-accent hover:underline flex items-center gap-2">
                        📄 Document {idx + 1}
                      </a>
                    </li>
                  )
                })}
              </ul>
            </div>
          )}

          <div className="bg-white border border-gray-200 p-6 border-l-4 border-l-amber-500">
            <h3 className="text-sm font-medium text-gray-900 uppercase tracking-wider mb-2 border-b border-gray-200 pb-2">
              {caseItem.assigned_agent_id ? 'Reassign Agent' : 'Assign Agent'}
            </h3>
            {caseItem.assigned_agent_id && (
              <p className="text-xs text-amber-600 mb-4">
                Warning: Reassigning an agent will reset the case progress tracking for the new agent.
              </p>
            )}
            <LocationAgentAssign 
              caseId={caseItem.id} 
              allAgents={agentsWithCounts} 
              currentAgentId={caseItem.assigned_agent_id} 
              currentTatTarget={caseItem.tat_target || caseItem.deadline}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
