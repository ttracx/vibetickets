'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Ticket, LayoutDashboard, Plus, MessageSquare, Settings, LogOut, Users, FileText } from 'lucide-react'

interface User {
  id: string
  email: string
  name: string | null
  role: 'CUSTOMER' | 'AGENT' | 'ADMIN'
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (data.user) {
          setUser(data.user)
        } else {
          router.push('/login')
        }
      })
      .catch(() => router.push('/login'))
      .finally(() => setLoading(false))
  }, [router])

  const handleSignOut = async () => {
    await fetch('/api/auth/signout', { method: 'POST' })
    router.push('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-indigo-600 border-t-transparent rounded-full"></div>
      </div>
    )
  }

  if (!user) return null

  const isAgent = user.role === 'AGENT' || user.role === 'ADMIN'

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 w-64 bg-white border-r">
        <div className="flex items-center gap-2 h-16 px-6 border-b">
          <Ticket className="h-6 w-6 text-indigo-600" />
          <span className="font-bold">VibeTickets</span>
        </div>
        <nav className="p-4 space-y-1">
          <Link href="/dashboard">
            <Button variant="ghost" className="w-full justify-start">
              <LayoutDashboard className="mr-2 h-4 w-4" />
              Dashboard
            </Button>
          </Link>
          <Link href="/dashboard/tickets">
            <Button variant="ghost" className="w-full justify-start">
              <Ticket className="mr-2 h-4 w-4" />
              Tickets
            </Button>
          </Link>
          <Link href="/dashboard/tickets/new">
            <Button variant="ghost" className="w-full justify-start">
              <Plus className="mr-2 h-4 w-4" />
              New Ticket
            </Button>
          </Link>
          {isAgent && (
            <>
              <Link href="/dashboard/canned-responses">
                <Button variant="ghost" className="w-full justify-start">
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Canned Responses
                </Button>
              </Link>
              <Link href="/dashboard/team">
                <Button variant="ghost" className="w-full justify-start">
                  <Users className="mr-2 h-4 w-4" />
                  Team
                </Button>
              </Link>
            </>
          )}
          <Link href="/dashboard/settings">
            <Button variant="ghost" className="w-full justify-start">
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Button>
          </Link>
        </nav>
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center">
              <span className="text-indigo-600 font-medium text-sm">
                {user.name?.[0] || user.email[0].toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user.name || user.email}</p>
              <p className="text-xs text-gray-500 capitalize">{user.role.toLowerCase()}</p>
            </div>
          </div>
          <Button variant="ghost" className="w-full justify-start text-red-600" onClick={handleSignOut}>
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <main className="pl-64">
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  )
}
