-- SCRIPT DE CORRECCIÓN FINAL: Arreglar Foreign Keys en course_enrollments
-- Ejecutar DESPUÉS de fix-database-alignment.sql

-- 1. Verificar y mostrar el estado actual de las foreign keys
SELECT 
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

-- 2. Limpiar datos huérfanos antes de crear foreign keys
DO $$
DECLARE
    orphaned_records INTEGER;
BEGIN
    -- Eliminar enrollments con course_id que no existe en courses
    DELETE FROM course_enrollments 
    WHERE course_id NOT IN (SELECT id FROM courses WHERE id IS NOT NULL);
    
    GET DIAGNOSTICS orphaned_records = ROW_COUNT;
    RAISE NOTICE 'Deleted % course_enrollments with invalid course_id', orphaned_records;
    
    -- Eliminar enrollments con user_id que no existe en profiles
    DELETE FROM course_enrollments 
    WHERE user_id NOT IN (SELECT user_id FROM profiles WHERE user_id IS NOT NULL);
    
    GET DIAGNOSTICS orphaned_records = ROW_COUNT;
    RAISE NOTICE 'Deleted % course_enrollments with invalid user_id', orphaned_records;
    
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Error cleaning orphaned records: %', SQLERRM;
END
$$;

-- 3. Eliminar todas las foreign keys existentes de course_enrollments
DO $$
DECLARE
    constraint_record RECORD;
BEGIN
    FOR constraint_record IN 
        SELECT conname 
        FROM pg_constraint 
        WHERE conrelid = 'course_enrollments'::regclass
        AND contype = 'f'
    LOOP
        EXECUTE 'ALTER TABLE course_enrollments DROP CONSTRAINT IF EXISTS ' || constraint_record.conname;
        RAISE NOTICE 'Dropped constraint: %', constraint_record.conname;
    END LOOP;
END
$$;

-- 4. Verificar que las tablas referenciadas existen y tienen los campos correctos
DO $$
BEGIN
    -- Verificar que profiles tiene user_id como PK
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'profiles' 
        AND constraint_type = 'PRIMARY KEY'
        AND constraint_name LIKE '%user_id%'
    ) THEN
        RAISE NOTICE 'WARNING: profiles table does not have user_id as PRIMARY KEY';
        
        -- Intentar crear PK en user_id si no existe
        BEGIN
            ALTER TABLE profiles ADD PRIMARY KEY (user_id);
            RAISE NOTICE 'Added PRIMARY KEY to profiles(user_id)';
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'Could not add PRIMARY KEY to profiles(user_id): %', SQLERRM;
        END;
    END IF;
    
    -- Verificar que courses tiene id como PK
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'courses' 
        AND constraint_type = 'PRIMARY KEY'
    ) THEN
        RAISE NOTICE 'WARNING: courses table does not have PRIMARY KEY';
    END IF;
END
$$;

-- 5. Crear foreign keys con validación paso a paso
DO $$
BEGIN
    -- course_enrollments -> courses
    BEGIN
        RAISE NOTICE 'Creating foreign key: course_enrollments.course_id -> courses.id';
        ALTER TABLE course_enrollments 
        ADD CONSTRAINT course_enrollments_course_id_fkey 
        FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE;
        RAISE NOTICE '✓ Successfully created course_enrollments_course_id_fkey';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE '✗ Failed to create course_enrollments_course_id_fkey: %', SQLERRM;
    END;

    -- course_enrollments -> profiles
    BEGIN
        RAISE NOTICE 'Creating foreign key: course_enrollments.user_id -> profiles.user_id';
        ALTER TABLE course_enrollments 
        ADD CONSTRAINT course_enrollments_user_id_fkey 
        FOREIGN KEY (user_id) REFERENCES profiles(user_id) ON DELETE CASCADE;
        RAISE NOTICE '✓ Successfully created course_enrollments_user_id_fkey';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE '✗ Failed to create course_enrollments_user_id_fkey: %', SQLERRM;
    END;
END
$$;

-- 6. Verificar que las foreign keys se crearon correctamente
SELECT 
    'FINAL VERIFICATION' as status,
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

-- 7. Mostrar estadísticas de la tabla
SELECT 
    'course_enrollments statistics' as info,
    COUNT(*) as total_records,
    COUNT(DISTINCT user_id) as unique_users,
    COUNT(DISTINCT course_id) as unique_courses
FROM course_enrollments;

-- 8. Crear datos de prueba si la tabla está vacía
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM course_enrollments LIMIT 1) THEN
        -- Crear un perfil de prueba si no existe
        INSERT INTO profiles (user_id, full_name, role) 
        VALUES ('00000000-0000-0000-0000-000000000001', 'Usuario de Prueba', 'student')
        ON CONFLICT (user_id) DO NOTHING;
        
        -- Crear un curso de prueba si no existe
        INSERT INTO courses (id, title, description, instructor_id, published) 
        VALUES (
            '00000000-0000-0000-0000-000000000001', 
            'Curso de Prueba', 
            'Curso para verificar foreign keys',
            '00000000-0000-0000-0000-000000000001',
            true
        )
        ON CONFLICT (id) DO NOTHING;
        
        -- Crear enrollment de prueba
        INSERT INTO course_enrollments (user_id, course_id, status) 
        VALUES (
            '00000000-0000-0000-0000-000000000001',
            '00000000-0000-0000-0000-000000000001',
            'active'
        )
        ON CONFLICT (user_id, course_id) DO NOTHING;
        
        RAISE NOTICE 'Created test data for verification';
    END IF;
END
$$;

-- 9. Confirmar éxito
DO $$
DECLARE
    fk_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO fk_count
    FROM information_schema.table_constraints 
    WHERE table_name = 'course_enrollments' 
    AND constraint_type = 'FOREIGN KEY';
    
    IF fk_count >= 2 THEN
        RAISE NOTICE '🎉 SUCCESS: course_enrollments has % foreign key constraints properly configured!', fk_count;
    ELSE
        RAISE NOTICE '⚠️  WARNING: course_enrollments only has % foreign key constraints (expected 2)', fk_count;
    END IF;
END
$$;
