/*
=============================================================
SCRIPT PARA ARREGLAR EL ERROR DE RELACIONES MÚLTIPLES
=============================================================

Error: "Could not embed because more than one relationship was found for 'courses' and 'categories'"

INSTRUCCIONES:
1. Ve al Supabase Dashboard: https://supabase.com/dashboard
2. Ve a tu proyecto (xfuhbjqqlgfxxkjvezhy)
3. Ve a SQL Editor
4. Copia y pega CADA sección por separado y ejecuta una por una
5. Verifica que cada sección se ejecute sin errores antes de continuar

=============================================================
*/

-- SECCIÓN 1: Verificar restricciones existentes
-- (Ejecutar primero para ver qué restricciones hay)

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

-- =============================================================
-- SECCIÓN 2: Eliminar restricciones conflictivas
-- (Ejecutar después de ver los resultados de la sección 1)

-- Eliminar todas las posibles FK duplicadas
ALTER TABLE public.courses DROP CONSTRAINT IF EXISTS courses_category_fkey;
ALTER TABLE public.courses DROP CONSTRAINT IF EXISTS courses_category_id_fkey; 
ALTER TABLE public.courses DROP CONSTRAINT IF EXISTS fk_courses_category;
ALTER TABLE public.courses DROP CONSTRAINT IF EXISTS fk_courses_categories;
ALTER TABLE public.courses DROP CONSTRAINT IF EXISTS courses_category_id_fkey1;
ALTER TABLE public.courses DROP CONSTRAINT IF EXISTS courses_category_id_fkey2;

-- =============================================================
-- SECCIÓN 3: Verificar y agregar columnas necesarias
-- (Asegurar que las columnas existan)

ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS category_id UUID;
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS category UUID;

-- =============================================================
-- SECCIÓN 4: Sincronizar datos entre columnas
-- (Asegurar que los datos sean consistentes)

UPDATE public.courses 
SET category = category_id 
WHERE category IS NULL AND category_id IS NOT NULL;

UPDATE public.courses 
SET category_id = category 
WHERE category_id IS NULL AND category IS NOT NULL;

-- =============================================================
-- SECCIÓN 5: Crear UNA SOLA restricción limpia
-- (Esta será la única FK entre courses y categories)

ALTER TABLE public.courses 
ADD CONSTRAINT courses_category_id_fkey 
FOREIGN KEY (category_id) REFERENCES public.categories(id) 
ON DELETE SET NULL ON UPDATE CASCADE;

-- =============================================================
-- SECCIÓN 6: Verificar que se solucionó el problema
-- (Esta consulta debería funcionar sin errores)

SELECT 
    c.id,
    c.title,
    c.description,
    c.category_id,
    cat.name as category_name
FROM public.courses c
LEFT JOIN public.categories cat ON c.category_id = cat.id
LIMIT 5;

-- =============================================================
-- SECCIÓN 7: Crear función de sincronización (OPCIONAL)
-- (Solo si quieres mantener sincronizadas ambas columnas)

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

-- =============================================================
-- SECCIÓN 8: Crear trigger (OPCIONAL)
-- (Solo si ejecutaste la sección 7)

DROP TRIGGER IF EXISTS sync_course_category_trigger ON public.courses;
CREATE TRIGGER sync_course_category_trigger
    BEFORE UPDATE ON public.courses
    FOR EACH ROW
    EXECUTE FUNCTION sync_course_category_columns();

-- =============================================================
-- SECCIÓN 9: Verificación final
-- (Verificar que ya no hay múltiples relaciones)

SELECT 
    'VERIFICACIÓN FINAL' as status,
    COUNT(*) as total_foreign_keys_a_categories
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND tc.table_name = 'courses'
  AND ccu.table_name = 'categories';

-- Debería devolver total_foreign_keys_a_categories = 1

-- =============================================================
-- ¡LISTO! 
-- Ahora las consultas con embed de categories deberían funcionar
-- =============================================================
