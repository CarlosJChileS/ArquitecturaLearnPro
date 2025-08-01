import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { BookOpen, Clock, Trophy, Play, Award, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // MODO DEMO: Datos mock para pruebas
  const mockProgress = {
    total_courses: 3,
    completed_courses: 1,
    total_hours_studied: 15,
    certificates_earned: 1,
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
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
          <Badge className="bg-green-500">Demo Mode</Badge>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cursos Inscritos</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockProgress.total_courses}</div>
            <p className="text-xs text-muted-foreground">2 en progreso</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completados</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockProgress.completed_courses}</div>
            <p className="text-xs text-muted-foreground">33.3% tasa de éxito</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tiempo Invertido</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockProgress.total_hours_studied}h</div>
            <p className="text-xs text-muted-foreground">25 lecciones completadas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Logros</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockProgress.certificates_earned}</div>
            <p className="text-xs text-muted-foreground">Insignias desbloqueadas</p>
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
          <CardDescription>Continúa donde lo dejaste</CardDescription>
        </CardHeader>
        <CardContent>
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
        </CardContent>
      </Card>

      {/* Demo message */}
      <Card>
        <CardContent className="p-6 text-center">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-blue-800 mb-2">🚀 Modo Demo Activado</h3>
            <p className="text-blue-600">
              Todas las funcionalidades están disponibles para pruebas sin restricciones de autenticación.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentDashboard;
