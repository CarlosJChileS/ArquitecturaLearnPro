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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  useEdgeFunction, useCreateCourse, useUpdateCourse, useDeleteCourse,
  useCreateUser, useUpdateUser, useDeleteUser 
} from '@/hooks/useEdgeFunctions';
import { prepareCourseDataForDB, handleUUIDError } from '@/lib/uuid-utils';
import { CategorySelector } from '@/components/ui/CategorySelector';
import {
  Users, BookOpen, DollarSign, TrendingUp,
  Edit, Trash2, Plus, Video, Bell, RefreshCw, Send,
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
  description?: string;
  thumbnail_url?: string;
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

interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  is_read: boolean;
  action_url?: string;
  created_at: string;
  profiles?: {
    full_name: string;
    email: string;
  };
}

interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  duration_months: number;
  features: string[];
  is_active: boolean;
  stripe_price_id?: string;
  created_at: string;
}

interface Subscription {
  id: string;
  user_id: string;
  plan_id: string;
  status: 'active' | 'cancelled' | 'expired' | 'pending';
  start_date: string;
  end_date: string;
  stripe_subscription_id?: string;
  stripe_customer_id?: string;
  created_at: string;
  subscription_plans?: SubscriptionPlan;
  profiles?: {
    full_name: string;
    email: string;
  };
}

const AdminDashboard: React.FC = () => {
  const { user, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [users, setUsers] = useState<User[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [subscriptionPlans, setSubscriptionPlans] = useState<SubscriptionPlan[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
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

  // Course form state - Compatible con la estructura real de la BD
  const [courseForm, setCourseForm] = useState({
    title: '',
    description: '',
    thumbnail_url: '',
    price: '',
    instructor_id: null, // UUID del instructor
    category_id: null, // UUID de la categoría
    level: 'beginner', // beginner | intermediate | advanced
    duration_hours: 0,
    published: false // Se mapea a is_published en BD
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
  const [showNotificationForm, setShowNotificationForm] = useState(false);
  const [showPlanForm, setShowPlanForm] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);

  // Notification form state
  const [notificationForm, setNotificationForm] = useState({
    title: '',
    message: '',
    type: 'info' as 'info' | 'success' | 'warning' | 'error',
    user_id: '',
    action_url: '',
    broadcast: false
  });

  // Subscription plan form state
  const [planForm, setPlanForm] = useState({
    name: '',
    description: '',
    price: 0,
    duration_months: 1,
    features: [] as string[],
    is_active: true,
    stripe_price_id: ''
  });

  // User form state
  const [userForm, setUserForm] = useState({
    email: '',
    full_name: '',
    role: 'student' as UserRole,
    password: ''
  });

  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // Edge Functions - Solo las que existen
  const { execute: getAllCourses } = useEdgeFunction('admin', 'getAllCourses');
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
      loadCourses(),
      loadNotifications(),
      loadSubscriptions(),
      loadSubscriptionPlans()
    ]);
  };

  const loadStats = async () => {
    try {
      // Calcular estadísticas desde datos reales de Supabase (sin Edge Functions)
      const [usersResult, coursesResult] = await Promise.all([
        supabase.from('profiles').select('user_id, created_at'),
        getAllCourses()
      ]);

      const totalUsers = usersResult.data?.length || 0;
      const totalCourses = coursesResult.data?.length || 0;
      const publishedCourses = coursesResult.data?.filter(course => course.published).length || 0;
      
      // Métricas de suscripción (TODO: implementar cuando esté disponible user_subscriptions)
      const activeSubscriptions = 0;
      const basicSubscriptions = 0; 
      const premiumSubscriptions = 0;
      const freeUsers = totalUsers - activeSubscriptions;
      const totalRevenue = (basicSubscriptions * 29) + (premiumSubscriptions * 49);

      // Usuarios nuevos este mes
      const thisMonth = new Date();
      thisMonth.setDate(1);
      const newUsersThisMonth = usersResult.data?.filter(user => 
        new Date(user.created_at) >= thisMonth
      ).length || 0;

      setStats({
        totalUsers,
        totalCourses,
        totalRevenue,
        activeSubscriptions,
        newUsersThisMonth,
        coursesPublishedThisMonth: publishedCourses,
        basicSubscriptions,
        premiumSubscriptions,
        freeUsers
      });
    } catch (error) {
      console.error('Error loading stats:', error);
      // Fallback a datos por defecto
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
      // Consultar directamente Supabase (sin Edge Functions)
      const { data, error } = await supabase
        .from('profiles')
        .select('user_id, full_name, email, role, created_at')
        .order('created_at', { ascending: false });

      if (!error && data) {
        const formattedUsers = data.map(user => ({
          id: user.user_id,
          email: user.email || 'usuario@ejemplo.com',
          full_name: user.full_name || 'Sin nombre',
          role: (user.role as UserRole) || 'student',
          created_at: user.created_at,
          last_sign_in: user.created_at,
          subscription_status: false
        }));
        setUsers(formattedUsers);
      } else {
        console.error('Error loading users:', error);
        setUsers([]);
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

  const loadNotifications = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('admin-notifications', {
        method: 'GET'
      });

      if (!error && data?.data) {
        setNotifications(data.data);
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
      setNotifications([]);
    }
  };

  const loadSubscriptions = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('admin-subscriptions', {
        method: 'GET'
      });

      if (!error && data?.data) {
        setSubscriptions(data.data);
      }
    } catch (error) {
      console.error('Error loading subscriptions:', error);
      setSubscriptions([]);
    }
  };

  const loadSubscriptionPlans = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('admin-subscriptions', {
        method: 'GET',
        body: { action: 'plans' }
      });

      if (!error && data?.data) {
        setSubscriptionPlans(data.data);
      }
    } catch (error) {
      console.error('Error loading subscription plans:', error);
      setSubscriptionPlans([]);
    }
  };

  const resetCourseForm = () => {
    setCourseForm({
      title: '',
      description: '',
      thumbnail_url: '',
      price: '',
      instructor_id: null,
      category_id: null,
      level: 'beginner',
      duration_hours: 0,
      published: false
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
    try {
      const cleanedData = prepareCourseDataForDB(courseForm);
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
        const cleanedData = prepareCourseDataForDB(courseForm);
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
    // Implementación futura: upload de thumbnails con Supabase Storage
    console.log('Funcionalidad de upload pendiente de implementar:', file.name);
  };

  // Gestión de lecciones - Implementación futura
  const handleCreateLesson = async () => {
    console.log('Funcionalidad de lecciones pendiente de implementar');
  };

  const handleDeleteLesson = async (lessonId: string) => {
    console.log('Eliminación de lección pendiente:', lessonId);
  };
    // TODO: Implementar con supabase.from('lessons').delete()
  };

  // TODO: Implementar gestión de exámenes
  const handleCreateExam = async () => {
    console.log('Creación de exámenes pendiente de implementar');
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
      description: course.description || '',
      thumbnail_url: course.thumbnail_url || '',
      price: course.price?.toString() || '',
      instructor_id: course.instructor_id || null,
      category_id: course.category_id || null,
      level: course.level || 'beginner',
      duration_hours: course.duration_hours || 0,
      published: course.is_published || false // Mapear is_published a published
    });
    
    // Load lessons for this course
    loadCourseLessons(course.id);
  };

  const loadCourseLessons = async (courseId: string) => {
    console.log('Carga de lecciones pendiente para curso:', courseId);
    // TODO: Implementar con supabase.from('lessons').select()
    setLessons([]);
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

  // Notification handlers
  const handleCreateNotification = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('admin-notifications', {
        method: 'POST',
        body: notificationForm
      });

      if (!error && data?.data) {
        setNotificationForm({
          title: '',
          message: '',
          type: 'info',
          user_id: '',
          action_url: '',
          broadcast: false
        });
        setShowNotificationForm(false);
        loadNotifications();
      }
    } catch (error) {
      console.error('Error creating notification:', error);
    }
  };

  const handleDeleteNotification = async (notificationId: string) => {
    if (confirm('¿Estás seguro de que deseas eliminar esta notificación?')) {
      try {
        await supabase.functions.invoke('admin-notifications', {
          method: 'DELETE',
          body: { notificationId }
        });
        loadNotifications();
      } catch (error) {
        console.error('Error deleting notification:', error);
      }
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await supabase.functions.invoke('admin-notifications', {
        method: 'PUT',
        body: { notificationId, is_read: true }
      });
      loadNotifications();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Subscription Plan handlers
  const handleCreatePlan = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('admin-subscriptions', {
        method: 'POST',
        body: { ...planForm, type: 'plan' }
      });

      if (!error && data?.data) {
        setPlanForm({
          name: '',
          description: '',
          price: 0,
          duration_months: 1,
          features: [],
          is_active: true,
          stripe_price_id: ''
        });
        setShowPlanForm(false);
        loadSubscriptionPlans();
      }
    } catch (error) {
      console.error('Error creating plan:', error);
    }
  };

  const handleUpdatePlan = async () => {
    if (selectedPlan) {
      try {
        await supabase.functions.invoke('admin-subscriptions', {
          method: 'PUT',
          body: { ...planForm, type: 'plan', planId: selectedPlan.id }
        });
        setPlanForm({
          name: '',
          description: '',
          price: 0,
          duration_months: 1,
          features: [],
          is_active: true,
          stripe_price_id: ''
        });
        setSelectedPlan(null);
        setShowPlanForm(false);
        loadSubscriptionPlans();
      } catch (error) {
        console.error('Error updating plan:', error);
      }
    }
  };

  const handleDeletePlan = async (planId: string) => {
    if (confirm('¿Estás seguro de que deseas desactivar este plan?')) {
      try {
        await supabase.functions.invoke('admin-subscriptions', {
          method: 'DELETE',
          body: { planId }
        });
        loadSubscriptionPlans();
      } catch (error) {
        console.error('Error deleting plan:', error);
      }
    }
  };

  const handleRenewSubscription = async (subscriptionId: string) => {
    if (confirm('¿Estás seguro de que deseas renovar esta suscripción?')) {
      try {
        await supabase.functions.invoke('admin-subscriptions', {
          method: 'PUT',
          body: { subscriptionId, action: 'renew' }
        });
        loadSubscriptions();
      } catch (error) {
        console.error('Error renewing subscription:', error);
      }
    }
  };

  const handleCancelSubscription = async (subscriptionId: string) => {
    if (confirm('¿Estás seguro de que deseas cancelar esta suscripción?')) {
      try {
        await supabase.functions.invoke('admin-subscriptions', {
          method: 'DELETE',
          body: { subscriptionId }
        });
        loadSubscriptions();
      } catch (error) {
        console.error('Error cancelling subscription:', error);
      }
    }
  };

  const startEditingPlan = (plan: SubscriptionPlan) => {
    setSelectedPlan(plan);
    setPlanForm({
      name: plan.name,
      description: plan.description,
      price: plan.price,
      duration_months: plan.duration_months,
      features: plan.features,
      is_active: plan.is_active,
      stripe_price_id: plan.stripe_price_id || ''
    });
    setShowPlanForm(true);
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
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="overview">Resumen</TabsTrigger>
          <TabsTrigger value="courses">Cursos</TabsTrigger>
          <TabsTrigger value="content">Contenido</TabsTrigger>
          <TabsTrigger value="users">Usuarios</TabsTrigger>
          <TabsTrigger value="notifications">Notificaciones</TabsTrigger>
          <TabsTrigger value="subscriptions">Suscripciones</TabsTrigger>
          <TabsTrigger value="database">Base de Datos</TabsTrigger>
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
                    required
                  />
                </div>
                <div className="space-y-2">
                  <CategorySelector
                    value={courseForm.category_id}
                    onValueChange={(categoryId) => setCourseForm({ ...courseForm, category_id: categoryId })}
                    required={true}
                    label="Categoría"
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

        <TabsContent value="database" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Validador de Base de Datos</CardTitle>
              <CardDescription>
                Herramienta para verificar y corregir la alineación entre la base de datos y el frontend
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">
                  Accede al validador completo de base de datos para verificar la estructura y corregir problemas de foreign keys.
                </p>
                <Link to="/admin/database">
                  <Button>
                    Abrir Validador de Base de Datos
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Gestión de Notificaciones</h2>
            <Dialog open={showNotificationForm} onOpenChange={setShowNotificationForm}>
              <DialogTrigger asChild>
                <Button><Plus className="h-4 w-4 mr-2" />Nueva Notificación</Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Crear Notificación</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="notification-title">Título</Label>
                    <Input
                      id="notification-title"
                      value={notificationForm.title}
                      onChange={(e) => setNotificationForm({...notificationForm, title: e.target.value})}
                      placeholder="Título de la notificación"
                    />
                  </div>
                  <div>
                    <Label htmlFor="notification-message">Mensaje</Label>
                    <Textarea
                      id="notification-message"
                      value={notificationForm.message}
                      onChange={(e) => setNotificationForm({...notificationForm, message: e.target.value})}
                      placeholder="Contenido del mensaje"
                      rows={4}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="notification-type">Tipo</Label>
                      <Select
                        value={notificationForm.type}
                        onValueChange={(value: 'info' | 'success' | 'warning' | 'error') => 
                          setNotificationForm({...notificationForm, type: value})
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="info">Información</SelectItem>
                          <SelectItem value="success">Éxito</SelectItem>
                          <SelectItem value="warning">Advertencia</SelectItem>
                          <SelectItem value="error">Error</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="notification-url">URL de Acción (Opcional)</Label>
                      <Input
                        id="notification-url"
                        value={notificationForm.action_url}
                        onChange={(e) => setNotificationForm({...notificationForm, action_url: e.target.value})}
                        placeholder="https://..."
                      />
                    </div>
                  </div>
                  {!notificationForm.broadcast && (
                    <div>
                      <Label htmlFor="notification-user">Usuario Específico</Label>
                      <Select
                        value={notificationForm.user_id}
                        onValueChange={(value) => setNotificationForm({...notificationForm, user_id: value})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar usuario" />
                        </SelectTrigger>
                        <SelectContent>
                          {users.map(user => (
                            <SelectItem key={user.id} value={user.id}>
                              {user.full_name} ({user.email})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="broadcast"
                      checked={notificationForm.broadcast}
                      onChange={(e) => setNotificationForm({...notificationForm, broadcast: e.target.checked})}
                    />
                    <Label htmlFor="broadcast">Enviar a todos los usuarios</Label>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setShowNotificationForm(false)}>
                      Cancelar
                    </Button>
                    <Button onClick={handleCreateNotification}>
                      <Send className="h-4 w-4 mr-2" />Enviar
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Notificaciones Recientes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {notifications.map((notification) => (
                  <div key={notification.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-medium">{notification.title}</h4>
                        <Badge variant={
                          notification.type === 'success' ? 'default' :
                          notification.type === 'warning' ? 'secondary' :
                          notification.type === 'error' ? 'destructive' : 'outline'
                        }>
                          {notification.type}
                        </Badge>
                        {!notification.is_read && <Badge variant="destructive">No leída</Badge>}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                      {notification.profiles && (
                        <p className="text-xs text-gray-500 mt-1">
                          Para: {notification.profiles.full_name} ({notification.profiles.email})
                        </p>
                      )}
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(notification.created_at).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      {!notification.is_read && (
                        <Button size="sm" variant="outline" onClick={() => handleMarkAsRead(notification.id)}>
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                      )}
                      <Button size="sm" variant="destructive" onClick={() => handleDeleteNotification(notification.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                {notifications.length === 0 && (
                  <p className="text-center text-gray-500 py-8">No hay notificaciones</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="subscriptions" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Gestión de Suscripciones</h2>
            <Dialog open={showPlanForm} onOpenChange={setShowPlanForm}>
              <DialogTrigger asChild>
                <Button><Plus className="h-4 w-4 mr-2" />Nuevo Plan</Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>{selectedPlan ? 'Editar Plan' : 'Crear Plan'}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="plan-name">Nombre del Plan</Label>
                      <Input
                        id="plan-name"
                        value={planForm.name}
                        onChange={(e) => setPlanForm({...planForm, name: e.target.value})}
                        placeholder="Plan Básico"
                      />
                    </div>
                    <div>
                      <Label htmlFor="plan-price">Precio (USD)</Label>
                      <Input
                        id="plan-price"
                        type="number"
                        value={planForm.price}
                        onChange={(e) => setPlanForm({...planForm, price: parseFloat(e.target.value) || 0})}
                        placeholder="29.99"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="plan-description">Descripción</Label>
                    <Textarea
                      id="plan-description"
                      value={planForm.description}
                      onChange={(e) => setPlanForm({...planForm, description: e.target.value})}
                      placeholder="Descripción del plan..."
                      rows={3}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="plan-duration">Duración (meses)</Label>
                      <Input
                        id="plan-duration"
                        type="number"
                        value={planForm.duration_months}
                        onChange={(e) => setPlanForm({...planForm, duration_months: parseInt(e.target.value) || 1})}
                        placeholder="1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="plan-stripe">Stripe Price ID (Opcional)</Label>
                      <Input
                        id="plan-stripe"
                        value={planForm.stripe_price_id}
                        onChange={(e) => setPlanForm({...planForm, stripe_price_id: e.target.value})}
                        placeholder="price_..."
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Características (separadas por comas)</Label>
                    <Textarea
                      value={planForm.features.join(', ')}
                      onChange={(e) => setPlanForm({...planForm, features: e.target.value.split(', ').filter(f => f.trim())})}
                      placeholder="Acceso a todos los cursos, Soporte prioritario, Certificados"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="plan-active"
                      checked={planForm.is_active}
                      onChange={(e) => setPlanForm({...planForm, is_active: e.target.checked})}
                    />
                    <Label htmlFor="plan-active">Plan activo</Label>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => {
                      setShowPlanForm(false);
                      setSelectedPlan(null);
                      setPlanForm({
                        name: '',
                        description: '',
                        price: 0,
                        duration_months: 1,
                        features: [],
                        is_active: true,
                        stripe_price_id: ''
                      });
                    }}>
                      Cancelar
                    </Button>
                    <Button onClick={selectedPlan ? handleUpdatePlan : handleCreatePlan}>
                      <Save className="h-4 w-4 mr-2" />
                      {selectedPlan ? 'Actualizar' : 'Crear'}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Planes de Suscripción */}
            <Card>
              <CardHeader>
                <CardTitle>Planes de Suscripción</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {subscriptionPlans.map((plan) => (
                    <div key={plan.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-medium">{plan.name}</h4>
                          <Badge variant={plan.is_active ? 'default' : 'secondary'}>
                            {plan.is_active ? 'Activo' : 'Inactivo'}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{plan.description}</p>
                        <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                          <span>${plan.price}/{plan.duration_months} mes{plan.duration_months > 1 ? 'es' : ''}</span>
                          <span>{plan.features.length} características</span>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline" onClick={() => startEditingPlan(plan)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => handleDeletePlan(plan.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  {subscriptionPlans.length === 0 && (
                    <p className="text-center text-gray-500 py-8">No hay planes configurados</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Suscripciones Activas */}
            <Card>
              <CardHeader>
                <CardTitle>Suscripciones Activas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {subscriptions.map((subscription) => (
                    <div key={subscription.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-medium">
                            {subscription.profiles?.full_name || 'Usuario'}
                          </h4>
                          <Badge variant={
                            subscription.status === 'active' ? 'default' :
                            subscription.status === 'cancelled' ? 'destructive' :
                            subscription.status === 'expired' ? 'secondary' : 'outline'
                          }>
                            {subscription.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          Plan: {subscription.subscription_plans?.name}
                        </p>
                        <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                          <span>Inicio: {new Date(subscription.start_date).toLocaleDateString()}</span>
                          <span>Fin: {new Date(subscription.end_date).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        {subscription.status === 'active' && (
                          <Button size="sm" variant="outline" onClick={() => handleRenewSubscription(subscription.id)}>
                            <RefreshCw className="h-4 w-4" />
                          </Button>
                        )}
                        <Button size="sm" variant="destructive" onClick={() => handleCancelSubscription(subscription.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  {subscriptions.length === 0 && (
                    <p className="text-center text-gray-500 py-8">No hay suscripciones activas</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;