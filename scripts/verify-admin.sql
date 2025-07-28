-- Script para verificar usuarios administradores existentes
-- Ejecutar este script en el SQL Editor de Supabase Dashboard

-- 1. Verificar usuarios en auth.users
SELECT 
    'USUARIOS EN AUTH.USERS' as tabla,
    id,
    email,
    email_confirmed_at,
    created_at
FROM auth.users 
WHERE email IN ('admin@learnpro.com', 'carlosjchiles@gmail.com')
ORDER BY created_at DESC;

-- 2. Verificar perfiles de administradores
SELECT 
    'PERFILES DE ADMIN' as tabla,
    p.user_id,
    u.email,
    p.full_name,
    p.role,
    p.created_at
FROM public.profiles p
JOIN auth.users u ON p.user_id = u.id
WHERE p.role = 'admin'
ORDER BY p.created_at DESC;

-- 3. Verificar si existen usuarios sin perfil
SELECT 
    'USUARIOS SIN PERFIL' as tabla,
    u.id,
    u.email,
    'No tiene perfil en tabla profiles' as issue
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.user_id
WHERE p.user_id IS NULL
AND u.email IN ('admin@learnpro.com', 'carlosjchiles@gmail.com');

-- 4. Crear perfil de admin si el usuario existe pero no tiene perfil
DO $$
DECLARE
    user_record RECORD;
BEGIN
    FOR user_record IN 
        SELECT u.id, u.email
        FROM auth.users u
        LEFT JOIN public.profiles p ON u.id = p.user_id
        WHERE p.user_id IS NULL
        AND u.email IN ('admin@learnpro.com', 'carlosjchiles@gmail.com')
    LOOP
        INSERT INTO public.profiles (user_id, full_name, role, created_at, updated_at)
        VALUES (
            user_record.id,
            CASE 
                WHEN user_record.email = 'admin@learnpro.com' THEN 'Administrador Principal'
                ELSE 'Carlos J. Chile S.'
            END,
            'admin',
            NOW(),
            NOW()
        );
        
        RAISE NOTICE 'Perfil de admin creado para: % (ID: %)', user_record.email, user_record.id;
    END LOOP;
END $$;
