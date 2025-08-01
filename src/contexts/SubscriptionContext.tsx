import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';

interface SubscriptionData {
  subscribed: boolean;
  subscription_tier: string | null;
  subscription_end: string | null;
  plan_id: string | null;
  plan_name?: string;
  status?: string;
}

interface SubscriptionContextType {
  subscription: SubscriptionData;
  loading: boolean;
  refreshSubscription: () => Promise<void>;
  createCheckoutSession: (planType: 'monthly' | 'annual', planName: string, mode?: 'hosted' | 'embedded') => Promise<{ url?: string; sessionId?: string; clientSecret?: string; error?: string }>;
  createCustomerPortalSession: () => Promise<{ url?: string; error?: string }>;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
};

export const SubscriptionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [subscription, setSubscription] = useState<SubscriptionData>({
    subscribed: false,
    subscription_tier: null,
    subscription_end: null,
    plan_id: null,
  });
  const [loading, setLoading] = useState(false);
  
  const { user, session } = useAuth();

  const refreshSubscription = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Usar la nueva función para obtener tier de suscripción
      const { data: tierData, error: tierError } = await supabase
        .rpc('get_subscription_tier', { input_user_id: user.id });

      // Obtener detalles completos de la suscripción
      const { data: subscriptionData, error: subError } = await supabase
        .from('subscriptions')
        .select(`
          *,
          subscription_plans!inner(
            name,
            price,
            duration_months
          )
        `)
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single();

      if (!tierError && tierData) {
        const isSubscribed = tierData !== 'free';
        const tier = tierData;
        
        setSubscription({
          subscribed: isSubscribed,
          subscription_tier: tier,
          subscription_end: subscriptionData?.current_period_end || null,
          plan_id: subscriptionData?.plan_id || null,
          plan_name: subscriptionData?.subscription_plans?.name || null,
          status: subscriptionData?.status || null,
        });
      } else {
        // Usuario sin suscripción activa
        setSubscription({
          subscribed: false,
          subscription_tier: 'free',
          subscription_end: null,
          plan_id: null,
        });
      }
    } catch (error) {
      console.error('Error refreshing subscription:', error);
      setSubscription({
        subscribed: false,
        subscription_tier: 'free',
        subscription_end: null,
        plan_id: null,
      });
    } finally {
      setLoading(false);
    }
  };

  const createCheckoutSession = async (planType: 'monthly' | 'annual', planName: string, mode: 'hosted' | 'embedded' = 'hosted') => {
    if (!user || !session) {
      return { error: 'No hay sesión activa' };
    }

    try {
      // Buscar el plan en la base de datos
      const { data: planData, error: planError } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('name', planName)
        .single();

      if (planError || !planData) {
        return { error: 'Plan no encontrado' };
      }

      // Crear sesión de checkout con Stripe
      const { data, error } = await supabase.functions.invoke('stripe-checkout', {
        body: { 
          planId: planData.id,
          planName: planName,
          planType: planType,
          userId: user.id,
          mode: mode // Agregar el modo (hosted/embedded)
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        console.error('Error creating checkout session:', error);
        return { error: error.message };
      }

      // Retornar respuesta según el modo
      if (mode === 'embedded') {
        return { 
          sessionId: data.sessionId,
          clientSecret: data.clientSecret
        };
      } else {
        return { url: data.url };
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      return { error: 'Error al crear la sesión de pago' };
    }
  };

  const createCustomerPortalSession = async () => {
    if (!user || !session) {
      return { error: 'No hay sesión activa' };
    }

    try {
      const { data, error } = await supabase.functions.invoke('create-stripe-portal', {
        body: { userId: user.id },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        console.error('Error creating customer portal session:', error);
        return { error: error.message };
      }

      return { url: data.url };
    } catch (error) {
      console.error('Error creating customer portal session:', error);
      return { error: 'Error al acceder al portal de cliente' };
    }
  };

  useEffect(() => {
    if (user) {
      refreshSubscription();
    } else {
      setSubscription({
        subscribed: false,
        subscription_tier: 'free',
        subscription_end: null,
        plan_id: null,
      });
    }
  }, [user]);

  const value: SubscriptionContextType = useMemo(() => ({
    subscription,
    loading,
    refreshSubscription,
    createCheckoutSession,
    createCustomerPortalSession,
  }), [subscription, loading]);

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
};