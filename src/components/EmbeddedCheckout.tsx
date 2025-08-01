import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowLeft } from 'lucide-react';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import useStripeCheckoutEmbedded from '@/hooks/useStripeCheckoutEmbedded';
import { useSubscriptionPlans } from '@/hooks/useSubscriptionPlans';

interface EmbeddedCheckoutProps {
  planName: string;
  planType: 'monthly' | 'annual';
  onBack?: () => void;
}

const EmbeddedCheckout: React.FC<EmbeddedCheckoutProps> = ({ 
  planName, 
  planType, 
  onBack 
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [checkoutMounted, setCheckoutMounted] = useState(false);
  const checkoutRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const { createCheckoutSession } = useSubscription();
  const { createEmbeddedCheckout } = useStripeCheckoutEmbedded();
  const { toast } = useToast();
  const { plans: dbPlans } = useSubscriptionPlans();
  
  // Obtener precios dinámicos de la base de datos
  const monthlyPlan = dbPlans.find(p => p.duration_months === 1);
  const annualPlan = dbPlans.find(p => p.duration_months === 12);
  const monthlyPrice = monthlyPlan?.price ?? 29;
  const annualPrice = annualPlan?.price ?? 290;

  const initializeCheckout = async () => {
    if (!user) {
      toast({
        title: "Inicia sesión requerido",
        description: "Debes iniciar sesión para continuar con el pago.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Crear sesión de checkout en modo embebido
      const result = await createCheckoutSession(planType, planName, 'embedded');
      
      if (result.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        });
        return;
      }

      if (result.sessionId && checkoutRef.current) {
        // Montar el checkout embebido usando el hook
        await createEmbeddedCheckout(result.sessionId, 'embedded-checkout-container');
        setCheckoutMounted(true);
      }
    } catch (error) {
      console.error('Error initializing checkout:', error);
      toast({
        title: "Error",
        description: "Error al inicializar el checkout. Inténtalo de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDirectCheckout = async () => {
    if (!user) return;

    setIsLoading(true);
    
    try {
      // Como fallback, usar el redirect directo
      const result = await createCheckoutSession(planType, planName, 'hosted');
      
      if (result.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        });
        return;
      }

      if (result.url) {
        window.location.href = result.url;
      }
    } catch (error) {
      console.error('Error with direct checkout:', error);
      toast({
        title: "Error",
        description: "Error al procesar el pago. Inténtalo de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    initializeCheckout();
  }, []);

  const planDetails = {
    monthly: {
      name: 'Plan Mensual',
      price: `$${monthlyPrice}`,
      period: '/mes'
    },
    annual: {
      name: 'Plan Anual', 
      price: `$${annualPrice}`,
      period: '/año',
      savings: `¡Ahorra $${(monthlyPrice * 12) - annualPrice} al año!`
    }
  };

  const selectedPlan = planDetails[planType];

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header con información del plan */}
      <div className="mb-6">
        {onBack && (
          <Button 
            variant="ghost" 
            onClick={onBack}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver a planes
          </Button>
        )}
        
        <Card>
          <CardHeader>
            <CardTitle className="text-center">Finalizar Suscripción</CardTitle>
            <CardDescription className="text-center">
              {selectedPlan.name} - {selectedPlan.price}{selectedPlan.period}
              {planType === 'annual' && planDetails.annual.savings && (
                <div className="text-green-600 font-medium mt-1">
                  {planDetails.annual.savings}
                </div>
              )}
            </CardDescription>
          </CardHeader>
        </Card>
      </div>

      {/* Checkout Container */}
      <Card>
        <CardContent className="p-6">
          {isLoading && !checkoutMounted && (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin mb-4" />
              <p className="text-gray-600">Preparando el checkout...</p>
            </div>
          )}

          {/* Contenedor para el checkout embebido */}
          <div 
            id="embedded-checkout-container"
            ref={checkoutRef}
            className={`min-h-[400px] ${!checkoutMounted && isLoading ? 'hidden' : ''}`}
          />

          {/* Fallback: Botón para checkout directo si el embebido falla */}
          {!isLoading && !checkoutMounted && (
            <div className="text-center py-8">
              <p className="text-gray-600 mb-4">
                ¿El checkout no se carga? Prueba con el método directo:
              </p>
              <Button 
                onClick={handleDirectCheckout}
                disabled={isLoading}
                className="w-full max-w-md"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Procesando...
                  </>
                ) : (
                  'Continuar con Stripe'
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Información de seguridad */}
      <div className="mt-6 text-center text-sm text-gray-500">
        <p>🔒 Pago seguro procesado por Stripe</p>
        <p>Puedes cancelar tu suscripción en cualquier momento</p>
      </div>
    </div>
  );
};

export default EmbeddedCheckout;
