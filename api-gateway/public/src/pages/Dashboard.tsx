import React from 'react';
import Header from '@/components/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BookOpen, Clock, Trophy, Target, Play, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const activeCourses = [
    {
      id: 1,
      title: "React Avanzado y Hooks",
      progress: 75,
      totalLessons: 24,
      completedLessons: 18,
      nextLesson: "useContext y Context API",
      thumbnail: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=300&h=200&fit=crop",
      timeRemaining: "2h 30m"
    },
    {
      id: 2,
      title: "TypeScript Fundamentals",
      progress: 45,
      totalLessons: 16,
      completedLessons: 7,
      nextLesson: "Interfaces y Types",
      thumbnail: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=300&h=200&fit=crop",
      timeRemaining: "4h 15m"
    },
    {
      id: 3,
      title: "Node.js y Express",
      progress: 20,
      totalLessons: 20,
      completedLessons: 4,
      nextLesson: "Middleware y Routing",
      thumbnail: "https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=300&h=200&fit=crop",
      timeRemaining: "6h 45m"
    }
  ];

  const recentActivity = [
    { course: "React Avanzado", lesson: "Custom Hooks", date: "Hoy", type: "completed" },
    { course: "TypeScript", lesson: "Tipos básicos", date: "Ayer", type: "completed" },
    { course: "Node.js", lesson: "Introducción", date: "2 días", type: "started" },
    { course: "React Avanzado", lesson: "useEffect", date: "3 días", type: "completed" }
  ];

  const stats = {
    totalCourses: 8,
    completedCourses: 3,
    hoursLearned: 45,
    streak: 7
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <Header />
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">
            Mi Dashboard
          </h1>
          <p className="text-muted-foreground">Continúa tu aprendizaje donde lo dejaste</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="hover-scale">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cursos Activos</CardTitle>
              <BookOpen className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{activeCourses.length}</div>
              <p className="text-xs text-muted-foreground">de {stats.totalCourses} total</p>
            </CardContent>
          </Card>

          <Card className="hover-scale">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Horas Aprendidas</CardTitle>
              <Clock className="h-4 w-4 text-secondary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-secondary">{stats.hoursLearned}</div>
              <p className="text-xs text-muted-foreground">este mes</p>
            </CardContent>
          </Card>

          <Card className="hover-scale">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completados</CardTitle>
              <Trophy className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-accent">{stats.completedCourses}</div>
              <p className="text-xs text-muted-foreground">cursos terminados</p>
            </CardContent>
          </Card>

          <Card className="hover-scale">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Racha</CardTitle>
              <Target className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{stats.streak}</div>
              <p className="text-xs text-muted-foreground">días consecutivos</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Active Courses */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-primary" />
                  Mis Cursos Activos
                </CardTitle>
                <CardDescription>Continúa donde lo dejaste</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {activeCourses.map((course) => (
                  <div key={course.id} className="group border rounded-lg p-4 hover:shadow-md transition-all">
                    <div className="flex items-start gap-4">
                      <img 
                        src={course.thumbnail} 
                        alt={course.title}
                        className="w-20 h-14 rounded object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                          {course.title}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-2">
                          Siguiente: {course.nextLesson}
                        </p>
                        
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">
                              {course.completedLessons} de {course.totalLessons} lecciones
                            </span>
                            <span className="font-medium text-primary">{course.progress}%</span>
                          </div>
                          <Progress value={course.progress} className="h-2" />
                        </div>
                        
                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            {course.timeRemaining} restante
                          </div>
                          <Button size="sm" className="group-hover:shadow-md transition-shadow">
                            <Play className="h-4 w-4 mr-1" />
                            Continuar
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                
                <div className="text-center pt-4">
                  <Link to="/courses">
                    <Button variant="outline" className="w-full sm:w-auto">
                      <BookOpen className="h-4 w-4 mr-2" />
                      Explorar Más Cursos
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-secondary" />
                  Actividad Reciente
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className={`w-2 h-2 rounded-full mt-2 ${
                      activity.type === 'completed' ? 'bg-green-500' : 'bg-blue-500'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {activity.lesson}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {activity.course} • {activity.date}
                      </p>
                    </div>
                    <Badge variant={activity.type === 'completed' ? 'default' : 'secondary'} className="text-xs">
                      {activity.type === 'completed' ? 'Completado' : 'Iniciado'}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Acciones Rápidas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full justify-start" variant="outline">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Buscar Cursos
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Trophy className="h-4 w-4 mr-2" />
                  Ver Certificados
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Target className="h-4 w-4 mr-2" />
                  Establecer Metas
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;