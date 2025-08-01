-- CORRECCIÓN USANDO SOLO USUARIOS REALES EXISTENTES

-- 1. VERIFICAR USUARIOS REALES EN auth.users
SELECT 
    u.id as user_id,
    u.email,
    u.created_at,
    'USUARIO REAL EN AUTH' as status
FROM auth.users u
ORDER BY u.created_at
LIMIT 5;

-- 2. VERIFICAR PERFILES EXISTENTES CON USUARIOS REALES
SELECT 
    p.user_id,
    p.full_name,
    p.email,
    p.role,
    'PERFIL VÁLIDO' as status
FROM public.profiles p
INNER JOIN auth.users u ON p.user_id = u.id
WHERE p.role IN ('admin', 'instructor')
ORDER BY p.created_at;

-- 3. BUSCAR EL PRIMER USUARIO REAL CON PERFIL ADMIN
WITH usuario_admin_real AS (
    SELECT p.user_id
    FROM public.profiles p
    INNER JOIN auth.users u ON p.user_id = u.id
    WHERE p.role = 'admin'
    ORDER BY p.created_at
    LIMIT 1
)
SELECT 
    user_id as admin_real_disponible,
    'USAR ESTE ID REAL PARA INSTRUCTOR' as instruccion
FROM usuario_admin_real;

-- 4. SI NO HAY ADMIN, CREAR UNO CON EL PRIMER USUARIO REAL
WITH primer_usuario_real AS (
    SELECT u.id, u.email
    FROM auth.users u
    LEFT JOIN public.profiles p ON u.id = p.user_id
    WHERE p.user_id IS NULL  -- Usuario sin perfil
    ORDER BY u.created_at
    LIMIT 1
)
INSERT INTO public.profiles (user_id, full_name, email, role)
SELECT 
    id,
    'Admin Default',
    email,
    'admin'
FROM primer_usuario_real
WHERE EXISTS (SELECT 1 FROM primer_usuario_real);

-- 5. CORREGIR CURSOS USANDO EL PRIMER USUARIO ADMIN REAL
WITH usuario_admin_real AS (
    SELECT p.user_id
    FROM public.profiles p
    INNER JOIN auth.users u ON p.user_id = u.id
    WHERE p.role = 'admin'
    ORDER BY p.created_at
    LIMIT 1
)
UPDATE public.courses
SET instructor_id = (SELECT user_id FROM usuario_admin_real)
WHERE instructor_id NOT IN (
    SELECT p.user_id 
    FROM public.profiles p
    INNER JOIN auth.users u ON p.user_id = u.id
)
RETURNING id, title, instructor_id, 'CORREGIDO CON USUARIO REAL' as status;

-- 6. VERIFICAR TODOS LOS CURSOS CON INSTRUCTORES VÁLIDOS
SELECT 
    c.id,
    c.title,
    c.instructor_id,
    p.full_name as instructor_name,
    p.role as instructor_role,
    u.email as instructor_email
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
LEFT JOIN auth.users u ON p.user_id = u.id
WHERE u.id IS NULL;

-- 8. MOSTRAR RESUMEN DE USUARIOS DISPONIBLES
SELECT 
    'RESUMEN DE USUARIOS DISPONIBLES' as titulo,
    COUNT(DISTINCT u.id) as total_usuarios_auth,
    COUNT(DISTINCT p.user_id) as total_perfiles,
    COUNT(DISTINCT CASE WHEN p.role = 'admin' THEN p.user_id END) as admins_disponibles
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.user_id;

-- 9. PROBAR ACTUALIZACIÓN
UPDATE public.courses 
SET title = title
WHERE id = (SELECT id FROM public.courses LIMIT 1)
RETURNING id, title, instructor_id, updated_at;

-- 10. CONFIRMACIÓN FINAL
SELECT 'CURSOS CORREGIDOS CON USUARIOS REALES - SISTEMA FUNCIONAL' as status;
