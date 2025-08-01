-- Script para crear el usuario administrador por defecto del sistema
-- Ejecutar este script en el SQL Editor de Supabase Dashboard

-- IMPORTANTE: Primero crear el usuario en Authentication > Users:
-- Email: admin@learnpro.com
-- Password: admin123
-- Auto confirm: ✅

-- Este script crea el perfil de administrador
DO $$
DECLARE
    user_uuid UUID;
BEGIN
    -- Buscar el UUID del usuario admin@learnpro.com
    SELECT id INTO user_uuid 
    FROM auth.users 
    WHERE email = 'admin@learnpro.com';
    
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
            
        RAISE NOTICE 'Perfil de administrador creado/actualizado para admin@learnpro.com: %', user_uuid;
    ELSE
        RAISE NOTICE 'Usuario admin@learnpro.com no encontrado en auth.users';
        RAISE NOTICE 'Pasos para crear:';
        RAISE NOTICE '1. Ve a Authentication > Users';
        RAISE NOTICE '2. Add user: admin@learnpro.com';
        RAISE NOTICE '3. Password: admin123';
        RAISE NOTICE '4. Auto confirm: ✅';
        RAISE NOTICE '5. Luego ejecuta este script nuevamente';
    END IF;
END $$;

-- Verificar que el usuario fue creado correctamente
SELECT 
    p.user_id,
    u.email,
    p.full_name,
    p.role,
    p.created_at,
    'SUCCESS: Administrador creado correctamente' as status
FROM public.profiles p
JOIN auth.users u ON p.user_id = u.id
WHERE u.email = 'admin@learnpro.com'
AND p.role = 'admin';
