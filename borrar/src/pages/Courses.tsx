import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useEdgeFunction } from '@/hooks/useEdgeFunctions';
import { Search, Star, Clock, Users, BookOpen, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCreateCheckout, useEnrollInCourse } from '@/hooks/useEdgeFunctions';
import { supabase } from '@/lib/supabase-mvp';
import { useToast } from '@/hooks/use-toast';

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
  price: number;
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
  priceRange: string;
  search: string;
}

const CoursesPage: React.FC = () => {
  const { user } = useAuth();
  const { subscription } = useSubscription();
  const hasActiveSubscription =
    subscription.subscribed &&
    subscription.subscription_end &&
    new Date(subscription.subscription_end) > new Date();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [userEnrollments, setUserEnrollments] = useState<Set<string>>(new Set());
  const [filters, setFilters] = useState<CourseFilters>({
    category: '',
    level: '',
    priceRange: '',
    search: ''
  });

  const { execute: getAllCourses, loading: coursesLoading } = useEdgeFunction(
    'course',
    'getAllCourses',
    { requireSession: false }
  );

  const { execute: getCategories } = useEdgeFunction(
    'course',
    'getCategories',
    { requireSession: false }
  );

  const { execute: createCheckout, loading: checkoutLoading } = useCreateCheckout({
    onSuccess: (data) => {
      if (data.url) {
        window.location.href = data.url;
      }
    }
  });

  const { execute: enrollInCourse, loading: enrollLoading } = useEnrollInCourse({
    onSuccess: () => {
      // Refresh courses to update enrollment status
      loadCourses();
    }
  });

  useEffect(() => {
    loadCourses();
    loadCategories();
    if (user) {
      loadUserEnrollments();
    }
  }, [user]);

  useEffect(() => {
    filterCourses();
  }, [courses, filters]);

  const loadCourses = async () => {
    const result = await getAllCourses();
    if (result.data) {
      setCourses(result.data);
    }
  };

  const loadCategories = async () => {
    const result = await getCategories();
    if (result.data) {
      setCategories(result.data.map((cat: any) => cat.name));
    }
  };

  const loadUserEnrollments = async () => {
    if (!user) return;
    
    try {
      const { data: enrollments, error } = await supabase
        .from('course_enrollments')
        .select('course_id')
        .eq('user_id', user.id);
      
      if (error) {
        console.error('Error loading user enrollments:', error);
      } else if (enrollments) {
        const enrollmentIds = new Set(enrollments.map(e => e.course_id));
        setUserEnrollments(enrollmentIds);
      }
    } catch (error) {
      console.error('Error loading user enrollments:', error);
    }
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

    if (filters.priceRange) {
      switch (filters.priceRange) {
        case 'free':
          filtered = filtered.filter(course => course.is_free);
          break;
        case 'under50':
          filtered = filtered.filter(course => !course.is_free && course.price < 50);
          break;
        case '50to100':
          filtered = filtered.filter(course => !course.is_free && course.price >= 50 && course.price <= 100);
          break;
        case 'over100':
          filtered = filtered.filter(course => !course.is_free && course.price > 100);
          break;
      }
    }

    setFilteredCourses(filtered);
  };

  const handleEnrollClick = async (course: Course) => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      // Inscripción directa en la base de datos sin Edge Functions
      const { data, error } = await supabase
        .from('course_enrollments')
        .insert({
          user_id: user.id,
          course_id: course.id,
          enrolled_at: new Date().toISOString(),
          progress_percentage: 0
        })
        .select()
        .single();

      if (error) {
        if (error.code === '23505') { // Duplicate key error
          toast({
            title: "Ya estás inscrito",
            description: "Ya estás inscrito en este curso",
            variant: "default",
          });
        } else {
          throw error;
        }
      } else {
        toast({
          title: "¡Inscripción exitosa!",
          description: `Te has inscrito exitosamente en "${course.title}"`,
        });
        
        // Actualizar el estado de inscripciones
        setUserEnrollments(prev => new Set([...prev, course.id]));
        
        // Navegar al curso después de la inscripción
        navigate(`/courses/${course.id}`);
      }
    } catch (error) {
      console.error('Error enrolling in course:', error);
      toast({
        title: "Error",
        description: "Error al inscribirse en el curso. Inténtalo de nuevo.",
        variant: "destructive",
      });
    }
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
              value={filters.priceRange}
              onChange={(e) => setFilters({ ...filters, priceRange: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todos los precios</option>
              <option value="free">Gratis</option>
              <option value="under50">Menos de $50</option>
              <option value="50to100">$50 - $100</option>
              <option value="over100">Más de $100</option>
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
              <img
                src={course.image_url || '/placeholder.svg'}
                alt={course.title}
                className="w-full h-48 object-cover rounded-t-lg"
                onClick={() => navigate(`/courses/${course.id}`)}
              />
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
                onClick={() => navigate(`/courses/${course.id}`)}
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
                <div className="text-lg font-bold">
                  {course.is_free ? (
                    <span className="text-green-600">Gratis</span>
                  ) : (
                    <span>${course.price}</span>
                  )}
                </div>
                
                <Button
                  onClick={() => {
                    if (userEnrollments.has(course.id)) {
                      navigate(`/courses/${course.id}`);
                    } else {
                      handleEnrollClick(course);
                    }
                  }}
                  disabled={checkoutLoading || enrollLoading}
                  className="min-w-[100px]"
                  variant={userEnrollments.has(course.id) ? "default" : "default"}
                >
                  {checkoutLoading || enrollLoading ? (
                    'Procesando...'
                  ) : userEnrollments.has(course.id) ? (
                    'Ver Curso'
                  ) : course.is_free || hasActiveSubscription ? (
                    'Inscribirse'
                  ) : (
                    'Comprar'
                  )}
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
                priceRange: '',
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
