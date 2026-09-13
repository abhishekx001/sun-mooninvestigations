'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Users, FileText, LogOut } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'

export default function Sidebar({ role, fullName, location }) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const adminLinks = [
    { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/cases', label: 'Cases', icon: FileText },
    { href: '/admin/agents', label: 'Agents', icon: Users },
  ]

  const agentLinks = [
    { href: '/agent/dashboard', label: 'My Cases', icon: LayoutDashboard },
  ]

  const links = role === 'admin' ? adminLinks : agentLinks

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <aside className="w-64 flex-shrink-0 border-r border-gray-200 bg-[#FAFAFA] flex flex-col h-full">
      <div className="p-6 border-b border-gray-200">
        <img src="/logo-img.jpeg" alt="Sun Moon Investigators Pvt Ltd" className="h-10 w-auto mb-2" />
        <h1 className="text-xs tracking-widest font-medium uppercase text-gray-900 mb-1 leading-snug">
          Sun Moon
          <br/>
          Investigators
        </h1>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {links.map((link) => {
          const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`)
          const Icon = link.icon

          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-3 py-2 text-sm transition-colors ${
                isActive
                  ? 'bg-gray-100 text-accent font-medium border-l-2 border-accent'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 border-l-2 border-transparent'
              }`}
            >
              <Icon className="w-4 h-4" />
              {link.label}
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-gray-200">
        <div className="mb-4 px-3">
          <p className="text-sm font-medium text-gray-900 truncate">{fullName}</p>
          <p className="text-xs text-gray-500 uppercase tracking-wider mt-0.5">
            {role} {location ? `• ${location}` : ''}
          </p>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-accent transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </aside>
  )
}
