import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string | null;
  price: number;
  duration_months: number;
  features: string[];
}

export const useSubscriptionPlans = () => {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchPlans = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('subscription_plans')
      .select('*')
      .order('duration_months', { ascending: true });
    if (!error && data) {
      const normalized = data.map((plan) => ({
        ...plan,
        price: typeof plan.price === 'string' ? parseFloat(plan.price) : plan.price,
        features:
          typeof plan.features === 'string'
            ? (JSON.parse(plan.features) as string[])
            : Array.isArray(plan.features)
              ? (plan.features as string[])
              : [],
      }));
      setPlans(normalized as SubscriptionPlan[]);
    }
    setLoading(false);
  };

  const updatePlanPrice = async (id: string, price: number) => {
    const { error } = await supabase
      .from('subscription_plans')
      .update({ price })
      .eq('id', id);

    if (!error) {
      setPlans((prev) => prev.map((p) => (p.id === id ? { ...p, price } : p)));
    }
    return { error };
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  return { plans, loading, fetchPlans, updatePlanPrice };
};
