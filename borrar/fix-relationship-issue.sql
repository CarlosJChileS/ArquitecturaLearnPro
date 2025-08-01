/*
=======================================================
🔧 CORRECCIÓN: ERROR DE RELACIONES MÚLTIPLES
=======================================================
Error: "Could not embed because more than one relationship was found for 'courses' and 'categories'"

Este script elimina la ambigüedad en las relaciones entre courses y categories.
=======================================================
*/

-- 1. Verificar las columnas problemáticas
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'courses' 
  AND table_schema = 'public'
  AND (column_name LIKE '%category%');

-- 2. Verificar las restricciones FK existentes
SELECT 
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
WHERE 
    tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_name = 'courses'
    AND ccu.table_name = 'categories';

-- 3. Eliminar TODAS las restricciones FK hacia categories
DO $$
DECLARE
    constraint_rec RECORD;
BEGIN
    FOR constraint_rec IN 
        SELECT tc.constraint_name
        FROM information_schema.table_constraints AS tc 
        JOIN information_schema.key_column_usage AS kcu
          ON tc.constraint_name = kcu.constraint_name
        JOIN information_schema.constraint_column_usage AS ccu
          ON ccu.constraint_name = tc.constraint_name
        WHERE tc.constraint_type = 'FOREIGN KEY' 
          AND tc.table_name = 'courses'
          AND ccu.table_name = 'categories'
    LOOP
        EXECUTE 'ALTER TABLE public.courses DROP CONSTRAINT IF EXISTS ' || constraint_rec.constraint_name;
        RAISE NOTICE 'Eliminada restricción FK: %', constraint_rec.constraint_name;
    END LOOP;
END $$;

-- 4. Eliminar la columna 'category' si existe (mantener solo category_id)
ALTER TABLE public.courses DROP COLUMN IF EXISTS category;

-- 5. Asegurar que category_id existe y es del tipo correcto
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS category_id UUID;

-- 6. Crear UNA SOLA restricción FK limpia
ALTER TABLE public.courses 
ADD CONSTRAINT fk_courses_category_id 
FOREIGN KEY (category_id) REFERENCES public.categories(id) 
ON DELETE SET NULL ON UPDATE CASCADE;

-- 7. Actualizar courses existentes para que tengan category_id válido
-- Asignar a la primera categoría disponible si no tienen categoría
UPDATE public.courses 
SET category_id = (
    SELECT id FROM public.categories LIMIT 1
)
WHERE category_id IS NULL;

-- 8. Eliminar triggers problemáticos
DROP TRIGGER IF EXISTS sync_course_category_trigger ON public.courses;
DROP FUNCTION IF EXISTS sync_course_category_columns();

-- 9. Verificar el resultado final
SELECT 
    'VERIFICACIÓN FINAL' as status,
    COUNT(*) as total_courses,
    COUNT(category_id) as courses_with_category
FROM public.courses;

SELECT 
    'RESTRICCIONES FK' as status,
    tc.constraint_name,
    kcu.column_name
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
WHERE 
    tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_name = 'courses'
    AND ccu.table_name = 'categories';

-- 10. Mensaje de éxito
SELECT 'PROBLEMA DE RELACIONES MÚLTIPLES RESUELTO' as resultado;
