-- Script para crear lecciones de ejemplo
-- Ejecutar en Supabase SQL Editor

-- Primero vamos a crear la tabla lessons si no existe
CREATE TABLE IF NOT EXISTS lessons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    content TEXT,
    video_url TEXT,
    duration_minutes INTEGER DEFAULT 0,
    order_index INTEGER NOT NULL DEFAULT 0,
    content_type TEXT DEFAULT 'video' CHECK (content_type IN ('video', 'text', 'quiz')),
    is_free BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_lessons_course_id ON lessons(course_id);
CREATE INDEX IF NOT EXISTS idx_lessons_order ON lessons(course_id, order_index);

-- Insertar lecciones de ejemplo para cada curso existente
DO $$
DECLARE
    course_record RECORD;
    lesson_count INTEGER := 1;
BEGIN
    -- Iterar sobre todos los cursos existentes
    FOR course_record IN SELECT id, title FROM courses WHERE is_published = true
    LOOP
        -- Insertar 3 lecciones por curso
        INSERT INTO lessons (course_id, title, description, content, video_url, duration_minutes, order_index, content_type, is_free)
        VALUES 
        (
            course_record.id,
            'Introducción a ' || course_record.title,
            'Una introducción completa al curso',
            '<h2>Bienvenido al curso</h2><p>En esta lección aprenderás los conceptos básicos y fundamentales que necesitas para comenzar tu aprendizaje.</p><h3>Objetivos de la lección:</h3><ul><li>Entender los conceptos básicos</li><li>Configurar tu entorno de trabajo</li><li>Prepararte para las siguientes lecciones</li></ul>',
            'https://www.youtube.com/embed/dQw4w9WgXcQ',
            15,
            1,
            'video',
            true
        ),
        (
            course_record.id,
            'Conceptos Fundamentales',
            'Aprende los conceptos clave del tema',
            '<h2>Conceptos Fundamentales</h2><p>En esta lección profundizaremos en los conceptos fundamentales que necesitas dominar.</p><h3>Temas a cubrir:</h3><ul><li>Definiciones importantes</li><li>Principios básicos</li><li>Mejores prácticas</li><li>Ejemplos prácticos</li></ul><p>Al final de esta lección tendrás una base sólida para continuar con el curso.</p>',
            'https://www.youtube.com/embed/dQw4w9WgXcQ',
            25,
            2,
            'video',
            false
        ),
        (
            course_record.id,
            'Práctica y Ejercicios',
            'Pon en práctica lo aprendido',
            '<h2>Práctica y Ejercicios</h2><p>Es hora de poner en práctica todo lo que has aprendido hasta ahora.</p><h3>Ejercicios incluidos:</h3><ul><li>Ejercicio práctico 1</li><li>Ejercicio práctico 2</li><li>Proyecto mini</li><li>Autoevaluación</li></ul><p>Recuerda que la práctica es fundamental para el aprendizaje efectivo.</p>',
            'https://www.youtube.com/embed/dQw4w9WgXcQ',
            30,
            3,
            'video',
            false
        );
    END LOOP;
    
    RAISE NOTICE 'Lecciones de ejemplo creadas exitosamente';
END $$;

-- Verificar los datos insertados
SELECT 
    c.title as curso,
    l.title as leccion,
    l.order_index as orden,
    l.duration_minutes as duracion,
    l.is_free as gratuita
FROM lessons l
JOIN courses c ON l.course_id = c.id
ORDER BY c.title, l.order_index;
