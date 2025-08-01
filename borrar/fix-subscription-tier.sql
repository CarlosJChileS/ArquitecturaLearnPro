-- SOLUCIÓN PARA EL ERROR DE subscription_tier_check

-- 1. Verificar el constraint actual
SELECT constraint_name, check_clause 
FROM information_schema.check_constraints 
WHERE constraint_name = 'courses_subscription_tier_check';

-- 2. Eliminar el constraint existente
ALTER TABLE public.courses DROP CONSTRAINT IF EXISTS courses_subscription_tier_check;

-- 3. Crear nuevo constraint con valores correctos
ALTER TABLE public.courses 
ADD CONSTRAINT courses_subscription_tier_check 
CHECK (subscription_tier IN ('free', 'basic', 'premium'));

-- 4. Verificar que el constraint se creó correctamente
SELECT constraint_name, check_clause 
FROM information_schema.check_constraints 
WHERE constraint_name = 'courses_subscription_tier_check';

-- 5. Probar inserción con 'free'
INSERT INTO public.courses (
  title, 
  description, 
  price, 
  instructor_id,
  subscription_tier, 
  is_published
) VALUES (
  'CURSO DE PRUEBA CORREGIDO', 
  'Prueba con subscription_tier corregido', 
  0,
  (SELECT user_id FROM public.profiles LIMIT 1),
  'free', 
  false
) RETURNING id, title, subscription_tier;

-- 6. Limpiar prueba
DELETE FROM public.courses WHERE title = 'CURSO DE PRUEBA CORREGIDO';

-- 7. Mensaje de confirmación
SELECT 'CONSTRAINT DE SUBSCRIPTION_TIER CORREGIDO' as status;
