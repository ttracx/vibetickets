'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Plus, MessageSquare } from 'lucide-react'

interface CannedResponse {
  id: string
  title: string
  content: string
  shortcut: string | null
  category: string | null
  createdBy: { name: string | null }
}

export default function CannedResponsesPage() {
  const [responses, setResponses] = useState<CannedResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [shortcut, setShortcut] = useState('')
  const [category, setCategory] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetch('/api/canned-responses')
      .then(res => res.json())
      .then(data => setResponses(data.responses || []))
      .finally(() => setLoading(false))
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const res = await fetch('/api/canned-responses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content, shortcut: shortcut || null, category: category || null })
      })

      if (res.ok) {
        const data = await res.json()
        setResponses(prev => [...prev, data.response])
        setTitle('')
        setContent('')
        setShortcut('')
        setCategory('')
        setShowForm(false)
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-4xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Canned Responses</h1>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="mr-2 h-4 w-4" />
          New Response
        </Button>
      </div>

      {showForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Create Canned Response</CardTitle>
            <CardDescription>
              Save time with pre-written responses to common questions.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    placeholder="e.g., Greeting"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="shortcut">Shortcut (optional)</Label>
                  <Input
                    id="shortcut"
                    placeholder="e.g., /greet"
                    value={shortcut}
                    onChange={(e) => setShortcut(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category (optional)</Label>
                <Input
                  id="category"
                  placeholder="e.g., General, Billing, Technical"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="content">Content</Label>
                <Textarea
                  id="content"
                  placeholder="Write your response template..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={4}
                  required
                />
              </div>
              <div className="flex gap-4">
                <Button type="submit" disabled={submitting}>
                  {submitting ? 'Saving...' : 'Save Response'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Saved Responses ({responses.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin h-8 w-8 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto"></div>
            </div>
          ) : responses.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No canned responses yet</p>
              <p className="text-sm">Create one to speed up your replies!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {responses.map(response => (
                <div key={response.id} className="p-4 border rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-medium">{response.title}</h3>
                      <div className="flex gap-2 text-sm text-gray-500">
                        {response.shortcut && (
                          <span className="bg-gray-100 px-2 py-0.5 rounded font-mono">
                            {response.shortcut}
                          </span>
                        )}
                        {response.category && (
                          <span>{response.category}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-700 whitespace-pre-wrap text-sm">
                    {response.content}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
