-- Fix storage RLS policies: replace storage.foldername() with split_part()
-- storage.foldername() is not reliably available; split_part is standard PostgreSQL

-- Drop old policies
DROP POLICY IF EXISTS "task_attachments_insert" ON storage.objects;
DROP POLICY IF EXISTS "task_attachments_select" ON storage.objects;
DROP POLICY IF EXISTS "task_attachments_delete" ON storage.objects;
DROP POLICY IF EXISTS "task_attachments_update" ON storage.objects;

-- INSERT: user can upload to their own folder (userId/filename)
CREATE POLICY "task_attachments_insert"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'task-attachments'
    AND split_part(name, '/', 1) = auth.uid()::text
  );

-- SELECT: user can read their own files
CREATE POLICY "task_attachments_select"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'task-attachments'
    AND split_part(name, '/', 1) = auth.uid()::text
  );

-- DELETE: user can delete their own files
CREATE POLICY "task_attachments_delete"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'task-attachments'
    AND split_part(name, '/', 1) = auth.uid()::text
  );

-- UPDATE: user can update their own files
CREATE POLICY "task_attachments_update"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'task-attachments'
    AND split_part(name, '/', 1) = auth.uid()::text
  )
  WITH CHECK (
    bucket_id = 'task-attachments'
    AND split_part(name, '/', 1) = auth.uid()::text
  );
