/**
 * @fileoverview Shipment Requests API
 *
 * Endpoints for managing freight shipment requests.
 * All endpoints require authentication.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { CreateRequestInput, ShipmentRequest } from '@/types/database'
import type {
  RequestListResponse,
  CreateRequestResponse,
  ApiErrorResponse,
} from '@/types/api'

/**
 * GET /api/requests
 *
 * Returns a paginated list of shipment requests for the authenticated user.
 *
 * @query {string} [status] - Filter by request status (e.g., 'pending_quotes', 'quotes_received')
 * @query {number} [limit=50] - Maximum number of requests to return (max 100)
 * @query {number} [offset=0] - Number of requests to skip for pagination
 *
 * @returns {RequestListResponse} List of requests with nested quotes
 *
 * @example
 * // Get all pending requests
 * GET /api/requests?status=pending_quotes
 *
 * @example
 * // Paginate results
 * GET /api/requests?limit=10&offset=20
 */
export async function GET(
  request: NextRequest
): Promise<NextResponse<RequestListResponse | ApiErrorResponse>> {
  const supabase = createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status')
  const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100)
  const offset = parseInt(searchParams.get('offset') || '0')

  let query = supabase
    .from('requests')
    .select(`
      *,
      quotes (
        id,
        mode,
        total_amount,
        transit_days,
        eta,
        forwarder:forwarders (id, name, short_code)
      )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (status) {
    query = query.eq('status', status)
  }

  const { data, error, count } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const response: RequestListResponse = {
    requests: data as ShipmentRequest[],
    count: count ?? data?.length ?? 0,
  }

  return NextResponse.json(response)
}

/**
 * POST /api/requests
 *
 * Creates a new shipment request and optionally notifies forwarders.
 *
 * @body {CreateRequestInput} Request details including origin, destination, cargo, and forwarders
 *
 * @returns {CreateRequestResponse} The newly created request
 *
 * @example
 * POST /api/requests
 * {
 *   "origin_country": "CN",
 *   "origin_city": "Shanghai",
 *   "dest_country": "US",
 *   "dest_city": "Los Angeles",
 *   "cargo_type": "electronics",
 *   "weight_kg": 5000,
 *   "volume_cbm": 25,
 *   "cargo_ready_date": "2024-02-15",
 *   "delivery_required_date": "2024-03-01",
 *   "mode_preference": "any",
 *   "forwarder_ids": ["uuid-1", "uuid-2"]
 * }
 */
export async function POST(
  request: NextRequest
): Promise<NextResponse<CreateRequestResponse | ApiErrorResponse>> {
  const supabase = createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: CreateRequestInput
  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { error: 'Invalid JSON body' },
      { status: 400 }
    )
  }

  // Validate required fields
  if (!body.origin_country || !body.dest_country || !body.cargo_type) {
    return NextResponse.json(
      { error: 'Missing required fields: origin_country, dest_country, cargo_type' },
      { status: 400 }
    )
  }

  // Create the request
  const { data: newRequest, error: insertError } = await supabase
    .from('requests')
    .insert({
      user_id: user.id,
      reference: body.reference,
      status: 'pending_quotes',
      origin_country: body.origin_country,
      origin_city: body.origin_city,
      dest_country: body.dest_country,
      dest_city: body.dest_city,
      cargo_type: body.cargo_type,
      weight_kg: body.weight_kg,
      volume_cbm: body.volume_cbm,
      pieces: body.pieces,
      value_usd: body.value_usd,
      cargo_ready_date: body.cargo_ready_date,
      delivery_required_date: body.delivery_required_date,
      mode_preference: body.mode_preference,
      special_instructions: body.special_instructions,
      submitted_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 })
  }

  // Add forwarders to request
  const notifiedForwarders: string[] = []
  if (body.forwarder_ids && body.forwarder_ids.length > 0) {
    const requestForwarders = body.forwarder_ids.map(fid => ({
      request_id: newRequest.id,
      forwarder_id: fid,
    }))

    const { error: forwarderError } = await supabase
      .from('request_forwarders')
      .insert(requestForwarders)

    if (!forwarderError) {
      notifiedForwarders.push(...body.forwarder_ids)
    }
  }

  const response: CreateRequestResponse = {
    request: newRequest as ShipmentRequest,
    notified_forwarders: notifiedForwarders,
  }

  return NextResponse.json(response, { status: 201 })
}
