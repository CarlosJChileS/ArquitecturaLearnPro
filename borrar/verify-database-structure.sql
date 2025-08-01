-- Script para verificar el estado de la base de datos
-- Filename: verify-database-structure.sql

-- 1. Verificar existencia de tablas principales
-- =============================================
SELECT 'TABLAS PRINCIPALES' AS categoria, '' as detalle;

SELECT 
    schemaname,
    tablename,
    CASE WHEN tablename IS NOT NULL THEN '✓ Existe' ELSE '✗ No existe' END as estado
FROM pg_tables 
WHERE schemaname = 'public' 
    AND tablename IN (
        'profiles', 'categories', 'subscription_plans', 'courses', 'lessons',
        'course_enrollments', 'lesson_progress', 'user_subscriptions', 
        'subscribers', 'course_reviews', 'certificates', 'exams', 
        'exam_attempts', 'student_analytics', 'student_events', 'notifications'
    )
ORDER BY tablename;

-- 2. Verificar estructura de columnas críticas
-- ============================================
SELECT 'COLUMNAS CRÍTICAS' AS categoria, '' as detalle;

-- Verificar columnas en courses
SELECT 
    'courses' as tabla,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
    AND table_name = 'courses'
    AND column_name IN ('id', 'title', 'instructor_id', 'category_id', 'is_published', 'subscription_tier', 'average_rating')
ORDER BY ordinal_position;

-- Verificar columnas en course_enrollments
SELECT 
    'course_enrollments' as tabla,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
    AND table_name = 'course_enrollments'
    AND column_name IN ('id', 'user_id', 'course_id', 'progress_percentage', 'status', 'completed_at')
ORDER BY ordinal_position;

-- Verificar columnas en lesson_progress
SELECT 
    'lesson_progress' as tabla,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
    AND table_name = 'lesson_progress'
    AND column_name IN ('id', 'user_id', 'lesson_id', 'course_id', 'is_completed', 'watch_time_seconds', 'time_spent')
ORDER BY ordinal_position;

-- 3. Verificar funciones existentes
-- =================================
SELECT 'FUNCIONES' AS categoria, '' as detalle;

SELECT 
    routine_name,
    routine_type,
    CASE WHEN routine_name IS NOT NULL THEN '✓ Existe' ELSE '✗ No existe' END as estado
FROM information_schema.routines
WHERE routine_schema = 'public'
    AND routine_name IN (
        'get_user_dashboard', 'get_user_notifications', 'complete_course_with_exam',
        'track_student_event', 'get_course_progress', 'update_lesson_progress',
        'track_stuident_event'
    )
ORDER BY routine_name;

-- 4. Verificar índices críticos
-- =============================
SELECT 'ÍNDICES CRÍTICOS' AS categoria, '' as detalle;

SELECT 
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
    AND tablename IN ('courses', 'course_enrollments', 'lesson_progress', 'lessons')
    AND indexname LIKE 'idx_%'
ORDER BY tablename, indexname;

-- 5. Verificar políticas RLS (deberían estar deshabilitadas para MVP)
-- ==================================================================
SELECT 'POLÍTICAS RLS' AS categoria, '' as detalle;

SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled,
    CASE WHEN rowsecurity THEN '⚠ RLS Habilitado' ELSE '✓ RLS Deshabilitado' END as estado
FROM pg_tables 
WHERE schemaname = 'public' 
    AND tablename IN (
        'profiles', 'courses', 'lessons', 'course_enrollments', 
        'lesson_progress', 'categories', 'subscription_plans'
    )
ORDER BY tablename;

-- 6. Verificar datos básicos
-- ==========================
SELECT 'DATOS BÁSICOS' AS categoria, '' as detalle;

-- Categorías
SELECT 'categories' as tabla, COUNT(*) as total_registros
FROM public.categories
UNION ALL
-- Planes de suscripción
SELECT 'subscription_plans' as tabla, COUNT(*) as total_registros
FROM public.subscription_plans
UNION ALL
-- Cursos
SELECT 'courses' as tabla, COUNT(*) as total_registros
FROM public.courses
UNION ALL
-- Inscripciones
SELECT 'course_enrollments' as tabla, COUNT(*) as total_registros
FROM public.course_enrollments
ORDER BY tabla;

-- 7. Verificar relaciones de claves foráneas
-- ==========================================
SELECT 'CLAVES FORÁNEAS' AS categoria, '' as detalle;

SELECT 
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name,
    tc.constraint_name
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_schema = 'public'
    AND tc.table_name IN ('courses', 'lessons', 'course_enrollments', 'lesson_progress')
ORDER BY tc.table_name, kcu.column_name;
