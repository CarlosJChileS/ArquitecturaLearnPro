-- Add Stripe fields to subscriptions table
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT;
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_subscription_id ON subscriptions(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_customer_id ON subscriptions(stripe_customer_id);

-- Update existing subscriptions to have default values if needed
UPDATE subscriptions 
SET 
  stripe_subscription_id = NULL,
  stripe_customer_id = NULL
WHERE stripe_subscription_id IS NULL;
