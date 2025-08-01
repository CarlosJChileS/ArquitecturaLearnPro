-- La tabla profiles ya existe, solo necesitamos ajustar permisos y crear el admin

-- Verificar y actualizar constraints si es necesario
ALTER TABLE public.profiles 
ALTER COLUMN role SET DEFAULT 'student';

-- Agregar constraint si no existe
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'profiles_role_check' 
    AND table_name = 'profiles'
  ) THEN
    ALTER TABLE public.profiles 
    ADD CONSTRAINT profiles_role_check 
    CHECK (role IN ('student', 'instructor', 'admin'));
  END IF;
END $$;

-- Crear índices si no existen
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- Verificar que RLS esté habilitado
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Eliminar políticas existentes que puedan causar conflictos
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

-- Crear políticas más permisivas para development
CREATE POLICY "Allow all for authenticated users" ON public.profiles
    FOR ALL USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

-- Política específica para permitir inserts
CREATE POLICY "Allow profile creation" ON public.profiles
    FOR INSERT WITH CHECK (true);

-- Política específica para permitir reads
CREATE POLICY "Allow profile reading" ON public.profiles
    FOR SELECT USING (true);

-- Política específica para permitir updates
CREATE POLICY "Allow profile updates" ON public.profiles
    FOR UPDATE USING (true);

-- Crear perfil de administrador si no existe (usando INSERT con ON CONFLICT)
INSERT INTO public.profiles (user_id, full_name, role, email, created_at, updated_at)
SELECT 
    id,
    'Carlos J. Chile S.',
    'admin',
    email,
    NOW(),
    NOW()
FROM auth.users 
WHERE email = 'carlosjchiles@gmail.com'
ON CONFLICT (user_id) DO UPDATE SET
    role = 'admin',
    full_name = 'Carlos J. Chile S.',
    updated_at = NOW();

-- Verificar que se creó correctamente
SELECT 
    p.id,
    p.user_id,
    u.email,
    p.full_name,
    p.role,
    p.created_at
FROM public.profiles p
JOIN auth.users u ON p.user_id = u.id
WHERE u.email = 'carlosjchiles@gmail.com';

-- Mostrar información de debug
SELECT 
    'Profiles table info' as info,
    COUNT(*) as total_profiles,
    COUNT(CASE WHEN role = 'admin' THEN 1 END) as admin_count
FROM public.profiles;

-- Verificar políticas RLS
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'profiles';
