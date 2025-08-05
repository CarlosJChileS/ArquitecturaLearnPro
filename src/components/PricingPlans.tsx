import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Check, Star, Zap, Heart } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { useToast } from "@/hooks/use-toast";
import { useSubscriptionPlans } from "@/hooks/useSubscriptionPlans";
import { supabase } from "@/integrations/supabase/client";

const fallbackPlans = [
  {
    id: "Donacion",
    name: "Donación",
    description: "Apoya nuestro proyecto y obtén acceso básico",
    monthlyPrice: 12,
    annualPrice: 120,
    icon: Heart,
    popular: false,
    features: [
      "Acceso a cursos básicos",
      "Certificados de finalización",
      "Soporte comunitario",
      "Acceso móvil y web",
      "Progreso sincronizado"
    ]
  },
  {
    id: "Premium",
    name: "Premium",
    description: "La opción más popular para profesionales",
    monthlyPrice: 60,
    annualPrice: 600,
    icon: Zap,
    popular: true,
    features: [
      "Acceso a TODOS los cursos",
      "Contenido exclusivo Premium",
      "Certificados de finalización",
      "Soporte prioritario",
      "Acceso móvil y web",
      "Progreso sincronizado",
      "Descargas offline",
      "Comunidad exclusiva"
    ]
  },
  {
    id: "Pro",
    name: "Pro",
    description: "Para equipos y empresas que buscan el máximo rendimiento",
    monthlyPrice: 120,
    annualPrice: 1200,
    icon: Star,
    popular: false,
    features: [
      "Todo lo de Premium",
      "Acceso para equipos",
      "Certificaciones avanzadas",
      "Soporte 24/7 dedicado",
      "Herramientas de gestión",
      "Reportes personalizados",
      "Integración con LMS",
      "API de acceso"
    ]
  }
];

const PricingPlans = () => {
  const [isAnnual, setIsAnnual] = useState(false);
  const { user } = useAuth();
  const { subscription, createCheckoutSession, createCustomerPortalSession, loading } = useSubscription();
  const { toast } = useToast();
  const { plans: dbPlans } = useSubscriptionPlans();
  const plans = dbPlans.length
    ? dbPlans.map((p) => ({
        id: p.id,
        name: p.name,
        description: p.description || '',
        monthlyPrice: p.duration_months === 12 ? p.price / 12 : p.price,
        annualPrice: p.duration_months === 12 ? p.price : p.price * 12,
        icon: p.name.toLowerCase().includes('premium') ? Zap : 
              p.name.toLowerCase().includes('donacion') ? Heart : Star,
        popular: p.name.toLowerCase().includes('premium'),
        features: p.features,
      }))
      .sort((a, b) => {
        // Ordenar: Donación (1), Premium (2), Pro (3)
        const order = { 'donación': 1, 'donacion': 1, 'premium': 2, 'pro': 3 };
        const aOrder = order[a.name.toLowerCase()] || 4;
        const bOrder = order[b.name.toLowerCase()] || 4;
        return aOrder - bOrder;
      })
    : fallbackPlans;

  const handlePayPal = async (planName: string) => {
    if (!user) {
      toast({
        title: "Inicia sesión requerido",
        description: "Debes iniciar sesión para suscribirte a un plan.",
        variant: "destructive",
      });
      return;
    }

    const planType = isAnnual ? 'annual' : 'monthly';
    const selectedPlan = plans.find(p => p.name === planName);
    const amount = isAnnual ? selectedPlan?.annualPrice : selectedPlan?.monthlyPrice;

    try {
      const { data, error } = await supabase.functions.invoke('paypal-payment', {
        body: { amount },
      });

      if (error) {
        toast({
          title: 'Error',
          description: error.message || 'Error al procesar el pago con PayPal.',
          variant: 'destructive',
        });
        return;
      }

      if (data?.approvalUrl) {
        window.open(data.approvalUrl as string, '_blank');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Error al procesar el pago con PayPal.',
        variant: 'destructive',
      });
    }
  };

  const handleStripe = async (planName: string) => {
    if (!user) {
      toast({
        title: "Inicia sesión requerido",
        description: "Debes iniciar sesión para suscribirte a un plan.",
        variant: "destructive",
      });
      return;
    }

    try {
      const planType = isAnnual ? 'annual' : 'monthly';
      const result = await createCheckoutSession(planType, planName, 'hosted');
      
      if (result.error) {
        throw new Error(result.error);
      }
      
      // Redirigir a Stripe en nueva pestaña
      if (result.url) {
        window.open(result.url, '_blank');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Error al procesar el pago con Stripe.',
        variant: 'destructive',
      });
    }
  };

  const handleManageSubscription = async () => {
    try {
      const { url, error } = await createCustomerPortalSession();
      
      if (error) {
        toast({
          title: "Error",
          description: error,
          variant: "destructive",
        });
        return;
      }

      if (url) {
        window.open(url, '_blank');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al acceder al portal de cliente.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="w-full">
      {/* Billing Toggle */}
      <div className="flex items-center justify-center space-x-4 mb-12">
        <span className={`text-sm font-medium transition-colors ${!isAnnual ? 'text-foreground' : 'text-muted-foreground'}`}>
          Mensual
        </span>
        <Switch
          checked={isAnnual}
          onCheckedChange={setIsAnnual}
          className="data-[state=checked]:bg-primary"
        />
        <span className={`text-sm font-medium transition-colors ${isAnnual ? 'text-foreground' : 'text-muted-foreground'}`}>
          Anual
        </span>
        {isAnnual && (
          <Badge variant="default" className="bg-gradient-primary ml-2">
            Ahorra 17%
          </Badge>
        )}
      </div>

      {/* Plans Container */}
      <div className="flex flex-col lg:flex-row gap-6 justify-center items-stretch max-w-7xl mx-auto">
        {plans.map((plan, index) => {
          const IconComponent = plan.icon;
          const currentPrice = isAnnual ? plan.annualPrice : plan.monthlyPrice;
          const period = isAnnual ? "/año" : "/mes";
          const isCurrentPlan = subscription.subscribed && subscription.subscription_tier === plan.name;
          
          return (
            <Card 
              key={plan.name}
              className={`relative flex-1 max-w-sm mx-auto lg:mx-0 transition-all duration-300 animate-scale-in flex flex-col ${
                plan.popular 
                  ? 'ring-2 ring-primary shadow-glow bg-gradient-card scale-105 z-10' 
                  : 'hover:shadow-card bg-card hover:scale-105'
              } ${isCurrentPlan ? 'ring-2 ring-green-500' : ''}`}
              style={{ animationDelay: `${index * 150}ms` }}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-gradient-primary text-white px-6 py-2 rounded-full text-sm font-medium shadow-lg z-20">
                  ⭐ Más Popular
                </div>
              )}
              
              {plan.name === "Donación" && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-pink-500 text-white px-6 py-2 rounded-full text-sm font-medium shadow-lg z-20">
                  ❤️ Apoya el Proyecto
                </div>
              )}
              
              {isCurrentPlan && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-6 py-2 rounded-full text-sm font-medium shadow-lg z-20">
                  ✓ Tu Plan Actual
                </div>
              )}
              
              <CardHeader className={`text-center ${plan.popular || isCurrentPlan || plan.name === "Donación" ? 'pt-16' : 'pt-8'}`}>
                <div className={`inline-flex p-4 rounded-full mb-6 mx-auto ${
                  plan.popular ? 'bg-gradient-primary' : 
                  plan.name === "Donación" ? 'bg-pink-500' : 'bg-muted'
                }`}>
                  <IconComponent className={`h-8 w-8 ${
                    plan.popular ? 'text-white' : 
                    plan.name === "Donación" ? 'text-white' : 'text-primary'
                  }`} />
                </div>
                
                <CardTitle className="text-3xl font-bold text-foreground mb-2">
                  {plan.name}
                </CardTitle>
                <p className="text-muted-foreground text-base leading-relaxed">
                  {plan.description}
                </p>
                
                <div className="mt-8">
                  <div className="flex items-baseline justify-center">
                    <span className="text-5xl font-bold text-foreground">
                      ${currentPrice}
                    </span>
                    <span className="text-muted-foreground ml-2 text-lg">{period}</span>
                  </div>
                  {isAnnual && (plan.monthlyPrice * 12) > plan.annualPrice && (
                    <div className="text-sm text-muted-foreground mt-3">
                      <span className="line-through">${(plan.monthlyPrice * 12).toFixed(0)}/año</span>
                      <span className="text-green-600 ml-2 font-medium">
                        Ahorra ${((plan.monthlyPrice * 12) - plan.annualPrice).toFixed(0)} ({Math.round(((plan.monthlyPrice * 12 - plan.annualPrice) / (plan.monthlyPrice * 12)) * 100)}%)
                      </span>
                    </div>
                  )}
                </div>
              </CardHeader>
              
              <CardContent className="px-8 pb-8 flex flex-col h-full">
                {/* Buttons Section */}
                <div className="mb-8 mt-auto">
                  {isCurrentPlan ? (
                    <Button 
                      variant="outline" 
                      className="w-full h-12 text-base font-medium"
                      onClick={handleManageSubscription}
                      disabled={loading}
                    >
                      {loading ? "Cargando..." : "Gestionar Suscripción"}
                    </Button>
                  ) : (
                    <div className="space-y-3">
                      <Button
                        className={`w-full h-12 text-base font-medium ${
                          plan.popular
                            ? 'bg-gradient-primary hover:opacity-90 text-white'
                            : 'bg-primary hover:bg-primary/90'
                        }`}
                        onClick={() => handleStripe(plan.name)}
                        disabled={loading}
                      >
                        {loading ? 'Procesando...' : user ? 'Pagar con Stripe' : 'Iniciar Sesión'}
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full h-12 text-base font-medium"
                        onClick={() => handlePayPal(plan.name)}
                        disabled={loading}
                      >
                        {loading ? 'Procesando...' : 'Pagar con PayPal'}
                      </Button>
                    </div>
                  )}
                </div>
                
                {/* Features Section */}
                <div className="flex-1">
                  <h4 className="font-semibold text-foreground mb-4 text-lg">Incluye:</h4>
                  <ul className="space-y-3">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start space-x-3">
                        <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-foreground leading-relaxed">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
      
      {/* Bottom CTA */}
      <div className="text-center mt-16">
        <p className="text-muted-foreground mb-4 text-lg">
          ¿Necesitas un plan personalizado para tu empresa?
        </p>
        <Button variant="outline" size="lg" className="h-12 px-8">
          Contactar Ventas
        </Button>
      </div>
    </div>
  );
};

export default PricingPlans;