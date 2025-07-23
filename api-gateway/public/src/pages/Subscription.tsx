import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { CreditCard, Calendar, Download, Settings, AlertCircle, CheckCircle, Crown, ChevronLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const Subscription = () => {
  const [currentPlan, setCurrentPlan] = useState('premium');
  const navigate = useNavigate();
  
  const subscription = {
    plan: 'premium',
    status: 'active',
    price: 79,
    currency: 'USD',
    nextBilling: '2024-08-20',
    startDate: '2023-08-20',
    autoRenew: true
  };

  const usage = {
    coursesCompleted: 12,
    totalCourses: 50,
    hoursLearned: 145,
    certificatesEarned: 8
  };

  const billingHistory = [
    { date: '2024-07-20', amount: 290, status: 'paid', invoice: 'INV-2024-07-001' },
    { date: '2023-08-20', amount: 290, status: 'paid', invoice: 'INV-2023-08-001' },
    { date: '2023-07-20', amount: 29, status: 'paid', invoice: 'INV-2023-07-001' }
  ];

  const availablePlans = [
    {
      id: 'basic',
      name: 'Plan Básico',
      price: 29,
      period: '/mes',
      features: ['Acceso a 5 cursos', 'Soporte por email']
    },
    {
      id: 'premium',
      name: 'Plan Premium',
      price: 79,
      period: '/mes',
      features: ['Acceso a todos los cursos', 'Soporte prioritario', 'Certificados', 'Mentoría 1:1 (2h/mes)']
    },
    {
      id: 'enterprise',
      name: 'Plan Enterprise',
      price: 199,
      period: '/mes',
      features: ['Acceso ilimitado', 'Soporte 24/7', 'Certificados', 'Mentoría 1:1 (4h/mes)', 'Acceso offline']
    }
  ];

  const selectedPlan = availablePlans.find((p) => p.id === subscription.plan) || availablePlans[0];

  const handleCancelSubscription = () => {
    console.log('Canceling subscription...');
  };

  const handleChangePlan = (planId: string) => {
    setCurrentPlan(planId);
    console.log('Changing to plan:', planId);
  };

  const handleStripePayment = async () => {
    const res = await fetch('/payments/stripe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ planId: currentPlan, amount: selectedPlan.price }),
    });
    const data = await res.json();
    if (data.url) {
      window.location.href = data.url;
    }
  };

  const handlePaypalPayment = async () => {
    const res = await fetch('/payments/paypal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ planId: currentPlan, amount: selectedPlan.price }),
    });
    const data = await res.json();
    if (data.approvalUrl) {
      window.location.href = data.approvalUrl;
    }
  };

  const completionPercentage = (usage.coursesCompleted / usage.totalCourses) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Button
              variant="ghost"
              onClick={() => navigate(-1)}
              className="mb-2 inline-flex items-center"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Volver
            </Button>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">
              Mi Suscripción
            </h1>
            <p className="text-muted-foreground">Gestiona tu plan y facturación</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Current Subscription */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Crown className="h-5 w-5 text-primary" />
                      Plan Actual
                    </div>
                    <Badge variant={subscription.status === 'active' ? 'default' : 'destructive'}>
                      {subscription.status === 'active' ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-semibold">{selectedPlan.name}</h3>
                      <p className="text-muted-foreground">Renovación automática activa</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold">${subscription.price}{selectedPlan.period}</div>
                      <div className="text-sm text-muted-foreground">
                        Próxima facturación: {new Date(subscription.nextBilling).toLocaleDateString('es-ES')}
                      </div>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Inicio de suscripción</span>
                    <span className="text-sm">{new Date(subscription.startDate).toLocaleDateString('es-ES')}</span>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Settings className="h-4 w-4 mr-2" />
                      Cambiar Plan
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <AlertCircle className="h-4 w-4 mr-2" />
                          Cancelar
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>¿Cancelar suscripción?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Tu suscripción seguirá activa hasta el {new Date(subscription.nextBilling).toLocaleDateString('es-ES')}. 
                            Después perderás el acceso a todos los cursos premium.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Mantener Suscripción</AlertDialogCancel>
                          <AlertDialogAction onClick={handleCancelSubscription} className="bg-destructive hover:bg-destructive/90">
                            Confirmar Cancelación
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardContent>
              </Card>

              {/* Payment Gateways */}
              <Card>
                <CardHeader>
                  <CardTitle>Métodos de Pago</CardTitle>
                  <CardDescription>Selecciona tu pasarela de pago</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button className="w-full" onClick={handleStripePayment}>
                    Pagar con Stripe
                  </Button>
                  <Button className="w-full" onClick={handlePaypalPayment}>
                    Pagar con PayPal
                  </Button>
                </CardContent>
              </Card>

              {/* Usage Stats */}
              <Card>
                <CardHeader>
                  <CardTitle>Estadísticas de Uso</CardTitle>
                  <CardDescription>Tu progreso en la plataforma</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-primary">{usage.coursesCompleted}</div>
                      <div className="text-sm text-muted-foreground">Cursos Completados</div>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-secondary">{usage.hoursLearned}</div>
                      <div className="text-sm text-muted-foreground">Horas de Aprendizaje</div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Progreso General</span>
                      <span className="text-sm text-muted-foreground">{Math.round(completionPercentage)}%</span>
                    </div>
                    <Progress value={completionPercentage} className="h-2" />
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="text-sm">{usage.certificatesEarned} certificados obtenidos</span>
                  </div>
                </CardContent>
              </Card>

              {/* Billing History */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-primary" />
                    Historial de Facturación
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {billingHistory.map((bill) => (
                      <div key={bill.invoice} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                        <div>
                          <div className="font-medium">{new Date(bill.date).toLocaleDateString('es-ES')}</div>
                          <div className="text-sm text-muted-foreground">{bill.invoice}</div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <div className="font-medium">${bill.amount}</div>
                            <Badge variant={bill.status === 'paid' ? 'default' : 'destructive'} className="text-xs">
                              {bill.status === 'paid' ? 'Pagado' : 'Pendiente'}
                            </Badge>
                          </div>
                          <Button variant="outline" size="sm">
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Plan Options */}
              <Card>
                <CardHeader>
                  <CardTitle>Cambiar Plan</CardTitle>
                  <CardDescription>Elige el plan que mejor se adapte a ti</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {availablePlans.map((plan) => (
                    <div 
                      key={plan.id} 
                      className={`p-4 border rounded-lg cursor-pointer transition-all ${
                        currentPlan === plan.id ? 'border-primary bg-primary/5' : 'hover:border-primary/50'
                      }`}
                      onClick={() => handleChangePlan(plan.id)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold">{plan.name}</h3>
                        {plan.savings && (
                          <Badge variant="secondary" className="text-xs">
                            {plan.savings}
                          </Badge>
                        )}
                      </div>
                      <div className="text-lg font-bold">${plan.price}{plan.period}</div>
                      {plan.originalPrice && (
                        <div className="text-sm text-muted-foreground line-through">
                          ${plan.originalPrice}/año
                        </div>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Acciones Rápidas</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Link to="/dashboard">
                    <Button variant="outline" className="w-full justify-start">
                      <Calendar className="h-4 w-4 mr-2" />
                      Ir al Dashboard
                    </Button>
                  </Link>
                  <Button variant="outline" className="w-full justify-start">
                    <Download className="h-4 w-4 mr-2" />
                    Descargar Certificados
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Settings className="h-4 w-4 mr-2" />
                    Configuración
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Subscription;