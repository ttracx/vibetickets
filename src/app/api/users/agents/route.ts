import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user || user.role === 'CUSTOMER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const agents = await prisma.user.findMany({
      where: {
        role: { in: ['AGENT', 'ADMIN'] }
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        _count: {
          select: { assignedTickets: true }
        }
      }
    })

    return NextResponse.json({ agents })
  } catch (error) {
    console.error('Get agents error:', error)
    return NextResponse.json({ error: 'Failed to fetch agents' }, { status: 500 })
  }
}
