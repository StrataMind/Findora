'use client'
export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { signIn, getSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import BackButton from '@/components/ui/back-button'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Mail, Lock, ArrowLeft, Eye, EyeOff } from 'lucide-react'

const signInSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

type SignInFormData = z.infer<typeof signInSchema>

export default function SignInPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
  })

  const onSubmit = async (data: SignInFormData) => {
    setIsLoading(true)
    setError('')

    try {
      const result = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false,
      })

      if (result?.error) {
        setError('Invalid credentials')
      } else {
        const session = await getSession()
        if (session) {
          router.push('/dashboard')
        }
      }
    } catch (error) {
      setError('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignIn = () => {
    signIn('google', { callbackUrl: '/' })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 relative overflow-hidden">
      {/* Stars Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(80)].map((_, i) => {
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

      <div className="flex items-center justify-center min-h-screen py-12 px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="max-w-md w-full"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Back Button */}
          <div className="mb-8">
            <Link href="/">
              <Button 
                variant="ghost" 
                size="sm" 
                className="flex items-center gap-2 text-amber-100 hover:text-amber-300 hover:bg-amber-500/10 border border-amber-500/30 hover:border-amber-400/50 backdrop-blur-sm"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Home
              </Button>
            </Link>
          </div>

          {/* Main Card */}
          <div className="relative">
            {/* Glow Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-amber-500/20 to-orange-500/20 rounded-3xl blur-2xl"></div>
            
            {/* Card Content */}
            <div className="relative bg-slate-800/40 backdrop-blur-xl border border-amber-500/30 rounded-3xl shadow-2xl p-8">
              {/* Header */}
              <div className="text-center mb-8">
                <motion.h1 
                  className="text-4xl font-bold bg-gradient-to-r from-amber-300 to-orange-400 bg-clip-text text-transparent mb-3"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  Welcome Back
                </motion.h1>
                <motion.p 
                  className="text-slate-300"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                >
                  Sign in to continue your journey
                </motion.p>
              </div>

              <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
                {error && (
                  <motion.div 
                    className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-300 text-sm text-center backdrop-blur-sm"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                  >
                    {error}
                  </motion.div>
                )}
                
                <div className="space-y-5">
                  {/* Email Field */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                  >
                    <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
                      Email address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-amber-400 h-5 w-5" />
                      <Input
                        {...register('email')}
                        type="email"
                        placeholder="Enter your email"
                        className="pl-11 bg-slate-700/30 border-slate-600/50 text-slate-200 placeholder-slate-400 rounded-xl focus:border-amber-400/60 focus:ring-2 focus:ring-amber-500/20 transition-all duration-300"
                      />
                    </div>
                    {errors.email && (
                      <motion.p 
                        className="text-red-400 text-sm mt-2"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                      >
                        {errors.email.message}
                      </motion.p>
                    )}
                  </motion.div>
                  
                  {/* Password Field */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.5 }}
                  >
                    <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-2">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-amber-400 h-5 w-5" />
                      <Input
                        {...register('password')}
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Enter your password"
                        className="pl-11 pr-11 bg-slate-700/30 border-slate-600/50 text-slate-200 placeholder-slate-400 rounded-xl focus:border-amber-400/60 focus:ring-2 focus:ring-amber-500/20 transition-all duration-300"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-amber-400 transition-colors"
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                    {errors.password && (
                      <motion.p 
                        className="text-red-400 text-sm mt-2"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                      >
                        {errors.password.message}
                      </motion.p>
                    )}
                  </motion.div>
                </div>

                {/* Submit Button */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.6 }}
                >
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50"
                  >
                    {isLoading ? 'Signing in...' : 'Sign in'}
                  </Button>
                </motion.div>

                {/* Divider */}
                <motion.div 
                  className="mt-8"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.7 }}
                >
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-slate-600/50" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-4 bg-slate-800/40 text-slate-400">Or continue with</span>
                    </div>
                  </div>

                  {/* Google Sign In */}
                  <div className="mt-6">
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full bg-slate-700/30 border-slate-600/50 text-slate-200 hover:bg-slate-600/40 hover:border-amber-500/50 hover:text-amber-300 py-3 rounded-xl transition-all duration-300"
                      onClick={handleGoogleSignIn}
                    >
                      <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                        <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                      Sign in with Google
                    </Button>
                  </div>
                </motion.div>

                {/* Sign Up Link */}
                <motion.div 
                  className="text-center mt-8"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.8 }}
                >
                  <span className="text-slate-400">
                    Don&apos;t have an account?{' '}
                    <Link href="/auth/signup" className="font-medium text-amber-400 hover:text-amber-300 transition-colors">
                      Sign up
                    </Link>
                  </span>
                </motion.div>
              </form>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}