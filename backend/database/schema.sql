-- =====================================================
-- Teardrop Chat Database Schema
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- USERS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'admin', 'moderator')),
    status VARCHAR(20) DEFAULT 'offline' CHECK (status IN ('online', 'offline', 'away')),
    bio TEXT,
    avatar_url TEXT,
    last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for users table
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON public.users(username);
CREATE INDEX IF NOT EXISTS idx_users_status ON public.users(status);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);

-- =====================================================
-- MESSAGES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    receiver_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT different_users CHECK (user_id != receiver_id)
);

-- Create indexes for messages table
CREATE INDEX IF NOT EXISTS idx_messages_user_id ON public.messages(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver_id ON public.messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON public.messages(user_id, receiver_id, created_at);
CREATE INDEX IF NOT EXISTS idx_messages_unread ON public.messages(receiver_id, is_read) WHERE is_read = FALSE;

-- =====================================================
-- TYPING INDICATORS TABLE (Optional)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.typing_indicators (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    receiver_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    is_typing BOOLEAN DEFAULT FALSE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, receiver_id)
);

CREATE INDEX IF NOT EXISTS idx_typing_user ON public.typing_indicators(user_id);
CREATE INDEX IF NOT EXISTS idx_typing_receiver ON public.typing_indicators(receiver_id);

-- =====================================================
-- FUNCTIONS AND TRIGGERS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for users table
DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger for messages table
DROP TRIGGER IF EXISTS update_messages_updated_at ON public.messages;
CREATE TRIGGER update_messages_updated_at
    BEFORE UPDATE ON public.messages
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Function to auto-set read_at when is_read is set to true
CREATE OR REPLACE FUNCTION set_read_at()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.is_read = TRUE AND OLD.is_read = FALSE THEN
        NEW.read_at = NOW();
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for messages read_at
DROP TRIGGER IF EXISTS set_message_read_at ON public.messages;
CREATE TRIGGER set_message_read_at
    BEFORE UPDATE ON public.messages
    FOR EACH ROW
    WHEN (OLD.is_read IS DISTINCT FROM NEW.is_read)
    EXECUTE FUNCTION set_read_at();

-- Function to update last_seen when user status changes
CREATE OR REPLACE FUNCTION update_last_seen()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status != OLD.status THEN
        NEW.last_seen = NOW();
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for users last_seen
DROP TRIGGER IF EXISTS update_user_last_seen ON public.users;
CREATE TRIGGER update_user_last_seen
    BEFORE UPDATE ON public.users
    FOR EACH ROW
    WHEN (OLD.status IS DISTINCT FROM NEW.status)
    EXECUTE FUNCTION update_last_seen();

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.typing_indicators ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view all users"
    ON public.users FOR SELECT
    USING (true);

CREATE POLICY "Users can update own profile"
    ON public.users FOR UPDATE
    USING (auth.uid()::text = id::text);

-- Messages policies
CREATE POLICY "Users can view their own messages"
    ON public.messages FOR SELECT
    USING (auth.uid()::text = user_id::text OR auth.uid()::text = receiver_id::text);

CREATE POLICY "Users can insert their own messages"
    ON public.messages FOR INSERT
    WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update their own messages"
    ON public.messages FOR UPDATE
    USING (auth.uid()::text = user_id::text OR auth.uid()::text = receiver_id::text);

CREATE POLICY "Users can delete their own messages"
    ON public.messages FOR DELETE
    USING (auth.uid()::text = user_id::text);

-- Typing indicators policies
CREATE POLICY "Users can view typing indicators for their conversations"
    ON public.typing_indicators FOR SELECT
    USING (auth.uid()::text = user_id::text OR auth.uid()::text = receiver_id::text);

CREATE POLICY "Users can manage their own typing indicators"
    ON public.typing_indicators FOR ALL
    USING (auth.uid()::text = user_id::text);

-- =====================================================
-- HELPER VIEWS
-- =====================================================

-- View for unread message counts per user
CREATE OR REPLACE VIEW user_unread_counts AS
SELECT 
    receiver_id,
    user_id as sender_id,
    COUNT(*) as unread_count
FROM public.messages
WHERE is_read = FALSE
GROUP BY receiver_id, user_id;

-- View for recent conversations
CREATE OR REPLACE VIEW recent_conversations AS
SELECT DISTINCT ON (
    CASE 
        WHEN m.user_id < m.receiver_id THEN m.user_id
        ELSE m.receiver_id
    END,
    CASE 
        WHEN m.user_id < m.receiver_id THEN m.receiver_id
        ELSE m.user_id
    END
)
    m.*,
    u1.username as sender_username,
    u1.avatar_url as sender_avatar,
    u2.username as receiver_username,
    u2.avatar_url as receiver_avatar
FROM public.messages m
JOIN public.users u1 ON m.user_id = u1.id
JOIN public.users u2 ON m.receiver_id = u2.id
ORDER BY 
    CASE 
        WHEN m.user_id < m.receiver_id THEN m.user_id
        ELSE m.receiver_id
    END,
    CASE 
        WHEN m.user_id < m.receiver_id THEN m.receiver_id
        ELSE m.user_id
    END,
    m.created_at DESC;

-- =====================================================
-- SAMPLE QUERIES (commented out)
-- =====================================================

-- Get all messages between two users
-- SELECT * FROM public.messages 
-- WHERE (user_id = 'user1_id' AND receiver_id = 'user2_id')
--    OR (user_id = 'user2_id' AND receiver_id = 'user1_id')
-- ORDER BY created_at ASC;

-- Get unread message count for a user
-- SELECT COUNT(*) FROM public.messages
-- WHERE receiver_id = 'user_id' AND is_read = FALSE;

-- Get online users
-- SELECT * FROM public.users WHERE status = 'online';

-- Get recent conversations for a user
-- SELECT * FROM recent_conversations
-- WHERE user_id = 'user_id' OR receiver_id = 'user_id'
-- ORDER BY created_at DESC;

-- =====================================================
-- END OF SCHEMA
-- =====================================================

COMMENT ON TABLE public.users IS 'Stores user account information';
COMMENT ON TABLE public.messages IS 'Stores chat messages between users';
COMMENT ON TABLE public.typing_indicators IS 'Stores real-time typing indicators';

-- Grant permissions (adjust as needed for your Supabase setup)
-- GRANT ALL ON public.users TO authenticated;
-- GRANT ALL ON public.messages TO authenticated;
-- GRANT ALL ON public.typing_indicators TO authenticated;
