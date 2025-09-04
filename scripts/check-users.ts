import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkUsers() {
  try {
    console.log('🔍 Checking existing users in database...\n')
    
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isSuperuser: true,
        superuserLevel: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 10
    })

    if (users.length === 0) {
      console.log('❌ No users found in database.')
      console.log('You need to sign up on the platform first!')
      return
    }

    console.log(`✅ Found ${users.length} user(s):`)
    console.log('=' .repeat(60))
    
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.email}`)
      console.log(`   Name: ${user.name || 'Not set'}`)
      console.log(`   Role: ${user.role}`)
      console.log(`   Superuser: ${user.isSuperuser ? `Yes (${user.superuserLevel})` : 'No'}`)
      console.log(`   Created: ${user.createdAt.toLocaleDateString()}`)
      console.log('')
    })

    const superusers = users.filter(u => u.isSuperuser)
    if (superusers.length > 0) {
      console.log(`👑 Current superusers: ${superusers.length}`)
    } else {
      console.log('👤 No superusers yet - you can promote any of these emails to CEO')
    }

  } catch (error) {
    console.error('Error checking users:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkUsers()