-- CORRECCIÓN: USAR user_id CORRECTO, NO EL id DEL PERFIL

-- 1. VERIFICAR EL PROBLEMA - DIFERENCIA ENTRE id y user_id
SELECT 
    p.id as profile_id,
    p.user_id as user_id_correcto,
    p.full_name,
    p.role,
    'ESTOS SON DIFERENTES' as nota
FROM public.profiles p
WHERE p.role = 'admin';

-- 2. VERIFICAR QUE EL user_id CORRECTO EXISTE EN auth.users
SELECT 
    u.id as user_id,
    u.email,
    p.full_name,
    p.role,
    'USUARIO VÁLIDO PARA INSTRUCTOR' as status
FROM auth.users u
INNER JOIN public.profiles p ON u.id = p.user_id
WHERE p.role = 'admin';

-- 3. VER CURSOS ACTUALES Y SUS instructor_id PROBLEMÁTICOS
SELECT 
    c.id,
    c.title,
    c.instructor_id,
    CASE 
        WHEN c.instructor_id = 'b46ad97c-45d8-4545-be0e-520329359f36' THEN 'ES EL ID DEL PERFIL (INCORRECTO)'
        WHEN c.instructor_id = '7ee127dd-cf89-4593-88c8-252f46cb1118' THEN 'ES EL USER_ID (CORRECTO)'
        ELSE 'OTRO ID'
    END as diagnosis
FROM public.courses c;

-- 4. CORREGIR TODOS LOS CURSOS: CAMBIAR DE profile.id A user_id CORRECTO
UPDATE public.courses
SET instructor_id = '7ee127dd-cf89-4593-88c8-252f46cb1118'  -- user_id del admin Carlos
WHERE instructor_id = 'b46ad97c-45d8-4545-be0e-520329359f36'  -- id del perfil (incorrecto)
RETURNING id, title, instructor_id, 'CORREGIDO A USER_ID' as status;

-- 5. CORREGIR CUALQUIER OTRO instructor_id INVÁLIDO
UPDATE public.courses
SET instructor_id = '7ee127dd-cf89-4593-88c8-252f46cb1118'  -- user_id del admin Carlos
WHERE instructor_id NOT IN (
    SELECT user_id FROM public.profiles
)
RETURNING id, title, instructor_id, 'CORREGIDO INSTRUCTOR INVÁLIDO' as status;

-- 6. VERIFICAR TODOS LOS CURSOS CORREGIDOS
SELECT 
    c.id,
    c.title,
    c.instructor_id,
    p.full_name as instructor_name,
    p.role as instructor_role,
    u.email as instructor_email,
    'CURSO VÁLIDO' as status
FROM public.courses c
INNER JOIN public.profiles p ON c.instructor_id = p.user_id
INNER JOIN auth.users u ON p.user_id = u.id
ORDER BY c.updated_at DESC;

-- 7. VERIFICAR QUE NO HAY CURSOS HUÉRFANOS
SELECT 
    COUNT(*) as cursos_sin_instructor_valido,
    'DEBERÍA SER 0' as esperado
FROM public.courses c
LEFT JOIN public.profiles p ON c.instructor_id = p.user_id
WHERE p.user_id IS NULL;

-- 8. MOSTRAR LA RELACIÓN CORRECTA
SELECT 
    'RELACIÓN CORRECTA:' as info,
    'courses.instructor_id DEBE SER profiles.user_id' as regla,
    'NO profiles.id' as aclaración;

-- 9. PROBAR ACTUALIZACIÓN
UPDATE public.courses 
SET title = title
WHERE id = (SELECT id FROM public.courses LIMIT 1)
RETURNING id, title, instructor_id, updated_at;

-- 10. CONFIRMACIÓN FINAL
SELECT 'INSTRUCTOR_ID CORREGIDO - USANDO USER_ID EN LUGAR DE PROFILE_ID' as status;
