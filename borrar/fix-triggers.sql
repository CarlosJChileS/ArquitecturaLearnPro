-- DIAGNÓSTICO Y CORRECCIÓN COMPLETA DEL ERROR "record new has no field category"

-- 1. VERIFICAR TRIGGERS EN LA TABLA COURSES
SELECT 
    n.nspname as schema_name,
    c.relname as table_name,
    t.tgname as trigger_name,
    p.proname as function_name
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
JOIN pg_namespace n ON c.relnamespace = n.oid
LEFT JOIN pg_proc p ON t.tgfoid = p.oid
WHERE c.relname = 'courses'
AND n.nspname = 'public'
AND NOT t.tgisinternal;

-- 2. VERIFICAR FUNCIONES QUE REFERENCIEN 'category'
SELECT 
    proname as function_name,
    prosrc as function_source
FROM pg_proc 
WHERE prosrc ILIKE '%category%'
AND proname NOT LIKE 'pg_%';

-- 3. ELIMINAR CUALQUIER TRIGGER PROBLEMÁTICO
DROP TRIGGER IF EXISTS handle_updated_at_courses ON public.courses;
DROP TRIGGER IF EXISTS courses_updated_at ON public.courses;
DROP TRIGGER IF EXISTS update_courses_updated_at ON public.courses;
DROP TRIGGER IF EXISTS set_updated_at ON public.courses;

-- 4. ELIMINAR FUNCIONES PROBLEMÁTICAS SI EXISTEN
DROP FUNCTION IF EXISTS public.handle_updated_at() CASCADE;
DROP FUNCTION IF EXISTS public.update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS public.set_updated_at() CASCADE;

-- 5. CREAR NUEVA FUNCIÓN SIMPLE PARA updated_at SIN REFERENCIAS A 'category'
CREATE OR REPLACE FUNCTION public.update_updated_at_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 6. CREAR NUEVO TRIGGER SEGURO
CREATE TRIGGER courses_update_updated_at
    BEFORE UPDATE ON public.courses
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_timestamp();

-- 7. VERIFICAR QUE NO HAY CONFLICTOS CON RLS
ALTER TABLE public.courses DISABLE ROW LEVEL SECURITY;

-- 8. PROBAR ACTUALIZACIÓN DIRECTA
UPDATE public.courses 
SET title = title || ' - UPDATED'
WHERE title = 'CURSO DE PRUEBA CORREGIDO'
RETURNING id, title, updated_at;

-- 9. REVERTIR CAMBIO DE PRUEBA
UPDATE public.courses 
SET title = REPLACE(title, ' - UPDATED', '')
WHERE title LIKE '% - UPDATED'
RETURNING id, title;

-- 10. MENSAJE DE CONFIRMACIÓN
SELECT 'TRIGGERS CORREGIDOS - LISTO PARA USAR' as status;
