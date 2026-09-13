import Sidebar from '@/components/Sidebar'
import MobileNav from '@/components/MobileNav'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export default async function AgentLayout({ children }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'agent') {
    redirect('/admin/dashboard')
  }

  // Calculate unread alerts for the agent (cases due within 48h or overdue)
  const { data: allCases } = await supabase
    .from('cases')
    .select('status, tat_target, deadline')
    .eq('assigned_agent_id', user.id)
    .in('status', ['assigned', 'in_progress'])

  let unreadAlerts = 0
  if (allCases) {
    const now = new Date()
    const fortyEightHoursFromNow = new Date(now.getTime() + 48 * 60 * 60 * 1000)

    allCases.forEach(c => {
      if (c.tat_target || c.deadline) {
        const deadline = new Date(c.tat_target || c.deadline)
        if (deadline <= fortyEightHoursFromNow) unreadAlerts++
      }
    })
  }

  return (
    <div className="flex h-screen bg-[#FAFAFA] overflow-hidden">
      <Sidebar role={profile.role} fullName={profile.full_name} location={profile.location} unreadCount={unreadAlerts} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <MobileNav role={profile.role} fullName={profile.full_name} location={profile.location} unreadCount={unreadAlerts} />
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 md:p-8 max-w-5xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
