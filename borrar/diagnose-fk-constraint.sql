-- DIAGNÓSTICO COMPLETO DE LA FOREIGN KEY CONSTRAINT

-- 1. VERIFICAR LA DEFINICIÓN EXACTA DE LA CONSTRAINT
SELECT 
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name,
    tc.constraint_type
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_name = 'courses'
    AND kcu.column_name = 'instructor_id';

-- 2. VERIFICAR QUE LA TABLA REFERENCIADA ES CORRECTA
SELECT 
    'courses.instructor_id' as campo_origen,
    'DEBE APUNTAR A' as flecha,
    ccu.table_name as tabla_destino,
    ccu.column_name as campo_destino
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_name = 'courses'
    AND kcu.column_name = 'instructor_id';

-- 3. VERIFICAR TODOS LOS user_id EN profiles QUE SON VÁLIDOS
SELECT 
    p.user_id,
    p.full_name,
    p.role,
    'INSTRUCTOR VÁLIDO' as status
FROM public.profiles p
WHERE p.role IN ('admin', 'instructor')
ORDER BY p.created_at;

-- 4. VERIFICAR QUE ESTOS user_id EXISTEN EN auth.users
SELECT 
    p.user_id,
    u.email,
    p.full_name,
    p.role,
    CASE 
        WHEN u.id IS NOT NULL THEN 'USER_ID VÁLIDO EN AUTH'
        ELSE 'USER_ID NO EXISTE EN AUTH'
    END as status_auth
FROM public.profiles p
LEFT JOIN auth.users u ON p.user_id = u.id
WHERE p.role IN ('admin', 'instructor');

-- 5. VER TODOS LOS CURSOS Y SUS instructor_id ACTUALES
SELECT 
    c.id,
    c.title,
    c.instructor_id,
    p.full_name,
    CASE 
        WHEN p.user_id IS NOT NULL THEN 'INSTRUCTOR_ID VÁLIDO'
        ELSE 'INSTRUCTOR_ID INVÁLIDO'
    END as validez
FROM public.courses c
LEFT JOIN public.profiles p ON c.instructor_id = p.user_id
ORDER BY c.created_at;

-- 6. INTENTAR UNA ACTUALIZACIÓN SIMPLE PARA VERIFICAR EL ERROR EXACTO
DO $$
DECLARE 
    instructor_valido uuid;
    curso_id uuid;
BEGIN
    -- Obtener el primer instructor válido
    SELECT p.user_id INTO instructor_valido
    FROM public.profiles p
    INNER JOIN auth.users u ON p.user_id = u.id
    WHERE p.role = 'admin'
    LIMIT 1;
    
    -- Obtener el primer curso
    SELECT id INTO curso_id
    FROM public.courses
    LIMIT 1;
    
    -- Intentar la actualización
    UPDATE public.courses 
    SET instructor_id = instructor_valido
    WHERE id = curso_id;
    
    RAISE NOTICE 'Actualización exitosa con instructor_id: %', instructor_valido;
    
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Error en actualización: % - %', SQLSTATE, SQLERRM;
END $$;

-- 7. VERIFICAR SI HAY ALGÚN TRIGGER QUE ESTÉ INTERFIRIENDO
SELECT 
    t.tgname as trigger_name,
    p.proname as function_name,
    'TRIGGER EN COURSES' as info
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
JOIN pg_namespace n ON c.relnamespace = n.oid
LEFT JOIN pg_proc p ON t.tgfoid = p.oid
WHERE c.relname = 'courses'
AND n.nspname = 'public'
AND NOT t.tgisinternal;

-- 8. MOSTRAR ESTADO FINAL
SELECT 'DIAGNÓSTICO COMPLETO TERMINADO' as status;
