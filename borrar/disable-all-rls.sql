-- DESHABILITAR COMPLETAMENTE RLS EN TODAS LAS TABLAS

-- 1. DESHABILITAR RLS EN LA TABLA COURSES
ALTER TABLE public.courses DISABLE ROW LEVEL SECURITY;

-- 2. DESHABILITAR RLS EN TODAS LAS TABLAS RELACIONADAS
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_enrollments DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_progress DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_subscriptions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificates DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_reviews DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.exams DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_questions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_attempts DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_answers DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.reminders DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_analytics DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_events DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_events DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscribers DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_plans DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_logs DISABLE ROW LEVEL SECURITY;

-- 3. ELIMINAR TODAS LAS POLÍTICAS RLS SI EXISTEN
DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON public.courses;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.courses;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.courses;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON public.courses;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON public.courses;
DROP POLICY IF EXISTS "Users can view all courses" ON public.courses;
DROP POLICY IF EXISTS "Users can create courses" ON public.courses;
DROP POLICY IF EXISTS "Users can update courses" ON public.courses;
DROP POLICY IF EXISTS "Users can delete courses" ON public.courses;

-- 4. ELIMINAR POLÍTICAS EN OTRAS TABLAS
DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON public.profiles;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.profiles;
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON public.categories;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.categories;

-- 5. VERIFICAR QUE NO HAY POLÍTICAS ACTIVAS
SELECT 
    schemaname,
    tablename,
    policyname,
    'POLÍTICA ACTIVA - DEBE ELIMINARSE' as accion
FROM pg_policies 
WHERE schemaname = 'public';

-- 6. VERIFICAR QUE RLS ESTÁ DESHABILITADO
SELECT 
    c.relname as table_name,
    c.relrowsecurity as rls_enabled,
    CASE 
        WHEN c.relrowsecurity = false THEN 'RLS DESHABILITADO ✅'
        ELSE 'RLS HABILITADO ❌ - DEBE DESHABILITARSE'
    END as status
FROM pg_class c
JOIN pg_namespace n ON c.relnamespace = n.oid
WHERE n.nspname = 'public' 
AND c.relkind = 'r'
AND c.relname IN ('courses', 'profiles', 'categories', 'lessons')
ORDER BY c.relname;

-- 7. PROBAR ACTUALIZACIÓN SIN RLS
UPDATE public.courses 
SET title = title || ' - SIN RLS'
WHERE id = (SELECT id FROM public.courses LIMIT 1)
RETURNING id, title, instructor_id, updated_at;

-- 8. REVERTIR CAMBIO DE PRUEBA
UPDATE public.courses 
SET title = REPLACE(title, ' - SIN RLS', '')
WHERE title LIKE '% - SIN RLS';

-- 9. CONFIRMACIÓN FINAL
SELECT 'RLS COMPLETAMENTE DESHABILITADO - SISTEMA LIBRE DE POLÍTICAS' as status;
