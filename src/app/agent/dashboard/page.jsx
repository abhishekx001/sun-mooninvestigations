import { createClient } from '@/utils/supabase/server'
import CaseCard from '@/components/CaseCard'
import AcceptRejectPrompt from './AcceptRejectPrompt'

export default async function AgentDashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: allCases } = await supabase
    .from('cases')
    .select(`
      *,
      case_progress(accept_reject)
    `)
    .eq('assigned_agent_id', user.id)
    .order('tat_target', { ascending: true })

  const activeCases = allCases?.filter(c => ['assigned', 'in_progress'].includes(c.status)) || []
  const completedCases = allCases?.filter(c => ['submitted', 'closed'].includes(c.status)) || []

  const now = new Date()
  const fortyEightHoursFromNow = new Date(now.getTime() + 48 * 60 * 60 * 1000)

  let overdueCases = 0
  let approachingCases = 0

  activeCases.forEach(c => {
    if (c.tat_target || c.deadline) {
      const deadline = new Date(c.tat_target || c.deadline)
      if (deadline < now) overdueCases++
      else if (deadline <= fortyEightHoursFromNow) approachingCases++
    }
  })

  return (
    <div className="space-y-12">
      {/* Deadline Reminders Banner */}
      {(overdueCases > 0 || approachingCases > 0) && (
        <div className={`p-4 border-l-4 ${overdueCases > 0 ? 'bg-red-50 border-l-red-600 text-red-800' : 'bg-amber-50 border-l-amber-500 text-amber-800'}`}>
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <h3 className="font-medium">
                {overdueCases > 0 ? 'Urgent: Overdue Deadlines!' : 'Approaching Deadlines'}
              </h3>
              <p className="text-sm mt-1">
                {overdueCases > 0 && <span>You have <strong>{overdueCases}</strong> case(s) past their TAT target. </span>}
                {approachingCases > 0 && <span>You have <strong>{approachingCases}</strong> case(s) due within the next 48 hours. </span>}
                Please review your active cases below and submit updates immediately.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Active Cases Section */}
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-light text-gray-900 tracking-tight">My Active Cases</h2>
          <p className="mt-1 text-sm text-gray-500">Cases currently assigned to you for investigation.</p>
        </div>

        {activeCases.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeCases.map((caseItem) => {
              const progress = caseItem.case_progress?.[0] || caseItem.case_progress; // depending on relation 1:1
              const isPendingAcceptance = (progress?.accept_reject === 'pending' || !progress) && caseItem.status === 'assigned';

              return (
                <div key={caseItem.id} className="relative">
                  <CaseCard caseItem={caseItem} />
                  {isPendingAcceptance && (
                    <AcceptRejectPrompt caseId={caseItem.id} />
                  )}
                </div>
              )
            })}
          </div>
        ) : (
          <div className="bg-white border border-gray-200 p-12 text-center">
            <h3 className="text-lg font-medium text-gray-900">No active cases</h3>
            <p className="mt-2 text-sm text-gray-500">You don't have any pending investigations at the moment.</p>
          </div>
        )}
      </div>

      {/* Completed Cases Section */}
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-light text-gray-900 tracking-tight">Completed Cases</h2>
          <p className="mt-1 text-sm text-gray-500">Cases you have successfully submitted or closed.</p>
        </div>

        {completedCases.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 opacity-80">
            {completedCases.map((caseItem) => (
              <div key={caseItem.id}>
                <CaseCard caseItem={caseItem} />
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white border border-gray-200 p-12 text-center">
            <h3 className="text-lg font-medium text-gray-900">No completed cases</h3>
            <p className="mt-2 text-sm text-gray-500">You haven't completed any cases yet.</p>
          </div>
        )}
      </div>
    </div>
  )
}
