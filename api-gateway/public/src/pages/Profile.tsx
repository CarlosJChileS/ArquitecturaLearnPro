import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { User, Mail, Calendar, Award, BookOpen, Trophy, Camera } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getUser, getUserProgress } from "@/api";

export default function Profile() {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    bio: "",
    joinDate: "",
    location: "",
    website: ""
  });

  const [learningStats, setLearningStats] = useState({
    totalEntries: 0,
    coursesCompleted: 0,
    currentStreak: 0,
    skillsLearned: 0,
  });

  useEffect(() => {
    async function fetchProfile() {
      try {
        const stored = localStorage.getItem('user');
        if (!stored) return;
        const user = JSON.parse(stored);
        const data = await getUser(user.id);
        setProfile({
          name: data.fullName,
          email: data.email,
          bio: data.bio || '',
          joinDate: new Date(data.createdAt).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' }),
          location: data.location || '',
          website: data.website || ''
        });
        const progress = await getUserProgress(user.id);
        const completed = progress.filter((p: any) => p.completed);
        setLearningStats({
          totalEntries: progress.length,
          coursesCompleted: new Set(completed.map((c: any) => c.course_id)).size,
          currentStreak: 0,
          skillsLearned: completed.length,
        });
      } catch (err) {
        console.error(err);
      }
    }
    fetchProfile();
  }, []);

  const achievements = [
    { id: 1, title: "First Course Completed", description: "Completed your first course", earned: "2024-01-15", icon: BookOpen },
    { id: 2, title: "Fast Learner", description: "Completed 3 courses in one month", earned: "2024-02-01", icon: Trophy },
    { id: 3, title: "JavaScript Master", description: "Completed all JavaScript courses", earned: "2024-02-15", icon: Award },
  ];

  const certificates = [
    { id: 1, course: "Complete JavaScript Course", completedDate: "2024-01-15", grade: "95%" },
    { id: 2, course: "React Fundamentals", completedDate: "2024-02-01", grade: "92%" },
    { id: 3, course: "Node.js Development", completedDate: "2024-02-15", grade: "88%" },
  ];



  const handleSave = () => {
    setIsEditing(false);
    // Here you would typically save to a backend
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5 pt-20">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-4">
          <Button variant="outline" onClick={() => navigate(-1)}>
            ← Volver
          </Button>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader className="text-center">
                <div className="relative mx-auto mb-4">
                  <Avatar className="w-32 h-32 mx-auto">
                    <AvatarImage src="/placeholder.svg" alt={profile.name} />
                    <AvatarFallback className="text-2xl">AG</AvatarFallback>
                  </Avatar>
                  <Button
                    size="sm"
                    variant="outline"
                    className="absolute bottom-0 right-0 rounded-full w-10 h-10 p-0"
                  >
                    <Camera className="w-4 h-4" />
                  </Button>
                </div>
                <CardTitle className="text-2xl">{profile.name}</CardTitle>
                <CardDescription className="flex items-center justify-center gap-2">
                  <Mail className="w-4 h-4" />
                  {profile.email}
                </CardDescription>
                <CardDescription className="flex items-center justify-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Miembro desde {profile.joinDate}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="space-y-1">
                    <div className="text-2xl font-bold text-primary">{learningStats.coursesCompleted}</div>
                    <div className="text-sm text-muted-foreground">Cursos Completados</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-2xl font-bold text-primary">{learningStats.totalEntries}</div>
                    <div className="text-sm text-muted-foreground">Registros</div>
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
                    <CardDescription>Tu camino de aprendizaje en LearnPro</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">JavaScript Development</span>
                        <span className="text-sm text-muted-foreground">85%</span>
                      </div>
                      <Progress value={85} className="h-2" />
                    </div>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">React & Frontend</span>
                        <span className="text-sm text-muted-foreground">70%</span>
                      </div>
                      <Progress value={70} className="h-2" />
                    </div>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Backend Development</span>
                        <span className="text-sm text-muted-foreground">45%</span>
                      </div>
                      <Progress value={45} className="h-2" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Actividad Reciente</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-primary rounded-full" />
                        <div className="flex-1">
                          <p className="text-sm">Completaste "React Hooks Advanced" - 95%</p>
                          <p className="text-xs text-muted-foreground">Hace 2 horas</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-primary rounded-full" />
                        <div className="flex-1">
                          <p className="text-sm">Obtuviste el badge "Fast Learner"</p>
                          <p className="text-xs text-muted-foreground">Ayer</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-muted rounded-full" />
                        <div className="flex-1">
                          <p className="text-sm">Comenzaste "Node.js API Development"</p>
                          <p className="text-xs text-muted-foreground">Hace 3 días</p>
                        </div>
                      </div>
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
                      {achievements.map((achievement) => {
                        const IconComponent = achievement.icon;
                        return (
                          <div key={achievement.id} className="flex items-center gap-4 p-4 border rounded-lg">
                            <div className="p-3 bg-primary/10 rounded-full">
                              <IconComponent className="w-6 h-6 text-primary" />
                            </div>
                            <div className="flex-1">
                              <h3 className="font-semibold">{achievement.title}</h3>
                              <p className="text-sm text-muted-foreground">{achievement.description}</p>
                              <p className="text-xs text-muted-foreground mt-1">
                                Obtenido el {new Date(achievement.earned).toLocaleDateString()}
                              </p>
                            </div>
                            <Badge variant="secondary">Completado</Badge>
                          </div>
                        );
                      })}
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
                              <p className="text-sm text-primary font-medium">Calificación: {cert.grade}</p>
                            </div>
                          </div>
                          <Button variant="outline" size="sm">
                            Descargar
                          </Button>
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
                          value={profile.name}
                          onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                          disabled={!isEditing}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={profile.email}
                          onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                          disabled={!isEditing}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="bio">Biografía</Label>
                      <Textarea
                        id="bio"
                        rows={4}
                        value={profile.bio}
                        onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                        disabled={!isEditing}
                        placeholder="Cuéntanos sobre ti..."
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="location">Ubicación</Label>
                        <Input
                          id="location"
                          value={profile.location}
                          onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                          disabled={!isEditing}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="website">Sitio web</Label>
                        <Input
                          id="website"
                          value={profile.website}
                          onChange={(e) => setProfile({ ...profile, website: e.target.value })}
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
      </div>
    </div>
  );
}