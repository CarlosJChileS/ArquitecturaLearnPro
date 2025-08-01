-- CORRECCIÓN ESPECÍFICA PARA instructor_id INEXISTENTE

-- 1. VERIFICAR EL instructor_id PROBLEMÁTICO
SELECT 
    'b46ad97c-45d8-4545-be0e-520329359f36' as instructor_id_problemático,
    EXISTS(
        SELECT 1 FROM public.profiles 
        WHERE user_id = 'b46ad97c-45d8-4545-be0e-520329359f36'
    ) as existe_en_profiles;

-- 2. BUSCAR TODOS LOS USUARIOS ADMIN DISPONIBLES
SELECT 
    p.user_id,
    p.full_name,
    p.email,
    p.role,
    'ADMIN DISPONIBLE COMO INSTRUCTOR' as status
FROM public.profiles p
WHERE p.role = 'admin'
ORDER BY p.created_at;

-- 3. OBTENER EL PRIMER ADMIN DISPONIBLE
WITH primer_admin AS (
    SELECT user_id
    FROM public.profiles
    WHERE role = 'admin'
    ORDER BY created_at
    LIMIT 1
)
SELECT 
    user_id as admin_id_para_usar,
    'ESTE ID SERÁ EL INSTRUCTOR POR DEFECTO' as nota
FROM primer_admin;

-- 4. CORREGIR TODOS LOS CURSOS QUE TENGAN instructor_id INVÁLIDOS
WITH primer_admin AS (
    SELECT user_id
    FROM public.profiles
    WHERE role = 'admin'
    ORDER BY created_at
    LIMIT 1
)
UPDATE public.courses
SET instructor_id = (SELECT user_id FROM primer_admin)
WHERE instructor_id NOT IN (
    SELECT user_id FROM public.profiles
)
RETURNING id, title, instructor_id, 'CORREGIDO' as status;

-- 5. CREAR UNA ENTRADA ESPECÍFICA PARA EL instructor_id PROBLEMÁTICO SI ES NECESARIO
-- (Solo si quieres mantener ese ID específico)
INSERT INTO public.profiles (user_id, full_name, email, role)
SELECT 
    'b46ad97c-45d8-4545-be0e-520329359f36'::uuid,
    'Admin Instructor',
    'admin.instructor@learnpro.com',
    'admin'
WHERE NOT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = 'b46ad97c-45d8-4545-be0e-520329359f36'
);

-- 6. VERIFICAR QUE TODOS LOS CURSOS TIENEN instructor_id VÁLIDOS
SELECT 
    c.id,
    c.title,
    c.instructor_id,
    p.full_name as instructor_name,
    p.role as instructor_role
FROM public.courses c
LEFT JOIN public.profiles p ON c.instructor_id = p.user_id
ORDER BY c.updated_at DESC;

-- 7. VERIFICAR QUE NO HAY CURSOS HUÉRFANOS
SELECT 
    COUNT(*) as cursos_sin_instructor_valido,
    'DEBERÍA SER 0' as esperado
FROM public.courses c
LEFT JOIN public.profiles p ON c.instructor_id = p.user_id
WHERE p.user_id IS NULL;

-- 8. PROBAR UNA ACTUALIZACIÓN DIRECTA
UPDATE public.courses 
SET title = title
WHERE id = (SELECT id FROM public.courses LIMIT 1)
RETURNING id, title, instructor_id, updated_at;

-- 9. CONFIRMACIÓN FINAL
SELECT 'PROBLEMA DE FOREIGN KEY RESUELTO - ADMIN COMO INSTRUCTOR CONFIGURADO' as status;
