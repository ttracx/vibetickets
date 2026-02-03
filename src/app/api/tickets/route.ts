import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { calculateSLADeadline } from '@/lib/utils'

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const priority = searchParams.get('priority')

    const where: Record<string, unknown> = {}
    
    // Customers can only see their own tickets
    if (user.role === 'CUSTOMER') {
      where.creatorId = user.id
    }
    
    // Agents can see assigned tickets or unassigned
    if (user.role === 'AGENT') {
      where.OR = [
        { assigneeId: user.id },
        { assigneeId: null }
      ]
    }
    
    if (status) where.status = status
    if (priority) where.priority = priority

    const tickets = await prisma.ticket.findMany({
      where,
      include: {
        creator: { select: { id: true, name: true, email: true } },
        assignee: { select: { id: true, name: true, email: true } },
        _count: { select: { comments: true } }
      },
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'desc' }
      ]
    })

    return NextResponse.json({ tickets })
  } catch (error) {
    console.error('Get tickets error:', error)
    return NextResponse.json({ error: 'Failed to fetch tickets' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { subject, description, priority = 'MEDIUM' } = await request.json()

    if (!subject || !description) {
      return NextResponse.json(
        { error: 'Subject and description are required' },
        { status: 400 }
      )
    }

    const createdAt = new Date()
    const slaDeadline = calculateSLADeadline(priority, createdAt)

    const ticket = await prisma.ticket.create({
      data: {
        subject,
        description,
        priority,
        creatorId: user.id,
        slaDeadline
      },
      include: {
        creator: { select: { id: true, name: true, email: true } }
      }
    })

    return NextResponse.json({ ticket }, { status: 201 })
  } catch (error) {
    console.error('Create ticket error:', error)
    return NextResponse.json({ error: 'Failed to create ticket' }, { status: 500 })
  }
}
