import { AdminLayout } from "@/components/admin/AdminLayout";
import useAdminAuth from "@/hooks/use-admin-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Edit,
  Trash2,
  Check,
  X,
  Crown,
  Star,
  Zap
} from "lucide-react";

// Mock data
const plans = [
  {
    id: 1,
    name: "Basic",
    price: 29,
    billingCycle: "monthly",
    description: "Perfecto para comenzar tu aprendizaje",
    features: [
      { name: "Acceso a 5 cursos", included: true },
      { name: "Soporte por email", included: true },
      { name: "Certificados", included: false },
      { name: "Mentoría 1:1", included: false },
      { name: "Acceso offline", included: false }
    ],
    subscribers: 856,
    revenue: "$24,824",
    status: "active",
    color: "primary"
  },
  {
    id: 2,
    name: "Premium", 
    price: 79,
    billingCycle: "monthly",
    description: "Para estudiantes serios que buscan más",
    features: [
      { name: "Acceso a todos los cursos", included: true },
      { name: "Soporte prioritario", included: true },
      { name: "Certificados", included: true },
      { name: "Mentoría 1:1 (2h/mes)", included: true },
      { name: "Acceso offline", included: false }
    ],
    subscribers: 298,
    revenue: "$23,542",
    status: "active",
    color: "success"
  },
  {
    id: 3,
    name: "Enterprise",
    price: 199,
    billingCycle: "monthly", 
    description: "Para equipos y organizaciones",
    features: [
      { name: "Acceso ilimitado", included: true },
      { name: "Soporte 24/7", included: true },
      { name: "Certificados", included: true },
      { name: "Mentoría 1:1 (4h/mes)", included: true },
      { name: "Acceso offline", included: true }
    ],
    subscribers: 49,
    revenue: "$9,751",
    status: "active",
    color: "warning"
  }
];

const planIcons = {
  Basic: Crown,
  Premium: Star, 
  Enterprise: Zap
};

export default function AdminPlans() {
  useAdminAuth();
  return (
    <AdminLayout>
      <div className="p-8 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Planes de Suscripción</h1>
            <p className="text-muted-foreground mt-2">
              Gestiona los planes y precios de tu plataforma
            </p>
          </div>
          <Button className="gap-2 bg-gradient-primary hover:opacity-90">
            <Plus className="h-4 w-4" />
            Crear Nuevo Plan
          </Button>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="shadow-card">
            <CardContent className="p-6">
              <div className="text-center">
                <p className="text-3xl font-bold">1,203</p>
                <p className="text-sm text-muted-foreground">Total Suscriptores</p>
                <p className="text-xs text-success mt-2">+12% este mes</p>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardContent className="p-6">
              <div className="text-center">
                <p className="text-3xl font-bold">$58,117</p>
                <p className="text-sm text-muted-foreground">Ingresos Mensuales</p>
                <p className="text-xs text-success mt-2">+8% este mes</p>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardContent className="p-6">
              <div className="text-center">
                <p className="text-3xl font-bold">$79</p>
                <p className="text-sm text-muted-foreground">Precio Promedio</p>
                <p className="text-xs text-muted-foreground mt-2">Por suscriptor</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {plans.map((plan) => {
            const IconComponent = planIcons[plan.name as keyof typeof planIcons];
            const colorClass = plan.color === "success" ? "border-success" : 
                             plan.color === "warning" ? "border-warning" : "border-primary";
            
            return (
              <Card key={plan.id} className={`shadow-card hover:shadow-elegant transition-all duration-300 ${colorClass} border-2`}>
                <CardHeader className="text-center pb-4">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <IconComponent className={`h-6 w-6 ${
                      plan.color === "success" ? "text-success" :
                      plan.color === "warning" ? "text-warning" : "text-primary"
                    }`} />
                    <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  </div>
                  <div className="text-4xl font-bold mb-2">
                    ${plan.price}
                    <span className="text-sm font-normal text-muted-foreground">/mes</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{plan.description}</p>
                  <Badge 
                    variant={plan.status === "active" ? "default" : "secondary"}
                    className={plan.status === "active" ? "bg-success text-success-foreground" : ""}
                  >
                    {plan.status === "active" ? "Activo" : "Inactivo"}
                  </Badge>
                </CardHeader>

                <CardContent className="space-y-6">
                  {/* Features */}
                  <div className="space-y-3">
                    {plan.features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-3">
                        {feature.included ? (
                          <Check className="h-4 w-4 text-success flex-shrink-0" />
                        ) : (
                          <X className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        )}
                        <span className={`text-sm ${
                          feature.included ? "text-foreground" : "text-muted-foreground"
                        }`}>
                          {feature.name}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Stats */}
                  <div className="pt-4 border-t border-border space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Suscriptores:</span>
                      <span className="font-medium">{plan.subscribers}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Ingresos:</span>
                      <span className="font-medium">{plan.revenue}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-4">
                    <Button variant="outline" size="sm" className="flex-1 gap-2">
                      <Edit className="h-4 w-4" />
                      Editar
                    </Button>
                    <Button variant="outline" size="sm" className="gap-2 text-destructive hover:text-destructive">
                      <Trash2 className="h-4 w-4" />
                      Eliminar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Pricing Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Conversión por Plan</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Basic Plan</span>
                    <span className="text-sm text-muted-foreground">71%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full" style={{ width: "71%" }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Premium Plan</span>
                    <span className="text-sm text-muted-foreground">25%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-success h-2 rounded-full" style={{ width: "25%" }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Enterprise Plan</span>
                    <span className="text-sm text-muted-foreground">4%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-warning h-2 rounded-full" style={{ width: "4%" }}></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Tendencias de Precios</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center bg-gradient-subtle rounded-lg">
                <p className="text-muted-foreground">Gráfico de tendencias aquí</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Plan Management Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="shadow-card hover:shadow-elegant transition-shadow duration-300 cursor-pointer">
            <CardContent className="p-6 text-center">
              <Plus className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Crear Nuevo Plan</h3>
              <p className="text-sm text-muted-foreground">
                Añade un nuevo plan de suscripción
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-card hover:shadow-elegant transition-shadow duration-300 cursor-pointer">
            <CardContent className="p-6 text-center">
              <Edit className="h-12 w-12 text-success mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Modificar Precios</h3>
              <p className="text-sm text-muted-foreground">
                Actualiza los precios existentes
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-card hover:shadow-elegant transition-shadow duration-300 cursor-pointer">
            <CardContent className="p-6 text-center">
              <Star className="h-12 w-12 text-warning mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Promociones</h3>
              <p className="text-sm text-muted-foreground">
                Gestiona descuentos y ofertas
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}