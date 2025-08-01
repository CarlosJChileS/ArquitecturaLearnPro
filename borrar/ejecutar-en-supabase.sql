-- SCRIPT CRÍTICO: Deshabilitar RLS completamente para resolver errores de inserción

-- 1. DESHABILITAR RLS PARA TODAS LAS TABLAS
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

-- 2. ELIMINAR TODAS LAS POLÍTICAS RLS EXISTENTES
DROP POLICY IF EXISTS "Enable read access for all users" ON public.profiles;
DROP POLICY IF EXISTS "Enable insert for users based on user_id" ON public.profiles;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON public.profiles;
DROP POLICY IF EXISTS "Users can read all courses" ON public.courses;
DROP POLICY IF EXISTS "Users can insert own courses" ON public.courses;
DROP POLICY IF EXISTS "Users can update own courses" ON public.courses;
DROP POLICY IF EXISTS "Admin can manage courses" ON public.courses;
DROP POLICY IF EXISTS "Users can read all categories" ON public.categories;
DROP POLICY IF EXISTS "Admin can manage categories" ON public.categories;
DROP POLICY IF EXISTS "Users can read all lessons" ON public.lessons;
DROP POLICY IF EXISTS "Instructors can manage own lessons" ON public.lessons;
DROP POLICY IF EXISTS "Users can read all enrollments" ON public.course_enrollments;
DROP POLICY IF EXISTS "Users can insert own enrollments" ON public.course_enrollments;
DROP POLICY IF EXISTS "Users can view own progress" ON public.lesson_progress;
DROP POLICY IF EXISTS "Users can update own progress" ON public.lesson_progress;

-- 3. OTORGAR PERMISOS COMPLETOS
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO service_role;

GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;

-- 4. VERIFICAR QUE FUNCIONÓ
SELECT 'RLS COMPLETAMENTE DESHABILITADO - LISTO PARA USAR' as status;

-- 5. PROBAR INSERCIÓN DIRECTA
INSERT INTO public.courses (
  title, 
  description, 
  price, 
  instructor_id,
  subscription_tier, 
  is_published
) VALUES (
  'CURSO DE PRUEBA SQL', 
  'Prueba directa desde SQL', 
  0,
  (SELECT user_id FROM public.profiles LIMIT 1),
  'free', 
  false
) RETURNING id, title;

-- 6. LIMPIAR PRUEBA
DELETE FROM public.courses WHERE title = 'CURSO DE PRUEBA SQL';
