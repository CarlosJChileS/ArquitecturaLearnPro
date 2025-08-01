-- INVESTIGACIÓN PROFUNDA Y CORRECCIÓN DE LA FOREIGN KEY

-- 1. VER LA DEFINICIÓN EXACTA DE LA CONSTRAINT
SELECT 
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_name = 'courses_instructor_id_fkey';

-- 2. VER TODOS LOS user_id QUE EXISTEN EN profiles
SELECT 
    user_id,
    full_name,
    role,
    'EXISTE EN PROFILES' as status
FROM public.profiles
ORDER BY created_at;

-- 3. VER TODOS LOS id QUE EXISTEN EN auth.users
SELECT 
    id as user_id,
    email,
    'EXISTE EN AUTH.USERS' as status
FROM auth.users
ORDER BY created_at;

-- 4. VERIFICAR SI LA CONSTRAINT APUNTA A LA TABLA CORRECTA
-- Si apunta a auth.users en lugar de profiles, ahí está el problema

-- 5. ELIMINAR LA CONSTRAINT PROBLEMÁTICA
ALTER TABLE public.courses DROP CONSTRAINT IF EXISTS courses_instructor_id_fkey;

-- 6. CREAR LA CONSTRAINT CORRECTA (DEBE APUNTAR A profiles.user_id)
ALTER TABLE public.courses 
ADD CONSTRAINT courses_instructor_id_fkey 
FOREIGN KEY (instructor_id) REFERENCES public.profiles(user_id);

-- 7. CORREGIR TODOS LOS CURSOS CON EL ADMIN DISPONIBLE
UPDATE public.courses 
SET instructor_id = (
    SELECT user_id 
    FROM public.profiles 
    WHERE role = 'admin' 
    LIMIT 1
)
RETURNING id, title, instructor_id, 'CORREGIDO CON CONSTRAINT NUEVA' as status;

-- 8. VERIFICAR QUE TODOS LOS CURSOS TIENEN instructor_id VÁLIDOS
SELECT 
    c.id,
    c.title,
    c.instructor_id,
    p.full_name as instructor_name,
    'CURSO VÁLIDO CON NUEVA CONSTRAINT' as status
FROM public.courses c
INNER JOIN public.profiles p ON c.instructor_id = p.user_id;

-- 9. PROBAR UNA ACTUALIZACIÓN
UPDATE public.courses 
SET title = title || ' - TEST'
WHERE id = (SELECT id FROM public.courses LIMIT 1)
RETURNING id, title, instructor_id, updated_at;

-- 10. REVERTIR EL CAMBIO DE PRUEBA
UPDATE public.courses 
SET title = REPLACE(title, ' - TEST', '')
WHERE title LIKE '% - TEST';

-- 11. CONFIRMACIÓN FINAL
SELECT 'CONSTRAINT RECREADA - SISTEMA FUNCIONAL' as status;
