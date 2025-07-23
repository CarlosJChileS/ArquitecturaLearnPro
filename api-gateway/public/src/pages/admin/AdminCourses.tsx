import { AdminLayout } from "@/components/admin/AdminLayout";
import useAdminAuth from "@/hooks/use-admin-auth";
import { DataTable } from "@/components/admin/DataTable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Search, 
  Filter,
  BookOpen,
  Users,
  Clock
} from "lucide-react";

// Mock data
const courses = [
  {
    id: 1,
    title: "Desarrollo Web Completo con React",
    description: "Aprende React desde cero hasta nivel avanzado",
    students: 245,
    lessons: 42,
    duration: "8h 30m",
    status: "published",
    price: "$99",
    created: "2024-01-15",
    category: "Desarrollo Web"
  },
  {
    id: 2,
    title: "Python para Ciencia de Datos",
    description: "Domina Python para análisis de datos y ML",
    students: 189,
    lessons: 35,
    duration: "12h 15m",
    status: "published",
    price: "$149",
    created: "2024-01-10",
    category: "Data Science"
  },
  {
    id: 3,
    title: "Node.js y Express Básico",
    description: "Backend development con Node.js",
    students: 98,
    lessons: 28,
    duration: "6h 45m",
    status: "draft",
    price: "$79",
    created: "2024-01-08",
    category: "Backend"
  },
  {
    id: 4,
    title: "Design System con Figma",
    description: "Crea sistemas de diseño profesionales",
    students: 156,
    lessons: 22,
    duration: "5h 20m",
    status: "published",
    price: "$129",
    created: "2024-01-05",
    category: "Diseño"
  }
];

const courseColumns = [
  { key: "title", label: "Curso" },
  { key: "category", label: "Categoría" },
  { key: "students", label: "Estudiantes" },
  { key: "lessons", label: "Lecciones" },
  { key: "duration", label: "Duración" },
  { key: "status", label: "Estado", type: "badge" as const },
  { key: "price", label: "Precio" },
  { key: "actions", label: "Acciones", type: "actions" as const },
];

export default function AdminCourses() {
  useAdminAuth();
  return (
    <AdminLayout>
      <div className="p-8 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Gestión de Cursos</h1>
            <p className="text-muted-foreground mt-2">
              Administra todos los cursos de la plataforma
            </p>
          </div>
          <Button className="gap-2 bg-gradient-primary hover:opacity-90">
            <Plus className="h-4 w-4" />
            Crear Curso
          </Button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="shadow-card">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <BookOpen className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">24</p>
                  <p className="text-sm text-muted-foreground">Total Cursos</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-success/10 rounded-lg">
                  <Users className="h-6 w-6 text-success" />
                </div>
                <div>
                  <p className="text-2xl font-bold">688</p>
                  <p className="text-sm text-muted-foreground">Total Estudiantes</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-warning/10 rounded-lg">
                  <Clock className="h-6 w-6 text-warning" />
                </div>
                <div>
                  <p className="text-2xl font-bold">32h</p>
                  <p className="text-sm text-muted-foreground">Contenido Total</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Filtros</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Buscar cursos..." 
                    className="pl-10"
                  />
                </div>
              </div>
              <Button variant="outline" className="gap-2">
                <Filter className="h-4 w-4" />
                Filtros
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Courses Table */}
        <DataTable
          title="Lista de Cursos"
          data={courses}
          columns={courseColumns}
          onEdit={(course) => console.log("Edit course:", course)}
          onDelete={(course) => console.log("Delete course:", course)}
          onView={(course) => console.log("View course:", course)}
        />

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="shadow-card hover:shadow-elegant transition-shadow duration-300 cursor-pointer">
            <CardContent className="p-6 text-center">
              <Plus className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Crear Nuevo Curso</h3>
              <p className="text-sm text-muted-foreground">
                Empieza a crear un curso desde cero
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-card hover:shadow-elegant transition-shadow duration-300 cursor-pointer">
            <CardContent className="p-6 text-center">
              <BookOpen className="h-12 w-12 text-success mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Importar Contenido</h3>
              <p className="text-sm text-muted-foreground">
                Importa cursos desde otras plataformas
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-card hover:shadow-elegant transition-shadow duration-300 cursor-pointer">
            <CardContent className="p-6 text-center">
              <Users className="h-12 w-12 text-warning mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Gestionar Categorías</h3>
              <p className="text-sm text-muted-foreground">
                Organiza tus cursos por categorías
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}