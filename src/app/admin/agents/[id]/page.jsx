import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import CaseTable from '@/components/CaseTable'
import EditAgentForm from '@/components/forms/EditAgentForm'
import CreateCaseModal from '@/components/forms/CreateCaseModal'

export default async function AdminAgentDetailPage({ params }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: agent } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .single()

  if (!agent || agent.role !== 'agent') {
    notFound()
  }

  const { data: cases } = await supabase
    .from('cases')
    .select('*')
    .eq('assigned_agent_id', id)
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div className="bg-white border border-gray-200 p-6 flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-light text-gray-900 tracking-tight">{agent.full_name}</h2>
          <p className="mt-1 text-sm text-gray-500">{agent.email} • {agent.phone || 'No phone'} • {agent.location}</p>
          {!agent.is_active && (
            <span className="inline-block mt-2 px-2 py-1 text-[10px] font-medium tracking-wider uppercase bg-red-100 text-red-800 border border-red-200">
              Inactive
            </span>
          )}
        </div>
        <div className="text-right">
          <p className="text-3xl font-light text-gray-900">{cases?.length || 0}</p>
          <p className="text-xs text-gray-500 uppercase tracking-wider">Total Cases</p>
        </div>
      </div>

      <div className="bg-white border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4 border-b border-gray-200 pb-2">Edit Agent Profile</h3>
        <EditAgentForm agent={agent} />
      </div>

      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">Assigned Cases</h3>
          <CreateCaseModal preAssignedAgentId={id} />
        </div>
        <CaseTable cases={cases} role="admin" />
      </div>
    </div>
  )
}
