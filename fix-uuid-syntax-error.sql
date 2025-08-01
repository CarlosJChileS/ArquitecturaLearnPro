-- CORRECCIÓN: Invalid input syntax for type uuid
-- Este script corrige los campos UUID que contienen cadenas vacías

-- 1. VERIFICAR datos problemáticos en courses
SELECT 
    'DATOS PROBLEMÁTICOS EN COURSES' as info,
    id,
    title,
    category_id,
    instructor_id
FROM courses 
WHERE category_id::text = '' OR instructor_id::text = '' OR category_id = '00000000-0000-0000-0000-000000000000' OR instructor_id = '00000000-0000-0000-0000-000000000000';

-- 2. CORREGIR campos UUID vacíos en courses
DO $$
DECLARE
    fixed_count INTEGER := 0;
    general_category_id UUID;
BEGIN
    -- Obtener ID de categoría "General"
    SELECT id INTO general_category_id FROM categories WHERE slug = 'general' LIMIT 1;
    
    -- Corregir category_id vacíos
    UPDATE courses 
    SET category_id = general_category_id 
    WHERE category_id IS NULL OR category_id::text = '' OR category_id = '00000000-0000-0000-0000-000000000000';
    
    GET DIAGNOSTICS fixed_count = ROW_COUNT;
    IF fixed_count > 0 THEN
        RAISE NOTICE 'Corregidos % cursos con category_id inválido', fixed_count;
    END IF;
    
    -- Corregir instructor_id vacíos (ponerlos como NULL por ahora)
    UPDATE courses 
    SET instructor_id = NULL 
    WHERE instructor_id::text = '' OR instructor_id = '00000000-0000-0000-0000-000000000000';
    
    GET DIAGNOSTICS fixed_count = ROW_COUNT;
    IF fixed_count > 0 THEN
        RAISE NOTICE 'Corregidos % cursos con instructor_id inválido', fixed_count;
    END IF;
END
$$;

-- 3. VERIFICAR y corregir course_enrollments
DO $$
DECLARE
    fixed_count INTEGER := 0;
BEGIN
    -- Corregir user_id vacíos
    DELETE FROM course_enrollments 
    WHERE user_id IS NULL OR user_id::text = '' OR user_id = '00000000-0000-0000-0000-000000000000';
    
    GET DIAGNOSTICS fixed_count = ROW_COUNT;
    IF fixed_count > 0 THEN
        RAISE NOTICE 'Eliminados % course_enrollments con user_id inválido', fixed_count;
    END IF;
    
    -- Corregir course_id vacíos
    DELETE FROM course_enrollments 
    WHERE course_id IS NULL OR course_id::text = '' OR course_id = '00000000-0000-0000-0000-000000000000';
    
    GET DIAGNOSTICS fixed_count = ROW_COUNT;
    IF fixed_count > 0 THEN
        RAISE NOTICE 'Eliminados % course_enrollments con course_id inválido', fixed_count;
    END IF;
END
$$;

-- 4. VERIFICAR y corregir lesson_progress
DO $$
DECLARE
    fixed_count INTEGER := 0;
BEGIN
    -- Corregir user_id vacíos
    DELETE FROM lesson_progress 
    WHERE user_id IS NULL OR user_id::text = '' OR user_id = '00000000-0000-0000-0000-000000000000';
    
    GET DIAGNOSTICS fixed_count = ROW_COUNT;
    IF fixed_count > 0 THEN
        RAISE NOTICE 'Eliminados % lesson_progress con user_id inválido', fixed_count;
    END IF;
    
    -- Corregir course_id vacíos
    DELETE FROM lesson_progress 
    WHERE course_id IS NULL OR course_id::text = '' OR course_id = '00000000-0000-0000-0000-000000000000';
    
    GET DIAGNOSTICS fixed_count = ROW_COUNT;
    IF fixed_count > 0 THEN
        RAISE NOTICE 'Eliminados % lesson_progress con course_id inválido', fixed_count;
    END IF;
    
    -- Corregir lesson_id vacíos
    DELETE FROM lesson_progress 
    WHERE lesson_id IS NULL OR lesson_id::text = '' OR lesson_id = '00000000-0000-0000-0000-000000000000';
    
    GET DIAGNOSTICS fixed_count = ROW_COUNT;
    IF fixed_count > 0 THEN
        RAISE NOTICE 'Eliminados % lesson_progress con lesson_id inválido', fixed_count;
    END IF;
END
$$;

-- 5. AÑADIR CONSTRAINTS para prevenir futuros problemas
DO $$
BEGIN
    -- Constraint para evitar UUIDs vacíos en courses.category_id
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.check_constraints 
        WHERE constraint_name = 'courses_category_id_not_empty'
    ) THEN
        ALTER TABLE courses 
        ADD CONSTRAINT courses_category_id_not_empty 
        CHECK (category_id IS NULL OR category_id != '00000000-0000-0000-0000-000000000000');
    END IF;
    
    -- Constraint para evitar UUIDs vacíos en courses.instructor_id
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.check_constraints 
        WHERE constraint_name = 'courses_instructor_id_not_empty'
    ) THEN
        ALTER TABLE courses 
        ADD CONSTRAINT courses_instructor_id_not_empty 
        CHECK (instructor_id IS NULL OR instructor_id != '00000000-0000-0000-0000-000000000000');
    END IF;
    
    RAISE NOTICE 'Constraints de validación añadidas';
END
$$;

-- 6. VERIFICACIÓN FINAL
SELECT 
    'VERIFICACIÓN FINAL' as status,
    COUNT(*) as total_courses,
    COUNT(category_id) as courses_with_category,
    COUNT(instructor_id) as courses_with_instructor
FROM courses;

-- 7. Mostrar cursos que podrían tener problemas
SELECT 
    'CURSOS SIN CATEGORÍA' as info,
    id, title, category_id
FROM courses 
WHERE category_id IS NULL
LIMIT 5;

-- 8. CONFIRMACIÓN FINAL
DO $$
BEGIN
    RAISE NOTICE '=== CORRECCIÓN DE UUIDs COMPLETADA ===';
END
$$;
