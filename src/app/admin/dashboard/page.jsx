import { createClient } from '@/utils/supabase/server'
import { Users, FileText, AlertTriangle } from 'lucide-react'

export default async function AdminDashboardPage() {
  const supabase = await createClient()

  const [
    { count: totalCases },
    { count: pendingCases },
    { count: totalAgents }
  ] = await Promise.all([
    supabase.from('cases').select('*', { count: 'exact', head: true }),
    supabase.from('cases').select('*', { count: 'exact', head: true }).in('status', ['unassigned', 'assigned', 'in_progress']),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'agent')
  ])

  // Get cases nearing deadline (next 48 hours)
  const twoDaysFromNow = new Date()
  twoDaysFromNow.setHours(twoDaysFromNow.getHours() + 48)

  const { data: nearingDeadline } = await supabase
    .from('cases')
    .select('id, case_name, tat_target, status')
    .in('status', ['assigned', 'in_progress'])
    .lte('tat_target', twoDaysFromNow.toISOString())
    .order('tat_target', { ascending: true })
    .limit(5)

  const stats = [
    { label: 'Total Cases', value: totalCases || 0, icon: FileText },
    { label: 'Active/Pending', value: pendingCases || 0, icon: AlertTriangle },
    { label: 'Field Agents', value: totalAgents || 0, icon: Users },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-light text-gray-900 tracking-tight">Admin Dashboard</h2>
        <p className="mt-1 text-sm text-gray-500">Overview of investigation cases and agent activity.</p>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white border border-gray-200 p-6 flex items-center">
            <div className="flex-shrink-0 bg-gray-50 p-3 border border-gray-100">
              <stat.icon className="h-6 w-6 text-gray-600" aria-hidden="true" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">{stat.label}</dt>
                <dd className="text-2xl font-light text-gray-900">{stat.value}</dd>
              </dl>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white border border-gray-200">
        <div className="px-6 py-5 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-base font-medium text-gray-900">Nearing Deadline</h3>
        </div>
        <div className="px-6 py-5">
          {nearingDeadline?.length > 0 ? (
            <ul className="divide-y divide-gray-200">
              {nearingDeadline.map((c) => (
                <li key={c.id} className="py-4 flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-900">{c.case_name}</span>
                    <span className="text-xs text-gray-500">Due: {new Date(c.tat_target).toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="px-2 py-1 text-[10px] font-medium tracking-wider uppercase bg-gray-100 text-gray-600 border border-gray-200">
                      {c.status}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-500 text-center py-4">No cases are nearing their deadline.</p>
          )}
        </div>
      </div>
    </div>
  )
}
