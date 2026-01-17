/**
 * Centralized Demo Data for FreightView
 *
 * This file contains sample data for demonstrating the application
 * without requiring a Supabase connection. Import these constants
 * in components that need demo mode functionality.
 */

import type {
  Organization,
  Profile,
  Forwarder,
  ShipmentRequest,
  Quote,
  UserRole,
  OrganizationPlan,
} from '@/types/database'

// =====================
// DEMO ORGANIZATIONS
// =====================

export const demoOrganizations: Organization[] = [
  {
    id: 'org-001',
    name: 'Acme Electronics Inc.',
    slug: 'acme-electronics',
    legal_name: 'Acme Electronics Incorporated',
    tax_id: 'US-123456789',
    address: '123 Innovation Drive',
    city: 'San Francisco',
    country_code: 'US',
    phone: '+1-415-555-0100',
    website: 'https://acme-electronics.com',
    logo_url: null,
    plan: 'professional' as OrganizationPlan,
    plan_seats: 10,
    plan_expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
    default_currency: 'USD',
    default_incoterms: 'FOB',
    fiscal_year_start: 1,
    created_at: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    created_by: 'user-001',
  },
  {
    id: 'org-002',
    name: 'Global Textiles Ltd.',
    slug: 'global-textiles',
    legal_name: 'Global Textiles Limited',
    tax_id: 'GB-987654321',
    address: '45 Commerce Street',
    city: 'London',
    country_code: 'GB',
    phone: '+44-20-7946-0958',
    website: 'https://globaltextiles.co.uk',
    logo_url: null,
    plan: 'starter' as OrganizationPlan,
    plan_seats: 5,
    plan_expires_at: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString(),
    default_currency: 'GBP',
    default_incoterms: 'CIF',
    fiscal_year_start: 4,
    created_at: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    created_by: 'user-003',
  },
  {
    id: 'org-003',
    name: 'Pacific Trade Co.',
    slug: 'pacific-trade',
    legal_name: 'Pacific Trade Company',
    tax_id: 'SG-456789123',
    address: '88 Marina Boulevard',
    city: 'Singapore',
    country_code: 'SG',
    phone: '+65-6789-0123',
    website: 'https://pacifictrade.sg',
    logo_url: null,
    plan: 'enterprise' as OrganizationPlan,
    plan_seats: 50,
    plan_expires_at: new Date(Date.now() + 730 * 24 * 60 * 60 * 1000).toISOString(),
    default_currency: 'USD',
    default_incoterms: 'DDP',
    fiscal_year_start: 1,
    created_at: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    created_by: 'user-005',
  },
]

// =====================
// DEMO PROFILES/USERS
// =====================

export const demoProfiles: Profile[] = [
  {
    id: 'user-001',
    email: 'demo@freightview.com',
    company_name: 'Acme Electronics Inc.',
    phone: '+1-415-555-0101',
    default_incoterms: 'FOB',
    created_at: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    organization_id: 'org-001',
    role: 'owner' as UserRole,
    job_title: 'Supply Chain Director',
    is_active: true,
    invited_by: null,
    invited_at: null,
    last_login_at: new Date().toISOString(),
  },
  {
    id: 'user-002',
    email: 'logistics@acme-electronics.com',
    company_name: 'Acme Electronics Inc.',
    phone: '+1-415-555-0102',
    default_incoterms: 'FOB',
    created_at: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    organization_id: 'org-001',
    role: 'member' as UserRole,
    job_title: 'Logistics Coordinator',
    is_active: true,
    invited_by: 'user-001',
    invited_at: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString(),
    last_login_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'user-003',
    email: 'admin@globaltextiles.co.uk',
    company_name: 'Global Textiles Ltd.',
    phone: '+44-20-7946-0959',
    default_incoterms: 'CIF',
    created_at: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    organization_id: 'org-002',
    role: 'admin' as UserRole,
    job_title: 'Operations Manager',
    is_active: true,
    invited_by: null,
    invited_at: null,
    last_login_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'user-004',
    email: 'viewer@globaltextiles.co.uk',
    company_name: 'Global Textiles Ltd.',
    phone: null,
    default_incoterms: 'CIF',
    created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    organization_id: 'org-002',
    role: 'viewer' as UserRole,
    job_title: 'Finance Analyst',
    is_active: true,
    invited_by: 'user-003',
    invited_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    last_login_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'user-005',
    email: 'ceo@pacifictrade.sg',
    company_name: 'Pacific Trade Co.',
    phone: '+65-6789-0124',
    default_incoterms: 'DDP',
    created_at: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    organization_id: 'org-003',
    role: 'owner' as UserRole,
    job_title: 'Chief Executive Officer',
    is_active: true,
    invited_by: null,
    invited_at: null,
    last_login_at: new Date().toISOString(),
  },
]

// =====================
// DEMO FORWARDERS
// =====================

export const demoForwarders: Forwarder[] = [
  {
    id: 'fwd-001',
    name: 'DHL Global Forwarding',
    short_code: 'DHL',
    logo_url: null,
    default_quote_email: 'quotes@dhl.com',
    api_enabled: false,
    created_at: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'fwd-002',
    name: 'Kuehne + Nagel',
    short_code: 'KN',
    logo_url: null,
    default_quote_email: 'quotes@kuehne-nagel.com',
    api_enabled: false,
    created_at: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'fwd-003',
    name: 'Maersk',
    short_code: 'MSK',
    logo_url: null,
    default_quote_email: 'quotes@maersk.com',
    api_enabled: true,
    created_at: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'fwd-004',
    name: 'CMA CGM',
    short_code: 'CMA',
    logo_url: null,
    default_quote_email: 'quotes@cma-cgm.com',
    api_enabled: false,
    created_at: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'fwd-005',
    name: 'FedEx Logistics',
    short_code: 'FDX',
    logo_url: null,
    default_quote_email: 'quotes@fedex.com',
    api_enabled: true,
    created_at: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'fwd-006',
    name: 'Hapag-Lloyd',
    short_code: 'HPL',
    logo_url: null,
    default_quote_email: 'quotes@hapag-lloyd.com',
    api_enabled: false,
    created_at: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'fwd-007',
    name: 'Evergreen Line',
    short_code: 'EVG',
    logo_url: null,
    default_quote_email: 'quotes@evergreen-line.com',
    api_enabled: false,
    created_at: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'fwd-008',
    name: 'DB Schenker',
    short_code: 'DBS',
    logo_url: null,
    default_quote_email: 'quotes@dbschenker.com',
    api_enabled: false,
    created_at: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
  },
]

// =====================
// DEMO SHIPMENT REQUESTS
// =====================

export const demoRequests: DemoRequest[] = [
  {
    id: 'req-001',
    user_id: 'user-001',
    organization_id: 'org-001',
    reference: 'SH-2024-001',
    status: 'quotes_received',
    origin_country: 'CN',
    origin_city: 'Shanghai',
    origin_port: 'CNSHA',
    origin_address: '888 Pudong Avenue, Pudong District',
    dest_country: 'US',
    dest_city: 'Los Angeles',
    dest_port: 'USLAX',
    dest_address: '1234 Commerce Way, Long Beach, CA 90802',
    cargo_type: 'electronics',
    cargo_description: 'Consumer electronics - smartphones and tablets',
    weight_kg: 5000,
    volume_cbm: 25,
    pieces: 200,
    value_usd: 250000,
    is_stackable: true,
    is_hazmat: false,
    temperature_required: null,
    cargo_ready_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    delivery_required_date: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    mode_preference: 'any',
    incoterms: 'FOB',
    special_instructions: 'Handle with care - fragile electronics',
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    submitted_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'req-002',
    user_id: 'user-001',
    organization_id: 'org-001',
    reference: 'SH-2024-002',
    status: 'decision_pending',
    origin_country: 'CN',
    origin_city: 'Shenzhen',
    origin_port: 'CNSZX',
    origin_address: '456 Tech Park Road, Nanshan District',
    dest_country: 'DE',
    dest_city: 'Rotterdam',
    dest_port: 'DEHAM',
    dest_address: 'Europoort Terminal, Rotterdam 3199',
    cargo_type: 'machinery',
    cargo_description: 'Industrial machinery parts and components',
    weight_kg: 12000,
    volume_cbm: 45,
    pieces: 50,
    value_usd: 180000,
    is_stackable: false,
    is_hazmat: false,
    temperature_required: null,
    cargo_ready_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    delivery_required_date: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    mode_preference: 'sea',
    incoterms: 'CIF',
    special_instructions: 'Requires forklift for unloading',
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    submitted_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'req-003',
    user_id: 'user-003',
    organization_id: 'org-002',
    reference: 'SH-2024-003',
    status: 'pending_quotes',
    origin_country: 'IN',
    origin_city: 'Mumbai',
    origin_port: null,
    origin_address: 'Plot 23, MIDC Industrial Area, Andheri East',
    dest_country: 'DE',
    dest_city: 'Hamburg',
    dest_port: 'DEHAM',
    dest_address: 'Speicherstadt 15, 20457 Hamburg',
    cargo_type: 'apparel',
    cargo_description: 'Cotton textiles and garments',
    weight_kg: 8500,
    volume_cbm: 55,
    pieces: 1200,
    value_usd: 95000,
    is_stackable: true,
    is_hazmat: false,
    temperature_required: null,
    cargo_ready_date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    delivery_required_date: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    mode_preference: 'sea',
    incoterms: 'FOB',
    special_instructions: 'Keep dry - moisture sensitive',
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    submitted_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'req-004',
    user_id: 'user-005',
    organization_id: 'org-003',
    reference: 'SH-2024-004',
    status: 'booked',
    origin_country: 'VN',
    origin_city: 'Ho Chi Minh City',
    origin_port: 'VNSGN',
    origin_address: 'Lot A5, Tan Thuan EPZ, District 7',
    dest_country: 'US',
    dest_city: 'Long Beach',
    dest_port: 'USLAX',
    dest_address: '5678 Harbor Blvd, Long Beach, CA 90802',
    cargo_type: 'general',
    cargo_description: 'Furniture - wooden tables and chairs',
    weight_kg: 15000,
    volume_cbm: 85,
    pieces: 300,
    value_usd: 120000,
    is_stackable: false,
    is_hazmat: false,
    temperature_required: null,
    cargo_ready_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    delivery_required_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    mode_preference: 'sea',
    incoterms: 'DDP',
    special_instructions: 'Wrapped and padded for protection',
    created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    submitted_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'req-005',
    user_id: 'user-002',
    organization_id: 'org-001',
    reference: 'SH-2024-005',
    status: 'pending_quotes',
    origin_country: 'CN',
    origin_city: 'Ningbo',
    origin_port: 'CNNGB',
    origin_address: 'Beilun Port Industrial Zone',
    dest_country: 'US',
    dest_city: 'New York',
    dest_port: 'USNYC',
    dest_address: '100 Port Newark, Elizabeth, NJ 07201',
    cargo_type: 'general',
    cargo_description: 'Consumer goods - home appliances',
    weight_kg: 3200,
    volume_cbm: 18,
    pieces: 150,
    value_usd: 45000,
    is_stackable: true,
    is_hazmat: false,
    temperature_required: null,
    cargo_ready_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    delivery_required_date: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    mode_preference: 'any',
    incoterms: 'FOB',
    special_instructions: null,
    created_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    submitted_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
  },
]

// =====================
// DEMO QUOTES
// =====================

export const demoQuotes: DemoQuote[] = [
  // Quotes for req-001 (Shanghai -> LA)
  {
    id: 'quote-001',
    request_id: 'req-001',
    forwarder_id: 'fwd-001',
    mode: 'air',
    status: 'active',
    currency: 'USD',
    total_amount: 12500,
    freight_charge: 10000,
    fuel_surcharge: 1500,
    handling_charge: 500,
    documentation_fee: 250,
    terminal_handling: 250,
    other_charges: 0,
    rate_basis: 'per_kg',
    rate_per_unit: 2.5,
    chargeable_weight: 5000,
    etd: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    eta: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    transit_days: 3,
    carrier: 'Cathay Pacific Cargo',
    vessel_flight: 'CX2850',
    routing: 'SHA-LAX Direct',
    transshipment_ports: null,
    valid_until: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    free_days_origin: 2,
    free_days_dest: 3,
    payment_terms: 'Net 30',
    received_via: 'manual',
    raw_email_id: null,
    notes: 'Express service available',
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    forwarder: demoForwarders[0],
  },
  {
    id: 'quote-002',
    request_id: 'req-001',
    forwarder_id: 'fwd-002',
    mode: 'air',
    status: 'active',
    currency: 'USD',
    total_amount: 11800,
    freight_charge: 9500,
    fuel_surcharge: 1400,
    handling_charge: 450,
    documentation_fee: 200,
    terminal_handling: 250,
    other_charges: 0,
    rate_basis: 'per_kg',
    rate_per_unit: 2.36,
    chargeable_weight: 5000,
    etd: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    eta: new Date(Date.now() + 13 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    transit_days: 3,
    carrier: 'Korean Air Cargo',
    vessel_flight: 'KE323',
    routing: 'SHA-ICN-LAX',
    transshipment_ports: ['ICN'],
    valid_until: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    free_days_origin: 2,
    free_days_dest: 2,
    payment_terms: 'Net 30',
    received_via: 'email',
    raw_email_id: null,
    notes: null,
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    forwarder: demoForwarders[1],
  },
  {
    id: 'quote-003',
    request_id: 'req-001',
    forwarder_id: 'fwd-003',
    mode: 'sea',
    status: 'active',
    currency: 'USD',
    total_amount: 3200,
    freight_charge: 2400,
    fuel_surcharge: 350,
    handling_charge: 200,
    documentation_fee: 100,
    terminal_handling: 150,
    other_charges: 0,
    rate_basis: 'per_cbm',
    rate_per_unit: 128,
    chargeable_weight: null,
    etd: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    eta: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    transit_days: 18,
    carrier: 'Maersk Line',
    vessel_flight: 'MAERSK SELETAR',
    routing: 'SHA-LAX Direct',
    transshipment_ports: null,
    valid_until: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    free_days_origin: 5,
    free_days_dest: 7,
    payment_terms: 'Net 30',
    received_via: 'api',
    raw_email_id: null,
    notes: 'Full container load recommended',
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    forwarder: demoForwarders[2],
  },
  {
    id: 'quote-004',
    request_id: 'req-001',
    forwarder_id: 'fwd-004',
    mode: 'sea',
    status: 'active',
    currency: 'USD',
    total_amount: 2950,
    freight_charge: 2200,
    fuel_surcharge: 320,
    handling_charge: 180,
    documentation_fee: 100,
    terminal_handling: 150,
    other_charges: 0,
    rate_basis: 'per_cbm',
    rate_per_unit: 118,
    chargeable_weight: null,
    etd: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    eta: new Date(Date.now() + 32 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    transit_days: 20,
    carrier: 'CMA CGM',
    vessel_flight: 'CMA CGM JACQUES JOSEPH',
    routing: 'SHA-NGB-LAX',
    transshipment_ports: ['CNNGB'],
    valid_until: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    free_days_origin: 7,
    free_days_dest: 5,
    payment_terms: 'Net 45',
    received_via: 'email',
    raw_email_id: null,
    notes: null,
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    forwarder: demoForwarders[3],
  },
  // Quotes for req-002 (Shenzhen -> Rotterdam)
  {
    id: 'quote-005',
    request_id: 'req-002',
    forwarder_id: 'fwd-005',
    mode: 'air',
    status: 'active',
    currency: 'USD',
    total_amount: 28500,
    freight_charge: 24000,
    fuel_surcharge: 3000,
    handling_charge: 800,
    documentation_fee: 300,
    terminal_handling: 400,
    other_charges: 0,
    rate_basis: 'per_kg',
    rate_per_unit: 2.375,
    chargeable_weight: 12000,
    etd: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    eta: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    transit_days: 3,
    carrier: 'FedEx Express',
    vessel_flight: 'FX5201',
    routing: 'SZX-AMS-RTM',
    transshipment_ports: ['AMS'],
    valid_until: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    free_days_origin: 2,
    free_days_dest: 2,
    payment_terms: 'Net 15',
    received_via: 'api',
    raw_email_id: null,
    notes: 'Heavy cargo surcharge applied',
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    forwarder: demoForwarders[4],
  },
  {
    id: 'quote-006',
    request_id: 'req-002',
    forwarder_id: 'fwd-006',
    mode: 'sea',
    status: 'active',
    currency: 'USD',
    total_amount: 6800,
    freight_charge: 5400,
    fuel_surcharge: 650,
    handling_charge: 350,
    documentation_fee: 150,
    terminal_handling: 250,
    other_charges: 0,
    rate_basis: 'per_cbm',
    rate_per_unit: 151.11,
    chargeable_weight: null,
    etd: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    eta: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    transit_days: 28,
    carrier: 'Hapag-Lloyd',
    vessel_flight: 'BERLIN EXPRESS',
    routing: 'SZX-SIN-RTM',
    transshipment_ports: ['SGSIN'],
    valid_until: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    free_days_origin: 7,
    free_days_dest: 10,
    payment_terms: 'Net 30',
    received_via: 'email',
    raw_email_id: null,
    notes: '40ft container - fits machinery',
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    forwarder: demoForwarders[5],
  },
  // Quote for req-004 (HCMC -> Long Beach - booked)
  {
    id: 'quote-007',
    request_id: 'req-004',
    forwarder_id: 'fwd-007',
    mode: 'sea',
    status: 'selected',
    currency: 'USD',
    total_amount: 4500,
    freight_charge: 3600,
    fuel_surcharge: 420,
    handling_charge: 220,
    documentation_fee: 110,
    terminal_handling: 150,
    other_charges: 0,
    rate_basis: 'per_cbm',
    rate_per_unit: 52.94,
    chargeable_weight: null,
    etd: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    eta: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    transit_days: 30,
    carrier: 'Evergreen Line',
    vessel_flight: 'EVER GOLDEN',
    routing: 'SGN-LAX Direct',
    transshipment_ports: null,
    valid_until: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    free_days_origin: 7,
    free_days_dest: 7,
    payment_terms: 'Net 30',
    received_via: 'email',
    raw_email_id: null,
    notes: 'Booking confirmed - BL issued',
    created_at: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    forwarder: demoForwarders[6],
  },
]

// =====================
// HELPER TYPES
// =====================

/**
 * Extended request type for demo data that includes nested quotes
 * Used in dashboard and list views
 */
export interface DemoRequest extends Omit<ShipmentRequest, 'cargo_type' | 'mode_preference'> {
  cargo_type: string | null
  mode_preference: 'air' | 'sea' | 'any'
  quotes?: DemoQuoteSimple[]
}

/**
 * Simplified quote for nested display in request lists
 */
export interface DemoQuoteSimple {
  id: string
  mode: 'air' | 'sea'
  total_amount: number
  forwarder?: {
    short_code: string
  }
}

/**
 * Full demo quote with all fields
 */
export interface DemoQuote extends Omit<Quote, 'forwarder_id' | 'mode' | 'status' | 'received_via'> {
  forwarder_id: string
  mode: 'air' | 'sea'
  status: 'active' | 'expired' | 'selected' | 'declined'
  received_via: 'manual' | 'email' | 'api'
  forwarder?: Forwarder
}

// =====================
// HELPER FUNCTIONS
// =====================

/**
 * Get demo requests with their associated quotes attached
 * Used for dashboard and request list displays
 */
export function getDemoRequestsWithQuotes(): DemoRequest[] {
  return demoRequests.map(request => ({
    ...request,
    quotes: demoQuotes
      .filter(q => q.request_id === request.id)
      .map(q => ({
        id: q.id,
        mode: q.mode,
        total_amount: q.total_amount,
        forwarder: q.forwarder ? { short_code: q.forwarder.short_code } : undefined,
      })),
  }))
}

/**
 * Get quotes for a specific request
 */
export function getDemoQuotesForRequest(requestId: string): DemoQuote[] {
  return demoQuotes.filter(q => q.request_id === requestId)
}

/**
 * Get a single demo request by ID
 */
export function getDemoRequestById(requestId: string): DemoRequest | undefined {
  return demoRequests.find(r => r.id === requestId)
}

/**
 * Get current demo user (first user in list)
 */
export function getDemoUser(): Profile {
  return demoProfiles[0]
}

/**
 * Get demo organization for current user
 */
export function getDemoOrganization(): Organization {
  return demoOrganizations[0]
}
