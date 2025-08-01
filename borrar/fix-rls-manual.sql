-- Este script debe ejecutarse directamente en Supabase Dashboard
-- Ir a Database > SQL Editor y ejecutar estas consultas una por una

-- 1. Verificar que las tablas existen
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';

-- 2. Verificar estructura de la tabla courses
\d public.courses;

-- 3. Deshabilitar RLS completamente para todas las tablas
ALTER TABLE IF EXISTS public.courses DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.lessons DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.course_enrollments DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.lesson_progress DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.user_subscriptions DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.subscription_plans DISABLE ROW LEVEL SECURITY;

-- 4. Eliminar todas las políticas RLS existentes
DROP POLICY IF EXISTS "Enable read access for all users" ON public.courses;
DROP POLICY IF EXISTS "Enable insert for users based on user_id" ON public.courses;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON public.courses;
DROP POLICY IF EXISTS "Users can read all courses" ON public.courses;
DROP POLICY IF EXISTS "Users can insert own courses" ON public.courses;
DROP POLICY IF EXISTS "Users can update own courses" ON public.courses;
DROP POLICY IF EXISTS "Admin can manage courses" ON public.courses;

-- 5. Otorgar permisos completos
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO service_role;

GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;

-- 6. Verificar que la tabla courses tiene los campos correctos
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'courses' 
ORDER BY ordinal_position;

-- 7. Probar inserción directa
INSERT INTO public.courses (
  title, 
  description, 
  price, 
  subscription_tier, 
  is_published
) VALUES (
  'Test Course SQL', 
  'Test desde SQL', 
  0, 
  'free', 
  false
);

-- 8. Verificar que se insertó
SELECT * FROM public.courses WHERE title = 'Test Course SQL';

-- 9. Limpiar test
DELETE FROM public.courses WHERE title = 'Test Course SQL';

-- 10. Mensaje de confirmación
SELECT 'RLS completamente deshabilitado y permisos configurados' as status;
