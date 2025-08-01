-- DIAGNÓSTICO ESENCIAL Y RÁPIDO

-- 1. ¿A QUE TABLA APUNTA LA FOREIGN KEY?
SELECT 
    ccu.table_name AS tabla_referenciada,
    ccu.column_name AS campo_referenciado
FROM information_schema.table_constraints AS tc 
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_name = 'courses'
    AND tc.constraint_name = 'courses_instructor_id_fkey';

-- 2. ¿QUÉ ADMINS TENGO DISPONIBLES?
SELECT user_id, full_name, role FROM public.profiles WHERE role = 'admin';

-- 3. ¿QUÉ CURSOS TENGO Y SUS instructor_id?
SELECT id, title, instructor_id FROM public.courses LIMIT 3;

-- 4. PRUEBA SIMPLE: ¿PUEDO ACTUALIZAR UN CURSO USANDO EL ADMIN?
UPDATE public.courses 
SET instructor_id = (SELECT user_id FROM public.profiles WHERE role = 'admin' LIMIT 1)
WHERE id = (SELECT id FROM public.courses LIMIT 1)
RETURNING id, title, instructor_id;
