import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { useStudentProgress } from '@/hooks/useSubscription';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { BookOpen, Clock, Trophy, Play, Star, Award, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const { subscription, loading: subLoading } = useSubscription();
  const navigate = useNavigate();

  // MODO DEMO: Datos mock para pruebas
  const mockProgress = {
    total_courses: 3,
    completed_courses: 1,
    total_hours_studied: 15,
    certificates_earned: 1,
    current_streak: 7,
    enrolled_courses: [
      {
        id: 'course-1',
        title: 'Introducción a React',
        progress_percentage: 75,
        thumbnail_url: '/placeholder.svg',
        instructor_name: 'María García',
        last_accessed: new Date().toISOString(),
        duration_hours: 8
      },
      {
        id: 'course-2', 
        title: 'JavaScript Avanzado',
        progress_percentage: 30,
        thumbnail_url: '/placeholder.svg',
        instructor_name: 'Carlos López',
        last_accessed: new Date().toISOString(),
        duration_hours: 12
      },
      {
        id: 'course-3',
        title: 'Diseño UX/UI',
        progress_percentage: 100,
        thumbnail_url: '/placeholder.svg',
        instructor_name: 'Ana Martínez',
        last_accessed: new Date().toISOString(),
        duration_hours: 6
      }
    ]
  };

  const hasActiveSubscription = subscription.subscribed && 
    subscription.subscription_tier !== 'free';

  // MODO DEMO: Sin loading states
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getSubscriptionBadge = () => {
    return <Badge className="bg-green-500">Demo Mode</Badge>;
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Mi Dashboard</h1>
          <p className="text-muted-foreground">
            Bienvenido de nuevo, {user?.email?.split('@')[0] || 'Estudiante'}
          </p>
        </div>
        <div className="flex items-center space-x-2 mt-4 md:mt-0">
          {getSubscriptionBadge()}
          {subscription.subscription_end && (
            <Badge variant="outline">
              Expira: {formatDate(subscription.subscription_end)}
            </Badge>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cursos Totales</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{progress.overview.totalCourses}</div>
            <p className="text-xs text-muted-foreground">
              {progress.overview.inProgressCourses} en progreso
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completados</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{progress.overview.completedCourses}</div>
            <p className="text-xs text-muted-foreground">
              {progress.overview.completionRate.toFixed(1)}% tasa de éxito
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tiempo Invertido</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {progress.overview.totalWatchTimeHours.toFixed(1)}h
            </div>
            <p className="text-xs text-muted-foreground">
              {progress.overview.totalLessons} lecciones completadas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Logros</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockProgress.certificates_earned}</div>
            <p className="text-xs text-muted-foreground">
              Insignias desbloqueadas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Current Enrollments */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5" />
            <span>Mis Cursos</span>
          </CardTitle>
          <CardDescription>
            Continúa donde lo dejaste
          </CardDescription>
        </CardHeader>
        <CardContent>
          {mockProgress.enrolled_courses.length === 0 ? (
            <div className="text-center py-8">
              <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No hay cursos matriculados</h3>
              <p className="text-muted-foreground mb-4">
                Explora nuestro catálogo y comienza tu viaje de aprendizaje
              </p>
              <Button onClick={() => navigate('/courses')}>
                Explorar Cursos
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {mockProgress.enrolled_courses.map((enrollment) => (
                <div key={enrollment.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-lg mb-1">{enrollment.title}</h4>
                      <p className="text-sm text-muted-foreground mb-2">
                        Instructor: {enrollment.instructor_name}
                      </p>
                      
                      <div className="flex items-center space-x-4 mb-3">
                        <Badge variant={enrollment.progress_percentage === 100 ? 'default' : 'secondary'}>
                          {enrollment.progress_percentage === 100 ? 'Completado' : 'En Progreso'}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          Última visita: {formatDate(enrollment.last_accessed)}
                        </span>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span>Progreso</span>
                          <span className="font-medium">{enrollment.progress_percentage}%</span>
                        </div>
                        <Progress value={enrollment.progress_percentage} className="h-2" />
                      </div>
                    </div>

                    <div className="ml-4">
                      <img 
                        src={enrollment.thumbnail_url} 
                        alt={enrollment.title}
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                      <Button 
                        size="sm" 
                        className="w-20 mt-2"
                        onClick={() => navigate(`/course/${enrollment.id}`)}
                      >
                        <Play className="h-4 w-4 mr-1" />
                        Ver
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Activity */}
      {progress.recentActivity.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5" />
              <span>Actividad Reciente</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {progress.recentActivity.slice(0, 5).map((activity, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 bg-muted rounded-lg">
                  <div className={`p-2 rounded-full ${activity.completed ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>
                    {activity.completed ? <Trophy className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{activity.lessonTitle}</p>
                    <p className="text-sm text-muted-foreground">{activity.courseTitle}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{activity.progress}%</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(activity.timestamp)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Achievements */}
      {progress.achievements.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Award className="h-5 w-5" />
              <span>Logros Desbloqueados</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {progress.achievements.map((achievement, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
                  <div className="p-2 rounded-full bg-yellow-100 text-yellow-600">
                    <Star className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-medium">{achievement.name}</p>
                    <p className="text-sm text-muted-foreground">{achievement.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recommendations */}
      {progress.recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BookOpen className="h-5 w-5" />
              <span>Recomendaciones para Ti</span>
            </CardTitle>
            <CardDescription>
              Cursos seleccionados basados en tu progreso
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {progress.recommendations.slice(0, 4).map((rec) => (
                <div key={rec.courseId} className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                     onClick={() => navigate(`/course/${rec.courseId}`)}>
                  <h4 className="font-medium mb-1">{rec.title}</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    Instructor: {rec.instructor}
                  </p>
                  <p className="text-sm text-blue-600">
                    {rec.reason}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {!hasActiveSubscription && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="text-orange-800">Desbloquea Todo el Contenido</CardTitle>
            <CardDescription className="text-orange-700">
              Obtén acceso ilimitado a todos los cursos premium con una suscripción
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => navigate('/subscription')}
              className="bg-orange-600 hover:bg-orange-700"
            >
              Ver Planes de Suscripción
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default StudentDashboard;
