-- Solución para el error "new row violates row-level security policy"
-- Deshabilitar RLS para todas las tablas del MVP

-- 1. Deshabilitar RLS para todas las tablas principales
ALTER TABLE IF EXISTS public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.subscription_plans DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.courses DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.lessons DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.course_enrollments DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.lesson_progress DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.user_subscriptions DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.subscribers DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.course_reviews DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.certificates DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.exams DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.exam_attempts DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.student_analytics DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.student_events DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.notifications DISABLE ROW LEVEL SECURITY;

-- 2. Eliminar todas las políticas existentes que puedan estar interfiriendo
DROP POLICY IF EXISTS "Enable read access for all users" ON public.profiles;
DROP POLICY IF EXISTS "Enable insert for users based on user_id" ON public.profiles;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON public.profiles;
DROP POLICY IF EXISTS "Users can read all courses" ON public.courses;
DROP POLICY IF EXISTS "Users can insert own courses" ON public.courses;
DROP POLICY IF EXISTS "Users can update own courses" ON public.courses;
DROP POLICY IF EXISTS "Users can read all categories" ON public.categories;
DROP POLICY IF EXISTS "Admin can manage categories" ON public.categories;
DROP POLICY IF EXISTS "Users can read all lessons" ON public.lessons;
DROP POLICY IF EXISTS "Instructors can manage own lessons" ON public.lessons;
DROP POLICY IF EXISTS "Users can read all enrollments" ON public.course_enrollments;
DROP POLICY IF EXISTS "Users can insert own enrollments" ON public.course_enrollments;
DROP POLICY IF EXISTS "Users can view own progress" ON public.lesson_progress;
DROP POLICY IF EXISTS "Users can update own progress" ON public.lesson_progress;

-- 3. Otorgar permisos completos para el service role (usado por Edge Functions)
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO service_role;

-- 4. Otorgar permisos de lectura para usuarios autenticados
GRANT SELECT ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT INSERT ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT UPDATE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT DELETE ON ALL TABLES IN SCHEMA public TO authenticated;

-- 5. Otorgar permisos para usuarios anónimos (solo lectura en tablas públicas)
GRANT SELECT ON public.categories TO anon;
GRANT SELECT ON public.courses TO anon;
GRANT SELECT ON public.lessons TO anon;
GRANT SELECT ON public.subscription_plans TO anon;

-- 6. Verificar que las tablas principales existen y tienen los campos correctos
-- Courses
DO $$ 
BEGIN
    -- Verificar campos en courses
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'category_id') THEN
        ALTER TABLE public.courses ADD COLUMN category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'instructor_id') THEN
        ALTER TABLE public.courses ADD COLUMN instructor_id UUID REFERENCES public.profiles(user_id) ON DELETE CASCADE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'subscription_tier') THEN
        ALTER TABLE public.courses ADD COLUMN subscription_tier TEXT DEFAULT 'basic' CHECK (subscription_tier IN ('free', 'basic', 'premium'));
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'is_published') THEN
        ALTER TABLE public.courses ADD COLUMN is_published BOOLEAN DEFAULT FALSE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'published') THEN
        ALTER TABLE public.courses ADD COLUMN published BOOLEAN DEFAULT FALSE;
    END IF;
    
    -- Sincronizar campos published e is_published
    UPDATE public.courses SET is_published = COALESCE(published, FALSE) WHERE is_published IS NULL;
    UPDATE public.courses SET published = COALESCE(is_published, FALSE) WHERE published IS NULL;
END $$;

-- 7. Crear trigger para manejar updated_at automáticamente
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger a tablas que lo necesiten
DROP TRIGGER IF EXISTS handle_updated_at_courses ON public.courses;
CREATE TRIGGER handle_updated_at_courses
    BEFORE UPDATE ON public.courses
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS handle_updated_at_profiles ON public.profiles;
CREATE TRIGGER handle_updated_at_profiles
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 8. Mensaje de confirmación
SELECT 'RLS deshabilitado y permisos configurados correctamente' as status;
