-- Create check-subscription Edge Function
CREATE OR REPLACE FUNCTION public.check_subscription(user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  result jsonb;
  subscription_record record;
BEGIN
  -- Get user's active subscription
  SELECT us.*, sp.name as plan_name, sp.price
  INTO subscription_record
  FROM public.user_subscriptions us
  JOIN public.subscription_plans sp ON us.plan_id = sp.id
  WHERE us.user_id = $1 
    AND us.status = 'active'
    AND us.ends_at > now()
  ORDER BY us.created_at DESC
  LIMIT 1;

  IF subscription_record IS NOT NULL THEN
    result := jsonb_build_object(
      'subscribed', true,
      'subscription_tier', subscription_record.plan_name,
      'subscription_end', subscription_record.ends_at,
      'plan_id', subscription_record.plan_id
    );
  ELSE
    result := jsonb_build_object(
      'subscribed', false,
      'subscription_tier', null,
      'subscription_end', null,
      'plan_id', null
    );
  END IF;

  RETURN result;
END;
$$;

-- Create subscribers table for Stripe integration
CREATE TABLE IF NOT EXISTS public.subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  stripe_customer_id TEXT,
  subscribed BOOLEAN NOT NULL DEFAULT false,
  subscription_tier TEXT,
  subscription_end TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on subscribers table
ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;

-- Create policies for subscribers table
CREATE POLICY "select_own_subscription" ON public.subscribers
FOR SELECT
USING (user_id = auth.uid() OR email = auth.email());

CREATE POLICY "update_own_subscription" ON public.subscribers
FOR UPDATE
USING (true);

CREATE POLICY "insert_subscription" ON public.subscribers
FOR INSERT
WITH CHECK (true);

-- Add trigger for subscribers updated_at
CREATE TRIGGER update_subscribers_updated_at 
BEFORE UPDATE ON public.subscribers 
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();