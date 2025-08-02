-- ===================================================================
-- MIGRACIÓN: Insertar preguntas de examen
-- Descripción: Agrega preguntas al examen existente que no tiene preguntas
-- Fecha: 2025-08-01
-- ===================================================================

-- Verificar que el examen existe
DO $$
DECLARE
    exam_uuid UUID := '5e16f527-eb92-409f-8c16-35ed0c189f52';
    course_uuid UUID := 'c4a5072b-8b13-4371-a269-c415086884b9';
BEGIN
    -- Verificar si el examen existe
    IF NOT EXISTS (SELECT 1 FROM exams WHERE id = exam_uuid) THEN
        RAISE EXCEPTION 'El examen % no existe', exam_uuid;
    END IF;

    -- Eliminar preguntas existentes por si acaso
    DELETE FROM exam_questions WHERE exam_id = exam_uuid;
    
    -- Insertar preguntas para el examen
    INSERT INTO exam_questions (
        exam_id,
        question_text,
        question_type,
        options,
        correct_answer,
        points,
        order_index
    ) VALUES
    -- Pregunta 1: Multiple Choice - HTML
    (
        exam_uuid,
        '¿Cuál es la etiqueta HTML correcta para crear un enlace?',
        'multiple_choice',
        '["<link>", "<a>", "<href>", "<url>"]',
        '<a>',
        2,
        1
    ),
    
    -- Pregunta 2: Multiple Choice - CSS
    (
        exam_uuid,
        '¿Qué propiedad CSS se usa para cambiar el color de fondo?',
        'multiple_choice',
        '["background-color", "color", "bg-color", "background"]',
        'background-color',
        2,
        2
    ),
    
    -- Pregunta 3: Multiple Choice - JavaScript
    (
        exam_uuid,
        '¿Cuál es la forma correcta de declarar una variable en JavaScript ES6?',
        'multiple_choice',
        '["var nombre", "let nombre", "const nombre", "Todas las anteriores"]',
        'Todas las anteriores',
        3,
        3
    ),
    
    -- Pregunta 4: Multiple Select - Tecnologías Web
    (
        exam_uuid,
        '¿Cuáles de las siguientes son tecnologías de frontend? (Selecciona todas las correctas)',
        'multiple_select',
        '["HTML", "CSS", "JavaScript", "React", "Node.js", "MongoDB"]',
        '["HTML", "CSS", "JavaScript", "React"]',
        4,
        4
    ),
    
    -- Pregunta 5: Multiple Choice - React
    (
        exam_uuid,
        '¿Qué es JSX en React?',
        'multiple_choice',
        '["Un framework", "Una sintaxis que mezcla JavaScript y HTML", "Una base de datos", "Un servidor web"]',
        'Una sintaxis que mezcla JavaScript y HTML',
        3,
        5
    ),
    
    -- Pregunta 6: Text - Definición
    (
        exam_uuid,
        'Explica brevemente qué es una API REST y menciona al menos 2 métodos HTTP.',
        'text',
        NULL,
        'Una API REST es un estilo de arquitectura para servicios web que usa métodos HTTP como GET, POST, PUT, DELETE para interactuar con recursos.',
        4,
        6
    ),
    
    -- Pregunta 7: Multiple Choice - Base de Datos
    (
        exam_uuid,
        '¿Qué significa SQL?',
        'multiple_choice',
        '["Structured Query Language", "Simple Query Language", "Standard Query Language", "System Query Language"]',
        'Structured Query Language',
        2,
        7
    ),
    
    -- Pregunta 8: Multiple Select - Herramientas de Desarrollo
    (
        exam_uuid,
        '¿Cuáles de estas son herramientas de control de versiones? (Selecciona todas las correctas)',
        'multiple_select',
        '["Git", "GitHub", "SVN", "Mercurial", "VS Code", "npm"]',
        '["Git", "SVN", "Mercurial"]',
        3,
        8
    ),
    
    -- Pregunta 9: Multiple Choice - Web Development
    (
        exam_uuid,
        '¿Qué es responsive design?',
        'multiple_choice',
        '["Diseño que responde rápido", "Diseño que se adapta a diferentes tamaños de pantalla", "Diseño con animaciones", "Diseño con colores brillantes"]',
        'Diseño que se adapta a diferentes tamaños de pantalla',
        3,
        9
    ),
    
    -- Pregunta 10: Text - Experiencia Personal
    (
        exam_uuid,
        'Describe un proyecto web que te gustaría desarrollar y explica qué tecnologías usarías.',
        'text',
        NULL,
        'Respuesta abierta: debería mencionar un tipo de proyecto (ej: e-commerce, blog) y tecnologías relevantes (HTML, CSS, JS, framework, backend, BD).',
        5,
        10
    );

    -- Actualizar la tabla exams (solo las columnas que existen)
    UPDATE exams 
    SET 
        updated_at = NOW()
    WHERE id = exam_uuid;

    RAISE NOTICE 'Se insertaron 10 preguntas para el examen: %', exam_uuid;
    RAISE NOTICE 'Examen actualizado correctamente';
END $$;

-- Verificar que las preguntas se insertaron correctamente
SELECT 
    eq.order_index,
    eq.question_text,
    eq.question_type,
    eq.points,
    eq.options
FROM exam_questions eq
WHERE eq.exam_id = '5e16f527-eb92-409f-8c16-35ed0c189f52'
ORDER BY eq.order_index;

-- Verificar el examen actualizado
SELECT 
    id,
    title,
    description,
    passing_score,
    max_attempts,
    time_limit_minutes,
    is_active
FROM exams 
WHERE id = '5e16f527-eb92-409f-8c16-35ed0c189f52';
