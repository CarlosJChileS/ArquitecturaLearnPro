import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Users, Star, Play } from "lucide-react";
import CoursePreviewModal from "./CoursePreviewModal";
import { useEdgeFunction } from "@/hooks/useEdgeFunctions";


interface Course {
  id: string;
  title: string;
  instructor_name: string;
  description: string;
  image_url: string;
  duration_hours: number;
  students_count: number;
  rating: number;
  level: string;
  category: string;
  subscription_tier: string;
  is_free: boolean;
  published: boolean;
}

const mockCourses = [
  {
    id: "1",
    title: "Desarrollo Web Full Stack",
    instructor_name: "Ana García",
    description: "Aprende React, Node.js y MongoDB desde cero hasta crear aplicaciones profesionales.",
    image_url: "/placeholder.svg",
    duration_hours: 24,
    students_count: 1234,
    rating: 4.8,
    level: "intermediate",
    category: "Desarrollo Web",
    subscription_tier: "premium",
    is_free: false,
    published: true
  },
  {
    id: "2",
    title: "Python para Data Science",
    instructor_name: "Carlos Mendoza",
    description: "Domina Python, Pandas, NumPy y Machine Learning para análisis de datos.",
    image_url: "/placeholder.svg",
    duration_hours: 32,
    students_count: 856,
    rating: 4.9,
    level: "advanced",
    category: "Data Science",
    subscription_tier: "premium",
    is_free: false,
    published: true
  },
  {
    id: "3",
    title: "Diseño UX/UI Profesional",
    instructor_name: "María López",
    description: "Crea interfaces excepcionales con Figma y principios de diseño centrado en el usuario.",
    image_url: "/placeholder.svg",
    duration_hours: 18,
    students_count: 2156,
    rating: 4.7,
    level: "beginner",
    category: "Diseño",
    subscription_tier: "basic",
    is_free: false,
    published: true
  },
  {
    id: "4",
    title: "Marketing Digital Avanzado",
    instructor_name: "José Rodríguez",
    description: "Estrategias completas de SEO, SEM, redes sociales y analytics para hacer crecer tu negocio.",
    image_url: "/placeholder.svg",
    duration_hours: 28,
    students_count: 1543,
    rating: 4.6,
    level: "intermediate",
    category: "Marketing",
    subscription_tier: "basic",
    is_free: false,
    published: true
  },
  {
    id: "5",
    title: "Inteligencia Artificial con Python",
    instructor_name: "Dr. Elena Vázquez",
    description: "Introducción práctica a IA, Machine Learning y redes neuronales.",
    image_url: "/placeholder.svg",
    duration_hours: 40,
    students_count: 689,
    rating: 4.9,
    level: "advanced",
    category: "IA",
    subscription_tier: "premium",
    is_free: false,
    published: true
  },
  {
    id: "6",
    title: "Finanzas Personales",
    instructor_name: "Roberto Santos",
    description: "Aprende a manejar tus finanzas, invertir y planificar tu futuro financiero.",
    image_url: "/placeholder.svg",
    duration_hours: 12,
    students_count: 3421,
    rating: 4.5,
    level: "beginner",
    category: "Finanzas",
    subscription_tier: "free",
    is_free: true,
    published: true
  }
];

const categories = ["Todos", "Desarrollo Web", "Data Science", "Diseño", "Marketing", "IA", "Finanzas"];

const CourseCatalog = () => {
  const [previewCourse, setPreviewCourse] = useState<Course | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<string[]>(["Todos"]);
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [loading, setLoading] = useState(true);

  const { execute: getAllCourses } = useEdgeFunction('course', 'getAllCourses');
  const { execute: getCategories } = useEdgeFunction('course', 'getCategories');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load courses
      const coursesResult = await getAllCourses();
      if (coursesResult.data) {
        // Show only published courses, limit to 6 for catalog preview
        const publishedCourses = coursesResult.data
          .filter((course: Course) => course.published)
          .slice(0, 6);
        setCourses(publishedCourses);
      } else {
        // Fallback to mock data if Edge Functions fail
        setCourses(mockCourses);
      }

      // Load categories
      const categoriesResult = await getCategories();
      if (categoriesResult.data) {
        const categoryNames = categoriesResult.data.map((cat: any) => cat.name);
        setCategories(["Todos", ...categoryNames]);
      }
    } catch (error) {
      console.error('Error loading catalog data:', error);
      // Fallback to mock data
      setCourses(mockCourses);
    } finally {
      setLoading(false);
    }
  };

  const filteredCourses = selectedCategory === "Todos" 
    ? courses 
    : courses.filter(course => course.category === selectedCategory);

  const getLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'principiante':
      case 'beginner':
        return "bg-green-600/80";
      case 'intermedio':
      case 'intermediate':
        return "bg-yellow-600/80";
      case 'avanzado':
      case 'advanced':
        return "bg-red-600/80";
      default:
        return "bg-blue-600/80";
    }
  };

  const getLevelText = (level: string) => {
    switch (level.toLowerCase()) {
      case 'beginner':
        return 'Principiante';
      case 'intermediate':
        return 'Intermedio';
      case 'advanced':
        return 'Avanzado';
      default:
        return level;
    }
  };

  const getSubscriptionTierColor = (tier: string) => {
    switch (tier) {
      case 'free':
        return 'bg-gray-600/80';
      case 'basic':
        return 'bg-blue-600/80';
      case 'premium':
        return 'bg-purple-600/80';
      default:
        return 'bg-gray-600/80';
    }
  };

  const getSubscriptionTierText = (tier: string) => {
    switch (tier) {
      case 'free':
        return 'Gratis';
      case 'basic':
        return 'Basic';
      case 'premium':
        return 'Premium';
      default:
        return tier;
    }
  };

  if (loading) {
    return (
      <section id="cursos" className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="h-12 bg-gray-200 rounded w-1/3 mx-auto mb-4 animate-pulse"></div>
            <div className="h-6 bg-gray-200 rounded w-2/3 mx-auto animate-pulse"></div>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((skeletonId) => (
              <div key={`course-skeleton-${skeletonId}`} className="h-96 bg-gray-200 rounded-lg animate-pulse"></div>
            ))}
          </div>
        </div>
      </section>
    );
  }
  return (
    <section id="cursos" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gradient">
            Catálogo de Cursos
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Accede a todos nuestros cursos premium con cualquier plan de suscripción
          </p>
          <div className="mt-6">
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-lg px-4 py-2">
              🎯 Todos los cursos incluidos en tu suscripción
            </Badge>
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-3 justify-center mb-12">
          {categories.map((category) => (
            <Button
              key={category}
              variant={category === selectedCategory ? "default" : "outline"}
              className={category === selectedCategory ? "bg-gradient-primary" : ""}
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </Button>
          ))}
        </div>

        {/* Courses Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredCourses.map((course, index) => (
            <Card 
              key={course.id} 
              className="group hover:shadow-glow transition-all duration-300 animate-scale-in border-0 bg-gradient-card overflow-hidden"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardHeader className="p-0">
                <div className="relative overflow-hidden">
                  <img 
                    src={course.image_url || "/placeholder.svg"} 
                    alt={course.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  <div className="absolute top-4 left-4">
                    <Badge variant="secondary" className="bg-white/90 text-foreground">
                      {course.category}
                    </Badge>
                  </div>
                  <div className="absolute top-4 right-4">
                    <Badge 
                      variant="outline" 
                      className={`border-white text-white ${getSubscriptionTierColor(course.subscription_tier)}`}
                    >
                      {getSubscriptionTierText(course.subscription_tier)}
                    </Badge>
                  </div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <Badge 
                      variant="outline" 
                      className={`border-white text-white mb-2 ${getLevelColor(course.level)}`}
                    >
                      {getLevelText(course.level)}
                    </Badge>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button 
                      size="sm" 
                      className="bg-white/20 backdrop-blur-sm border-white text-white hover:bg-white hover:text-primary"
                      onClick={(e) => {
                        e.preventDefault();
                        setPreviewCourse(course);
                      }}
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Vista previa
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-2 text-foreground group-hover:text-primary transition-colors">
                  {course.title}
                </h3>
                <p className="text-muted-foreground text-sm mb-3">
                  por {course.instructor_name}
                </p>
                <p className="text-foreground mb-4 line-clamp-2">
                  {course.description}
                </p>
                
                <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                  <div className="flex items-center space-x-1">
                    <Clock className="h-4 w-4" />
                    <span>{course.duration_hours}h</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Users className="h-4 w-4" />
                    <span>{course.students_count.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 fill-warning text-warning" />
                    <span>{course.rating.toFixed(1)}</span>
                  </div>
                </div>
                
                <a href="/courses">
                  <Button className="w-full bg-gradient-primary hover:opacity-90 transition-opacity">
                    Ver Curso
                  </Button>
                </a>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="text-center mt-12">
          <a href="/courses">
            <Button variant="outline" size="lg" className="hover:bg-primary hover:text-primary-foreground">
              Ver Todos los Cursos
            </Button>
          </a>
        </div>
        
        <CoursePreviewModal
          isOpen={!!previewCourse}
          onClose={() => setPreviewCourse(null)}
          course={previewCourse ? {
            id: parseInt(previewCourse.id),
            title: previewCourse.title,
            instructor: previewCourse.instructor_name,
            description: previewCourse.description,
            image: previewCourse.image_url,
            duration: `${previewCourse.duration_hours}h`,
            students: previewCourse.students_count,
            rating: previewCourse.rating,
            level: previewCourse.level,
            category: previewCourse.category,
          } : undefined}
        />
      </div>
    </section>
  );
};

export default CourseCatalog;