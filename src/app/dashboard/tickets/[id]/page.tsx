'use client'

import { useEffect, useState, use } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { formatDate, getStatusColor, getPriorityColor, getSLAStatus } from '@/lib/utils'
import { ArrowLeft, Send, Clock, User, AlertTriangle } from 'lucide-react'

interface Comment {
  id: string
  content: string
  isInternal: boolean
  createdAt: string
  author: { id: string; name: string | null; email: string; role: string }
}

interface TicketDetail {
  id: string
  number: number
  subject: string
  description: string
  status: string
  priority: string
  slaDeadline: string | null
  firstResponseAt: string | null
  resolvedAt: string | null
  createdAt: string
  creator: { id: string; name: string | null; email: string }
  assignee: { id: string; name: string | null; email: string } | null
  comments: Comment[]
}

interface Agent {
  id: string
  name: string | null
  email: string
}

interface CannedResponse {
  id: string
  title: string
  content: string
}

export default function TicketDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [ticket, setTicket] = useState<TicketDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [comment, setComment] = useState('')
  const [isInternal, setIsInternal] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [agents, setAgents] = useState<Agent[]>([])
  const [cannedResponses, setCannedResponses] = useState<CannedResponse[]>([])
  const [currentUser, setCurrentUser] = useState<{ role: string } | null>(null)

  useEffect(() => {
    fetch(`/api/tickets/${id}`)
      .then(res => res.json())
      .then(data => setTicket(data.ticket))
      .finally(() => setLoading(false))

    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        setCurrentUser(data.user)
        if (data.user?.role !== 'CUSTOMER') {
          fetch('/api/users/agents')
            .then(res => res.json())
            .then(data => setAgents(data.agents || []))
          fetch('/api/canned-responses')
            .then(res => res.json())
            .then(data => setCannedResponses(data.responses || []))
        }
      })
  }, [id])

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!comment.trim()) return
    
    setSubmitting(true)
    try {
      const res = await fetch(`/api/tickets/${id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: comment, isInternal })
      })
      
      if (res.ok) {
        const data = await res.json()
        setTicket(prev => prev ? {
          ...prev,
          comments: [...prev.comments, data.comment]
        } : null)
        setComment('')
      }
    } finally {
      setSubmitting(false)
    }
  }

  const updateTicket = async (updates: Record<string, string | null>) => {
    const res = await fetch(`/api/tickets/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    })
    
    if (res.ok) {
      const data = await res.json()
      setTicket(prev => prev ? { ...prev, ...data.ticket } : null)
    }
  }

  const insertCannedResponse = (content: string) => {
    setComment(prev => prev + content)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-indigo-600 border-t-transparent rounded-full"></div>
      </div>
    )
  }

  if (!ticket) {
    return <div className="text-center py-8">Ticket not found</div>
  }

  const sla = getSLAStatus(ticket.slaDeadline ? new Date(ticket.slaDeadline) : null)
  const isAgent = currentUser?.role !== 'CUSTOMER'

  return (
    <div className="max-w-4xl">
      <Button variant="ghost" onClick={() => router.back()} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>

      {/* Ticket Header */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-gray-500 font-mono">#{ticket.number}</span>
                <Badge className={getPriorityColor(ticket.priority)}>
                  {ticket.priority}
                </Badge>
                <Badge className={getStatusColor(ticket.status)}>
                  {ticket.status.replace('_', ' ')}
                </Badge>
              </div>
              <CardTitle className="text-xl">{ticket.subject}</CardTitle>
            </div>
            {isAgent && (
              <div className="flex gap-2">
                <Select 
                  value={ticket.status} 
                  onValueChange={(value) => updateTicket({ status: value })}
                >
                  <SelectTrigger className="w-36">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="OPEN">Open</SelectItem>
                    <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                    <SelectItem value="WAITING_CUSTOMER">Waiting</SelectItem>
                    <SelectItem value="RESOLVED">Resolved</SelectItem>
                    <SelectItem value="CLOSED">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
            <div>
              <span className="text-gray-500 block">Created by</span>
              <span className="font-medium">{ticket.creator.name || ticket.creator.email}</span>
            </div>
            <div>
              <span className="text-gray-500 block">Created</span>
              <span className="font-medium">{formatDate(ticket.createdAt)}</span>
            </div>
            <div>
              <span className="text-gray-500 block">Assigned to</span>
              {isAgent ? (
                <Select 
                  value={ticket.assignee?.id || 'unassigned'} 
                  onValueChange={(value) => updateTicket({ assigneeId: value === 'unassigned' ? null : value })}
                >
                  <SelectTrigger className="h-7 text-sm">
                    <SelectValue placeholder="Unassigned" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unassigned">Unassigned</SelectItem>
                    {agents.map(agent => (
                      <SelectItem key={agent.id} value={agent.id}>
                        {agent.name || agent.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <span className="font-medium">
                  {ticket.assignee?.name || ticket.assignee?.email || 'Unassigned'}
                </span>
              )}
            </div>
            <div>
              <span className="text-gray-500 block">SLA Status</span>
              <span className={`font-medium ${sla.color}`}>{sla.status}</span>
            </div>
          </div>

          <div className="border-t pt-4">
            <h4 className="font-medium mb-2">Description</h4>
            <p className="text-gray-700 whitespace-pre-wrap">{ticket.description}</p>
          </div>
        </CardContent>
      </Card>

      {/* Comments */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Conversation ({ticket.comments.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {ticket.comments.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No comments yet</p>
          ) : (
            <div className="space-y-4">
              {ticket.comments
                .filter(c => isAgent || !c.isInternal)
                .map(c => (
                  <div 
                    key={c.id} 
                    className={`p-4 rounded-lg ${
                      c.isInternal 
                        ? 'bg-yellow-50 border-l-4 border-yellow-400' 
                        : c.author.role === 'CUSTOMER' 
                          ? 'bg-gray-50' 
                          : 'bg-indigo-50'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                          <User className="h-4 w-4 text-gray-600" />
                        </div>
                        <div>
                          <span className="font-medium">
                            {c.author.name || c.author.email}
                          </span>
                          {c.isInternal && (
                            <Badge variant="outline" className="ml-2 text-xs">Internal</Badge>
                          )}
                        </div>
                      </div>
                      <span className="text-sm text-gray-500">{formatDate(c.createdAt)}</span>
                    </div>
                    <p className="whitespace-pre-wrap">{c.content}</p>
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Reply Form */}
      {ticket.status !== 'CLOSED' && (
        <Card>
          <CardHeader>
            <CardTitle>Add Reply</CardTitle>
          </CardHeader>
          <CardContent>
            {isAgent && cannedResponses.length > 0 && (
              <div className="mb-4">
                <Label className="text-sm text-gray-500 mb-2 block">Quick Responses</Label>
                <div className="flex flex-wrap gap-2">
                  {cannedResponses.map(cr => (
                    <Button 
                      key={cr.id} 
                      variant="outline" 
                      size="sm"
                      onClick={() => insertCannedResponse(cr.content)}
                    >
                      {cr.title}
                    </Button>
                  ))}
                </div>
              </div>
            )}
            <form onSubmit={handleAddComment}>
              <Textarea
                placeholder="Type your reply..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={4}
                className="mb-4"
              />
              <div className="flex justify-between items-center">
                <div>
                  {isAgent && (
                    <label className="flex items-center gap-2 text-sm">
                      <input 
                        type="checkbox" 
                        checked={isInternal}
                        onChange={(e) => setIsInternal(e.target.checked)}
                        className="rounded"
                      />
                      Internal note (not visible to customer)
                    </label>
                  )}
                </div>
                <Button type="submit" disabled={submitting || !comment.trim()}>
                  <Send className="mr-2 h-4 w-4" />
                  {submitting ? 'Sending...' : 'Send Reply'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
