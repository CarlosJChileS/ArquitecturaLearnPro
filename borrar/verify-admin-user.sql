-- Verificar y actualizar usuario admin con email correcto
-- Email: carlosjchiles@gmail.com

-- 1. Primero verificar si existe el usuario
SELECT 
    user_id, 
    email, 
    full_name, 
    role, 
    created_at 
FROM profiles 
WHERE email = 'carlosjchiles@gmail.com';

-- 2. Si no existe, buscar por el email anterior
SELECT 
    user_id, 
    email, 
    full_name, 
    role, 
    created_at 
FROM profiles 
WHERE email = 'carlosbebechile7@gmail.com';

-- 3. Actualizar el email si es necesario
UPDATE profiles 
SET email = 'carlosjchiles@gmail.com' 
WHERE email = 'carlosbebechile7@gmail.com';

-- 4. Asegurar que el usuario tenga rol de admin
UPDATE profiles 
SET role = 'admin' 
WHERE email = 'carlosjchiles@gmail.com';

-- 5. Verificar el resultado final
SELECT 
    user_id, 
    email, 
    full_name, 
    role, 
    created_at 
FROM profiles 
WHERE email = 'carlosjchiles@gmail.com';
