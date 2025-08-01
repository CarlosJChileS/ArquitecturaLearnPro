import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CategorySelector } from '@/components/ui/CategorySelector';
import { 
  useDirectCreateCourse, 
  useDirectUpdateCourse, 
  useDirectDeleteCourse 
} from '@/hooks/useDirectCourseOperations';
import { prepareCourseDataForDB, handleUUIDError } from '@/lib/uuid-utils';
import {
  BookOpen, Edit, Trash2, Plus, Save, Users, CreditCard, 
  Settings, Database, BarChart3, ShoppingCart, UserCheck,
  Layout, Home
} from 'lucide-react';
import { supabase } from '@/lib/supabase-mvp';

// Función utilitaria para extraer ID de video de YouTube
const extractYouTubeVideoId = (url: string): string | null => {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /^([a-zA-Z0-9_-]{11})$/
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
};

// Función para generar thumbnail de YouTube
const getYouTubeThumbnail = (videoId: string): string => {
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
};

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
  // Campos computados o de joins
  instructor_name?: string;
  category?: string;
  students_count?: number;
  lessons_count?: number;
}

// Componente para renderizar la lista de cursos
const CourseList: React.FC<{
  courses: Course[];
  onEditCourse: (course: Course) => void;
  onDeleteCourse: (courseId: string) => void;
}> = ({ courses, onEditCourse, onDeleteCourse }) => {
  if (courses.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No hay cursos registrados. Crea el primer curso.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {courses.map((course) => (
        <div key={course.id} className="flex items-center justify-between p-4 border rounded-lg">
          <div className="flex-1">
            <h3 className="font-semibold">{course.title}</h3>
            <p className="text-sm text-muted-foreground">
              {course.category} • {course.level} • {course.instructor_name}
            </p>
            <div className="flex items-center space-x-4 mt-2">
              <Badge variant={course.is_published ? "default" : "secondary"}>
                {course.is_published ? "Publicado" : "Borrador"}
              </Badge>
              {course.price && course.price > 0 && (
                <span className="text-sm font-medium">${course.price}</span>
              )}
              <span className="text-sm text-muted-foreground">
                {course.duration_hours}h
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEditCourse(course)}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDeleteCourse(course.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};

const AdminCourseManager: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // States
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false); // MODO DEMO: Sin loading inicial
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Course form state - Compatible con la estructura real de la BD
  const [courseForm, setCourseForm] = useState({
    title: '',
    description: '',
    thumbnail_url: '',
    intro_video_url: '', // Video introductorio de YouTube
    price: '',
    instructor_id: null as string | null,
    category_id: null as string | null,
    level: 'beginner', // beginner | intermediate | advanced
    duration_hours: 0,
    published: false // Se mapea a is_published en BD
  });

  // Edge Functions - Usar operaciones directas
  const { execute: createCourse, loading: createCourseLoading } = useDirectCreateCourse({
    onSuccess: () => {
      resetCourseForm();
      setIsDialogOpen(false);
      loadCourses();
    }
  });

  const { execute: updateCourse, loading: updateCourseLoading } = useDirectUpdateCourse({
    onSuccess: () => {
      resetCourseForm();
      setEditingCourse(null);
      setIsDialogOpen(false);
      loadCourses();
    }
  });

  const { execute: deleteCourse } = useDirectDeleteCourse();

  // Check if user has admin role
  useEffect(() => {
    if (!user) {
      return;
    }
    // For now, assume all authenticated users can access admin
    // In production, check user role from database
  }, [user]);

  // Load courses
  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('courses')
        .select(`
          *,
          categories!inner(name),
          profiles!inner(full_name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedCourses = data?.map(course => ({
        id: course.id,
        title: course.title,
        description: course.description || '',
        thumbnail_url: course.thumbnail_url,
        intro_video_url: course.intro_video_url,
        price: course.price,
        instructor_id: course.instructor_id,
        category_id: course.category_id,
        level: course.level,
        duration_hours: course.duration_hours || 0,
        is_published: course.is_published,
        created_at: course.created_at,
        updated_at: course.updated_at,
        // Campos calculados
        instructor_name: course.profiles?.full_name || 'Sin instructor',
        category: course.categories?.name || 'Sin categoría',
        students_count: 0, // Placeholder: implementar después
        lessons_count: 0 // Placeholder: implementar después
      })) || [];

      setCourses(formattedCourses);
    } catch (error) {
      console.error('Error loading courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetCourseForm = () => {
    setCourseForm({
      title: '',
      description: '',
      thumbnail_url: '',
      intro_video_url: '',
      price: '',
      instructor_id: null,
      category_id: null,
      level: 'beginner',
      duration_hours: 0,
      published: false
    });
  };

  const handleCreateCourse = async () => {
    try {
      // Asegurar que instructor_id esté asignado al usuario actual
      const courseDataWithInstructor = {
        ...courseForm,
        instructor_id: user?.id || null
      };
      
      const cleanedData = prepareCourseDataForDB(courseDataWithInstructor);
      await createCourse(cleanedData);
      console.log('Curso creado exitosamente');
    } catch (error) {
      console.error('Error creating course:', error);
      const userFriendlyMessage = handleUUIDError(error);
      alert(userFriendlyMessage);
    }
  };

  const handleUpdateCourse = async () => {
    if (editingCourse) {
      try {
        // Asegurar que instructor_id esté asignado
        const courseDataWithInstructor = {
          ...courseForm,
          instructor_id: courseForm.instructor_id || user?.id || null
        };
        
        const cleanedData = prepareCourseDataForDB(courseDataWithInstructor);
        await updateCourse(editingCourse.id, cleanedData);
        console.log('Curso actualizado exitosamente');
      } catch (error) {
        console.error('Error updating course:', error);
        const userFriendlyMessage = handleUUIDError(error);
        alert(userFriendlyMessage);
      }
    }
  };

  const handleDeleteCourse = async (courseId: string) => {
    if (confirm('¿Estás seguro de que deseas eliminar este curso?')) {
      await deleteCourse(courseId);
      loadCourses();
    }
  };

  const startEditingCourse = (course: Course) => {
    setEditingCourse(course);
    setCourseForm({
      title: course.title,
      description: course.description || '',
      thumbnail_url: course.thumbnail_url || '',
      intro_video_url: course.intro_video_url || '',
      price: course.price?.toString() || '',
      instructor_id: course.instructor_id || null,
      category_id: course.category_id || null,
      level: course.level || 'beginner',
      duration_hours: course.duration_hours || 0,
      published: course.is_published || false
    });
    setIsDialogOpen(true);
  };

  const openCreateDialog = () => {
    resetCourseForm();
    setEditingCourse(null);
    setIsDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Admin Navigation Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Layout className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-semibold">Panel de Administración</h1>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/')}
              >
                <Home className="h-4 w-4 mr-2" />
                Inicio
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/login')}
              >
                Salir
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Admin Menu */}
      <div className="container mx-auto px-6 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/admin/courses')}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Gestión de Cursos</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{courses.length}</div>
              <p className="text-xs text-muted-foreground">Cursos totales</p>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/admin/users')}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Usuarios</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">-</div>
              <p className="text-xs text-muted-foreground">Usuarios registrados</p>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/admin/subscriptions')}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Suscripciones</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">-</div>
              <p className="text-xs text-muted-foreground">Suscripciones activas</p>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/admin/plans')}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Planes</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">-</div>
              <p className="text-xs text-muted-foreground">Planes disponibles</p>
            </CardContent>
          </Card>
        </div>

        {/* Additional Admin Options */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/admin/database')}>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Database className="h-5 w-5" />
                <span>Base de Datos</span>
              </CardTitle>
              <CardDescription>Validar y gestionar la base de datos</CardDescription>
            </CardHeader>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="h-5 w-5" />
                <span>Reportes</span>
              </CardTitle>
              <CardDescription>Estadísticas y análisis</CardDescription>
            </CardHeader>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="h-5 w-5" />
                <span>Configuración</span>
              </CardTitle>
              <CardDescription>Configuración del sistema</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>

      {/* Original Course Management Content */}
      <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Gestión de Cursos</h1>
          <p className="text-muted-foreground">Administra todos los cursos de la plataforma</p>
        </div>
        <Button onClick={openCreateDialog}>
          <Plus className="h-4 w-4 mr-2" />
          Crear Curso
        </Button>
      </div>

      {/* Course Creation/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingCourse ? 'Editar Curso' : 'Crear Nuevo Curso'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="course-title">Título *</Label>
              <Input
                id="course-title"
                value={courseForm.title}
                onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })}
                placeholder="Título del curso"
                required
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
              <Label htmlFor="course-level">Nivel</Label>
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
              <Label htmlFor="course-price">Precio (opcional)</Label>
              <Input
                id="course-price"
                type="number"
                step="0.01"
                value={courseForm.price}
                onChange={(e) => setCourseForm({ ...courseForm, price: e.target.value })}
                placeholder="0.00"
                min="0"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="course-duration">Duración (horas)</Label>
              <Input
                id="course-duration"
                type="number"
                value={courseForm.duration_hours}
                onChange={(e) => setCourseForm({ ...courseForm, duration_hours: Number(e.target.value) })}
                placeholder="0"
                min="0"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="course-thumbnail">URL de Imagen (opcional)</Label>
              <Input
                id="course-thumbnail"
                value={courseForm.thumbnail_url}
                onChange={(e) => setCourseForm({ ...courseForm, thumbnail_url: e.target.value })}
                placeholder="https://example.com/image.jpg"
              />
              {courseForm.thumbnail_url && (
                <img
                  src={courseForm.thumbnail_url}
                  alt="Vista previa"
                  className="w-20 h-12 object-cover rounded border"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="course-intro-video">Video Introductorio (opcional)</Label>
              <Input
                id="course-intro-video"
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
                  <div className="text-sm text-muted-foreground">
                    ✓ Video URL configurado
                  </div>
                );
              })()}
            </div>
            
            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="course-description">Descripción</Label>
              <Textarea
                id="course-description"
                value={courseForm.description}
                onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
                placeholder="Descripción del curso"
                rows={4}
              />
            </div>
            
            <div className="md:col-span-2 space-y-2">
              <Label>Instructor asignado</Label>
              <div className="p-2 bg-muted rounded-md text-sm text-muted-foreground">
                {user?.email || 'Usuario actual'} (automáticamente asignado)
              </div>
            </div>
            
            <div className="md:col-span-2 flex items-center space-x-2">
              <input
                type="checkbox"
                id="course-published"
                checked={courseForm.published}
                onChange={(e) => setCourseForm({ ...courseForm, published: e.target.checked })}
                className="rounded"
              />
              <Label htmlFor="course-published">Publicar curso (visible para los estudiantes)</Label>
            </div>
          </div>
          
          <div className="flex items-center space-x-4 mt-6">
            <Button
              onClick={editingCourse ? handleUpdateCourse : handleCreateCourse}
              disabled={createCourseLoading || updateCourseLoading}
            >
              <Save className="h-4 w-4 mr-2" />
              {editingCourse ? 'Actualizar Curso' : 'Crear Curso'}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setIsDialogOpen(false);
                setEditingCourse(null);
                resetCourseForm();
              }}
            >
              Cancelar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Courses List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BookOpen className="h-5 w-5 mr-2" />
            Cursos ({courses.length})
          </CardTitle>
          <CardDescription>Lista de todos los cursos en la plataforma</CardDescription>
        </CardHeader>
        <CardContent>
          <CourseList 
            courses={courses}
            onEditCourse={startEditingCourse}
            onDeleteCourse={handleDeleteCourse}
          />
        </CardContent>
      </Card>
      </div>
    </div>
  );
};

export default AdminCourseManager;
