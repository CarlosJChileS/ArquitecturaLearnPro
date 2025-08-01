-- Agregar tablas faltantes para MVP
-- Solo las tablas esenciales que no existen

-- Tabla enrollments (inscripciones)
CREATE TABLE IF NOT EXISTS enrollments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    course_id UUID NOT NULL,
    enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
    progress DECIMAL(5,2) DEFAULT 0,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(user_id, course_id)
);

-- Tabla lesson_progress (progreso de lecciones)
CREATE TABLE IF NOT EXISTS lesson_progress (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    lesson_id UUID NOT NULL,
    course_id UUID NOT NULL,
    completed BOOLEAN DEFAULT FALSE,
    progress DECIMAL(5,2) DEFAULT 0,
    time_spent INTEGER DEFAULT 0,
    completed_at TIMESTAMP WITH TIME ZONE,
    last_accessed TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(user_id, lesson_id)
);

-- Agregar columna icon a categories si no existe
ALTER TABLE categories ADD COLUMN IF NOT EXISTS icon TEXT;
ALTER TABLE categories ADD COLUMN IF NOT EXISTS color TEXT DEFAULT '#3B82F6';

-- Deshabilitar RLS para MVP (sin restricciones)
ALTER TABLE IF EXISTS categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS courses DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS lessons DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS enrollments DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS lesson_progress DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS subscription_plans DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS user_subscriptions DISABLE ROW LEVEL SECURITY;

-- Insertar categorías básicas
INSERT INTO categories (name, description, icon) VALUES
('Programación', 'Cursos de programación y desarrollo', '💻'),
('Diseño', 'Cursos de diseño gráfico y web', '🎨'),
('Marketing', 'Cursos de marketing digital', '📈'),
('Negocios', 'Cursos de emprendimiento y negocios', '💼')
ON CONFLICT (name) DO UPDATE SET 
    description = EXCLUDED.description,
    icon = COALESCE(EXCLUDED.icon, categories.icon);

COMMENT ON MIGRATION IS 'Agregar tablas faltantes para MVP universitario';
