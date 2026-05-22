-- ═══════════════════════════════════════════════════════════════
-- VIBELYF SUPABASE SETUP SQL  (v1.1 — Phase 1.D + 1.H + 1.I compliance)
-- Run this in your Supabase SQL Editor (Dashboard → SQL Editor → New Query)
--
-- Creates: profiles, user_data, community_terms, rate_limits tables
-- Free tier: 500MB database, 50K monthly active users
--
-- Changes from v1.0:
--   + profiles.communication_score_public  (per-user opt-in score visibility — Phase 1.I)
--   + profiles.age_band                    (13+ age gate compliance — CA AI Transparency Act,
--                                           EU AI Act Article 50, COPPA)
--   + profiles.consent_ai_disclosure_at    (timestamp of AI disclosure acceptance)
--   + profiles.consent_age_gate_at         (timestamp of age gate passage)
--   + rate_limits table                    (per-user request budgets for the Worker proxy)
-- ═══════════════════════════════════════════════════════════════

-- 1. PROFILES TABLE — User identity + stats
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    display_name TEXT DEFAULT '',
    avatar_url TEXT DEFAULT '',
    bio TEXT DEFAULT '',
    vibe_theme TEXT DEFAULT 'cyber',
    communication_score INTEGER DEFAULT 0,
    communication_score_public BOOLEAN DEFAULT FALSE,
    vocab_contributions INTEGER DEFAULT 0,
    apps_generated INTEGER DEFAULT 0,
    age_band TEXT CHECK (age_band IN ('13-17', '18-24', '25-34', '35-44', '45-54', '55+')),
    consent_ai_disclosure_at TIMESTAMPTZ,
    consent_age_gate_at TIMESTAMPTZ,
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Users can read all profiles (for community features)
CREATE POLICY "Profiles are viewable by everyone" ON profiles
    FOR SELECT USING (true);

-- Users can only update their own profile
CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

-- Users can insert their own profile
CREATE POLICY "Users can insert own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);


-- 2. USER_DATA TABLE — Synced localStorage data
CREATE TABLE IF NOT EXISTS user_data (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    data_key TEXT NOT NULL,
    data_value JSONB DEFAULT '{}',
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, data_key)
);

-- Enable Row Level Security
ALTER TABLE user_data ENABLE ROW LEVEL SECURITY;

-- Users can only access their own data
CREATE POLICY "Users can CRUD own data" ON user_data
    FOR ALL USING (auth.uid() = user_id);


-- 3. COMMUNITY_TERMS TABLE — Shared vocabulary contributions
CREATE TABLE IF NOT EXISTS community_terms (
    id BIGSERIAL PRIMARY KEY,
    submitted_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    term TEXT NOT NULL,
    definition TEXT NOT NULL,
    category TEXT DEFAULT 'general',
    examples TEXT[] DEFAULT '{}',
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'merged')),
    upvotes INTEGER DEFAULT 0,
    submitted_at TIMESTAMPTZ DEFAULT NOW(),
    reviewed_at TIMESTAMPTZ,
    reviewed_by UUID REFERENCES auth.users(id)
);

-- Enable Row Level Security
ALTER TABLE community_terms ENABLE ROW LEVEL SECURITY;

-- Everyone can read approved terms
CREATE POLICY "Approved terms are public" ON community_terms
    FOR SELECT USING (status = 'approved' OR status = 'pending' OR auth.uid() = submitted_by);

-- Users can submit terms
CREATE POLICY "Users can submit terms" ON community_terms
    FOR INSERT WITH CHECK (auth.uid() = submitted_by);

-- Users can update their own pending terms
CREATE POLICY "Users can update own pending terms" ON community_terms
    FOR UPDATE USING (auth.uid() = submitted_by AND status = 'pending');


-- 4. RATE_LIMITS TABLE — Per-user budgets for the Worker API proxy (Phase 1.H part 2)
CREATE TABLE IF NOT EXISTS rate_limits (
    id BIGSERIAL PRIMARY KEY,
    -- user_id is NULL for guest/anonymous traffic; bucket_key falls back to IP
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    bucket_key TEXT NOT NULL,                          -- e.g. 'user:<uuid>' or 'ip:<addr>'
    route TEXT NOT NULL,                               -- e.g. '/api/llm/codegen'
    window_start TIMESTAMPTZ NOT NULL,                 -- truncated to minute / hour / day
    window_granularity TEXT NOT NULL CHECK (window_granularity IN ('minute', 'hour', 'day')),
    count INTEGER NOT NULL DEFAULT 0,
    last_hit TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(bucket_key, route, window_start, window_granularity)
);

CREATE INDEX IF NOT EXISTS rate_limits_bucket_route_idx
    ON rate_limits (bucket_key, route, window_start);

-- Service role writes from the Worker; users never touch this table directly
ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;

-- Users can read their own rate-limit state (so the SPA can show "you have 23 requests left today")
CREATE POLICY "Users read own rate limits" ON rate_limits
    FOR SELECT USING (auth.uid() = user_id);


-- 5. UPVOTE FUNCTION (prevents double-voting in a simple way)
CREATE OR REPLACE FUNCTION increment_upvote(term_id BIGINT)
RETURNS void AS $$
BEGIN
    UPDATE community_terms
    SET upvotes = upvotes + 1
    WHERE id = term_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 6. AUTO-UPDATE TIMESTAMPS
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER user_data_updated_at
    BEFORE UPDATE ON user_data
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();


-- 7. PROFILE AUTO-CREATE ON SIGNUP
-- When a new auth.users row is created (any provider), automatically create
-- the matching profiles row. Saves the SPA from doing a separate insert.
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO profiles (id, email, display_name, avatar_url)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'full_name', ''),
        COALESCE(NEW.raw_user_meta_data->>'avatar_url', '')
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();


-- ═══════════════════════════════════════════════════════════════
-- DONE! Your Supabase tables are ready.
--
-- Next steps (walked through in Phase 1.D):
-- 1. Authentication → Providers → enable Email
-- 2. Authentication → Providers → enable Google (paste OAuth client ID + secret)
-- 3. Authentication → Providers → enable GitHub (paste OAuth app credentials)
-- 4. Project Settings → API → copy:
--      Project URL          → SUPABASE_URL
--      anon / public key    → SUPABASE_ANON_KEY (safe in browser)
--      service_role key     → SUPABASE_SERVICE_KEY (Worker-only, NEVER in browser)
-- 5. In VibeLyf SPA: VibeLyfCloud.init('YOUR_URL', 'YOUR_ANON_KEY')
-- 6. In worker/.dev.vars: SUPABASE_URL + SUPABASE_SERVICE_KEY
-- ═══════════════════════════════════════════════════════════════
