-- ===================================================================
-- MIGRACIÓN: Crear examen completo para curso Backend
-- Descripción: Crea examen y preguntas para el curso de backend
-- Fecha: 2025-08-01
-- ===================================================================

-- Crear examen y preguntas para el curso de backend
DO $$
DECLARE
    backend_course_uuid UUID := 'e8c91e78-94ca-4ece-8cd5-f116cc9d2f87';
    new_exam_uuid UUID := gen_random_uuid();
BEGIN
    -- Verificar que el curso existe
    IF NOT EXISTS (SELECT 1 FROM courses WHERE id = backend_course_uuid) THEN
        RAISE EXCEPTION 'El curso % no existe', backend_course_uuid;
    END IF;

    -- Crear el examen para el curso de backend
    INSERT INTO exams (
        id,
        course_id,
        title,
        description,
        passing_score,
        max_attempts,
        time_limit_minutes,
        is_active
    ) VALUES (
        new_exam_uuid,
        backend_course_uuid,
        'Examen Final Backend Development',
        'Evaluación final de conocimientos en desarrollo backend, APIs, bases de datos y arquitectura de servidores.',
        75,
        3,
        45,
        true
    );

    -- Insertar preguntas para el examen de backend
    INSERT INTO exam_questions (
        exam_id,
        question_text,
        question_type,
        options,
        correct_answer,
        points,
        order_index
    ) VALUES
    -- Pregunta 1: Node.js
    (
        new_exam_uuid,
        '¿Qué es Node.js?',
        'multiple_choice',
        '["Un framework de frontend", "Un entorno de ejecución de JavaScript del lado del servidor", "Una base de datos", "Un lenguaje de programación"]',
        'Un entorno de ejecución de JavaScript del lado del servidor',
        3,
        1
    ),
    
    -- Pregunta 2: Express.js
    (
        new_exam_uuid,
        '¿Para qué se utiliza Express.js?',
        'multiple_choice',
        '["Para crear interfaces de usuario", "Para crear aplicaciones web y APIs en Node.js", "Para gestionar bases de datos", "Para compilar JavaScript"]',
        'Para crear aplicaciones web y APIs en Node.js',
        3,
        2
    ),
    
    -- Pregunta 3: HTTP Methods
    (
        new_exam_uuid,
        '¿Cuáles son métodos HTTP comúnmente usados en APIs REST? (Selecciona todos los correctos)',
        'multiple_select',
        '["GET", "POST", "PUT", "DELETE", "CONNECT", "TRACE"]',
        '["GET", "POST", "PUT", "DELETE"]',
        4,
        3
    ),
    
    -- Pregunta 4: Middleware
    (
        new_exam_uuid,
        '¿Qué es un middleware en Express.js?',
        'multiple_choice',
        '["Una base de datos", "Una función que se ejecuta entre la petición y la respuesta", "Un tipo de variable", "Un archivo de configuración"]',
        'Una función que se ejecuta entre la petición y la respuesta',
        3,
        4
    ),
    
    -- Pregunta 5: Bases de Datos
    (
        new_exam_uuid,
        '¿Cuáles son tipos de bases de datos? (Selecciona todas las correctas)',
        'multiple_select',
        '["SQL (Relacional)", "NoSQL (Documento)", "NoSQL (Clave-Valor)", "In-Memory", "Excel", "Word"]',
        '["SQL (Relacional)", "NoSQL (Documento)", "NoSQL (Clave-Valor)", "In-Memory"]',
        4,
        5
    ),
    
    -- Pregunta 6: JWT
    (
        new_exam_uuid,
        '¿Qué significa JWT?',
        'multiple_choice',
        '["JavaScript Web Token", "JSON Web Token", "Java Web Token", "Just Web Token"]',
        'JSON Web Token',
        2,
        6
    ),
    
    -- Pregunta 7: Status Codes
    (
        new_exam_uuid,
        '¿Qué significa el código de estado HTTP 404?',
        'multiple_choice',
        '["Éxito", "Error del servidor", "No encontrado", "No autorizado"]',
        'No encontrado',
        2,
        7
    ),
    
    -- Pregunta 8: Environment Variables
    (
        new_exam_uuid,
        '¿Para qué se usan las variables de entorno en backend?',
        'multiple_choice',
        '["Para decorar la interfaz", "Para almacenar configuraciones sensibles como claves API", "Para crear animaciones", "Para compilar código"]',
        'Para almacenar configuraciones sensibles como claves API',
        3,
        8
    ),
    
    -- Pregunta 9: Text - API Design
    (
        new_exam_uuid,
        'Explica brevemente qué es una API RESTful y menciona al menos 3 principios fundamentales.',
        'text',
        NULL,
        'Una API RESTful sigue los principios REST: usar métodos HTTP apropiados, ser stateless (sin estado), usar URLs descriptivas, retornar códigos de estado apropiados, y separar cliente-servidor.',
        5,
        9
    ),
    
    -- Pregunta 10: Microservicios
    (
        new_exam_uuid,
        '¿Cuáles son ventajas de la arquitectura de microservicios? (Selecciona todas las correctas)',
        'multiple_select',
        '["Escalabilidad independiente", "Tecnologías diversas", "Mantenimiento simplificado", "Despliegue independiente", "Mayor complejidad de red", "Un solo punto de falla"]',
        '["Escalabilidad independiente", "Tecnologías diversas", "Despliegue independiente"]',
        4,
        10
    ),
    
    -- Pregunta 11: Docker
    (
        new_exam_uuid,
        '¿Qué es Docker?',
        'multiple_choice',
        '["Un lenguaje de programación", "Una plataforma de contenedores", "Una base de datos", "Un framework web"]',
        'Una plataforma de contenedores',
        3,
        11
    ),
    
    -- Pregunta 12: Text - Experiencia
    (
        new_exam_uuid,
        'Describe cómo diseñarías una API para un sistema de e-commerce. Menciona al menos 4 endpoints principales.',
        'text',
        NULL,
        'API de e-commerce incluiría: GET /products (listar productos), POST /orders (crear pedido), GET /users/profile (perfil usuario), POST /auth/login (autenticación), PUT /products/:id (actualizar producto), DELETE /cart/items/:id (eliminar del carrito).',
        5,
        12
    );

    RAISE NOTICE 'Examen creado con ID: %', new_exam_uuid;
    RAISE NOTICE 'Se insertaron 12 preguntas para el curso de backend';
    RAISE NOTICE 'Curso ID: %', backend_course_uuid;
END $$;

-- Verificar que el examen se creó correctamente
SELECT 
    e.id,
    e.title,
    e.description,
    e.passing_score,
    e.max_attempts,
    e.time_limit_minutes,
    COUNT(eq.id) as total_questions
FROM exams e
LEFT JOIN exam_questions eq ON e.id = eq.exam_id
WHERE e.course_id = 'e8c91e78-94ca-4ece-8cd5-f116cc9d2f87'
GROUP BY e.id, e.title, e.description, e.passing_score, e.max_attempts, e.time_limit_minutes;

-- Verificar las preguntas insertadas
SELECT 
    eq.order_index,
    eq.question_text,
    eq.question_type,
    eq.points
FROM exam_questions eq
JOIN exams e ON eq.exam_id = e.id
WHERE e.course_id = 'e8c91e78-94ca-4ece-8cd5-f116cc9d2f87'
ORDER BY eq.order_index;
