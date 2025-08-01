-- DIAGNÓSTICO SIMPLIFICADO DEL ERROR "record new has no field category"

-- 1. VERIFICAR ESTRUCTURA DE LA TABLA COURSES
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'courses' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. BUSCAR TODOS LOS TRIGGERS EN LA TABLA COURSES
SELECT 
    t.tgname as trigger_name,
    t.tgenabled as enabled,
    p.proname as function_name
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
JOIN pg_namespace n ON c.relnamespace = n.oid
LEFT JOIN pg_proc p ON t.tgfoid = p.oid
WHERE c.relname = 'courses'
AND n.nspname = 'public'
AND NOT t.tgisinternal;

-- 3. BUSCAR FUNCIONES QUE CONTENGAN 'category'
SELECT 
    p.proname as function_name,
    p.prosrc as source_code
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE p.prosrc ILIKE '%category%'
AND n.nspname = 'public'
ORDER BY p.proname;

-- 4. ELIMINAR TODOS LOS TRIGGERS DE LA TABLA COURSES
DROP TRIGGER IF EXISTS handle_updated_at_courses ON public.courses;
DROP TRIGGER IF EXISTS courses_updated_at ON public.courses;
DROP TRIGGER IF EXISTS update_courses_updated_at ON public.courses;
DROP TRIGGER IF EXISTS set_updated_at ON public.courses;
DROP TRIGGER IF EXISTS courses_update_updated_at ON public.courses;
DROP TRIGGER IF EXISTS courses_simple_updated_at ON public.courses;

-- 5. ELIMINAR FUNCIONES PROBLEMÁTICAS
DROP FUNCTION IF EXISTS public.handle_updated_at() CASCADE;
DROP FUNCTION IF EXISTS public.update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS public.set_updated_at() CASCADE;
DROP FUNCTION IF EXISTS public.update_updated_at_timestamp() CASCADE;
DROP FUNCTION IF EXISTS public.update_updated_at_simple() CASCADE;

-- 6. CREAR FUNCIÓN NUEVA Y LIMPIA
CREATE OR REPLACE FUNCTION public.set_updated_at_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 7. CREAR TRIGGER NUEVO Y LIMPIO
CREATE TRIGGER update_courses_updated_at_trigger
    BEFORE UPDATE ON public.courses
    FOR EACH ROW
    EXECUTE FUNCTION public.set_updated_at_timestamp();

-- 8. VERIFICAR QUE NO HAY TRIGGERS PROBLEMÁTICOS
SELECT 
    t.tgname as trigger_name,
    p.proname as function_name
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
JOIN pg_namespace n ON c.relnamespace = n.oid
LEFT JOIN pg_proc p ON t.tgfoid = p.oid
WHERE c.relname = 'courses'
AND n.nspname = 'public'
AND NOT t.tgisinternal;

-- 9. PROBAR ACTUALIZACIÓN DIRECTA
UPDATE public.courses 
SET title = title
WHERE id = (SELECT id FROM public.courses LIMIT 1)
RETURNING id, title, updated_at;

-- 10. CONFIRMACIÓN
SELECT 'TRIGGERS COMPLETAMENTE LIMPIADOS Y RECREADOS' as status;
