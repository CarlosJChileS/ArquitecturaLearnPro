import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Users, Mail, Calendar, Search, Filter, MoreVertical, Eye, Edit, Trash2, 
  Shield, Crown, CreditCard, Download, ArrowLeft, Plus, Ban, UserCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { 
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger 
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

// Mock data
const users = [
  {
    id: 1,
    name: "María González",
    email: "maria@email.com",
    plan: "Premium",
    status: "Activo",
    joinDate: "2024-01-15",
    lastActivity: "2024-01-20",
    courses: 5,
    completedCourses: 2,
    totalSpent: 79.99,
    avatar: ""
  },
  {
    id: 2,
    name: "Carlos Rodríguez",
    email: "carlos@email.com",
    plan: "Básico",
    status: "Activo",
    joinDate: "2024-01-10",
    lastActivity: "2024-01-19",
    courses: 3,
    completedCourses: 1,
    totalSpent: 9.99,
    avatar: ""
  },
  {
    id: 3,
    name: "Ana López",
    email: "ana@email.com",
    plan: "Premium",
    status: "Suspendido",
    joinDate: "2023-12-20",
    lastActivity: "2024-01-05",
    courses: 8,
    completedCourses: 4,
    totalSpent: 159.98,
    avatar: ""
  },
  {
    id: 4,
    name: "José Martín",
    email: "jose@email.com",
    plan: "De por Vida",
    status: "Activo",
    joinDate: "2023-11-15",
    lastActivity: "2024-01-20",
    courses: 12,
    completedCourses: 8,
    totalSpent: 299.99,
    avatar: ""
  }
];

const AdminUsers = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("Todos");
  const [planFilter, setPlanFilter] = useState("Todos");
  const [selectedUser, setSelectedUser] = useState<any>(null);

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "Todos" || user.status === statusFilter;
    const matchesPlan = planFilter === "Todos" || user.plan === planFilter;
    
    return matchesSearch && matchesStatus && matchesPlan;
  });

  const handleUserAction = (action: string, userId: number) => {
    const user = users.find(u => u.id === userId);
    
    switch (action) {
      case "view":
        setSelectedUser(user);
        break;
      case "edit":
        toast({
          title: "Función en desarrollo",
          description: "La edición de usuarios estará disponible pronto."
        });
        break;
      case "suspend":
        toast({
          title: "Usuario suspendido",
          description: `${user?.name} ha sido suspendido temporalmente.`
        });
        break;
      case "activate":
        toast({
          title: "Usuario activado",
          description: `${user?.name} ha sido reactivado.`
        });
        break;
      case "delete":
        toast({
          title: "Usuario eliminado",
          description: `${user?.name} ha sido eliminado del sistema.`,
          variant: "destructive"
        });
        break;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      "Activo": "default",
      "Suspendido": "destructive",
      "Pendiente": "secondary"
    } as const;
    
    return <Badge variant={variants[status as keyof typeof variants]}>{status}</Badge>;
  };

  const getPlanIcon = (plan: string) => {
    switch (plan) {
      case "De por Vida":
        return <Crown className="h-4 w-4 text-yellow-600" />;
      case "Premium":
        return <Shield className="h-4 w-4 text-purple-600" />;
      default:
        return <Users className="h-4 w-4 text-blue-600" />;
    }
  };

  const stats = [
    { title: "Total Usuarios", value: users.length.toString(), icon: Users, color: "text-blue-600" },
    { title: "Usuarios Activos", value: users.filter(u => u.status === "Activo").length.toString(), icon: UserCheck, color: "text-green-600" },
    { title: "Ingresos Totales", value: `$${users.reduce((sum, u) => sum + u.totalSpent, 0).toFixed(2)}`, icon: CreditCard, color: "text-purple-600" },
    { title: "Nuevos este Mes", value: "12", icon: Calendar, color: "text-orange-600" }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={() => navigate("/admin/dashboard")}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver al Dashboard
              </Button>
              <div>
                <h1 className="text-2xl font-bold">Gestión de Usuarios</h1>
                <p className="text-muted-foreground">Administra todos los usuarios del sistema</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Exportar CSV
              </Button>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Usuario
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card key={index} className="hover:shadow-glow transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-full bg-muted ${stat.color}`}>
                    <stat.icon className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Filtros de Búsqueda</CardTitle>
              <Badge variant="outline">{filteredUsers.length} usuarios encontrados</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nombre o email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border border-border rounded-md px-3 py-2 bg-background"
              >
                <option value="Todos">Todos los estados</option>
                <option value="Activo">Activos</option>
                <option value="Suspendido">Suspendidos</option>
                <option value="Pendiente">Pendientes</option>
              </select>
              
              <select
                value={planFilter}
                onChange={(e) => setPlanFilter(e.target.value)}
                className="border border-border rounded-md px-3 py-2 bg-background"
              >
                <option value="Todos">Todos los planes</option>
                <option value="Básico">Básico</option>
                <option value="Premium">Premium</option>
                <option value="De por Vida">De por Vida</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle>Lista de Usuarios</CardTitle>
            <CardDescription>
              Gestiona y monitorea todos los usuarios registrados
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Usuario</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Progreso</TableHead>
                  <TableHead>Ingresos</TableHead>
                  <TableHead>Última Actividad</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center">
                          <span className="text-white font-medium">
                            {user.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium">{user.name}</p>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {getPlanIcon(user.plan)}
                        <span>{user.plan}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(user.status)}
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>{user.completedCourses}/{user.courses} cursos</span>
                        </div>
                        <div className="w-20 bg-muted rounded-full h-2">
                          <div 
                            className="bg-primary h-2 rounded-full" 
                            style={{ width: `${(user.completedCourses / user.courses) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium">${user.totalSpent}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{user.lastActivity}</span>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleUserAction("view", user.id)}>
                            <Eye className="h-4 w-4 mr-2" />
                            Ver Perfil
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleUserAction("edit", user.id)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {user.status === "Activo" ? (
                            <DropdownMenuItem onClick={() => handleUserAction("suspend", user.id)}>
                              <Ban className="h-4 w-4 mr-2" />
                              Suspender
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem onClick={() => handleUserAction("activate", user.id)}>
                              <UserCheck className="h-4 w-4 mr-2" />
                              Activar
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => handleUserAction("delete", user.id)}
                            className="text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {filteredUsers.length === 0 && (
              <div className="text-center py-12">
                <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No se encontraron usuarios</h3>
                <p className="text-muted-foreground">
                  Ajusta los filtros de búsqueda para encontrar usuarios
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* User Detail Modal */}
        <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Detalles del Usuario</DialogTitle>
              <DialogDescription>
                Información completa del usuario seleccionado
              </DialogDescription>
            </DialogHeader>
            
            {selectedUser && (
              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center">
                    <span className="text-white text-xl font-medium">
                      {selectedUser.name.split(' ').map((n: string) => n[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">{selectedUser.name}</h3>
                    <p className="text-muted-foreground">{selectedUser.email}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      {getPlanIcon(selectedUser.plan)}
                      <span className="text-sm">{selectedUser.plan}</span>
                      {getStatusBadge(selectedUser.status)}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Fecha de Registro</Label>
                    <p className="text-sm">{selectedUser.joinDate}</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Última Actividad</Label>
                    <p className="text-sm">{selectedUser.lastActivity}</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Cursos Inscritos</Label>
                    <p className="text-sm">{selectedUser.courses}</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Cursos Completados</Label>
                    <p className="text-sm">{selectedUser.completedCourses}</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Total Gastado</Label>
                    <p className="text-sm font-semibold">${selectedUser.totalSpent}</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Progreso General</Label>
                    <p className="text-sm">{Math.round((selectedUser.completedCourses / selectedUser.courses) * 100)}%</p>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Button variant="outline" className="flex-1">
                    <Mail className="h-4 w-4 mr-2" />
                    Enviar Email
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <Edit className="h-4 w-4 mr-2" />
                    Editar Usuario
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default AdminUsers;