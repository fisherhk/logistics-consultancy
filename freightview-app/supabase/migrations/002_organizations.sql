-- FreightView Database Schema - Organizations Extension
-- Run this AFTER 001_initial_schema.sql to add organization/company-based auth
-- This makes the system future-proof for B2B multi-tenant scenarios

-- =====================
-- ORGANIZATIONS TABLE
-- =====================

-- Organizations (Companies) - the tenant entity
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL, -- URL-friendly identifier

    -- Company details
    legal_name VARCHAR(255),
    tax_id VARCHAR(50),
    address TEXT,
    city VARCHAR(100),
    country_code CHAR(2) REFERENCES countries(code),
    phone VARCHAR(50),
    website VARCHAR(255),
    logo_url VARCHAR(500),

    -- Subscription/Plan info
    plan VARCHAR(50) DEFAULT 'free' CHECK (plan IN ('free', 'starter', 'professional', 'enterprise')),
    plan_seats INTEGER DEFAULT 3,
    plan_expires_at TIMESTAMPTZ,

    -- Settings
    default_currency CHAR(3) DEFAULT 'USD',
    default_incoterms VARCHAR(10) DEFAULT 'FOB',
    fiscal_year_start INTEGER DEFAULT 1 CHECK (fiscal_year_start BETWEEN 1 AND 12),

    -- Audit
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID
);

-- =====================
-- UPDATE PROFILES TABLE
-- =====================

-- Add organization_id to profiles
ALTER TABLE profiles ADD COLUMN organization_id UUID REFERENCES organizations(id);
ALTER TABLE profiles ADD COLUMN role VARCHAR(50) DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member', 'viewer'));
ALTER TABLE profiles ADD COLUMN job_title VARCHAR(100);
ALTER TABLE profiles ADD COLUMN is_active BOOLEAN DEFAULT TRUE;
ALTER TABLE profiles ADD COLUMN invited_by UUID REFERENCES profiles(id);
ALTER TABLE profiles ADD COLUMN invited_at TIMESTAMPTZ;
ALTER TABLE profiles ADD COLUMN last_login_at TIMESTAMPTZ;

-- Create index for organization lookup
CREATE INDEX idx_profiles_org ON profiles(organization_id);
CREATE INDEX idx_profiles_role ON profiles(role);

-- =====================
-- ORGANIZATION INVITES
-- =====================

CREATE TABLE organization_invites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'member' CHECK (role IN ('admin', 'member', 'viewer')),
    token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    invited_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    accepted_at TIMESTAMPTZ,
    UNIQUE(organization_id, email)
);

CREATE INDEX idx_org_invites_token ON organization_invites(token);
CREATE INDEX idx_org_invites_email ON organization_invites(email);

-- =====================
-- ORGANIZATION FORWARDERS
-- =====================

-- Shared forwarder relationships at org level
CREATE TABLE organization_forwarders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    forwarder_id UUID REFERENCES forwarders(id) ON DELETE CASCADE,

    -- Account details
    account_number VARCHAR(100),
    contact_name VARCHAR(100),
    contact_email VARCHAR(255),
    contact_phone VARCHAR(50),

    -- Relationship
    is_preferred BOOLEAN DEFAULT FALSE,
    contract_rate_available BOOLEAN DEFAULT FALSE,
    contract_expires_at DATE,
    notes TEXT,

    -- Audit
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES profiles(id),
    UNIQUE(organization_id, forwarder_id)
);

CREATE INDEX idx_org_forwarders_org ON organization_forwarders(organization_id);

-- =====================
-- UPDATE REQUESTS TABLE
-- =====================

-- Add organization_id to requests
ALTER TABLE requests ADD COLUMN organization_id UUID REFERENCES organizations(id);
CREATE INDEX idx_requests_org ON requests(organization_id);

-- =====================
-- ACTIVITY LOG (Audit Trail)
-- =====================

CREATE TABLE activity_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id),

    -- Action details
    action VARCHAR(100) NOT NULL, -- 'request.created', 'quote.received', 'decision.made', etc.
    entity_type VARCHAR(50), -- 'request', 'quote', 'decision'
    entity_id UUID,

    -- Context
    metadata JSONB DEFAULT '{}',
    ip_address INET,
    user_agent TEXT,

    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_activity_org ON activity_log(organization_id);
CREATE INDEX idx_activity_user ON activity_log(user_id);
CREATE INDEX idx_activity_entity ON activity_log(entity_type, entity_id);
CREATE INDEX idx_activity_created ON activity_log(created_at DESC);

-- =====================
-- UPDATED RLS POLICIES
-- =====================

ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_forwarders ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

-- Organizations: users can only see their own org
CREATE POLICY "Users can view own organization" ON organizations
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.organization_id = organizations.id
        )
    );

-- Org admins can update their org
CREATE POLICY "Admins can update organization" ON organizations
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.organization_id = organizations.id
            AND profiles.role IN ('owner', 'admin')
        )
    );

-- Organization invites: admins can manage
CREATE POLICY "Admins can manage invites" ON organization_invites
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.organization_id = organization_invites.organization_id
            AND profiles.role IN ('owner', 'admin')
        )
    );

-- Organization forwarders: org members can view, admins can manage
CREATE POLICY "Members can view org forwarders" ON organization_forwarders
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.organization_id = organization_forwarders.organization_id
        )
    );

CREATE POLICY "Admins can manage org forwarders" ON organization_forwarders
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.organization_id = organization_forwarders.organization_id
            AND profiles.role IN ('owner', 'admin')
        )
    );

-- Activity log: org members can view their org's activity
CREATE POLICY "Members can view org activity" ON activity_log
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.organization_id = activity_log.organization_id
        )
    );

-- Updated request policy to check org membership
DROP POLICY IF EXISTS "Users can view own requests" ON requests;
DROP POLICY IF EXISTS "Users can insert own requests" ON requests;
DROP POLICY IF EXISTS "Users can update own requests" ON requests;
DROP POLICY IF EXISTS "Users can delete own requests" ON requests;

-- New org-based request policies
CREATE POLICY "Org members can view org requests" ON requests
    FOR SELECT USING (
        organization_id IS NULL AND user_id = auth.uid()
        OR
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.organization_id = requests.organization_id
        )
    );

CREATE POLICY "Org members can insert requests" ON requests
    FOR INSERT WITH CHECK (
        organization_id IS NULL AND user_id = auth.uid()
        OR
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.organization_id = organization_id
            AND profiles.role IN ('owner', 'admin', 'member')
        )
    );

CREATE POLICY "Org members can update requests" ON requests
    FOR UPDATE USING (
        organization_id IS NULL AND user_id = auth.uid()
        OR
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.organization_id = requests.organization_id
            AND profiles.role IN ('owner', 'admin', 'member')
        )
    );

CREATE POLICY "Admins can delete requests" ON requests
    FOR DELETE USING (
        organization_id IS NULL AND user_id = auth.uid()
        OR
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.organization_id = requests.organization_id
            AND profiles.role IN ('owner', 'admin')
        )
    );

-- =====================
-- HELPER FUNCTIONS
-- =====================

-- Get current user's organization
CREATE OR REPLACE FUNCTION get_user_org_id()
RETURNS UUID AS $$
    SELECT organization_id FROM profiles WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Check if user has role in org
CREATE OR REPLACE FUNCTION user_has_org_role(required_roles TEXT[])
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM profiles
        WHERE id = auth.uid()
        AND role = ANY(required_roles)
    );
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- =====================
-- TRIGGERS
-- =====================

CREATE TRIGGER update_organizations_updated_at
    BEFORE UPDATE ON organizations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Auto-set organization_id on new requests
CREATE OR REPLACE FUNCTION set_request_org()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.organization_id IS NULL THEN
        NEW.organization_id := get_user_org_id();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER set_request_org_trigger
    BEFORE INSERT ON requests
    FOR EACH ROW EXECUTE FUNCTION set_request_org();

-- =====================
-- ORGANIZATION CREATION HELPER
-- =====================

-- Function to create org and assign owner
CREATE OR REPLACE FUNCTION create_organization(
    org_name TEXT,
    org_slug TEXT,
    owner_user_id UUID
)
RETURNS UUID AS $$
DECLARE
    new_org_id UUID;
BEGIN
    -- Create the organization
    INSERT INTO organizations (name, slug, created_by)
    VALUES (org_name, org_slug, owner_user_id)
    RETURNING id INTO new_org_id;

    -- Update user to be owner
    UPDATE profiles
    SET organization_id = new_org_id, role = 'owner'
    WHERE id = owner_user_id;

    RETURN new_org_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================
-- COMMENTS
-- =====================

COMMENT ON TABLE organizations IS 'Companies/tenants using the FreightView platform';
COMMENT ON TABLE organization_invites IS 'Pending invitations to join organizations';
COMMENT ON TABLE organization_forwarders IS 'Organization-level forwarder relationships and contracts';
COMMENT ON TABLE activity_log IS 'Audit trail of all actions within an organization';
COMMENT ON COLUMN profiles.role IS 'User role within their organization: owner, admin, member, or viewer';
COMMENT ON COLUMN organizations.plan IS 'Subscription plan level for the organization';
