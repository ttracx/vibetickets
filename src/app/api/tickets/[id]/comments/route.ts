import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const { content, isInternal = false } = await request.json()

    if (!content) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 })
    }

    const ticket = await prisma.ticket.findUnique({
      where: { id }
    })

    if (!ticket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 })
    }

    // Customers can only see their own tickets
    if (user.role === 'CUSTOMER' && ticket.creatorId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Customers cannot create internal comments
    const internal = user.role === 'CUSTOMER' ? false : isInternal

    const comment = await prisma.ticketComment.create({
      data: {
        content,
        isInternal: internal,
        ticketId: id,
        authorId: user.id
      },
      include: {
        author: { select: { id: true, name: true, email: true, role: true } }
      }
    })

    // Update first response time if this is the first agent/admin response
    if ((user.role === 'AGENT' || user.role === 'ADMIN') && !ticket.firstResponseAt) {
      await prisma.ticket.update({
        where: { id },
        data: { firstResponseAt: new Date() }
      })
    }

    // Auto-update status if needed
    if (user.role !== 'CUSTOMER' && ticket.status === 'OPEN') {
      await prisma.ticket.update({
        where: { id },
        data: { status: 'IN_PROGRESS' }
      })
    }

    return NextResponse.json({ comment }, { status: 201 })
  } catch (error) {
    console.error('Create comment error:', error)
    return NextResponse.json({ error: 'Failed to create comment' }, { status: 500 })
  }
}
