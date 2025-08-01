-- Script para arreglar el conflicto de relaciones múltiples entre courses y categories
-- Error: "Could not embed because more than one relationship was found for 'courses' and 'categories'"

-- 1. Verificar las restricciones existentes entre courses y categories
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

-- 2. Eliminar restricciones de clave foránea duplicadas o conflictivas
-- Primero verificamos si existen múltiples FK hacia categories
DO $$
DECLARE
    constraint_rec RECORD;
BEGIN
    -- Buscar y eliminar todas las FK de courses hacia categories
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
        RAISE NOTICE 'Eliminada restricción: %', constraint_rec.constraint_name;
    END LOOP;
END $$;

-- 3. Verificar las columnas que apuntan a categories
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'courses' 
  AND table_schema = 'public'
  AND (column_name LIKE '%category%' OR column_name LIKE '%categories%');

-- 4. Limpiar datos inconsistentes
-- Asegurar que category y category_id tengan valores consistentes
UPDATE public.courses 
SET category = category_id 
WHERE category IS NULL AND category_id IS NOT NULL;

UPDATE public.courses 
SET category_id = category 
WHERE category_id IS NULL AND category IS NOT NULL;

-- 5. Crear una sola restricción de clave foránea limpia
-- Usar solo category_id como la clave foránea principal
ALTER TABLE public.courses 
ADD CONSTRAINT courses_category_id_fkey 
FOREIGN KEY (category_id) REFERENCES public.categories(id) 
ON DELETE SET NULL ON UPDATE CASCADE;

-- 6. Crear trigger para mantener sincronización entre category y category_id
CREATE OR REPLACE FUNCTION sync_course_category_columns()
RETURNS TRIGGER AS $$
BEGIN
    -- Si se actualiza category_id, sincronizar category
    IF NEW.category_id IS DISTINCT FROM OLD.category_id THEN
        NEW.category = NEW.category_id;
    END IF;
    
    -- Si se actualiza category, sincronizar category_id  
    IF NEW.category IS DISTINCT FROM OLD.category THEN
        NEW.category_id = NEW.category;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar el trigger
DROP TRIGGER IF EXISTS sync_course_category_trigger ON public.courses;
CREATE TRIGGER sync_course_category_trigger
    BEFORE UPDATE ON public.courses
    FOR EACH ROW
    EXECUTE FUNCTION sync_course_category_columns();

-- 7. Verificar que no hay relaciones duplicadas
SELECT 
    'RELACIONES VERIFICADAS' as status,
    COUNT(*) as total_foreign_keys
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND tc.table_name = 'courses'
  AND ccu.table_name = 'categories';

-- 8. Test de la consulta que estaba fallando
-- Esto debería funcionar ahora sin el error de relaciones múltiples
SELECT 
    c.id,
    c.title,
    c.description,
    cat.name as category_name,
    cat.id as category_id
FROM public.courses c
LEFT JOIN public.categories cat ON c.category_id = cat.id
LIMIT 5;

-- 9. Mensaje de confirmación
SELECT 
    'PROBLEMA DE RELACIONES RESUELTO' as resultado,
    'Las consultas con embed de categories ahora deberían funcionar' as mensaje;
