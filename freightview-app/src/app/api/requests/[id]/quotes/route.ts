/**
 * @fileoverview Quotes API
 *
 * Endpoints for managing freight quotes for a specific shipment request.
 * All endpoints require authentication and request ownership verification.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { CreateQuoteInput, Quote, TransportMode } from '@/types/database'
import type {
  QuoteListResponse,
  CreateQuoteRequest,
  CreateQuoteResponse,
  ApiErrorResponse,
} from '@/types/api'

/** Route params type for dynamic [id] segment */
interface RouteParams {
  params: { id: string }
}

/**
 * GET /api/requests/:id/quotes
 *
 * Returns all quotes for a specific shipment request, organized by transport mode.
 *
 * @param {string} id - The request UUID
 * @query {string} [mode] - Filter by mode ('air' or 'sea')
 *
 * @returns {QuoteListResponse} Quotes with summary statistics
 *
 * @throws {401} Unauthorized - User is not authenticated
 * @throws {404} Not Found - Request doesn't exist or user doesn't own it
 *
 * @example
 * // Get all quotes
 * GET /api/requests/123e4567-e89b-12d3-a456-426614174000/quotes
 *
 * @example
 * // Get only air freight quotes
 * GET /api/requests/123e4567-e89b-12d3-a456-426614174000/quotes?mode=air
 */
export async function GET(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse<QuoteListResponse | ApiErrorResponse>> {
  const supabase = createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Verify user owns this request
  const { data: requestData, error: requestError } = await supabase
    .from('requests')
    .select('id')
    .eq('id', params.id)
    .eq('user_id', user.id)
    .single()

  if (requestError || !requestData) {
    return NextResponse.json({ error: 'Request not found' }, { status: 404 })
  }

  const { searchParams } = new URL(request.url)
  const mode = searchParams.get('mode') as TransportMode | null

  let query = supabase
    .from('quotes')
    .select(`
      *,
      forwarder:forwarders (*)
    `)
    .eq('request_id', params.id)
    .order('total_amount', { ascending: true })

  if (mode && (mode === 'air' || mode === 'sea')) {
    query = query.eq('mode', mode)
  }

  const { data, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const quotes = data as Quote[]

  // Calculate summary statistics
  const airQuotes = quotes.filter(q => q.mode === 'air')
  const seaQuotes = quotes.filter(q => q.mode === 'sea')

  const response: QuoteListResponse = {
    quotes,
    summary: {
      total: quotes.length,
      air_count: airQuotes.length,
      sea_count: seaQuotes.length,
      lowest_air: airQuotes.length > 0 ? airQuotes[0].total_amount : null,
      lowest_sea: seaQuotes.length > 0 ? seaQuotes[0].total_amount : null,
    },
  }

  return NextResponse.json(response)
}

/**
 * POST /api/requests/:id/quotes
 *
 * Manually adds a quote to a shipment request.
 * Automatically updates request status to 'quotes_received' if this is the first quote.
 *
 * @param {string} id - The request UUID
 * @body {CreateQuoteRequest} Quote details
 *
 * @returns {CreateQuoteResponse} The newly created quote with forwarder details
 *
 * @throws {400} Bad Request - Missing required fields
 * @throws {401} Unauthorized - User is not authenticated
 * @throws {404} Not Found - Request doesn't exist or user doesn't own it
 *
 * @example
 * POST /api/requests/123e4567-e89b-12d3-a456-426614174000/quotes
 * {
 *   "forwarder_id": "fwd-uuid",
 *   "mode": "sea",
 *   "total_amount": 3500,
 *   "freight_charge": 2800,
 *   "fuel_surcharge": 400,
 *   "etd": "2024-02-20",
 *   "eta": "2024-03-10",
 *   "transit_days": 18,
 *   "carrier": "Maersk Line",
 *   "valid_until": "2024-02-28"
 * }
 */
export async function POST(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse<CreateQuoteResponse | ApiErrorResponse>> {
  const supabase = createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Verify user owns this request
  const { data: requestData, error: requestError } = await supabase
    .from('requests')
    .select('id, status')
    .eq('id', params.id)
    .eq('user_id', user.id)
    .single()

  if (requestError || !requestData) {
    return NextResponse.json({ error: 'Request not found' }, { status: 404 })
  }

  let body: CreateQuoteRequest
  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { error: 'Invalid JSON body' },
      { status: 400 }
    )
  }

  // Validate required fields
  if (!body.forwarder_id || !body.mode || !body.total_amount) {
    return NextResponse.json(
      { error: 'Missing required fields: forwarder_id, mode, total_amount' },
      { status: 400 }
    )
  }

  // Validate mode
  if (body.mode !== 'air' && body.mode !== 'sea') {
    return NextResponse.json(
      { error: 'Mode must be either "air" or "sea"' },
      { status: 400 }
    )
  }

  // Calculate transit days if not provided
  let transitDays = body.transit_days
  if (!transitDays && body.etd && body.eta) {
    const etd = new Date(body.etd)
    const eta = new Date(body.eta)
    transitDays = Math.ceil((eta.getTime() - etd.getTime()) / (1000 * 60 * 60 * 24))
  }

  const { data: newQuote, error: insertError } = await supabase
    .from('quotes')
    .insert({
      request_id: params.id,
      forwarder_id: body.forwarder_id,
      mode: body.mode,
      total_amount: body.total_amount,
      freight_charge: body.freight_charge,
      fuel_surcharge: body.fuel_surcharge,
      handling_charge: body.handling_charge,
      documentation_fee: body.documentation_fee,
      terminal_handling: body.terminal_handling,
      etd: body.etd,
      eta: body.eta,
      transit_days: transitDays,
      carrier: body.carrier,
      routing: body.routing,
      valid_until: body.valid_until,
      received_via: 'manual',
    })
    .select(`
      *,
      forwarder:forwarders (*)
    `)
    .single()

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 })
  }

  // Update request status if this is first quote
  if (requestData.status === 'pending_quotes') {
    await supabase
      .from('requests')
      .update({ status: 'quotes_received' })
      .eq('id', params.id)
  }

  const response: CreateQuoteResponse = {
    quote: newQuote as Quote,
  }

  return NextResponse.json(response, { status: 201 })
}
