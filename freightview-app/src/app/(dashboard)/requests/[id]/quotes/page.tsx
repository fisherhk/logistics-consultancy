'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { format } from 'date-fns'
import type { Quote, ShipmentRequest } from '@/types/database'

interface AnalysisData {
  request: {
    id: string
    reference: string
    origin: string
    destination: string
    cargo_ready_date: string
    delivery_required_date: string
  }
  analysis: {
    best_air: Quote | null
    best_sea: Quote | null
    potential_savings: number | null
    savings_percentage: number | null
    recommendation: 'air' | 'sea' | null
    recommendation_reason: string | null
  }
  factors: {
    timeline_flexibility: string
    daily_carrying_cost: number | null
    available_days: number | null
  }
  air_quotes: Quote[]
  sea_quotes: Quote[]
}

export default function QuotesPage() {
  const params = useParams()
  const router = useRouter()
  const [data, setData] = useState<AnalysisData | null>(null)
  const [loading, setLoading] = useState(true)
  const [modeFilter, setModeFilter] = useState<'all' | 'air' | 'sea'>('all')

  useEffect(() => {
    async function loadData() {
      try {
        const response = await fetch(`/api/requests/${params.id}/analysis`)
        if (!response.ok) throw new Error('Failed to load')
        const result = await response.json()
        setData(result)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [params.id])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading quotes...</div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Request not found</p>
        <Link href="/requests" className="text-primary-600 hover:underline mt-2 inline-block">
          Back to requests
        </Link>
      </div>
    )
  }

  const { request, analysis, factors, air_quotes, sea_quotes } = data
  const showAir = modeFilter === 'all' || modeFilter === 'air'
  const showSea = modeFilter === 'all' || modeFilter === 'sea'

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quote Comparison</h1>
          <p className="text-gray-600">Compare quotes across forwarders and modes</p>
        </div>
        <Link
          href={`/requests/${params.id}`}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          ← Back to request
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex items-center gap-6">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-500">Mode:</span>
          <div className="flex bg-gray-100 rounded-lg p-1">
            {(['all', 'air', 'sea'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setModeFilter(mode)}
                className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  modeFilter === mode
                    ? 'bg-white shadow-sm text-gray-900'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {mode === 'all' ? 'All' : mode === 'air' ? '✈️ Air' : '🚢 Sea'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Shipment Summary */}
      <div className="bg-slate-800 text-white rounded-xl p-4 grid grid-cols-4 gap-4">
        <div>
          <div className="text-xs text-slate-400">Route</div>
          <div className="font-medium">{request.origin} → {request.destination}</div>
        </div>
        <div>
          <div className="text-xs text-slate-400">Cargo Ready</div>
          <div className="font-medium">{request.cargo_ready_date ? format(new Date(request.cargo_ready_date), 'MMM d, yyyy') : '-'}</div>
        </div>
        <div>
          <div className="text-xs text-slate-400">Required By</div>
          <div className="font-medium">{request.delivery_required_date ? format(new Date(request.delivery_required_date), 'MMM d, yyyy') : '-'}</div>
        </div>
        <div>
          <div className="text-xs text-slate-400">Available Days</div>
          <div className="font-medium">{factors.available_days || '-'} days</div>
        </div>
      </div>

      {/* Recommendation Banner */}
      {analysis.recommendation && (
        <div className={`rounded-xl p-4 ${
          analysis.recommendation === 'sea' ? 'bg-green-50 border border-green-200' : 'bg-blue-50 border border-blue-200'
        }`}>
          <div className="flex items-start gap-4">
            <div className={`text-2xl p-2 rounded-lg ${
              analysis.recommendation === 'sea' ? 'bg-green-100' : 'bg-blue-100'
            }`}>
              {analysis.recommendation === 'sea' ? '🚢' : '✈️'}
            </div>
            <div className="flex-1">
              <div className="font-semibold text-gray-900">
                {analysis.recommendation === 'sea' ? 'Sea Freight' : 'Air Freight'} Recommended
              </div>
              <p className="text-sm text-gray-600 mt-1">{analysis.recommendation_reason}</p>
              {analysis.potential_savings && analysis.potential_savings > 0 && (
                <div className="mt-2 text-sm font-medium text-green-700">
                  Potential savings: ${analysis.potential_savings.toLocaleString()} ({analysis.savings_percentage}% vs air)
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Quote Sections */}
      <div className="space-y-6">
        {/* Air Quotes */}
        {showAir && (
          <div>
            <div className="flex items-center gap-3 mb-4">
              <h2 className="text-lg font-semibold text-gray-900">✈️ Air Freight Options</h2>
              <span className="bg-blue-100 text-blue-700 text-xs font-medium px-2 py-1 rounded-full">
                {air_quotes.length} quote{air_quotes.length !== 1 ? 's' : ''}
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {air_quotes.map((quote, idx) => (
                <QuoteCard key={quote.id} quote={quote} isLowest={idx === 0} isRecommended={analysis.recommendation === 'air' && idx === 0} />
              ))}
              {air_quotes.length === 0 && (
                <div className="col-span-3 bg-gray-50 rounded-lg p-8 text-center text-gray-500">
                  No air freight quotes received yet
                </div>
              )}
            </div>
          </div>
        )}

        {/* Sea Quotes */}
        {showSea && (
          <div>
            <div className="flex items-center gap-3 mb-4">
              <h2 className="text-lg font-semibold text-gray-900">🚢 Sea Freight Options</h2>
              <span className="bg-green-100 text-green-700 text-xs font-medium px-2 py-1 rounded-full">
                {sea_quotes.length} quote{sea_quotes.length !== 1 ? 's' : ''}
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {sea_quotes.map((quote, idx) => (
                <QuoteCard key={quote.id} quote={quote} isLowest={idx === 0} isRecommended={analysis.recommendation === 'sea' && idx === 0} />
              ))}
              {sea_quotes.length === 0 && (
                <div className="col-span-3 bg-gray-50 rounded-lg p-8 text-center text-gray-500">
                  No sea freight quotes received yet
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-4 pt-4">
        <button className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium">
          Export Comparison
        </button>
        <button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium">
          Add Quote Manually
        </button>
      </div>
    </div>
  )
}

function QuoteCard({
  quote,
  isLowest,
  isRecommended,
}: {
  quote: Quote
  isLowest: boolean
  isRecommended: boolean
}) {
  return (
    <div className={`bg-white rounded-xl shadow-sm border-2 p-5 relative ${
      isRecommended ? 'border-green-500' : isLowest ? 'border-primary-500' : 'border-gray-200'
    }`}>
      {isRecommended && (
        <span className="absolute -top-2 right-4 bg-green-500 text-white text-xs font-bold px-2 py-0.5 rounded">
          Recommended
        </span>
      )}
      {isLowest && !isRecommended && (
        <span className="absolute -top-2 right-4 bg-primary-500 text-white text-xs font-bold px-2 py-0.5 rounded">
          Lowest Price
        </span>
      )}

      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-slate-800 text-white rounded-lg flex items-center justify-center text-xs font-bold">
          {quote.forwarder?.short_code || '?'}
        </div>
        <span className="font-medium text-gray-900">{quote.forwarder?.name || 'Unknown'}</span>
      </div>

      {/* Price */}
      <div className="bg-gray-50 rounded-lg p-4 text-center mb-4">
        <div className="text-2xl font-bold text-gray-900">
          ${quote.total_amount.toLocaleString()}
        </div>
        <div className="text-xs text-gray-500">Total Cost</div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-2 gap-3 text-center mb-4">
        <div>
          <div className="text-sm font-medium text-gray-900">{quote.transit_days} days</div>
          <div className="text-xs text-gray-500">Transit</div>
        </div>
        <div>
          <div className="text-sm font-medium text-gray-900">
            {quote.eta ? format(new Date(quote.eta), 'MMM d') : '-'}
          </div>
          <div className="text-xs text-gray-500">ETA</div>
        </div>
        <div>
          <div className="text-sm font-medium text-gray-900">{quote.carrier || '-'}</div>
          <div className="text-xs text-gray-500">Carrier</div>
        </div>
        <div>
          <div className="text-sm font-medium text-gray-900">{quote.routing || 'Direct'}</div>
          <div className="text-xs text-gray-500">Routing</div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex justify-between items-center pt-3 border-t border-gray-100">
        <span className="text-xs text-gray-500">
          Valid until {quote.valid_until ? format(new Date(quote.valid_until), 'MMM d') : '-'}
        </span>
        <button className="text-sm text-primary-600 hover:text-primary-700 font-medium">
          Details
        </button>
      </div>
    </div>
  )
}
