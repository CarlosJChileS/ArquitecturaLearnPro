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
import { User, Mail, Calendar, Award, Camera, Star, Home, ArrowLeft, Download } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export default function Profile() {
  const { profile, updateProfile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const learningProgress = useLearningProgressBasic();
  const [isEditing, setIsEditing] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [formProfile, setFormProfile] = useState({
    name: "",
    email: "",
    bio: "",
    joinDate: "",
    location: "",
    website: "",
    avatar_url: "",
  });

  useEffect(() => {
    const loadUserProfile = async () => {
      if (profile) {
        // Cargar datos básicos desde el contexto Auth
        setFormProfile({
          name: profile.full_name ?? "",
          email: profile.email ?? "",
          bio: "",
          location: "",
          website: "",
          avatar_url: profile.avatar_url ?? "",
          joinDate: new Date(profile.created_at).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
          }),
        });

        // Intentar cargar datos completos desde la base de datos
        try {
          const { data: profileData, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', profile.id)
            .single();

          if (!error && profileData) {
            console.log('Datos cargados desde DB:', profileData);
            // Actualizar con todos los datos disponibles
            setFormProfile(prev => ({
              ...prev,
              name: profileData.full_name ?? prev.name,
              email: profileData.email ?? prev.email,
              bio: profileData.bio ?? prev.bio,
              location: profileData.location ?? prev.location,
              website: profileData.website ?? prev.website,
              avatar_url: profileData.avatar_url ?? prev.avatar_url,
            }));
          }
        } catch (error) {
          console.log('Usando datos del contexto Auth:', error);
        }
      }
    };

    loadUserProfile();
  }, [profile]);

  const [achievements, setAchievements] = useState<any[]>([]);
  const [certificates, setCertificates] = useState<any[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [userCourses, setUserCourses] = useState<any[]>([]);
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

      // Cargar cursos del usuario
      const { data: userCoursesData, error: coursesError } = await supabase
        .from('course_enrollments')
        .select(`
          course_id,
          progress_percentage,
          enrolled_at,
          courses (
            id,
            title,
            category_id,
            categories (
              name
            )
          )
        `)
        .eq('user_id', profile?.id)
        .order('enrolled_at', { ascending: false });

      if (!coursesError && userCoursesData) {
        const formattedCourses = userCoursesData.map(enrollment => ({
          course_id: enrollment.course_id,
          course_title: enrollment.courses?.title || 'Curso Sin Título',
          category: enrollment.courses?.categories?.name || 'General',
          progress_percentage: enrollment.progress_percentage || 0,
          enrolled_at: enrollment.enrolled_at
        }));
        setUserCourses(formattedCourses);
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
    try {
      if (!profile?.id) {
        console.error('No user profile found');
        toast({
          title: "Error",
          description: "No se encontró el perfil del usuario",
          variant: "destructive",
        });
        return;
      }

      // Datos básicos que siempre existen
      let updateData: any = {
        full_name: formProfile.name,
        email: formProfile.email,
        updated_at: new Date().toISOString()
      };

      // Agregar avatar_url si existe (campo base de Supabase)
      if (formProfile.avatar_url) {
        updateData.avatar_url = formProfile.avatar_url;
      }

      // Intentar agregar campos adicionales solo si existen
      try {
        // Hacer una consulta de prueba para ver qué campos están disponibles
        const { data: testData, error: testError } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', profile.id)
          .limit(1)
          .single();

        if (!testError && testData) {
          // Verificar qué campos existen en la respuesta
          if ('bio' in testData) updateData.bio = formProfile.bio;
          if ('location' in testData) updateData.location = formProfile.location;
          if ('website' in testData) updateData.website = formProfile.website;
          
          console.log('Campos disponibles en la base de datos:', Object.keys(testData));
          console.log('Datos a actualizar:', updateData);
        }
      } catch (error) {
        console.log('Usando solo campos básicos para actualización');
      }

      // Actualizar en Supabase
      const { error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('user_id', profile.id);

      if (error) {
        console.error('Error updating profile:', error);
        toast({
          title: "Error al guardar",
          description: `Error: ${error.message}`,
          variant: "destructive",
        });
        return;
      }

      // También actualizar el contexto de auth si existe
      if (updateProfile) {
        await updateProfile({
          full_name: formProfile.name,
          email: formProfile.email,
          avatar_url: formProfile.avatar_url,
        });
      }

      setIsEditing(false);
      toast({
        title: "Perfil actualizado",
        description: "Los cambios se guardaron correctamente.",
      });
    } catch (error) {
      console.error('Error saving profile:', error);
      toast({
        title: "Error",
        description: "Ocurrió un error inesperado. Por favor intenta de nuevo.",
        variant: "destructive",
      });
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !profile?.id) return;

    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Archivo no válido",
        description: "Por favor selecciona una imagen (JPG, PNG, etc.)",
        variant: "destructive",
      });
      return;
    }

    // Validar tamaño (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Archivo muy grande",
        description: "La imagen debe ser menor a 5MB",
        variant: "destructive",
      });
      return;
    }

    setIsUploadingAvatar(true);

    try {
      // Convertir imagen a base64
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const base64Data = e.target?.result as string;
          
          // Actualizar el estado local inmediatamente para mostrar la imagen
          setFormProfile(prev => ({ ...prev, avatar_url: base64Data }));

          // Guardar inmediatamente en la base de datos
          const updateData: any = {
            avatar_url: base64Data,
            updated_at: new Date().toISOString()
          };

          const { error } = await supabase
            .from('profiles')
            .update(updateData)
            .eq('user_id', profile.id);

          if (error) {
            console.error('Error saving avatar:', error);
            
            // Mensajes específicos según el tipo de error
            if (error.code === '42703') {
              toast({
                title: "Columna faltante",
                description: "La columna avatar_url no existe. Ejecuta el script de migración primero.",
                variant: "destructive",
              });
            } else if (error.message.includes('406')) {
              toast({
                title: "Error de permisos",
                description: "No tienes permisos para actualizar el perfil.",
                variant: "destructive",
              });
            } else {
              toast({
                title: "Foto cargada localmente",
                description: `Error: ${error.message}. La imagen se muestra pero no se guardó.`,
                variant: "destructive",
              });
            }
          } else {
            // También actualizar el contexto de auth
            if (updateProfile) {
              await updateProfile({
                ...profile,
                avatar_url: base64Data,
              });
            }

            toast({
              title: "Foto actualizada",
              description: "Tu foto de perfil se guardó correctamente.",
            });
          }

        } catch (error) {
          console.error('Error processing image:', error);
          toast({
            title: "Error",
            description: "No se pudo procesar la imagen.",
            variant: "destructive",
          });
        } finally {
          setIsUploadingAvatar(false);
        }
      };

      reader.onerror = () => {
        toast({
          title: "Error",
          description: "No se pudo leer el archivo.",
          variant: "destructive",
        });
        setIsUploadingAvatar(false);
      };

      reader.readAsDataURL(file);

    } catch (error) {
      console.error('Error handling avatar upload:', error);
      toast({
        title: "Error",
        description: "Ocurrió un error inesperado.",
        variant: "destructive",
      });
      setIsUploadingAvatar(false);
    }
  };

  const generateCertificate = (cert: any) => {
    // Crear un canvas para generar el certificado
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return;
    
    // Configurar el tamaño del certificado (formato horizontal)
    canvas.width = 1200;
    canvas.height = 800;
    
    // Fondo blanco
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Borde decorativo
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 8;
    ctx.strokeRect(40, 40, canvas.width - 80, canvas.height - 80);
    
    // Borde interno
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 2;
    ctx.strokeRect(60, 60, canvas.width - 120, canvas.height - 120);
    
    // Título principal
    ctx.fillStyle = '#1f2937';
    ctx.font = 'bold 48px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('CERTIFICADO DE FINALIZACIÓN', canvas.width / 2, 150);
    
    // Línea decorativa
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(300, 180);
    ctx.lineTo(900, 180);
    ctx.stroke();
    
    // Texto "Se certifica que"
    ctx.fillStyle = '#4b5563';
    ctx.font = '24px Arial, sans-serif';
    ctx.fillText('Se certifica que', canvas.width / 2, 250);
    
    // Nombre del estudiante
    ctx.fillStyle = '#1f2937';
    ctx.font = 'bold 36px Arial, sans-serif';
    ctx.fillText(formProfile.name || 'Estudiante', canvas.width / 2, 310);
    
    // Texto "ha completado exitosamente"
    ctx.fillStyle = '#4b5563';
    ctx.font = '24px Arial, sans-serif';
    ctx.fillText('ha completado exitosamente el curso', canvas.width / 2, 370);
    
    // Nombre del curso
    ctx.fillStyle = '#3b82f6';
    ctx.font = 'bold 32px Arial, sans-serif';
    ctx.fillText(cert.course || 'Curso Completado', canvas.width / 2, 430);
    
    // Fecha de finalización
    ctx.fillStyle = '#4b5563';
    ctx.font = '20px Arial, sans-serif';
    const completedDate = new Date(cert.completedDate).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    ctx.fillText(`Completado el ${completedDate}`, canvas.width / 2, 500);
    
    // Calificación si existe
    if (cert.grade) {
      ctx.fillStyle = '#059669';
      ctx.font = 'bold 24px Arial, sans-serif';
      ctx.fillText(`Calificación: ${cert.grade}`, canvas.width / 2, 540);
    }
    
    // Información de la plataforma
    ctx.fillStyle = '#6b7280';
    ctx.font = '18px Arial, sans-serif';
    ctx.fillText('LearnPro - Plataforma de Aprendizaje Online', canvas.width / 2, 680);
    
    // Fecha de emisión
    const today = new Date().toLocaleDateString('es-ES');
    ctx.fillText(`Fecha de emisión: ${today}`, canvas.width / 2, 710);
    
    // Convertir canvas a imagen y descargar
    canvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `certificado-${cert.course?.replace(/\s+/g, '-').toLowerCase()}-${formProfile.name?.replace(/\s+/g, '-').toLowerCase()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }
    }, 'image/png', 1.0);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Navigation */}
        <div className="mb-6 flex justify-between items-center">
          <Button 
            variant="outline" 
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 hover:bg-primary hover:text-primary-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al Dashboard
          </Button>
          <Button 
            variant="outline" 
            onClick={() => navigate('/')}
            className="flex items-center gap-2 hover:bg-primary hover:text-primary-foreground"
          >
            <Home className="h-4 w-4" />
            Página Principal
          </Button>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader className="text-center">
                <div className="relative mx-auto mb-4">
                  <Avatar className="w-32 h-32 mx-auto">
                    <AvatarImage 
                      src={formProfile.avatar_url || "/placeholder.svg"} 
                      alt={formProfile.name} 
                    />
                    <AvatarFallback className="text-2xl">
                      {formProfile.name.slice(0, 2).toUpperCase() || 'US'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      disabled={isUploadingAvatar}
                      id="avatar-upload"
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      className="absolute bottom-0 right-0 rounded-full w-10 h-10 p-0"
                      disabled={isUploadingAvatar}
                      asChild
                    >
                      <label htmlFor="avatar-upload" className="cursor-pointer flex items-center justify-center">
                        {isUploadingAvatar ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                        ) : (
                          <Camera className="w-4 h-4" />
                        )}
                      </label>
                    </Button>
                  </div>
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

                {/* Mis Cursos Actuales */}
                <Card>
                  <CardHeader>
                    <CardTitle>Mis Cursos Actuales</CardTitle>
                    <CardDescription>Cursos en los que estás inscrito actualmente</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {learningProgress.loading ? (
                        <div className="space-y-3">
                          {[1, 2, 3].map((i) => (
                            <div key={i} className="flex items-center space-x-4 p-3 border rounded-lg animate-pulse">
                              <div className="w-16 h-16 bg-gray-200 rounded-lg"></div>
                              <div className="flex-1 space-y-2">
                                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                                <div className="h-2 bg-gray-200 rounded w-full"></div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : userCourses && userCourses.length > 0 ? (
                        userCourses.map((course) => (
                          <div key={course.course_id} className="flex items-center space-x-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                            <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                              <span className="text-white font-bold text-lg">
                                {course.course_title?.charAt(0) || 'C'}
                              </span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-gray-900 truncate">
                                {course.course_title || 'Curso Sin Título'}
                              </h3>
                              <p className="text-sm text-gray-600 mb-2">
                                Categoría: {course.category || 'General'}
                              </p>
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-xs text-gray-500">Progreso</span>
                                <span className="text-sm font-medium">{course.progress_percentage || 0}%</span>
                              </div>
                              <Progress value={course.progress_percentage || 0} className="h-2" />
                            </div>
                            <div className="flex-shrink-0">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => navigate(`/courses/${course.course_id}`)}
                              >
                                {course.progress_percentage > 0 ? 'Continuar' : 'Comenzar'}
                              </Button>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8">
                          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                            <User className="w-8 h-8 text-gray-400" />
                          </div>
                          <p className="text-gray-600 mb-4">No tienes cursos inscritos</p>
                          <Button onClick={() => navigate('/courses')}>
                            Explorar Cursos
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Actividad Reciente</CardTitle>
                    <CardDescription>Tu historial de aprendizaje más reciente</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {recentActivity && recentActivity.length > 0 ? (
                        recentActivity.map((act, idx) => (
                          <div key={idx} className="flex items-center space-x-4 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                              <div className="w-2 h-2 bg-primary rounded-full" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900">
                                {act.event_type === 'course_viewed' && act.courses?.title
                                  ? `Visitaste "${act.courses.title}"`
                                  : act.event_type === 'achievement' && act.event_data?.title
                                  ? `Logro: ${act.event_data.title}`
                                  : act.event_type === 'course_completed' && act.courses?.title
                                  ? `Completaste "${act.courses.title}"`
                                  : act.event_type === 'lesson_completed'
                                  ? `Completaste una lección`
                                  : `${act.event_type.replace('_', ' ')}`}
                              </p>
                              <div className="flex items-center space-x-2 text-xs text-gray-500">
                                <span>{act.event_type}</span>
                                <span>•</span>
                                <span>{new Date(act.created_at).toLocaleString('es-ES')}</span>
                              </div>
                            </div>
                            {act.courses?.id && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => navigate(`/courses/${act.courses.id}`)}
                                className="flex-shrink-0"
                              >
                                Ver Curso
                              </Button>
                            )}
                          </div>
                        ))
                      ) : userCourses && userCourses.length > 0 ? (
                        // Si no hay actividad reciente pero hay cursos, mostrar cursos como actividad simulada
                        userCourses.slice(0, 3).map((course, idx) => (
                          <div key={course.course_id} className="flex items-center space-x-4 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                              <div className="w-2 h-2 bg-blue-600 rounded-full" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900">
                                Inscrito en "{course.course_title || 'Curso'}"
                              </p>
                              <div className="flex items-center space-x-2 text-xs text-gray-500">
                                <span>course_enrolled</span>
                                <span>•</span>
                                <span>Progreso: {course.progress_percentage || 0}%</span>
                              </div>
                            </div>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => navigate(`/courses/${course.course_id}`)}
                              className="flex-shrink-0"
                            >
                              {course.progress_percentage > 0 ? 'Continuar' : 'Comenzar'}
                            </Button>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8">
                          <div className="w-12 h-12 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                            <Calendar className="w-6 h-6 text-gray-400" />
                          </div>
                          <p className="text-gray-600 mb-4">No hay actividad reciente</p>
                          <p className="text-sm text-gray-500">¡Comienza un curso para ver tu actividad aquí!</p>
                        </div>
                      )}
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
                      {certificates && certificates.length > 0 ? (
                        certificates.map((cert) => (
                          <div key={cert.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                            <div className="flex items-center gap-4">
                              <div className="p-3 bg-primary/10 rounded-full">
                                <Award className="w-6 h-6 text-primary" />
                              </div>
                              <div>
                                <h3 className="font-semibold">{cert.course}</h3>
                                <p className="text-sm text-muted-foreground">
                                  Completado el {new Date(cert.completedDate).toLocaleDateString('es-ES')}
                                </p>
                                {cert.grade && (
                                  <p className="text-sm text-primary font-medium">Calificación: {cert.grade}</p>
                                )}
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => generateCertificate(cert)}
                                className="flex items-center gap-2"
                              >
                                <Download className="h-4 w-4" />
                                Descargar
                              </Button>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8">
                          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                            <Award className="w-8 h-8 text-gray-400" />
                          </div>
                          <p className="text-gray-600 mb-4">No tienes certificados aún</p>
                          <p className="text-sm text-gray-500">Completa cursos para obtener certificados</p>
                        </div>
                      )}
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