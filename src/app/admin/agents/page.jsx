import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import AddAgentModal from '@/components/forms/AddAgentModal'

export default async function AdminAgentsPage() {
  const supabase = await createClient()

  const { data: agentsData } = await supabase
    .from('profiles')
    .select('*')
    .eq('role', 'agent')
    .order('full_name')

  const { data: casesData } = await supabase
    .from('cases')
    .select('assigned_agent_id')
    .in('status', ['assigned', 'in_progress'])

  const caseCounts = casesData?.reduce((acc, c) => {
    if (c.assigned_agent_id) {
      acc[c.assigned_agent_id] = (acc[c.assigned_agent_id] || 0) + 1
    }
    return acc
  }, {}) || {}

  const agents = agentsData?.map(agent => ({
    ...agent,
    active_cases_count: caseCounts[agent.id] || 0
  })) || []

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-light text-gray-900 tracking-tight">Agents</h2>
          <p className="mt-1 text-sm text-gray-500">Manage field investigators and their assignments.</p>
        </div>
        <AddAgentModal />
      </div>

      <div className="bg-white border border-gray-200 overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-200 bg-[#FAFAFA]">
              <th className="p-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="p-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
              <th className="p-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
              <th className="p-4 text-xs font-medium text-gray-500 uppercase tracking-wider text-center">Active Cases</th>
              <th className="p-4 text-xs font-medium text-gray-500 uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {agents?.map((agent) => (
              <tr key={agent.id} className="hover:bg-gray-50 transition-colors">
                <td className="p-4">
                  <div className="text-sm font-medium text-gray-900">{agent.full_name}</div>
                </td>
                <td className="p-4">
                  <div className="text-sm text-gray-900">{agent.email}</div>
                  <div className="text-xs text-gray-500">{agent.phone || 'No phone'}</div>
                </td>
                <td className="p-4 text-sm text-gray-600">{agent.location || 'Unassigned'}</td>
                <td className="p-4 text-sm text-center text-gray-900">
                  {agent.active_cases_count}
                </td>
                <td className="p-4 text-right">
                  <Link
                    href={`/admin/agents/${agent.id}`}
                    className="text-xs font-medium text-accent hover:text-accent-hover uppercase tracking-wider"
                  >
                    View Profile
                  </Link>
                </td>
              </tr>
            ))}
            {(!agents || agents.length === 0) && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-sm text-gray-500">
                  No agents found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
