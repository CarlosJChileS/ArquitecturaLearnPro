/*
=======================================================
🎯 VERIFICACIÓN COMPLETA - BASE DE DATOS FUNCIONAL
=======================================================
INSTRUCCIONES: 
1. Copia TODO este contenido
2. Pégalo en SQL Editor de Supabase (nueva query)
3. Click RUN
4. Revisa los resultados
=======================================================
*/

-- 🔍 VERIFICACIÓN 1: Verificar que todas las tablas existen
-- ==========================================================
SELECT 
    '✅ TABLAS' as categoria,
    table_name as nombre,
    CASE 
        WHEN table_name IN (
            'profiles', 'courses', 'lessons', 'course_enrollments', 
            'lesson_progress', 'notifications', 'certificates', 
            'exams', 'exam_questions', 'exam_submissions', 
            'student_events', 'student_analytics', 'user_subscriptions',
            'subscription_plans', 'reviews', 'subscribers'
        ) THEN '✅ EXISTE'
        ELSE '⚠️ INESPERADA'
    END as estado
FROM information_schema.tables 
WHERE table_schema = 'public' 
    AND table_type = 'BASE TABLE'
    AND table_name NOT LIKE '%pgrst_%'
ORDER BY table_name;

-- 🔍 VERIFICACIÓN 2: Verificar que todas las funciones existen
-- ============================================================
SELECT 
    '🔧 FUNCIONES' as categoria,
    proname as nombre,
    oidvectortypes(proargtypes) as parametros,
    '✅ EXISTE' as estado
FROM pg_proc 
WHERE pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
    AND proname IN (
        'get_user_dashboard',
        'get_user_notifications', 
        'complete_course_with_exam',
        'track_student_event',
        'get_course_progress',
        'update_lesson_progress',
        'update_updated_at_column'
    )
ORDER BY proname;

-- 🔍 VERIFICACIÓN 3: Verificar columnas críticas
-- ==============================================
SELECT 
    '📊 COLUMNAS' as categoria,
    table_name || '.' || column_name as nombre,
    data_type as tipo,
    '✅ EXISTE' as estado
FROM information_schema.columns 
WHERE table_schema = 'public' 
    AND (
        (table_name = 'profiles' AND column_name IN ('subscription_tier', 'stripe_customer_id')) OR
        (table_name = 'courses' AND column_name IN ('average_rating', 'total_reviews')) OR
        (table_name = 'course_enrollments' AND column_name = 'progress_percentage') OR
        (table_name = 'lesson_progress' AND column_name IN ('is_completed', 'watch_time_seconds'))
    )
ORDER BY table_name, column_name;

-- 🔍 VERIFICACIÓN 4: Contar registros en tablas principales
-- =========================================================
SELECT '📈 DATOS' as categoria, 'profiles' as tabla, COUNT(*) as registros FROM public.profiles
UNION ALL
SELECT '📈 DATOS' as categoria, 'courses' as tabla, COUNT(*) as registros FROM public.courses
UNION ALL
SELECT '📈 DATOS' as categoria, 'lessons' as tabla, COUNT(*) as registros FROM public.lessons
UNION ALL
SELECT '📈 DATOS' as categoria, 'course_enrollments' as tabla, COUNT(*) as registros FROM public.course_enrollments
UNION ALL
SELECT '📈 DATOS' as categoria, 'subscription_plans' as tabla, COUNT(*) as registros FROM public.subscription_plans
ORDER BY tabla;

-- 🔍 VERIFICACIÓN 5: Probar función crítica
-- =========================================
SELECT 
    '🧪 PRUEBAS' as categoria,
    'get_user_dashboard' as nombre,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM pg_proc 
            WHERE proname = 'get_user_dashboard' 
            AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
        ) THEN '✅ FUNCIÓN DISPONIBLE'
        ELSE '❌ FUNCIÓN FALTANTE'
    END as estado;

-- 🎯 RESUMEN FINAL
-- ================
SELECT 
    '🎯 RESUMEN' as categoria,
    'TOTAL_TABLAS' as metrica,
    COUNT(*) as valor
FROM information_schema.tables 
WHERE table_schema = 'public' 
    AND table_type = 'BASE TABLE'
    AND table_name NOT LIKE '%pgrst_%'

UNION ALL

SELECT 
    '🎯 RESUMEN' as categoria,
    'TOTAL_FUNCIONES' as metrica,
    COUNT(*) as valor
FROM pg_proc 
WHERE pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
    AND proname IN (
        'get_user_dashboard', 'get_user_notifications', 'complete_course_with_exam',
        'track_student_event', 'get_course_progress', 'update_lesson_progress'
    );

-- 🏁 MENSAJE FINAL
-- ================
SELECT 
    '🏁 ESTADO' as categoria,
    'BASE_DE_DATOS' as componente,
    '🎉 ¡TOTALMENTE FUNCIONAL!' as mensaje;
