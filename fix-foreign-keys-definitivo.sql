-- CORRECCIÓN DEFINITIVA: Foreign Keys course_enrollments
-- Ejecutar este script completo en una sola ejecución

-- Paso 1: Verificar estado actual
DO $$
BEGIN
    RAISE NOTICE '=== VERIFICACIÓN INICIAL ===';
END
$$;

SELECT 
    'CURRENT FOREIGN KEYS' as check_type,
    tc.table_name, 
    tc.constraint_name, 
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
AND tc.table_name = 'course_enrollments';

-- Paso 2: Eliminar TODAS las foreign keys existentes de course_enrollments
DO $$
DECLARE
    constraint_record RECORD;
BEGIN
    RAISE NOTICE '=== ELIMINANDO FOREIGN KEYS EXISTENTES ===';
    
    FOR constraint_record IN 
        SELECT conname 
        FROM pg_constraint 
        WHERE conrelid = 'course_enrollments'::regclass
        AND contype = 'f'
    LOOP
        EXECUTE 'ALTER TABLE course_enrollments DROP CONSTRAINT ' || constraint_record.conname;
        RAISE NOTICE 'Eliminada constraint: %', constraint_record.conname;
    END LOOP;
    
    RAISE NOTICE 'Todas las foreign keys eliminadas';
END
$$;

-- Paso 3: Limpiar datos huérfanos
DO $$
DECLARE
    orphaned_records INTEGER;
BEGIN
    RAISE NOTICE '=== LIMPIANDO DATOS HUÉRFANOS ===';
    
    -- Verificar courses válidos
    SELECT COUNT(*) INTO orphaned_records
    FROM course_enrollments ce
    LEFT JOIN courses c ON ce.course_id = c.id
    WHERE c.id IS NULL;
    
    IF orphaned_records > 0 THEN
        DELETE FROM course_enrollments 
        WHERE course_id NOT IN (SELECT id FROM courses WHERE id IS NOT NULL);
        RAISE NOTICE 'Eliminados % enrollments con course_id inválido', orphaned_records;
    END IF;
    
    -- Verificar profiles válidos
    SELECT COUNT(*) INTO orphaned_records
    FROM course_enrollments ce
    LEFT JOIN profiles p ON ce.user_id = p.user_id
    WHERE p.user_id IS NULL;
    
    IF orphaned_records > 0 THEN
        DELETE FROM course_enrollments 
        WHERE user_id NOT IN (SELECT user_id FROM profiles WHERE user_id IS NOT NULL);
        RAISE NOTICE 'Eliminados % enrollments con user_id inválido', orphaned_records;
    END IF;
    
    RAISE NOTICE 'Limpieza de datos completada';
END
$$;

-- Paso 4: Verificar que las tablas referenciadas existen
DO $$
BEGIN
    RAISE NOTICE '=== VERIFICANDO TABLAS REFERENCIADAS ===';
    
    -- Verificar profiles
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles') THEN
        RAISE EXCEPTION 'ERROR: Tabla profiles no existe';
    END IF;
    
    -- Verificar courses
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'courses') THEN
        RAISE EXCEPTION 'ERROR: Tabla courses no existe';
    END IF;
    
    RAISE NOTICE 'Tablas referenciadas existen correctamente';
END
$$;

-- Paso 5: Crear las foreign keys correctas
DO $$
BEGIN
    RAISE NOTICE '=== CREANDO FOREIGN KEYS ===';
    
    -- Foreign key: course_enrollments.course_id -> courses.id
    BEGIN
        ALTER TABLE course_enrollments 
        ADD CONSTRAINT course_enrollments_course_id_fkey 
        FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE;
        RAISE NOTICE '✓ Creada: course_enrollments_course_id_fkey';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE '✗ Error creando course_enrollments_course_id_fkey: %', SQLERRM;
        RAISE;
    END;
    
    -- Foreign key: course_enrollments.user_id -> profiles.user_id
    BEGIN
        ALTER TABLE course_enrollments 
        ADD CONSTRAINT course_enrollments_user_id_fkey 
        FOREIGN KEY (user_id) REFERENCES profiles(user_id) ON DELETE CASCADE;
        RAISE NOTICE '✓ Creada: course_enrollments_user_id_fkey';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE '✗ Error creando course_enrollments_user_id_fkey: %', SQLERRM;
        RAISE;
    END;
    
    RAISE NOTICE 'Foreign keys creadas exitosamente';
END
$$;

-- Paso 6: Verificación final
SELECT 
    'VERIFICATION AFTER CREATION' as check_type,
    tc.table_name, 
    tc.constraint_name, 
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
AND tc.table_name = 'course_enrollments'
ORDER BY tc.constraint_name;

-- Paso 7: Confirmar éxito
DO $$
DECLARE
    fk_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO fk_count
    FROM information_schema.table_constraints 
    WHERE table_name = 'course_enrollments' 
    AND constraint_type = 'FOREIGN KEY';
    
    RAISE NOTICE '=== RESULTADO FINAL ===';
    
    IF fk_count >= 2 THEN
        RAISE NOTICE '🎉 ÉXITO: course_enrollments tiene % foreign key constraints configuradas correctamente', fk_count;
        RAISE NOTICE '✓ course_id -> courses(id)';
        RAISE NOTICE '✓ user_id -> profiles(user_id)';
    ELSE
        RAISE NOTICE '⚠️ ADVERTENCIA: course_enrollments solo tiene % foreign key constraints (esperadas: 2)', fk_count;
    END IF;
END
$$;
