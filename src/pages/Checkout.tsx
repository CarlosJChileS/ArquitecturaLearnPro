import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { CreditCard, Shield, CheckCircle, Lock } from 'lucide-react';
import { useSearchParams, Link } from 'react-router-dom';

const Checkout = () => {
  const [searchParams] = useSearchParams();
  const planType = searchParams.get('plan') || 'monthly';
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    country: '',
    zipCode: ''
  });

  const plans = {
    monthly: {
      name: 'Plan Mensual',
      price: 29,
      period: '/mes',
      features: ['Acceso a todos los cursos', 'Certificados de finalización', 'Soporte prioritario']
    },
    annual: {
      name: 'Plan Anual',
      price: 290,
      originalPrice: 348,
      period: '/año',
      savings: '17% de descuento',
      features: ['Acceso a todos los cursos', 'Certificados de finalización', 'Soporte prioritario', 'Contenido exclusivo']
    }
  } as const;

  const selectedPlan = plans[planType as keyof typeof plans];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here would be the payment processing logic
    console.log('Processing payment...', { planType, paymentMethod, formData });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">
              Finalizar Suscripción
            </h1>
            <p className="text-muted-foreground">Únete a miles de estudiantes que ya están aprendiendo</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Payment Form */}
            <div className="lg:col-span-2">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Account Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5 text-primary" />
                      Información de la Cuenta
                    </CardTitle>
                    <CardDescription>
                      Crea tu cuenta para acceder a todos los cursos
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="tu@email.com"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="firstName">Nombre</Label>
                        <Input
                          id="firstName"
                          placeholder="Juan"
                          value={formData.firstName}
                          onChange={(e) => handleInputChange('firstName', e.target.value)}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="lastName">Apellido</Label>
                        <Input
                          id="lastName"
                          placeholder="Pérez"
                          value={formData.lastName}
                          onChange={(e) => handleInputChange('lastName', e.target.value)}
                          required
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Payment Method */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CreditCard className="h-5 w-5 text-primary" />
                      Método de Pago
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="card" id="card" />
                        <Label htmlFor="card" className="flex items-center gap-2">
                          <CreditCard className="h-4 w-4" />
                          Tarjeta de Crédito/Débito
                        </Label>
                      </div>
                    </RadioGroup>

                    {paymentMethod === 'card' && (
                      <div className="space-y-4 mt-4">
                        <div>
                          <Label htmlFor="cardNumber">Número de Tarjeta</Label>
                          <Input
                            id="cardNumber"
                            placeholder="1234 5678 9012 3456"
                            value={formData.cardNumber}
                            onChange={(e) => handleInputChange('cardNumber', e.target.value)}
                            required
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="expiryDate">Fecha de Vencimiento</Label>
                            <Input
                              id="expiryDate"
                              placeholder="MM/AA"
                              value={formData.expiryDate}
                              onChange={(e) => handleInputChange('expiryDate', e.target.value)}
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="cvv">CVV</Label>
                            <Input
                              id="cvv"
                              placeholder="123"
                              value={formData.cvv}
                              onChange={(e) => handleInputChange('cvv', e.target.value)}
                              required
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="country">País</Label>
                            <Input
                              id="country"
                              placeholder="España"
                              value={formData.country}
                              onChange={(e) => handleInputChange('country', e.target.value)}
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="zipCode">Código Postal</Label>
                            <Input
                              id="zipCode"
                              placeholder="28001"
                              value={formData.zipCode}
                              onChange={(e) => handleInputChange('zipCode', e.target.value)}
                              required
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Terms */}
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-start space-x-2">
                      <Checkbox id="terms" required />
                      <Label htmlFor="terms" className="text-sm leading-relaxed">
                        Acepto los <Link to="#" className="text-primary hover:underline">términos y condiciones</Link> y la{' '}
                        <Link to="#" className="text-primary hover:underline">política de privacidad</Link>.
                        Entiendo que mi suscripción se renovará automáticamente.
                      </Label>
                    </div>
                  </CardContent>
                </Card>
              </form>
            </div>

            {/* Order Summary */}
            <div>
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle>Resumen del Pedido</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">{selectedPlan.name}</h3>
                      {'savings' in selectedPlan && selectedPlan.savings && (
                        <Badge variant="secondary" className="text-xs mt-1">
                          {selectedPlan.savings}
                        </Badge>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-lg">€{selectedPlan.price}{selectedPlan.period}</div>
                      {'originalPrice' in selectedPlan && selectedPlan.originalPrice && (
                        <div className="text-sm text-muted-foreground line-through">
                          €{selectedPlan.originalPrice}/año
                        </div>
                      )}
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <h4 className="font-medium">Incluye:</h4>
                    {selectedPlan.features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        {feature}
                      </div>
                    ))}
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>€{selectedPlan.price}{selectedPlan.period}</span>
                  </div>

                  <Button 
                    type="submit" 
                    form="checkout-form"
                    className="w-full bg-gradient-primary hover:opacity-90 transition-opacity"
                    onClick={handleSubmit}
                  >
                    <Lock className="h-4 w-4 mr-2" />
                    Completar Suscripción
                  </Button>

                  <div className="text-center">
                    <p className="text-xs text-muted-foreground">
                      Pago seguro con encriptación SSL
                    </p>
                  </div>

                  <div className="text-center">
                    <Link to="/" className="text-sm text-primary hover:underline">
                      ← Volver al inicio
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;