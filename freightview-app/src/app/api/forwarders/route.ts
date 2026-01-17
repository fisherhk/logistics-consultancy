/**
 * @fileoverview Forwarders API
 *
 * Endpoint for listing all available freight forwarders.
 * This serves as a reference/lookup endpoint for the application.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { Forwarder } from '@/types/database'
import type { ForwarderListResponse, ApiErrorResponse } from '@/types/api'

/**
 * GET /api/forwarders
 *
 * Returns a list of all available freight forwarders in the system.
 * Forwarders are sorted alphabetically by name.
 *
 * @returns {ForwarderListResponse} List of all forwarders
 *
 * @throws {401} Unauthorized - User is not authenticated
 *
 * @example
 * GET /api/forwarders
 *
 * @example Response
 * {
 *   "forwarders": [
 *     {
 *       "id": "uuid",
 *       "name": "DHL Global Forwarding",
 *       "short_code": "DHL",
 *       "api_enabled": false,
 *       ...
 *     },
 *     ...
 *   ]
 * }
 */
export async function GET(
  request: NextRequest
): Promise<NextResponse<ForwarderListResponse | ApiErrorResponse>> {
  const supabase = createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data, error } = await supabase
    .from('forwarders')
    .select('*')
    .order('name')

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const response: ForwarderListResponse = {
    forwarders: data as Forwarder[],
  }

  return NextResponse.json(response)
}
