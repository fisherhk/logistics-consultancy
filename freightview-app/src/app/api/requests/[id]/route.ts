/**
 * @fileoverview Single Request API
 *
 * Endpoints for managing individual shipment requests.
 * All endpoints require authentication and ownership verification.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { RequestWithQuotes, ShipmentRequest } from '@/types/database'
import type {
  RequestDetailResponse,
  UpdateRequestRequest,
  UpdateRequestResponse,
  DeleteRequestResponse,
  ApiErrorResponse,
} from '@/types/api'

/** Route params type for dynamic [id] segment */
interface RouteParams {
  params: { id: string }
}

/**
 * GET /api/requests/:id
 *
 * Returns a single shipment request with all associated quotes and forwarders.
 *
 * @param {string} id - The request UUID
 *
 * @returns {RequestDetailResponse} The request with nested quotes and forwarders
 *
 * @throws {401} Unauthorized - User is not authenticated
 * @throws {404} Not Found - Request doesn't exist or user doesn't own it
 *
 * @example
 * GET /api/requests/123e4567-e89b-12d3-a456-426614174000
 */
export async function GET(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse<RequestDetailResponse | ApiErrorResponse>> {
  const supabase = createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data, error } = await supabase
    .from('requests')
    .select(`
      *,
      quotes (
        *,
        forwarder:forwarders (*)
      ),
      request_forwarders (
        forwarder_id,
        email_sent_at,
        forwarder:forwarders (*)
      )
    `)
    .eq('id', params.id)
    .eq('user_id', user.id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const response: RequestDetailResponse = {
    request: data as RequestWithQuotes,
  }

  return NextResponse.json(response)
}

/**
 * PATCH /api/requests/:id
 *
 * Updates an existing shipment request.
 * Only certain fields can be updated after creation.
 *
 * @param {string} id - The request UUID
 * @body {UpdateRequestRequest} Fields to update
 *
 * @returns {UpdateRequestResponse} The updated request
 *
 * @throws {401} Unauthorized - User is not authenticated
 * @throws {404} Not Found - Request doesn't exist or user doesn't own it
 *
 * @example
 * PATCH /api/requests/123e4567-e89b-12d3-a456-426614174000
 * {
 *   "status": "decision_pending",
 *   "special_instructions": "Updated handling requirements"
 * }
 */
export async function PATCH(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse<UpdateRequestResponse | ApiErrorResponse>> {
  const supabase = createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: UpdateRequestRequest
  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { error: 'Invalid JSON body' },
      { status: 400 }
    )
  }

  // Only allow certain fields to be updated
  const allowedFields: (keyof UpdateRequestRequest)[] = [
    'status',
    'reference',
    'special_instructions',
    'cargo_description',
    'mode_preference',
  ]

  const updates: Partial<ShipmentRequest> = {}
  for (const field of allowedFields) {
    if (body[field] !== undefined) {
      (updates as Record<string, unknown>)[field] = body[field]
    }
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json(
      { error: 'No valid fields to update' },
      { status: 400 }
    )
  }

  const { data, error } = await supabase
    .from('requests')
    .update(updates)
    .eq('id', params.id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const response: UpdateRequestResponse = {
    request: data as ShipmentRequest,
  }

  return NextResponse.json(response)
}

/**
 * DELETE /api/requests/:id
 *
 * Deletes a shipment request and all associated data (quotes, decisions).
 * This action cannot be undone.
 *
 * @param {string} id - The request UUID
 *
 * @returns {DeleteRequestResponse} Confirmation of deletion
 *
 * @throws {401} Unauthorized - User is not authenticated
 * @throws {404} Not Found - Request doesn't exist or user doesn't own it
 *
 * @example
 * DELETE /api/requests/123e4567-e89b-12d3-a456-426614174000
 */
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse<DeleteRequestResponse | ApiErrorResponse>> {
  const supabase = createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // First verify the request exists and belongs to user
  const { data: existing } = await supabase
    .from('requests')
    .select('id')
    .eq('id', params.id)
    .eq('user_id', user.id)
    .single()

  if (!existing) {
    return NextResponse.json({ error: 'Request not found' }, { status: 404 })
  }

  const { error } = await supabase
    .from('requests')
    .delete()
    .eq('id', params.id)
    .eq('user_id', user.id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const response: DeleteRequestResponse = {
    message: 'Request deleted successfully',
    deleted_id: params.id,
  }

  return NextResponse.json(response)
}
