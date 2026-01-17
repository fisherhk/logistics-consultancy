'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface DemoUser {
  email: string
  company_name: string
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [user, setUser] = useState<DemoUser | null>(null)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const demoUser = localStorage.getItem('demo_user')
    if (demoUser) {
      setUser(JSON.parse(demoUser))
    } else {
      router.push('/login')
    }
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem('demo_user')
    router.push('/login')
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-500">Loading...</div>
      </div>
    )
  }

  const navItems = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/requests', label: 'Requests' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-8">
              <Link href="/dashboard" className="flex items-center gap-2">
                <span className="text-xl font-bold">FreightView</span>
                <span className="text-xs text-slate-400">Demo</span>
              </Link>

              {/* Nav Links */}
              <div className="hidden md:flex items-center gap-1">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      pathname === item.href || pathname.startsWith(item.href + '/')
                        ? 'bg-blue-600 text-white'
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
                className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                + New Request
              </Link>

              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <div className="text-sm font-medium">{user.company_name}</div>
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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  )
}
