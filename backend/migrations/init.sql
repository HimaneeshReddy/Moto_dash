-- ================================
-- Enable UUID generation
-- ================================
CREATE EXTENSION IF NOT EXISTS "pgcrypto";



-- ================================
-- TRIGGER: auto-update updated_at
-- ================================
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;



-- ================================
-- ORGANIZATIONS
-- ================================
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    industry_type TEXT DEFAULT 'bike_retail',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER trg_organizations_updated_at
BEFORE UPDATE ON organizations
FOR EACH ROW EXECUTE FUNCTION set_updated_at();



-- ================================
-- SHOWROOMS
-- ================================
CREATE TABLE showrooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL
        REFERENCES organizations(id)
        ON DELETE CASCADE,
    name TEXT NOT NULL,
    location TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_showrooms_org
ON showrooms(organization_id);

CREATE TRIGGER trg_showrooms_updated_at
BEFORE UPDATE ON showrooms
FOR EACH ROW EXECUTE FUNCTION set_updated_at();



-- ================================
-- USERS
-- ================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL
        REFERENCES organizations(id)
        ON DELETE CASCADE,
    showroom_id UUID
        REFERENCES showrooms(id)
        ON DELETE SET NULL,
    first_name TEXT NOT NULL,
    middle_name TEXT,
    last_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT CHECK (role IN ('owner','manager','analyst')) NOT NULL,
    status TEXT DEFAULT 'active'
        CHECK (status IN ('active', 'inactive', 'suspended')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_users_org
ON users(organization_id);

CREATE INDEX idx_users_showroom
ON users(showroom_id);

CREATE TRIGGER trg_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION set_updated_at();



-- ================================
-- INVITES
-- ================================
CREATE TABLE invites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL
        REFERENCES organizations(id)
        ON DELETE CASCADE,
    showroom_id UUID
        REFERENCES showrooms(id)
        ON DELETE SET NULL,
    email TEXT NOT NULL,
    role TEXT CHECK (role IN ('manager','analyst')) NOT NULL,
    token_hash TEXT NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    status TEXT DEFAULT 'pending'
        CHECK (status IN ('pending', 'accepted', 'expired', 'cancelled')),
    created_at TIMESTAMPTZ DEFAULT NOW(),

    -- Prevent duplicate active invites for same email in same org
    CONSTRAINT uq_invite_email_org UNIQUE (email, organization_id)
);

CREATE INDEX idx_invites_org
ON invites(organization_id);



-- ================================
-- DATASETS (Metadata Layer)
-- ================================
CREATE TABLE datasets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL
        REFERENCES organizations(id)
        ON DELETE CASCADE,
    showroom_id UUID NOT NULL
        REFERENCES showrooms(id)
        ON DELETE CASCADE,
    name TEXT NOT NULL,
    storage_table_name TEXT NOT NULL,  -- WARNING: never use this value raw in SQL queries
    uploaded_by UUID
        REFERENCES users(id)
        ON DELETE SET NULL,
    row_count INTEGER,
    column_count INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_datasets_org
ON datasets(organization_id);

CREATE INDEX idx_datasets_showroom
ON datasets(showroom_id);

CREATE TRIGGER trg_datasets_updated_at
BEFORE UPDATE ON datasets
FOR EACH ROW EXECUTE FUNCTION set_updated_at();



-- ================================
-- DATASET METADATA (AI Stats)
-- ================================
CREATE TABLE dataset_metadata (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dataset_id UUID NOT NULL
        REFERENCES datasets(id)
        ON DELETE CASCADE,
    metadata JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_dataset_metadata_dataset
ON dataset_metadata(dataset_id);



-- ================================
-- DASHBOARDS
-- ================================
CREATE TABLE dashboards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL
        REFERENCES organizations(id)
        ON DELETE CASCADE,
    showroom_id UUID
        REFERENCES showrooms(id)
        ON DELETE SET NULL,
    dataset_id UUID NOT NULL
        REFERENCES datasets(id)
        ON DELETE CASCADE,
    name TEXT NOT NULL,
    scope TEXT CHECK (scope IN ('showroom','organization')) DEFAULT 'showroom',
    created_by UUID
        REFERENCES users(id)
        ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_dashboards_org
ON dashboards(organization_id);

CREATE INDEX idx_dashboards_showroom
ON dashboards(showroom_id);

CREATE TRIGGER trg_dashboards_updated_at
BEFORE UPDATE ON dashboards
FOR EACH ROW EXECUTE FUNCTION set_updated_at();



-- ================================
-- CHARTS
-- ================================
CREATE TABLE charts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dashboard_id UUID NOT NULL
        REFERENCES dashboards(id)
        ON DELETE CASCADE,
    type TEXT NOT NULL,
    config JSONB NOT NULL,
    position JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_charts_dashboard
ON charts(dashboard_id);

CREATE TRIGGER trg_charts_updated_at
BEFORE UPDATE ON charts
FOR EACH ROW EXECUTE FUNCTION set_updated_at();
