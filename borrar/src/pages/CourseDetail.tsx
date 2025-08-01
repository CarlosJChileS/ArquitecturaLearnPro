import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useEdgeFunction, useGetEnrollment } from '@/hooks/useEdgeFunctions';
import { 
  Play, Clock, Users, Star, BookOpen, Award, 
  ChevronRight, Share2, Heart, CheckCircle,
  Bookmark
} from 'lucide-react';
import CourseReviews from '@/components/CourseReviews';
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
  trailer_url?: string;
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
  progress_percentage: number;
  last_accessed: string;
  completed_at?: string;
  certificate_id?: string;
}

const CourseDetail: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { subscription } = useSubscription();
  const { toast } = useToast();
  const hasActiveSubscription =
    subscription.subscribed &&
    subscription.subscription_end &&
    new Date(subscription.subscription_end) > new Date();
  
  const [course, setCourse] = useState<Course | null>(null);
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  const { execute: getCourse } = useEdgeFunction('course', 'getCourse', { requireSession: false });
  const { execute: enrollCourse } = useEdgeFunction('course', 'enrollCourse');
  const { execute: getEnrollment } = useEdgeFunction('course', 'getEnrollment');

  useEffect(() => {
    if (courseId) {
      loadCourse();
      if (user) {
        checkEnrollment();
      }
    }
  }, [courseId, user]);

  const loadCourse = async () => {
    try {
      const result = await getCourse(courseId!);
      
      if (result.data) {
        setCourse(result.data);
      } else {
        // Mock data for development
        const mockCourse: Course = {
          id: courseId!,
          title: 'Curso Demo',
          description: 'Descripción breve',
          long_description: 'Detalles de demostración',
          instructor_name: 'Demo Instructor',
          instructor_bio: '',
          instructor_avatar: '/placeholder.svg',
          category: 'General',
          level: 'beginner',
          subscription_tier: 'free',
          duration_hours: 1,
          total_lessons: 1,
          total_students: 0,
          rating: 5,
          rating_count: 1,
          thumbnail_url: '/placeholder.svg',
          trailer_url: '',
          features: ['Ejemplo'],
          requirements: ['Ninguno'],
          what_you_learn: ['Aprender'],
          modules: [
            {
              id: '1',
              title: 'Introducción',
              description: '',
              order_index: 1,
              lessons: [
                {
                  id: '1',
                  title: 'Lección demo',
                  duration_minutes: 5,
                  order_index: 1,
                  is_free: true,
                  completed: false,
                  type: 'video',
                },
              ],
            },
          ],
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
          published: true,
        };
        setCourse(mockCourse);
      }
    } catch (error) {
      console.error('Error loading course:', error);
    }
  };

  const checkEnrollment = async () => {
    try {
      const result = await getEnrollment(courseId!);
      console.log('Enrollment check result:', result);
      
      if (result.data && result.data.enrolled) {
        setEnrollment(result.data.enrollment);
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
      const { data, error } = await supabase
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
          throw error;
        }
      } else {
        toast({
          title: "¡Inscripción exitosa!",
          description: `Te has inscrito exitosamente en "${course.title}"`,
        });
        
        // Update enrollment state
        setEnrollment({
          id: data.id,
          enrolled_at: data.enrolled_at,
          progress_percentage: 0,
          completed_at: null
        });
      }
    } catch (error) {
      console.error('Error enrolling in course:', error);
      toast({
        title: "Error",
        description: "Error al inscribirse en el curso. Inténtalo de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsEnrolling(false);
    }
  };

  const canAccessCourse = (courseSubscriptionTier: string, userSubscriptionTier: string) => {
    const tierHierarchy = { free: 0, basic: 1, premium: 2 };
    return tierHierarchy[userSubscriptionTier as keyof typeof tierHierarchy] >= 
           tierHierarchy[courseSubscriptionTier as keyof typeof tierHierarchy];
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
      
      navigate(targetUrl);
      
      // Log después de la navegación (puede no ejecutarse si hay redirección)
      setTimeout(() => {
        console.log('📍 Current URL after navigation:', window.location.href);
      }, 100);
    } else {
      console.log('❌ No lessons found, showing curriculum');
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



  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="text-center py-8">
            <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Curso no encontrado</h3>
            <p className="text-gray-600 mb-4">El curso solicitado no existe o no está disponible.</p>
            <Button onClick={() => navigate('/courses')}>
              Ver Todos los Cursos
            </Button>
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
                  <div className="aspect-video bg-gray-200 rounded-lg mb-4 flex items-center justify-center">
                    {(course.intro_video_url || course.trailer_url) ? (
                      <iframe
                        src={course.intro_video_url || course.trailer_url}
                        title={`Video introductorio: ${course.title}`}
                        className="w-full h-full rounded-lg"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    ) : (
                      <div className="text-center">
                        <Play className="h-16 w-16 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-500 text-sm">Video no disponible</p>
                      </div>
                    )}
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
                        {enrollment.progress_percentage > 0 ? 'Continuar Aprendiendo' : 'Comenzar Curso'}
                      </Button>

                      {enrollment.progress_percentage >= 100 && (
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={() => navigate(`/exam/${course.id}`)}
                        >
                          <Award className="h-4 w-4 mr-2" />
                          Tomar Examen Final
                        </Button>
                      )}

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
                          <Badge className={getSubscriptionTierColor(course.subscription_tier)}>
                            {getSubscriptionTierText(course.subscription_tier)}
                          </Badge>
                        </div>
                        {course.subscription_tier === 'free' ? (
                          <p className="text-green-600 font-medium">¡Curso totalmente gratuito!</p>
                        ) : (
                          <p className="text-gray-600">
                            Requiere suscripción {getSubscriptionTierText(course.subscription_tier)}
                          </p>
                        )}
                      </div>

                      <Button 
                        onClick={handleEnroll}
                        disabled={isEnrolling}
                        className="w-full"
                        size="lg"
                      >
                        {(() => {
                          if (isEnrolling) return 'Procesando...';
                          if (course.subscription_tier === 'free') return 'Inscribirse Gratis';
                          if (hasActiveSubscription) return 'Acceder al Curso';
                          return 'Suscribirse para Acceder';
                        })()}
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
                                    onClick={() => navigate(`/lesson/${lesson.id}`)}
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
            <CourseReviews
              courseId={course.id}
              canReview={!!enrollment && enrollment.progress_percentage >= 100}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default CourseDetail;