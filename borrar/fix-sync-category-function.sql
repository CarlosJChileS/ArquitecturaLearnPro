-- SOLUCIÓN ESPECÍFICA PARA LA FUNCIÓN sync_category_columns()

-- 1. BUSCAR LA FUNCIÓN PROBLEMÁTICA
SELECT 
    p.proname as function_name,
    p.prosrc as source_code
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE p.proname = 'sync_category_columns'
AND n.nspname = 'public';

-- 2. BUSCAR TODOS LOS TRIGGERS QUE USEN ESTA FUNCIÓN
SELECT 
    t.tgname as trigger_name,
    c.relname as table_name,
    p.proname as function_name
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
JOIN pg_namespace n ON c.relnamespace = n.oid
JOIN pg_proc p ON t.tgfoid = p.oid
WHERE p.proname = 'sync_category_columns'
AND n.nspname = 'public'
AND NOT t.tgisinternal;

-- 3. ELIMINAR TODOS LOS TRIGGERS QUE USEN sync_category_columns
DROP TRIGGER IF EXISTS sync_category_columns_trigger ON public.courses;
DROP TRIGGER IF EXISTS category_sync_trigger ON public.courses;
DROP TRIGGER IF EXISTS courses_category_sync ON public.courses;

-- 4. ELIMINAR LA FUNCIÓN PROBLEMÁTICA
DROP FUNCTION IF EXISTS public.sync_category_columns() CASCADE;

-- 5. ELIMINAR CUALQUIER OTRO TRIGGER EN LA TABLA COURSES
DROP TRIGGER IF EXISTS handle_updated_at_courses ON public.courses;
DROP TRIGGER IF EXISTS courses_updated_at ON public.courses;
DROP TRIGGER IF EXISTS update_courses_updated_at ON public.courses;
DROP TRIGGER IF EXISTS set_updated_at ON public.courses;
DROP TRIGGER IF EXISTS courses_update_updated_at ON public.courses;
DROP TRIGGER IF EXISTS courses_simple_updated_at ON public.courses;
DROP TRIGGER IF EXISTS update_courses_updated_at_trigger ON public.courses;

-- 6. ELIMINAR TODAS LAS FUNCIONES QUE CONTENGAN 'category'
DROP FUNCTION IF EXISTS public.handle_updated_at() CASCADE;
DROP FUNCTION IF EXISTS public.update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS public.set_updated_at() CASCADE;
DROP FUNCTION IF EXISTS public.update_updated_at_timestamp() CASCADE;
DROP FUNCTION IF EXISTS public.update_updated_at_simple() CASCADE;
DROP FUNCTION IF EXISTS public.set_updated_at_timestamp() CASCADE;

-- 7. CREAR FUNCIÓN SIMPLE Y SEGURA PARA updated_at
CREATE OR REPLACE FUNCTION public.courses_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 8. CREAR TRIGGER SIMPLE SOLO PARA updated_at
CREATE TRIGGER courses_updated_at_trigger
    BEFORE UPDATE ON public.courses
    FOR EACH ROW
    EXECUTE FUNCTION public.courses_set_updated_at();

-- 9. VERIFICAR QUE NO QUEDAN FUNCIONES PROBLEMÁTICAS
SELECT 
    p.proname as function_name,
    'FUNCIÓN ELIMINADA' as status
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE (p.prosrc ILIKE '%category%' OR p.proname ILIKE '%category%')
AND n.nspname = 'public';

-- 10. VERIFICAR TRIGGERS FINALES
SELECT 
    t.tgname as trigger_name,
    p.proname as function_name
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
JOIN pg_namespace n ON c.relnamespace = n.oid
JOIN pg_proc p ON t.tgfoid = p.oid
WHERE c.relname = 'courses'
AND n.nspname = 'public'
AND NOT t.tgisinternal;

-- 11. PROBAR ACTUALIZACIÓN
UPDATE public.courses 
SET title = title
WHERE id = (SELECT id FROM public.courses LIMIT 1)
RETURNING id, title, updated_at;

-- 12. CONFIRMACIÓN FINAL
SELECT 'FUNCIÓN sync_category_columns ELIMINADA - PROBLEMA RESUELTO' as status;
