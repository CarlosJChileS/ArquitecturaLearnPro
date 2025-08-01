import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

// Función para cargar Stripe dinámicamente
const loadStripe = async () => {
  // Cargar Stripe desde CDN si no está disponible como dependencia
  if (typeof window !== 'undefined' && !window.Stripe) {
    const script = document.createElement('script');
    script.src = 'https://js.stripe.com/v3/';
    script.async = true;
    document.head.appendChild(script);
    
    return new Promise((resolve) => {
      script.onload = () => {
        resolve(window.Stripe);
      };
    });
  }
  
  return window.Stripe;
};

// Declarar el tipo Stripe en window
declare global {
  interface Window {
    Stripe: any;
  }
}

const useStripeCheckoutEmbedded = () => {
  const { user } = useAuth();

  const createCheckoutSession = async (planId: string) => {
    if (!user) {
      throw new Error('Usuario no autenticado');
    }

    // Obtener la sesión actual para el token de autorización
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session) {
      throw new Error('No se pudo obtener la sesión de autorización');
    }

    try {
      // Crear sesión de checkout
      const { data, error } = await supabase.functions.invoke('stripe-checkout', {
        body: {
          planType: planId.includes('annual') ? 'annual' : 'monthly',
          userId: user.id,
          mode: 'embedded' // Indicar que queremos checkout embebido
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        console.error('Error creando sesión:', error);
        throw new Error(error.message || 'Error al crear la sesión de pago');
      }

      return data;
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  };

  const redirectToCheckout = async (planId: string) => {
    try {
      const stripe = await loadStripe();
      if (!stripe) {
        throw new Error('Stripe no se pudo cargar');
      }

      // Crear sesión con modo hosted (redirect)
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        throw new Error('No se pudo obtener la sesión de autorización');
      }

      const { data, error } = await supabase.functions.invoke('stripe-checkout', {
        body: {
          planType: planId.includes('annual') ? 'annual' : 'monthly',
          userId: user.id,
          mode: 'hosted' // Modo redirect tradicional
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        console.error('Error creando sesión:', error);
        throw new Error(error.message || 'Error al crear la sesión de pago');
      }

      if (!data.url) {
        throw new Error('No se recibió URL de checkout');
      }

      // Redirigir directamente a la URL de Stripe
      window.location.href = data.url;

    } catch (error) {
      console.error('Error en redirectToCheckout:', error);
      throw error;
    }
  };

  const createEmbeddedCheckout = async (planId: string, elementId: string) => {
    try {
      const stripe = await loadStripe();
      if (!stripe) {
        throw new Error('Stripe no se pudo cargar');
      }

      // Crear sesión embebida
      const session = await createCheckoutSession(planId);
      
      if (!session.clientSecret) {
        throw new Error('No se recibió clientSecret de Stripe');
      }

      // Crear checkout embebido
      const checkout = await stripe.initEmbeddedCheckout({
        clientSecret: session.clientSecret
      });

      const element = document.getElementById(elementId);
      if (element) {
        checkout.mount(element);
      }

      return checkout;

    } catch (error) {
      console.error('Error en createEmbeddedCheckout:', error);
      throw error;
    }
  };

  return {
    redirectToCheckout,
    createEmbeddedCheckout,
    isLoading: false
  };
};

export default useStripeCheckoutEmbedded;
