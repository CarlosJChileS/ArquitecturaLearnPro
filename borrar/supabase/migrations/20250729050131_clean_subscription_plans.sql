-- Clean up subscription plans and remove duplicates
-- Remove duplicate plans keeping the most recent ones

-- Remove duplicate Premium plan (keep the more recent one)
DELETE FROM subscription_plans 
WHERE id = 'b794ba18-a5b0-4c92-8303-b1822dbfb1a8' 
AND name = 'Premium';

-- Remove duplicate Básico plan (keep the more recent one) 
DELETE FROM subscription_plans 
WHERE id = 'ec9afac0-6d92-431a-9a74-88f248f58d44' 
AND name = 'Básico';

-- Update remaining plans to ensure consistency
UPDATE subscription_plans 
SET 
  features = '["Acceso a cursos básicos", "Soporte por email", "Certificados básicos"]'
WHERE name = 'Básico' AND duration_months = 1;

UPDATE subscription_plans 
SET 
  features = '["Acceso a todos los cursos", "Soporte prioritario", "Certificados premium", "Descarga de materiales", "Acceso offline"]'
WHERE name = 'Premium' AND duration_months = 1;

-- Ensure all plans are active
UPDATE subscription_plans SET is_active = true WHERE is_active IS NULL OR is_active = false;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_subscription_plans_name ON subscription_plans(name);
CREATE INDEX IF NOT EXISTS idx_subscription_plans_price ON subscription_plans(price);
CREATE INDEX IF NOT EXISTS idx_subscription_plans_active ON subscription_plans(is_active);
