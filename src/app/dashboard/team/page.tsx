'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Users, Ticket } from 'lucide-react'

interface Agent {
  id: string
  name: string | null
  email: string
  role: string
  _count: { assignedTickets: number }
}

export default function TeamPage() {
  const [agents, setAgents] = useState<Agent[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/users/agents')
      .then(res => res.json())
      .then(data => setAgents(data.agents || []))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">Team</h1>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Team Members ({agents.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin h-8 w-8 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto"></div>
            </div>
          ) : agents.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No team members found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {agents.map(agent => (
                <div key={agent.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                      <span className="text-indigo-600 font-medium">
                        {agent.name?.[0] || agent.email[0].toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-medium">{agent.name || agent.email}</h3>
                      <p className="text-sm text-gray-500">{agent.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <Ticket className="h-4 w-4" />
                        <span>{agent._count.assignedTickets} assigned</span>
                      </div>
                    </div>
                    <Badge variant={agent.role === 'ADMIN' ? 'default' : 'secondary'}>
                      {agent.role}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
