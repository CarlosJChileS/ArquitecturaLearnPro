import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useEdgeFunction } from '@/hooks/useEdgeFunctions';
import { 
  ChevronLeft, ChevronRight, Play, Pause, Volume2, 
  Settings, Maximize, CheckCircle, Clock, FileText,
  Video, Award, BookOpen
} from 'lucide-react';

interface Lesson {
  id: string;
  title: string;
  description: string;
  content: string;
  video_url?: string;
  duration_minutes: number;
  lesson_order: number;
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
  
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [course, setCourse] = useState<Course | null>(null);
  const [allLessons, setAllLessons] = useState<Lesson[]>([]);
  const [progress, setProgress] = useState<LessonProgress | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [loading, setLoading] = useState(true);

  const { execute: getLessonById } = useEdgeFunction('course', 'getLessonById');
  const { execute: getCourseById } = useEdgeFunction('course', 'getCourseById');
  const { execute: getCourseLessons } = useEdgeFunction('course', 'getCourseLessons');
  const { execute: updateLessonProgress } = useEdgeFunction('course', 'updateLessonProgress');
  const { execute: getLessonProgress } = useEdgeFunction('course', 'getLessonProgress');

  useEffect(() => {
    if (courseId && lessonId) {
      loadLessonData();
    }
  }, [courseId, lessonId, user]);

  const loadLessonData = async () => {
    if (!courseId || !lessonId) return;

    try {
      setLoading(true);

      // Mock data for development
      const mockCourse: Course = {
        id: courseId,
        title: "Desarrollo Web Full Stack",
        instructor_name: "Ana García"
      };

      const mockLessons: Lesson[] = [
        {
          id: "lesson-1",
          title: "Introducción al desarrollo Full Stack",
          description: "En esta lección aprenderás qué es el desarrollo full stack y conocerás las tecnologías que usaremos a lo largo del curso.",
          content: `
            <h2>¿Qué es el Desarrollo Full Stack?</h2>
            <p>El desarrollo full stack se refiere a la práctica de trabajar tanto en el frontend (lado del cliente) como en el backend (lado del servidor) de las aplicaciones web.</p>
            
            <h3>Tecnologías que aprenderás:</h3>
            <ul>
              <li><strong>React</strong> - Para crear interfaces de usuario dinámicas</li>
              <li><strong>Node.js</strong> - Para el desarrollo del servidor</li>
              <li><strong>Express</strong> - Framework web para Node.js</li>
              <li><strong>MongoDB</strong> - Base de datos NoSQL</li>
              <li><strong>JWT</strong> - Para autenticación segura</li>
            </ul>
            
            <h3>¿Por qué Full Stack?</h3>
            <p>Ser un desarrollador full stack te permite:</p>
            <ul>
              <li>Tener una visión completa del proyecto</li>
              <li>Ser más versátil en el mercado laboral</li>
              <li>Crear aplicaciones completas desde cero</li>
              <li>Entender mejor cómo interactúan frontend y backend</li>
            </ul>
          `,
          video_url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
          duration_minutes: 30,
          lesson_order: 1,
          content_type: "video",
          course_id: courseId
        },
        {
          id: "lesson-2",
          title: "Configuración del entorno de desarrollo",
          description: "Instala y configura todas las herramientas necesarias para el desarrollo",
          content: `
            <h2>Configuración del Entorno</h2>
            <p>Antes de comenzar a programar, necesitamos configurar nuestro entorno de desarrollo.</p>
            
            <h3>Herramientas necesarias:</h3>
            <ol>
              <li><strong>Node.js</strong> - Descargar desde nodejs.org</li>
              <li><strong>Visual Studio Code</strong> - Editor recomendado</li>
              <li><strong>Git</strong> - Control de versiones</li>
              <li><strong>MongoDB Compass</strong> - Para gestionar la base de datos</li>
            </ol>
          `,
          duration_minutes: 45,
          lesson_order: 2,
          content_type: "text",
          course_id: courseId
        },
        {
          id: "lesson-3",
          title: "Fundamentos de React",
          description: "Aprende los conceptos básicos de React y JSX",
          content: "Contenido de React...",
          duration_minutes: 60,
          lesson_order: 3,
          content_type: "video",
          course_id: courseId
        }
      ];

      const currentLesson = mockLessons.find(l => l.id === lessonId);
      
      setCourse(mockCourse);
      setAllLessons(mockLessons);
      setLesson(currentLesson || null);

      // Load progress if user is logged in
      if (user && currentLesson) {
        const mockProgress: LessonProgress = {
          lesson_id: lessonId,
          user_id: user.id,
          completed: false,
          progress_percentage: Math.random() * 100,
          time_spent_minutes: Math.floor(Math.random() * 30),
          last_position: Math.random() * 100
        };
        setProgress(mockProgress);
      }

    } catch (error) {
      console.error('Error loading lesson data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProgressUpdate = async (progressPercentage: number, completed: boolean = false) => {
    if (!user || !lesson) return;

    try {
      await updateLessonProgress({
        lessonId: lesson.id,
        progressPercentage,
        completed,
        timeSpent: Math.floor(currentTime / 60)
      });

      setProgress(prev => prev ? {
        ...prev,
        progress_percentage: progressPercentage,
        completed,
        time_spent_minutes: Math.floor(currentTime / 60)
      } : null);

    } catch (error) {
      console.error('Error updating progress:', error);
    }
  };

  const markAsCompleted = () => {
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
    navigate(`/course/${courseId}/lesson/${targetLessonId}`);
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

  if (loading || !lesson || !course) {
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
                onClick={() => navigate(`/course/${courseId}`)}
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
                    <Button onClick={() => navigate(`/course/${courseId}/exam/${lesson.id}`)}>
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
                    <span>2 de {allLessons.length}</span>
                  </div>
                  <Progress value={(2 / allLessons.length) * 100} className="h-2" />
                </div>
                <p className="text-xs text-gray-600">
                  Continúa completando lecciones para obtener tu certificado
                </p>
              </CardContent>
            </Card>

            {/* Lesson List */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Contenido del curso</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {allLessons.map((lessonItem, index) => (
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
                        {getContentIcon(lessonItem.content_type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium truncate">
                          {index + 1}. {lessonItem.title}
                        </h4>
                        <p className="text-xs text-gray-500">
                          {lessonItem.duration_minutes} min
                        </p>
                      </div>
                      {lessonItem.id === lesson.id && (
                        <div className="w-2 h-2 bg-primary rounded-full"></div>
                      )}
                    </div>
                  ))}
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
