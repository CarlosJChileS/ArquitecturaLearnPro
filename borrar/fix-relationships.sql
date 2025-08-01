/*
=============================================================
SCRIPT DEFINITIVO PARA ELIMINAR RELACIONES MÚLTIPLES
=============================================================

Este script elimina COMPLETAMENTE todas las relaciones entre courses y categories
y crea solo UNA relación limpia.

EJECUTAR EN SUPABASE SQL EDITOR PASO A PASO
=============================================================
*/

-- PASO 1: Verificar el problema actual
SELECT 
    'RELACIONES ACTUALES' as status,
    tc.constraint_name,
    kcu.column_name
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND tc.table_name = 'courses'
  AND ccu.table_name = 'categories';

-- PASO 2: ELIMINAR TODAS LAS RESTRICCIONES EXISTENTES (SIN EXCEPCIONES)
DO $$
DECLARE
    constraint_rec RECORD;
BEGIN
    -- Buscar TODAS las FK de courses hacia categories
    FOR constraint_rec IN 
        SELECT tc.constraint_name
        FROM information_schema.table_constraints AS tc 
        JOIN information_schema.key_column_usage AS kcu ON tc.constraint_name = kcu.constraint_name
        JOIN information_schema.constraint_column_usage AS ccu ON ccu.constraint_name = tc.constraint_name
        WHERE tc.constraint_type = 'FOREIGN KEY' 
          AND tc.table_name = 'courses'
          AND ccu.table_name = 'categories'
    LOOP
        EXECUTE 'ALTER TABLE public.courses DROP CONSTRAINT IF EXISTS ' || constraint_rec.constraint_name || ' CASCADE';
        RAISE NOTICE 'ELIMINADA: %', constraint_rec.constraint_name;
    END LOOP;
    
    -- También eliminar por nombre conocido
    EXECUTE 'ALTER TABLE public.courses DROP CONSTRAINT IF EXISTS courses_category_fkey CASCADE';
    EXECUTE 'ALTER TABLE public.courses DROP CONSTRAINT IF EXISTS courses_category_id_fkey CASCADE';
    EXECUTE 'ALTER TABLE public.courses DROP CONSTRAINT IF EXISTS fk_courses_category CASCADE';
    EXECUTE 'ALTER TABLE public.courses DROP CONSTRAINT IF EXISTS fk_courses_categories CASCADE';
    EXECUTE 'ALTER TABLE public.courses DROP CONSTRAINT IF EXISTS courses_category_id_fkey1 CASCADE';
    EXECUTE 'ALTER TABLE public.courses DROP CONSTRAINT IF EXISTS courses_category_id_fkey2 CASCADE';
    
    RAISE NOTICE 'TODAS LAS RESTRICCIONES ELIMINADAS';
END $$;

-- PASO 3: ELIMINAR COLUMNA CATEGORY PROBLEMÁTICA
ALTER TABLE public.courses DROP COLUMN IF EXISTS category CASCADE;

-- PASO 4: ASEGURAR QUE SOLO EXISTE category_id
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS category_id UUID;

-- PASO 5: VERIFICAR QUE NO HAY RESTRICCIONES
SELECT 
    'VERIFICACIÓN POST-ELIMINACIÓN' as status,
    COUNT(*) as total_fk_restantes
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND tc.table_name = 'courses'
  AND ccu.table_name = 'categories';

-- PASO 6: CREAR UNA SOLA RESTRICCIÓN LIMPIA
ALTER TABLE public.courses 
ADD CONSTRAINT courses_category_single_fk 
FOREIGN KEY (category_id) REFERENCES public.categories(id) 
ON DELETE SET NULL ON UPDATE CASCADE;

-- PASO 7: VERIFICAR QUE SOLO HAY UNA RELACIÓN
SELECT 
    'VERIFICACIÓN FINAL' as status,
    COUNT(*) as total_fk_final,
    string_agg(tc.constraint_name, ', ') as constraint_names
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND tc.table_name = 'courses'
  AND ccu.table_name = 'categories';

-- PASO 8: VERIFICAR QUE LAS CONSULTAS FUNCIONAN
SELECT 
    'PRUEBA DE CONSULTA' as status,
    c.id,
    c.title,
    c.category_id,
    cat.name as category_name
FROM public.courses c
LEFT JOIN public.categories cat ON c.category_id = cat.id
LIMIT 3;

-- PASO 9: ACTUALIZAR CURSOS SIN CATEGORÍA
UPDATE public.courses 
SET category_id = (SELECT id FROM public.categories LIMIT 1)
WHERE category_id IS NULL;

SELECT 'PROBLEMA DE RELACIONES MÚLTIPLES SOLUCIONADO DEFINITIVAMENTE' as resultado;
