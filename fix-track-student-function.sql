-- Crear la función que falta: track_stuident_event
-- Esta función parece ser para tracking de eventos de estudiantes

CREATE OR REPLACE FUNCTION public.track_stuident_event(
  user_id UUID,
  event_type TEXT,
  event_data JSON DEFAULT '{}'::JSON
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Por ahora, solo insertamos en una tabla de eventos si existe
  -- Si la tabla no existe, simplemente no hacemos nada
  BEGIN
    INSERT INTO public.student_events (user_id, event_type, event_data, created_at)
    VALUES (user_id, event_type, event_data, NOW());
  EXCEPTION
    WHEN undefined_table THEN
      -- Si la tabla no existe, simplemente registramos en logs
      RAISE NOTICE 'student_events table does not exist, skipping event tracking for user % event %', user_id, event_type;
  END;
END;
$$;

-- También crear la versión correctamente escrita por si acaso
CREATE OR REPLACE FUNCTION public.track_student_event(
  user_id UUID,
  event_type TEXT,
  event_data JSON DEFAULT '{}'::JSON
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Llamar a la función con el typo para mantener compatibilidad
  PERFORM public.track_stuident_event(user_id, event_type, event_data);
END;
$$;
