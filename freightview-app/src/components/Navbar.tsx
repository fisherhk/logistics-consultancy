'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'
import type { Profile } from '@/types/database'

interface NavbarProps {
  user: User
  profile: Profile | null
}

export default function Navbar({ user, profile }: NavbarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const navItems = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/requests', label: 'Requests' },
    { href: '/settings', label: 'Settings' },
  ]

  return (
    <nav className="bg-slate-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-8">
            <Link href="/dashboard" className="flex items-center gap-2">
              <span className="text-xl font-bold">FreightView</span>
              <span className="text-xs text-slate-400">by GlobalLogistics</span>
            </Link>

            {/* Nav Links */}
            <div className="hidden md:flex items-center gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    pathname === item.href || pathname.startsWith(item.href + '/')
                      ? 'bg-primary-600 text-white'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-4">
            <Link
              href="/requests/new"
              className="bg-primary-600 hover:bg-primary-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              + New Request
            </Link>

            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <div className="text-sm font-medium">{profile?.company_name || 'User'}</div>
                <div className="text-xs text-slate-400">{user.email}</div>
              </div>
              <button
                onClick={handleLogout}
                className="text-slate-300 hover:text-white text-sm font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}
