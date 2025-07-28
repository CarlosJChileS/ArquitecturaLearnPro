import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { AuthContext } from './AuthContext';

interface SubscriptionData {
  subscribed: boolean;
  subscription_tier: string | null;
  subscription_end: string | null;
  plan_id: string | null;
}

interface SubscriptionContextType {
  subscription: SubscriptionData;
  loading: boolean;
  refreshSubscription: () => Promise<void>;
  createCheckoutSession: (planType: 'monthly' | 'annual', planName: string) => Promise<{ url?: string; error?: string }>;
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
  // Primero, todos los hooks (obligatorio para las reglas de React)
  const [subscription, setSubscription] = useState<SubscriptionData>({
    subscribed: false,
    subscription_tier: null,
    subscription_end: null,
    plan_id: null,
  });
  const [loading, setLoading] = useState(false);
  
  // Ahora verificar el AuthContext
  const authContext = useContext(AuthContext);
  
  // Usar valores por defecto si AuthContext no está disponible
  const session = authContext?.session || null;

  const refreshSubscription = async () => {
    if (!session) return;

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('check-subscription', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        console.error('Error checking subscription:', error);
        return;
      }

      if (data) {
        setSubscription({
          subscribed: data.subscribed || false,
          subscription_tier: data.subscription_tier || null,
          subscription_end: data.subscription_end || null,
          plan_id: data.plan_id || null,
        });
      }
    } catch (error) {
      console.error('Error refreshing subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  const createCheckoutSession = async (planType: 'monthly' | 'annual', planName: string) => {
    if (!session) {
      return { error: 'No hay sesión activa' };
    }

    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { planType, planName },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        console.error('Error creating checkout session:', error);
        return { error: error.message };
      }

      return { url: data.url };
    } catch (error) {
      console.error('Error creating checkout session:', error);
      return { error: 'Error al crear la sesión de pago' };
    }
  };

  const createCustomerPortalSession = async () => {
    if (!session) {
      return { error: 'No hay sesión activa' };
    }

    try {
      const { data, error } = await supabase.functions.invoke('customer-portal', {
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
    if (session) {
      refreshSubscription();
    } else {
      setSubscription({
        subscribed: false,
        subscription_tier: null,
        subscription_end: null,
        plan_id: null,
      });
    }
  }, [session]);

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