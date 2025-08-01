import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { useToast } from '@/hooks/use-toast';
import { useSubscriptionPlans } from '@/hooks/useSubscriptionPlans';

const CheckoutDemo = () => {
  const [loading, setLoading] = useState(false);
  const [showEmbedded, setShowEmbedded] = useState(false);
  const { createCheckoutSession } = useSubscription();
  const { toast } = useToast();
  const { plans: dbPlans } = useSubscriptionPlans();
  
  // Obtener planes dinámicos de la base de datos
  const monthlyPlan = dbPlans.find(p => p.duration_months === 1);
  const annualPlan = dbPlans.find(p => p.duration_months === 12);
  const monthlyPrice = monthlyPlan?.price ?? 29;
  const annualPrice = annualPlan?.price ?? 290;
  const monthlyPlanName = monthlyPlan?.name ?? 'Basic';
  const annualPlanName = annualPlan?.name ?? 'Premium';

  const handleRedirectCheckout = async (planType: 'monthly' | 'annual') => {
    setLoading(true);
    try {
      const planName = planType === 'monthly' ? monthlyPlanName : annualPlanName;
      const result = await createCheckoutSession(planType, planName, 'hosted');
      
      if (result.error) {
        throw new Error(result.error);
      }
      
      // Redirigir a Stripe Checkout
      if (result.url) {
        window.open(result.url, '_blank');
      }
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error en el checkout",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEmbeddedCheckout = async (planType: 'monthly' | 'annual') => {
    setLoading(true);
    try {
      const planName = planType === 'monthly' ? monthlyPlanName : annualPlanName;
      const result = await createCheckoutSession(planType, planName, 'embedded');
      
      if (result.error) {
        throw new Error(result.error);
      }
      
      // Para checkout embebido necesitaríamos más lógica aquí
      // Por ahora mostraremos el contenedor
      setShowEmbedded(true);
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error en el checkout embebido",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (showEmbedded) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4">
          <div className="mb-6">
            <Button 
              onClick={() => setShowEmbedded(false)}
              variant="outline"
            >
              ← Volver a opciones
            </Button>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Checkout Embebido</CardTitle>
              <CardDescription>
                Completa tu pago directamente aquí sin salir de la página
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div id="stripe-checkout-embedded" className="min-h-[400px]">
                {/* Aquí se monta el checkout embebido de Stripe */}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Demo de Checkout con Stripe
          </h1>
          <p className="text-lg text-gray-600">
            Compara las dos experiencias de checkout disponibles
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Checkout por Redirect (Actual) */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                🔗 Checkout Redirect
                <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                  Actual
                </span>
              </CardTitle>
              <CardDescription>
                Redirige a la página oficial de Stripe para completar el pago
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-medium">Ventajas:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Totalmente seguro y confiable</li>
                  <li>• Interfaz oficial de Stripe</li>
                  <li>• Soporte completo para todos los métodos de pago</li>
                </ul>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium">Desventajas:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Usuario sale de tu sitio web</li>
                  <li>• Experiencia menos fluida</li>
                  <li>• Requiere redirección</li>
                </ul>
              </div>

              <div className="pt-4 space-y-2">
                <Button 
                  onClick={() => handleRedirectCheckout('monthly')}
                  disabled={loading}
                  className="w-full"
                >
                  {loading ? 'Cargando...' : `Probar Plan Mensual - $${monthlyPrice}`}
                </Button>
                <Button 
                  onClick={() => handleRedirectCheckout('annual')}
                  disabled={loading}
                  variant="outline"
                  className="w-full"
                >
                  {loading ? 'Cargando...' : `Probar Plan Anual - $${annualPrice}`}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Checkout Embebido (Nuevo) */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                ⚡ Checkout Embebido
                <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded">
                  Nuevo
                </span>
              </CardTitle>
              <CardDescription>
                Pago directo sin salir de la página para una mejor experiencia
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-medium">Ventajas:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Usuario permanece en tu sitio</li>
                  <li>• Experiencia más fluida</li>
                  <li>• Mayor conversión</li>
                  <li>• Control total del diseño</li>
                </ul>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium">Consideraciones:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Implementación más compleja</li>
                  <li>• Requiere configuración adicional</li>
                  <li>• Dependencia de JavaScript</li>
                </ul>
              </div>

              <div className="pt-4 space-y-2">
                <Button 
                  onClick={() => handleEmbeddedCheckout('monthly')}
                  disabled={loading}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  {loading ? 'Cargando...' : `Probar Plan Mensual - $${monthlyPrice}`}
                </Button>
                <Button 
                  onClick={() => handleEmbeddedCheckout('annual')}
                  disabled={loading}
                  variant="outline"
                  className="w-full border-green-600 text-green-600 hover:bg-green-50"
                >
                  {loading ? 'Cargando...' : `Probar Plan Anual - $${annualPrice}`}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-12 text-center">
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">
                💡 Recomendación
              </h3>
              <p className="text-blue-800">
                El checkout embebido ofrece una mejor experiencia de usuario y puede incrementar 
                las conversiones. Sin embargo, el checkout redirect sigue siendo una opción sólida 
                y confiable para casos donde se prefiera la simplicidad.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CheckoutDemo;
