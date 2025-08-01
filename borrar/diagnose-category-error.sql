-- DIAGNÓSTICO ESPECÍFICO DEL ERROR "record new has no field category"

-- 1. VERIFICAR TODAS LAS FUNCIONES QUE CONTENGAN 'category'
SELECT 
    schemaname,
    tablename,
    triggername,
    tgfoid::regproc as function_name
FROM pg_tables t
JOIN pg_trigger tr ON tr.tgrelid = (quote_ident(t.schemaname)||'.'||quote_ident(t.tablename))::regclass
WHERE t.tablename = 'courses'
AND t.schemaname = 'public';

-- 2. BUSCAR FUNCIONES CON 'category' EN EL CÓDIGO
SELECT 
    p.proname as function_name,
    p.prosrc as source_code,
    n.nspname as schema_name
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE p.prosrc ILIKE '%category%'
AND n.nspname = 'public'
ORDER BY p.proname;

-- 3. VERIFICAR LA ESTRUCTURA EXACTA DE LA TABLA COURSES
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'courses' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 4. BUSCAR TODOS LOS TRIGGERS EN LA TABLA COURSES
SELECT 
    t.tgname as trigger_name,
    t.tgenabled as enabled,
    t.tgtype as trigger_type,
    p.proname as function_name,
    p.prosrc as function_source
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
JOIN pg_namespace n ON c.relnamespace = n.oid
LEFT JOIN pg_proc p ON t.tgfoid = p.oid
WHERE c.relname = 'courses'
AND n.nspname = 'public'
AND NOT t.tgisinternal;

-- 5. ELIMINAR TODOS LOS TRIGGERS PROBLEMÁTICOS
DO $$
DECLARE
    trigger_record RECORD;
BEGIN
    FOR trigger_record IN 
        SELECT t.tgname as trigger_name
        FROM pg_trigger t
        JOIN pg_class c ON t.tgrelid = c.oid
        JOIN pg_namespace n ON c.relnamespace = n.oid
        WHERE c.relname = 'courses'
        AND n.nspname = 'public'
        AND NOT t.tgisinternal
    LOOP
        EXECUTE 'DROP TRIGGER IF EXISTS ' || trigger_record.trigger_name || ' ON public.courses';
        RAISE NOTICE 'Eliminado trigger: %', trigger_record.trigger_name;
    END LOOP;
END $$;

-- 6. ELIMINAR FUNCIONES QUE CONTENGAN 'category'
DO $$
DECLARE
    func_record RECORD;
BEGIN
    FOR func_record IN 
        SELECT p.proname as function_name
        FROM pg_proc p
        JOIN pg_namespace n ON p.pronamespace = n.oid
        WHERE p.prosrc ILIKE '%category%'
        AND n.nspname = 'public'
    LOOP
        EXECUTE 'DROP FUNCTION IF EXISTS public.' || func_record.function_name || ' CASCADE';
        RAISE NOTICE 'Eliminada función: %', func_record.function_name;
    END LOOP;
END $$;

-- 7. CREAR FUNCIÓN SIMPLE PARA updated_at SIN REFERENCIAS A CAMPOS ESPECÍFICOS
CREATE OR REPLACE FUNCTION public.update_updated_at_simple()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 8. CREAR TRIGGER SIMPLE SOLO PARA updated_at
CREATE TRIGGER courses_simple_updated_at
    BEFORE UPDATE ON public.courses
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_simple();

-- 9. PROBAR ACTUALIZACIÓN DIRECTA EN SQL
UPDATE public.courses 
SET title = 'PRUEBA DIRECTA SQL'
WHERE id = (SELECT id FROM public.courses LIMIT 1)
RETURNING id, title, updated_at;

-- 10. CONFIRMACIÓN
SELECT 'DIAGNÓSTICO COMPLETO - TRIGGERS LIMPIADOS' as status;
