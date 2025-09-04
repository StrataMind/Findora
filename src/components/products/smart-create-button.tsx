'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { useSession } from 'next-auth/react'
import { Plus, Crown, Shield, Store, Zap } from 'lucide-react'

interface UserStatus {
  id: string
  role: string
  isSuperuser: boolean
  superuserLevel: string | null
  isVerifiedSeller: boolean
  sellerProfile: {
    id: string
    verificationStatus: string
    isOfficial: boolean
  } | null
}

export function SmartCreateButton() {
  const { data: session, status } = useSession()
  const [userStatus, setUserStatus] = useState<UserStatus | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.id) {
      fetchUserStatus()
    } else if (status === 'unauthenticated') {
      setLoading(false)
    }
  }, [session, status])

  const fetchUserStatus = async () => {
    try {
      const response = await fetch('/api/user/status')
      if (response.ok) {
        const userData = await response.json()
        setUserStatus(userData)
      }
    } catch (error) {
      console.error('Error fetching user status:', error)
    } finally {
      setLoading(false)
    }
  }

  // Don't show button if not authenticated
  if (status === 'unauthenticated') {
    return null
  }

  // Show loading state
  if (loading || status === 'loading') {
    return (
      <div className="flex justify-center">
        <Button disabled className="bg-gray-100">
          <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin mr-2" />
          Loading...
        </Button>
      </div>
    )
  }

  // No user status means something went wrong
  if (!userStatus) {
    return null
  }

  // Superuser - gets premium create product access
  if (userStatus.isSuperuser) {
    return (
      <div className="flex justify-center">
        <Link href="/superuser/products/create">
          <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg">
            <Crown className="w-4 h-4 mr-2" />
            Create Product (CEO)
            <Zap className="w-4 h-4 ml-2" />
          </Button>
        </Link>
      </div>
    )
  }

  // Verified seller - gets standard create product access
  if (userStatus.isVerifiedSeller && userStatus.sellerProfile?.verificationStatus === 'VERIFIED') {
    return (
      <div className="flex justify-center">
        <Link href="/seller/products/create">
          <Button className="bg-green-600 hover:bg-green-700 text-white">
            <Shield className="w-4 h-4 mr-2" />
            Create Product (Verified Seller)
          </Button>
        </Link>
      </div>
    )
  }

  // Has seller profile but not verified
  if (userStatus.sellerProfile) {
    const status = userStatus.sellerProfile.verificationStatus
    return (
      <div className="flex justify-center">
        <div className="text-center">
          <Button disabled className="bg-yellow-100 text-yellow-800 border border-yellow-300">
            <Store className="w-4 h-4 mr-2" />
            Seller Verification {status === 'PENDING' ? 'Pending' : 'Required'}
          </Button>
          <p className="text-xs text-gray-600 mt-1">
            {status === 'PENDING' 
              ? 'Your seller account is under review' 
              : 'Complete seller verification to create products'
            }
          </p>
        </div>
      </div>
    )
  }

  // No seller profile - show become seller button
  return (
    <div className="flex justify-center">
      <Link href="/seller/register">
        <Button variant="outline" className="border-blue-300 text-blue-600 hover:bg-blue-50">
          <Plus className="w-4 h-4 mr-2" />
          Become a Seller
        </Button>
      </Link>
    </div>
  )
}