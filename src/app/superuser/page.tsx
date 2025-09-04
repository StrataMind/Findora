import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getSuperuserPermissions, getSuperuserStats } from '@/lib/superuser'
import { SuperuserDashboard } from '@/components/superuser/dashboard'
import { db } from '@/lib/db'
import { Shield, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default async function SuperuserPage() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    redirect('/auth/signin')
  }

  // Get fresh user data to check superuser status
  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      isSuperuser: true,
      superuserLevel: true,
      superuserSince: true,
      canCreateProducts: true,
      canModerateContent: true,
      canViewAnalytics: true,
      canManageUsers: true,
      canFeatureProducts: true
    }
  })

  console.log('Superuser page - session user ID:', session.user.id)
  console.log('Superuser page - user lookup result:', user)
  console.log('Superuser page - user.isSuperuser:', user?.isSuperuser)

  if (!user || !user.isSuperuser) {
    console.log('Superuser page - redirecting to dashboard, user:', user)
    redirect('/dashboard')
  }

  const permissions = getSuperuserPermissions(user as any)
  const stats = await getSuperuserStats(user.id)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 py-6">
          {/* Back Button */}
          <div className="mb-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
              </Button>
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <div className="bg-purple-100 p-3 rounded-lg">
              <Shield className="h-8 w-8 text-purple-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Superuser Dashboard</h1>
              <div className="flex items-center gap-4 text-gray-600 mt-1">
                <span className="flex items-center gap-2">
                  <span className="text-sm font-medium">Level:</span>
                  <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">
                    {user.superuserLevel}
                  </span>
                </span>
                {user.superuserSince && (
                  <span className="text-sm">
                    Since: {user.superuserSince.toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <SuperuserDashboard 
        user={user} 
        permissions={permissions} 
        stats={stats}
      />
    </div>
  )
}