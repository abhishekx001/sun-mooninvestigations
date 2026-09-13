import Sidebar from '@/components/Sidebar'
import MobileNav from '@/components/MobileNav'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export default async function AdminLayout({ children }) {
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

  if (profile?.role !== 'admin') {
    redirect('/agent/dashboard')
  }

  const { count: unreadCount } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('is_read', false)

  return (
    <div className="flex h-screen bg-[#FAFAFA] overflow-hidden">
      <Sidebar role={profile.role} fullName={profile.full_name} location={profile.location} unreadCount={unreadCount} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <MobileNav role={profile.role} fullName={profile.full_name} location={profile.location} unreadCount={unreadCount} />
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 md:p-8 max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
