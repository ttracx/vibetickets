import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const ticket = await prisma.ticket.findUnique({
      where: { id },
      include: {
        creator: { select: { id: true, name: true, email: true } },
        assignee: { select: { id: true, name: true, email: true } },
        comments: {
          include: {
            author: { select: { id: true, name: true, email: true, role: true } }
          },
          orderBy: { createdAt: 'asc' }
        },
        tags: true
      }
    })

    if (!ticket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 })
    }

    // Customers can only see their own tickets
    if (user.role === 'CUSTOMER' && ticket.creatorId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    return NextResponse.json({ ticket })
  } catch (error) {
    console.error('Get ticket error:', error)
    return NextResponse.json({ error: 'Failed to fetch ticket' }, { status: 500 })
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const updates = await request.json()

    const ticket = await prisma.ticket.findUnique({
      where: { id }
    })

    if (!ticket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 })
    }

    // Only agents and admins can update most fields
    if (user.role === 'CUSTOMER') {
      // Customers can only close their own tickets
      if (ticket.creatorId !== user.id) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }
      if (updates.status && updates.status !== 'CLOSED') {
        return NextResponse.json({ error: 'Customers can only close tickets' }, { status: 403 })
      }
    }

    const data: Record<string, unknown> = {}
    
    if (updates.status) {
      data.status = updates.status
      if (updates.status === 'RESOLVED' || updates.status === 'CLOSED') {
        data.resolvedAt = new Date()
      }
    }
    
    if (updates.priority) data.priority = updates.priority
    if (updates.assigneeId !== undefined) data.assigneeId = updates.assigneeId

    const updatedTicket = await prisma.ticket.update({
      where: { id },
      data,
      include: {
        creator: { select: { id: true, name: true, email: true } },
        assignee: { select: { id: true, name: true, email: true } }
      }
    })

    return NextResponse.json({ ticket: updatedTicket })
  } catch (error) {
    console.error('Update ticket error:', error)
    return NextResponse.json({ error: 'Failed to update ticket' }, { status: 500 })
  }
}
