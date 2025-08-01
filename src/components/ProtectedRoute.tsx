import { ReactNode, useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Lock, Crown, Zap } from 'lucide-react';

interface ProtectedRouteProps {
  children: ReactNode;
  requiresAuth?: boolean;
  requiresSubscription?: boolean;
  requiredTier?: 'basic' | 'premium';
  courseTier?: 'free' | 'basic' | 'premium';
}

const ProtectedRoute = ({ 
  children, 
  requiresAuth = true, 
  requiresSubscription = false,
  requiredTier,
  courseTier = 'free'
}: ProtectedRouteProps) => {
  const { user, loading: authLoading } = useAuth();
  const { subscription, loading: subLoading } = useSubscription();
  const location = useLocation();

  // MODO DEMO: Permitir acceso sin restricciones para todas las funcionalidades
  console.log('ProtectedRoute - ACCESO COMPLETO ACTIVADO - Sin restricciones de suscripción');
  return <>{children}</>;

  /* CÓDIGO ORIGINAL COMENTADO - SISTEMA DE VALIDACIONES COMPLETO
  const [accessGranted, setAccessGranted] = useState(false);

  useEffect(() => {
    if (authLoading || subLoading) return;

    // Check authentication
    if (requiresAuth && !user) {
      return;
    }

    // Check subscription requirements
    if (requiresSubscription || requiredTier || courseTier !== 'free') {
      const userTier = subscription.subscription_tier || 'free';
      
      // Free content is always accessible
      if (courseTier === 'free') {
        setAccessGranted(true);
        return;
      }

      // Basic content requires basic or premium subscription
      if (courseTier === 'basic' && (userTier === 'basic' || userTier === 'premium')) {
        setAccessGranted(true);
        return;
      }

      // Premium content requires premium subscription
      if (courseTier === 'premium' && userTier === 'premium') {
        setAccessGranted(true);
        return;
      }

      // If specific tier is required
      if (requiredTier) {
        if (requiredTier === 'basic' && (userTier === 'basic' || userTier === 'premium')) {
          setAccessGranted(true);
          return;
        }
        if (requiredTier === 'premium' && userTier === 'premium') {
          setAccessGranted(true);
          return;
        }
      }

      setAccessGranted(false);
      return;
    }

    setAccessGranted(true);
  }, [user, subscription, authLoading, subLoading, requiresAuth, requiresSubscription, requiredTier, courseTier]);

  // Show loading state
  if (authLoading || subLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Redirect to login if authentication is required
  if (requiresAuth && !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Show upgrade prompt if subscription is required but not available
  if (!accessGranted && (requiresSubscription || requiredTier || courseTier !== 'free')) {
    const getRequiredPlan = () => {
      if (courseTier === 'premium' || requiredTier === 'premium') return 'Premium';
      if (courseTier === 'basic' || requiredTier === 'basic') return 'Basic';
      return 'Basic';
    };

    const getUpgradeIcon = () => {
      const plan = getRequiredPlan();
      if (plan === 'Premium') return <Crown className="h-6 w-6" />;
      return <Zap className="h-6 w-6" />;
    };

    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 rounded-full bg-muted">
                <Lock className="h-8 w-8 text-muted-foreground" />
              </div>
            </div>
            <CardTitle className="text-2xl">Contenido Premium</CardTitle>
            <p className="text-muted-foreground">
              Este contenido requiere una suscripción {getRequiredPlan()} para acceder.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-center space-x-2">
              <Badge variant="secondary" className="flex items-center space-x-1">
                {getUpgradeIcon()}
                <span>Plan {getRequiredPlan()} Requerido</span>
              </Badge>
            </div>
            
            <div className="space-y-2">
              <Button 
                asChild 
                className="w-full"
              >
                <a href="/subscription">
                  Actualizar a {getRequiredPlan()}
                </a>
              </Button>
              
              <Button 
                variant="outline" 
                asChild 
                className="w-full"
              >
                <a href="/courses">
                  Ver Cursos Gratuitos
                </a>
              </Button>
            </div>

            <div className="text-center text-sm text-muted-foreground">
              <p>¿Ya tienes una suscripción?</p>
              <Button 
                variant="link" 
                onClick={() => window.location.reload()}
                className="p-0 h-auto"
              >
                Actualizar página
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  */
};

export default ProtectedRoute;