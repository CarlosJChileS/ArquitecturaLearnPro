-- ===================================================================
-- SOLUCIÓN COMPLETA: Configurar profiles para avatares
-- Descripción: Agrega columna y configura permisos necesarios
-- Fecha: 2025-08-01
-- ===================================================================

-- Paso 1: Agregar columna avatar_url
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND column_name = 'avatar_url'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.profiles ADD COLUMN avatar_url TEXT;
        RAISE NOTICE 'Columna avatar_url agregada';
    ELSE
        RAISE NOTICE 'Columna avatar_url ya existe';
    END IF;
END $$;

-- Paso 2: Verificar y ajustar RLS si es necesario
DO $$
BEGIN
    -- Verificar si RLS está causando problemas
    -- Temporalmente deshabilitar RLS para diagnóstico
    ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
    RAISE NOTICE 'RLS deshabilitado temporalmente para profiles';
    
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'No se pudo modificar RLS: %', SQLERRM;
END $$;

-- Paso 3: Crear política básica para profiles si no existe
DO $$
BEGIN
    -- Eliminar política existente si hay conflictos
    DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
    DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
    
    -- Crear políticas básicas
    CREATE POLICY "Users can view own profile" ON public.profiles
        FOR SELECT USING (auth.uid() = user_id);
    
    CREATE POLICY "Users can update own profile" ON public.profiles
        FOR UPDATE USING (auth.uid() = user_id);
    
    RAISE NOTICE 'Políticas de profiles creadas';
    
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Error creando políticas: %', SQLERRM;
END $$;

-- Paso 4: Habilitar RLS nuevamente
DO $$
BEGIN
    ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
    RAISE NOTICE 'RLS habilitado nuevamente para profiles';
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Error habilitando RLS: %', SQLERRM;
END $$;

-- Paso 5: Verificación final
SELECT 'VERIFICACIÓN FINAL' as seccion;

-- Mostrar estructura
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND table_schema = 'public'
AND column_name IN ('user_id', 'full_name', 'email', 'avatar_url')
ORDER BY column_name;

-- Mostrar políticas
SELECT 
    policyname,
    cmd
FROM pg_policies 
WHERE tablename = 'profiles' 
AND schemaname = 'public';

-- Estado RLS
SELECT 
    tablename,
    rowsecurity as rls_habilitado
FROM pg_tables 
WHERE tablename = 'profiles' 
AND schemaname = 'public';

-- Mensaje final
DO $$
BEGIN
    RAISE NOTICE 'Configuración completada. Prueba subir una imagen ahora.';
END $$;
