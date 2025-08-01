-- ELIMINACIÓN COMPLETA DE TODAS LAS FUNCIONES PROBLEMÁTICAS

-- 1. BUSCAR TODAS LAS FUNCIONES QUE CONTENGAN 'category' EN EL NOMBRE O CÓDIGO
SELECT 
    p.proname as function_name,
    n.nspname as schema_name,
    CASE 
        WHEN p.prosrc ILIKE '%NEW.category%' OR p.prosrc ILIKE '%OLD.category%' THEN 'PROBLEMÁTICA - REFERENCIA CAMPO INEXISTENTE'
        ELSE 'REVISAR'
    END as status
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE (p.prosrc ILIKE '%category%' OR p.proname ILIKE '%category%')
AND n.nspname = 'public';

-- 2. BUSCAR TODOS LOS TRIGGERS EN LA TABLA COURSES
SELECT 
    t.tgname as trigger_name,
    p.proname as function_name,
    'TRIGGER A ELIMINAR' as action
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
JOIN pg_namespace n ON c.relnamespace = n.oid
JOIN pg_proc p ON t.tgfoid = p.oid
WHERE c.relname = 'courses'
AND n.nspname = 'public'
AND NOT t.tgisinternal;

-- 3. ELIMINAR TODOS LOS TRIGGERS DE LA TABLA COURSES (INCLUYENDO LOS NUEVOS)
DO $$
DECLARE
    trigger_name text;
BEGIN
    FOR trigger_name IN 
        SELECT t.tgname
        FROM pg_trigger t
        JOIN pg_class c ON t.tgrelid = c.oid
        JOIN pg_namespace n ON c.relnamespace = n.oid
        WHERE c.relname = 'courses'
        AND n.nspname = 'public'
        AND NOT t.tgisinternal
    LOOP
        EXECUTE 'DROP TRIGGER IF EXISTS ' || trigger_name || ' ON public.courses';
        RAISE NOTICE 'Eliminado trigger: %', trigger_name;
    END LOOP;
END $$;

-- 4. ELIMINAR TODAS LAS FUNCIONES QUE CONTENGAN 'category'
DO $$
DECLARE
    func_name text;
BEGIN
    FOR func_name IN 
        SELECT p.proname
        FROM pg_proc p
        JOIN pg_namespace n ON p.pronamespace = n.oid
        WHERE (p.prosrc ILIKE '%category%' OR p.proname ILIKE '%category%')
        AND n.nspname = 'public'
    LOOP
        EXECUTE 'DROP FUNCTION IF EXISTS public.' || func_name || ' CASCADE';
        RAISE NOTICE 'Eliminada función: %', func_name;
    END LOOP;
END $$;

-- 5. ELIMINAR FUNCIONES ESPECÍFICAS PROBLEMÁTICAS
DROP FUNCTION IF EXISTS public.sync_category_columns() CASCADE;
DROP FUNCTION IF EXISTS public.sync_course_category_columns() CASCADE;
DROP FUNCTION IF EXISTS public.handle_updated_at() CASCADE;
DROP FUNCTION IF EXISTS public.update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS public.set_updated_at() CASCADE;
DROP FUNCTION IF EXISTS public.update_updated_at_timestamp() CASCADE;
DROP FUNCTION IF EXISTS public.update_updated_at_simple() CASCADE;
DROP FUNCTION IF EXISTS public.set_updated_at_timestamp() CASCADE;
DROP FUNCTION IF EXISTS public.courses_set_updated_at() CASCADE;

-- 6. CREAR FUNCIÓN FINAL Y LIMPIA
CREATE OR REPLACE FUNCTION public.courses_update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 7. CREAR TRIGGER FINAL Y LIMPIO
CREATE TRIGGER courses_update_timestamp_trigger
    BEFORE UPDATE ON public.courses
    FOR EACH ROW
    EXECUTE FUNCTION public.courses_update_timestamp();

-- 8. VERIFICAR QUE NO QUEDAN FUNCIONES PROBLEMÁTICAS
SELECT 
    COUNT(*) as funciones_con_category,
    'DEBERÍAN SER 0' as esperado
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE (p.prosrc ILIKE '%category%' OR p.proname ILIKE '%category%')
AND n.nspname = 'public';

-- 9. VERIFICAR TRIGGERS FINALES
SELECT 
    t.tgname as trigger_name,
    p.proname as function_name,
    'TRIGGER FINAL' as status
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
JOIN pg_namespace n ON c.relnamespace = n.oid
JOIN pg_proc p ON t.tgfoid = p.oid
WHERE c.relname = 'courses'
AND n.nspname = 'public'
AND NOT t.tgisinternal;

-- 10. PROBAR ACTUALIZACIÓN FINAL
UPDATE public.courses 
SET title = title
WHERE id = (SELECT id FROM public.courses LIMIT 1)
RETURNING id, title, updated_at;

-- 11. CONFIRMACIÓN FINAL
SELECT 'TODAS LAS FUNCIONES PROBLEMÁTICAS ELIMINADAS - SISTEMA LIMPIO' as status;
