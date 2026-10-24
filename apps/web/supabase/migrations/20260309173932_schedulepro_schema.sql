-- SchedulePro Database Schema Migration
-- Creates profiles, schedule_blocks, user_settings, schedule_history tables

-- 1. Core user profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Schedule blocks table
CREATE TABLE IF NOT EXISTS public.schedule_blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  day_of_week TEXT NOT NULL,
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  mode TEXT DEFAULT 'strict',
  notes TEXT,
  is_completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  recurrence_type TEXT,
  recurrence_days TEXT[],
  duration_minutes INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. User settings table
CREATE TABLE IF NOT EXISTS public.user_settings (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  schedule_mode TEXT DEFAULT 'strict',
  time_format TEXT DEFAULT '12h',
  theme TEXT DEFAULT 'system',
  day_start_time TEXT DEFAULT '06:00',
  day_end_time TEXT DEFAULT '23:59',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Schedule history table
CREATE TABLE IF NOT EXISTS public.schedule_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  snapshot_date DATE NOT NULL,
  blocks JSONB NOT NULL DEFAULT '[]'::jsonb,
  stats JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Unique constraint for history per user per day
CREATE UNIQUE INDEX IF NOT EXISTS idx_schedule_history_user_date 
  ON public.schedule_history (user_id, snapshot_date);

-- 5. Indexes
CREATE INDEX IF NOT EXISTS idx_schedule_blocks_user_id ON public.schedule_blocks(user_id);
CREATE INDEX IF NOT EXISTS idx_schedule_blocks_day_of_week ON public.schedule_blocks(day_of_week);
CREATE INDEX IF NOT EXISTS idx_schedule_history_user_id ON public.schedule_history(user_id);
CREATE INDEX IF NOT EXISTS idx_schedule_history_snapshot_date ON public.schedule_history(snapshot_date);

-- 6. Trigger function to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.profiles (id, name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1))
  )
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.user_settings (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$;

-- 7. Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedule_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedule_history ENABLE ROW LEVEL SECURITY;

-- 8. RLS Policies
DROP POLICY IF EXISTS "users_manage_own_profiles" ON public.profiles;
CREATE POLICY "users_manage_own_profiles"
  ON public.profiles
  FOR ALL
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

DROP POLICY IF EXISTS "users_manage_own_schedule_blocks" ON public.schedule_blocks;
CREATE POLICY "users_manage_own_schedule_blocks"
  ON public.schedule_blocks
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "users_manage_own_user_settings" ON public.user_settings;
CREATE POLICY "users_manage_own_user_settings"
  ON public.user_settings
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "users_manage_own_schedule_history" ON public.schedule_history;
CREATE POLICY "users_manage_own_schedule_history"
  ON public.schedule_history
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- 9. Trigger to auto-create profile on new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
