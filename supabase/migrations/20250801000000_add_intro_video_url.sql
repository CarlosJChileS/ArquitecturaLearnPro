-- Agregar campo intro_video_url a la tabla courses
-- Para videos introductorios/trailers de YouTube u otras plataformas

ALTER TABLE public.courses 
ADD COLUMN IF NOT EXISTS intro_video_url TEXT;

COMMENT ON COLUMN public.courses.intro_video_url IS 'URL del video introductorio (YouTube, Vimeo, etc.)';
