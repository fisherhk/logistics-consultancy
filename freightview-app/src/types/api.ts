/**
 * API Response Types for FreightView
 *
 * This file defines TypeScript interfaces for all API endpoint
 * request and response payloads. These types ensure type safety
 * across the application and serve as API documentation.
 */

import type {
  ShipmentRequest,
  Quote,
  Forwarder,
  UserForwarder,
  RequestWithQuotes,
  QuoteComparison,
  Decision,
  CreateRequestInput,
  CreateQuoteInput,
} from './database'

// =====================
// COMMON TYPES
// =====================

/**
 * Standard error response returned by all API endpoints
 */
export interface ApiErrorResponse {
  /** Error message describing what went wrong */
  error: string
  /** Optional additional details about the error */
  details?: string
  /** Optional error code for programmatic handling */
  code?: string
}

/**
 * Pagination metadata for list endpoints
 */
export interface PaginationMeta {
  /** Current page number (1-indexed) */
  page: number
  /** Number of items per page */
  per_page: number
  /** Total number of items across all pages */
  total: number
  /** Total number of pages */
  total_pages: number
}

/**
 * Standard success response wrapper
 */
export interface ApiSuccessResponse<T> {
  data: T
  meta?: PaginationMeta
}

// =====================
// REQUEST ENDPOINTS
// =====================

/**
 * GET /api/requests
 * Returns a paginated list of shipment requests for the authenticated user
 */
export interface RequestListResponse {
  /** Array of shipment requests */
  requests: ShipmentRequest[]
  /** Total count of requests matching the filter */
  count: number
}

/**
 * GET /api/requests/:id
 * Returns a single request with all related data
 */
export interface RequestDetailResponse {
  /** The requested shipment with quotes and forwarders */
  request: RequestWithQuotes
}

/**
 * POST /api/requests
 * Creates a new shipment request
 */
export interface CreateRequestRequest extends CreateRequestInput {}

/**
 * POST /api/requests - Response
 */
export interface CreateRequestResponse {
  /** The newly created request */
  request: ShipmentRequest
  /** IDs of forwarders that were notified */
  notified_forwarders: string[]
}

/**
 * PATCH /api/requests/:id
 * Updates an existing request
 */
export interface UpdateRequestRequest {
  /** Fields to update (partial) */
  reference?: string
  status?: ShipmentRequest['status']
  origin_city?: string
  origin_country?: string
  dest_city?: string
  dest_country?: string
  cargo_type?: string
  cargo_description?: string
  weight_kg?: number
  volume_cbm?: number
  pieces?: number
  value_usd?: number
  cargo_ready_date?: string
  delivery_required_date?: string
  mode_preference?: 'air' | 'sea' | 'any'
  special_instructions?: string
}

/**
 * PATCH /api/requests/:id - Response
 */
export interface UpdateRequestResponse {
  /** The updated request */
  request: ShipmentRequest
}

/**
 * DELETE /api/requests/:id - Response
 */
export interface DeleteRequestResponse {
  /** Confirmation message */
  message: string
  /** ID of the deleted request */
  deleted_id: string
}

// =====================
// QUOTE ENDPOINTS
// =====================

/**
 * GET /api/requests/:id/quotes
 * Returns all quotes for a specific request
 */
export interface QuoteListResponse {
  /** Array of quotes with forwarder details */
  quotes: Quote[]
  /** Summary statistics */
  summary: {
    /** Total number of quotes */
    total: number
    /** Number of air freight quotes */
    air_count: number
    /** Number of sea freight quotes */
    sea_count: number
    /** Lowest air quote amount (null if no air quotes) */
    lowest_air: number | null
    /** Lowest sea quote amount (null if no sea quotes) */
    lowest_sea: number | null
  }
}

/**
 * POST /api/requests/:id/quotes
 * Manually adds a quote to a request
 */
export interface CreateQuoteRequest extends CreateQuoteInput {}

/**
 * POST /api/requests/:id/quotes - Response
 */
export interface CreateQuoteResponse {
  /** The newly created quote */
  quote: Quote
}

/**
 * PATCH /api/quotes/:id
 * Updates a quote (e.g., mark as selected)
 */
export interface UpdateQuoteRequest {
  status?: Quote['status']
  notes?: string
}

/**
 * PATCH /api/quotes/:id - Response
 */
export interface UpdateQuoteResponse {
  /** The updated quote */
  quote: Quote
}

// =====================
// ANALYSIS ENDPOINTS
// =====================

/**
 * GET /api/requests/:id/analysis
 * Returns air vs sea comparison analysis for a request
 */
export interface QuoteAnalysisResponse extends QuoteComparison {
  /** Analysis metadata */
  analysis: {
    /** Timestamp when analysis was generated */
    generated_at: string
    /** Number of quotes analyzed */
    quotes_analyzed: number
    /** Whether enough data exists for reliable comparison */
    is_reliable: boolean
  }
}

// =====================
// DECISION ENDPOINTS
// =====================

/**
 * POST /api/requests/:id/decision
 * Records a quote selection decision
 */
export interface CreateDecisionRequest {
  /** ID of the selected quote */
  selected_quote_id: string
  /** Reason for the decision */
  decision_reason?: string
}

/**
 * POST /api/requests/:id/decision - Response
 */
export interface CreateDecisionResponse {
  /** The recorded decision */
  decision: Decision
  /** Updated request status */
  request: ShipmentRequest
}

// =====================
// FORWARDER ENDPOINTS
// =====================

/**
 * GET /api/forwarders
 * Returns list of all available forwarders
 */
export interface ForwarderListResponse {
  /** Array of forwarders */
  forwarders: Forwarder[]
}

/**
 * GET /api/user/forwarders
 * Returns the user's designated forwarders
 */
export interface UserForwarderListResponse {
  /** Array of user's forwarder relationships */
  forwarders: UserForwarder[]
}

/**
 * POST /api/user/forwarders
 * Adds a forwarder to user's designated list
 */
export interface AddUserForwarderRequest {
  /** ID of the forwarder to add */
  forwarder_id: string
  /** Contact email for this forwarder relationship */
  contact_email?: string
  /** Contact name at the forwarder */
  contact_name?: string
  /** Notes about this forwarder relationship */
  notes?: string
}

/**
 * POST /api/user/forwarders - Response
 */
export interface AddUserForwarderResponse {
  /** The created relationship */
  user_forwarder: UserForwarder
}

/**
 * DELETE /api/user/forwarders/:id - Response
 */
export interface RemoveUserForwarderResponse {
  /** Confirmation message */
  message: string
  /** ID of the removed relationship */
  removed_id: string
}

// =====================
// TYPE GUARDS
// =====================

/**
 * Type guard to check if response is an error
 */
export function isApiError(response: unknown): response is ApiErrorResponse {
  return (
    typeof response === 'object' &&
    response !== null &&
    'error' in response &&
    typeof (response as ApiErrorResponse).error === 'string'
  )
}

/**
 * Type guard to check if response has pagination
 */
export function hasPagination<T>(
  response: ApiSuccessResponse<T>
): response is ApiSuccessResponse<T> & { meta: PaginationMeta } {
  return response.meta !== undefined
}
