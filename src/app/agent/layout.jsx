import Sidebar from '@/components/Sidebar'
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

  return (
    <div className="flex h-screen bg-[#FAFAFA] overflow-hidden">
      <Sidebar role={profile.role} fullName={profile.full_name} location={profile.location} />
      <main className="flex-1 overflow-y-auto">
        <div className="p-4 sm:p-8 max-w-5xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
}
