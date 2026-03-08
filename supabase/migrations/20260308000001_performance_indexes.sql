-- Performance indexes for common query patterns

CREATE INDEX IF NOT EXISTS idx_lesson_progress_user_id
  ON lesson_progress (user_id);

CREATE INDEX IF NOT EXISTS idx_term_mastery_user_review
  ON term_mastery (user_id, next_review_at);

CREATE INDEX IF NOT EXISTS idx_user_enrollments_user_id
  ON user_enrollments (user_id);

CREATE INDEX IF NOT EXISTS idx_learning_events_user_created
  ON learning_events (user_id, created_at DESC);
