-- ===================================================================
-- MIGRACIÓN: Insertar preguntas de examen para UX/UI (EXAMEN CORRECTO)
-- Descripción: Agrega preguntas al examen REAL de UX/UI
-- Fecha: 2025-08-01
-- ===================================================================

-- Verificar que el examen existe
DO $$
DECLARE
    exam_uuid UUID := 'fb5af6a4-dc92-4088-9e49-afe31c277999';
    course_uuid UUID := 'cc2a1a6e-8296-4e4c-89d8-a191b4571aaf';
BEGIN
    -- Verificar si el examen existe
    IF NOT EXISTS (SELECT 1 FROM exams WHERE id = exam_uuid) THEN
        RAISE EXCEPTION 'El examen % no existe', exam_uuid;
    END IF;

    -- Actualizar el examen con título y descripción
    UPDATE exams 
    SET 
        title = 'Examen Final de UX/UI Design',
        description = 'Evalúa tus conocimientos en diseño de experiencia e interfaz de usuario.',
        updated_at = NOW()
    WHERE id = exam_uuid;

    -- Eliminar preguntas existentes por si acaso
    DELETE FROM exam_questions WHERE exam_id = exam_uuid;
    
    -- Insertar preguntas para el examen de UX/UI
    INSERT INTO exam_questions (
        exam_id,
        question_text,
        question_type,
        options,
        correct_answer,
        points,
        order_index
    ) VALUES
    -- Pregunta 1: UX Básico
    (
        exam_uuid,
        '¿Qué significa UX en diseño?',
        'multiple_choice',
        '["User Experience", "User Extension", "Universal Experience", "User Execution"]',
        'User Experience',
        2,
        1
    ),
    
    -- Pregunta 2: UI vs UX
    (
        exam_uuid,
        '¿Cuál es la principal diferencia entre UX y UI?',
        'multiple_choice',
        '["UX se enfoca en la apariencia, UI en la funcionalidad", "UX se enfoca en la experiencia del usuario, UI en la interfaz visual", "No hay diferencia", "UX es para móviles, UI para web"]',
        'UX se enfoca en la experiencia del usuario, UI en la interfaz visual',
        3,
        2
    ),
    
    -- Pregunta 3: Proceso de Diseño
    (
        exam_uuid,
        '¿Cuál es el primer paso en el proceso de diseño UX?',
        'multiple_choice',
        '["Crear wireframes", "Investigación del usuario", "Diseñar prototipos", "Programar la aplicación"]',
        'Investigación del usuario',
        2,
        3
    ),
    
    -- Pregunta 4: Herramientas de Diseño
    (
        exam_uuid,
        '¿Cuáles de las siguientes son herramientas populares para diseño UI/UX? (Selecciona todas las correctas)',
        'multiple_select',
        '["Figma", "Adobe XD", "Sketch", "Photoshop", "Microsoft Word", "Excel"]',
        '["Figma", "Adobe XD", "Sketch", "Photoshop"]',
        4,
        4
    ),
    
    -- Pregunta 5: Wireframes
    (
        exam_uuid,
        '¿Qué es un wireframe?',
        'multiple_choice',
        '["Un prototipo funcional", "Un esquema básico de la estructura de una página", "Una imagen de alta calidad", "Un código HTML"]',
        'Un esquema básico de la estructura de una página',
        3,
        5
    ),
    
    -- Pregunta 6: Principios de Diseño
    (
        exam_uuid,
        'Explica brevemente qué es la "jerarquía visual" en diseño UI y menciona 2 técnicas para crearla.',
        'text',
        NULL,
        'La jerarquía visual es la organización de elementos para guiar la atención del usuario. Se puede crear usando: tamaño, color, contraste, posición, tipografía, espaciado.',
        4,
        6
    ),
    
    -- Pregunta 7: Usabilidad
    (
        exam_uuid,
        '¿Qué es la usabilidad en UX?',
        'multiple_choice',
        '["La belleza del diseño", "La facilidad de uso de un producto", "El número de usuarios", "El costo del desarrollo"]',
        'La facilidad de uso de un producto',
        2,
        7
    ),
    
    -- Pregunta 8: Testing de Usuario
    (
        exam_uuid,
        '¿Cuáles son métodos válidos para testing de usuario? (Selecciona todas las correctas)',
        'multiple_select',
        '["A/B Testing", "Encuestas", "Entrevistas", "Análisis de métricas", "Adivinanza", "Copiar la competencia"]',
        '["A/B Testing", "Encuestas", "Entrevistas", "Análisis de métricas"]',
        3,
        8
    ),
    
    -- Pregunta 9: Design System
    (
        exam_uuid,
        '¿Qué es un Design System?',
        'multiple_choice',
        '["Un software de diseño", "Un conjunto de reglas y componentes reutilizables", "Una metodología de programación", "Un tipo de base de datos"]',
        'Un conjunto de reglas y componentes reutilizables',
        3,
        9
    ),
    
    -- Pregunta 10: Proyecto Personal
    (
        exam_uuid,
        'Describe brevemente cómo diseñarías la experiencia de usuario para una app móvil de delivery de comida. Menciona al menos 3 aspectos importantes.',
        'text',
        NULL,
        'Respuesta abierta: debería incluir aspectos como investigación de usuarios, flujo de navegación simple, búsqueda eficiente, proceso de pago claro, seguimiento del pedido, diseño responsive.',
        5,
        10
    );

    RAISE NOTICE 'Se insertaron 10 preguntas para el examen de UX/UI: %', exam_uuid;
    RAISE NOTICE 'Examen de UX/UI actualizado correctamente con título y descripción';
END $$;

-- Verificar que las preguntas se insertaron correctamente
SELECT 
    eq.order_index,
    eq.question_text,
    eq.question_type,
    eq.points,
    eq.options
FROM exam_questions eq
WHERE eq.exam_id = 'fb5af6a4-dc92-4088-9e49-afe31c277999'
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
WHERE id = 'fb5af6a4-dc92-4088-9e49-afe31c277999';
