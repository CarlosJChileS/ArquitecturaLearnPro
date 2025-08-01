-- Simplificar Supabase para MVP Universitario
-- Este script elimina las políticas complejas y permite acceso fácil

-- Deshabilitar RLS en todas las tablas principales
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE courses DISABLE ROW LEVEL SECURITY;
ALTER TABLE lessons DISABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments DISABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_progress DISABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_plans DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_subscriptions DISABLE ROW LEVEL SECURITY;
ALTER TABLE categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE course_reviews DISABLE ROW LEVEL SECURITY;
ALTER TABLE certificates DISABLE ROW LEVEL SECURITY;
ALTER TABLE notifications DISABLE ROW LEVEL SECURITY;

-- Eliminar todas las políticas existentes
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Anyone can view published courses" ON courses;
DROP POLICY IF EXISTS "Instructors can manage their courses" ON courses;
DROP POLICY IF EXISTS "Anyone can view lessons of enrolled courses" ON lessons;
DROP POLICY IF EXISTS "Users can enroll in courses" ON enrollments;
DROP POLICY IF EXISTS "Users can view their enrollments" ON enrollments;
DROP POLICY IF EXISTS "Users can track their lesson progress" ON lesson_progress;
DROP POLICY IF EXISTS "Anyone can view subscription plans" ON subscription_plans;
DROP POLICY IF EXISTS "Users can view their subscriptions" ON user_subscriptions;
DROP POLICY IF EXISTS "Anyone can view categories" ON categories;
DROP POLICY IF EXISTS "Users can create reviews" ON course_reviews;
DROP POLICY IF EXISTS "Anyone can view reviews" ON course_reviews;
DROP POLICY IF EXISTS "Users can view their certificates" ON certificates;
DROP POLICY IF EXISTS "Users can view their notifications" ON notifications;

-- Crear políticas super simples (permitir todo para MVP)
-- Profiles
CREATE POLICY "Allow all operations on profiles" ON profiles FOR ALL USING (true) WITH CHECK (true);

-- Courses  
CREATE POLICY "Allow all operations on courses" ON courses FOR ALL USING (true) WITH CHECK (true);

-- Lessons
CREATE POLICY "Allow all operations on lessons" ON lessons FOR ALL USING (true) WITH CHECK (true);

-- Enrollments
CREATE POLICY "Allow all operations on enrollments" ON enrollments FOR ALL USING (true) WITH CHECK (true);

-- Lesson Progress
CREATE POLICY "Allow all operations on lesson_progress" ON lesson_progress FOR ALL USING (true) WITH CHECK (true);

-- Subscription Plans
CREATE POLICY "Allow all operations on subscription_plans" ON subscription_plans FOR ALL USING (true) WITH CHECK (true);

-- User Subscriptions
CREATE POLICY "Allow all operations on user_subscriptions" ON user_subscriptions FOR ALL USING (true) WITH CHECK (true);

-- Categories
CREATE POLICY "Allow all operations on categories" ON categories FOR ALL USING (true) WITH CHECK (true);

-- Course Reviews
CREATE POLICY "Allow all operations on course_reviews" ON course_reviews FOR ALL USING (true) WITH CHECK (true);

-- Certificates
CREATE POLICY "Allow all operations on certificates" ON certificates FOR ALL USING (true) WITH CHECK (true);

-- Notifications
CREATE POLICY "Allow all operations on notifications" ON notifications FOR ALL USING (true) WITH CHECK (true);

-- Reactivar RLS pero con políticas permisivas
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Crear función para auto-insertar perfil cuando se registra un usuario
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    'student', -- role por defecto
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para auto-crear perfil
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Simplificar configuraciones de autenticación
COMMENT ON TABLE profiles IS 'MVP: Políticas simplificadas para desarrollo universitario';
COMMENT ON TABLE courses IS 'MVP: Acceso completo sin restricciones complejas';

-- Insertar datos de prueba para MVP
INSERT INTO categories (name, description, icon) VALUES
('Programación', 'Cursos de programación y desarrollo', '💻'),
('Diseño', 'Cursos de diseño gráfico y web', '🎨'),
('Marketing', 'Cursos de marketing digital', '📈'),
('Negocios', 'Cursos de emprendimiento y negocios', '💼')
ON CONFLICT (name) DO NOTHING;

-- Crear usuario admin de prueba (contraseña: admin123)
-- Este INSERT solo funciona si el usuario no existe
DO $$
BEGIN
  -- Solo para desarrollo/MVP
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE email = 'admin@test.com') THEN
    INSERT INTO profiles (id, email, role, full_name, avatar_url)
    VALUES (
      '00000000-0000-0000-0000-000000000001',
      'admin@test.com',
      'admin',
      'Administrador MVP',
      '/placeholder.svg'
    );
  END IF;
END $$;

COMMENT ON MIGRATION IS 'Simplificación completa para MVP universitario - acceso fácil sin políticas complejas';
