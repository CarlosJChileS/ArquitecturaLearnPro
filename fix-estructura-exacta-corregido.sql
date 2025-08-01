-- CORRECCIÓN FINAL DEFINITIVA: Estructura exacta requerida por el sistema
-- Este script corrige la estructura para que coincida EXACTAMENTE con lo esperado

-- 1. PRIMERO: Verificar qué foreign keys existen actualmente
SELECT 
    'ESTADO ACTUAL' as info,
    tc.table_name, 
    tc.constraint_name, 
    kcu.column_name,
    ccu.table_name AS references_table,
    ccu.column_name AS references_column
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
AND tc.table_name IN ('course_enrollments', 'lesson_progress', 'courses', 'lessons')
ORDER BY tc.table_name, tc.constraint_name;

-- 2. ELIMINAR TODAS las foreign keys problemáticas
DO $$
DECLARE
    constraint_record RECORD;
BEGIN    
    -- Eliminar foreign keys de todas las tablas relacionadas
    FOR constraint_record IN 
        SELECT conname, conrelid::regclass::text as table_name
        FROM pg_constraint 
        WHERE conrelid IN ('course_enrollments'::regclass, 'lesson_progress'::regclass, 'courses'::regclass, 'lessons'::regclass)
        AND contype = 'f'
    LOOP
        EXECUTE format('ALTER TABLE %s DROP CONSTRAINT IF EXISTS %s', constraint_record.table_name, constraint_record.conname);
        RAISE NOTICE 'Eliminada constraint: %.%', constraint_record.table_name, constraint_record.conname;
    END LOOP;
END
$$;

-- 3. ASEGURAR que profiles tiene la estructura correcta
DO $$
BEGIN
    -- Verificar si profiles existe, si no, crearla
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles') THEN
        CREATE TABLE profiles (
            user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
            full_name TEXT,
            avatar_url TEXT,
            role TEXT DEFAULT 'student',
            bio TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        RAISE NOTICE 'Tabla profiles creada';
    END IF;
    
    -- Asegurar que user_id es PRIMARY KEY
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'profiles' AND constraint_type = 'PRIMARY KEY'
    ) THEN
        ALTER TABLE profiles ADD PRIMARY KEY (user_id);
        RAISE NOTICE 'PRIMARY KEY agregada a profiles(user_id)';
    END IF;
END
$$;

-- 4. ASEGURAR que categories existe
CREATE TABLE IF NOT EXISTS categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    icon TEXT,
    color TEXT DEFAULT '#3B82F6',
    slug TEXT UNIQUE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insertar categorías básicas si no existen
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM categories LIMIT 1) THEN
        INSERT INTO categories (name, description, slug) VALUES
        ('Programación', 'Cursos de programación', 'programacion'),
        ('Diseño', 'Cursos de diseño', 'diseno'),
        ('General', 'Cursos generales', 'general');
    END IF;
END
$$;

-- 5. ACTUALIZAR courses para tener category_id e instructor_id correctos
DO $$
DECLARE
    default_instructor_id UUID;
BEGIN
    -- Agregar category_id si no existe
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'category_id') THEN
        ALTER TABLE courses ADD COLUMN category_id UUID;
        -- Asignar categoría por defecto
        UPDATE courses SET category_id = (SELECT id FROM categories WHERE slug = 'general' LIMIT 1) WHERE category_id IS NULL;
    END IF;
    
    -- Actualizar instructor_id para referenciar profiles
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'instructor_id') THEN
        -- Buscar el primer usuario existente en auth.users
        SELECT id INTO default_instructor_id 
        FROM auth.users 
        LIMIT 1;
        
        IF default_instructor_id IS NOT NULL THEN
            -- Crear perfil para este usuario si no existe
            INSERT INTO profiles (user_id, full_name, role) 
            VALUES (default_instructor_id, 'Instructor Demo', 'instructor')
            ON CONFLICT (user_id) DO NOTHING;
            
            -- Actualizar cursos sin instructor válido
            UPDATE courses 
            SET instructor_id = default_instructor_id 
            WHERE instructor_id IS NULL OR instructor_id NOT IN (SELECT user_id FROM profiles WHERE user_id IS NOT NULL);
        ELSE
            RAISE NOTICE 'No hay usuarios en auth.users, instructor_id quedará NULL';
        END IF;
    END IF;
END
$$;

-- 6. LIMPIAR datos huérfanos en course_enrollments
DO $$
DECLARE
    deleted_count INTEGER;
BEGIN
    -- Limpiar enrollments con course_id inválido
    DELETE FROM course_enrollments 
    WHERE course_id IS NOT NULL 
    AND course_id NOT IN (SELECT id FROM courses WHERE id IS NOT NULL);
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    IF deleted_count > 0 THEN
        RAISE NOTICE 'Eliminados % course_enrollments con course_id inválido', deleted_count;
    END IF;
    
    -- Solo limpiar user_id inválidos si hay usuarios y profiles
    IF EXISTS (SELECT 1 FROM auth.users LIMIT 1) AND EXISTS (SELECT 1 FROM profiles LIMIT 1) THEN
        DELETE FROM course_enrollments 
        WHERE user_id IS NOT NULL 
        AND user_id NOT IN (SELECT user_id FROM profiles WHERE user_id IS NOT NULL);
        GET DIAGNOSTICS deleted_count = ROW_COUNT;
        IF deleted_count > 0 THEN
            RAISE NOTICE 'Eliminados % course_enrollments con user_id inválido', deleted_count;
        END IF;
    ELSE
        RAISE NOTICE 'Saltando limpieza de user_id - No hay usuarios/profiles todavía';
    END IF;
END
$$;

-- 7. LIMPIAR datos huérfanos en lesson_progress
DO $$
DECLARE
    deleted_count INTEGER;
BEGIN
    -- Limpiar lesson_progress con datos inválidos
    DELETE FROM lesson_progress 
    WHERE course_id IS NOT NULL 
    AND course_id NOT IN (SELECT id FROM courses WHERE id IS NOT NULL);
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    IF deleted_count > 0 THEN
        RAISE NOTICE 'Eliminados % lesson_progress con course_id inválido', deleted_count;
    END IF;
    
    DELETE FROM lesson_progress 
    WHERE lesson_id IS NOT NULL 
    AND lesson_id NOT IN (SELECT id FROM lessons WHERE id IS NOT NULL);
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    IF deleted_count > 0 THEN
        RAISE NOTICE 'Eliminados % lesson_progress con lesson_id inválido', deleted_count;
    END IF;
    
    -- Solo limpiar user_id inválidos si hay usuarios y profiles
    IF EXISTS (SELECT 1 FROM auth.users LIMIT 1) AND EXISTS (SELECT 1 FROM profiles LIMIT 1) THEN
        DELETE FROM lesson_progress 
        WHERE user_id IS NOT NULL 
        AND user_id NOT IN (SELECT user_id FROM profiles WHERE user_id IS NOT NULL);
        GET DIAGNOSTICS deleted_count = ROW_COUNT;
        IF deleted_count > 0 THEN
            RAISE NOTICE 'Eliminados % lesson_progress con user_id inválido', deleted_count;
        END IF;
    ELSE
        RAISE NOTICE 'Saltando limpieza de user_id - No hay usuarios/profiles todavía';
    END IF;
END
$$;

-- 8. CREAR EXACTAMENTE las foreign keys esperadas por el sistema
DO $$
BEGIN
    RAISE NOTICE '=== CREANDO FOREIGN KEYS SEGÚN ESTRUCTURA ESPERADA ===';
    
    -- course_enrollments → course_id → courses(id)
    ALTER TABLE course_enrollments 
    ADD CONSTRAINT course_enrollments_course_id_fkey 
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE;
    RAISE NOTICE '✓ course_enrollments.course_id → courses.id';
    
    -- course_enrollments → user_id → profiles(user_id) (solo si hay usuarios)
    IF EXISTS (SELECT 1 FROM auth.users LIMIT 1) THEN
        ALTER TABLE course_enrollments 
        ADD CONSTRAINT course_enrollments_user_id_fkey 
        FOREIGN KEY (user_id) REFERENCES profiles(user_id) ON DELETE CASCADE;
        RAISE NOTICE '✓ course_enrollments.user_id → profiles.user_id';
    ELSE
        RAISE NOTICE '⚠ Saltando course_enrollments.user_id FK - No hay usuarios en auth.users';
    END IF;
    
    -- lesson_progress → course_id → courses(id)
    ALTER TABLE lesson_progress 
    ADD CONSTRAINT lesson_progress_course_id_fkey 
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE;
    RAISE NOTICE '✓ lesson_progress.course_id → courses.id';
    
    -- lesson_progress → lesson_id → lessons(id)
    ALTER TABLE lesson_progress 
    ADD CONSTRAINT lesson_progress_lesson_id_fkey 
    FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE;
    RAISE NOTICE '✓ lesson_progress.lesson_id → lessons.id';
    
    -- lesson_progress → user_id → profiles(user_id) (solo si hay usuarios)
    IF EXISTS (SELECT 1 FROM auth.users LIMIT 1) THEN
        ALTER TABLE lesson_progress 
        ADD CONSTRAINT lesson_progress_user_id_fkey 
        FOREIGN KEY (user_id) REFERENCES profiles(user_id) ON DELETE CASCADE;
        RAISE NOTICE '✓ lesson_progress.user_id → profiles.user_id';
    ELSE
        RAISE NOTICE '⚠ Saltando lesson_progress.user_id FK - No hay usuarios en auth.users';
    END IF;
    
    -- courses → category_id → categories(id)
    ALTER TABLE courses 
    ADD CONSTRAINT courses_category_id_fkey 
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL;
    RAISE NOTICE '✓ courses.category_id → categories.id';
    
    -- courses → instructor_id → profiles(user_id) (solo si hay usuarios)
    IF EXISTS (SELECT 1 FROM auth.users LIMIT 1) THEN
        ALTER TABLE courses 
        ADD CONSTRAINT courses_instructor_id_fkey 
        FOREIGN KEY (instructor_id) REFERENCES profiles(user_id) ON DELETE SET NULL;
        RAISE NOTICE '✓ courses.instructor_id → profiles.user_id';
    ELSE
        RAISE NOTICE '⚠ Saltando courses.instructor_id FK - No hay usuarios en auth.users';
    END IF;
    
    -- lessons → course_id → courses(id)
    ALTER TABLE lessons 
    ADD CONSTRAINT lessons_course_id_fkey 
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE;
    RAISE NOTICE '✓ lessons.course_id → courses.id';

EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Error creando foreign keys: %', SQLERRM;
    RAISE;
END
$$;

-- 9. VERIFICACIÓN FINAL - Mostrar TODAS las foreign keys creadas
SELECT 
    'VERIFICACIÓN FINAL' as status,
    tc.table_name, 
    tc.constraint_name, 
    kcu.column_name,
    ccu.table_name AS references_table,
    ccu.column_name AS references_column
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
AND tc.table_name IN ('course_enrollments', 'lesson_progress', 'courses', 'lessons')
ORDER BY tc.table_name, tc.constraint_name;

-- 10. CONFIRMACIÓN
DO $$
DECLARE
    fk_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO fk_count
    FROM information_schema.table_constraints 
    WHERE constraint_type = 'FOREIGN KEY' 
    AND table_name IN ('course_enrollments', 'lesson_progress', 'courses', 'lessons');
    
    RAISE NOTICE '🎉 TOTAL FOREIGN KEYS CREADAS: %', fk_count;
    RAISE NOTICE '=== ESTRUCTURA EXACTA REQUERIDA IMPLEMENTADA ===';
END
$$;
