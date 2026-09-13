'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LayoutDashboard, Users, FileText, LogOut, Menu, X, Bell } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'

export default function MobileNav({ role, fullName, location, unreadCount = 0 }) {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const adminLinks = [
    { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/cases', label: 'Cases', icon: FileText },
    { href: '/admin/agents', label: 'Agents', icon: Users },
    { href: '/admin/notifications', label: 'Notifications', icon: Bell, badge: unreadCount },
  ]

  const agentLinks = [
    { href: '/agent/dashboard', label: 'My Cases', icon: LayoutDashboard },
  ]

  const links = role === 'admin' ? adminLinks : agentLinks

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  // Close the menu when a link is clicked
  const handleLinkClick = () => {
    setIsOpen(false)
  }

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="md:hidden flex items-center justify-between p-4 bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <img src="/logo-img.jpeg" alt="Sun Moon" className="h-8 w-auto" />
          <h1 className="text-xs tracking-widest font-medium uppercase text-gray-900 leading-tight">
            Sun Moon
          </h1>
        </div>
        <button
          onClick={() => setIsOpen(true)}
          className="p-2 -mr-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
          aria-label="Open menu"
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* Mobile Drawer Overlay */}
      {isOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-gray-900/50 transition-opacity" 
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />

          {/* Drawer Content */}
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-[#FAFAFA] border-r border-gray-200">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img src="/logo-img.jpeg" alt="Sun Moon" className="h-8 w-auto" />
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 -mr-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
              {links.map((link) => {
                const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`)
                const Icon = link.icon

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={handleLinkClick}
                    className={`flex items-center justify-between px-3 py-3 text-sm transition-colors rounded-md ${
                      isActive
                        ? 'bg-gray-100 text-accent font-medium'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-5 h-5" />
                      {link.label}
                    </div>
                    {link.badge !== undefined && link.badge > 0 && (
                      <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                        {link.badge}
                      </span>
                    )}
                  </Link>
                )
              })}
            </nav>

            <div className="p-4 border-t border-gray-200 bg-white">
              <div className="mb-4 px-3">
                <p className="text-sm font-medium text-gray-900 truncate">{fullName}</p>
                <p className="text-xs text-gray-500 uppercase tracking-wider mt-0.5">
                  {role} {location ? `• ${location}` : ''}
                </p>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-3 text-sm text-gray-600 hover:bg-gray-50 hover:text-accent transition-colors rounded-md"
              >
                <LogOut className="w-5 h-5" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
