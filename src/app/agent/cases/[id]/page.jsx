import { createClient } from '@/utils/supabase/server'
import { notFound, redirect } from 'next/navigation'
import StatusTag from '@/components/StatusTag'
import DeadlineCountdown from '@/components/DeadlineCountdown'
import ReportFormClient from './ReportFormClient'
import CommitDateForm from './CommitDateForm'

export default async function AgentCaseDetailPage({ params }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: caseItem } = await supabase
    .from('cases')
    .select(`
      *, 
      reports(*),
      case_progress(*)
    `)
    .eq('id', id)
    .single()

  if (!caseItem) {
    notFound()
  }

  // Ensure the agent can only view their own cases
  if (caseItem.assigned_agent_id !== user.id) {
    redirect('/agent/dashboard')
  }

  const progress = caseItem.case_progress?.[0] || caseItem.case_progress;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-light text-gray-900 tracking-tight">{caseItem.case_name || caseItem.case_title}</h2>
          <p className="mt-1 text-sm text-gray-500">{caseItem.company || caseItem.client_name} • Claim: {caseItem.claim_no || caseItem.policy_number || 'N/A'}</p>
        </div>
        <StatusTag status={caseItem.status} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Investigation Details</h3>
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <dt className="text-xs text-gray-500 uppercase tracking-wider">Type</dt>
                <dd className="mt-1 text-sm text-gray-900">{caseItem.investigation_type || 'N/A'}</dd>
              </div>
              <div>
                <dt className="text-xs text-gray-500 uppercase tracking-wider">FIR / Police Station</dt>
                <dd className="mt-1 text-sm text-gray-900">{caseItem.fir_no_police_station || 'N/A'}</dd>
              </div>
              <div className="md:col-span-2">
                <dt className="text-xs text-gray-500 uppercase tracking-wider">Documents Enclosed</dt>
                <dd className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">{caseItem.documents_enclosed || 'None'}</dd>
              </div>
              <div className="md:col-span-2">
                <dt className="text-xs text-gray-500 uppercase tracking-wider">Description (Legacy)</dt>
                <dd className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">{caseItem.description || 'N/A'}</dd>
              </div>
            </dl>
          </div>

          {(caseItem.status === 'assigned' || caseItem.status === 'in_progress') && (
            <ReportFormClient caseId={caseItem.id} agentId={user.id} />
          )}

          <div className="bg-white border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">My Submitted Reports</h3>
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
              <p className="text-sm text-gray-500">You haven't submitted any updates yet.</p>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white border border-gray-200 p-6">
            <h3 className="text-sm font-medium text-gray-900 uppercase tracking-wider mb-4 border-b border-gray-200 pb-2">Case Summary</h3>
            <dl className="space-y-4">
              <div>
                <dt className="text-xs text-gray-500 uppercase tracking-wider">Location</dt>
                <dd className="mt-1 text-sm text-gray-900">{caseItem.location}</dd>
              </div>
              <div>
                <dt className="text-xs text-gray-500 uppercase tracking-wider mb-2">TAT Target (Deadline)</dt>
                <dd className="text-sm flex items-center">
                  <span className="mr-2 text-sm text-gray-900">
                    {caseItem.tat_target || caseItem.deadline ? new Date(caseItem.tat_target || caseItem.deadline).toLocaleDateString() : 'None set'}
                  </span>
                  <DeadlineCountdown deadline={caseItem.tat_target || caseItem.deadline} />
                </dd>
              </div>
              {progress && (
                <div className="pt-4 border-t border-gray-100">
                  <dt className="text-xs text-gray-500 uppercase tracking-wider mb-2">Commit Date</dt>
                  <CommitDateForm caseId={caseItem.id} currentCommitDate={progress.commit_date} disabled={caseItem.status === 'submitted' || caseItem.status === 'closed'} />
                </div>
              )}
            </dl>
          </div>

          {caseItem.document_urls && caseItem.document_urls.length > 0 && (
            <div className="bg-white border border-gray-200 p-6 border-l-4 border-l-accent">
              <h3 className="text-sm font-medium text-gray-900 uppercase tracking-wider mb-2 border-b border-gray-200 pb-2">
                Attached Documents
              </h3>
              <p className="text-xs text-gray-500 mb-3">Documents uploaded by the admin for your reference.</p>
              <ul className="space-y-2 mt-2">
                {caseItem.document_urls.map((path, idx) => (
                  <li key={idx}>
                    <a href={`/api/download?path=${path}`} target="_blank" className="text-sm text-accent hover:underline flex items-center gap-2">
                      📄 Download Document {idx + 1}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
