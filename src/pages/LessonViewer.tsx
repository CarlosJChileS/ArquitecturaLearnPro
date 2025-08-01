import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { 
  ChevronLeft, ChevronRight, CheckCircle, Clock, FileText,
  Video, Award, BookOpen
} from 'lucide-react';

interface Lesson {
  id: string;
  title: string;
  description: string;
  content: string;
  video_url?: string;
  duration_minutes: number;
  order_index: number;
  content_type: 'video' | 'text' | 'quiz';
  course_id: string;
}

interface Course {
  id: string;
  title: string;
  instructor_name: string;
}

interface LessonProgress {
  lesson_id: string;
  user_id: string;
  completed: boolean;
  progress_percentage: number;
  time_spent_minutes: number;
  last_position?: number;
}

const LessonViewer: React.FC = () => {
  const { courseId, lessonId } = useParams<{ courseId: string; lessonId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  console.log('🎯 LessonViewer rendering...');
  console.log('📍 URL params:', { courseId, lessonId });
  console.log('🔐 User:', user?.id);
  console.log('🌐 Current location:', window.location.href);
  
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [course, setCourse] = useState<Course | null>(null);
  const [allLessons, setAllLessons] = useState<Lesson[]>([]);
  const [progress, setProgress] = useState<LessonProgress | null>(null);
  const [courseProgress, setCourseProgress] = useState({ completed: 0, total: 0 });
  const [lessonsProgress, setLessonsProgress] = useState<Map<string, boolean>>(new Map());
  const [currentTime, setCurrentTime] = useState(0);

  // Edge functions no las necesitamos ahora - usando Supabase directo
    
  useEffect(() => {
    console.log('🔍 LessonViewer mounted/updated with:', {
      courseId,
      lessonId,
      hasUser: !!user,
      userId: user?.id,
      userEmail: user?.email,
      userObject: user // Full user object for debugging
    });

    if (!user) {
      console.warn('⚠️ No user found in LessonViewer - progress updates will fail');
      console.warn('⚠️ User should have auth.users ID, not profiles.id');
    } else {
      console.log('✅ User found with auth.users ID:', user.id);
    }

    if (courseId && lessonId) {
      loadLessonData();
    }
  }, [courseId, lessonId, user]);

  const loadLessonData = async () => {
    if (!courseId || !lessonId) return;

    try {
      // Get course data
      const { data: courseData, error: courseError } = await supabase
        .from('courses')
        .select('id, title, instructor_id, profiles:instructor_id(full_name)')
        .eq('id', courseId)
        .single();

      if (courseError) {
        console.error('Error loading course:', courseError);
      } else if (courseData) {
        setCourse({
          id: courseData.id,
          title: courseData.title,
          instructor_name: courseData.profiles?.full_name || 'Instructor'
        });
      }

      // Verificar si la tabla lessons existe
      const { data: lessonsData, error: lessonsError } = await supabase
        .from('lessons')
        .select('id, title, description, content, video_url, duration_minutes, order_index, content_type')
        .eq('course_id', courseId)
        .order('order_index', { ascending: true });

      if (lessonsError) {
        console.error('Error loading lessons:', lessonsError);
        // Si la tabla no existe, mostrar mensaje apropiado
        if (lessonsError.message.includes('does not exist')) {
          console.log('Lessons table does not exist yet');
          setLesson({
            id: 'no-lessons-table',
            title: 'Base de datos en configuración',
            description: 'Las lecciones están siendo configuradas.',
            content: '<div class="text-center p-8"><h2>Base de datos en configuración</h2><p>Las lecciones están siendo configuradas. Por favor ejecuta el script SQL de creación de lecciones.</p><p><strong>Instrucciones:</strong></p><ol style="text-align: left; max-width: 400px; margin: 0 auto;"><li>Ve a Supabase SQL Editor</li><li>Ejecuta el script create-lessons.sql</li><li>Recarga esta página</li></ol></div>',
            duration_minutes: 0,
            order_index: 1,
            content_type: 'text',
            course_id: courseId
          });
          return;
        }
      } else if (lessonsData && lessonsData.length > 0) {
        const formattedLessons: Lesson[] = lessonsData.map((lesson: any) => ({
          id: lesson.id,
          title: lesson.title,
          description: lesson.description || '',
          content: lesson.content || `<h2>${lesson.title}</h2><p>${lesson.description || 'Contenido de la lección'}</p>`,
          video_url: lesson.video_url || undefined,
          duration_minutes: lesson.duration_minutes || 0,
          order_index: lesson.order_index || 0,
          content_type: lesson.content_type as 'video' | 'text' | 'quiz',
          course_id: courseId
        }));
        
        setAllLessons(formattedLessons);
        
        // Find current lesson
        const currentLesson = formattedLessons.find(l => l.id === lessonId);
        setLesson(currentLesson || null);
        
        if (!currentLesson) {
          console.error('Lesson not found:', lessonId);
          // Navigate to first lesson if current one doesn't exist
          if (formattedLessons.length > 0) {
            navigate(`/courses/${courseId}/lesson/${formattedLessons[0].id}`, { replace: true });
          }
        }
      } else {
        // No lessons found, create a default message
        console.log('No lessons found for course:', courseId);
        setLesson({
          id: 'no-lessons',
          title: 'Curso en construcción',
          description: 'Este curso aún no tiene lecciones disponibles.',
          content: '<p>Las lecciones están siendo preparadas. Vuelve pronto para acceder al contenido.</p>',
          duration_minutes: 0,
          order_index: 1,
          content_type: 'text',
          course_id: courseId
        });
      }

      // Load progress if user is logged in
      if (user && lessonId !== 'no-lessons' && lessonId !== 'no-lessons-table') {
        const { data: progressData, error: progressError } = await supabase
          .from('lesson_progress')
          .select('*')
          .eq('user_id', user.id)
          .eq('lesson_id', lessonId)
          .single();

        if (!progressError && progressData) {
          setProgress({
            lesson_id: progressData.lesson_id,
            user_id: progressData.user_id,
            completed: progressData.is_completed || false,
            progress_percentage: 100, // Simplificado por ahora
            time_spent_minutes: Math.floor((progressData.watch_time_seconds || 0) / 60),
            last_position: 0 // No existe en la tabla actual
          });
        }
      }

    } catch (error) {
      console.error('Error loading lesson data:', error);
      // Fallback to a basic lesson
      setLesson({
        id: 'error-lesson',
        title: 'Error cargando contenido',
        description: 'Hubo un problema cargando la lección.',
        content: '<p>Por favor, intenta recargar la página o contacta al soporte.</p>',
        duration_minutes: 0,
        order_index: 1,
        content_type: 'text',
        course_id: courseId || ''
      });
    }
  };

  const loadCourseProgress = async () => {
    if (!user || !courseId || allLessons.length === 0) {
      console.log('⚠️ loadCourseProgress skipped - missing data:', {
        hasUser: !!user,
        hasCourseId: !!courseId,
        lessonsCount: allLessons.length
      });
      return;
    }
    
    console.log('🔄 Loading course progress for:', {
      userId: user.id,
      courseId,
      lessonsCount: allLessons.length,
      lessonIds: allLessons.map(l => l.id)
    });
    
    try {
      // Get progress for all lessons in the course
      const { data: progressData, error } = await supabase
        .from('lesson_progress')
        .select('lesson_id, is_completed')
        .eq('user_id', user.id)
        .in('lesson_id', allLessons.map(l => l.id));

      console.log('📊 Raw course progress data from DB:', progressData);
      console.log('📊 Query error (if any):', error);

      if (!error && progressData) {
        // Create a map of lesson progress for easy lookup
        const progressMap = new Map<string, boolean>();
        
        // Log each lesson's completion status
        allLessons.forEach(lesson => {
          const progressRecord = progressData.find(p => p.lesson_id === lesson.id);
          const isCompleted = progressRecord?.is_completed || false;
          progressMap.set(lesson.id, isCompleted);
          console.log(`   📖 ${lesson.title}: ${isCompleted ? 'COMPLETED' : 'NOT COMPLETED'}`);
        });

        // Update lessons progress map
        setLessonsProgress(progressMap);

        const completedCount = progressData.filter(p => p.is_completed).length;
        const newProgress = {
          completed: completedCount,
          total: allLessons.length
        };
        
        console.log('📈 Calculated course progress:', newProgress);
        console.log('📈 Previous course progress:', courseProgress);
        
        setCourseProgress(newProgress);
        
        console.log('✅ Course progress state updated');
      } else if (error) {
        console.error('❌ Error loading course progress:', error);
      } else {
        console.log('📊 No progress data found - setting to 0/total');
        setLessonsProgress(new Map());
        setCourseProgress({
          completed: 0,
          total: allLessons.length
        });
      }
    } catch (error) {
      console.error('❌ Error in loadCourseProgress:', error);
    }
  };

  const isCoursCompleted = () => {
    return courseProgress.completed === courseProgress.total && courseProgress.total > 0;
  };

  const shouldShowFinalExam = () => {
    return isCoursCompleted() && course && allLessons.length > 0;
  };

  // Load course progress when lessons are loaded
  useEffect(() => {
    if (allLessons.length > 0 && user) {
      loadCourseProgress();
    }
  }, [allLessons, user]);

  // Reload progress when the lesson changes
  useEffect(() => {
    if (progress && lesson) {
      console.log('🔄 Progress state updated:', {
        lessonId: lesson.id,
        completed: progress.completed,
        percentage: progress.progress_percentage
      });
    }
  }, [progress, lesson]);

  // Verificar que tenemos los parámetros requeridos
  if (!courseId || !lessonId) {
    console.error('❌ Missing required parameters');
    console.error('   courseId:', courseId);
    console.error('   lessonId:', lessonId);
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-semibold mb-2">Error</h2>
            <p className="text-gray-600 mb-4">
              Los parámetros de curso y lección son requeridos.
              <br />
              <small>courseId: {courseId || 'missing'}</small>
              <br />
              <small>lessonId: {lessonId || 'missing'}</small>
            </p>
            <Button onClick={() => navigate('/courses')}>
              Volver a Cursos
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleProgressUpdate = async (progressPercentage: number, completed: boolean = false) => {
    if (!user || !lesson || !courseId) {
      console.error('❌ Missing required data for progress update:', {
        hasUser: !!user,
        hasLesson: !!lesson,
        hasCourseId: !!courseId
      });
      alert('Error: Faltan datos necesarios para actualizar el progreso');
      return;
    }

    console.log('🔄 Updating lesson progress:', {
      lessonId: lesson.id,
      courseId,
      progressPercentage,
      completed,
      timeSpent: Math.floor(currentTime / 60),
      currentProgress: progress,
      userId: user.id
    });

    try {
      // Use direct database update
      console.log('💾 Using direct database update...');
      const progressData = {
        user_id: user.id,
        lesson_id: lesson.id,
        course_id: courseId,
        is_completed: completed,
        watch_time_seconds: Math.floor(currentTime)
      };

      console.log('💾 Data to upsert:', progressData);

      const { data, error: upsertError } = await supabase
        .from('lesson_progress')
        .upsert(progressData)
        .select()
        .single();

      if (upsertError) {
        console.error('❌ Database update failed:', upsertError);
        alert(`❌ Error en base de datos: ${upsertError.message}`);
        return;
      }

      console.log('✅ Database update succeeded:', data);
      
      // Update local state only after successful database update
      setProgress({
        lesson_id: lesson.id,
        user_id: user.id,
        completed: completed,
        progress_percentage: progressPercentage,
        time_spent_minutes: Math.floor(currentTime / 60),
        last_position: currentTime
      });

      // Update course progress when a lesson is marked as completed
      if (completed) {
        console.log('🔄 Updating course progress...');
        setTimeout(() => loadCourseProgress(), 500); // Small delay to ensure DB is updated
      }

      alert('✅ Progreso actualizado correctamente');

    } catch (error: any) {
      console.error('❌ Update failed:', error);
      alert(`❌ Error crítico: ${error.message}`);
    }
  };

  const markAsCompleted = () => {
    console.log('🎯 Marking lesson as completed...');
    console.log('Current progress state:', progress);
    handleProgressUpdate(100, true);
  };

  const getNextLesson = () => {
    const currentIndex = allLessons.findIndex(l => l.id === lessonId);
    return currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;
  };

  const getPreviousLesson = () => {
    const currentIndex = allLessons.findIndex(l => l.id === lessonId);
    return currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  };

  const navigateToLesson = (targetLessonId: string) => {
    navigate(`/courses/${courseId}/lesson/${targetLessonId}`);
  };

  const getContentIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Video className="h-4 w-4" />;
      case 'text':
        return <FileText className="h-4 w-4" />;
      case 'quiz':
        return <Award className="h-4 w-4" />;
      default:
        return <BookOpen className="h-4 w-4" />;
    }
  };

  if (!lesson || !course) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <div className="lg:col-span-3">
                <div className="h-96 bg-gray-200 rounded-lg"></div>
              </div>
              <div className="space-y-4">
                <div className="h-64 bg-gray-200 rounded-lg"></div>
                <div className="h-32 bg-gray-200 rounded-lg"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const nextLesson = getNextLesson();
  const previousLesson = getPreviousLesson();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(`/courses/${courseId}`)}
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Volver al curso
              </Button>
              <div>
                <h1 className="text-lg font-semibold">{course.title}</h1>
                <p className="text-sm text-gray-600">por {course.instructor_name}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {progress && (
                <Badge variant="outline" className={progress.completed ? 'bg-green-50 text-green-700' : ''}>
                  {progress.completed ? '✓ Completada' : `${Math.round(progress.progress_percentage)}%`}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {getContentIcon(lesson.content_type)}
                    <div>
                      <CardTitle>{lesson.title}</CardTitle>
                      <p className="text-sm text-gray-600 mt-1">{lesson.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-500">{lesson.duration_minutes} min</span>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-6">
                {/* Video Player */}
                {lesson.content_type === 'video' && lesson.video_url && (
                  <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden">
                    <iframe
                      src={lesson.video_url}
                      title={lesson.title}
                      className="w-full h-full"
                      allowFullScreen
                    />
                  </div>
                )}

                {/* Text Content */}
                {lesson.content_type === 'text' && (
                  <div 
                    className="prose max-w-none"
                    dangerouslySetInnerHTML={{ __html: lesson.content }}
                  />
                )}

                {/* Quiz Content */}
                {lesson.content_type === 'quiz' && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Quiz: {lesson.title}</h3>
                    <p className="text-gray-600">
                      Esta es una lección de tipo quiz. Aquí se mostraría el contenido del examen.
                    </p>
                    <Button onClick={() => navigate(`/courses/${courseId}/exam/${lesson.id}`)}>
                      Comenzar Quiz
                    </Button>
                  </div>
                )}

                {/* Progress Bar */}
                {progress && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progreso de la lección</span>
                      <span>{Math.round(progress.progress_percentage)}%</span>
                    </div>
                    <Progress value={progress.progress_percentage} className="h-2" />
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex items-center justify-between pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={() => previousLesson && navigateToLesson(previousLesson.id)}
                    disabled={!previousLesson}
                  >
                    <ChevronLeft className="h-4 w-4 mr-2" />
                    Anterior
                  </Button>

                  <div className="flex items-center space-x-3">
                    <Button
                      variant="outline"
                      onClick={markAsCompleted}
                      disabled={progress?.completed}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      {progress?.completed ? 'Completada' : 'Marcar como completada'}
                    </Button>
                  </div>

                  <Button
                    onClick={() => nextLesson && navigateToLesson(nextLesson.id)}
                    disabled={!nextLesson}
                  >
                    Siguiente
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Course Progress */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Progreso del curso</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span>Completado</span>
                    <span>{courseProgress.completed} de {courseProgress.total}</span>
                  </div>
                  <Progress 
                    value={courseProgress.total > 0 ? (courseProgress.completed / courseProgress.total) * 100 : 0} 
                    className="h-2" 
                  />
                </div>
                
                {isCoursCompleted() ? (
                  <div className="space-y-2">
                    <p className="text-sm text-green-600 font-medium">
                      ¡Felicitaciones! Has completado todas las lecciones.
                    </p>
                    <Button 
                      className="w-full" 
                      onClick={() => {
                        console.log('🎯 Navigating to final exam...');
                        navigate(`/courses/${courseId}/exam/final`);
                      }}
                    >
                      <Award className="h-4 w-4 mr-2" />
                      Tomar Examen Final
                    </Button>
                  </div>
                ) : (
                  <p className="text-xs text-gray-600">
                    Continúa completando lecciones para obtener tu certificado
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Lesson List */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Contenido del curso</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {allLessons.map((lessonItem, index) => {
                    const isCompleted = lessonsProgress.get(lessonItem.id) || false;
                    return (
                      <div
                        key={lessonItem.id}
                        className={`flex items-center p-3 rounded-lg cursor-pointer transition-colors ${
                          lessonItem.id === lesson.id 
                            ? 'bg-primary/10 border border-primary/20' 
                            : 'hover:bg-gray-50'
                        }`}
                        onClick={() => navigateToLesson(lessonItem.id)}
                      >
                        <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-medium mr-3">
                          {isCompleted ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : (
                            getContentIcon(lessonItem.content_type)
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className={`text-sm font-medium truncate ${isCompleted ? 'text-green-600' : ''}`}>
                            {index + 1}. {lessonItem.title}
                          </h4>
                          <p className="text-xs text-gray-500">
                            {lessonItem.duration_minutes} min
                          </p>
                        </div>
                        {isCompleted && (
                          <div className="text-xs text-green-600 font-medium mr-2">
                            ✓ Completada
                          </div>
                        )}
                        {lessonItem.id === lesson.id && (
                          <div className="w-2 h-2 bg-primary rounded-full"></div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LessonViewer;