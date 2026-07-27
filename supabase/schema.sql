-- Web3 & AI Autonomous Recruitment Platform Schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Jobs Table
CREATE TABLE IF NOT EXISTS public.jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    company_name VARCHAR(255) NOT NULL,
    company_wallet VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    requirements JSONB NOT NULL DEFAULT '[]'::jsonb,
    location VARCHAR(255) DEFAULT 'Remote',
    salary_range VARCHAR(100),
    tx_hash VARCHAR(255) UNIQUE NOT NULL,
    payment_amount NUMERIC(10, 2) DEFAULT 300.00,
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'closed', 'pending_verification')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Candidates Table
CREATE TABLE IF NOT EXISTS public.candidates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    wallet_address VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    raw_cv TEXT,
    parsed_skills JSONB DEFAULT '[]'::jsonb,
    parsed_experience JSONB DEFAULT '[]'::jsonb,
    parsed_education JSONB DEFAULT '[]'::jsonb,
    is_premium BOOLEAN DEFAULT FALSE,
    premium_until TIMESTAMP WITH TIME ZONE,
    premium_tx_hash VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Applications Table
CREATE TABLE IF NOT EXISTS public.applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE,
    candidate_wallet VARCHAR(255) NOT NULL,
    match_score INTEGER DEFAULT 0,
    status VARCHAR(50) DEFAULT 'applied' CHECK (status IN ('applied', 'ai_interviewed', 'shortlisted', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI Screening Interviews Table
CREATE TABLE IF NOT EXISTS public.interviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    application_id UUID REFERENCES public.applications(id) ON DELETE CASCADE,
    transcript JSONB NOT NULL DEFAULT '[]'::jsonb,
    ai_evaluation JSONB DEFAULT '{}'::jsonb,
    final_score INTEGER DEFAULT 0,
    summary TEXT,
    status VARCHAR(50) DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'abandoned')),
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Blockchain Payments & Verification Audit Log
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tx_hash VARCHAR(255) UNIQUE NOT NULL,
    sender_wallet VARCHAR(255) NOT NULL,
    recipient_wallet VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('job_posting_300_usdt', 'candidate_boost_10_usdt')),
    amount NUMERIC(18, 6) NOT NULL,
    chain_id INTEGER DEFAULT 56,
    token_address VARCHAR(255) NOT NULL,
    verified BOOLEAN DEFAULT FALSE,
    block_number BIGINT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for lightning fast queries
CREATE INDEX IF NOT EXISTS idx_jobs_status ON public.jobs(status);
CREATE INDEX IF NOT EXISTS idx_candidates_wallet ON public.candidates(wallet_address);
CREATE INDEX IF NOT EXISTS idx_candidates_premium ON public.candidates(is_premium DESC);
CREATE INDEX IF NOT EXISTS idx_applications_job ON public.applications(job_id);
CREATE INDEX IF NOT EXISTS idx_transactions_hash ON public.transactions(tx_hash);
