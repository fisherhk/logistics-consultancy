'use client'

import Link from 'next/link'
import { format } from 'date-fns'
import { getDemoRequestsWithQuotes } from '@/lib/demo-data'

export default function RequestsPage() {
  const requests = getDemoRequestsWithQuotes()

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Shipment Requests</h1>
          <p className="text-gray-600">Manage your freight quote requests</p>
        </div>
        <Link
          href="/requests/new"
          className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          + New Request
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex items-center gap-4">
        <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
          <option value="">All Statuses</option>
          <option value="pending_quotes">Awaiting Quotes</option>
          <option value="quotes_received">Quotes Received</option>
          <option value="decision_pending">Decision Pending</option>
          <option value="booked">Booked</option>
        </select>
        <input
          type="text"
          placeholder="Search by reference..."
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm flex-1 max-w-xs"
        />
      </div>

      {/* Request List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                Route
              </th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                Cargo
              </th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                Dates
              </th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                Quotes
              </th>
              <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {requests.map((request) => {
              const airCount = request.quotes?.filter((q) => q.mode === 'air').length || 0
              const seaCount = request.quotes?.filter((q) => q.mode === 'sea').length || 0

              return (
                <tr key={request.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">
                      {request.origin_city} → {request.dest_city}
                    </div>
                    <div className="text-sm text-gray-500">
                      {request.reference}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{request.cargo_type}</div>
                    <div className="text-sm text-gray-500">
                      {request.weight_kg?.toLocaleString()} kg • {request.volume_cbm} CBM
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      Ready: {request.cargo_ready_date ? format(new Date(request.cargo_ready_date), 'MMM d') : '-'}
                    </div>
                    <div className="text-sm text-gray-500">
                      Due: {request.delivery_required_date ? format(new Date(request.delivery_required_date), 'MMM d') : '-'}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={request.status} />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      {airCount > 0 && (
                        <span className="inline-flex items-center gap-1 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                          ✈️ {airCount}
                        </span>
                      )}
                      {seaCount > 0 && (
                        <span className="inline-flex items-center gap-1 text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                          🚢 {seaCount}
                        </span>
                      )}
                      {airCount === 0 && seaCount === 0 && (
                        <span className="text-sm text-gray-400">None yet</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link
                      href={`/requests/${request.id}/quotes`}
                      className="text-primary-600 hover:text-primary-700 font-medium text-sm"
                    >
                      View Quotes
                    </Link>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
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
    <span className={`inline-block text-xs font-medium px-2.5 py-1 rounded-full ${styles[status] || styles.draft}`}>
      {labels[status] || status}
    </span>
  )
}
