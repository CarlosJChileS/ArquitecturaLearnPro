-- Insert subscription plans with realistic pricing
INSERT INTO subscription_plans (name, description, price, duration_months, features) VALUES 
(
  'Basic', 
  'Plan básico para estudiantes que quieren comenzar su aprendizaje', 
  9.99, 
  1, 
  '["Acceso a cursos básicos", "Certificados de finalización", "Soporte básico", "Acceso móvil y web", "Progreso sincronizado"]'
),
(
  'Basic Annual', 
  'Plan básico anual con descuento', 
  99.99, 
  12, 
  '["Acceso a cursos básicos", "Certificados de finalización", "Soporte básico", "Acceso móvil y web", "Progreso sincronizado", "2 meses gratis"]'
),
(
  'Premium', 
  'Plan premium con acceso completo a todo el contenido', 
  19.99, 
  1, 
  '["Acceso a TODOS los cursos", "Contenido exclusivo Premium", "Certificados de finalización", "Soporte prioritario", "Acceso móvil y web", "Progreso sincronizado", "Descargas offline", "Comunidad exclusiva"]'
),
(
  'Premium Annual', 
  'Plan premium anual con máximo descuento', 
  199.99, 
  12, 
  '["Acceso a TODOS los cursos", "Contenido exclusivo Premium", "Certificados de finalización", "Soporte prioritario", "Acceso móvil y web", "Progreso sincronizado", "Descargas offline", "Comunidad exclusiva", "2 meses gratis"]'
)
ON CONFLICT (name) DO UPDATE SET
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  duration_months = EXCLUDED.duration_months,
  features = EXCLUDED.features;
