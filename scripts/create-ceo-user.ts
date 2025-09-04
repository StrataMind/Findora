import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function createCEOUser() {
  const email = 'surajskkna@gmail.com'
  const name = 'Suraj Kumar'
  
  try {
    console.log(`🎯 Creating CEO user account for: ${email}`)
    
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      console.log('✅ User already exists, promoting to CEO...')
    } else {
      console.log('🆕 Creating new user account...')
      // Create user with CEO privileges from the start
      await prisma.user.create({
        data: {
          email,
          name,
          role: 'CEO',
          isSuperuser: true,
          superuserLevel: 'CEO',
          superuserSince: new Date(),
          emailVerified: new Date(), // OAuth emails are pre-verified
          canCreateProducts: true,
          canModerateContent: true,
          canViewAnalytics: true,
          canManageUsers: true,
          canFeatureProducts: true,
        }
      })
      console.log('✅ User created successfully!')
    }

    // Update to CEO if not already
    const updatedUser = await prisma.user.update({
      where: { email },
      data: {
        role: 'CEO',
        isSuperuser: true,
        superuserLevel: 'CEO',
        superuserSince: new Date(),
        canCreateProducts: true,
        canModerateContent: true,
        canViewAnalytics: true,
        canManageUsers: true,
        canFeatureProducts: true,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isSuperuser: true,
        superuserLevel: true,
      }
    })

    console.log('\n🎉 CEO Setup Complete!')
    console.log('=' .repeat(50))
    console.log(`📧 Email: ${updatedUser.email}`)
    console.log(`👤 Name: ${updatedUser.name}`)
    console.log(`👑 Role: ${updatedUser.role}`)
    console.log(`⚡ Superuser Level: ${updatedUser.superuserLevel}`)
    console.log('\n🚀 You can now access:')
    console.log('   • /superuser - Admin dashboard')
    console.log('   • /superuser/products/create - Create products directly')
    console.log('   • Full platform management features')

  } catch (error) {
    console.error('❌ Error setting up CEO:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createCEOUser()