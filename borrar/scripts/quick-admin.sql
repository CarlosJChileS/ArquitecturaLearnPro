-- Script simple para crear admin@learnpro.com
-- IMPORTANTE: Primero crear el usuario en Authentication > Users

-- 1. Buscar usuario existente
SELECT 'Usuarios existentes:' as info;
SELECT email, id, email_confirmed_at FROM auth.users WHERE email LIKE '%admin%' OR email LIKE '%carlos%';

-- 2. Crear perfil de admin (ejecutar después de crear el usuario en Auth)
INSERT INTO public.profiles (user_id, full_name, role, created_at, updated_at)
SELECT 
    id,
    'Administrador Principal',
    'admin',
    NOW(),
    NOW()
FROM auth.users 
WHERE email = 'admin@learnpro.com'
AND NOT EXISTS (
    SELECT 1 FROM public.profiles WHERE user_id = auth.users.id
);

-- 3. Verificar resultado
SELECT 'Resultado final:' as info;
SELECT 
    u.email,
    p.full_name,
    p.role,
    u.email_confirmed_at,
    p.created_at
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.user_id
WHERE u.email IN ('admin@learnpro.com', 'carlosjchiles@gmail.com');
