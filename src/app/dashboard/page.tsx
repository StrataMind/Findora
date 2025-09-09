'use client'
export const dynamic = 'force-dynamic'

import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Package, ShoppingBag, ClipboardList, Crown, User, Mail, Settings, Star, Heart, TrendingUp, Eye } from 'lucide-react'

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
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 flex items-center justify-center">
        <motion.div 
          className="flex flex-col items-center gap-4"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
        >
          <div className="w-12 h-12 border-4 border-amber-500/30 border-t-amber-500 rounded-full animate-spin"></div>
          <div className="text-lg text-amber-300 font-medium">Loading Dashboard...</div>
        </motion.div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 relative overflow-hidden">
      {/* Stars Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(60)].map((_, i) => {
          const seed1 = (i * 7919) % 10000
          const seed2 = (i * 6151) % 10000
          const top = (seed1 / 100).toFixed(2)
          const left = (seed2 / 100).toFixed(2)
          const duration = 2 + ((i * 31) % 300) / 100
          const delay = ((i * 17) % 200) / 100
          
          return (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-amber-300 rounded-full"
              style={{ top: `${top}%`, left: `${left}%` }}
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration, delay, repeat: Infinity }}
            />
          )
        })}
      </div>

      {/* Navigation */}
      <nav className="relative bg-slate-800/50 backdrop-blur-xl border-b border-amber-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-6">
              <Link href="/">
                <Button variant="ghost" size="sm" className="flex items-center gap-2 text-amber-100 hover:text-amber-300 hover:bg-amber-500/10 border border-amber-500/30 hover:border-amber-400/50">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Home
                </Button>
              </Link>
              <motion.h1 
                className="text-xl font-bold bg-gradient-to-r from-amber-300 to-orange-400 bg-clip-text text-transparent"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
              >
                Dashboard
              </motion.h1>
            </div>
            <div className="flex items-center space-x-4">
              <motion.span 
                className="text-sm text-slate-300"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                Welcome, {session.user?.name || session.user?.email}
              </motion.span>
              {userStatus?.isSuperuser && (
                <Link href="/superuser">
                  <Button size="sm" className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 flex items-center gap-2 shadow-lg">
                    <Crown className="h-4 w-4" />
                    Superuser
                  </Button>
                </Link>
              )}
              <Button
                onClick={() => signOut({ callbackUrl: '/' })}
                variant="outline"
                size="sm"
                className="border-slate-600/50 text-slate-200 hover:bg-slate-700/50 hover:border-amber-500/50 hover:text-amber-300"
              >
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <main className="relative max-w-7xl mx-auto py-8 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Welcome Section */}
          <motion.div 
            className="mb-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-amber-500/20 to-orange-500/20 rounded-3xl blur-2xl"></div>
              <div className="relative bg-slate-800/40 backdrop-blur-xl border border-amber-500/30 rounded-3xl shadow-2xl p-8">
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full flex items-center justify-center">
                    <User className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-slate-200 mb-2">Welcome back!</h2>
                    <p className="text-slate-400">Here's what's happening with your account today.</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Profile Card */}
          <motion.div 
            className="mb-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 to-orange-500/10 rounded-2xl blur-lg"></div>
              <div className="relative bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-xl overflow-hidden">
                <div className="px-6 py-5">
                  <div className="flex items-center gap-3 mb-6">
                    <Settings className="h-6 w-6 text-amber-400" />
                    <h2 className="text-xl font-bold text-slate-200">Profile Information</h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-slate-400">Full Name</label>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-amber-400" />
                        <p className="text-slate-200 font-medium">{session.user?.name || 'Not provided'}</p>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-slate-400">Email Address</label>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-amber-400" />
                        <p className="text-slate-200 font-medium">{session.user?.email}</p>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-slate-400">Account Role</label>
                      <div className="flex items-center gap-2">
                        <Crown className="h-4 w-4 text-amber-400" />
                        <p className="text-slate-200 font-medium">
                          {userStatus?.role || session.user?.role || 'Loading...'}
                          {userStatus?.isSuperuser && (
                            <span className="ml-2 px-3 py-1 text-xs bg-gradient-to-r from-purple-500/20 to-indigo-500/20 text-purple-300 rounded-full border border-purple-500/30">
                              CEO
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-slate-400">User ID</label>
                      <p className="text-slate-300 font-mono text-sm bg-slate-700/30 px-3 py-2 rounded-lg border border-slate-600/50">{session.user?.id}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div 
            className="mb-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 to-orange-500/10 rounded-2xl blur-lg"></div>
              <div className="relative bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-xl overflow-hidden">
                <div className="px-6 py-5">
                  <div className="flex items-center gap-3 mb-6">
                    <TrendingUp className="h-6 w-6 text-amber-400" />
                    <h2 className="text-xl font-bold text-slate-200">Quick Actions</h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Profile Settings */}
                    <motion.div 
                      className="group relative cursor-pointer"
                      whileHover={{ scale: 1.02 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <div className="relative bg-slate-700/30 border border-slate-600/50 rounded-xl p-5 group-hover:border-blue-500/50 transition-all duration-300">
                        <div className="flex items-center mb-3">
                          <Settings className="h-6 w-6 text-blue-400" />
                          <h3 className="font-bold text-slate-200 ml-2">Profile Settings</h3>
                        </div>
                        <p className="text-sm text-slate-400 mb-4 leading-relaxed">Update your personal information and preferences</p>
                        <Button 
                          className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white shadow-lg" 
                          size="sm"
                          onClick={() => router.push('/profile')}
                        >
                          Edit Profile
                        </Button>
                      </div>
                    </motion.div>

                    {/* Browse Products */}
                    <motion.div 
                      className="group relative cursor-pointer"
                      whileHover={{ scale: 1.02 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <div className="relative bg-slate-700/30 border border-slate-600/50 rounded-xl p-5 group-hover:border-green-500/50 transition-all duration-300">
                        <div className="flex items-center mb-3">
                          <Package className="h-6 w-6 text-green-400" />
                          <h3 className="font-bold text-slate-200 ml-2">Browse Products</h3>
                        </div>
                        <p className="text-sm text-slate-400 mb-4 leading-relaxed">Explore our vast product catalog</p>
                        <Link href="/products">
                          <Button className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-lg" size="sm">
                            Browse Now
                          </Button>
                        </Link>
                      </div>
                    </motion.div>

                    {/* Order History */}
                    <motion.div 
                      className="group relative cursor-pointer"
                      whileHover={{ scale: 1.02 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <div className="relative bg-slate-700/30 border border-slate-600/50 rounded-xl p-5 group-hover:border-orange-500/50 transition-all duration-300">
                        <div className="flex items-center mb-3">
                          <ClipboardList className="h-6 w-6 text-orange-400" />
                          <h3 className="font-bold text-slate-200 ml-2">Order History</h3>
                        </div>
                        <p className="text-sm text-slate-400 mb-4 leading-relaxed">View your past orders and purchases</p>
                        <Link href="/orders">
                          <Button className="w-full bg-slate-600/50 border border-orange-500/50 text-orange-300 hover:bg-orange-500/20 hover:text-orange-200 shadow-lg" size="sm" variant="outline">
                            View Orders
                          </Button>
                        </Link>
                      </div>
                    </motion.div>

                    {/* Become a Seller */}
                    <motion.div 
                      className="group relative cursor-pointer"
                      whileHover={{ scale: 1.02 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-amber-500/20 to-orange-500/20 rounded-xl blur-2xl opacity-60 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <div className="relative bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/50 rounded-xl p-5 group-hover:border-amber-400/70 transition-all duration-300">
                        <div className="flex items-center mb-3">
                          <Star className="h-6 w-6 text-amber-400" />
                          <h3 className="font-bold text-amber-200 ml-2">Become a Seller</h3>
                        </div>
                        <p className="text-sm text-amber-300/80 mb-4 leading-relaxed">Start selling your products today</p>
                        <Button 
                          className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold shadow-lg hover:shadow-xl" 
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
                    </motion.div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Stats Section */}
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 rounded-2xl blur-lg"></div>
              <div className="relative bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm font-medium">Total Orders</p>
                    <p className="text-2xl font-bold text-slate-200 mt-1">0</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                    <ShoppingBag className="h-6 w-6 text-blue-400" />
                  </div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-2xl blur-lg"></div>
              <div className="relative bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm font-medium">Wishlist Items</p>
                    <p className="text-2xl font-bold text-slate-200 mt-1">0</p>
                  </div>
                  <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                    <Heart className="h-6 w-6 text-green-400" />
                  </div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-2xl blur-lg"></div>
              <div className="relative bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm font-medium">Profile Views</p>
                    <p className="text-2xl font-bold text-slate-200 mt-1">0</p>
                  </div>
                  <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                    <Eye className="h-6 w-6 text-purple-400" />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  )
}