-- Add type column to lessons table
ALTER TABLE public.lessons
ADD COLUMN IF NOT EXISTS type TEXT
  DEFAULT 'video'
  CHECK (type IN ('video', 'text', 'quiz', 'assignment', 'live_session'));

-- Update existing lessons to have video type if null
UPDATE public.lessons 
SET type = 'video' 
WHERE type IS NULL;

-- Add comment to explain the column
COMMENT ON COLUMN public.lessons.type IS 'Type of lesson: video, text, quiz, assignment, or live_session';
