-- Script para insertar datos de prueba en la base de datos
-- Este script debe ejecutarse en Supabase para tener datos de prueba

-- 1. Insertar categorías si no existen
INSERT INTO categories (id, name, slug, description) 
VALUES 
  (gen_random_uuid(), 'Programación', 'programacion', 'Cursos de programación y desarrollo'),
  (gen_random_uuid(), 'Diseño', 'diseno', 'Cursos de diseño gráfico y web'),
  (gen_random_uuid(), 'Marketing', 'marketing', 'Cursos de marketing digital'),
  (gen_random_uuid(), 'General', 'general', 'Cursos generales')
ON CONFLICT (slug) DO NOTHING;

-- 2. Obtener IDs de categorías para usar en cursos
DO $$
DECLARE
    cat_programming_id UUID;
    cat_design_id UUID;
    cat_marketing_id UUID;
    admin_user_id UUID;
    course1_id UUID;
    course2_id UUID;
    course3_id UUID;
BEGIN
    -- Obtener IDs de categorías
    SELECT id INTO cat_programming_id FROM categories WHERE slug = 'programacion' LIMIT 1;
    SELECT id INTO cat_design_id FROM categories WHERE slug = 'diseno' LIMIT 1;
    SELECT id INTO cat_marketing_id FROM categories WHERE slug = 'marketing' LIMIT 1;
    
    -- Obtener el primer usuario para usarlo como instructor
    SELECT id INTO admin_user_id FROM auth.users LIMIT 1;
    
    -- Si no hay usuarios, crear un perfil de ejemplo
    IF admin_user_id IS NULL THEN
        RAISE NOTICE 'No hay usuarios en la base de datos. Necesitas registrarte primero.';
        RETURN;
    END IF;
    
    -- Crear o actualizar perfil del usuario
    INSERT INTO profiles (id, full_name, role) 
    VALUES (admin_user_id, 'Carlos Chile Silva', 'admin')
    ON CONFLICT (id) DO UPDATE SET 
        full_name = COALESCE(profiles.full_name, 'Carlos Chile Silva'),
        role = 'admin';
    
    -- 3. Insertar cursos de ejemplo
    INSERT INTO courses (id, title, description, thumbnail_url, intro_video_url, category_id, instructor_id, level, duration_hours, price, is_published, created_at, updated_at)
    VALUES 
      (gen_random_uuid(), 'Introducción a React', 'Aprende React desde cero con ejemplos prácticos', '/placeholder.svg', 'https://www.youtube.com/watch?v=SqcY0GlETPk', cat_programming_id, admin_user_id, 'beginner', 8, 49.99, true, NOW(), NOW()),
      (gen_random_uuid(), 'JavaScript Avanzado', 'Domina JavaScript con técnicas avanzadas', '/placeholder.svg', 'https://www.youtube.com/watch?v=hdI2bqOjy3c', cat_programming_id, admin_user_id, 'advanced', 12, 79.99, true, NOW(), NOW()),
      (gen_random_uuid(), 'Node.js y Express', 'Crea APIs RESTful con Node.js y Express', '/placeholder.svg', 'https://www.youtube.com/watch?v=fBNz5xF-Kx4', cat_programming_id, admin_user_id, 'intermediate', 10, 59.99, true, NOW(), NOW())
    RETURNING id INTO course1_id;
    
    -- Obtener IDs de cursos para las inscripciones
    SELECT id INTO course1_id FROM courses WHERE title = 'Introducción a React' LIMIT 1;
    SELECT id INTO course2_id FROM courses WHERE title = 'JavaScript Avanzado' LIMIT 1;
    SELECT id INTO course3_id FROM courses WHERE title = 'Node.js y Express' LIMIT 1;
    
    -- 4. Inscribir al usuario en algunos cursos (datos de ejemplo)
    INSERT INTO course_enrollments (id, user_id, course_id, enrolled_at, progress_percentage, status)
    VALUES 
      (gen_random_uuid(), admin_user_id, course1_id, NOW() - INTERVAL '7 days', 85, 'active'),
      (gen_random_uuid(), admin_user_id, course2_id, NOW() - INTERVAL '30 days', 100, 'completed'),
      (gen_random_uuid(), admin_user_id, course3_id, NOW() - INTERVAL '14 days', 45, 'active')
    ON CONFLICT DO NOTHING;
    
    -- 5. Marcar el segundo curso como completado
    UPDATE course_enrollments 
    SET completed_at = NOW() - INTERVAL '3 days'
    WHERE user_id = admin_user_id AND course_id = course2_id;
    
    -- 6. Crear exámenes de ejemplo para cada curso
    INSERT INTO exams (id, course_id, title, description, duration_minutes, total_questions, passing_score, is_active, created_at)
    VALUES 
      (gen_random_uuid(), course1_id, 'Examen Final: React Básico', 'Evaluación de conocimientos básicos de React', 30, 5, 70, true, NOW()),
      (gen_random_uuid(), course2_id, 'Examen Final: JavaScript Avanzado', 'Evaluación de conceptos avanzados de JavaScript', 45, 8, 80, true, NOW()),
      (gen_random_uuid(), course3_id, 'Examen Final: Node.js y Express', 'Evaluación de desarrollo backend con Node.js', 40, 6, 75, true, NOW())
    ON CONFLICT DO NOTHING;
    
    -- 7. Crear preguntas de ejemplo para el examen de React
    DO $$
    DECLARE
        react_exam_id UUID;
    BEGIN
        SELECT id INTO react_exam_id FROM exams WHERE course_id = course1_id LIMIT 1;
        
        IF react_exam_id IS NOT NULL THEN
            INSERT INTO exam_questions (id, exam_id, question_text, question_type, correct_answer, options, points, order_index)
            VALUES 
              (gen_random_uuid(), react_exam_id, '¿Qué es JSX en React?', 'multiple_choice', 'Una extensión de sintaxis de JavaScript', '["Una librería separada", "Una extensión de sintaxis de JavaScript", "Un framework", "Un compilador"]', 2, 1),
              (gen_random_uuid(), react_exam_id, '¿Cuál es el hook más básico en React?', 'multiple_choice', 'useState', '["useEffect", "useState", "useContext", "useReducer"]', 2, 2),
              (gen_random_uuid(), react_exam_id, '¿Qué significa "componente funcional" en React?', 'multiple_choice', 'Un componente definido como función', '["Un componente que usa clases", "Un componente definido como función", "Un componente con estado", "Un componente sin props"]', 2, 3),
              (gen_random_uuid(), react_exam_id, '¿Para qué se usa useEffect?', 'multiple_choice', 'Para efectos secundarios', '["Para manejar estado", "Para efectos secundarios", "Para crear componentes", "Para manejar eventos"]', 2, 4),
              (gen_random_uuid(), react_exam_id, '¿Qué devuelve un componente React?', 'multiple_choice', 'JSX', '["HTML", "JSX", "CSS", "JavaScript puro"]', 2, 5)
            ON CONFLICT DO NOTHING;
        END IF;
    END
    $$;
    
    RAISE NOTICE 'Datos de prueba insertados correctamente';
    RAISE NOTICE 'Usuario ID: %', admin_user_id;
    RAISE NOTICE 'Cursos creados: 3';
    RAISE NOTICE 'Inscripciones creadas: 3';
END
$$;
