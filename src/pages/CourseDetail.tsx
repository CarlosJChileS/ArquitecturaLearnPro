import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Play, Clock, Users, Star, BookOpen, Award, 
  ChevronRight, Share2, Heart, CheckCircle,
  Bookmark
} from 'lucide-react';
import CourseReviews from '@/components/CourseReviews';
import CourseVideoPreview from '@/components/CourseVideoPreview';
import { supabase } from '@/lib/supabase-mvp';
import { useToast } from '@/hooks/use-toast';

interface Lesson {
  id: string;
  title: string;
  duration_minutes: number;
  order_index: number;
  is_free: boolean;
  completed: boolean;
  type: 'video' | 'text' | 'quiz' | 'exercise';
}

interface Module {
  id: string;
  title: string;
  description: string;
  order_index: number;
  lessons: Lesson[];
}

interface Course {
  id: string;
  title: string;
  description: string;
  long_description: string;
  instructor_name: string;
  instructor_bio: string;
  instructor_avatar: string;
  category: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  subscription_tier: 'free' | 'basic' | 'premium';
  duration_hours: number;
  total_lessons: number;
  total_students: number;
  rating: number;
  rating_count: number;
  thumbnail_url: string;
  intro_video_url?: string;
  intro_video_type?: 'upload' | 'youtube';
  features: string[];
  requirements: string[];
  what_you_learn: string[];
  modules: Module[];
  created_at: string;
  updated_at: string;
  published: boolean;
}

interface Enrollment {
  id: string;
  course_id: string;
  enrolled_at: string;
  progress_percentage: number;
  last_accessed: string;
  completed_at?: string;
  certificate_id?: string;
}

const CourseDetail: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  console.log('CourseDetail component mounted with courseId:', courseId);
  
  const [course, setCourse] = useState<Course | null>(null);
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [loading, setLoading] = useState(true); // Cambié a true para mostrar loading
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    console.log('CourseDetail useEffect triggered with courseId:', courseId, 'user:', user?.id);
    if (courseId) {
      loadCourse();
      if (user) {
        checkEnrollment();
      }
    }
  }, [courseId, user]);

  const loadCourse = async () => {
    try {
      setLoading(true);
      console.log('Cargando curso con ID:', courseId);
      
      // Consulta directa a Supabase sin edge functions
      const { data: courseData, error } = await supabase
        .from('courses')
        .select(`
          *,
          categories(name),
          profiles:instructor_id(full_name, email)
        `)
        .eq('id', courseId!)
        .single();

      console.log('Resultado de la consulta:', { courseData, error });

      if (error) {
        console.error('Error loading course:', error);
        
        // Intentar consulta sin joins para verificar si el curso existe
        const { data: basicCourse, error: basicError } = await supabase
          .from('courses')
          .select('*')
          .eq('id', courseId!)
          .single();
          
        console.log('Consulta básica:', { basicCourse, basicError });
        
        if (basicError) {
          console.error('El curso no existe en la base de datos');
          setCourse(null);
          return;
        }
      }

      if (courseData) {
        console.log('Curso encontrado, transformando datos...');
        // Transformar datos a la estructura esperada
        const formattedCourse: Course = {
          id: courseData.id,
          title: courseData.title,
          description: courseData.description || '',
          long_description: courseData.description || '',
          instructor_name: courseData.profiles?.full_name || 'Instructor',
          instructor_bio: 'Instructor especializado en el tema',
          instructor_avatar: '/placeholder.svg',
          category: courseData.categories?.name || 'General',
          level: courseData.level || 'beginner',
          subscription_tier: 'free', // MODO DEMO: Todos los cursos son gratuitos
          duration_hours: courseData.duration_hours || 1,
          total_lessons: 5, // Placeholder
          total_students: 150, // Placeholder
          rating: 4.8,
          rating_count: 42,
          thumbnail_url: courseData.thumbnail_url || '/placeholder.svg',
          intro_video_url: courseData.intro_video_url || '',
          intro_video_type: courseData.intro_video_url?.includes('youtube') ? 'youtube' : 'upload',
          features: [
            'Contenido actualizado',
            'Certificado de finalización',
            'Acceso de por vida',
            'Soporte del instructor'
          ],
          requirements: [
            'Conocimientos básicos de informática',
            'Ganas de aprender'
          ],
          what_you_learn: [
            'Dominar los conceptos fundamentales',
            'Aplicar conocimientos en proyectos reales',
            'Resolver problemas complejos',
            'Mejores prácticas del sector'
          ],
          modules: [
            {
              id: '1',
              title: 'Introducción al Curso',
              description: 'Conoce los objetivos y metodología',
              order_index: 1,
              lessons: [
                {
                  id: '1',
                  title: 'Bienvenida y objetivos',
                  duration_minutes: 10,
                  order_index: 1,
                  is_free: true,
                  completed: false,
                  type: 'video',
                },
                {
                  id: '2',
                  title: 'Configuración del entorno',
                  duration_minutes: 15,
                  order_index: 2,
                  is_free: false,
                  completed: false,
                  type: 'video',
                }
              ],
            }
          ],
          created_at: courseData.created_at,
          updated_at: courseData.updated_at || courseData.created_at,
          published: courseData.is_published,
        };
        
        console.log('Curso formateado:', formattedCourse);
        setCourse(formattedCourse);
      } else {
        console.log('No hay datos del curso');
        setCourse(null);
      }
    } catch (error) {
      console.error('Error loading course:', error);
      setCourse(null);
    } finally {
      setLoading(false);
    }
  };

  const checkEnrollment = async () => {
    try {
      if (!user || !courseId) {
        setEnrollment(null);
        return;
      }

      // Consulta directa a Supabase para verificar inscripción
      const { data: enrollmentData, error } = await supabase
        .from('course_enrollments')
        .select('*')
        .eq('user_id', user.id)
        .eq('course_id', courseId)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('Error checking enrollment:', error);
        setEnrollment(null);
        return;
      }

      if (enrollmentData) {
        setEnrollment({
          id: enrollmentData.id,
          course_id: enrollmentData.course_id,
          enrolled_at: enrollmentData.enrolled_at,
          progress_percentage: enrollmentData.progress_percentage || 0,
          last_accessed: enrollmentData.enrolled_at,
          completed_at: enrollmentData.completed_at,
          certificate_id: enrollmentData.certificate_id
        });
      } else {
        setEnrollment(null);
      }
    } catch (error) {
      console.error('Error checking enrollment:', error);
      setEnrollment(null);
    }
  };

  const handleEnroll = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (!course) return;

    try {
      setIsEnrolling(true);

      // Inscripción directa en la base de datos sin Edge Functions
      const { error } = await supabase
        .from('course_enrollments')
        .insert({
          user_id: user.id,
          course_id: courseId!,
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
          // Check enrollment status
          await checkEnrollment();
        } else {
          console.error('Enrollment error:', error);
          toast({
            title: "Error",
            description: "No se pudo completar la inscripción",
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: "¡Inscripción exitosa!",
          description: "Te has inscrito correctamente al curso",
        });
        await checkEnrollment();
      }
    } catch (error) {
      console.error('Error enrolling:', error);
      toast({
        title: "Error",
        description: "Ocurrió un error durante la inscripción",
        variant: "destructive",
      });
    } finally {
      setIsEnrolling(false);
    }
  };

  const startLearning = async () => {
    if (!course) return;

    console.log('🚀 Starting learning for course:', course.id);
    console.log('🔗 Course data:', {
      id: course.id,
      title: course.title,
      modules: course.modules?.length || 0
    });
    
    let firstLessonId: string | null = null;

    // Revisar si el curso ya tiene módulos y lecciones cargadas
    if (course.modules && course.modules.length > 0) {
      const firstModule = course.modules[0];
      if (firstModule && firstModule.lessons && firstModule.lessons.length > 0) {
        firstLessonId = firstModule.lessons[0].id;
        console.log('✅ Found first lesson from modules:', firstLessonId);
      }
    }

    // Si no se encontró la primera lección, consultarla directamente en Supabase
    if (!firstLessonId) {
      console.log('🔍 Searching for first lesson in database...');
      const { data, error } = await supabase
        .from('lessons')
        .select('id, title, order_index')
        .eq('course_id', course.id)
        .order('order_index', { ascending: true })
        .limit(1)
        .single();

      console.log('📖 Lesson query result:', { data, error });
      firstLessonId = data?.id ?? null;
    }

    if (firstLessonId) {
      const targetUrl = `/courses/${course.id}/lesson/${firstLessonId}`;
      console.log('✅ Navigating to lesson:', firstLessonId);
      console.log('🎯 Target URL:', targetUrl);
      console.log('📍 Current URL before navigation:', window.location.href);
      
      // Mostrar toast informativo
      toast({
        title: "Navegando a la lección",
        description: `Redirigiendo a la primera lección del curso`,
        duration: 2000,
      });
      
      navigate(targetUrl);
      
      // Log después de la navegación (puede no ejecutarse si hay redirección)
      setTimeout(() => {
        console.log('📍 Current URL after navigation:', window.location.href);
      }, 100);
    } else {
      console.log('❌ No lessons found, showing curriculum');
      
      // Mostrar toast informativo
      toast({
        title: "No hay lecciones disponibles",
        description: "Este curso aún no tiene lecciones. Puedes ver el contenido en la pestaña Contenido.",
        duration: 4000,
        variant: "destructive"
      });
      
      // Si no hay lecciones, mostrar el curriculum
      setActiveTab('curriculum');
      setTimeout(() => {
        const contentSection = document.getElementById('course-content');
        if (contentSection) {
          contentSection.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
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

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  if (loading) {
    // MODO DEMO: Quitar loading para pruebas rápidas
    return null;
  }

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="text-center py-8">
            <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Curso no encontrado</h3>
            <p className="text-gray-600 mb-4">El curso solicitado no existe o no está disponible.</p>
            <div className="text-sm text-gray-500 mb-4 p-2 bg-gray-100 rounded">
              <p><strong>ID del curso:</strong> {courseId}</p>
              <p>Verifica la consola del navegador para más detalles.</p>
            </div>
            <div className="space-y-2">
              <Button onClick={() => navigate('/courses')} className="w-full">
                Ver Todos los Cursos
              </Button>
              <Button onClick={() => navigate('/dashboard')} variant="outline" className="w-full">
                Ir al Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="mb-4">
                <Link to="/courses" className="text-indigo-200 hover:text-white text-sm">
                  ← Volver a cursos
                </Link>
              </div>
              
              <h1 className="text-3xl lg:text-4xl font-bold mb-4">{course.title}</h1>
              <p className="text-xl text-indigo-100 mb-6">{course.description}</p>
              
              <div className="flex flex-wrap items-center gap-4 mb-6">
                <div className="flex items-center">
                  <Star className="h-5 w-5 text-yellow-400 mr-1" />
                  <span className="font-semibold">{course.rating}</span>
                  <span className="text-indigo-200 ml-1">({course.rating_count} reseñas)</span>
                </div>
                <div className="flex items-center">
                  <Users className="h-5 w-5 text-indigo-200 mr-1" />
                  <span>{course.total_students} estudiantes</span>
                </div>
                <Badge className={getLevelColor(course.level)}>
                  {getLevelText(course.level)}
                </Badge>
              </div>

              <div className="flex items-center mb-6">
                <img
                  src={course.instructor_avatar}
                  alt={course.instructor_name}
                  className="w-12 h-12 rounded-full mr-3"
                />
                <div>
                  <p className="font-semibold">Instructor: {course.instructor_name}</p>
                  <p className="text-indigo-200 text-sm">{course.category}</p>
                </div>
              </div>
            </div>

            {/* Enrollment Card */}
            <div className="lg:col-span-1">
              <Card className="bg-white">
                <CardContent className="p-6">
                  <div className="mb-4">
                    <CourseVideoPreview 
                      videoUrl={course.intro_video_url}
                      courseName={course.title}
                    />
                  </div>

                  {enrollment ? (
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Progreso del curso</span>
                          <span>{enrollment.progress_percentage}%</span>
                        </div>
                        <Progress value={enrollment.progress_percentage} className="mb-4" />
                      </div>
                      
                      <Button 
                        onClick={startLearning}
                        className="w-full"
                        size="lg"
                      >
                        Continuar Curso
                      </Button>
                      
                      <Button 
                        onClick={() => navigate(`/exam/${course.id}`)}
                        variant="outline"  
                        className="w-full"
                        size="lg"
                      >
                        <BookOpen className="h-4 w-4 mr-2" />
                        Tomar Examen Final
                      </Button>
                      
                      {enrollment.certificate_id && (
                        <Button variant="outline" className="w-full">
                          <Award className="h-4 w-4 mr-2" />
                          Ver Certificado
                        </Button>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="text-center">
                        <div className="mb-3">
                          <Badge className="bg-green-100 text-green-800">
                            Acceso Libre
                          </Badge>
                        </div>
                        <p className="text-green-600 font-medium">¡Curso disponible!</p>
                      </div>

                      <Button 
                        onClick={handleEnroll}
                        disabled={isEnrolling}
                        className="w-full"
                        size="lg"
                      >
                        {isEnrolling ? 'Procesando...' : 'Inscribirse al Curso'}
                      </Button>

                      <Button 
                        onClick={() => navigate(`/exam/${course.id}`)}
                        variant="outline"  
                        className="w-full"
                        size="lg"
                      >
                        <BookOpen className="h-4 w-4 mr-2" />
                        Tomar Examen Final
                      </Button>

                      <div className="text-xs text-gray-500 text-center">
                        Acceso de por vida • Certificado incluido
                      </div>
                    </div>
                  )}

                  <div className="flex justify-center space-x-4 mt-4 pt-4 border-t">
                    <Button variant="ghost" size="sm">
                      <Heart className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Share2 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Bookmark className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Content Tabs */}
      <div className="container mx-auto px-4 py-8" id="course-content">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Resumen</TabsTrigger>
            <TabsTrigger value="curriculum">Contenido</TabsTrigger>
            <TabsTrigger value="instructor">Instructor</TabsTrigger>
            <TabsTrigger value="reviews">Reseñas</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-8">
                {/* What you'll learn */}
                <Card>
                  <CardHeader>
                    <CardTitle>Lo que aprenderás</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {course.what_you_learn.map((item, index) => (
                        <div key={`learn-${item.slice(0, 20)}-${index}`} className="flex items-start">
                          <CheckCircle className="h-5 w-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                          <span className="text-sm">{item}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Course description */}
                <Card>
                  <CardHeader>
                    <CardTitle>Descripción del curso</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 leading-relaxed">{course.long_description}</p>
                  </CardContent>
                </Card>

                {/* Requirements */}
                <Card>
                  <CardHeader>
                    <CardTitle>Requisitos</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {course.requirements.map((req, index) => (
                        <li key={`req-${req.slice(0, 20)}-${index}`} className="flex items-start">
                          <div className="w-2 h-2 bg-gray-400 rounded-full mr-3 mt-2 flex-shrink-0"></div>
                          <span className="text-sm text-gray-700">{req}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                {/* Course features */}
                <Card>
                  <CardHeader>
                    <CardTitle>Este curso incluye</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {course.features.map((feature, index) => (
                        <div key={`feature-${feature.slice(0, 20)}-${index}`} className="flex items-center">
                          <CheckCircle className="h-4 w-4 text-green-600 mr-3" />
                          <span className="text-sm">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Course stats */}
                <Card>
                  <CardHeader>
                    <CardTitle>Estadísticas del curso</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Duración total</span>
                        <span className="text-sm font-semibold">{course.duration_hours} horas</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Total de lecciones</span>
                        <span className="text-sm font-semibold">{course.total_lessons}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Estudiantes inscritos</span>
                        <span className="text-sm font-semibold">{course.total_students}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Última actualización</span>
                        <span className="text-sm font-semibold">
                          {new Date(course.updated_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="curriculum" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Contenido del curso</CardTitle>
                <CardDescription>
                  {course.modules.length} módulos • {course.total_lessons} lecciones • 
                  {course.duration_hours} horas de contenido
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {course.modules.map((module) => (
                    <Card key={module.id} className="border">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg">{module.title}</CardTitle>
                        <CardDescription>{module.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {module.lessons.map((lesson) => (
                            <div 
                              key={lesson.id} 
                              className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg"
                            >
                              <div className="flex items-center">
                                <Play className="h-4 w-4 text-gray-400 mr-3" />
                                <div>
                                  <p className="font-medium text-sm">{lesson.title}</p>
                                  <div className="flex items-center text-xs text-gray-500">
                                    <Clock className="h-3 w-3 mr-1" />
                                    {formatDuration(lesson.duration_minutes)}
                                    {lesson.is_free && (
                                      <Badge variant="outline" className="ml-2">
                                        Gratis
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              </div>
                              
                              <div className="flex items-center">
                                {lesson.completed && (
                                  <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                                )}
                                {(lesson.is_free || enrollment) && (
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    onClick={() => navigate(`/courses/${course.id}/lesson/${lesson.id}`)}
                                  >
                                    <ChevronRight className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="instructor" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Sobre el instructor</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-start space-x-4">
                  <img
                    src={course.instructor_avatar}
                    alt={course.instructor_name}
                    className="w-20 h-20 rounded-full"
                  />
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold mb-2">{course.instructor_name}</h3>
                    <p className="text-gray-700 leading-relaxed">{course.instructor_bio}</p>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-indigo-600">4.8</div>
                        <div className="text-sm text-gray-600">Rating instructor</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-indigo-600">1,247</div>
                        <div className="text-sm text-gray-600">Reseñas</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-indigo-600">15</div>
                        <div className="text-sm text-gray-600">Cursos</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-indigo-600">45K</div>
                        <div className="text-sm text-gray-600">Estudiantes</div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reviews" className="space-y-6">
            <CourseReviews courseId={course.id} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default CourseDetail;