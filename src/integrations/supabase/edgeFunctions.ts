import { supabase } from './client';

// Base URL para las Edge Functions - usar variable de entorno (con fallback runtime)
const runtimeEnv = (typeof window !== 'undefined' ? (window as any).ENV : {}) || {};
const FUNCTIONS_URL = `${runtimeEnv.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL}/functions/v1`;

// Helper para hacer llamadas a Edge Functions
const callEdgeFunction = async (functionName: string, payload?: any, method = 'POST') => {
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  
  if (sessionError) {
    throw new Error(`Error de sesión: ${sessionError.message}`);
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (session?.access_token) {
    headers['Authorization'] = `Bearer ${session.access_token}`;
  }

  const response = await fetch(`${FUNCTIONS_URL}/${functionName}`, {
    method,
    headers,
    body: payload ? JSON.stringify(payload) : undefined,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Error desconocido' }));
    throw new Error(errorData.error || `HTTP Error: ${response.status}`);
  }

  return response.json();
};

// ========================
// SERVICIOS DE PAGOS
// ========================

export const paymentService = {
  // Crear checkout de Stripe
  createStripeCheckout: (plan: string) => 
    callEdgeFunction('stripe-checkout', { plan }),

  // Crear suscripción
  createSubscription: (plan: string, paymentMethod: string) => 
    callEdgeFunction('create-subscription', { plan, paymentMethod }),

  // Cancelar suscripción
  cancelSubscription: (reason?: string, feedback?: string) => 
    callEdgeFunction('cancel-subscription', { reason, feedback }),

  // Procesar pago con PayPal
  processPaypalPayment: (orderId: string) =>
    callEdgeFunction('paypal-payment', { orderId }),

  // Procesar pago único con Stripe
  processStripePayment: (amount: number, planId?: string) =>
    callEdgeFunction('stripe-payment', { amount, planId }),

  // Crear sesión de checkout (suscripción)
  createCheckout: (planType: string, planName: string) =>
    callEdgeFunction('create-checkout', { planType, planName }),

  // Portal del cliente (Stripe)
  getCustomerPortal: () => 
    callEdgeFunction('customer-portal'),
};

// ========================
// SERVICIOS DE CURSOS
// ========================

export const courseService = {
  // Obtener todos los cursos publicados (catálogo público)
  getAllCourses: async () => {
    const { data, error } = await supabase
      .from('courses')
      .select(
        `id, title, description, thumbnail_url, duration_hours, level, price, is_published, created_at, updated_at,
         categories(name),
         profiles:instructor_id(full_name),
         course_enrollments(count),
         average_rating` as any
      )
      .eq('is_published', true)
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);

    return (
      data?.map((course: any) => ({
        id: course.id,
        title: course.title,
        description: course.description,
        image_url: course.thumbnail_url,
        duration_hours: course.duration_hours ?? 0,
        instructor_name: course.profiles?.full_name || '',
        level: course.level ?? 'beginner',
        category: course.categories?.name || '',
        price: course.price ?? 0,
        rating: Number(course.average_rating) || 0,
        students_count: course.course_enrollments?.length || 0,
        subscription_tier: 'basic',
        is_free: !course.price,
        published: course.is_published,
        created_at: course.created_at,
        updated_at: course.updated_at,
      })) || []
    );
  },

  // Obtener todas las categorías públicas
  getCategories: async () => {
    const { data, error } = await supabase
      .from('categories')
      .select('id, name, description')
      .order('name', { ascending: true });

    if (error) throw new Error(error.message);
    return data || [];
  },

  // Gestión de cursos (admin/instructor)
  manageCourse: (action: string, courseData?: any, courseId?: string) =>
    callEdgeFunction('course-management', { action, courseData, courseId }),

  // Gestión de contenido de cursos
  manageContent: (action: string, courseId: string, courseData?: any, lessonData?: any) =>
    callEdgeFunction('manage-course-content', { action, courseId, courseData, lessonData }),

  // Validar contenido del curso
  validateContent: (courseId: string) =>
    callEdgeFunction('validate-course-content', { courseId }),

  // Inscribirse en un curso
  enrollInCourse: (courseId: string) =>
    callEdgeFunction('course-enrollment', { course_id: courseId }),

  // Verificar inscripción en un curso
  getEnrollment: (courseId: string) =>
    callEdgeFunction('get-enrollment', { course_id: courseId }),

  // Actualizar progreso de lección
  updateLessonProgress: (lessonId: string, completed: boolean, timeSpent?: number) =>
    callEdgeFunction('lesson-progress', { lessonId, completed, timeSpent }),
};

// ========================
// SERVICIOS DE ADMIN
// ========================

const adminServiceBase = {
  // Gestión de cursos (admin)
  getCourses: async (courseId?: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    const url = courseId ? `admin-courses?courseId=${courseId}` : 'admin-courses';
    
    const response = await fetch(`${FUNCTIONS_URL}/${url}`, {
      method: 'GET',
      headers: { 
        'Authorization': `Bearer ${session?.access_token}`,
        'Content-Type': 'application/json'
      }
    });
    
    return response.json();
  },

  createCourse: (courseData: any) =>
    callEdgeFunction('admin-courses', courseData, 'POST'),

  updateCourse: (courseId: string, courseData: any) =>
    callEdgeFunction(`admin-courses?courseId=${courseId}`, courseData, 'PUT'),

  deleteCourse: (courseId: string) =>
    callEdgeFunction(`admin-courses?courseId=${courseId}`, null, 'DELETE'),

  // Gestión de categorías
  getCategories: (categoryId?: string) =>
    callEdgeFunction(categoryId ? `admin-categories?categoryId=${categoryId}` : 'admin-categories', null, 'GET'),

  createCategory: (categoryData: any) => 
    callEdgeFunction('admin-categories', categoryData, 'POST'),

  updateCategory: (categoryId: string, categoryData: any) =>
    callEdgeFunction(`admin-categories?categoryId=${categoryId}`, categoryData, 'PUT'),

  deleteCategory: (categoryId: string) =>
    callEdgeFunction(`admin-categories?categoryId=${categoryId}`, null, 'DELETE'),

  // Gestión de lecciones
  manageLessons: (action: string, lessonData?: any, lessonId?: string) =>
    callEdgeFunction('admin-lessons', { action, lessonData, lessonId }),

  // Gestión de almacenamiento
  manageStorage: (action: string, fileData?: any) =>
    callEdgeFunction('admin-storage', { action, fileData }),
};

export const adminService = {
  ...adminServiceBase,
  // Alias para compatibilidad
  getAllCourses: () => adminServiceBase.getCourses(),
};

// ========================
// SERVICIOS DE DASHBOARD
// ========================

export const dashboardService = {
  // Dashboard de estudiantes
  getStudentDashboard: () => 
    callEdgeFunction('student-dashboard'),

  // Estadísticas del dashboard
  getDashboardStats: () => 
    callEdgeFunction('dashboard-stats'),

  // Analytics de cursos
  getCourseAnalytics: (courseId?: string, timeframe?: string) =>
    callEdgeFunction('get-course-analytics', { courseId, timeframe }),

  // Obtener analytics generales de cursos
  courseAnalytics: (filters?: any) =>
    callEdgeFunction('course-analytics', filters),

  // Generar analytics de cursos
  generateCourseAnalytics: (courseId: string, options?: any) => 
    callEdgeFunction('generate-course-analytics', { courseId, ...options }),

  // Analytics para instructores
  getInstructorAnalytics: (instructorId?: string, timeframe?: string) => 
    callEdgeFunction('instructor-analytics', { instructorId, timeframe }),

  // Reportes avanzados
  generateAdvancedReport: (reportType: string, options?: any) => 
    callEdgeFunction('advanced-reports', { type: reportType, ...options }),
};

// ========================
// SERVICIOS DE NOTIFICACIONES
// ========================

export const notificationService = {
  // API de notificaciones
  getNotifications: () => 
    callEdgeFunction('notifications-api', null, 'GET'),

  markAsRead: (notificationId: string) => 
    callEdgeFunction('notifications-api', { action: 'mark_read', notificationId }),

  // Enviar email de notificación
  sendEmailNotification: (type: string, recipient: string, data?: any) =>
    callEdgeFunction('send-email-notification', { type, recipient, data }),

  // Enviar notificaciones de la plataforma
  sendNotifications: (payload: any) =>
    callEdgeFunction('send-notifications', payload),

  // Enviar email de notificación simple
  sendNotificationEmail: (params: any) =>
    callEdgeFunction('send-notification-email', params),

  // Enviar recordatorio de curso
  sendCourseReminder: (userId: string, courseId: string, reminderType: string) =>
    callEdgeFunction('send-course-reminder', { userId, courseId, reminderType }),

  // Enviar recordatorios de cursos de manera masiva
  sendCourseReminders: () =>
    callEdgeFunction('send-course-reminders'),

  // Procesar recordatorios automáticos
  processReminders: () => 
    callEdgeFunction('process-reminders'),
};

// ========================
// SERVICIOS DE CERTIFICADOS
// ========================

export const certificateService = {
  // Generar certificado
  generateCertificate: (courseId: string, userId?: string) => 
    callEdgeFunction('generate-certificate', { courseId, userId }),

  // Procesar certificados de finalización
  processCompletionCertificates: () => 
    callEdgeFunction('process-completion-certificates'),
};

// ========================
// SERVICIOS DE ARCHIVOS
// ========================

export const fileService = {
  // Subir archivo
  uploadFile: (file: File, folder?: string) => {
    const formData = new FormData();
    formData.append('file', file);
    if (folder) formData.append('folder', folder);
    
    return callEdgeFunction('upload-file', formData);
  },
};

// ========================
// SERVICIOS DE SISTEMA
// ========================

export const systemService = {
  // Verificar salud del sistema
  healthCheck: () => 
    callEdgeFunction('health-check', null, 'GET'),

  // Crear backup
  createBackup: (options?: any) => 
    callEdgeFunction('backup-system', options),

  // Limpiar base de datos
  cleanupDatabase: (type: string, options?: any) => 
    callEdgeFunction('database-cleanup', { type, ...options }),
};

// ========================
// SERVICIOS DE SUSCRIPCIÓN
// ========================

export const subscriptionService = {
  // Verificar suscripción
  checkSubscription: () => 
    callEdgeFunction('check-subscription', null, 'GET'),

  // Obtener estado de suscripción del usuario
  getSubscriptionStatus: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data } = await supabase
      .from('subscribers')
      .select('*')
      .eq('user_id', user.id)
      .single();

    return data;
  },
};

// Exportar todos los servicios
export const edgeFunctions = {
  payment: paymentService,
  course: courseService,
  admin: adminService,
  dashboard: dashboardService,
  notification: notificationService,
  certificate: certificateService,
  file: fileService,
  system: systemService,
  subscription: subscriptionService,
};
