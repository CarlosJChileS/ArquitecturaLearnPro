import { useState } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Clock, Users, Star, Search, Filter, Play } from "lucide-react";

const courses = [
  {
    id: 1,
    title: "JavaScript Moderno: ES6+",
    description: "Aprende las características más recientes de JavaScript incluyendo ES6, ES7 y más allá.",
    image: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&h=400&fit=crop",
    instructor: "María González",
    duration: "12 horas",
    students: 2840,
    rating: 4.8,
    level: "Intermedio",
    category: "Programación",
    included: true
  },
  {
    id: 2,
    title: "React Avanzado",
    description: "Domina React con hooks, context, suspense y las mejores prácticas de desarrollo.",
    image: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=800&h=400&fit=crop",
    instructor: "Carlos Rodríguez",
    duration: "15 horas",
    students: 1920,
    rating: 4.9,
    level: "Avanzado",
    category: "Frontend",
    included: true
  },
  {
    id: 3,
    title: "Node.js y Express",
    description: "Desarrolla APIs robustas y aplicaciones backend con Node.js y Express.",
    image: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&h=400&fit=crop",
    instructor: "Ana Martínez",
    duration: "10 horas",
    students: 1650,
    rating: 4.7,
    level: "Intermedio",
    category: "Backend",
    included: true
  },
  {
    id: 4,
    title: "Python para Data Science",
    description: "Análisis de datos, visualización y machine learning con Python, pandas y scikit-learn.",
    image: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&h=400&fit=crop",
    instructor: "Luis Hernández",
    duration: "18 horas",
    students: 3200,
    rating: 4.9,
    level: "Intermedio",
    category: "Data Science",
    included: true
  },
  {
    id: 5,
    title: "UI/UX Design Fundamentals",
    description: "Principios de diseño, prototipado y experiencia de usuario para crear interfaces efectivas.",
    image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&h=400&fit=crop",
    instructor: "Sara López",
    duration: "14 horas",
    students: 2100,
    rating: 4.6,
    level: "Principiante",
    category: "Diseño",
    included: true
  },
  {
    id: 6,
    title: "DevOps con Docker y Kubernetes",
    description: "Containerización, orquestación y deployment automatizado en la nube.",
    image: "https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7?w=800&h=400&fit=crop",
    instructor: "Miguel Torres",
    duration: "16 horas",
    students: 1480,
    rating: 4.8,
    level: "Avanzado",
    category: "DevOps",
    included: true
  },
  {
    id: 7,
    title: "Machine Learning con TensorFlow",
    description: "Construye modelos de IA y deep learning desde cero hasta producción.",
    image: "https://images.unsplash.com/photo-1507146426996-ef05306b995a?w=800&h=400&fit=crop",
    instructor: "Dr. Patricia Ruiz",
    duration: "22 horas",
    students: 1890,
    rating: 4.9,
    level: "Avanzado",
    category: "IA/ML",
    included: true
  },
  {
    id: 8,
    title: "Ciberseguridad Ética",
    description: "Aprende hacking ético, pentesting y seguridad informática para proteger sistemas.",
    image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&h=400&fit=crop",
    instructor: "Carlos Segura",
    duration: "20 horas",
    students: 1320,
    rating: 4.7,
    level: "Avanzado",
    category: "Seguridad",
    included: true
  }
];

const categories = ["Todas", "Programación", "Frontend", "Backend", "Data Science", "Diseño", "DevOps", "IA/ML", "Seguridad"];
const levels = ["Todos", "Principiante", "Intermedio", "Avanzado"];

const Courses = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todas");
  const [selectedLevel, setSelectedLevel] = useState("Todos");

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "Todas" || course.category === selectedCategory;
    const matchesLevel = selectedLevel === "Todos" || course.level === selectedLevel;
    
    return matchesSearch && matchesCategory && matchesLevel;
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Header Section - Udemy style */}
        <div className="bg-gray-900 text-white p-8 rounded-lg mb-8">
          <div className="max-w-4xl">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              Un amplio catálogo de cursos
            </h1>
            <p className="text-lg text-gray-300 mb-6">
              Elige entre más de 1,000 cursos con contenido actualizado. Todos incluidos en tu suscripción.
            </p>
            <div className="flex flex-wrap gap-3">
              <Badge className="bg-green-600 text-white px-3 py-1">
                ✅ Todos los cursos incluidos
              </Badge>
              <Badge className="bg-blue-600 text-white px-3 py-1">
                📱 Acceso móvil
              </Badge>
              <Badge className="bg-purple-600 text-white px-3 py-1">
                🎓 Certificados al completar
              </Badge>
              <Badge className="bg-orange-600 text-white px-3 py-1">
                📺 Contenido offline
              </Badge>
            </div>
          </div>
        </div>

        {/* Filters Section */}
        <div className="mb-8 space-y-4 md:space-y-0 md:flex md:items-center md:space-x-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Buscar cursos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex space-x-4">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Categoría" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedLevel} onValueChange={setSelectedLevel}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Nivel" />
              </SelectTrigger>
              <SelectContent>
                {levels.map(level => (
                  <SelectItem key={level} value={level}>
                    {level}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-muted-foreground">
            Mostrando {filteredCourses.length} curso{filteredCourses.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Courses Grid - Udemy style */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
          {filteredCourses.map((course) => (
            <Card key={course.id} className="group hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-200 bg-white">
              <div className="relative overflow-hidden">
                <img
                  src={course.image}
                  alt={course.title}
                  className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {/* Subscription badge */}
                <div className="absolute top-3 left-3">
                  <Badge className="bg-green-600 text-white text-xs font-medium">
                    ✅ Incluido
                  </Badge>
                </div>
                {/* Level badge */}
                <div className="absolute top-3 right-3">
                  <Badge 
                    variant="secondary" 
                    className={`text-xs font-medium ${
                      course.level === 'Principiante' ? 'bg-green-100 text-green-800' :
                      course.level === 'Intermedio' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}
                  >
                    {course.level}
                  </Badge>
                </div>
                
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <Button size="sm" className="bg-white text-gray-900 hover:bg-gray-100">
                    <Play className="w-4 h-4 mr-1" />
                    Vista previa
                  </Button>
                </div>
              </div>
              
              <CardContent className="p-4">
                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-900 line-clamp-2 text-base leading-tight group-hover:text-purple-600 transition-colors">
                    {course.title}
                  </h3>
                  
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {course.description}
                  </p>
                  
                  <div className="text-sm text-gray-500">
                    {course.instructor}
                  </div>
                  
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-1">
                        <Clock className="h-3 w-3" />
                        <span>{course.duration}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Users className="h-3 w-3" />
                        <span>{course.students.toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      <span className="font-medium">{course.rating}</span>
                    </div>
                  </div>
                  
                  <div className="pt-2 border-t border-gray-100">
                    <Link to={`/courses/${course.id}`}>
                      <Button className="w-full bg-gray-900 hover:bg-gray-800 text-white text-sm py-2">
                        Ir al curso
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* No Results */}
        {filteredCourses.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-2xl font-semibold mb-2">No se encontraron cursos</h3>
            <p className="text-muted-foreground mb-6">
              Intenta ajustar tus filtros de búsqueda
            </p>
            <Button 
              onClick={() => {
                setSearchTerm("");
                setSelectedCategory("Todas");
                setSelectedLevel("Todos");
              }}
              variant="outline"
            >
              Limpiar Filtros
            </Button>
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
};

export default Courses;