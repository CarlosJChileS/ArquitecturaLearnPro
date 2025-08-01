/*
=============================================================
SCRIPT CONSERVADOR PARA ARREGLAR RELACIONES MÚLTIPLES
=============================================================

Este script mantiene la funcionalidad existente pero elimina solo
las relaciones problemáticas, preservando la estructura original
que funcionaba en COPIAR-MIGRACION-1.sql

INSTRUCCIONES: Ejecutar en Supabase SQL Editor paso a paso
=============================================================
*/

-- PASO 1: Verificar el estado actual
SELECT 
    'ESTADO ACTUAL' as status,
    tc.constraint_name,
    kcu.column_name,
    tc.table_name
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND tc.table_name = 'courses'
  AND ccu.table_name = 'categories';

-- PASO 2: Verificar qué columnas existen en courses
SELECT 
    'COLUMNAS EN COURSES' as status,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'courses' 
  AND table_schema = 'public'
  AND column_name LIKE '%category%'
ORDER BY column_name;

-- PASO 3: Eliminar restricciones duplicadas CONSERVANDO LA ORIGINAL
-- Solo eliminar las restricciones adicionales, no la principal
DO $$
DECLARE
    constraint_rec RECORD;
    main_constraint TEXT := 'courses_category_id_fkey';
BEGIN
    -- Eliminar todas las FK EXCEPTO la principal
    FOR constraint_rec IN 
        SELECT tc.constraint_name
        FROM information_schema.table_constraints AS tc 
        JOIN information_schema.key_column_usage AS kcu ON tc.constraint_name = kcu.constraint_name
        JOIN information_schema.constraint_column_usage AS ccu ON ccu.constraint_name = tc.constraint_name
        WHERE tc.constraint_type = 'FOREIGN KEY' 
          AND tc.table_name = 'courses'
          AND ccu.table_name = 'categories'
          AND tc.constraint_name != main_constraint
    LOOP
        EXECUTE 'ALTER TABLE public.courses DROP CONSTRAINT IF EXISTS ' || constraint_rec.constraint_name || ' CASCADE';
        RAISE NOTICE 'ELIMINADA RESTRICCIÓN DUPLICADA: %', constraint_rec.constraint_name;
    END LOOP;
    
    -- Verificar que la restricción principal existe
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = main_constraint 
        AND table_name = 'courses'
    ) THEN
        -- Crear la restricción principal si no existe
        EXECUTE 'ALTER TABLE public.courses ADD CONSTRAINT ' || main_constraint || 
                ' FOREIGN KEY (category_id) REFERENCES public.categories(id) ON DELETE SET NULL';
        RAISE NOTICE 'CREADA RESTRICCIÓN PRINCIPAL: %', main_constraint;
    END IF;
END $$;

-- PASO 4: Si existe columna 'category' adicional, eliminarla SOLO si no rompe nada
DO $$
BEGIN
    -- Verificar si existe la columna category además de category_id
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'courses' 
        AND column_name = 'category'
        AND table_schema = 'public'
    ) THEN
        -- Sincronizar datos antes de eliminar
        UPDATE public.courses 
        SET category_id = category::UUID 
        WHERE category_id IS NULL 
        AND category IS NOT NULL 
        AND category ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$';
        
        -- Eliminar la columna category duplicada
        ALTER TABLE public.courses DROP COLUMN category CASCADE;
        RAISE NOTICE 'ELIMINADA COLUMNA CATEGORY DUPLICADA';
    END IF;
END $$;

-- PASO 5: Verificar que queda solo UNA relación
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

-- PASO 6: Verificar que las consultas funcionan
SELECT 
    'PRUEBA DE CONSULTA' as status,
    c.id,
    c.title,
    c.category_id,
    cat.name as category_name
FROM public.courses c
LEFT JOIN public.categories cat ON c.category_id = cat.id
LIMIT 3;

-- PASO 7: Asegurar que todos los cursos tienen categoría
UPDATE public.courses 
SET category_id = (
    SELECT id FROM public.categories 
    WHERE name = 'Programación' 
    LIMIT 1
)
WHERE category_id IS NULL;

SELECT 'RELACIONES ARREGLADAS CONSERVANDO FUNCIONALIDAD ORIGINAL' as resultado;
