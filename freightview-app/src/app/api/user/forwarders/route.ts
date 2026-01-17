/**
 * @fileoverview User Forwarders API
 *
 * Endpoints for managing a user's designated freight forwarders.
 * Users can maintain a list of preferred forwarders to use for quote requests.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { UserForwarder } from '@/types/database'
import type {
  UserForwarderListResponse,
  AddUserForwarderRequest,
  AddUserForwarderResponse,
  ApiErrorResponse,
} from '@/types/api'

/**
 * GET /api/user/forwarders
 *
 * Returns the authenticated user's designated forwarders list.
 * Each entry includes the forwarder details and any custom contact information.
 *
 * @returns {UserForwarderListResponse} List of user's forwarder relationships
 *
 * @throws {401} Unauthorized - User is not authenticated
 *
 * @example
 * GET /api/user/forwarders
 *
 * @example Response
 * {
 *   "forwarders": [
 *     {
 *       "id": "uuid",
 *       "forwarder_id": "fwd-uuid",
 *       "contact_email": "john@forwarder.com",
 *       "contact_name": "John Smith",
 *       "forwarder": {
 *         "id": "fwd-uuid",
 *         "name": "DHL Global Forwarding",
 *         "short_code": "DHL"
 *       }
 *     }
 *   ]
 * }
 */
export async function GET(
  _request: NextRequest
): Promise<NextResponse<UserForwarderListResponse | ApiErrorResponse>> {
  const supabase = createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data, error } = await supabase
    .from('user_forwarders')
    .select(`
      *,
      forwarder:forwarders (*)
    `)
    .eq('user_id', user.id)
    .order('created_at')

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const response: UserForwarderListResponse = {
    forwarders: data as UserForwarder[],
  }

  return NextResponse.json(response)
}

/**
 * POST /api/user/forwarders
 *
 * Adds a forwarder to the user's designated list.
 * Optionally includes custom contact information for this relationship.
 *
 * @body {AddUserForwarderRequest} Forwarder ID and optional contact details
 *
 * @returns {AddUserForwarderResponse} The created relationship with forwarder details
 *
 * @throws {400} Bad Request - forwarder_id is required
 * @throws {401} Unauthorized - User is not authenticated
 * @throws {409} Conflict - Forwarder already in user's list
 *
 * @example
 * POST /api/user/forwarders
 * {
 *   "forwarder_id": "fwd-uuid",
 *   "contact_email": "quotes@dhl.com",
 *   "contact_name": "Quote Team",
 *   "notes": "Preferred for Asia routes"
 * }
 */
export async function POST(
  request: NextRequest
): Promise<NextResponse<AddUserForwarderResponse | ApiErrorResponse>> {
  const supabase = createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: AddUserForwarderRequest
  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { error: 'Invalid JSON body' },
      { status: 400 }
    )
  }

  if (!body.forwarder_id) {
    return NextResponse.json(
      { error: 'forwarder_id is required' },
      { status: 400 }
    )
  }

  // Verify forwarder exists
  const { data: forwarder } = await supabase
    .from('forwarders')
    .select('id')
    .eq('id', body.forwarder_id)
    .single()

  if (!forwarder) {
    return NextResponse.json(
      { error: 'Forwarder not found' },
      { status: 404 }
    )
  }

  const { data, error } = await supabase
    .from('user_forwarders')
    .insert({
      user_id: user.id,
      forwarder_id: body.forwarder_id,
      contact_email: body.contact_email,
      contact_name: body.contact_name,
      notes: body.notes,
    })
    .select(`
      *,
      forwarder:forwarders (*)
    `)
    .single()

  if (error) {
    // Unique constraint violation - forwarder already added
    if (error.code === '23505') {
      return NextResponse.json(
        { error: 'Forwarder already in your designated list' },
        { status: 409 }
      )
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const response: AddUserForwarderResponse = {
    user_forwarder: data as UserForwarder,
  }

  return NextResponse.json(response, { status: 201 })
}
