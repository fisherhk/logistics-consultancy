/**
 * @fileoverview Quote Analysis API
 *
 * Provides air vs sea freight comparison analysis with cost-transit tradeoffs,
 * recommendations, and visualization data for decision making.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { Quote, ShipmentRequest } from '@/types/database'
import type { QuoteAnalysisResponse, ApiErrorResponse } from '@/types/api'

/** Route params type for dynamic [id] segment */
interface RouteParams {
  params: { id: string }
}

/** Internal type for quote with partial forwarder data from query */
interface QuoteWithForwarder extends Omit<Quote, 'forwarder'> {
  forwarder?: {
    id: string
    name: string
    short_code: string
  }
}

/** Chart data point for visualization */
interface ChartDataPoint {
  forwarder: string
  transitDays: number | null
  cost: number
  eta: string | null
}

/** Timeline flexibility level */
type TimelineFlexibility = 'low' | 'medium' | 'high'

/**
 * GET /api/requests/:id/analysis
 *
 * Returns comprehensive air vs sea mode analysis including:
 * - Best quotes for each mode
 * - Potential savings calculation
 * - Recommendation with reasoning
 * - Timeline flexibility assessment
 * - Inventory carrying cost estimates
 * - Chart data for visualization
 *
 * @param {string} id - The request UUID
 *
 * @returns {QuoteAnalysisResponse} Complete analysis data
 *
 * @throws {401} Unauthorized - User is not authenticated
 * @throws {404} Not Found - Request doesn't exist or user doesn't own it
 *
 * @example
 * GET /api/requests/123e4567-e89b-12d3-a456-426614174000/analysis
 *
 * @example Response
 * {
 *   "request": { "id": "...", "origin": "Shanghai, CN", ... },
 *   "analysis": {
 *     "best_air": { ... },
 *     "best_sea": { ... },
 *     "potential_savings": 8500,
 *     "savings_percentage": 73,
 *     "recommendation": "sea",
 *     "recommendation_reason": "Sea freight arrives 5 days before deadline with 73% cost savings"
 *   },
 *   "factors": { "timeline_flexibility": "high", ... },
 *   "chart_data": { "air": [...], "sea": [...] }
 * }
 */
export async function GET(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse<QuoteAnalysisResponse | ApiErrorResponse>> {
  const supabase = createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Get request with quotes
  const { data: requestData, error: requestError } = await supabase
    .from('requests')
    .select(`
      *,
      quotes (
        *,
        forwarder:forwarders (id, name, short_code)
      )
    `)
    .eq('id', params.id)
    .eq('user_id', user.id)
    .single()

  if (requestError || !requestData) {
    return NextResponse.json({ error: 'Request not found' }, { status: 404 })
  }

  const shipmentRequest = requestData as ShipmentRequest & { quotes: QuoteWithForwarder[] }
  const quotes = shipmentRequest.quotes || []

  // Separate and sort quotes by mode
  const airQuotes = quotes
    .filter(q => q.mode === 'air')
    .sort((a, b) => a.total_amount - b.total_amount)

  const seaQuotes = quotes
    .filter(q => q.mode === 'sea')
    .sort((a, b) => a.total_amount - b.total_amount)

  const bestAir = airQuotes[0] || null
  const bestSea = seaQuotes[0] || null

  // Calculate savings
  let potentialSavings: number | null = null
  let savingsPercentage: number | null = null

  if (bestAir && bestSea) {
    potentialSavings = bestAir.total_amount - bestSea.total_amount
    savingsPercentage = Math.round((potentialSavings / bestAir.total_amount) * 100)
  }

  // Determine recommendation based on deadline and cost
  const { recommendation, recommendationReason } = calculateRecommendation(
    bestAir,
    bestSea,
    shipmentRequest.delivery_required_date,
    savingsPercentage,
    potentialSavings
  )

  // Calculate timeline flexibility
  const { flexibility, availableDays } = calculateTimelineFlexibility(
    shipmentRequest.cargo_ready_date,
    shipmentRequest.delivery_required_date
  )

  // Calculate inventory carrying cost (simplified: 15% annual rate)
  const dailyCarryingCost = shipmentRequest.value_usd
    ? Math.round((shipmentRequest.value_usd * 0.15) / 365)
    : null

  // Build chart data for visualization
  const chartData = {
    air: airQuotes.map(mapQuoteToChartData),
    sea: seaQuotes.map(mapQuoteToChartData),
  }

  const response: QuoteAnalysisResponse = {
    request: {
      id: shipmentRequest.id,
      user_id: shipmentRequest.user_id,
      organization_id: shipmentRequest.organization_id,
      reference: shipmentRequest.reference,
      status: shipmentRequest.status,
      origin_country: shipmentRequest.origin_country,
      origin_city: shipmentRequest.origin_city,
      origin_port: shipmentRequest.origin_port,
      origin_address: shipmentRequest.origin_address,
      dest_country: shipmentRequest.dest_country,
      dest_city: shipmentRequest.dest_city,
      dest_port: shipmentRequest.dest_port,
      dest_address: shipmentRequest.dest_address,
      cargo_type: shipmentRequest.cargo_type,
      cargo_description: shipmentRequest.cargo_description,
      weight_kg: shipmentRequest.weight_kg,
      volume_cbm: shipmentRequest.volume_cbm,
      pieces: shipmentRequest.pieces,
      value_usd: shipmentRequest.value_usd,
      is_stackable: shipmentRequest.is_stackable,
      is_hazmat: shipmentRequest.is_hazmat,
      temperature_required: shipmentRequest.temperature_required,
      cargo_ready_date: shipmentRequest.cargo_ready_date,
      delivery_required_date: shipmentRequest.delivery_required_date,
      mode_preference: shipmentRequest.mode_preference,
      incoterms: shipmentRequest.incoterms,
      special_instructions: shipmentRequest.special_instructions,
      created_at: shipmentRequest.created_at,
      updated_at: shipmentRequest.updated_at,
      submitted_at: shipmentRequest.submitted_at,
    },
    air_quotes: airQuotes as unknown as Quote[],
    sea_quotes: seaQuotes as unknown as Quote[],
    best_air: bestAir as unknown as Quote | null,
    best_sea: bestSea as unknown as Quote | null,
    potential_savings: potentialSavings,
    recommendation,
    recommendation_reason: recommendationReason,
    analysis: {
      generated_at: new Date().toISOString(),
      quotes_analyzed: quotes.length,
      is_reliable: quotes.length >= 2 && (airQuotes.length > 0 || seaQuotes.length > 0),
    },
  }

  // Add extended analysis data (not in base type but useful for UI)
  const extendedResponse = {
    ...response,
    factors: {
      timeline_flexibility: flexibility,
      daily_carrying_cost: dailyCarryingCost,
      available_days: availableDays,
      savings_percentage: savingsPercentage,
    },
    chart_data: chartData,
  }

  return NextResponse.json(extendedResponse)
}

/**
 * Calculates the recommended transport mode based on deadline and cost
 */
function calculateRecommendation(
  bestAir: QuoteWithForwarder | null,
  bestSea: QuoteWithForwarder | null,
  deliveryRequiredDate: string | null,
  savingsPercentage: number | null,
  potentialSavings: number | null
): { recommendation: 'air' | 'sea' | null; recommendationReason: string | null } {
  // No quotes available
  if (!bestAir && !bestSea) {
    return { recommendation: null, recommendationReason: null }
  }

  // Only one mode available
  if (bestSea && !bestAir) {
    return {
      recommendation: 'sea',
      recommendationReason: 'Only sea freight quotes available.',
    }
  }

  if (bestAir && !bestSea) {
    return {
      recommendation: 'air',
      recommendationReason: 'Only air freight quotes available.',
    }
  }

  // Both modes available - check deadline
  if (bestAir && bestSea && deliveryRequiredDate) {
    const requiredDate = new Date(deliveryRequiredDate)
    const seaEta = bestSea.eta ? new Date(bestSea.eta) : null

    if (seaEta && seaEta <= requiredDate) {
      const bufferDays = Math.ceil(
        (requiredDate.getTime() - seaEta.getTime()) / (1000 * 60 * 60 * 24)
      )

      if (bufferDays >= 3) {
        return {
          recommendation: 'sea',
          recommendationReason: `Sea freight arrives ${bufferDays} days before deadline with ${savingsPercentage}% cost savings ($${potentialSavings?.toLocaleString()})`,
        }
      } else if (bufferDays >= 0) {
        return {
          recommendation: 'sea',
          recommendationReason: `Sea freight meets deadline with minimal buffer (${bufferDays} days). Consider air if timing is critical.`,
        }
      }
    } else {
      return {
        recommendation: 'air',
        recommendationReason: 'Sea freight does not meet delivery deadline. Air freight required.',
      }
    }
  }

  return { recommendation: null, recommendationReason: null }
}

/**
 * Calculates timeline flexibility based on available shipping window
 */
function calculateTimelineFlexibility(
  cargoReadyDate: string | null,
  deliveryRequiredDate: string | null
): { flexibility: TimelineFlexibility; availableDays: number | null } {
  if (!cargoReadyDate || !deliveryRequiredDate) {
    return { flexibility: 'low', availableDays: null }
  }

  const ready = new Date(cargoReadyDate)
  const required = new Date(deliveryRequiredDate)
  const availableDays = Math.ceil(
    (required.getTime() - ready.getTime()) / (1000 * 60 * 60 * 24)
  )

  let flexibility: TimelineFlexibility = 'low'
  if (availableDays >= 25) {
    flexibility = 'high'
  } else if (availableDays >= 14) {
    flexibility = 'medium'
  }

  return { flexibility, availableDays }
}

/**
 * Maps a quote to chart-friendly data format
 */
function mapQuoteToChartData(quote: QuoteWithForwarder): ChartDataPoint {
  return {
    forwarder: quote.forwarder?.short_code || 'Unknown',
    transitDays: quote.transit_days,
    cost: quote.total_amount,
    eta: quote.eta,
  }
}
