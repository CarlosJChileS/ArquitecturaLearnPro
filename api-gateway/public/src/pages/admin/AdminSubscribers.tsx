import { AdminLayout } from "@/components/admin/AdminLayout";
import useAdminAuth from "@/hooks/use-admin-auth";
import { DataTable } from "@/components/admin/DataTable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  Search, 
  Filter,
  Crown,
  DollarSign,
  TrendingUp,
  UserPlus
} from "lucide-react";

// Mock data
const subscribers = [
  {
    id: 1,
    name: "Carlos Mendoza",
    email: "carlos@email.com",
    plan: "Premium",
    status: "active",
    joined: "2024-01-20",
    lastActive: "2024-01-22",
    courses: 8,
    totalSpent: "$299"
  },
  {
    id: 2,
    name: "Ana López", 
    email: "ana@email.com",
    plan: "Basic",
    status: "active",
    joined: "2024-01-19",
    lastActive: "2024-01-21",
    courses: 3,
    totalSpent: "$99"
  },
  {
    id: 3,
    name: "Luis García",
    email: "luis@email.com", 
    plan: "Premium",
    status: "active",
    joined: "2024-01-18",
    lastActive: "2024-01-22",
    courses: 12,
    totalSpent: "$598"
  },
  {
    id: 4,
    name: "María Rodríguez",
    email: "maria@email.com",
    plan: "Enterprise", 
    status: "active",
    joined: "2024-01-15",
    lastActive: "2024-01-20",
    courses: 25,
    totalSpent: "$1,299"
  },
  {
    id: 5,
    name: "José Martín",
    email: "jose@email.com",
    plan: "Basic",
    status: "expired",
    joined: "2023-12-10",
    lastActive: "2024-01-05",
    courses: 2,
    totalSpent: "$99"
  }
];

const subscriberColumns = [
  { key: "name", label: "Nombre" },
  { key: "email", label: "Email" },
  { key: "plan", label: "Plan", type: "badge" as const },
  { key: "status", label: "Estado", type: "badge" as const },
  { key: "courses", label: "Cursos" },
  { key: "totalSpent", label: "Total Gastado" },
  { key: "joined", label: "Se Unió", type: "date" as const },
  { key: "actions", label: "Acciones", type: "actions" as const },
];

export default function AdminSubscribers() {
  useAdminAuth();
  return (
    <AdminLayout>
      <div className="p-8 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Suscriptores</h1>
            <p className="text-muted-foreground mt-2">
              Gestiona todos los usuarios suscritos a la plataforma
            </p>
          </div>
          <Button className="gap-2 bg-gradient-primary hover:opacity-90">
            <UserPlus className="h-4 w-4" />
            Invitar Usuario
          </Button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="shadow-card">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">2,847</p>
                  <p className="text-sm text-muted-foreground">Total Usuarios</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-success/10 rounded-lg">
                  <Crown className="h-6 w-6 text-success" />
                </div>
                <div>
                  <p className="text-2xl font-bold">1,203</p>
                  <p className="text-sm text-muted-foreground">Suscriptores Activos</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-warning/10 rounded-lg">
                  <DollarSign className="h-6 w-6 text-warning" />
                </div>
                <div>
                  <p className="text-2xl font-bold">$42,150</p>
                  <p className="text-sm text-muted-foreground">Ingresos Mensuales</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-destructive/10 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-destructive" />
                </div>
                <div>
                  <p className="text-2xl font-bold">89%</p>
                  <p className="text-sm text-muted-foreground">Tasa Retención</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Plans Distribution */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Badge variant="secondary">Basic</Badge>
                Plan Básico
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-2">856</div>
              <p className="text-sm text-muted-foreground">usuarios activos</p>
              <div className="mt-4">
                <div className="flex justify-between text-sm mb-1">
                  <span>$29/mes</span>
                  <span>71% del total</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div className="bg-primary h-2 rounded-full" style={{ width: "71%" }}></div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Badge className="bg-success text-success-foreground">Premium</Badge>
                Plan Premium
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-2">298</div>
              <p className="text-sm text-muted-foreground">usuarios activos</p>
              <div className="mt-4">
                <div className="flex justify-between text-sm mb-1">
                  <span>$79/mes</span>
                  <span>25% del total</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div className="bg-success h-2 rounded-full" style={{ width: "25%" }}></div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Badge className="bg-warning text-warning-foreground">Enterprise</Badge>
                Plan Enterprise
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-2">49</div>
              <p className="text-sm text-muted-foreground">usuarios activos</p>
              <div className="mt-4">
                <div className="flex justify-between text-sm mb-1">
                  <span>$199/mes</span>
                  <span>4% del total</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div className="bg-warning h-2 rounded-full" style={{ width: "4%" }}></div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Filtros y Búsqueda</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Buscar por nombre o email..." 
                    className="pl-10"
                  />
                </div>
              </div>
              <Button variant="outline" className="gap-2">
                <Filter className="h-4 w-4" />
                Filtrar por Plan
              </Button>
              <Button variant="outline" className="gap-2">
                <Filter className="h-4 w-4" />
                Filtrar por Estado
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Subscribers Table */}
        <DataTable
          title="Lista de Suscriptores"
          data={subscribers}
          columns={subscriberColumns}
          onEdit={(subscriber) => console.log("Edit subscriber:", subscriber)}
          onView={(subscriber) => console.log("View subscriber:", subscriber)}
        />

        {/* Recent Activity */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Actividad Reciente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg">
                <div className="w-2 h-2 bg-success rounded-full"></div>
                <div className="flex-1">
                  <p className="font-medium">Carlos Mendoza se suscribió al plan Premium</p>
                  <p className="text-sm text-muted-foreground">Hace 2 horas</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <div className="flex-1">
                  <p className="font-medium">Ana López completó el curso de React</p>
                  <p className="text-sm text-muted-foreground">Hace 4 horas</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg">
                <div className="w-2 h-2 bg-warning rounded-full"></div>
                <div className="flex-1">
                  <p className="font-medium">Luis García actualizó a plan Enterprise</p>
                  <p className="text-sm text-muted-foreground">Hace 6 horas</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}