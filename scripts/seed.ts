import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 12)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@vibetickets.com' },
    update: {},
    create: {
      email: 'admin@vibetickets.com',
      name: 'Admin User',
      password: adminPassword,
      role: 'ADMIN'
    }
  })
  console.log('Admin user created:', admin.email)

  // Create an agent
  const agentPassword = await bcrypt.hash('agent123', 12)
  const agent = await prisma.user.upsert({
    where: { email: 'agent@vibetickets.com' },
    update: {},
    create: {
      email: 'agent@vibetickets.com',
      name: 'Support Agent',
      password: agentPassword,
      role: 'AGENT'
    }
  })
  console.log('Agent user created:', agent.email)

  // Create default SLA policy
  const slaPolicy = await prisma.sLAPolicy.upsert({
    where: { id: 'default' },
    update: {},
    create: {
      id: 'default',
      name: 'Default SLA Policy',
      description: 'Standard SLA policy for all tickets',
      isDefault: true
    }
  })
  console.log('Default SLA policy created:', slaPolicy.name)

  // Create some sample canned responses
  const responses = [
    {
      title: 'Greeting',
      content: 'Hello! Thank you for contacting VibeTickets support. How can I help you today?',
      shortcut: '/greet',
      category: 'General'
    },
    {
      title: 'Request More Info',
      content: 'Thank you for reaching out. To better assist you, could you please provide more details about the issue you\'re experiencing? Including steps to reproduce the problem would be very helpful.',
      shortcut: '/moreinfo',
      category: 'General'
    },
    {
      title: 'Issue Resolved',
      content: 'I\'m glad we could resolve this issue for you! If you have any other questions or concerns, please don\'t hesitate to reach out. Have a great day!',
      shortcut: '/resolved',
      category: 'Closing'
    },
    {
      title: 'Escalating',
      content: 'I\'m escalating this ticket to our senior support team for further investigation. They will get back to you within 24 hours. Thank you for your patience.',
      shortcut: '/escalate',
      category: 'Support'
    }
  ]

  for (const response of responses) {
    await prisma.cannedResponse.upsert({
      where: { id: response.shortcut },
      update: {},
      create: {
        id: response.shortcut,
        ...response,
        createdById: admin.id
      }
    })
  }
  console.log('Sample canned responses created')

  console.log('\n✅ Seed completed successfully!')
  console.log('\nTest accounts:')
  console.log('  Admin: admin@vibetickets.com / admin123')
  console.log('  Agent: agent@vibetickets.com / agent123')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
