-- ═══════════════════════════════════════════════════════════════
-- VIBENICITY SUPABASE SETUP SQL
-- Run this in your Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- 
-- Creates: profiles, user_data, community_terms tables
-- Free tier: 500MB database, 50K monthly active users
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
    vocab_contributions INTEGER DEFAULT 0,
    apps_generated INTEGER DEFAULT 0,
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


-- 4. UPVOTE FUNCTION (prevents double-voting in a simple way)
CREATE OR REPLACE FUNCTION increment_upvote(term_id BIGINT)
RETURNS void AS $$
BEGIN
    UPDATE community_terms
    SET upvotes = upvotes + 1
    WHERE id = term_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 5. AUTO-UPDATE TIMESTAMPS
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


-- ═══════════════════════════════════════════════════════════════
-- DONE! Your Supabase tables are ready.
-- 
-- Next steps:
-- 1. Go to Authentication → Settings → enable Email provider
-- 2. Optionally enable Google, GitHub, Discord OAuth
-- 3. Copy your project URL and anon key from Settings → API
-- 4. In VIBENICITY: VibenicityCloud.init('YOUR_URL', 'YOUR_ANON_KEY')
-- ═══════════════════════════════════════════════════════════════
