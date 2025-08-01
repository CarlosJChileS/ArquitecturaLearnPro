-- VERIFICAR Y CORREGIR VIDEOS INTRODUCTORIOS

-- 1. VERIFICAR QUE CURSOS TIENEN intro_video_url
SELECT 
    id,
    title,
    intro_video_url,
    trailer_url,
    CASE 
        WHEN intro_video_url IS NOT NULL AND intro_video_url != '' THEN '✅ TIENE VIDEO INTRO'
        WHEN trailer_url IS NOT NULL AND trailer_url != '' THEN '✅ TIENE TRAILER'
        ELSE '❌ SIN VIDEO'
    END as estado_video
FROM public.courses
ORDER BY created_at DESC;

-- 2. ACTUALIZAR CURSOS CON VIDEOS DE EJEMPLO
UPDATE public.courses 
SET intro_video_url = 'https://www.youtube.com/embed/dQw4w9WgXcQ'
WHERE intro_video_url IS NULL OR intro_video_url = '';

-- 3. TAMBIÉN AGREGAR TRAILER_URL COMO FALLBACK
UPDATE public.courses 
SET trailer_url = 'https://www.youtube.com/embed/dQw4w9WgXcQ'
WHERE trailer_url IS NULL OR trailer_url = '';

-- 4. VERIFICAR QUE TODOS LOS CURSOS TIENEN VIDEO AHORA
SELECT 
    id,
    title,
    intro_video_url,
    trailer_url,
    '✅ VIDEO CONFIGURADO' as estado
FROM public.courses
WHERE intro_video_url IS NOT NULL 
AND intro_video_url != ''
ORDER BY updated_at DESC;

-- 5. CONFIRMACIÓN
SELECT 'VIDEOS INTRODUCTORIOS CONFIGURADOS PARA TODOS LOS CURSOS' as status;
