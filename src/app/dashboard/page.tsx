'use client'
export const dynamic = 'force-dynamic'

import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Package, ShoppingBag, ClipboardList, Crown } from 'lucide-react'

export default function Dashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [userStatus, setUserStatus] = useState<any>(null)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    } else if (session?.user) {
      loadUserStatus()
    }
  }, [status, router, session])

  const loadUserStatus = async () => {
    try {
      const response = await fetch('/api/user/status')
      if (response.ok) {
        const data = await response.json()
        setUserStatus(data.user)
        console.log('User status loaded:', data.user)
      }
    } catch (error) {
      console.error('Error loading user status:', error)
    }
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="ghost" size="sm" className="flex items-center gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Home
                </Button>
              </Link>
              <h1 className="text-xl font-semibold text-gray-900">Findora Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">
                Welcome, {session.user?.name || session.user?.email}
              </span>
              {userStatus?.isSuperuser && (
                <Link href="/superuser">
                  <Button size="sm" className="bg-purple-600 hover:bg-purple-700 flex items-center gap-2">
                    <Crown className="h-4 w-4" />
                    Superuser
                  </Button>
                </Link>
              )}
              <Button
                onClick={() => signOut({ callbackUrl: '/' })}
                variant="outline"
                size="sm"
              >
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">User Profile</h2>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <p className="mt-1 text-sm text-gray-900">{session.user?.name || 'Not provided'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <p className="mt-1 text-sm text-gray-900">{session.user?.email}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Role</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {userStatus?.role || session.user?.role || 'Loading...'}
                    {userStatus?.isSuperuser && (
                      <span className="ml-2 px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded">
                        CEO
                      </span>
                    )}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">User ID</label>
                  <p className="mt-1 text-sm text-gray-900 font-mono">{session.user?.id}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 border border-gray-200 rounded-lg">
                  <h3 className="font-medium text-gray-900">Profile Settings</h3>
                  <p className="text-sm text-gray-500 mt-1">Update your personal information</p>
                  <Button 
                    className="mt-3 w-full" 
                    size="sm"
                    onClick={() => router.push('/profile')}
                  >
                    Edit Profile
                  </Button>
                </div>
                <div className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center mb-2">
                    <Package className="h-5 w-5 text-blue-600 mr-2" />
                    <h3 className="font-medium text-gray-900">Browse Products</h3>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">Explore our product catalog</p>
                  <Link href="/products">
                    <Button className="mt-3 w-full" size="sm">
                      Browse Now
                    </Button>
                  </Link>
                </div>
                <div className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center mb-2">
                    <ClipboardList className="h-5 w-5 text-green-600 mr-2" />
                    <h3 className="font-medium text-gray-900">Order History</h3>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">View your past orders</p>
                  <Link href="/orders">
                    <Button className="mt-3 w-full" size="sm" variant="outline">
                      View Orders
                    </Button>
                  </Link>
                </div>
                <div className="p-4 border border-blue-200 rounded-lg bg-blue-50">
                  <div className="flex items-center mb-2">
                    <svg className="w-5 h-5 text-blue-600 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                    <h3 className="font-medium text-gray-900">Become a Seller</h3>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">Start selling your products</p>
                  <Button 
                    className="mt-3 w-full" 
                    size="sm"
                    onClick={() => {
                      if (typeof window !== 'undefined') {
                        window.location.href = '/seller/register'
                      }
                    }}
                  >
                    Get Started
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}