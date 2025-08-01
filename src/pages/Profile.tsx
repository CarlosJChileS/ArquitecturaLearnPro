import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useEdgeFunction } from "@/hooks/useEdgeFunctions";
import { useLearningProgressBasic } from "@/hooks/useLearningProgressBasic";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { User, Mail, Calendar, Award, BookOpen, Trophy, Camera, Star, Clock, Target, Settings } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function Profile() {
  const { profile, updateProfile } = useAuth();
  const learningProgress = useLearningProgressBasic();
  const [isEditing, setIsEditing] = useState(false);
  const [formProfile, setFormProfile] = useState({
    name: "",
    email: "",
    bio: "",
    joinDate: "",
    location: "",
    website: "",
  });

  useEffect(() => {
    if (profile) {
      setFormProfile({
        name: profile.full_name ?? "",
        email: profile.email ?? "",
        bio: "",
        joinDate: new Date(profile.created_at).toLocaleDateString('es-ES', {
          year: 'numeric',
          month: 'long',
        }),
        location: "",
        website: "",
      });
    }
  }, [profile]);

  const [achievements, setAchievements] = useState<any[]>([]);
  const [certificates, setCertificates] = useState<any[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [learningStats, setLearningStats] = useState({
    totalHours: 0,
    coursesCompleted: 0,
    currentStreak: 0,
    skillsLearned: 0,
  });

  const { execute: fetchDashboard } = useEdgeFunction(
    'dashboard',
    'getStudentDashboard'
  );

  const { execute: fetchStats } = useEdgeFunction(
    'dashboard',
    'getDashboardStats'
  );

  useEffect(() => {
    if (profile) {
      loadExtraData();
    }
  }, [profile]);

  const loadExtraData = async () => {
    try {
      const statsRes = await fetchStats();
      if (statsRes.data?.summary) {
        const summary = statsRes.data.summary;
        setLearningStats({
          totalHours: summary.totalStudyHours || 0,
          coursesCompleted: summary.completedCourses || 0,
          currentStreak: summary.monthlyLessonsCompleted || 0,
          skillsLearned: summary.totalCourses || 0,
        });
      }

      const dashRes = await fetchDashboard();
      if (dashRes.data) {
        setRecentActivity(dashRes.data.recent_activity || []);
        setCertificates(
          dashRes.data.certificates?.map((c: any) => ({
            id: c.id,
            course: c.courses?.title,
            completedDate: c.issued_at,
            grade: c.score ? `${c.score}%` : undefined,
          })) || []
        );

        const achievementsFromActivity = (dashRes.data.recent_activity || []).filter(
          (a: any) => a.event_type === 'achievement'
        );
        setAchievements(achievementsFromActivity);
      }
    } catch (err) {
      console.error('Error loading profile data:', err);
    }
  };

  const handleSave = async () => {
    await updateProfile({
      full_name: formProfile.name,
      email: formProfile.email,
    });
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader className="text-center">
                <div className="relative mx-auto mb-4">
                  <Avatar className="w-32 h-32 mx-auto">
                    <AvatarImage src="/placeholder.svg" alt={formProfile.name} />
                    <AvatarFallback className="text-2xl">
                      {formProfile.name.slice(0, 2).toUpperCase() || 'US'}
                    </AvatarFallback>
                  </Avatar>
                  <Button
                    size="sm"
                    variant="outline"
                    className="absolute bottom-0 right-0 rounded-full w-10 h-10 p-0"
                  >
                    <Camera className="w-4 h-4" />
                  </Button>
                </div>
                <CardTitle className="text-2xl">{formProfile.name}</CardTitle>
                <CardDescription className="flex items-center justify-center gap-2">
                  <Mail className="w-4 h-4" />
                  {formProfile.email}
                </CardDescription>
                <CardDescription className="flex items-center justify-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Miembro desde {formProfile.joinDate}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="space-y-1">
                    <div className="text-2xl font-bold text-primary">{learningStats.coursesCompleted}</div>
                    <div className="text-sm text-muted-foreground">Cursos Completados</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-2xl font-bold text-primary">{learningStats.totalHours}</div>
                    <div className="text-sm text-muted-foreground">Horas de Estudio</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-2xl font-bold text-primary">{learningStats.currentStreak}</div>
                    <div className="text-sm text-muted-foreground">Días Consecutivos</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-2xl font-bold text-primary">{learningStats.skillsLearned}</div>
                    <div className="text-sm text-muted-foreground">Habilidades</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="overview" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Resumen</TabsTrigger>
                <TabsTrigger value="achievements">Logros</TabsTrigger>
                <TabsTrigger value="certificates">Certificados</TabsTrigger>
                <TabsTrigger value="settings">Configuración</TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Progreso de Aprendizaje</CardTitle>
                    <CardDescription>
                      Tu camino de aprendizaje en LearnPro
                      {learningProgress.error && (
                        <span className="text-orange-600 text-sm block mt-1">
                          {learningProgress.error}
                        </span>
                      )}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {learningProgress.loading ? (
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
                          <div className="h-4 bg-gray-200 rounded w-12 animate-pulse"></div>
                        </div>
                        <div className="h-2 bg-gray-200 rounded animate-pulse"></div>
                      </div>
                    ) : (
                      <>
                        {learningProgress.categoryProgress.map((category, index) => (
                          <div key={index} className="space-y-4">
                            <div className="flex justify-between items-center">
                              <span className="text-sm font-medium">{category.category}</span>
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-muted-foreground">
                                  {category.total_courses} curso{category.total_courses !== 1 ? 's' : ''}
                                </span>
                                <span className="text-sm text-muted-foreground">
                                  {category.average_progress}%
                                </span>
                              </div>
                            </div>
                            <Progress value={category.average_progress} className="h-2" />
                          </div>
                        ))}
                        
                        {/* Estadísticas generales */}
                        <div className="pt-4 border-t">
                          <div className="grid grid-cols-3 gap-4 text-center">
                            <div>
                              <div className="text-2xl font-bold text-blue-600">
                                {learningProgress.overallStats.totalEnrolledCourses}
                              </div>
                              <div className="text-xs text-muted-foreground">Cursos Inscritos</div>
                            </div>
                            <div>
                              <div className="text-2xl font-bold text-green-600">
                                {learningProgress.overallStats.totalCompletedCourses}
                              </div>
                              <div className="text-xs text-muted-foreground">Completados</div>
                            </div>
                            <div>
                              <div className="text-2xl font-bold text-purple-600">
                                {learningProgress.overallStats.averageProgress}%
                              </div>
                              <div className="text-xs text-muted-foreground">Progreso Promedio</div>
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Actividad Reciente</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {recentActivity.map((act, idx) => (
                        <div key={idx} className="flex items-center gap-3">
                          <div className="w-2 h-2 bg-primary rounded-full" />
                          <div className="flex-1">
                            <p className="text-sm">
                              {act.event_type === 'achievement' && act.event_data?.title
                                ? `Logro: ${act.event_data.title}`
                                : act.event_type === 'course_completed' && act.courses?.title
                                ? `Completaste "${act.courses.title}"`
                                : act.event_type}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(act.created_at).toLocaleString('es-ES')}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Achievements Tab */}
              <TabsContent value="achievements" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Logros Obtenidos</CardTitle>
                    <CardDescription>Tus conquistas en el camino del aprendizaje</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4">
                      {achievements.map((achievement, idx) => (
                        <div key={idx} className="flex items-center gap-4 p-4 border rounded-lg">
                          <div className="p-3 bg-primary/10 rounded-full">
                            <Star className="w-6 h-6 text-primary" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold">{achievement.event_data?.title || achievement.event_type}</h3>
                            {achievement.event_data?.description && (
                              <p className="text-sm text-muted-foreground">{achievement.event_data.description}</p>
                            )}
                            <p className="text-xs text-muted-foreground mt-1">
                              {new Date(achievement.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <Badge variant="secondary">Completado</Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Certificates Tab */}
              <TabsContent value="certificates" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Certificados</CardTitle>
                    <CardDescription>Tus certificados de cursos completados</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4">
                      {certificates.map((cert) => (
                        <div key={cert.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center gap-4">
                            <div className="p-3 bg-primary/10 rounded-full">
                              <Award className="w-6 h-6 text-primary" />
                            </div>
                            <div>
                              <h3 className="font-semibold">{cert.course}</h3>
                              <p className="text-sm text-muted-foreground">
                                Completado el {new Date(cert.completedDate).toLocaleDateString()}
                              </p>
                              {cert.grade && (
                                <p className="text-sm text-primary font-medium">Calificación: {cert.grade}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                 </CardContent>
               </Card>
              </TabsContent>

              {/* Settings Tab */}
              <TabsContent value="settings" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Información Personal</CardTitle>
                    <CardDescription>Administra tu información de perfil</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Nombre completo</Label>
                        <Input
                          id="name"
                          value={formProfile.name}
                          onChange={(e) => setFormProfile({ ...formProfile, name: e.target.value })}
                          disabled={!isEditing}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={formProfile.email}
                          onChange={(e) => setFormProfile({ ...formProfile, email: e.target.value })}
                          disabled={!isEditing}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="bio">Biografía</Label>
                      <Textarea
                        id="bio"
                        rows={4}
                        value={formProfile.bio}
                        onChange={(e) => setFormProfile({ ...formProfile, bio: e.target.value })}
                        disabled={!isEditing}
                        placeholder="Cuéntanos sobre ti..."
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="location">Ubicación</Label>
                        <Input
                          id="location"
                          value={formProfile.location}
                          onChange={(e) => setFormProfile({ ...formProfile, location: e.target.value })}
                          disabled={!isEditing}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="website">Sitio web</Label>
                        <Input
                          id="website"
                          value={formProfile.website}
                          onChange={(e) => setFormProfile({ ...formProfile, website: e.target.value })}
                          disabled={!isEditing}
                        />
                      </div>
                    </div>

                    <div className="flex gap-2">
                      {!isEditing ? (
                        <Button onClick={() => setIsEditing(true)}>
                          <User className="w-4 h-4 mr-2" />
                          Editar Perfil
                        </Button>
                      ) : (
                        <>
                          <Button onClick={handleSave}>
                            Guardar Cambios
                          </Button>
                          <Button variant="outline" onClick={() => setIsEditing(false)}>
                            Cancelar
                          </Button>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Preferencias de Notificaciones</CardTitle>
                    <CardDescription>Configura cómo quieres recibir notificaciones</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Nuevos cursos</p>
                        <p className="text-sm text-muted-foreground">Recibe notificaciones de nuevos cursos</p>
                      </div>
                      <input type="checkbox" defaultChecked className="rounded" />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Progreso de cursos</p>
                        <p className="text-sm text-muted-foreground">Recordatorios de cursos en progreso</p>
                      </div>
                      <input type="checkbox" defaultChecked className="rounded" />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Logros y certificados</p>
                        <p className="text-sm text-muted-foreground">Notificaciones de logros obtenidos</p>
                      </div>
                      <input type="checkbox" defaultChecked className="rounded" />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}