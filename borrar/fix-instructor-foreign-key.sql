-- DIAGNÓSTICO Y CORRECCIÓN DEL ERROR DE FOREIGN KEY instructor_id

-- 1. VERIFICAR CURSOS Y SUS instructor_id ACTUALES
SELECT 
    c.id,
    c.title,
    c.instructor_id,
    p.full_name as instructor_name,
    p.role as instructor_role
FROM public.courses c
LEFT JOIN public.profiles p ON c.instructor_id = p.user_id
ORDER BY c.created_at DESC;

-- 2. BUSCAR instructor_id QUE NO EXISTEN EN profiles
SELECT 
    c.id as course_id,
    c.title,
    c.instructor_id,
    'INSTRUCTOR NO EXISTE' as problema
FROM public.courses c
LEFT JOIN public.profiles p ON c.instructor_id = p.user_id
WHERE p.user_id IS NULL;

-- 3. BUSCAR USUARIOS CON ROLE 'instructor' DISPONIBLES
SELECT 
    p.user_id,
    p.full_name,
    p.email,
    p.role,
    'INSTRUCTOR DISPONIBLE' as status
FROM public.profiles p
WHERE p.role = 'instructor'
ORDER BY p.created_at;

-- 4. BUSCAR USUARIOS CON ROLE 'admin' QUE PUEDEN SER INSTRUCTORES
SELECT 
    p.user_id,
    p.full_name,
    p.email,
    p.role,
    'ADMIN - PUEDE SER INSTRUCTOR' as status
FROM public.profiles p
WHERE p.role = 'admin'
ORDER BY p.created_at;

-- 5. CREAR UN INSTRUCTOR POR DEFECTO SI NO EXISTE
INSERT INTO public.profiles (user_id, full_name, email, role)
SELECT 
    gen_random_uuid(),
    'Instructor por Defecto',
    'instructor@default.com',
    'instructor'
WHERE NOT EXISTS (
    SELECT 1 FROM public.profiles WHERE role IN ('instructor', 'admin')
);

-- 6. OBTENER EL INSTRUCTOR DISPONIBLE (PRIMER INSTRUCTOR O ADMIN)
WITH available_instructor AS (
    SELECT user_id
    FROM public.profiles
    WHERE role IN ('instructor', 'admin')
    ORDER BY 
        CASE WHEN role = 'instructor' THEN 1 ELSE 2 END,
        created_at
    LIMIT 1
)
SELECT 
    user_id as instructor_id_disponible,
    'USAR ESTE ID PARA CORREGIR CURSOS' as instruccion
FROM available_instructor;

-- 7. CORREGIR CURSOS CON instructor_id INVÁLIDOS
WITH available_instructor AS (
    SELECT user_id
    FROM public.profiles
    WHERE role IN ('instructor', 'admin')
    ORDER BY 
        CASE WHEN role = 'instructor' THEN 1 ELSE 2 END,
        created_at
    LIMIT 1
)
UPDATE public.courses
SET instructor_id = (SELECT user_id FROM available_instructor)
WHERE instructor_id NOT IN (
    SELECT user_id FROM public.profiles WHERE role IN ('instructor', 'admin')
)
RETURNING id, title, instructor_id;

-- 8. VERIFICAR CURSOS CORREGIDOS
SELECT 
    c.id,
    c.title,
    c.instructor_id,
    p.full_name as instructor_name,
    p.role as instructor_role,
    'CURSO CORREGIDO' as status
FROM public.courses c
JOIN public.profiles p ON c.instructor_id = p.user_id
ORDER BY c.updated_at DESC;

-- 9. VERIFICAR QUE NO HAY CURSOS CON instructor_id INVÁLIDOS
SELECT 
    COUNT(*) as cursos_con_instructor_invalido,
    'DEBERÍA SER 0' as esperado
FROM public.courses c
LEFT JOIN public.profiles p ON c.instructor_id = p.user_id
WHERE p.user_id IS NULL;

-- 10. CONFIRMACIÓN
SELECT 'FOREIGN KEY INSTRUCTOR_ID CORREGIDA - CURSOS LISTOS PARA ACTUALIZAR' as status;
