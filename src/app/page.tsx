import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Ticket, Users, Clock, Shield, Zap, MessageSquare } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <Ticket className="h-8 w-8 text-indigo-600" />
              <span className="text-xl font-bold">VibeTickets</span>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/login">
                <Button variant="ghost">Sign In</Button>
              </Link>
              <Link href="/register">
                <Button>Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="py-20 bg-gradient-to-b from-indigo-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Support Tickets,{' '}
            <span className="text-indigo-600">Simplified</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Streamline your customer support with powerful ticket management,
            SLA tracking, and seamless team collaboration.
          </p>
          <div className="flex justify-center gap-4">
            <Link href="/register">
              <Button size="lg" className="text-lg px-8">
                Start Free Trial
              </Button>
            </Link>
            <Link href="/pricing">
              <Button size="lg" variant="outline" className="text-lg px-8">
                View Pricing
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">
            Everything You Need for World-Class Support
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <Ticket className="h-10 w-10 text-indigo-600 mb-2" />
                <CardTitle>Ticket Management</CardTitle>
                <CardDescription>
                  Create, track, and resolve tickets with ease. Priority levels
                  and status tracking keep everything organized.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <Clock className="h-10 w-10 text-indigo-600 mb-2" />
                <CardTitle>SLA Tracking</CardTitle>
                <CardDescription>
                  Never miss a deadline. Automatic SLA calculations with
                  real-time breach alerts and analytics.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <Users className="h-10 w-10 text-indigo-600 mb-2" />
                <CardTitle>Team Assignment</CardTitle>
                <CardDescription>
                  Assign tickets to the right team members. Balance workloads
                  and track agent performance.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <Shield className="h-10 w-10 text-indigo-600 mb-2" />
                <CardTitle>Customer Portal</CardTitle>
                <CardDescription>
                  Dedicated portal for customers to submit and track their
                  tickets without calling or emailing.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <Zap className="h-10 w-10 text-indigo-600 mb-2" />
                <CardTitle>Canned Responses</CardTitle>
                <CardDescription>
                  Speed up response times with pre-written templates for
                  common questions and issues.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <MessageSquare className="h-10 w-10 text-indigo-600 mb-2" />
                <CardTitle>Real-time Updates</CardTitle>
                <CardDescription>
                  Keep everyone in the loop with instant notifications and
                  conversation threads.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing Preview */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Simple, Transparent Pricing</h2>
          <p className="text-gray-600 mb-8">One plan. All features. No surprises.</p>
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle className="text-2xl">Pro Plan</CardTitle>
              <div className="text-4xl font-bold">
                $24<span className="text-lg font-normal text-gray-500">/month</span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="text-left space-y-3 mb-6">
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span> Unlimited tickets
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span> SLA tracking & alerts
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span> Customer portal
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span> Canned responses
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span> Team management
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span> Priority support
                </li>
              </ul>
              <Link href="/register">
                <Button className="w-full">Get Started</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Ticket className="h-6 w-6 text-indigo-600" />
              <span className="font-semibold">VibeTickets</span>
            </div>
            <p className="text-gray-500 text-sm">
              © 2024 VibeTickets. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
