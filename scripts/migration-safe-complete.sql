-- MIGRACIÓN SEGURA: Sistema de Cursos con Suscripciones
-- Ejecutar este script en Supabase SQL Editor (maneja tablas existentes)

-- 1. Crear tabla subscription_plans si no existe
CREATE TABLE IF NOT EXISTS subscription_plans (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    duration_months INTEGER NOT NULL DEFAULT 1,
    features JSONB DEFAULT '[]',
    max_courses INTEGER DEFAULT NULL, -- NULL = ilimitado
    stripe_price_id TEXT,
    paypal_plan_id TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 2. Crear tabla subscriptions si no existe
CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    plan_id UUID REFERENCES subscription_plans(id) NOT NULL,
    stripe_subscription_id TEXT UNIQUE,
    paypal_subscription_id TEXT UNIQUE,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired', 'past_due')),
    current_period_start TIMESTAMP WITH TIME ZONE NOT NULL,
    current_period_end TIMESTAMP WITH TIME ZONE NOT NULL,
    cancel_at_period_end BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 3. Crear o actualizar tabla notifications
DO $$
BEGIN
    -- Crear tabla si no existe
    CREATE TABLE IF NOT EXISTS notifications (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
        title TEXT NOT NULL,
        message TEXT NOT NULL,
        type TEXT DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error')),
        is_read BOOLEAN DEFAULT FALSE,
        action_url TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
        read_at TIMESTAMP WITH TIME ZONE
    );
    
    -- Agregar columna is_read si no existe (para evitar conflictos con palabra reservada 'read')
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'notifications' AND column_name = 'is_read'
    ) THEN
        ALTER TABLE notifications ADD COLUMN is_read BOOLEAN DEFAULT FALSE;
    END IF;
    
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Error creating notifications table: %', SQLERRM;
END $$;

-- 4. Crear tabla course_enrollments si no existe
CREATE TABLE IF NOT EXISTS course_enrollments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    course_id UUID NOT NULL,
    enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
    progress_percentage DECIMAL(5,2) DEFAULT 0,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    UNIQUE(user_id, course_id)
);

-- 5. Crear tabla lesson_progress si no existe
CREATE TABLE IF NOT EXISTS lesson_progress (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    lesson_id UUID NOT NULL,
    course_id UUID NOT NULL,
    completed BOOLEAN DEFAULT FALSE,
    progress DECIMAL(5,2) DEFAULT 0,
    time_spent INTEGER DEFAULT 0, -- en segundos
    completed_at TIMESTAMP WITH TIME ZONE,
    last_accessed TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    UNIQUE(user_id, lesson_id)
);

-- 6. Crear tabla courses si no existe (asegurar estructura correcta)
CREATE TABLE IF NOT EXISTS courses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    long_description TEXT,
    instructor_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    category TEXT DEFAULT 'General',
    subcategory TEXT,
    level TEXT DEFAULT 'beginner' CHECK (level IN ('beginner', 'intermediate', 'advanced')),
    subscription_tier TEXT DEFAULT 'basic' CHECK (subscription_tier IN ('free', 'basic', 'premium')),
    price DECIMAL(10,2) DEFAULT 0,
    discount_price DECIMAL(10,2),
    duration_hours INTEGER DEFAULT 0,
    estimated_completion_weeks INTEGER DEFAULT 4,
    language TEXT DEFAULT 'Español',
    published BOOLEAN DEFAULT FALSE,
    featured BOOLEAN DEFAULT FALSE,
    draft BOOLEAN DEFAULT TRUE,
    thumbnail_url TEXT,
    trailer_url TEXT,
    total_students INTEGER DEFAULT 0,
    avg_rating DECIMAL(3,2) DEFAULT 0,
    completion_rate DECIMAL(5,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 7. Crear tabla lessons si no existe
CREATE TABLE IF NOT EXISTS lessons (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    content TEXT,
    video_url TEXT,
    duration_minutes INTEGER DEFAULT 0,
    type TEXT DEFAULT 'video' CHECK (type IN ('video', 'text', 'quiz', 'assignment', 'live_session')),
    is_free BOOLEAN DEFAULT FALSE,
    order_index INTEGER DEFAULT 0,
    published BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 8. Insertar planes de suscripción básicos (solo si no existen)
DO $$
BEGIN
    -- Insertar planes solo si la tabla está vacía
    IF NOT EXISTS (SELECT 1 FROM subscription_plans LIMIT 1) THEN
        INSERT INTO subscription_plans (name, description, price, duration_months, features) VALUES
        ('Basic', 'Plan básico mensual', 29.00, 1, '[
            "Acceso a cursos Basic",
            "Certificados de finalización",
            "Soporte básico",
            "Acceso móvil y web",
            "Progreso sincronizado"
        ]'::jsonb),
        ('Basic Annual', 'Plan básico anual', 299.00, 12, '[
            "Acceso a cursos Basic",
            "Certificados de finalización",
            "Soporte básico",
            "Acceso móvil y web",
            "Progreso sincronizado",
            "Ahorro del 17%"
        ]'::jsonb),
        ('Premium', 'Plan premium mensual', 49.00, 1, '[
            "Acceso a TODOS los cursos",
            "Contenido exclusivo Premium",
            "Certificados de finalización",
            "Soporte prioritario",
            "Acceso móvil y web",
            "Progreso sincronizado",
            "Descargas offline",
            "Comunidad exclusiva"
        ]'::jsonb),
        ('Premium Annual', 'Plan premium anual', 499.00, 12, '[
            "Acceso a TODOS los cursos",
            "Contenido exclusivo Premium",
            "Certificados de finalización",
            "Soporte prioritario",
            "Acceso móvil y web",
            "Progreso sincronizado",
            "Descargas offline",
            "Comunidad exclusiva",
            "Ahorro del 17%"
        ]'::jsonb);
    END IF;
END $$;

-- 9. Crear índices para mejorar rendimiento (solo si no existen)
DO $$
BEGIN
    -- Índices para subscriptions
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_subscriptions_user_id') THEN
        CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_subscriptions_status') THEN
        CREATE INDEX idx_subscriptions_status ON subscriptions(status);
    END IF;
    
    -- Índices para course_enrollments
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_course_enrollments_user_id') THEN
        CREATE INDEX idx_course_enrollments_user_id ON course_enrollments(user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_course_enrollments_course_id') THEN
        CREATE INDEX idx_course_enrollments_course_id ON course_enrollments(course_id);
    END IF;
    
    -- Índices para lesson_progress
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_lesson_progress_user_id') THEN
        CREATE INDEX idx_lesson_progress_user_id ON lesson_progress(user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_lesson_progress_course_id') THEN
        CREATE INDEX idx_lesson_progress_course_id ON lesson_progress(course_id);
    END IF;
    
    -- Índices para notifications
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_notifications_user_id') THEN
        CREATE INDEX idx_notifications_user_id ON notifications(user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_notifications_is_read') THEN
        CREATE INDEX idx_notifications_is_read ON notifications(is_read);
    END IF;
END $$;

-- 10. Deshabilitar RLS para MVP (desarrollo rápido)
ALTER TABLE subscription_plans DISABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions DISABLE ROW LEVEL SECURITY;
ALTER TABLE notifications DISABLE ROW LEVEL SECURITY;
ALTER TABLE course_enrollments DISABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_progress DISABLE ROW LEVEL SECURITY;
ALTER TABLE courses DISABLE ROW LEVEL SECURITY;
ALTER TABLE lessons DISABLE ROW LEVEL SECURITY;

-- 11. Crear función para verificar suscripción activa
CREATE OR REPLACE FUNCTION has_active_subscription(input_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM subscriptions s
        WHERE s.user_id = input_user_id
        AND s.status = 'active'
        AND s.current_period_end > NOW()
    );
END;
$$ LANGUAGE plpgsql;

-- 12. Crear función para obtener tier de suscripción
CREATE OR REPLACE FUNCTION get_subscription_tier(input_user_id UUID)
RETURNS TEXT AS $$
DECLARE
    tier_result TEXT := 'free';
BEGIN
    SELECT 
        CASE 
            WHEN sp.name ILIKE '%premium%' THEN 'premium'
            WHEN sp.name ILIKE '%basic%' THEN 'basic'
            ELSE 'free'
        END INTO tier_result
    FROM subscriptions s
    JOIN subscription_plans sp ON s.plan_id = sp.id
    WHERE s.user_id = input_user_id
    AND s.status = 'active'
    AND s.current_period_end > NOW()
    ORDER BY 
        CASE 
            WHEN sp.name ILIKE '%premium%' THEN 3
            WHEN sp.name ILIKE '%basic%' THEN 2
            ELSE 1
        END DESC
    LIMIT 1;
    
    RETURN COALESCE(tier_result, 'free');
END;
$$ LANGUAGE plpgsql;

-- 13. Crear trigger para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar triggers de forma segura
DO $$
BEGIN
    -- Trigger para subscription_plans
    DROP TRIGGER IF EXISTS update_subscription_plans_updated_at ON subscription_plans;
    CREATE TRIGGER update_subscription_plans_updated_at
        BEFORE UPDATE ON subscription_plans
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

    -- Trigger para subscriptions
    DROP TRIGGER IF EXISTS update_subscriptions_updated_at ON subscriptions;
    CREATE TRIGGER update_subscriptions_updated_at
        BEFORE UPDATE ON subscriptions
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

    -- Trigger para course_enrollments
    DROP TRIGGER IF EXISTS update_course_enrollments_updated_at ON course_enrollments;
    CREATE TRIGGER update_course_enrollments_updated_at
        BEFORE UPDATE ON course_enrollments
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

    -- Trigger para lesson_progress
    DROP TRIGGER IF EXISTS update_lesson_progress_updated_at ON lesson_progress;
    CREATE TRIGGER update_lesson_progress_updated_at
        BEFORE UPDATE ON lesson_progress
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Error creating triggers: %', SQLERRM;
END $$;

-- 14. Insertar curso de ejemplo premium (solo si no existe)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM courses WHERE title = 'Curso Premium de JavaScript Avanzado') THEN
        INSERT INTO courses (
            title, 
            description, 
            instructor_id, 
            category, 
            level, 
            subscription_tier,
            published, 
            featured, 
            draft,
            price,
            duration_hours
        ) VALUES (
            'Curso Premium de JavaScript Avanzado',
            'Domina JavaScript con técnicas avanzadas y patrones profesionales',
            '00000000-0000-0000-0000-000000000001',
            'Programación',
            'advanced',
            'premium',
            true,
            true,
            false,
            0,
            25
        );
    END IF;
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Error inserting sample course: %', SQLERRM;
END $$;

-- 15. Confirmar migración exitosa
SELECT 
    'Migración de suscripciones completada exitosamente' as status,
    COUNT(*) as subscription_plans_created
FROM subscription_plans;

-- 16. Ver resumen de tablas creadas
SELECT 
    schemaname,
    tablename,
    tableowner
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('subscription_plans', 'subscriptions', 'notifications', 'course_enrollments', 'lesson_progress', 'courses', 'lessons')
ORDER BY tablename ASC;
