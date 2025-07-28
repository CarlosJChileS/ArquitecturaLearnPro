import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useEdgeFunction, useEnrollInCourse } from '@/hooks/useEdgeFunctions';
import { Search, Star, Clock, Users, BookOpen, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Course {
  id: string;
  title: string;
  description: string;
  image_url: string;
  instructor_name: string;
  instructor_id: string;
  duration_hours: number;
  level: 'beginner' | 'intermediate' | 'advanced';
  category: string;
  subscription_tier: 'free' | 'basic' | 'premium';
  rating: number;
  students_count: number;
  is_free: boolean;
  published: boolean;
  created_at: string;
  updated_at: string;
}

interface CourseFilters {
  category: string;
  level: string;
  subscriptionTier: string;
  search: string;
}

const CoursesPage: React.FC = () => {
  const { user, hasActiveSubscription, subscription } = useAuth();
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [filters, setFilters] = useState<CourseFilters>({
    category: '',
    level: '',
    subscriptionTier: '',
    search: ''
  });

  const { loading: coursesLoading } = useEdgeFunction(
    'course',
    'getAllCourses'
  );

  const { execute: enrollInCourse, loading: enrollLoading } = useEnrollInCourse({
    onSuccess: () => {
      // Refresh courses to update enrollment status
      loadCourses();
    }
  });

  useEffect(() => {
    loadCourses();
    loadCategories();
  }, []);

  useEffect(() => {
    filterCourses();
  }, [courses, filters]);

  const loadCourses = async () => {
    // Mock data for demonstration
    const mockCourses: Course[] = [
      {
        id: '1',
        title: 'Desarrollo Web Full Stack con React',
        description: 'Aprende a crear aplicaciones web completas desde cero con React, Node.js y bases de datos modernas.',
        image_url: '/placeholder.svg',
        instructor_name: 'Carlos Rodríguez',
        instructor_id: '1',
        duration_hours: 40,
        level: 'intermediate',
        category: 'Desarrollo Web',
        subscription_tier: 'premium',
        rating: 4.8,
        students_count: 1250,
        is_free: false,
        published: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: '2',
        title: 'Python para Principiantes',
        description: 'Curso introductorio completo de Python. Aprende desde variables hasta programación orientada a objetos.',
        image_url: '/placeholder.svg',
        instructor_name: 'María González',
        instructor_id: '2',
        duration_hours: 25,
        level: 'beginner',
        category: 'Programación',
        subscription_tier: 'basic',
        rating: 4.6,
        students_count: 2100,
        is_free: false,
        published: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: '3',
        title: 'Introducción al Machine Learning',
        description: 'Curso gratuito que te introduce al fascinante mundo del Machine Learning y la inteligencia artificial.',
        image_url: '/placeholder.svg',
        instructor_name: 'Dr. Luis Martínez',
        instructor_id: '3',
        duration_hours: 15,
        level: 'beginner',
        category: 'Data Science',
        subscription_tier: 'free',
        rating: 4.4,
        students_count: 3500,
        is_free: true,
        published: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: '4',
        title: 'Diseño UX/UI Moderno',
        description: 'Aprende a diseñar interfaces de usuario atractivas y funcionales con las mejores prácticas.',
        image_url: '/placeholder.svg',
        instructor_name: 'Ana Silva',
        instructor_id: '4',
        duration_hours: 30,
        level: 'intermediate',
        category: 'Diseño',
        subscription_tier: 'premium',
        rating: 4.9,
        students_count: 800,
        is_free: false,
        published: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: '5',
        title: 'Marketing Digital Efectivo',
        description: 'Estrategias probadas de marketing digital para hacer crecer tu negocio en línea.',
        image_url: '/placeholder.svg',
        instructor_name: 'Pedro Ramírez',
        instructor_id: '5',
        duration_hours: 20,
        level: 'beginner',
        category: 'Marketing Digital',
        subscription_tier: 'basic',
        rating: 4.5,
        students_count: 1800,
        is_free: false,
        published: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: '6',
        title: 'JavaScript Avanzado',
        description: 'Domina conceptos avanzados de JavaScript: closures, async/await, patrones de diseño y más.',
        image_url: '/placeholder.svg',
        instructor_name: 'Roberto López',
        instructor_id: '6',
        duration_hours: 35,
        level: 'advanced',
        category: 'Programación',
        subscription_tier: 'premium',
        rating: 4.7,
        students_count: 950,
        is_free: false,
        published: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];

    setCourses(mockCourses);
    
    // Uncomment this when you have real API
    // const result = await getAllCourses();
    // if (result.data) {
    //   setCourses(result.data);
    // }
  };

  const loadCategories = async () => {
    // Mock categories
    const mockCategories = [
      'Desarrollo Web',
      'Programación', 
      'Data Science',
      'Diseño',
      'Marketing Digital',
      'Negocios',
      'Fotografía',
      'Música'
    ];
    
    setCategories(mockCategories);
    
    // Uncomment this when you have real API
    // const result = await getCategories();
    // if (result.data) {
    //   setCategories(result.data.map((cat: any) => cat.name));
    // }
  };

  const filterCourses = () => {
    let filtered = [...courses];

    if (filters.search) {
      filtered = filtered.filter(course =>
        course.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        course.description.toLowerCase().includes(filters.search.toLowerCase()) ||
        course.instructor_name.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    if (filters.category) {
      filtered = filtered.filter(course => course.category === filters.category);
    }

    if (filters.level) {
      filtered = filtered.filter(course => course.level === filters.level);
    }

    if (filters.subscriptionTier) {
      filtered = filtered.filter(course => course.subscription_tier === filters.subscriptionTier);
    }

    setFilteredCourses(filtered);
  };

  const handleEnrollClick = async (course: Course) => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (course.is_free) {
      await enrollInCourse(course.id);
    } else if (hasActiveSubscription) {
      // Check if user's subscription tier allows access to this course
      const userSubscriptionTier = subscription?.subscription_tier || 'free';
      if (canAccessCourse(course.subscription_tier, userSubscriptionTier)) {
        await enrollInCourse(course.id);
      } else {
        navigate('/subscription');
      }
    } else {
      navigate('/subscription');
    }
  };

  const canAccessCourse = (courseSubscriptionTier: string, userSubscriptionTier: string) => {
    const tierHierarchy = { free: 0, basic: 1, premium: 2 };
    return tierHierarchy[userSubscriptionTier as keyof typeof tierHierarchy] >= 
           tierHierarchy[courseSubscriptionTier as keyof typeof tierHierarchy];
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'beginner':
        return 'bg-green-100 text-green-800';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800';
      case 'advanced':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getLevelText = (level: string) => {
    switch (level) {
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
        return 'bg-gray-100 text-gray-800';
      case 'basic':
        return 'bg-blue-100 text-blue-800';
      case 'premium':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
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

  if (coursesLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="h-64 bg-gray-200 rounded-lg"></div>
            <div className="h-64 bg-gray-200 rounded-lg"></div>
            <div className="h-64 bg-gray-200 rounded-lg"></div>
            <div className="h-64 bg-gray-200 rounded-lg"></div>
            <div className="h-64 bg-gray-200 rounded-lg"></div>
            <div className="h-64 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Catálogo de Cursos</h1>
        <p className="text-gray-600">
          Descubre y aprende con nuestros cursos especializados
        </p>
      </div>

      {/* Filters */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar cursos..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="pl-10"
              />
            </div>

            <select
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todas las categorías</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>

            <select
              value={filters.level}
              onChange={(e) => setFilters({ ...filters, level: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todos los niveles</option>
              <option value="beginner">Principiante</option>
              <option value="intermediate">Intermedio</option>
              <option value="advanced">Avanzado</option>
            </select>

            <select
              value={filters.subscriptionTier}
              onChange={(e) => setFilters({ ...filters, subscriptionTier: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todos los tiers</option>
              <option value="free">Gratis</option>
              <option value="basic">Basic</option>
              <option value="premium">Premium</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Results count */}
      <div className="mb-6">
        <p className="text-gray-600">
          Mostrando {filteredCourses.length} de {courses.length} cursos
        </p>
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCourses.map((course) => (
          <Card key={course.id} className="hover:shadow-lg transition-shadow cursor-pointer">
            <div className="relative">
              <button
                className="w-full h-48 object-cover rounded-t-lg cursor-pointer p-0 border-0 bg-transparent"
                onClick={() => navigate(`/course/${course.id}`)}
                type="button"
              >
                <img
                  src={course.image_url || '/placeholder.svg'}
                  alt={course.title}
                  className="w-full h-48 object-cover rounded-t-lg"
                />
              </button>
              <Badge 
                variant="secondary" 
                className={`absolute top-2 right-2 ${getLevelColor(course.level)}`}
              >
                {getLevelText(course.level)}
              </Badge>
              {course.is_free && (
                <Badge 
                  variant="secondary" 
                  className="absolute top-2 left-2 bg-green-100 text-green-800"
                >
                  Gratis
                </Badge>
              )}
            </div>
            
            <CardHeader>
              <CardTitle 
                className="line-clamp-2 cursor-pointer hover:text-blue-600"
                onClick={() => navigate(`/course/${course.id}`)}
              >
                {course.title}
              </CardTitle>
              <CardDescription className="line-clamp-2">
                {course.description}
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="flex items-center text-sm text-gray-600">
                <Users className="h-4 w-4 mr-1" />
                {course.instructor_name}
              </div>
              
              <div className="flex items-center justify-between text-sm text-gray-600">
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  {course.duration_hours} horas
                </div>
                <div className="flex items-center">
                  <Star className="h-4 w-4 mr-1 text-yellow-500 fill-current" />
                  {course.rating.toFixed(1)}
                </div>
              </div>

              <div className="flex items-center text-sm text-gray-600">
                <BookOpen className="h-4 w-4 mr-1" />
                {course.students_count} estudiantes
              </div>

              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  {course.is_free ? (
                    <Badge className="bg-green-100 text-green-800">Gratis</Badge>
                  ) : (
                    <Badge className={getSubscriptionTierColor(course.subscription_tier)}>
                      {getSubscriptionTierText(course.subscription_tier)}
                    </Badge>
                  )}
                </div>
                
                <Button
                  onClick={() => handleEnrollClick(course)}
                  disabled={enrollLoading}
                  className="min-w-[100px]"
                >
                  {(() => {
                    if (enrollLoading) return 'Procesando...';
                    if (course.is_free) return 'Inscribirse';
                    if (hasActiveSubscription) return 'Acceder';
                    return 'Suscribirse';
                  })()}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredCourses.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <BookOpen className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No se encontraron cursos
            </h3>
            <p className="text-gray-600 mb-4">
              Intenta ajustar los filtros para encontrar más cursos
            </p>
            <Button 
              variant="outline"
              onClick={() => setFilters({
                category: '',
                level: '',
                subscriptionTier: '',
                search: ''
              })}
            >
              Limpiar filtros
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CoursesPage;
