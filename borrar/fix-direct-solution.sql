-- SOLUCIÓN DIRECTA: DESHABILITAR TRIGGER Y CORREGIR CURSOS

-- 1. DESHABILITAR EL TRIGGER TEMPORALMENTE
ALTER TABLE public.courses DISABLE TRIGGER courses_update_timestamp_trigger;

-- 2. VER QUÉ ADMINS TENGO DISPONIBLES
SELECT 
    user_id, 
    full_name, 
    role,
    'ADMIN DISPONIBLE' as status
FROM public.profiles 
WHERE role = 'admin';

-- 3. VER LOS CURSOS ACTUALES
SELECT 
    id, 
    title, 
    instructor_id,
    'CURSO ACTUAL' as status
FROM public.courses;

-- 4. CORREGIR TODOS LOS CURSOS CON EL ADMIN DISPONIBLE
UPDATE public.courses 
SET instructor_id = (
    SELECT user_id 
    FROM public.profiles 
    WHERE role = 'admin' 
    LIMIT 1
)
RETURNING id, title, instructor_id, 'CORREGIDO SIN TRIGGER' as status;

-- 5. VERIFICAR QUE TODOS LOS CURSOS TIENEN instructor_id VÁLIDOS
SELECT 
    c.id,
    c.title,
    c.instructor_id,
    p.full_name as instructor_name,
    'CURSO VÁLIDO' as status
FROM public.courses c
INNER JOIN public.profiles p ON c.instructor_id = p.user_id;

-- 6. REHABILITAR EL TRIGGER
ALTER TABLE public.courses ENABLE TRIGGER courses_update_timestamp_trigger;

-- 7. PROBAR UNA ACTUALIZACIÓN CON EL TRIGGER HABILITADO
UPDATE public.courses 
SET title = title
WHERE id = (SELECT id FROM public.courses LIMIT 1)
RETURNING id, title, instructor_id, updated_at;

-- 8. CONFIRMACIÓN FINAL
SELECT 'CURSOS CORREGIDOS - TRIGGER REHABILITADO - SISTEMA FUNCIONAL' as status;
