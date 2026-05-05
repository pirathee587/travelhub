-- 1. Rename existing table to keep a backup
ALTER TABLE IF EXISTS public.agents RENAME TO agents_old;

-- 2. Create the new agents table matching the Agent.java entity
CREATE TABLE public.agents (
    user_id BIGINT PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
    agency_name VARCHAR(255),
    license_number VARCHAR(255),
    company_name VARCHAR(255),
    owner_name VARCHAR(255),
    secondary_phone VARCHAR(255),
    whatsapp_number VARCHAR(255),
    location VARCHAR(255),
    bio TEXT,
    languages VARCHAR(255),
    operating_districts VARCHAR(255),
    website_url VARCHAR(255),
    member_since DATE,
    nic_image_url VARCHAR(255),
    application_status VARCHAR(50) DEFAULT 'Pending',
    submitted_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    rating DOUBLE PRECISION DEFAULT 0.0,
    total_trips INTEGER DEFAULT 0,
    total_revenue INTEGER DEFAULT 0,
    experience_years INTEGER,
    completion_rate DOUBLE PRECISION,
    is_active BOOLEAN DEFAULT TRUE
);

-- 3. (Optional) If you have a hotel table mapping issue, we can address that in the next step
-- For now, let's focus on getting the Agent signup working.
