-- Add policy allowing users to enroll in courses if not already present
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy
    WHERE polname = 'Users can enroll in courses'
      AND polrelid = 'course_enrollments'::regclass
  ) THEN
    CREATE POLICY "Users can enroll in courses" ON public.course_enrollments
      FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
END$$;
