-- Migración para tablas de sistema y administración
-- Filename: 20250126120000_system_tables.sql

-- Tabla para backups del sistema
CREATE TABLE IF NOT EXISTS system_backups (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    tables_included TEXT[],
    include_auth BOOLEAN DEFAULT FALSE,
    format TEXT DEFAULT 'json',
    status TEXT DEFAULT 'pending',
    file_path TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla para mantenimiento del sistema
CREATE TABLE IF NOT EXISTS system_maintenance (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    type TEXT NOT NULL, -- 'cleanup', 'migration', 'update', etc.
    performed_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    details JSONB,
    status TEXT DEFAULT 'pending',
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT
);

-- Tabla para reportes generados
CREATE TABLE IF NOT EXISTS generated_reports (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    type TEXT NOT NULL, -- 'revenue', 'enrollments', 'user_activity', etc.
    period TEXT, -- 'daily', 'weekly', 'monthly', 'yearly'
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE,
    generated_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    data JSONB,
    filters JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla para sesiones de usuario (para análisis)
CREATE TABLE IF NOT EXISTS user_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    session_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    duration INTEGER, -- en segundos
    ip_address INET,
    user_agent TEXT,
    pages_visited INTEGER DEFAULT 0
);

-- Tabla para vistas de páginas (para analytics)
CREATE TABLE IF NOT EXISTS page_views (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    session_id UUID REFERENCES user_sessions(id) ON DELETE CASCADE,
    page_path TEXT NOT NULL,
    referrer TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla para configuración del sistema
CREATE TABLE IF NOT EXISTS system_config (
    key TEXT PRIMARY KEY,
    value JSONB,
    description TEXT,
    updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para optimización
CREATE INDEX IF NOT EXISTS idx_system_backups_created_by ON system_backups(created_by);
CREATE INDEX IF NOT EXISTS idx_system_backups_created_at ON system_backups(created_at);
CREATE INDEX IF NOT EXISTS idx_system_maintenance_type ON system_maintenance(type);
CREATE INDEX IF NOT EXISTS idx_system_maintenance_status ON system_maintenance(status);
CREATE INDEX IF NOT EXISTS idx_generated_reports_type ON generated_reports(type);
CREATE INDEX IF NOT EXISTS idx_generated_reports_generated_by ON generated_reports(generated_by);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_last_activity ON user_sessions(last_activity);
CREATE INDEX IF NOT EXISTS idx_page_views_user_id ON page_views(user_id);
CREATE INDEX IF NOT EXISTS idx_page_views_created_at ON page_views(created_at);

-- RLS Policies
ALTER TABLE system_backups ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_maintenance ENABLE ROW LEVEL SECURITY;
ALTER TABLE generated_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_config ENABLE ROW LEVEL SECURITY;

-- Solo administradores pueden acceder a backups del sistema
CREATE POLICY "Admin access to system_backups" ON system_backups
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- Solo administradores pueden acceder a mantenimiento del sistema
CREATE POLICY "Admin access to system_maintenance" ON system_maintenance
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- Administradores e instructores pueden acceder a reportes
CREATE POLICY "Admin and instructor access to generated_reports" ON generated_reports
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role IN ('admin', 'instructor')
        )
    );

-- Los usuarios solo pueden ver sus propias sesiones
CREATE POLICY "Users can view own sessions" ON user_sessions
    FOR SELECT USING (user_id = auth.uid());

-- Los administradores pueden ver todas las sesiones
CREATE POLICY "Admins can view all sessions" ON user_sessions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- Los usuarios pueden ver sus propias vistas de página
CREATE POLICY "Users can view own page views" ON page_views
    FOR SELECT USING (user_id = auth.uid());

-- Los administradores pueden ver todas las vistas de página
CREATE POLICY "Admins can view all page views" ON page_views
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- Solo administradores pueden modificar la configuración del sistema
CREATE POLICY "Admin access to system_config" ON system_config
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- Funciones para triggers automáticos
CREATE OR REPLACE FUNCTION update_user_session_activity()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE user_sessions 
    SET last_activity = NOW(), 
        duration = EXTRACT(EPOCH FROM (NOW() - session_start))::INTEGER
    WHERE user_id = NEW.user_id 
    AND session_start::DATE = NOW()::DATE;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar actividad de sesión cuando hay nueva vista de página
CREATE TRIGGER update_session_on_page_view
    AFTER INSERT ON page_views
    FOR EACH ROW
    EXECUTE FUNCTION update_user_session_activity();

-- Configuraciones por defecto del sistema
INSERT INTO system_config (key, value, description) VALUES
    ('maintenance_mode', 'false', 'Activa o desactiva el modo de mantenimiento'),
    ('max_file_upload_size', '10485760', 'Tamaño máximo de archivo para subir (bytes)'),
    ('session_timeout', '3600', 'Tiempo de expiración de sesión (segundos)'),
    ('backup_retention_days', '30', 'Días para retener backups automáticos'),
    ('analytics_retention_days', '365', 'Días para retener datos de analytics')
ON CONFLICT (key) DO NOTHING;
