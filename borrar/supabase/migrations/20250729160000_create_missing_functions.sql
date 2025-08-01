-- Crear funciones faltantes para la aplicación
-- Filename: 20250729160000_create_missing_functions.sql

-- 0. Eliminar funciones existentes que puedan tener conflictos
-- ===========================================================
DROP FUNCTION IF EXISTS public.track_student_event(uuid,text,json);
DROP FUNCTION IF EXISTS public.track_stuident_event(uuid,text,json);
DROP FUNCTION IF EXISTS public.get_user_dashboard(uuid);
DROP FUNCTION IF EXISTS public.get_user_notifications(uuid,int,boolean);
DROP FUNCTION IF EXISTS public.get_user_notifications(uuid);
DROP FUNCTION IF EXISTS public.get_user_notifications();
DROP FUNCTION IF EXISTS public.complete_course_with_exam(uuid,uuid);
DROP FUNCTION IF EXISTS public.get_course_progress(uuid,uuid);
DROP FUNCTION IF EXISTS public.update_lesson_progress(uuid,uuid,uuid,boolean,int);

-- 1. Función para obtener dashboard del usuario
-- ============================================
CREATE OR REPLACE FUNCTION public.get_user_dashboard(target_user_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result JSON;
    total_courses INT;
    completed_courses INT;
    in_progress_courses INT;
    total_time_spent INT;
BEGIN
    -- Obtener estadísticas básicas
    SELECT 
        COUNT(*),
        COUNT(CASE WHEN completed_at IS NOT NULL THEN 1 END),
        COUNT(CASE WHEN completed_at IS NULL AND progress_percentage > 0 THEN 1 END)
    INTO total_courses, completed_courses, in_progress_courses
    FROM public.course_enrollments
    WHERE user_id = target_user_id;

    -- Obtener tiempo total gastado
    SELECT COALESCE(SUM(time_spent), 0)
    INTO total_time_spent
    FROM public.lesson_progress
    WHERE user_id = target_user_id;

    -- Construir resultado JSON
    result := json_build_object(
        'total_courses', total_courses,
        'completed_courses', completed_courses,
        'in_progress_courses', in_progress_courses,
        'total_time_spent_minutes', total_time_spent,
        'completion_rate', CASE 
            WHEN total_courses > 0 THEN ROUND((completed_courses::DECIMAL / total_courses::DECIMAL) * 100, 2)
            ELSE 0 
        END
    );

    RETURN result;
END;
$$;

-- 2. Función para obtener notificaciones del usuario
-- =================================================
CREATE OR REPLACE FUNCTION public.get_user_notifications(
    target_user_id UUID,
    limit_count INT DEFAULT 10,
    include_read BOOLEAN DEFAULT FALSE
)
RETURNS TABLE (
    id UUID,
    title TEXT,
    message TEXT,
    type TEXT,
    action_url TEXT,
    read_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        n.id,
        n.title,
        n.message,
        n.type,
        n.action_url,
        n.read_at,
        n.created_at
    FROM public.notifications n
    WHERE n.user_id = target_user_id
        AND (include_read OR n.read_at IS NULL)
    ORDER BY n.created_at DESC
    LIMIT limit_count;
END;
$$;

-- 3. Función para completar curso con examen
-- ==========================================
CREATE OR REPLACE FUNCTION public.complete_course_with_exam(
    course_id_param UUID,
    user_id_param UUID
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result JSON;
    enrollment_record RECORD;
    total_lessons INT;
    completed_lessons INT;
    completion_percentage DECIMAL;
BEGIN
    -- Verificar que el usuario esté inscrito
    SELECT * INTO enrollment_record
    FROM public.course_enrollments
    WHERE user_id = user_id_param AND course_id = course_id_param;

    IF NOT FOUND THEN
        RETURN json_build_object('error', 'User not enrolled in this course');
    END IF;

    -- Obtener estadísticas de lecciones
    SELECT COUNT(*) INTO total_lessons
    FROM public.lessons
    WHERE course_id = course_id_param;

    SELECT COUNT(*) INTO completed_lessons
    FROM public.lesson_progress
    WHERE user_id = user_id_param 
        AND course_id = course_id_param 
        AND is_completed = true;

    -- Calcular porcentaje de completitud
    completion_percentage := CASE 
        WHEN total_lessons > 0 THEN (completed_lessons::DECIMAL / total_lessons::DECIMAL) * 100
        ELSE 0 
    END;

    -- Si el curso está 100% completo, marcarlo como completado
    IF completion_percentage >= 100 THEN
        UPDATE public.course_enrollments
        SET 
            completed_at = TIMEZONE('utc'::text, NOW()),
            progress_percentage = 100,
            status = 'completed',
            updated_at = TIMEZONE('utc'::text, NOW())
        WHERE user_id = user_id_param AND course_id = course_id_param;

        -- Crear certificado si no existe
        INSERT INTO public.certificates (user_id, course_id, issued_at)
        VALUES (user_id_param, course_id_param, TIMEZONE('utc'::text, NOW()))
        ON CONFLICT (user_id, course_id) DO NOTHING;

        result := json_build_object(
            'success', true,
            'completed', true,
            'completion_percentage', 100,
            'certificate_issued', true
        );
    ELSE
        -- Actualizar progreso pero no completar
        UPDATE public.course_enrollments
        SET 
            progress_percentage = completion_percentage,
            updated_at = TIMEZONE('utc'::text, NOW())
        WHERE user_id = user_id_param AND course_id = course_id_param;

        result := json_build_object(
            'success', true,
            'completed', false,
            'completion_percentage', completion_percentage,
            'remaining_lessons', total_lessons - completed_lessons
        );
    END IF;

    RETURN result;
END;
$$;

-- 4. Función para tracking de eventos de estudiantes
-- ==================================================
CREATE OR REPLACE FUNCTION public.track_student_event(
    user_id_param UUID,
    event_type_param TEXT,
    event_data_param JSON DEFAULT '{}'::JSON
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Insertar evento en la tabla de student_events
    INSERT INTO public.student_events (user_id, event_type, event_data, created_at)
    VALUES (user_id_param, event_type_param, event_data_param::jsonb, TIMEZONE('utc'::text, NOW()));

    -- También insertar en student_analytics si hay datos de curso/lección
    IF event_data_param ? 'course_id' THEN
        INSERT INTO public.student_analytics (
            user_id, 
            course_id, 
            lesson_id, 
            event_type, 
            event_data, 
            created_at
        )
        VALUES (
            user_id_param,
            (event_data_param->>'course_id')::UUID,
            CASE WHEN event_data_param ? 'lesson_id' THEN (event_data_param->>'lesson_id')::UUID ELSE NULL END,
            event_type_param,
            event_data_param::jsonb,
            TIMEZONE('utc'::text, NOW())
        );
    END IF;
END;
$$;

-- 5. Función para obtener progreso de curso
-- =========================================
CREATE OR REPLACE FUNCTION public.get_course_progress(
    course_id_param UUID,
    user_id_param UUID
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result JSON;
    total_lessons INT;
    completed_lessons INT;
    total_duration INT;
    watched_duration INT;
    enrollment_record RECORD;
BEGIN
    -- Verificar inscripción
    SELECT * INTO enrollment_record
    FROM public.course_enrollments
    WHERE user_id = user_id_param AND course_id = course_id_param;

    IF NOT FOUND THEN
        RETURN json_build_object('error', 'User not enrolled in this course');
    END IF;

    -- Obtener estadísticas
    SELECT 
        COUNT(*),
        COALESCE(SUM(duration_minutes), 0)
    INTO total_lessons, total_duration
    FROM public.lessons
    WHERE course_id = course_id_param;

    SELECT 
        COUNT(CASE WHEN is_completed THEN 1 END),
        COALESCE(SUM(watch_time_seconds), 0) / 60
    INTO completed_lessons, watched_duration
    FROM public.lesson_progress
    WHERE user_id = user_id_param AND course_id = course_id_param;

    -- Construir resultado
    result := json_build_object(
        'total_lessons', total_lessons,
        'completed_lessons', completed_lessons,
        'completion_percentage', CASE 
            WHEN total_lessons > 0 THEN ROUND((completed_lessons::DECIMAL / total_lessons::DECIMAL) * 100, 2)
            ELSE 0 
        END,
        'total_duration_minutes', total_duration,
        'watched_duration_minutes', watched_duration,
        'watch_percentage', CASE 
            WHEN total_duration > 0 THEN ROUND((watched_duration::DECIMAL / total_duration::DECIMAL) * 100, 2)
            ELSE 0 
        END,
        'enrollment_date', enrollment_record.enrolled_at,
        'completion_date', enrollment_record.completed_at,
        'status', enrollment_record.status
    );

    RETURN result;
END;
$$;

-- 6. Función para actualizar progreso de lección
-- ==============================================
CREATE OR REPLACE FUNCTION public.update_lesson_progress(
    user_id_param UUID,
    lesson_id_param UUID,
    course_id_param UUID,
    is_completed_param BOOLEAN DEFAULT FALSE,
    watch_time_seconds_param INT DEFAULT 0
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result JSON;
    course_progress_percentage DECIMAL;
BEGIN
    -- Upsert progreso de lección
    INSERT INTO public.lesson_progress (
        user_id, lesson_id, course_id, is_completed, watch_time_seconds, 
        time_spent, progress, last_accessed, completed_at, updated_at
    )
    VALUES (
        user_id_param, lesson_id_param, course_id_param, is_completed_param, watch_time_seconds_param,
        watch_time_seconds_param / 60, -- time_spent en minutos
        CASE WHEN is_completed_param THEN 100 ELSE 50 END, -- progress percentage
        TIMEZONE('utc'::text, NOW()),
        CASE WHEN is_completed_param THEN TIMEZONE('utc'::text, NOW()) ELSE NULL END,
        TIMEZONE('utc'::text, NOW())
    )
    ON CONFLICT (user_id, lesson_id)
    DO UPDATE SET
        is_completed = is_completed_param,
        watch_time_seconds = GREATEST(lesson_progress.watch_time_seconds, watch_time_seconds_param),
        time_spent = GREATEST(lesson_progress.time_spent, watch_time_seconds_param / 60),
        progress = CASE WHEN is_completed_param THEN 100 ELSE GREATEST(lesson_progress.progress, 50) END,
        last_accessed = TIMEZONE('utc'::text, NOW()),
        completed_at = CASE WHEN is_completed_param THEN TIMEZONE('utc'::text, NOW()) ELSE lesson_progress.completed_at END,
        updated_at = TIMEZONE('utc'::text, NOW());

    -- Calcular progreso del curso
    SELECT 
        CASE 
            WHEN COUNT(*) > 0 THEN 
                ROUND((COUNT(CASE WHEN lp.is_completed THEN 1 END)::DECIMAL / COUNT(*)::DECIMAL) * 100, 2)
            ELSE 0 
        END
    INTO course_progress_percentage
    FROM public.lessons l
    LEFT JOIN public.lesson_progress lp ON l.id = lp.lesson_id AND lp.user_id = user_id_param
    WHERE l.course_id = course_id_param;

    -- Actualizar progreso del curso
    UPDATE public.course_enrollments
    SET 
        progress_percentage = course_progress_percentage,
        updated_at = TIMEZONE('utc'::text, NOW())
    WHERE user_id = user_id_param AND course_id = course_id_param;

    -- Construir resultado
    result := json_build_object(
        'success', true,
        'lesson_completed', is_completed_param,
        'course_progress_percentage', course_progress_percentage,
        'watch_time_seconds', watch_time_seconds_param
    );

    RETURN result;
END;
$$;

-- 7. Trigger para actualizar updated_at automáticamente
-- ====================================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$;

-- Eliminar triggers existentes si existen
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
DROP TRIGGER IF EXISTS update_courses_updated_at ON public.courses;
DROP TRIGGER IF EXISTS update_lessons_updated_at ON public.lessons;
DROP TRIGGER IF EXISTS update_course_enrollments_updated_at ON public.course_enrollments;
DROP TRIGGER IF EXISTS update_lesson_progress_updated_at ON public.lesson_progress;
DROP TRIGGER IF EXISTS update_user_subscriptions_updated_at ON public.user_subscriptions;
DROP TRIGGER IF EXISTS update_subscribers_updated_at ON public.subscribers;

-- Aplicar trigger a tablas principales
DO $$
BEGIN
    -- Solo crear triggers si las tablas existen
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles' AND table_schema = 'public') THEN
        CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'courses' AND table_schema = 'public') THEN
        CREATE TRIGGER update_courses_updated_at BEFORE UPDATE ON public.courses FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'lessons' AND table_schema = 'public') THEN
        CREATE TRIGGER update_lessons_updated_at BEFORE UPDATE ON public.lessons FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'course_enrollments' AND table_schema = 'public') THEN
        CREATE TRIGGER update_course_enrollments_updated_at BEFORE UPDATE ON public.course_enrollments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'lesson_progress' AND table_schema = 'public') THEN
        CREATE TRIGGER update_lesson_progress_updated_at BEFORE UPDATE ON public.lesson_progress FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_subscriptions' AND table_schema = 'public') THEN
        CREATE TRIGGER update_user_subscriptions_updated_at BEFORE UPDATE ON public.user_subscriptions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'subscribers' AND table_schema = 'public') THEN
        CREATE TRIGGER update_subscribers_updated_at BEFORE UPDATE ON public.subscribers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
    END IF;
END $$;

-- Nota: Los triggers se crean con IF NOT EXISTS implícito en las versiones modernas de PostgreSQL
-- Si hay errores, simplemente se ignorarán si ya existen

COMMENT ON FUNCTION public.get_user_dashboard IS 'Obtiene estadísticas del dashboard del usuario';
COMMENT ON FUNCTION public.get_user_notifications IS 'Obtiene notificaciones del usuario';
COMMENT ON FUNCTION public.complete_course_with_exam IS 'Completa un curso y genera certificado si corresponde';
COMMENT ON FUNCTION public.track_student_event IS 'Registra eventos de actividad del estudiante';
COMMENT ON FUNCTION public.get_course_progress IS 'Obtiene progreso detallado de un curso';
COMMENT ON FUNCTION public.update_lesson_progress IS 'Actualiza progreso de lección y curso';

COMMENT ON MIGRATION IS 'Crear funciones faltantes para la aplicación MVP';
