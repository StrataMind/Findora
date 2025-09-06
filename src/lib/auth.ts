import { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import CredentialsProvider from 'next-auth/providers/credentials'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

// Create a simple Prisma client for auth operations
const authDb = new PrismaClient({
  log: ['error'],
})

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

export const authOptions: NextAuthOptions = {
  // Don't use adapter - handle database operations manually
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 hours
    updateAge: 60 * 60, // Update session every 1 hour
  },
  pages: {
    signIn: '/auth/signin',
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
          role: 'BUYER' // Default role for new users
        }
      }
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials) {
          return null
        }

        const validatedFields = loginSchema.safeParse(credentials)
        if (!validatedFields.success) {
          return null
        }

        const { email, password } = validatedFields.data

        const user = await authDb.user.findUnique({
          where: { email },
        })

        if (!user || !user.password) {
          return null
        }

        const passwordsMatch = await bcrypt.compare(password, user.password)
        
        if (!passwordsMatch) return null
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      // Just allow sign in without database operations for now
      return true
    },
    async redirect({ url, baseUrl }) {
      // Always redirect to home page (/) after any auth operation
      return baseUrl
    },
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role || 'BUYER'
        token.iat = Math.floor(Date.now() / 1000)
      }
      
      // Validate token hasn't expired
      const now = Math.floor(Date.now() / 1000)
      const tokenAge = now - (token.iat as number || 0)
      
      // Force re-authentication after 24 hours
      if (tokenAge > 24 * 60 * 60) {
        return null
      }
      
      return token
    },
    async session({ token, session }) {
      if (token) {
        // Verify user still exists and is active
        try {
          const user = await authDb.user.findUnique({
            where: { id: token.sub! },
            select: { 
              id: true, 
              email: true, 
              role: true, 
              name: true,
              updatedAt: true
            }
          })
          
          if (!user) {
            // User no longer exists, invalidate session
            return null
          }
          
          session.user.id = user.id
          session.user.role = user.role
          session.user.name = user.name
          session.user.email = user.email
        } catch (error) {
          // Database error, invalidate session for safety
          return null
        }
      }
      return session
    },
  },
}