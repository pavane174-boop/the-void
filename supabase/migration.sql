-- ROOMS
CREATE TABLE rooms (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code VARCHAR(4) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  max_members INTEGER DEFAULT 10,
  features JSONB DEFAULT '{"confessions":true,"self_destruct":true,"polls":true,"ticking_bombs":true}'::jsonb,
  streak_count INTEGER DEFAULT 0,
  last_activity_at TIMESTAMPTZ DEFAULT NOW(),
  streak_last_reset_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- MESSAGES
CREATE TABLE messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID REFERENCES rooms(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  message_type VARCHAR(20) DEFAULT 'regular',
  self_destruct_at TIMESTAMPTZ,
  is_pinned BOOLEAN DEFAULT FALSE,
  reply_to_id UUID REFERENCES messages(id) ON DELETE SET NULL,
  reply_preview TEXT,
  poll_options JSONB,
  poll_votes JSONB DEFAULT '{}'::jsonb,
  bomb_prompt TEXT,
  bomb_expires_at TIMESTAMPTZ,
  bomb_answers JSONB DEFAULT '[]'::jsonb,
  reaction_fire INTEGER DEFAULT 0,
  reaction_skull INTEGER DEFAULT 0,
  reaction_eyes INTEGER DEFAULT 0,
  reaction_heart INTEGER DEFAULT 0,
  reaction_diamond INTEGER DEFAULT 0,
  reacted_sessions JSONB DEFAULT '{}'::jsonb,
  total_reactions INTEGER DEFAULT 0,
  session_id VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ROOM MEMBERS (for presence)
CREATE TABLE room_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID REFERENCES rooms(id) ON DELETE CASCADE NOT NULL,
  session_id VARCHAR(100) NOT NULL,
  is_online BOOLEAN DEFAULT TRUE,
  last_seen_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(room_id, session_id)
);

-- DAILY STATS
CREATE TABLE room_stats (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID REFERENCES rooms(id) ON DELETE CASCADE NOT NULL,
  date DATE DEFAULT CURRENT_DATE,
  message_count INTEGER DEFAULT 0,
  confession_count INTEGER DEFAULT 0,
  vibe VARCHAR(20) DEFAULT 'chill',
  UNIQUE(room_id, date)
);

-- INDEXES
CREATE INDEX idx_messages_room_id ON messages(room_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);
CREATE INDEX idx_messages_room_created ON messages(room_id, created_at);
CREATE INDEX idx_room_members_room_id ON room_members(room_id);
CREATE INDEX idx_room_stats_room_date ON room_stats(room_id, date);
CREATE INDEX idx_rooms_code ON rooms(code);

-- ENABLE REALTIME
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE room_members;
ALTER PUBLICATION supabase_realtime ADD TABLE rooms;

-- ROW LEVEL SECURITY (open for anonymous app)
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public access rooms" ON rooms FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access messages" ON messages FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access members" ON room_members FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access stats" ON room_stats FOR ALL USING (true) WITH CHECK (true);
