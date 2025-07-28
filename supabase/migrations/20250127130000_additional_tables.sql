-- Migración para tablas adicionales necesarias para las Edge Functions
-- Filename: 20250127130000_additional_tables.sql

-- Tabla para logs de webhooks
CREATE TABLE IF NOT EXISTS webhook_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    webhook_type TEXT NOT NULL,
    payload JSONB,
    status TEXT DEFAULT 'pending',
    processed_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla para eventos de usuario
CREATE TABLE IF NOT EXISTS user_events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL,
    event_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla para preferencias de usuario
CREATE TABLE IF NOT EXISTS user_preferences (
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email_notifications BOOLEAN DEFAULT TRUE,
    course_reminders BOOLEAN DEFAULT TRUE,
    marketing_emails BOOLEAN DEFAULT FALSE,
    newsletter BOOLEAN DEFAULT TRUE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla para recordatorios
CREATE TABLE IF NOT EXISTS reminders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    reminder_type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    scheduled_for TIMESTAMP WITH TIME ZONE NOT NULL,
    sent_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla para notificaciones
CREATE TABLE IF NOT EXISTS notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT DEFAULT 'info',
    action_url TEXT,
    read_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla para suscriptores
CREATE TABLE IF NOT EXISTS subscribers (
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT NOT NULL,
    stripe_customer_id TEXT,
    subscribed BOOLEAN DEFAULT FALSE,
    subscription_tier TEXT,
    subscription_end TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla para inscripciones de cursos
CREATE TABLE IF NOT EXISTS course_enrollments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(user_id, course_id)
);

-- Tabla mejorada para categorías si no existe
CREATE TABLE IF NOT EXISTS categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    icon TEXT,
    color TEXT DEFAULT '#3b82f6',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para optimización
CREATE INDEX IF NOT EXISTS idx_webhook_logs_type ON webhook_logs(webhook_type);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_status ON webhook_logs(status);
CREATE INDEX IF NOT EXISTS idx_user_events_user_id ON user_events(user_id);
CREATE INDEX IF NOT EXISTS idx_user_events_type ON user_events(event_type);
CREATE INDEX IF NOT EXISTS idx_reminders_user_id ON reminders(user_id);
CREATE INDEX IF NOT EXISTS idx_reminders_scheduled_for ON reminders(scheduled_for);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read_at ON notifications(read_at);
CREATE INDEX IF NOT EXISTS idx_subscribers_email ON subscribers(email);
CREATE INDEX IF NOT EXISTS idx_course_enrollments_user_id ON course_enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_course_enrollments_course_id ON course_enrollments(course_id);

-- RLS Policies
ALTER TABLE webhook_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Solo administradores pueden ver webhook logs
CREATE POLICY "Admin access to webhook_logs" ON webhook_logs
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- Los usuarios pueden ver sus propios eventos
CREATE POLICY "Users can view own events" ON user_events
    FOR SELECT USING (user_id = auth.uid());

-- Los administradores pueden ver todos los eventos
CREATE POLICY "Admins can view all events" ON user_events
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- Los usuarios pueden gestionar sus propias preferencias
CREATE POLICY "Users can manage own preferences" ON user_preferences
    FOR ALL USING (user_id = auth.uid());

-- Los usuarios pueden ver sus propios recordatorios
CREATE POLICY "Users can view own reminders" ON reminders
    FOR SELECT USING (user_id = auth.uid());

-- Los administradores pueden gestionar todos los recordatorios
CREATE POLICY "Admins can manage all reminders" ON reminders
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- Los usuarios pueden ver sus propias notificaciones
CREATE POLICY "Users can view own notifications" ON notifications
    FOR SELECT USING (user_id = auth.uid());

-- Los usuarios pueden marcar sus notificaciones como leídas
CREATE POLICY "Users can update own notifications" ON notifications
    FOR UPDATE USING (user_id = auth.uid());

-- Los administradores pueden gestionar todos los suscriptores
CREATE POLICY "Admin access to subscribers" ON subscribers
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- Los usuarios pueden ver su propia información de suscripción
CREATE POLICY "Users can view own subscription" ON subscribers
    FOR SELECT USING (user_id = auth.uid());

-- Los usuarios pueden ver sus propias inscripciones
CREATE POLICY "Users can view own enrollments" ON course_enrollments
    FOR SELECT USING (user_id = auth.uid());

-- Los instructores pueden ver inscripciones de sus cursos
CREATE POLICY "Instructors can view course enrollments" ON course_enrollments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM courses 
            WHERE courses.id = course_enrollments.course_id 
            AND courses.instructor_id = auth.uid()
        )
    );

-- Los administradores pueden gestionar todas las inscripciones
CREATE POLICY "Admins can manage all enrollments" ON course_enrollments
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- Todos pueden ver las categorías
CREATE POLICY "Everyone can view categories" ON categories
    FOR SELECT USING (true);

-- Solo administradores pueden gestionar categorías
CREATE POLICY "Admin access to categories" ON categories
    FOR INSERT, UPDATE, DELETE USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- Funciones auxiliares para Edge Functions
CREATE OR REPLACE FUNCTION get_pending_reminders()
RETURNS TABLE (
    id UUID,
    user_id UUID,
    course_id UUID,
    reminder_type TEXT,
    title TEXT,
    message TEXT,
    scheduled_for TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        r.id,
        r.user_id,
        r.course_id,
        r.reminder_type,
        r.title,
        r.message,
        r.scheduled_for
    FROM reminders r
    WHERE r.scheduled_for <= NOW()
    AND r.sent_at IS NULL
    ORDER BY r.scheduled_for ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION mark_reminder_sent(reminder_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE reminders 
    SET sent_at = NOW() 
    WHERE id = reminder_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION create_notification(
    target_user_id UUID,
    notification_title TEXT,
    notification_message TEXT,
    notification_type TEXT DEFAULT 'info',
    action_url TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    notification_id UUID;
BEGIN
    INSERT INTO notifications (user_id, title, message, type, action_url)
    VALUES (target_user_id, notification_title, notification_message, notification_type, action_url)
    RETURNING id INTO notification_id;
    
    RETURN notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION create_reminder(
    target_user_id UUID,
    reminder_type TEXT,
    reminder_title TEXT,
    reminder_message TEXT,
    scheduled_for TIMESTAMP WITH TIME ZONE,
    course_id UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    reminder_id UUID;
BEGIN
    INSERT INTO reminders (user_id, course_id, reminder_type, title, message, scheduled_for)
    VALUES (target_user_id, course_id, reminder_type, reminder_title, reminder_message, scheduled_for)
    RETURNING id INTO reminder_id;
    
    RETURN reminder_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Insertar categorías por defecto
INSERT INTO categories (name, description, icon, color) VALUES
    ('Programación', 'Cursos de desarrollo de software y programación', 'code', '#3b82f6'),
    ('Diseño', 'Cursos de diseño gráfico, UI/UX y creatividad', 'palette', '#f59e0b'),
    ('Marketing', 'Cursos de marketing digital y estrategias de ventas', 'trending-up', '#10b981'),
    ('Negocios', 'Cursos de gestión empresarial y emprendimiento', 'briefcase', '#8b5cf6'),
    ('Datos', 'Cursos de análisis de datos y ciencia de datos', 'bar-chart-2', '#ef4444'),
    ('Idiomas', 'Cursos de aprendizaje de idiomas', 'globe', '#06b6d4')
ON CONFLICT (name) DO NOTHING;
