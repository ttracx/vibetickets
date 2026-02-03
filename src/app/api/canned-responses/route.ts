import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user || user.role === 'CUSTOMER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const responses = await prisma.cannedResponse.findMany({
      orderBy: { title: 'asc' },
      include: {
        createdBy: { select: { name: true } }
      }
    })

    return NextResponse.json({ responses })
  } catch (error) {
    console.error('Get canned responses error:', error)
    return NextResponse.json({ error: 'Failed to fetch canned responses' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role === 'CUSTOMER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { title, content, shortcut, category } = await request.json()

    if (!title || !content) {
      return NextResponse.json(
        { error: 'Title and content are required' },
        { status: 400 }
      )
    }

    const response = await prisma.cannedResponse.create({
      data: {
        title,
        content,
        shortcut,
        category,
        createdById: user.id
      }
    })

    return NextResponse.json({ response }, { status: 201 })
  } catch (error) {
    console.error('Create canned response error:', error)
    return NextResponse.json({ error: 'Failed to create canned response' }, { status: 500 })
  }
}
