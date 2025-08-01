-- Script para crear un administrador en Supabase
-- Ejecutar este script en el SQL Editor de Supabase Dashboard

-- 1. Primero, insertar el usuario en auth.users (esto normalmente lo hace Supabase Auth)
-- Nota: Este paso debe hacerse a través del Auth de Supabase, no directamente en SQL

-- 2. Crear el perfil de administrador
-- Primero necesitamos el UUID del usuario creado en Auth
-- Este script busca por admin@learnpro.com o carlosjchiles@gmail.com

-- Buscar el usuario por email y obtener su UUID
DO $$
DECLARE
    user_uuid UUID;
    target_email TEXT := 'admin@learnpro.com';
    backup_email TEXT := 'carlosjchiles@gmail.com';
BEGIN
    -- Buscar el UUID del usuario por email (primero admin@learnpro.com)
    SELECT id INTO user_uuid 
    FROM auth.users 
    WHERE email = target_email;
    
    -- Si no encuentra admin@learnpro.com, buscar carlosjchiles@gmail.com
    IF user_uuid IS NULL THEN
        SELECT id INTO user_uuid 
        FROM auth.users 
        WHERE email = backup_email;
        target_email := backup_email;
    END IF;
    
    -- Si el usuario existe, crear/actualizar su perfil como admin
    IF user_uuid IS NOT NULL THEN
        -- Insertar o actualizar el perfil
        INSERT INTO public.profiles (user_id, full_name, role, created_at, updated_at)
        VALUES (
            user_uuid,
            'Administrador Principal',
            'admin',
            NOW(),
            NOW()
        )
        ON CONFLICT (user_id) 
        DO UPDATE SET 
            role = 'admin',
            full_name = 'Administrador Principal',
            updated_at = NOW();
            
        RAISE NOTICE 'Perfil de administrador creado/actualizado para usuario: % (email: %)', user_uuid, target_email;
    ELSE
        RAISE NOTICE 'Usuario no encontrado. Emails buscados: admin@learnpro.com, carlosjchiles@gmail.com';
        RAISE NOTICE 'Primero debes crear el usuario a través de Supabase Auth';
    END IF;
END $$;

-- 3. Verificar que el usuario fue creado correctamente
SELECT 
    p.user_id,
    u.email,
    p.full_name,
    p.role,
    p.created_at
FROM public.profiles p
JOIN auth.users u ON p.user_id = u.id
WHERE u.email IN ('admin@learnpro.com', 'carlosjchiles@gmail.com');
