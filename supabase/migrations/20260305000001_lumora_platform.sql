-- ==========================================================================
-- Lumora Platform Migration
-- Adds: subjects, languages, content_packs, user_roles, user_enrollments,
--        lesson_progress, user_stats, learning_events, accessibility_profiles
-- Updates: profiles table (drops chinese_level, adds accessibility prefs)
-- ==========================================================================

-- ---------------------------------------------------------------------------
-- 1. Subjects — top-level learning categories
-- ---------------------------------------------------------------------------
CREATE TABLE public.subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  icon TEXT,
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read active subjects"
  ON public.subjects FOR SELECT
  USING (is_active = true);

-- ---------------------------------------------------------------------------
-- 2. Languages — rendering config per language
-- ---------------------------------------------------------------------------
CREATE TABLE public.languages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  native_name TEXT,
  script_type TEXT NOT NULL,
  writing_direction TEXT DEFAULT 'ltr',
  tts_code TEXT,
  rendering_config JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.languages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read active languages"
  ON public.languages FOR SELECT
  USING (is_active = true);

-- ---------------------------------------------------------------------------
-- 3. User Roles — RBAC for admin/creator/reviewer/learner
-- ---------------------------------------------------------------------------
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('learner', 'creator', 'reviewer', 'admin')),
  granted_at TIMESTAMPTZ DEFAULT now(),
  granted_by UUID REFERENCES auth.users(id),
  UNIQUE(user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Users can read their own roles
CREATE POLICY "Users can read own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

-- Admins can manage all roles
CREATE POLICY "Admins can manage roles"
  ON public.user_roles FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- ---------------------------------------------------------------------------
-- 4. Content Packs — a course/curriculum unit (admin-site ready)
-- ---------------------------------------------------------------------------
CREATE TABLE public.content_packs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id UUID REFERENCES public.subjects(id),
  language_id UUID REFERENCES public.languages(id),
  slug TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  difficulty TEXT,

  -- Authoring & admin fields
  author_id UUID REFERENCES auth.users(id),
  source_type TEXT DEFAULT 'manual'
    CHECK (source_type IN ('manual', 'csv_import', 'ai_generated')),
  review_status TEXT DEFAULT 'draft'
    CHECK (review_status IN ('draft', 'pending_review', 'approved', 'published', 'rejected')),
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ,
  review_notes TEXT,

  is_official BOOLEAN DEFAULT false,
  is_published BOOLEAN DEFAULT false,
  version INT DEFAULT 1,
  metadata JSONB DEFAULT '{}',

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  UNIQUE(subject_id, slug)
);

ALTER TABLE public.content_packs ENABLE ROW LEVEL SECURITY;

-- Anyone can read published packs
CREATE POLICY "Anyone can read published packs"
  ON public.content_packs FOR SELECT
  USING (is_published = true);

-- Authors can read their own drafts
CREATE POLICY "Authors can read own packs"
  ON public.content_packs FOR SELECT
  USING (auth.uid() = author_id);

-- Creators can insert new packs
CREATE POLICY "Creators can insert packs"
  ON public.content_packs FOR INSERT
  WITH CHECK (
    auth.uid() = author_id
    AND EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role IN ('creator', 'admin')
    )
  );

-- Authors can update their own draft packs
CREATE POLICY "Authors can update own draft packs"
  ON public.content_packs FOR UPDATE
  USING (
    auth.uid() = author_id
    AND review_status IN ('draft', 'rejected')
  );

-- Reviewers can update review_status
CREATE POLICY "Reviewers can review packs"
  ON public.content_packs FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role IN ('reviewer', 'admin')
    )
  );

-- ---------------------------------------------------------------------------
-- 5. Chapters — stored in DB for community packs
-- ---------------------------------------------------------------------------
CREATE TABLE public.chapters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pack_id UUID NOT NULL REFERENCES public.content_packs(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  sort_order INT DEFAULT 0,
  metadata JSONB DEFAULT '{}'
);

ALTER TABLE public.chapters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Chapters follow pack visibility"
  ON public.chapters FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.content_packs
      WHERE id = pack_id AND (is_published = true OR author_id = auth.uid())
    )
  );

-- ---------------------------------------------------------------------------
-- 6. Lessons
-- ---------------------------------------------------------------------------
CREATE TABLE public.lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chapter_id UUID NOT NULL REFERENCES public.chapters(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  icon TEXT,
  sort_order INT DEFAULT 0,
  is_review BOOLEAN DEFAULT false,
  content JSONB DEFAULT '{}' -- questions stored as JSONB
);

ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lessons follow chapter visibility"
  ON public.lessons FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.chapters c
      JOIN public.content_packs p ON p.id = c.pack_id
      WHERE c.id = chapter_id AND (p.is_published = true OR p.author_id = auth.uid())
    )
  );

-- ---------------------------------------------------------------------------
-- 7. Conversation Scenarios
-- ---------------------------------------------------------------------------
CREATE TABLE public.conversation_scenarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pack_id UUID REFERENCES public.content_packs(id) ON DELETE CASCADE,
  language_id UUID REFERENCES public.languages(id),
  title TEXT NOT NULL,
  icon TEXT,
  is_free BOOLEAN DEFAULT false,
  description TEXT,
  goal TEXT,
  tasks JSONB DEFAULT '[]',
  difficulty TEXT,
  phrasebook JSONB DEFAULT '[]',
  sort_order INT DEFAULT 0
);

ALTER TABLE public.conversation_scenarios ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Scenarios follow pack visibility"
  ON public.conversation_scenarios FOR SELECT
  USING (
    pack_id IS NULL
    OR EXISTS (
      SELECT 1 FROM public.content_packs
      WHERE id = pack_id AND (is_published = true OR author_id = auth.uid())
    )
  );

-- ---------------------------------------------------------------------------
-- 8. User Enrollments — which packs a user is studying
-- ---------------------------------------------------------------------------
CREATE TABLE public.user_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pack_id UUID NOT NULL REFERENCES public.content_packs(id) ON DELETE CASCADE,
  language_code TEXT,
  proficiency_level TEXT,
  enrolled_at TIMESTAMPTZ DEFAULT now(),
  is_active BOOLEAN DEFAULT true,
  UNIQUE(user_id, pack_id)
);

ALTER TABLE public.user_enrollments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own enrollments"
  ON public.user_enrollments FOR ALL
  USING (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- 9. Lesson Progress — replaces AsyncStorage lesson_progress
-- ---------------------------------------------------------------------------
CREATE TABLE public.lesson_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id TEXT NOT NULL,  -- matches lesson IDs from content packs (e.g. "1-1")
  pack_id TEXT,             -- content pack identifier
  completion_count INT DEFAULT 0,
  best_accuracy REAL,
  last_completed_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, lesson_id)
);

ALTER TABLE public.lesson_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own lesson progress"
  ON public.lesson_progress FOR ALL
  USING (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- 10. User Stats — replaces AsyncStorage speaking_listening_stats
-- ---------------------------------------------------------------------------
CREATE TABLE public.user_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pack_id TEXT,
  minutes_spoken REAL DEFAULT 0,
  minutes_listened REAL DEFAULT 0,
  questions_answered INT DEFAULT 0,
  questions_listened INT DEFAULT 0,
  conversation_turns INT DEFAULT 0,
  streak_days INT DEFAULT 0,
  last_activity_at TIMESTAMPTZ DEFAULT now()
);

CREATE UNIQUE INDEX idx_user_stats_unique
  ON public.user_stats (user_id, COALESCE(pack_id, '__global__'));

ALTER TABLE public.user_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own stats"
  ON public.user_stats FOR ALL
  USING (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- 11. Learning Events — fine-grained analytics (grant requirement)
-- ---------------------------------------------------------------------------
CREATE TABLE public.learning_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  event_data JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_learning_events_user ON public.learning_events(user_id);
CREATE INDEX idx_learning_events_type ON public.learning_events(event_type);
CREATE INDEX idx_learning_events_created ON public.learning_events(created_at);

ALTER TABLE public.learning_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert own events"
  ON public.learning_events FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read own events"
  ON public.learning_events FOR SELECT
  USING (auth.uid() = user_id);

-- Admins can read all events (for analytics/reporting)
CREATE POLICY "Admins can read all events"
  ON public.learning_events FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- ---------------------------------------------------------------------------
-- 12. Accessibility Profiles — IES grant alignment
-- ---------------------------------------------------------------------------
CREATE TABLE public.accessibility_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  accommodations JSONB DEFAULT '{}',
  learning_goals JSONB DEFAULT '[]',
  font_scale REAL DEFAULT 1.0,
  high_contrast BOOLEAN DEFAULT false,
  reduced_motion BOOLEAN DEFAULT false,
  audio_speed REAL DEFAULT 1.0,
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.accessibility_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own accessibility profile"
  ON public.accessibility_profiles FOR ALL
  USING (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- 13. Profile table updates
-- ---------------------------------------------------------------------------
-- Drop chinese_level and add accessibility_preferences
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS accessibility_preferences JSONB DEFAULT '{}';

-- We keep chinese_level for now to avoid breaking existing data,
-- but new code will use user_enrollments instead.
-- ALTER TABLE public.profiles DROP COLUMN IF EXISTS chinese_level;

-- ---------------------------------------------------------------------------
-- 14. Seed Data
-- ---------------------------------------------------------------------------

-- Subjects
INSERT INTO public.subjects (slug, display_name, icon, sort_order) VALUES
  ('languages', 'Languages', 'language-outline', 1),
  ('mathematics', 'Mathematics', 'calculator-outline', 2),
  ('science', 'Science', 'flask-outline', 3),
  ('history', 'History', 'book-outline', 4)
ON CONFLICT (slug) DO NOTHING;

-- Languages
INSERT INTO public.languages (code, display_name, native_name, script_type, writing_direction, tts_code, rendering_config) VALUES
  ('zh-CN', 'Mandarin Chinese', '普通话', 'cjk', 'ltr', 'zh-CN',
    '{"showRomanization": true, "romanizationLabel": "Pinyin", "primaryScriptLabel": "Hanzi"}'::jsonb),
  ('es', 'Spanish', 'Español', 'latin', 'ltr', 'es-ES',
    '{"showRomanization": false, "primaryScriptLabel": "Spanish"}'::jsonb),
  ('hi', 'Hindi', 'हिन्दी', 'devanagari', 'ltr', 'hi-IN',
    '{"showRomanization": true, "romanizationLabel": "IAST", "primaryScriptLabel": "Devanagari"}'::jsonb)
ON CONFLICT (code) DO NOTHING;

-- Grant read access on new tables to authenticated users
GRANT SELECT ON public.subjects TO authenticated;
GRANT SELECT ON public.languages TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_enrollments TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.lesson_progress TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.user_stats TO authenticated;
GRANT SELECT, INSERT ON public.learning_events TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.accessibility_profiles TO authenticated;
GRANT SELECT ON public.content_packs TO authenticated;
GRANT SELECT ON public.chapters TO authenticated;
GRANT SELECT ON public.lessons TO authenticated;
GRANT SELECT ON public.conversation_scenarios TO authenticated;
GRANT SELECT ON public.user_roles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.content_packs TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_roles TO authenticated;
