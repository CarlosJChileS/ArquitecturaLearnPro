import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save, Plus, Trash2, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { prepareCourseDataForDB, handleUUIDError } from "@/lib/uuid-utils";
import { CategorySelector } from "@/components/ui/CategorySelector";
import { supabase } from "@/integrations/supabase/client";

// Interfaces compatibles con la estructura real de la BD
interface Course {
  id: string;
  title: string;
  description?: string;
  thumbnail_url?: string;
  intro_video_url?: string; // URL del video introductorio
  price?: number;
  instructor_id?: string;
  category_id?: string;
  level: string; // 'beginner' | 'intermediate' | 'advanced'
  duration_hours?: number;
  is_published: boolean;
  created_at: string;
  updated_at?: string;
}

interface Lesson {
  id: string;
  course_id: string;
  title: string;
  description?: string;
  video_url?: string;
  duration_minutes: number;
  order_index: number;
  is_free: boolean;
  created_at: string;
  updated_at?: string;
}

const AdminCourseEditor = () => {
  const navigate = useNavigate();
  const { courseId } = useParams();
  const { toast } = useToast();
  const { user } = useAuth();

  // States
  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Course form state
  const [courseForm, setCourseForm] = useState({
    title: '',
    description: '',
    thumbnail_url: '',
    intro_video_url: '', // Video introductorio de YouTube
    price: '',
    instructor_id: null as string | null,
    category_id: null as string | null,
    level: 'beginner',
    duration_hours: 0,
    published: false
  });

  // Lesson form state
  const [lessonForm, setLessonForm] = useState({
    title: '',
    description: '',
    video_url: '',
    duration_minutes: 0,
    is_free: false
  });

  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [showLessonForm, setShowLessonForm] = useState(false);

  // Check authentication
  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  // Load course data
  useEffect(() => {
    if (courseId && courseId !== 'new') {
      loadCourse();
      loadLessons();
    } else {
      setLoading(false);
    }
  }, [courseId]);

  // Handle auto-scroll to lessons section when coming from "Edit Content" button
  useEffect(() => {
    if (window.location.hash === '#lessons-section') {
      // Small delay to ensure the component is fully rendered
      setTimeout(() => {
        const lessonsSection = document.getElementById('lessons-section');
        if (lessonsSection) {
          lessonsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    }
  }, [courseId, lessons.length]);

  const loadCourse = async () => {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('id', courseId)
        .single();

      if (error) throw error;

      setCourse(data);
      setCourseForm({
        title: data.title,
        description: data.description || '',
        thumbnail_url: data.thumbnail_url || '',
        intro_video_url: data.intro_video_url || '',
        price: data.price?.toString() || '',
        instructor_id: data.instructor_id,
        category_id: data.category_id,
        level: data.level,
        duration_hours: data.duration_hours || 0,
        published: data.is_published
      });
    } catch (error) {
      console.error('Error loading course:', error);
      toast({
        title: "Error",
        description: "No se pudo cargar el curso",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadLessons = async () => {
    try {
      const { data, error } = await supabase
        .from('lessons')
        .select('*')
        .eq('course_id', courseId)
        .order('order_index');

      if (error) throw error;
      setLessons(data || []);
    } catch (error) {
      console.error('Error loading lessons:', error);
    }
  };

  const saveCourse = async () => {
    try {
      setSaving(true);
      
      // Asegurar que instructor_id esté asignado al usuario actual
      const courseDataWithInstructor = {
        ...courseForm,
        instructor_id: courseForm.instructor_id || user?.id || null
      };
      
      const cleanedData = prepareCourseDataForDB(courseDataWithInstructor);

      if (courseId === 'new') {
        // Create new course
        const { data, error } = await supabase
          .from('courses')
          .insert(cleanedData)
          .select()
          .single();

        if (error) throw error;

        toast({
          title: "Éxito",
          description: "Curso creado exitosamente"
        });

        navigate(`/admin/courses/${data.id}`);
      } else {
        // Update existing course
        const { error } = await supabase
          .from('courses')
          .update(cleanedData)
          .eq('id', courseId);

        if (error) throw error;

        toast({
          title: "Éxito",
          description: "Curso actualizado exitosamente"
        });

        loadCourse(); // Reload to show updated data
      }
    } catch (error) {
      console.error('Error saving course:', error);
      const userFriendlyMessage = handleUUIDError(error);
      toast({
        title: "Error",
        description: userFriendlyMessage,
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const saveLesson = async () => {
    try {
      setSaving(true);
      const lessonData = {
        ...lessonForm,
        course_id: courseId,
        order_index: editingLesson ? editingLesson.order_index : lessons.length + 1
      };

      if (editingLesson) {
        // Update lesson
        const { error } = await supabase
          .from('lessons')
          .update(lessonData)
          .eq('id', editingLesson.id);

        if (error) throw error;

        toast({
          title: "Éxito",
          description: "Lección actualizada exitosamente"
        });
      } else {
        // Create lesson
        const { error } = await supabase
          .from('lessons')
          .insert(lessonData);

        if (error) throw error;

        toast({
          title: "Éxito",
          description: "Lección creada exitosamente"
        });
      }

      setShowLessonForm(false);
      setEditingLesson(null);
      resetLessonForm();
      loadLessons();
    } catch (error) {
      console.error('Error saving lesson:', error);
      toast({
        title: "Error",
        description: "Error al guardar la lección",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const deleteLesson = async (lessonId: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar esta lección?')) return;

    try {
      const { error } = await supabase
        .from('lessons')
        .delete()
        .eq('id', lessonId);

      if (error) throw error;

      toast({
        title: "Éxito",
        description: "Lección eliminada exitosamente"
      });

      loadLessons();
    } catch (error) {
      console.error('Error deleting lesson:', error);
      toast({
        title: "Error",
        description: "Error al eliminar la lección",
        variant: "destructive"
      });
    }
  };

  const resetLessonForm = () => {
    setLessonForm({
      title: '',
      description: '',
      video_url: '',
      duration_minutes: 0,
      is_free: false
    });
  };

  const startEditingLesson = (lesson: Lesson) => {
    setEditingLesson(lesson);
    setLessonForm({
      title: lesson.title,
      description: lesson.description || '',
      video_url: lesson.video_url || '',
      duration_minutes: lesson.duration_minutes,
      is_free: lesson.is_free
    });
    setShowLessonForm(true);
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" onClick={() => navigate('/admin/courses')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
          <div>
            <h1 className="text-2xl font-bold">
              {courseId === 'new' ? 'Crear Nuevo Curso' : 'Editar Curso'}
            </h1>
            {course && (
              <p className="text-muted-foreground">{course.title}</p>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {courseId !== 'new' && (
            <>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  const lessonsSection = document.getElementById('lessons-section');
                  lessonsSection?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Gestionar Contenido
              </Button>
              <Button variant="outline" size="sm">
                <Eye className="h-4 w-4 mr-2" />
                Vista Previa
              </Button>
            </>
          )}
          <Button onClick={saveCourse} disabled={saving}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Guardando...' : 'Guardar'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Course Details */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Información del Curso</CardTitle>
              <CardDescription>Detalles básicos del curso</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Título *</Label>
                  <Input
                    id="title"
                    value={courseForm.title}
                    onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })}
                    placeholder="Título del curso"
                  />
                </div>
                
                <div className="space-y-2">
                  <CategorySelector
                    value={courseForm.category_id}
                    onValueChange={(categoryId) => setCourseForm({ ...courseForm, category_id: categoryId })}
                    required={true}
                    label="Categoría *"
                    placeholder="Selecciona una categoría"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="level">Nivel</Label>
                  <Select
                    value={courseForm.level}
                    onValueChange={(value) => setCourseForm({ ...courseForm, level: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Principiante</SelectItem>
                      <SelectItem value="intermediate">Intermedio</SelectItem>
                      <SelectItem value="advanced">Avanzado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="price">Precio</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={courseForm.price}
                    onChange={(e) => setCourseForm({ ...courseForm, price: e.target.value })}
                    placeholder="0.00"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="duration">Duración (horas)</Label>
                  <Input
                    id="duration"
                    type="number"
                    value={courseForm.duration_hours}
                    onChange={(e) => setCourseForm({ ...courseForm, duration_hours: Number(e.target.value) })}
                    placeholder="0"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="thumbnail">URL de Imagen</Label>
                  <Input
                    id="thumbnail"
                    value={courseForm.thumbnail_url}
                    onChange={(e) => setCourseForm({ ...courseForm, thumbnail_url: e.target.value })}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="intro-video">Video Introductorio</Label>
                  <Input
                    id="intro-video"
                    value={courseForm.intro_video_url}
                    onChange={(e) => setCourseForm({ ...courseForm, intro_video_url: e.target.value })}
                    placeholder="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
                  />
                  {courseForm.intro_video_url && (() => {
                    const videoId = extractYouTubeVideoId(courseForm.intro_video_url);
                    return videoId ? (
                      <div className="flex items-center space-x-2">
                        <img
                          src={getYouTubeThumbnail(videoId)}
                          alt="Vista previa del video"
                          className="w-20 h-12 object-cover rounded border"
                        />
                        <div className="text-sm text-green-600">
                          ✓ Video de YouTube detectado
                        </div>
                      </div>
                    ) : (
                      <div className="text-sm text-green-600">
                        ✓ Video URL configurado
                      </div>
                    );
                  })()}
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  value={courseForm.description}
                  onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
                  placeholder="Descripción del curso"
                  rows={4}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Instructor asignado</Label>
                <div className="p-2 bg-muted rounded-md text-sm text-muted-foreground">
                  {user?.email || 'Usuario actual'} (automáticamente asignado)
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Lessons Section */}
          {courseId !== 'new' && (
            <Card id="lessons-section" className="border-2 border-primary/20">
              <CardHeader className="flex flex-row items-center justify-between bg-primary/5">
                <div>
                  <CardTitle className="text-xl">🎓 Gestión de Contenido - Lecciones ({lessons.length})</CardTitle>
                  <CardDescription className="text-base">Administra las lecciones y contenido educativo del curso</CardDescription>
                </div>
                <Button
                  size="lg"
                  className="bg-primary hover:bg-primary/90"
                  onClick={() => {
                    resetLessonForm();
                    setEditingLesson(null);
                    setShowLessonForm(!showLessonForm);
                  }}
                >
                  <Plus className="h-5 w-5 mr-2" />
                  {showLessonForm ? 'Cerrar Formulario' : 'Agregar Nueva Lección'}
                </Button>
              </CardHeader>
              <CardContent>
                {showLessonForm && (
                  <Card className="mb-4">
                    <CardHeader>
                      <CardTitle className="text-lg">
                        {editingLesson ? 'Editar Lección' : 'Nueva Lección'}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="lesson-title">Título</Label>
                          <Input
                            id="lesson-title"
                            value={lessonForm.title}
                            onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })}
                            placeholder="Título de la lección"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="lesson-duration">Duración (minutos)</Label>
                          <Input
                            id="lesson-duration"
                            type="number"
                            value={lessonForm.duration_minutes}
                            onChange={(e) => setLessonForm({ ...lessonForm, duration_minutes: Number(e.target.value) })}
                            placeholder="0"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lesson-description">Descripción</Label>
                        <Textarea
                          id="lesson-description"
                          value={lessonForm.description}
                          onChange={(e) => setLessonForm({ ...lessonForm, description: e.target.value })}
                          placeholder="Descripción de la lección"
                          rows={2}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lesson-video">URL del Video</Label>
                        <Input
                          id="lesson-video"
                          value={lessonForm.video_url}
                          onChange={(e) => setLessonForm({ ...lessonForm, video_url: e.target.value })}
                          placeholder="https://example.com/video.mp4"
                        />
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="lesson-free"
                          checked={lessonForm.is_free}
                          onCheckedChange={(checked) => setLessonForm({ ...lessonForm, is_free: checked })}
                        />
                        <Label htmlFor="lesson-free">Lección gratuita</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button onClick={saveLesson} disabled={saving}>
                          <Save className="h-4 w-4 mr-2" />
                          {saving ? 'Guardando...' : 'Guardar Lección'}
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setShowLessonForm(false);
                            setEditingLesson(null);
                            resetLessonForm();
                          }}
                        >
                          Cancelar
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {lessons.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No hay lecciones agregadas. Crea la primera lección.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {lessons.map((lesson, index) => (
                      <div key={lesson.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <span className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-sm font-medium">
                            {index + 1}
                          </span>
                          <div>
                            <h4 className="font-medium">{lesson.title}</h4>
                            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                              <span>{lesson.duration_minutes} min</span>
                              {lesson.is_free && <Badge variant="secondary">Gratis</Badge>}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => startEditingLesson(lesson)}
                          >
                            Editar
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => deleteLesson(lesson.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Estado del Curso</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="published">Publicado</Label>
                <Switch
                  id="published"
                  checked={courseForm.published}
                  onCheckedChange={(checked) => setCourseForm({ ...courseForm, published: checked })}
                />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Estado:</span>
                  <Badge variant={courseForm.published ? "default" : "secondary"}>
                    {courseForm.published ? "Publicado" : "Borrador"}
                  </Badge>
                </div>
                {courseId !== 'new' && (
                  <>
                    <div className="flex justify-between text-sm">
                      <span>Lecciones:</span>
                      <span>{lessons.length}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Duración total:</span>
                      <span>{lessons.reduce((acc, lesson) => acc + lesson.duration_minutes, 0)} min</span>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {courseForm.thumbnail_url && (
            <Card>
              <CardHeader>
                <CardTitle>Vista Previa</CardTitle>
              </CardHeader>
              <CardContent>
                <img
                  src={courseForm.thumbnail_url}
                  alt="Vista previa del curso"
                  className="w-full h-32 object-cover rounded"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminCourseEditor;
