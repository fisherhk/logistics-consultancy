'use client'

import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { getDemoRequestsWithQuotes } from '@/lib/demo-data'

export default function DashboardPage() {
  const requests = getDemoRequestsWithQuotes()

  const stats = {
    total: requests.length,
    pending: requests.filter(r => r.status === 'pending_quotes').length,
    quotesReceived: requests.filter(r => r.status === 'quotes_received').length,
    decisionPending: requests.filter(r => r.status === 'decision_pending').length,
  }

  const recentRequests = requests.slice(0, 5)

  const pendingDecisions = requests
    .filter(r => ['quotes_received', 'decision_pending'].includes(r.status))
    .slice(0, 3)

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Overview of your freight quoting activity</p>
      </div>

      {/* Demo Mode Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center gap-3">
        <span className="text-2xl">🎮</span>
        <div>
          <div className="font-medium text-blue-900">Demo Mode</div>
          <div className="text-sm text-blue-700">
            You're viewing sample data. Connect Supabase to use real company authentication and data.
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          icon="📦"
          value={stats.total}
          label="Total Requests"
        />
        <StatCard
          icon="⏳"
          value={stats.pending}
          label="Awaiting Quotes"
        />
        <StatCard
          icon="📋"
          value={stats.quotesReceived}
          label="Quotes Received"
        />
        <StatCard
          icon="⚠️"
          value={stats.decisionPending}
          label="Decisions Pending"
        />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Requests */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="font-semibold text-gray-900">Recent Requests</h2>
            <Link href="/requests" className="text-sm text-primary-600 hover:text-primary-700">
              View All
            </Link>
          </div>
          <div className="divide-y divide-gray-100">
            {recentRequests.map((request) => (
              <Link
                key={request.id}
                href={`/requests/${request.id}`}
                className="block px-6 py-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900">
                        {request.origin_city} → {request.dest_city}
                      </span>
                      <StatusBadge status={request.status} />
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      {request.reference} • {request.cargo_type} • {request.weight_kg?.toLocaleString()} kg
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-500">
                      {formatDistanceToNow(new Date(request.created_at), { addSuffix: true })}
                    </div>
                    {request.quotes && request.quotes.length > 0 && (
                      <div className="text-sm text-gray-600">
                        {request.quotes.length} quote{request.quotes.length !== 1 ? 's' : ''}
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Pending Decisions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="font-semibold text-gray-900">Pending Decisions</h2>
            <span className="bg-amber-100 text-amber-800 text-xs font-medium px-2 py-1 rounded-full">
              {pendingDecisions.length} awaiting
            </span>
          </div>
          <div className="divide-y divide-gray-100">
            {pendingDecisions.map((request) => {
              const airQuotes = request.quotes?.filter((q) => q.mode === 'air') || []
              const seaQuotes = request.quotes?.filter((q) => q.mode === 'sea') || []
              const bestAir = airQuotes.sort((a, b) => a.total_amount - b.total_amount)[0]
              const bestSea = seaQuotes.sort((a, b) => a.total_amount - b.total_amount)[0]
              const savings = bestAir && bestSea ? bestAir.total_amount - bestSea.total_amount : null

              return (
                <div key={request.id} className="px-6 py-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {request.origin_city} → {request.dest_city}
                      </div>
                      <div className="text-xs text-gray-500">
                        {request.reference}
                      </div>
                    </div>
                    {savings && savings > 0 && (
                      <div className="text-right">
                        <div className="text-sm font-semibold text-green-600">
                          ${savings.toLocaleString()}
                        </div>
                        <div className="text-xs text-gray-500">potential savings</div>
                      </div>
                    )}
                  </div>
                  <Link
                    href={`/requests/${request.id}/quotes`}
                    className="inline-block mt-2 text-sm bg-primary-600 text-white px-3 py-1.5 rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    Review Quotes
                  </Link>
                </div>
              )
            })}
            {pendingDecisions.length === 0 && (
              <div className="px-6 py-8 text-center text-gray-500 text-sm">
                No pending decisions
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({ icon, value, label }: { icon: string; value: number; label: string }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex items-center gap-4">
      <div className="text-3xl bg-gray-100 p-3 rounded-xl">{icon}</div>
      <div>
        <div className="text-2xl font-bold text-gray-900">{value}</div>
        <div className="text-sm text-gray-500">{label}</div>
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    draft: 'bg-gray-100 text-gray-700',
    pending_quotes: 'bg-amber-100 text-amber-700',
    quotes_received: 'bg-blue-100 text-blue-700',
    decision_pending: 'bg-purple-100 text-purple-700',
    booked: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
  }

  const labels: Record<string, string> = {
    draft: 'Draft',
    pending_quotes: 'Awaiting Quotes',
    quotes_received: 'Quotes Ready',
    decision_pending: 'Decision Pending',
    booked: 'Booked',
    cancelled: 'Cancelled',
  }

  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${styles[status] || styles.draft}`}>
      {labels[status] || status}
    </span>
  )
}
