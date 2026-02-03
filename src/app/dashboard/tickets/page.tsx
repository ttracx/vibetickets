'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, Filter } from 'lucide-react'
import { formatDate, getStatusColor, getPriorityColor, getSLAStatus } from '@/lib/utils'

interface Ticket {
  id: string
  number: number
  subject: string
  status: string
  priority: string
  slaDeadline: string | null
  createdAt: string
  creator: { name: string | null; email: string }
  assignee: { name: string | null; email: string } | null
  _count: { comments: number }
}

export default function TicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [priorityFilter, setPriorityFilter] = useState<string>('all')

  useEffect(() => {
    const params = new URLSearchParams()
    if (statusFilter !== 'all') params.set('status', statusFilter)
    if (priorityFilter !== 'all') params.set('priority', priorityFilter)

    fetch(`/api/tickets?${params.toString()}`)
      .then(res => res.json())
      .then(data => setTickets(data.tickets || []))
      .finally(() => setLoading(false))
  }, [statusFilter, priorityFilter])

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Tickets</h1>
        <Link href="/dashboard/tickets/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Ticket
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-500" />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="OPEN">Open</SelectItem>
              <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
              <SelectItem value="WAITING_CUSTOMER">Waiting</SelectItem>
              <SelectItem value="RESOLVED">Resolved</SelectItem>
              <SelectItem value="CLOSED">Closed</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priority</SelectItem>
            <SelectItem value="LOW">Low</SelectItem>
            <SelectItem value="MEDIUM">Medium</SelectItem>
            <SelectItem value="HIGH">High</SelectItem>
            <SelectItem value="CRITICAL">Critical</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Tickets List */}
      <Card>
        <CardHeader>
          <CardTitle>
            {tickets.length} ticket{tickets.length !== 1 ? 's' : ''}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin h-8 w-8 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto"></div>
            </div>
          ) : tickets.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No tickets found
            </div>
          ) : (
            <div className="space-y-3">
              {tickets.map(ticket => {
                const sla = getSLAStatus(ticket.slaDeadline ? new Date(ticket.slaDeadline) : null)
                return (
                  <Link
                    key={ticket.id}
                    href={`/dashboard/tickets/${ticket.id}`}
                    className="block p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-gray-500 text-sm font-mono">#{ticket.number}</span>
                          <Badge className={getPriorityColor(ticket.priority)}>
                            {ticket.priority}
                          </Badge>
                          {ticket.status !== 'RESOLVED' && ticket.status !== 'CLOSED' && (
                            <span className={`text-xs ${sla.color}`}>
                              SLA: {sla.status}
                            </span>
                          )}
                        </div>
                        <h3 className="font-medium mb-1">{ticket.subject}</h3>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span>{ticket.creator.name || ticket.creator.email}</span>
                          <span>{formatDate(ticket.createdAt)}</span>
                          {ticket.assignee && (
                            <span>→ {ticket.assignee.name || ticket.assignee.email}</span>
                          )}
                          <span>{ticket._count.comments} comments</span>
                        </div>
                      </div>
                      <Badge className={getStatusColor(ticket.status)}>
                        {ticket.status.replace('_', ' ')}
                      </Badge>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
