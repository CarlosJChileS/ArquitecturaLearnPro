import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { BookOpen, Clock, Trophy, Play, Award, TrendingUp, Users, LogOut, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase-mvp';

interface CourseProgress {
  course_id: string;
  user_id: string;
  progress: number;
  completed: boolean;
  last_accessed: string;
  lessons_completed: number;
  total_lessons: number;
}

interface EnrolledCourse {
  id: string;
  title: string;
  description: string;
  image_url: string;
  instructor_name: string;
  duration_hours: number;
  level: string;
  category: string;
  price: number;
  progress?: CourseProgress;
}

interface DashboardStats {
  totalCourses: number;
  completedCourses: number;
  totalHours: number;
  certificates: number;
}

const StudentDashboard: React.FC = () => {
  const { user, profile } = useAuth();
  const { subscription, loading: subLoading } = useSubscription();
  const navigate = useNavigate();
  const [enrolledCourses, setEnrolledCourses] = useState<EnrolledCourse[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalCourses: 0,
    completedCourses: 0,
    totalHours: 0,
    certificates: 0
  });
  const [loading, setLoading] = useState(false);

  // MODO DEMO: Permitir acceso completo a todas las funcionalidades
  const hasActiveSubscription = true;

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  // Recargar datos cuando el componente se monta (útil para actualizaciones)
  useEffect(() => {
    const handleFocus = () => {
      if (user) {
        loadDashboardData();
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [user]);

  const loadDashboardData = async () => {
    try {
      if (!user) return;

      setLoading(true);

      // Load enrolled courses with direct Supabase query
      const { data: enrollments, error: enrollmentsError } = await supabase
        .from('course_enrollments')
        .select(`
          *,
          courses (
            id,
            title,
            description,
            thumbnail_url,
            duration_hours,
            level,
            price,
            category_id,
            profiles:instructor_id (full_name)
          )
        `)
        .eq('user_id', user.id)
        .order('enrolled_at', { ascending: false });

      // Get categories separately to avoid multiple relationships issue
      const { data: categoriesData } = await supabase
        .from('categories')
        .select('id, name');

      if (enrollmentsError) {
        console.error('Error loading enrollments:', enrollmentsError);
      } else if (enrollments) {
        // Create category map for efficient lookup
        const categoryMap = new Map(categoriesData?.map(cat => [cat.id, cat.name]) || []);
        
        const coursesWithProgress = enrollments.map(enrollment => ({
          id: enrollment.courses.id,
          title: enrollment.courses.title,
          description: enrollment.courses.description,
          image_url: enrollment.courses.thumbnail_url,
          instructor_name: enrollment.courses.profiles?.full_name || 'Instructor',
          duration_hours: enrollment.courses.duration_hours || 0,
          level: enrollment.courses.level || 'beginner',
          category: categoryMap.get(enrollment.courses.category_id) || 'General',
          price: enrollment.courses.price || 0,
          progress: {
            course_id: enrollment.course_id,
            user_id: enrollment.user_id,
            progress: enrollment.progress_percentage || 0,
            completed: enrollment.completed_at !== null,
            last_accessed: enrollment.enrolled_at,
            lessons_completed: 0,
            total_lessons: 1
          }
        }));
        
        setEnrolledCourses(coursesWithProgress);
        
        // Calculate stats
        const totalCourses = enrollments.length;
        const completedCourses = enrollments.filter(e => e.completed_at).length;
        const totalHours = enrollments.reduce((sum, e) => sum + (e.courses.duration_hours || 0), 0);
        
        setStats({
          totalCourses,
          completedCourses,
          totalHours,
          certificates: completedCourses
        });
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getProgressText = (progress: number) => {
    if (progress >= 100) return 'Completado';
    if (progress >= 75) return 'Casi terminado';
    if (progress >= 50) return 'En progreso';
    if (progress > 0) return 'Iniciado';
    return 'No iniciado';
  };

  // Mostrar loading mientras carga
  if (loading || subLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-8">
          <p className="text-gray-600">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-4">
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
              Bienvenido, {profile?.full_name || user?.email}
            </h1>
            <p className="text-gray-600">
              Continúa tu aprendizaje y alcanza tus objetivos
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
            <Button 
              variant="outline" 
              onClick={() => navigate('/')}
              className="flex items-center justify-center gap-2 hover:bg-primary hover:text-primary-foreground w-full sm:w-auto"
            >
              <Home className="h-4 w-4" />
              <span className="hidden sm:inline">Página Principal</span>
              <span className="sm:hidden">Inicio</span>
            </Button>
            <Button 
              variant="outline" 
              onClick={() => {
                // Cerrar sesión
                supabase.auth.signOut();
                navigate('/');
              }}
              className="flex items-center justify-center gap-2 hover:bg-red-600 hover:text-white w-full sm:w-auto"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Cerrar Sesión</span>
              <span className="sm:hidden">Salir</span>
            </Button>
          </div>
        </div>
        {!hasActiveSubscription && (
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-800">
              Tu suscripción ha expirado. 
              <Button 
                variant="link" 
                className="text-yellow-800 underline p-0 ml-1"
                onClick={() => navigate('/subscription')}
              >
                Renueva tu suscripción
              </Button> 
              para seguir accediendo a todos los cursos.
            </p>
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cursos Inscritos</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCourses}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cursos Completados</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completedCourses}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Horas de Estudio</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalHours}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Certificados</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.certificates}</div>
          </CardContent>
        </Card>
      </div>

      {/* Progreso de Aprendizaje por Categorías */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900">Progreso de Aprendizaje</h2>
        <p className="text-gray-600">Tu camino de aprendizaje en LearnPro</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Categorías con progreso */}
          {enrolledCourses.length > 0 ? (
            (() => {
              // Agrupar cursos por categoría
              const coursesByCategory = enrolledCourses.reduce((acc, course) => {
                const category = course.category || 'General';
                if (!acc[category]) {
                  acc[category] = [];
                }
                acc[category].push(course);
                return acc;
              }, {} as Record<string, typeof enrolledCourses>);

              return Object.entries(coursesByCategory).map(([category, courses]) => {
                const totalProgress = courses.reduce((sum, course) => sum + (course.progress?.progress || 0), 0);
                const avgProgress = Math.round(totalProgress / courses.length);
                
                return (
                  <Card key={category}>
                    <CardHeader>
                      <div className="flex justify-between items-center">
                        <CardTitle className="text-lg">{category}</CardTitle>
                        <Badge variant="outline">{courses.length} curso{courses.length > 1 ? 's' : ''}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Progreso promedio</span>
                          <span>{avgProgress}%</span>
                        </div>
                        <Progress value={avgProgress} className="h-2" />
                        <div className="text-xs text-gray-500">
                          {courses.filter(c => c.progress?.completed).length} de {courses.length} completados
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              });
            })()
          ) : (
            <div className="col-span-2">
              <Card className="text-center py-8">
                <CardContent>
                  <TrendingUp className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600">Inscríbete en cursos para ver tu progreso de aprendizaje</p>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>

      {/* Actividad Reciente */}
      <div className="space-y-6 mt-12">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Actividad Reciente</h2>
          <p className="text-gray-600">Últimos cursos que has visitado</p>
        </div>
        
        {enrolledCourses.length > 0 ? (
          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="space-y-3 sm:space-y-4">
                {enrolledCourses.slice(0, 5).map((course, index) => (
                  <div key={course.id} className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                    <div className="flex items-center space-x-3 sm:space-x-4 flex-1">
                      <div className="w-12 h-12 sm:w-12 sm:h-12 rounded-lg overflow-hidden flex-shrink-0">
                        <img 
                          src={course.image_url || '/placeholder.svg'} 
                          alt={course.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {course.title}
                        </p>
                        <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2 text-xs text-gray-500">
                          <span>Curso visualizado</span>
                          <span className="hidden sm:inline">•</span>
                          <span>{new Date(course.progress?.last_accessed || Date.now()).toLocaleDateString('es-ES')}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between sm:justify-end space-x-3 sm:space-x-4">
                      <div className="flex-shrink-0">
                        <Badge variant={course.progress?.progress === 100 ? "default" : "secondary"}>
                          {course.progress?.progress || 0}%
                        </Badge>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => navigate(`/courses/${course.id}`)}
                        className="flex items-center gap-1 px-3 py-1"
                      >
                        <Play className="h-3 w-3" />
                        <span className="hidden sm:inline">
                          {course.progress?.progress ? 'Continuar' : 'Comenzar'}
                        </span>
                        <span className="sm:hidden">
                          {course.progress?.progress ? 'Continuar' : 'Iniciar'}
                        </span>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="text-center py-8">
            <CardContent>
              <Clock className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600">No hay actividad reciente. ¡Comienza un curso para ver tu actividad aquí!</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Enrolled Courses */}
      <div className="space-y-6 mt-12">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <h2 className="text-2xl font-bold text-gray-900">Mis Cursos</h2>
          <Button 
            onClick={() => navigate('/courses')}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 px-6 py-3 rounded-lg font-medium"
          >
            <BookOpen className="h-5 w-5" />
            <span>Explorar Más Cursos</span>
          </Button>
        </div>

        {enrolledCourses.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <BookOpen className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No tienes cursos inscritos
              </h3>
              <p className="text-gray-600 mb-4">
                Explora nuestro catálogo y comienza tu aprendizaje
              </p>
              <Button 
                onClick={() => navigate('/courses')}
                className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 px-6 py-3 rounded-lg font-medium"
              >
                <BookOpen className="h-5 w-5" />
                Explorar Cursos
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {enrolledCourses.map((course) => (
              <Card key={course.id} className="hover:shadow-lg transition-shadow">
                <div className="relative">
                  <img
                    src={course.image_url || '/placeholder.svg'}
                    alt={course.title}
                    className="w-full h-48 object-cover rounded-t-lg"
                  />
                  <Badge 
                    variant="secondary" 
                    className="absolute top-2 right-2"
                  >
                    {course.level}
                  </Badge>
                </div>
                
                <CardHeader>
                  <CardTitle className="line-clamp-2">{course.title}</CardTitle>
                  <CardDescription className="line-clamp-2">
                    {course.description}
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <Users className="h-4 w-4 mr-1" />
                    {course.instructor_name}
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="h-4 w-4 mr-1" />
                    {course.duration_hours} horas
                  </div>

                  {course.progress && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progreso</span>
                        <span>{Math.round(course.progress.progress)}%</span>
                      </div>
                      <Progress 
                        value={course.progress.progress} 
                        className="h-2"
                      />
                      <div className="flex justify-between text-xs text-gray-600">
                        <span>
                          {course.progress.lessons_completed} de {course.progress.total_lessons} lecciones
                        </span>
                        <span className={`font-medium ${
                          course.progress.progress >= 100 ? 'text-green-600' : 'text-blue-600'
                        }`}>
                          {getProgressText(course.progress.progress)}
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button 
                      className="flex-1"
                      onClick={() => navigate(`/courses/${course.id}`)}
                    >
                      <Play className="h-4 w-4 mr-2" />
                      {course.progress?.progress ? 'Continuar' : 'Comenzar'}
                    </Button>
                    
                    <Button 
                      variant="outline"
                      onClick={() => navigate(`/exam/${course.id}`)}
                    >
                      <BookOpen className="h-4 w-4 mr-1" />
                      Examen
                    </Button>
                    
                    {course.progress?.completed && (
                      <Button
                        variant="outline"
                        onClick={() => navigate(`/certificate/${course.id}`)}
                      >
                        <Trophy className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Acciones Rápidas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Button 
              onClick={() => navigate('/courses')} 
              className="h-20 flex-col space-y-2 w-full bg-gradient-to-br from-blue-50 to-purple-50 hover:from-blue-100 hover:to-purple-100 border-2 border-blue-200 hover:border-blue-300 text-blue-700 hover:text-blue-800 transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg"
              variant="outline"
            >
              <BookOpen className="h-6 w-6" />
              <span>Explorar Cursos</span>
            </Button>
            
            <Button 
              onClick={() => navigate('/profile')} 
              className="h-20 flex-col space-y-2 w-full bg-gradient-to-br from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 border-2 border-green-200 hover:border-green-300 text-green-700 hover:text-green-800 transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg"
              variant="outline"
            >
              <Award className="h-6 w-6" />
              <span>Mi Perfil</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentDashboard;
