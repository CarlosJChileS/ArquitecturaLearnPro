-- ===================================================================
-- MIGRACIÓN: Insertar preguntas para examen UX/UI existente
-- Descripción: Agrega preguntas al examen de UX/UI que no tiene preguntas
-- Fecha: 2025-08-01
-- ===================================================================

-- Insertar preguntas para el examen UX/UI existente
DO $$
DECLARE
    uxui_exam_uuid UUID := '143955ea-ab13-4988-84d8-392e698faeb2';
    uxui_course_uuid UUID := 'cc2a1a6e-8296-4e4c-89d8-a191b4571aaf';
BEGIN
    -- Verificar que el examen existe
    IF NOT EXISTS (SELECT 1 FROM exams WHERE id = uxui_exam_uuid) THEN
        RAISE EXCEPTION 'El examen % no existe', uxui_exam_uuid;
    END IF;

    -- Eliminar preguntas existentes por si acaso
    DELETE FROM exam_questions WHERE exam_id = uxui_exam_uuid;
    
    -- Insertar preguntas para el examen UX/UI
    INSERT INTO exam_questions (
        exam_id,
        question_text,
        question_type,
        options,
        correct_answer,
        points,
        order_index
    ) VALUES
    -- Pregunta 1: UX vs UI
    (
        uxui_exam_uuid,
        '¿Cuál es la principal diferencia entre UX y UI?',
        'multiple_choice',
        '["UX es visual, UI es funcional", "UX es la experiencia del usuario, UI es la interfaz visual", "UX es para móviles, UI para web", "No hay diferencia"]',
        'UX es la experiencia del usuario, UI es la interfaz visual',
        3,
        1
    ),
    
    -- Pregunta 2: Design Thinking
    (
        uxui_exam_uuid,
        '¿Cuáles son las etapas del Design Thinking? (Selecciona todas las correctas)',
        'multiple_select',
        '["Empatizar", "Definir", "Idear", "Prototipar", "Testear", "Programar"]',
        '["Empatizar", "Definir", "Idear", "Prototipar", "Testear"]',
        5,
        2
    ),
    
    -- Pregunta 3: Wireframes
    (
        uxui_exam_uuid,
        '¿Qué es un wireframe?',
        'multiple_choice',
        '["Un prototipo con colores finales", "Un esquema básico de la estructura y contenido", "Una imagen de alta resolución", "Un código HTML"]',
        'Un esquema básico de la estructura y contenido',
        3,
        3
    ),
    
    -- Pregunta 4: User Personas
    (
        uxui_exam_uuid,
        '¿Para qué sirven las User Personas?',
        'multiple_choice',
        '["Para decorar presentaciones", "Para representar a los usuarios objetivo y guiar decisiones de diseño", "Para programar aplicaciones", "Para hacer marketing"]',
        'Para representar a los usuarios objetivo y guiar decisiones de diseño',
        3,
        4
    ),
    
    -- Pregunta 5: Herramientas de Diseño
    (
        uxui_exam_uuid,
        '¿Cuáles son herramientas comunes para diseño UX/UI? (Selecciona todas las correctas)',
        'multiple_select',
        '["Figma", "Adobe XD", "Sketch", "Photoshop", "Microsoft Word", "Excel"]',
        '["Figma", "Adobe XD", "Sketch", "Photoshop"]',
        4,
        5
    ),
    
    -- Pregunta 6: Usabilidad
    (
        uxui_exam_uuid,
        '¿Qué es la usabilidad?',
        'multiple_choice',
        '["La belleza del diseño", "La facilidad y eficiencia con que los usuarios pueden usar un producto", "El precio del producto", "La velocidad de carga"]',
        'La facilidad y eficiencia con que los usuarios pueden usar un producto',
        3,
        6
    ),
    
    -- Pregunta 7: Responsive Design
    (
        uxui_exam_uuid,
        '¿Qué es el diseño responsive?',
        'multiple_choice',
        '["Diseño que responde rápido", "Diseño que se adapta a diferentes tamaños de pantalla", "Diseño con muchos colores", "Diseño para servidores"]',
        'Diseño que se adapta a diferentes tamaños de pantalla',
        3,
        7
    ),
    
    -- Pregunta 8: Prototipado
    (
        uxui_exam_uuid,
        '¿Cuáles son tipos de prototipos? (Selecciona todas las correctas)',
        'multiple_select',
        '["Baja fidelidad", "Media fidelidad", "Alta fidelidad", "Interactivo", "Estático", "Imposible"]',
        '["Baja fidelidad", "Media fidelidad", "Alta fidelidad", "Interactivo", "Estático"]',
        4,
        8
    ),
    
    -- Pregunta 9: Accesibilidad
    (
        uxui_exam_uuid,
        '¿Por qué es importante la accesibilidad en el diseño?',
        'multiple_choice',
        '["Para cumplir leyes solamente", "Para que todas las personas puedan usar el producto independientemente de sus capacidades", "Para hacer el diseño más bonito", "No es importante"]',
        'Para que todas las personas puedan usar el producto independientemente de sus capacidades',
        3,
        9
    ),
    
    -- Pregunta 10: Text - Proceso de Diseño
    (
        uxui_exam_uuid,
        'Describe brevemente el proceso que seguirías para diseñar una aplicación móvil desde cero. Menciona al menos 4 pasos.',
        'text',
        NULL,
        'Proceso de diseño: 1) Investigación de usuarios y análisis de necesidades, 2) Definición de personas y casos de uso, 3) Creación de wireframes y arquitectura de información, 4) Diseño visual y prototipado, 5) Testing con usuarios y iteración.',
        5,
        10
    ),
    
    -- Pregunta 11: Principios de Diseño
    (
        uxui_exam_uuid,
        '¿Cuáles son principios básicos del buen diseño? (Selecciona todas las correctas)',
        'multiple_select',
        '["Contraste", "Repetición", "Alineación", "Proximidad", "Complejidad", "Confusión"]',
        '["Contraste", "Repetición", "Alineación", "Proximidad"]',
        4,
        11
    ),
    
    -- Pregunta 12: Testing de Usuarios
    (
        uxui_exam_uuid,
        '¿Qué es el testing de usuarios?',
        'multiple_choice',
        '["Examinar a los empleados", "Observar cómo los usuarios reales interactúan con el producto", "Revisar el código", "Hacer encuestas por teléfono"]',
        'Observar cómo los usuarios reales interactúan con el producto',
        3,
        12
    ),
    
    -- Pregunta 13: Information Architecture
    (
        uxui_exam_uuid,
        '¿Qué es la arquitectura de información?',
        'multiple_choice',
        '["El diseño de edificios", "La organización y estructura del contenido", "El hardware del servidor", "Los colores del diseño"]',
        'La organización y estructura del contenido',
        3,
        13
    ),
    
    -- Pregunta 14: Text - Caso Práctico
    (
        uxui_exam_uuid,
        'Imagina que debes rediseñar una aplicación de delivery que tiene problemas de usabilidad. ¿Qué aspectos evaluarías y qué mejoras implementarías?',
        'text',
        NULL,
        'Evaluaría: flujo de pedido, navegación, búsqueda de productos, proceso de pago, seguimiento de pedidos. Mejoras: simplificar checkout, mejorar filtros, optimizar para una mano, agregar favoritos, notificaciones claras de estado.',
        5,
        14
    ),
    
    -- Pregunta 15: Color Theory
    (
        uxui_exam_uuid,
        '¿Cuáles son conceptos importantes en teoría del color para UX/UI? (Selecciona todas las correctas)',
        'multiple_select',
        '["Contraste para legibilidad", "Psicología del color", "Accesibilidad cromática", "Armonía de colores", "Usar todos los colores posibles", "Ignorar daltonismo"]',
        '["Contraste para legibilidad", "Psicología del color", "Accesibilidad cromática", "Armonía de colores"]',
        4,
        15
    );

    -- Actualizar el examen
    UPDATE exams 
    SET 
        updated_at = NOW()
    WHERE id = uxui_exam_uuid;

    RAISE NOTICE 'Se insertaron 15 preguntas para el examen UX/UI: %', uxui_exam_uuid;
    RAISE NOTICE 'Curso ID: %', uxui_course_uuid;
    RAISE NOTICE 'Examen actualizado correctamente';
END $$;

-- Verificar que las preguntas se insertaron correctamente
SELECT 
    eq.order_index,
    LEFT(eq.question_text, 50) as question_preview,
    eq.question_type,
    eq.points
FROM exam_questions eq
WHERE eq.exam_id = '143955ea-ab13-4988-84d8-392e698faeb2'
ORDER BY eq.order_index;

-- Verificar el examen actualizado
SELECT 
    e.id,
    e.title,
    e.description,
    e.passing_score,
    e.max_attempts,
    e.time_limit_minutes,
    COUNT(eq.id) as total_questions,
    SUM(eq.points) as total_points
FROM exams e
LEFT JOIN exam_questions eq ON e.id = eq.exam_id
WHERE e.id = '143955ea-ab13-4988-84d8-392e698faeb2'
GROUP BY e.id, e.title, e.description, e.passing_score, e.max_attempts, e.time_limit_minutes;
