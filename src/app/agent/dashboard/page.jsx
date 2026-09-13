import { createClient } from '@/utils/supabase/server'
import CaseCard from '@/components/CaseCard'
import AcceptRejectPrompt from './AcceptRejectPrompt'

export default async function AgentDashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: cases } = await supabase
    .from('cases')
    .select(`
      *,
      case_progress(accept_reject)
    `)
    .eq('assigned_agent_id', user.id)
    .in('status', ['assigned', 'in_progress'])
    .order('tat_target', { ascending: true })

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-light text-gray-900 tracking-tight">My Active Cases</h2>
        <p className="mt-1 text-sm text-gray-500">Cases currently assigned to you for investigation.</p>
      </div>

      {cases && cases.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cases.map((caseItem) => {
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
  )
}
