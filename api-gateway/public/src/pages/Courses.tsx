import { useState } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Clock, Users, Star, Search, Filter } from "lucide-react";

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
    price: "Incluido en suscripción"
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
    price: "Incluido en suscripción"
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
    price: "Incluido en suscripción"
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
    price: "Incluido en suscripción"
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
    price: "Incluido en suscripción"
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
    price: "Incluido en suscripción"
  }
];

const categories = ["Todas", "Programación", "Frontend", "Backend", "Data Science", "Diseño", "DevOps"];
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
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent">
            Explora Nuestros Cursos
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Descubre una amplia variedad de cursos diseñados para llevar tus habilidades al siguiente nivel
          </p>
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

        {/* Courses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {filteredCourses.map((course) => (
            <Card key={course.id} className="group hover:shadow-glow transition-all duration-300 overflow-hidden">
              <div className="relative overflow-hidden">
                <img
                  src={course.image}
                  alt={course.title}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-4 left-4">
                  <Badge variant="secondary" className="bg-background/80 backdrop-blur-sm">
                    {course.category}
                  </Badge>
                </div>
                <div className="absolute top-4 right-4">
                  <Badge 
                    variant="outline" 
                    className={`bg-background/80 backdrop-blur-sm ${
                      course.level === 'Principiante' ? 'border-green-500 text-green-600' :
                      course.level === 'Intermedio' ? 'border-yellow-500 text-yellow-600' :
                      'border-red-500 text-red-600'
                    }`}
                  >
                    {course.level}
                  </Badge>
                </div>
              </div>
              
              <CardHeader>
                <CardTitle className="line-clamp-2 group-hover:text-primary transition-colors">
                  {course.title}
                </CardTitle>
                <CardDescription className="line-clamp-2">
                  {course.description}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="text-sm text-muted-foreground">
                  Por {course.instructor}
                </div>
                
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center space-x-1">
                    <Clock className="h-4 w-4" />
                    <span>{course.duration}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Users className="h-4 w-4" />
                    <span>{course.students.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span>{course.rating}</span>
                  </div>
                </div>
                
                <div className="pt-2">
                  <Link to={`/courses/${course.id}`}>
                    <Button className="w-full bg-gradient-primary hover:opacity-90 transition-opacity">
                      Ver Curso
                    </Button>
                  </Link>
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