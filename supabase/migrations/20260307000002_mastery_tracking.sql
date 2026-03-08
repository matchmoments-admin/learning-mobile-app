-- term_mastery: spaced repetition tracking per term per user
CREATE TABLE public.term_mastery (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  term_key TEXT NOT NULL,
  pack_id TEXT NOT NULL,
  mastery_level INT DEFAULT 0,
  correct_count INT DEFAULT 0,
  incorrect_count INT DEFAULT 0,
  last_reviewed_at TIMESTAMPTZ DEFAULT now(),
  next_review_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, term_key)
);

ALTER TABLE public.term_mastery ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own term mastery"
  ON public.term_mastery FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
