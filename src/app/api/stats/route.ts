import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const where = user.role === 'CUSTOMER' ? { creatorId: user.id } : {}

    const [
      totalTickets,
      openTickets,
      inProgressTickets,
      resolvedTickets,
      criticalTickets,
      slaBreach
    ] = await Promise.all([
      prisma.ticket.count({ where }),
      prisma.ticket.count({ where: { ...where, status: 'OPEN' } }),
      prisma.ticket.count({ where: { ...where, status: 'IN_PROGRESS' } }),
      prisma.ticket.count({ where: { ...where, status: { in: ['RESOLVED', 'CLOSED'] } } }),
      prisma.ticket.count({ where: { ...where, priority: 'CRITICAL', status: { notIn: ['RESOLVED', 'CLOSED'] } } }),
      prisma.ticket.count({
        where: {
          ...where,
          status: { notIn: ['RESOLVED', 'CLOSED'] },
          slaDeadline: { lt: new Date() }
        }
      })
    ])

    return NextResponse.json({
      stats: {
        totalTickets,
        openTickets,
        inProgressTickets,
        resolvedTickets,
        criticalTickets,
        slaBreach
      }
    })
  } catch (error) {
    console.error('Stats error:', error)
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 })
  }
}
