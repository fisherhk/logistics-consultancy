-- FreightView Database Schema
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================
-- REFERENCE TABLES
-- =====================

-- Countries
CREATE TABLE countries (
    code CHAR(2) PRIMARY KEY,
    name VARCHAR(100) NOT NULL
);

-- Ports/Locations
CREATE TABLE ports (
    code VARCHAR(10) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    country_code CHAR(2) REFERENCES countries(code),
    port_type VARCHAR(20) CHECK (port_type IN ('seaport', 'airport', 'inland')),
    city VARCHAR(100)
);

-- Cargo types
CREATE TABLE cargo_types (
    code VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    requires_temp_control BOOLEAN DEFAULT FALSE,
    is_hazmat BOOLEAN DEFAULT FALSE
);

-- =====================
-- CORE TABLES
-- =====================

-- Users (extends Supabase auth.users)
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    company_name VARCHAR(255),
    phone VARCHAR(50),
    default_incoterms VARCHAR(10) DEFAULT 'FOB',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Forwarders
CREATE TABLE forwarders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    short_code VARCHAR(10) NOT NULL,
    logo_url VARCHAR(500),
    default_quote_email VARCHAR(255),
    api_enabled BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User's designated forwarders
CREATE TABLE user_forwarders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    forwarder_id UUID REFERENCES forwarders(id) ON DELETE CASCADE,
    contact_email VARCHAR(255),
    contact_name VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, forwarder_id)
);

-- Shipment requests
CREATE TABLE requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    reference VARCHAR(100),
    status VARCHAR(50) DEFAULT 'draft' CHECK (status IN (
        'draft',
        'pending_quotes',
        'quotes_received',
        'decision_pending',
        'booked',
        'cancelled'
    )),

    -- Origin
    origin_country CHAR(2) REFERENCES countries(code),
    origin_city VARCHAR(100),
    origin_port VARCHAR(10) REFERENCES ports(code),
    origin_address TEXT,

    -- Destination
    dest_country CHAR(2) REFERENCES countries(code),
    dest_city VARCHAR(100),
    dest_port VARCHAR(10) REFERENCES ports(code),
    dest_address TEXT,

    -- Cargo details
    cargo_type VARCHAR(50) REFERENCES cargo_types(code),
    cargo_description TEXT,
    weight_kg DECIMAL(12,2),
    volume_cbm DECIMAL(10,3),
    pieces INTEGER,
    value_usd DECIMAL(15,2),
    is_stackable BOOLEAN DEFAULT TRUE,
    is_hazmat BOOLEAN DEFAULT FALSE,
    temperature_required VARCHAR(20),

    -- Requirements
    cargo_ready_date DATE,
    delivery_required_date DATE,
    mode_preference VARCHAR(10) DEFAULT 'any' CHECK (mode_preference IN ('air', 'sea', 'any')),
    incoterms VARCHAR(10) DEFAULT 'FOB',
    special_instructions TEXT,

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    submitted_at TIMESTAMPTZ
);

-- Request forwarders (which forwarders were contacted)
CREATE TABLE request_forwarders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    request_id UUID REFERENCES requests(id) ON DELETE CASCADE,
    forwarder_id UUID REFERENCES forwarders(id) ON DELETE CASCADE,
    email_sent_at TIMESTAMPTZ,
    email_message_id VARCHAR(255),
    reminder_sent_at TIMESTAMPTZ,
    UNIQUE(request_id, forwarder_id)
);

-- Quotes received
CREATE TABLE quotes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    request_id UUID REFERENCES requests(id) ON DELETE CASCADE,
    forwarder_id UUID REFERENCES forwarders(id) ON DELETE CASCADE,
    mode VARCHAR(10) NOT NULL CHECK (mode IN ('air', 'sea')),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'expired', 'selected', 'declined')),

    -- Pricing
    currency CHAR(3) DEFAULT 'USD',
    total_amount DECIMAL(12,2) NOT NULL,
    freight_charge DECIMAL(12,2),
    fuel_surcharge DECIMAL(10,2),
    handling_charge DECIMAL(10,2),
    documentation_fee DECIMAL(10,2),
    terminal_handling DECIMAL(10,2),
    other_charges DECIMAL(10,2),

    -- Rate details
    rate_basis VARCHAR(20), -- 'per_kg', 'per_cbm', 'flat'
    rate_per_unit DECIMAL(10,4),
    chargeable_weight DECIMAL(12,2),

    -- Schedule
    etd DATE,
    eta DATE,
    transit_days INTEGER,
    carrier VARCHAR(100),
    vessel_flight VARCHAR(100),
    routing VARCHAR(100),
    transshipment_ports TEXT[],

    -- Terms
    valid_until DATE,
    free_days_origin INTEGER DEFAULT 0,
    free_days_dest INTEGER DEFAULT 0,
    payment_terms VARCHAR(50),

    -- Source tracking
    received_via VARCHAR(20) DEFAULT 'manual' CHECK (received_via IN ('manual', 'email', 'api')),
    raw_email_id VARCHAR(255),
    notes TEXT,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Decisions (tracking which quote was selected)
CREATE TABLE decisions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    request_id UUID REFERENCES requests(id) ON DELETE CASCADE,
    selected_quote_id UUID REFERENCES quotes(id),

    -- Analysis at decision time
    best_air_quote_id UUID REFERENCES quotes(id),
    best_sea_quote_id UUID REFERENCES quotes(id),
    savings_amount DECIMAL(12,2),
    savings_percentage DECIMAL(5,2),
    decision_reason TEXT,

    decided_at TIMESTAMPTZ DEFAULT NOW(),
    decided_by UUID REFERENCES profiles(id)
);

-- Email logs
CREATE TABLE email_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    request_id UUID REFERENCES requests(id),
    forwarder_id UUID REFERENCES forwarders(id),
    email_type VARCHAR(50), -- 'quote_request', 'reminder', 'selection_notice'
    to_email VARCHAR(255),
    subject VARCHAR(500),
    body TEXT,
    message_id VARCHAR(255),
    status VARCHAR(20) DEFAULT 'sent',
    sent_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================
-- INDEXES
-- =====================

CREATE INDEX idx_requests_user ON requests(user_id);
CREATE INDEX idx_requests_status ON requests(status);
CREATE INDEX idx_requests_created ON requests(created_at DESC);
CREATE INDEX idx_quotes_request ON quotes(request_id);
CREATE INDEX idx_quotes_forwarder ON quotes(forwarder_id);
CREATE INDEX idx_quotes_mode ON quotes(mode);
CREATE INDEX idx_user_forwarders_user ON user_forwarders(user_id);

-- =====================
-- ROW LEVEL SECURITY
-- =====================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_forwarders ENABLE ROW LEVEL SECURITY;
ALTER TABLE decisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;

-- Profiles: users can only see/edit their own
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

-- Requests: users can only see/edit their own
CREATE POLICY "Users can view own requests" ON requests
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own requests" ON requests
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own requests" ON requests
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own requests" ON requests
    FOR DELETE USING (auth.uid() = user_id);

-- Quotes: users can see quotes for their requests
CREATE POLICY "Users can view quotes for own requests" ON quotes
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM requests
            WHERE requests.id = quotes.request_id
            AND requests.user_id = auth.uid()
        )
    );
CREATE POLICY "Users can insert quotes for own requests" ON quotes
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM requests
            WHERE requests.id = quotes.request_id
            AND requests.user_id = auth.uid()
        )
    );

-- User forwarders: users can manage their own
CREATE POLICY "Users can view own forwarders" ON user_forwarders
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own forwarders" ON user_forwarders
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own forwarders" ON user_forwarders
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own forwarders" ON user_forwarders
    FOR DELETE USING (auth.uid() = user_id);

-- Forwarders: everyone can read (reference table)
CREATE POLICY "Anyone can view forwarders" ON forwarders
    FOR SELECT USING (true);

-- Decisions: users can see decisions for their requests
CREATE POLICY "Users can view own decisions" ON decisions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM requests
            WHERE requests.id = decisions.request_id
            AND requests.user_id = auth.uid()
        )
    );

-- =====================
-- FUNCTIONS
-- =====================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_requests_updated_at
    BEFORE UPDATE ON requests
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_quotes_updated_at
    BEFORE UPDATE ON quotes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO profiles (id, email)
    VALUES (NEW.id, NEW.email);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- =====================
-- SEED DATA
-- =====================

-- Insert some countries
INSERT INTO countries (code, name) VALUES
    ('CN', 'China'),
    ('VN', 'Vietnam'),
    ('TW', 'Taiwan'),
    ('TH', 'Thailand'),
    ('IN', 'India'),
    ('MY', 'Malaysia'),
    ('SG', 'Singapore'),
    ('US', 'United States'),
    ('MX', 'Mexico'),
    ('BR', 'Brazil'),
    ('DE', 'Germany'),
    ('GB', 'United Kingdom'),
    ('AU', 'Australia'),
    ('JP', 'Japan'),
    ('KR', 'South Korea');

-- Insert common ports
INSERT INTO ports (code, name, country_code, port_type, city) VALUES
    ('CNSHA', 'Shanghai', 'CN', 'seaport', 'Shanghai'),
    ('CNSZX', 'Shenzhen', 'CN', 'seaport', 'Shenzhen'),
    ('CNNGB', 'Ningbo', 'CN', 'seaport', 'Ningbo'),
    ('VNSGN', 'Ho Chi Minh City', 'VN', 'seaport', 'Ho Chi Minh City'),
    ('VNHAN', 'Hanoi', 'VN', 'airport', 'Hanoi'),
    ('SGSIN', 'Singapore', 'SG', 'seaport', 'Singapore'),
    ('USLAX', 'Los Angeles', 'US', 'seaport', 'Los Angeles'),
    ('USNYC', 'New York', 'US', 'seaport', 'New York'),
    ('USCHI', 'Chicago', 'US', 'inland', 'Chicago'),
    ('MXVER', 'Veracruz', 'MX', 'seaport', 'Veracruz'),
    ('BRSSZ', 'Santos', 'BR', 'seaport', 'Santos'),
    ('DEHAM', 'Hamburg', 'DE', 'seaport', 'Hamburg'),
    ('GBFXT', 'Felixstowe', 'GB', 'seaport', 'Felixstowe'),
    ('AUSYD', 'Sydney', 'AU', 'seaport', 'Sydney');

-- Insert cargo types
INSERT INTO cargo_types (code, name, requires_temp_control, is_hazmat) VALUES
    ('general', 'General Cargo', FALSE, FALSE),
    ('electronics', 'Electronics', FALSE, FALSE),
    ('apparel', 'Apparel & Textiles', FALSE, FALSE),
    ('machinery', 'Machinery & Equipment', FALSE, FALSE),
    ('automotive', 'Automotive Parts', FALSE, FALSE),
    ('food_dry', 'Food (Dry)', FALSE, FALSE),
    ('food_frozen', 'Food (Frozen)', TRUE, FALSE),
    ('pharma', 'Pharmaceuticals', TRUE, FALSE),
    ('chemicals', 'Chemicals', FALSE, TRUE),
    ('hazmat', 'Hazardous Materials', FALSE, TRUE);

-- Insert forwarders
INSERT INTO forwarders (name, short_code, default_quote_email, api_enabled) VALUES
    ('DHL Global Forwarding', 'DHL', 'quotes@dhl.com', FALSE),
    ('Kuehne + Nagel', 'K+N', 'quotes@kuehne-nagel.com', FALSE),
    ('DB Schenker', 'DBS', 'quotes@dbschenker.com', FALSE),
    ('Expeditors', 'EXP', 'quotes@expeditors.com', FALSE),
    ('Flexport', 'FLX', 'quotes@flexport.com', TRUE),
    ('DSV', 'DSV', 'quotes@dsv.com', FALSE),
    ('CEVA Logistics', 'CEVA', 'quotes@cevalogistics.com', FALSE),
    ('Nippon Express', 'NEX', 'quotes@nipponexpress.com', FALSE);
