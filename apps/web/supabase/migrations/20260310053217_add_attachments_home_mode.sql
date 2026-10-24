-- Add task_attachments table and home_mode setting

-- 1. Add home_mode to user_settings
ALTER TABLE public.user_settings
ADD COLUMN IF NOT EXISTS home_mode BOOLEAN DEFAULT FALSE;

-- 2. Add recurrence fields to schedule_blocks (already exist but ensure)
ALTER TABLE public.schedule_blocks
ADD COLUMN IF NOT EXISTS recurrence_type TEXT;

ALTER TABLE public.schedule_blocks
ADD COLUMN IF NOT EXISTS recurrence_days TEXT[];

ALTER TABLE public.schedule_blocks
ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'medium';

-- 3. Create task_attachments table
CREATE TABLE IF NOT EXISTS public.task_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID REFERENCES public.schedule_blocks(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER,
  storage_path TEXT,
  attachment_type TEXT DEFAULT 'file',
  email_subject TEXT,
  email_from TEXT,
  email_body TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Indexes
CREATE INDEX IF NOT EXISTS idx_task_attachments_task_id ON public.task_attachments(task_id);
CREATE INDEX IF NOT EXISTS idx_task_attachments_user_id ON public.task_attachments(user_id);

-- 5. Enable RLS
ALTER TABLE public.task_attachments ENABLE ROW LEVEL SECURITY;

-- 6. RLS Policies
DROP POLICY IF EXISTS "users_manage_own_task_attachments" ON public.task_attachments;
CREATE POLICY "users_manage_own_task_attachments"
  ON public.task_attachments
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
