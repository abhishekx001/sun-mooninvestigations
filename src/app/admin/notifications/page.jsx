import { createClient } from '@/utils/supabase/server'
import { markAsRead } from '@/app/actions/admin'
import { CheckCircle, Bell } from 'lucide-react'
import Link from 'next/link'
import { formatIST } from '@/utils/dateFormatter'

export default async function AdminNotificationsPage() {
  const supabase = await createClient()

  // Fetch all notifications ordered by newest first
  const { data: notifications } = await supabase
    .from('notifications')
    .select(`
      *,
      profiles ( full_name ),
      cases ( case_name, id )
    `)
    .order('created_at', { ascending: false })
    .limit(50)

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-2xl font-light text-gray-900 tracking-tight">Notifications</h2>
        <p className="mt-1 text-sm text-gray-500">Recent updates from agents on their assigned cases.</p>
      </div>

      <div className="bg-white border border-gray-200 overflow-hidden">
        {notifications && notifications.length > 0 ? (
          <ul className="divide-y divide-gray-200">
            {notifications.map((notif) => (
              <li key={notif.id} className={`p-4 sm:p-6 transition-colors ${!notif.is_read ? 'bg-blue-50/30' : 'bg-white'}`}>
                <div className="flex items-start gap-4">
                  <div className={`mt-1 flex-shrink-0 p-2 rounded-full ${!notif.is_read ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'}`}>
                    <Bell className="w-5 h-5" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">
                      {notif.profiles?.full_name || 'Agent'} 
                      <span className="font-normal text-gray-600">
                        {' '}- {notif.message}
                      </span>
                    </p>
                    
                    {notif.cases && (
                      <p className="mt-1 text-sm text-gray-500">
                        Case: <Link href={`/admin/cases/${notif.cases.id}`} className="text-accent hover:underline">{notif.cases.case_name}</Link>
                      </p>
                    )}
                    
                    <p className="mt-2 text-xs text-gray-400">
                      {formatIST(notif.created_at)}
                    </p>
                  </div>

                  {!notif.is_read && (
                    <div className="flex-shrink-0 self-center ml-4">
                      <form action={async () => {
                        'use server'
                        await markAsRead(notif.id)
                      }}>
                        <button 
                          type="submit" 
                          className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-green-600 hover:bg-green-50 border border-transparent hover:border-green-200 transition-colors rounded"
                        >
                          <CheckCircle className="w-4 h-4" />
                          <span className="hidden sm:inline">Mark as read</span>
                        </button>
                      </form>
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="p-12 text-center">
            <Bell className="mx-auto h-12 w-12 text-gray-300" />
            <h3 className="mt-2 text-lg font-medium text-gray-900">No notifications</h3>
            <p className="mt-1 text-sm text-gray-500">You're all caught up! New updates will appear here.</p>
          </div>
        )}
      </div>
    </div>
  )
}
