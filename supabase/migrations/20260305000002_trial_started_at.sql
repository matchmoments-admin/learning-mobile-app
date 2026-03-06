-- Add trial_started_at to profiles to prevent infinite trial restarts
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS trial_started_at TIMESTAMPTZ;
