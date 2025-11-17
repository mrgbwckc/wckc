-- Migration file: sales_orders_creation.sql (FINAL VERSION with BIGSERIAL IDs)

--
-- 1. Job Number Sequence
-- Creates a sequence to generate sequential job numbers, starting at 30000.
--
CREATE SEQUENCE IF NOT EXISTS job_number_seq
START 40000
INCREMENT 1
MINVALUE 40000
MAXVALUE 9999999
CACHE 1;


-- 2. Cabinets Table
-- Represents the specifications for the cabinets in an order.
--
CREATE TABLE IF NOT EXISTS cabinets (
    id BIGSERIAL PRIMARY KEY,
    
    -- Cabinet Specs
    species TEXT,
    color TEXT,
    finish TEXT,
    glaze TEXT,
    door_style TEXT,
    top_drawer_front TEXT,
    interior TEXT,
    drawer_box TEXT,
    drawer_hardware TEXT,
    box TEXT,

    -- Boolean Flags
    hinge_soft_close BOOLEAN DEFAULT FALSE,
    doors_parts_only BOOLEAN DEFAULT FALSE,
    hardware_only BOOLEAN  DEFAULT FALSE,
    handles_supplied BOOLEAN DEFAULT FALSE,
    handles_selected BOOLEAN DEFAULT FALSE,
    glass BOOLEAN DEFAULT FALSE,

    -- Other Details
    piece_count TEXT,
    hardware_quantity TEXT,
    glass_type TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

--
-- 3. Jobs Table
-- Central hub for production tracking. Handles the job number sequencing and relationships.
--
CREATE TABLE IF NOT EXISTS jobs (
    id BIGSERIAL PRIMARY KEY,
    
    -- The core sequential job number (e.g., 30000)
    job_base_number INTEGER NOT NULL,
    
    -- The suffix for related jobs (A, B, C, etc.)
    job_suffix TEXT,
    
    -- The calculated, full Job# (e.g., 30000 or 30000-A)
    job_number TEXT UNIQUE GENERATED ALWAYS AS (
        CASE 
            WHEN job_suffix IS NULL OR job_suffix = '' THEN job_base_number::TEXT
            ELSE job_base_number::TEXT || '-' || job_suffix
        END
    ) STORED NOT NULL,

    -- Link to the original/parent job. CHANGED type to BIGINT.
    parent_job_id BIGINT REFERENCES jobs(id) ON DELETE SET NULL, 

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

--
-- 4. Sales Orders Table
-- Core transactional table for quotes/sales.
--
CREATE TYPE "SalesStage" AS ENUM ('QUOTE', 'SOLD');
CREATE TABLE IF NOT EXISTS sales_orders (
    id BIGSERIAL PRIMARY KEY, 

    -- Unique Order Identifiers
    sales_order_number TEXT NOT NULL UNIQUE,

    -- Relationships. CHANGED types to BIGINT.
    client_id BIGINT REFERENCES client(id) ON DELETE RESTRICT NOT NULL, 
    cabinet_id BIGINT REFERENCES cabinets(id) ON DELETE RESTRICT NOT NULL, 
    job_id BIGINT REFERENCES jobs(id) ON DELETE RESTRICT, 

    -- Status & Financials
    stage "SalesStage" NOT NULL DEFAULT 'QUOTE',
    total DECIMAL(10, 2),
    deposit DECIMAL(10, 2),
    invoice_balance DECIMAL(10, 2),
    
    -- Logistics & Details
    designer TEXT,
    comments TEXT,
    install BOOLEAN NOT NULL DEFAULT FALSE,
    delivery_type TEXT,
    order_type TEXT,

    -- Countertop Details
    counter_by TEXT,
    counter_top TEXT,
    counter_color TEXT,
    counter_type TEXT,

    -- Order-Specific Shipping/Client Info (Denormalized)
    shipping_client_name TEXT ,
    shipping_street TEXT ,
    shipping_city TEXT ,
    shipping_province TEXT ,
    shipping_zip TEXT,
    shipping_phone_1 TEXT,
    shipping_phone_2 TEXT,
    shipping_email_1 TEXT,
    shipping_email_2 TEXT,

    -- Check list (Date = Done)
    layout_date TIMESTAMP WITH TIME ZONE,
    client_meeting_date TIMESTAMP WITH TIME ZONE,
    follow_up_date TIMESTAMP WITH TIME ZONE,
    appliance_specs_date TIMESTAMP WITH TIME ZONE,
    selections_date TIMESTAMP WITH TIME ZONE,
    flooring_type TEXT,
    flooring_clearance TEXT,
    markout_date TIMESTAMP WITH TIME ZONE,
    review_date TIMESTAMP WITH TIME ZONE,
    second_markout_date TIMESTAMP WITH TIME ZONE,

    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

--
-- 5. Indexes for Performance
--
CREATE INDEX ON sales_orders (client_id);
CREATE INDEX ON sales_orders (job_id);
CREATE INDEX ON jobs (job_number);