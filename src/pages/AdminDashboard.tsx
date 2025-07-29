import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  useEdgeFunction, useCreateCourse, useUpdateCourse, useDeleteCourse,
  useCreateUser, useUpdateUser, useDeleteUser 
} from '@/hooks/useEdgeFunctions';
import {
  Users, BookOpen, DollarSign, TrendingUp,
  Edit, Trash2, Plus, Video,
  Save, Play, Clock, Award, CheckCircle, LogOut
} from 'lucide-react';
import { Navigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

type UserRole = 'student' | 'instructor' | 'admin';
type ContentType = 'video' | 'text' | 'pdf' | 'quiz';
type QuestionType = 'multiple_choice' | 'true_false' | 'short_answer';

interface User {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  created_at: string;
  last_sign_in: string;
  subscription_status: boolean;
  subscription_tier?: string;
  subscription_expires_at?: string;
}

interface Course {
  id: string;
  title: string;
  description: string;
  instructor_name: string;
  category: string;
  level: string;
  subscription_tier: string; // 'basic' | 'premium' | 'free'
  students_count: number;
  published: boolean;
  created_at: string;
  thumbnail_url?: string;
  intro_video_url?: string;
  duration_hours?: number;
  has_final_exam?: boolean;
  text_sections?: string[];
  lessons_count?: number;
}

interface Lesson {
  id: string;
  course_id: string;
  title: string;
  description: string;
  video_url?: string;
  content_url?: string;
  materials_url?: string;
  duration_minutes: number;
  order_index: number;
  is_free: boolean;
  content_type: ContentType;
}

interface Exam {
  id: string;
  course_id: string;
  title: string;
  description: string;
  passing_score: number;
  max_attempts: number;
  time_limit_minutes: number;
  is_active: boolean;
  questions: ExamQuestion[];
}

interface ExamQuestion {
  id: string;
  exam_id: string;
  question_text: string;
  question_type: QuestionType;
  options?: string[];
  correct_answer: string;
  points: number;
  order_index: number;
}

interface AdminStats {
  totalUsers: number;
  totalCourses: number;
  totalRevenue: number;
  activeSubscriptions: number;
  newUsersThisMonth: number;
  coursesPublishedThisMonth: number;
  basicSubscriptions: number;
  premiumSubscriptions: number;
  freeUsers: number;
}

const AdminDashboard: React.FC = () => {
  const { user, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [users, setUsers] = useState<User[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalCourses: 0,
    totalRevenue: 0,
    activeSubscriptions: 0,
    newUsersThisMonth: 0,
    coursesPublishedThisMonth: 0,
    basicSubscriptions: 0,
    premiumSubscriptions: 0,
    freeUsers: 0
  });

  // Course form state
  const [courseForm, setCourseForm] = useState({
    title: '',
    description: '',
    category: '',
    level: 'beginner',
    subscription_tier: 'basic',
    instructor_id: '',
    published: false,
    thumbnail_url: '',
    intro_video_url: '',
    duration_hours: 0,
    has_final_exam: false,
    text_sections: [] as string[]
  });

  // Lesson form state
  const [lessonForm, setLessonForm] = useState({
    title: '',
    description: '',
    content_type: 'video' as ContentType,
    video_url: '',
    content_url: '',
    materials_url: '',
    duration_minutes: 0,
    is_free: false
  });

  // Exam form state
  const [examForm, setExamForm] = useState({
    title: '',
    description: '',
    passing_score: 70,
    max_attempts: 3,
    time_limit_minutes: 60,
    questions: [] as ExamQuestion[]
  });

  // UI State
  const [showLessonForm, setShowLessonForm] = useState(false);
  const [showExamForm, setShowExamForm] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);

  // User form state
  const [userForm, setUserForm] = useState({
    email: '',
    full_name: '',
    role: 'student' as UserRole,
    password: ''
  });

  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const { execute: getAdminStats } = useEdgeFunction('admin', 'getAdminStats');
  const { execute: getAllUsers } = useEdgeFunction('admin', 'getAllUsers');
  const { execute: getAllCourses } = useEdgeFunction('admin', 'getAllCourses');
  const { execute: uploadFile } = useEdgeFunction('admin', 'uploadFile');
  const { execute: createLesson } = useEdgeFunction('admin', 'createLesson');
  const { execute: deleteLesson } = useEdgeFunction('admin', 'deleteLesson');
  const { execute: createExam } = useEdgeFunction('admin', 'createExam');
  const { execute: getCourseLessons } = useEdgeFunction('admin', 'getCourseLessons');

  const { execute: createCourse, loading: createCourseLoading } = useCreateCourse({
    onSuccess: () => {
      resetCourseForm();
      loadCourses();
    }
  });

  const { execute: updateCourse, loading: updateCourseLoading } = useUpdateCourse({
    onSuccess: () => {
      resetCourseForm();
      setEditingCourse(null);
      loadCourses();
    }
  });

  const { execute: deleteCourse, loading: deleteCourseLoading } = useDeleteCourse({
    onSuccess: () => {
      loadCourses();
    }
  });

  const { execute: createUser, loading: createUserLoading } = useCreateUser({
    onSuccess: () => {
      resetUserForm();
      loadUsers();
    }
  });

  const { execute: updateUser, loading: updateUserLoading } = useUpdateUser({
    onSuccess: () => {
      resetUserForm();
      setEditingUser(null);
      loadUsers();
    }
  });

  const { execute: deleteUser, loading: deleteUserLoading } = useDeleteUser({
    onSuccess: () => {
      loadUsers();
    }
  });

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const loadDashboardData = async () => {
    await Promise.all([
      loadStats(),
      loadUsers(),
      loadCourses()
    ]);
  };

  const loadStats = async () => {
    try {
      const result = await getAdminStats();
      if (result.data) {
        setStats(result.data);
      } else {
        // Calcular estadísticas desde datos reales de Supabase
        const [usersResult, coursesResult] = await Promise.all([
          getAllUsers(),
          getAllCourses()
        ]);

        const totalUsers = usersResult.data?.length || 0;
        const totalCourses = coursesResult.data?.length || 0;
        const publishedCourses = coursesResult.data?.filter(course => course.published).length || 0;
        
        // Calcular métricas de suscripción desde Supabase directamente
        // TODO: Implementar cuando la tabla user_subscriptions esté disponible
        const activeSubscriptions = 0;
        const basicSubscriptions = 0;
        const premiumSubscriptions = 0;

        const freeUsers = totalUsers - (activeSubscriptions || 0);
        const totalRevenue = ((basicSubscriptions || 0) * 29) + ((premiumSubscriptions || 0) * 49);

        // Calcular usuarios nuevos este mes
        const thisMonth = new Date();
        thisMonth.setDate(1);
        const newUsersThisMonth = usersResult.data?.filter(user => 
          new Date(user.created_at) >= thisMonth
        ).length || 0;

        setStats({
          totalUsers,
          totalCourses,
          totalRevenue,
          activeSubscriptions: activeSubscriptions || 0,
          newUsersThisMonth,
          coursesPublishedThisMonth: publishedCourses,
          basicSubscriptions: basicSubscriptions || 0,
          premiumSubscriptions: premiumSubscriptions || 0,
          freeUsers
        });
      }
    } catch (error) {
      console.error('Error loading stats:', error);
      // Fallback a datos por defecto solo en caso de error
      setStats({
        totalUsers: 0,
        totalCourses: 0,
        totalRevenue: 0,
        activeSubscriptions: 0,
        newUsersThisMonth: 0,
        coursesPublishedThisMonth: 0,
        basicSubscriptions: 0,
        premiumSubscriptions: 0,
        freeUsers: 0
      });
    }
  };

  const loadUsers = async () => {
    try {
      const result = await getAllUsers();
      if (result.data) {
        setUsers(result.data);
      } else {
        // Si no hay Edge Function, consultar directamente Supabase
        const { data: usersData, error } = await supabase
          .from('profiles')
          .select(`
            user_id,
            full_name,
            role,
            created_at,
            updated_at
          `)
          .order('created_at', { ascending: false });

        if (!error && usersData) {
          const formattedUsers = usersData.map(user => {
            return {
              id: user.user_id,
              email: 'usuario@ejemplo.com', // TODO: Obtener email real de auth.users
              full_name: user.full_name || 'Sin nombre',
              role: (user.role as UserRole) || 'student',
              created_at: user.created_at,
              last_sign_in: user.updated_at || user.created_at,
              subscription_status: false // TODO: Obtener de user_subscriptions
            };
          });
          setUsers(formattedUsers);
        }
      }
    } catch (error) {
      console.error('Error loading users:', error);
      setUsers([]);
    }
  };

  const loadCourses = async () => {
    try {
      const result = await getAllCourses();
      if (result.data) {
        setCourses(result.data);
      } else {
        // Si no hay Edge Function, consultar directamente Supabase
        const { data: coursesData, error } = await supabase
          .from('courses')
          .select(`
            id,
            title,
            description,
            level,
            is_published,
            created_at,
            instructor_id,
            profiles!courses_instructor_id_fkey(full_name),
            course_enrollments(count)
          `)
          .order('created_at', { ascending: false });

        if (!error && coursesData) {
          const formattedCourses = coursesData.map(course => ({
            id: course.id,
            title: course.title,
            description: course.description,
            instructor_name: course.profiles?.full_name || 'Instructor no asignado',
            category: 'General', // Default category
            level: course.level,
            subscription_tier: 'basic', // Default tier
            students_count: course.course_enrollments?.length || 0,
            published: course.is_published || false,
            created_at: course.created_at
          }));
          setCourses(formattedCourses);
        }
      }
    } catch (error) {
      console.error('Error loading courses:', error);
      setCourses([]);
    }
  };

  const resetCourseForm = () => {
    setCourseForm({
      title: '',
      description: '',
      category: '',
      level: 'beginner',
      subscription_tier: 'basic',
      instructor_id: '',
      published: false,
      thumbnail_url: '',
      duration_hours: 0,
      has_final_exam: false
    });
  };

  const resetUserForm = () => {
    setUserForm({
      email: '',
      full_name: '',
      role: 'student',
      password: ''
    });
  };

  const handleCreateCourse = async () => {
    await createCourse(courseForm);
  };

  const handleUpdateCourse = async () => {
    if (editingCourse) {
      await updateCourse(editingCourse.id, courseForm);
    }
  };

  const handleDeleteCourse = async (courseId: string) => {
    if (confirm('¿Estás seguro de que deseas eliminar este curso?')) {
      await deleteCourse(courseId);
    }
  };

  const handleCreateUser = async () => {
    await createUser(userForm);
  };

  const handleUpdateUser = async () => {
    if (editingUser) {
      await updateUser(editingUser.id, userForm);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (confirm('¿Estás seguro de que deseas eliminar este usuario?')) {
      await deleteUser(userId);
    }
  };

  // Video and File Upload Functions
  const handleVideoUpload = async (file: File) => {
    setUploadingVideo(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('bucket', 'course-videos');
      
      const result = await uploadFile(formData);
      if (result.data?.url) {
        setLessonForm({ ...lessonForm, video_url: result.data.url });
      }
    } catch (error) {
      console.error('Error uploading video:', error);
    } finally {
      setUploadingVideo(false);
    }
  };

  const handleThumbnailUpload = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('bucket', 'course-thumbnails');
      
      const result = await uploadFile(formData);
      if (result.data?.url) {
        setCourseForm({ ...courseForm, thumbnail_url: result.data.url });
      }
    } catch (error) {
      console.error('Error uploading thumbnail:', error);
    }
  };

  const handleIntroVideoUpload = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('bucket', 'course-intro-videos');

      const result = await uploadFile(formData);
      if (result.data?.url) {
        setCourseForm({ ...courseForm, intro_video_url: result.data.url });
      }
    } catch (error) {
      console.error('Error uploading intro video:', error);
    }
  };

  const addTextSection = () => {
    setCourseForm({
      ...courseForm,
      text_sections: [...courseForm.text_sections, '']
    });
  };

  const updateTextSection = (index: number, text: string) => {
    const sections = [...courseForm.text_sections];
    sections[index] = text;
    setCourseForm({ ...courseForm, text_sections: sections });
  };

  const removeTextSection = (index: number) => {
    const sections = courseForm.text_sections.filter((_, i) => i !== index);
    setCourseForm({ ...courseForm, text_sections: sections });
  };

  // Lesson Management Functions
  const handleCreateLesson = async () => {
    if (!selectedCourse) return;
    
    try {
      const lessonData = {
        ...lessonForm,
        course_id: selectedCourse.id,
        order_index: lessons.length + 1
      };
      
      const result = await createLesson(lessonData);
      if (result.data) {
        setLessons([...lessons, result.data]);
        setLessonForm({
          title: '',
          description: '',
          content_type: 'video',
          video_url: '',
          content_url: '',
          materials_url: '',
          duration_minutes: 0,
          is_free: false
        });
        setShowLessonForm(false);
      }
    } catch (error) {
      console.error('Error creating lesson:', error);
    }
  };

  const handleDeleteLesson = async (lessonId: string) => {
    if (confirm('¿Estás seguro de que deseas eliminar esta lección?')) {
      try {
        await deleteLesson({ id: lessonId });
        setLessons(lessons.filter(l => l.id !== lessonId));
      } catch (error) {
        console.error('Error deleting lesson:', error);
      }
    }
  };

  // Exam Management Functions
  const handleCreateExam = async () => {
    if (!selectedCourse) return;
    
    try {
      const examData = {
        ...examForm,
        course_id: selectedCourse.id
      };
      
      const result = await createExam(examData);
      if (result.data) {
        setShowExamForm(false);
      }
    } catch (error) {
      console.error('Error creating exam:', error);
    }
  };

  const addExamQuestion = () => {
    const newQuestion: ExamQuestion = {
      id: Date.now().toString(),
      exam_id: '',
      question_text: '',
      question_type: 'multiple_choice',
      options: ['', '', '', ''],
      correct_answer: '',
      points: 1,
      order_index: examForm.questions.length + 1
    };
    
    setExamForm({
      ...examForm,
      questions: [...examForm.questions, newQuestion]
    });
  };

  const updateExamQuestion = (index: number, updatedQuestion: ExamQuestion) => {
    const updatedQuestions = [...examForm.questions];
    updatedQuestions[index] = updatedQuestion;
    setExamForm({ ...examForm, questions: updatedQuestions });
  };

  const removeExamQuestion = (index: number) => {
    const updatedQuestions = examForm.questions.filter((_, i) => i !== index);
    setExamForm({ ...examForm, questions: updatedQuestions });
  };

  const startEditingCourse = (course: Course) => {
    setEditingCourse(course);
    setSelectedCourse(course);
    setCourseForm({
      title: course.title,
      description: course.description,
      category: course.category,
      level: course.level,
      subscription_tier: course.subscription_tier,
      instructor_id: '', // Would be populated from course data
      published: course.published,
      thumbnail_url: course.thumbnail_url || '',
      intro_video_url: course.intro_video_url || '',
      duration_hours: course.duration_hours || 0,
      has_final_exam: course.has_final_exam || false,
      text_sections: course.text_sections || []
    });
    setShowExamForm(course.has_final_exam || false);
    
    // Load lessons for this course
    loadCourseLessons(course.id);
  };

  const loadCourseLessons = async (courseId: string) => {
    try {
      const result = await getCourseLessons({ course_id: courseId });
      if (result.data) {
        setLessons(result.data);
      }
    } catch (error) {
      console.error('Error loading lessons:', error);
    }
  };

  const startEditingUser = (user: User) => {
    setEditingUser(user);
    setUserForm({
      email: user.email,
      full_name: user.full_name,
      role: user.role,
      password: ''
    });
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'instructor':
        return 'bg-blue-100 text-blue-800';
      case 'student':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'beginner':
        return 'bg-green-100 text-green-800';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800';
      case 'advanced':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getSubscriptionTierColor = (tier: string) => {
    switch (tier) {
      case 'free':
        return 'bg-gray-100 text-gray-800';
      case 'basic':
        return 'bg-blue-100 text-blue-800';
      case 'premium':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Panel de Administración</h1>
          <p className="text-gray-600">Gestiona usuarios, cursos y el contenido de la plataforma</p>
        </div>
        <div className="flex items-center space-x-2">
          <Link to="/admin/subscriptions">
            <Button variant="outline" size="sm">Suscripciones</Button>
          </Link>
          <Button variant="outline" size="sm" onClick={signOut}>
            <LogOut className="h-4 w-4 mr-2" />
            Cerrar Sesión
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Resumen</TabsTrigger>
          <TabsTrigger value="courses">Cursos</TabsTrigger>
          <TabsTrigger value="content">Contenido</TabsTrigger>
          <TabsTrigger value="users">Usuarios</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Usuarios</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalUsers}</div>
                <p className="text-xs text-muted-foreground">
                  +{stats.newUsersThisMonth} este mes
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Cursos</CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalCourses}</div>
                <p className="text-xs text-muted-foreground">
                  +{stats.coursesPublishedThisMonth} publicados este mes
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${stats.totalRevenue.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  Revenue total acumulado
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Suscripciones Activas</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.activeSubscriptions}</div>
                <p className="text-xs text-muted-foreground">
                  Usuarios con suscripción activa
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Additional Subscription Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Suscripciones Basic</CardTitle>
                <Badge className="bg-blue-100 text-blue-800">Basic</Badge>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.basicSubscriptions}</div>
                <p className="text-xs text-muted-foreground">
                  $29/mes cada una
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Suscripciones Premium</CardTitle>
                <Badge className="bg-purple-100 text-purple-800">Premium</Badge>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.premiumSubscriptions}</div>
                <p className="text-xs text-muted-foreground">
                  $49/mes cada una
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Usuarios Free</CardTitle>
                <Badge className="bg-gray-100 text-gray-800">Free</Badge>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.freeUsers}</div>
                <p className="text-xs text-muted-foreground">
                  Sin suscripción activa
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Cursos Recientes</CardTitle>
                <CardDescription>Últimos cursos creados</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {courses.slice(0, 5).map((course) => (
                    <div key={course.id} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{course.title}</p>
                        <p className="text-sm text-gray-600">{course.instructor_name}</p>
                      </div>
                      <div className="flex space-x-2">
                        <Badge className={getSubscriptionTierColor(course.subscription_tier)}>
                          {course.subscription_tier}
                        </Badge>
                        <Badge className={course.published ? '' : 'bg-yellow-100 text-yellow-800'}>
                          {course.published ? 'Publicado' : 'Borrador'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Usuarios Recientes</CardTitle>
                <CardDescription>Últimos usuarios registrados</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {users.slice(0, 5).map((user) => (
                    <div key={user.id} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{user.full_name}</p>
                        <p className="text-sm text-gray-600">{user.email}</p>
                      </div>
                      <div className="flex space-x-2">
                        <Badge className={getRoleColor(user.role)}>
                          {user.role}
                        </Badge>
                        {user.subscription_status ? (
                          <Badge className={getSubscriptionTierColor(user.subscription_tier || 'basic')}>
                            {user.subscription_tier || 'Basic'}
                          </Badge>
                        ) : (
                          <Badge className="bg-gray-100 text-gray-800">Free</Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="courses" className="space-y-6">
          {/* Course Creation Form */}
          <Card>
            <CardHeader>
              <CardTitle>
                {editingCourse ? 'Editar Curso' : 'Crear Nuevo Curso'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="course-title">Título</Label>
                  <Input
                    id="course-title"
                    value={courseForm.title}
                    onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })}
                    placeholder="Título del curso"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="course-category">Categoría</Label>
                  <Input
                    id="course-category"
                    value={courseForm.category}
                    onChange={(e) => setCourseForm({ ...courseForm, category: e.target.value })}
                    placeholder="Categoría del curso"
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
                  <Label htmlFor="course-tier">Tier de Suscripción</Label>
                  <Select value={courseForm.subscription_tier} onValueChange={(value) => setCourseForm({ ...courseForm, subscription_tier: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar tier" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="free">Free</SelectItem>
                      <SelectItem value="basic">Basic ($29/mes)</SelectItem>
                      <SelectItem value="premium">Premium ($49/mes)</SelectItem>
                    </SelectContent>
                  </Select>
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
                  <Label htmlFor="course-thumbnail">Imagen del Curso</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      id="course-thumbnail"
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleThumbnailUpload(file);
                      }}
                    />
                    {courseForm.thumbnail_url && (
                      <img
                        src={courseForm.thumbnail_url}
                        alt="Thumbnail"
                        className="w-12 h-12 object-cover rounded"
                      />
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="course-intro-video">Video Introductorio</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      id="course-intro-video"
                      type="file"
                      accept="video/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleIntroVideoUpload(file);
                      }}
                    />
                    {courseForm.intro_video_url && (
                      <video controls className="w-24 h-12">
                        <source src={courseForm.intro_video_url} type="video/mp4" />
                      </video>
                    )}
                  </div>
                </div>
                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="course-description">Descripción</Label>
                  <Textarea
                    id="course-description"
                    value={courseForm.description}
                    onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
                    placeholder="Descripción del curso"
                    rows={3}
                  />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <Label>Secciones de Texto</Label>
                  {courseForm.text_sections.map((section, idx) => (
                    <div key={`section-${idx}`} className="flex items-start space-x-2">
                      <Textarea
                        value={section}
                        onChange={(e) => updateTextSection(idx, e.target.value)}
                        rows={2}
                        className="flex-1"
                      />
                      <Button variant="outline" size="sm" onClick={() => removeTextSection(idx)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button variant="outline" size="sm" onClick={addTextSection}>
                    <Plus className="h-4 w-4 mr-2" /> Agregar Sección
                  </Button>
                </div>
                <div className="md:col-span-2 flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="has-final-exam"
                      checked={courseForm.has_final_exam}
                      onChange={(e) => {
                        setCourseForm({ ...courseForm, has_final_exam: e.target.checked });
                        setShowExamForm(e.target.checked);
                      }}
                      className="rounded"
                    />
                    <Label htmlFor="has-final-exam">Incluir examen final</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="course-published"
                      checked={courseForm.published}
                      onChange={(e) => setCourseForm({ ...courseForm, published: e.target.checked })}
                      className="rounded"
                    />
                    <Label htmlFor="course-published">Publicar curso</Label>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-4 mt-4">
                <Button
                  onClick={editingCourse ? handleUpdateCourse : handleCreateCourse}
                  disabled={createCourseLoading || updateCourseLoading}
                >
                  {editingCourse ? 'Actualizar Curso' : 'Crear Curso'}
                </Button>
                {editingCourse && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setEditingCourse(null);
                      resetCourseForm();
                    }}
                  >
                    Cancelar
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Courses List */}
          <Card>
            <CardHeader>
              <CardTitle>Gestión de Cursos</CardTitle>
              <CardDescription>Administra todos los cursos de la plataforma</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {false ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {courses.map((course) => (
                      <div key={course.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <h3 className="font-medium">{course.title}</h3>
                            <Badge className={getLevelColor(course.level)}>
                              {course.level}
                            </Badge>
                            <Badge className={getSubscriptionTierColor(course.subscription_tier)}>
                              {course.subscription_tier}
                            </Badge>
                            <Badge className={course.published ? '' : 'bg-yellow-100 text-yellow-800'}>
                              {course.published ? 'Publicado' : 'Borrador'}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            {course.instructor_name} • {course.students_count} estudiantes
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedCourse(course);
                              setActiveTab('content');
                              loadCourseLessons(course.id);
                            }}
                            className="flex items-center space-x-1"
                          >
                            <Video className="h-4 w-4" />
                            <span className="hidden sm:inline">Contenido</span>
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => startEditingCourse(course)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteCourse(course.id)}
                            disabled={deleteCourseLoading}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="content" className="space-y-6">
          {selectedCourse ? (
            <>
              {/* Course Content Header */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BookOpen className="h-5 w-5" />
                    <span>Contenido del Curso: {selectedCourse.title}</span>
                  </CardTitle>
                  <CardDescription>
                    Gestiona lecciones, videos y exámenes del curso
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex space-x-4">
                    <Button onClick={() => setShowLessonForm(true)} className="flex items-center space-x-2">
                      <Plus className="h-4 w-4" />
                      <span>Agregar Lección</span>
                    </Button>
                    <Button onClick={() => setShowExamForm(true)} variant="outline" className="flex items-center space-x-2">
                      <Award className="h-4 w-4" />
                      <span>Crear Examen</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Lesson Form */}
              {showLessonForm && (
                <Card>
                  <CardHeader>
                    <CardTitle>Agregar Nueva Lección</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="lesson-title">Título de la Lección</Label>
                        <Input
                          id="lesson-title"
                          value={lessonForm.title}
                          onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })}
                          placeholder="Título de la lección"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lesson-type">Tipo de Contenido</Label>
                        <Select
                          value={lessonForm.content_type}
                          onValueChange={(value: 'video' | 'text' | 'pdf' | 'quiz') => 
                            setLessonForm({ ...lessonForm, content_type: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="video">Video</SelectItem>
                            <SelectItem value="text">Texto</SelectItem>
                            <SelectItem value="pdf">PDF</SelectItem>
                            <SelectItem value="quiz">Quiz</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lesson-duration">Duración (minutos)</Label>
                        <Input
                          id="lesson-duration"
                          type="number"
                          value={lessonForm.duration_minutes}
                          onChange={(e) => setLessonForm({ ...lessonForm, duration_minutes: Number(e.target.value) })}
                          placeholder="0"
                          min="0"
                        />
                      </div>
                      <div className="space-y-2 flex items-center space-x-2 mt-6">
                        <input
                          type="checkbox"
                          id="lesson-free"
                          checked={lessonForm.is_free}
                          onChange={(e) => setLessonForm({ ...lessonForm, is_free: e.target.checked })}
                          className="rounded"
                        />
                        <Label htmlFor="lesson-free">Lección gratuita</Label>
                      </div>
                      
                      {lessonForm.content_type === 'video' && (
                        <div className="md:col-span-2 space-y-2">
                          <Label htmlFor="lesson-video">Video de la Lección</Label>
                          <div className="flex items-center space-x-2">
                            <Input
                              id="lesson-video"
                              type="file"
                              accept="video/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleVideoUpload(file);
                              }}
                              disabled={uploadingVideo}
                            />
                            {uploadingVideo && <span className="text-sm text-gray-500">Subiendo...</span>}
                          </div>
                          {lessonForm.video_url && (
                            <div className="mt-2">
                              <video controls className="w-full max-w-md h-32">
                                <source src={lessonForm.video_url} type="video/mp4" />
                                <track kind="captions" src="" label="Español" />
                                Tu navegador no soporta videos.
                              </video>
                            </div>
                          )}
                        </div>
                      )}
                      
                      <div className="md:col-span-2 space-y-2">
                        <Label htmlFor="lesson-description">Descripción</Label>
                        <Textarea
                          id="lesson-description"
                          value={lessonForm.description}
                          onChange={(e) => setLessonForm({ ...lessonForm, description: e.target.value })}
                          placeholder="Descripción de la lección"
                          rows={3}
                        />
                      </div>
                    </div>
                    <div className="flex items-center space-x-4 mt-4">
                      <Button onClick={handleCreateLesson}>
                        <Save className="h-4 w-4 mr-2" />
                        Guardar Lección
                      </Button>
                      <Button variant="outline" onClick={() => setShowLessonForm(false)}>
                        Cancelar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Lessons List */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Video className="h-5 w-5" />
                    <span>Lecciones del Curso</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {lessons.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">
                      No hay lecciones creadas. Agrega la primera lección para comenzar.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {lessons.map((lesson, index) => (
                        <div key={lesson.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                              {index + 1}
                            </div>
                            <div>
                              <h4 className="font-medium">{lesson.title}</h4>
                              <div className="flex items-center space-x-2 text-sm text-gray-600">
                                <Badge variant="outline">{lesson.content_type}</Badge>
                                <span className="flex items-center">
                                  <Clock className="h-3 w-3 mr-1" />
                                  {lesson.duration_minutes} min
                                </span>
                                {lesson.is_free && (
                                  <Badge className="bg-green-100 text-green-800">Gratis</Badge>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            {lesson.video_url && (
                              <Button size="sm" variant="outline">
                                <Play className="h-4 w-4" />
                              </Button>
                            )}
                            <Button size="sm" variant="outline">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleDeleteLesson(lesson.id)}
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

              {/* Exam Section */}
              {showExamForm && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Award className="h-5 w-5" />
                      <span>Crear Examen Final</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="exam-title">Título del Examen</Label>
                          <Input
                            id="exam-title"
                            value={examForm.title}
                            onChange={(e) => setExamForm({ ...examForm, title: e.target.value })}
                            placeholder="Examen Final"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="exam-passing-score">Puntaje Mínimo (%)</Label>
                          <Input
                            id="exam-passing-score"
                            type="number"
                            value={examForm.passing_score}
                            onChange={(e) => setExamForm({ ...examForm, passing_score: Number(e.target.value) })}
                            placeholder="70"
                            min="0"
                            max="100"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="exam-time-limit">Tiempo Límite (minutos)</Label>
                          <Input
                            id="exam-time-limit"
                            type="number"
                            value={examForm.time_limit_minutes}
                            onChange={(e) => setExamForm({ ...examForm, time_limit_minutes: Number(e.target.value) })}
                            placeholder="60"
                            min="0"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="exam-attempts">Intentos Máximos</Label>
                          <Input
                            id="exam-attempts"
                            type="number"
                            value={examForm.max_attempts}
                            onChange={(e) => setExamForm({ ...examForm, max_attempts: Number(e.target.value) })}
                            placeholder="3"
                            min="1"
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="exam-description">Descripción</Label>
                        <Textarea
                          id="exam-description"
                          value={examForm.description}
                          onChange={(e) => setExamForm({ ...examForm, description: e.target.value })}
                          placeholder="Descripción del examen"
                          rows={2}
                        />
                      </div>

                      {/* Questions Section */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="text-lg font-medium">Preguntas del Examen</h4>
                          <Button onClick={addExamQuestion} size="sm">
                            <Plus className="h-4 w-4 mr-2" />
                            Agregar Pregunta
                          </Button>
                        </div>

                        {examForm.questions.map((question, questionIndex) => (
                          <Card key={question.id} className="p-4">
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <h5 className="font-medium">Pregunta {questionIndex + 1}</h5>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => removeExamQuestion(questionIndex)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                              
                              <div className="space-y-2">
                                <Label>Pregunta</Label>
                                <Textarea
                                  value={question.question_text}
                                  onChange={(e) => updateExamQuestion(questionIndex, { 
                                    ...question, 
                                    question_text: e.target.value 
                                  })}
                                  placeholder="Escribe la pregunta aquí"
                                  rows={2}
                                />
                              </div>

                              <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <Label>Tipo de Pregunta</Label>
                                  <Select
                                    value={question.question_type}
                                    onValueChange={(value: QuestionType) => 
                                      updateExamQuestion(questionIndex, { ...question, question_type: value })
                                    }
                                  >
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="multiple_choice">Opción Múltiple</SelectItem>
                                      <SelectItem value="true_false">Verdadero/Falso</SelectItem>
                                      <SelectItem value="short_answer">Respuesta Corta</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div className="space-y-2">
                                  <Label>Puntos</Label>
                                  <Input
                                    type="number"
                                    value={question.points}
                                    onChange={(e) => updateExamQuestion(questionIndex, { 
                                      ...question, 
                                      points: Number(e.target.value) 
                                    })}
                                    min="1"
                                  />
                                </div>
                              </div>

                              {question.question_type === 'multiple_choice' && (
                                <div className="space-y-2">
                                  <Label>Opciones (marca la correcta)</Label>
                                  {question.options?.map((option, optionIndex) => (
                                    <div key={`question-${question.id}-option-${optionIndex}`} className="flex items-center space-x-2">
                                      <input
                                        type="radio"
                                        name={`correct-${questionIndex}`}
                                        checked={question.correct_answer === option}
                                        onChange={() => updateExamQuestion(questionIndex, { 
                                          ...question, 
                                          correct_answer: option 
                                        })}
                                      />
                                      <Input
                                        value={option}
                                        onChange={(e) => {
                                          const newOptions = [...(question.options || [])];
                                          newOptions[optionIndex] = e.target.value;
                                          updateExamQuestion(questionIndex, { 
                                            ...question, 
                                            options: newOptions 
                                          });
                                        }}
                                        placeholder={`Opción ${optionIndex + 1}`}
                                      />
                                    </div>
                                  ))}
                                </div>
                              )}

                              {question.question_type === 'short_answer' && (
                                <div className="space-y-2">
                                  <Label>Respuesta Correcta</Label>
                                  <Input
                                    value={question.correct_answer}
                                    onChange={(e) => updateExamQuestion(questionIndex, { 
                                      ...question, 
                                      correct_answer: e.target.value 
                                    })}
                                    placeholder="Respuesta correcta"
                                  />
                                </div>
                              )}
                            </div>
                          </Card>
                        ))}
                      </div>

                      <div className="flex items-center space-x-4">
                        <Button onClick={handleCreateExam}>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Crear Examen
                        </Button>
                        <Button variant="outline" onClick={() => setShowExamForm(false)}>
                          Cancelar
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Selecciona un Curso
                </h3>
                <p className="text-gray-600">
                  Para gestionar el contenido, primero selecciona un curso desde la pestaña "Cursos"
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          {/* User Creation Form */}
          <Card>
            <CardHeader>
              <CardTitle>
                {editingUser ? 'Editar Usuario' : 'Crear Nuevo Usuario'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="user-email">Email</Label>
                  <Input
                    id="user-email"
                    type="email"
                    value={userForm.email}
                    onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                    placeholder="usuario@email.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="user-name">Nombre Completo</Label>
                  <Input
                    id="user-name"
                    value={userForm.full_name}
                    onChange={(e) => setUserForm({ ...userForm, full_name: e.target.value })}
                    placeholder="Nombre completo"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="user-role">Rol</Label>
                  <Select
                    value={userForm.role}
                    onValueChange={(value: UserRole) => 
                      setUserForm({ ...userForm, role: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="student">Estudiante</SelectItem>
                      <SelectItem value="instructor">Instructor</SelectItem>
                      <SelectItem value="admin">Administrador</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="user-password">Contraseña</Label>
                  <Input
                    id="user-password"
                    type="password"
                    value={userForm.password}
                    onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                    placeholder={editingUser ? "Dejar vacío para mantener actual" : "Contraseña"}
                  />
                </div>
              </div>
              <div className="flex items-center space-x-4 mt-4">
                <Button
                  onClick={editingUser ? handleUpdateUser : handleCreateUser}
                  disabled={createUserLoading || updateUserLoading}
                >
                  {editingUser ? 'Actualizar Usuario' : 'Crear Usuario'}
                </Button>
                {editingUser && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setEditingUser(null);
                      resetUserForm();
                    }}
                  >
                    Cancelar
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Users List */}
          <Card>
            <CardHeader>
              <CardTitle>Gestión de Usuarios</CardTitle>
              <CardDescription>Administra todos los usuarios de la plataforma</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {false ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {users.map((user) => (
                      <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <h3 className="font-medium">{user.full_name}</h3>
                            <Badge className={getRoleColor(user.role)}>
                              {user.role}
                            </Badge>
                            {user.subscription_status ? (
                              <Badge className={getSubscriptionTierColor(user.subscription_tier || 'basic')}>
                                {user.subscription_tier || 'Basic'}
                              </Badge>
                            ) : (
                              <Badge className="bg-gray-100 text-gray-800">
                                Free
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            {user.email} • Registrado: {new Date(user.created_at).toLocaleDateString()}
                            {user.subscription_expires_at && (
                              <span> • Expira: {new Date(user.subscription_expires_at).toLocaleDateString()}</span>
                            )}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => startEditingUser(user)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteUser(user.id)}
                            disabled={deleteUserLoading}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;