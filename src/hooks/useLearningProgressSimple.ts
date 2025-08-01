import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface CourseProgress {
  id: string;
  title: string;
  category: string;
  progress_percentage: number;
  total_lessons: number;
  completed_lessons: number;
  last_accessed: string | null;
}

interface CategoryProgress {
  category: string;
  category_slug: string;
  total_courses: number;
  enrolled_courses: number;
  average_progress: number;
  total_lessons: number;
  completed_lessons: number;
}

interface LearningProgressData {
  courseProgress: CourseProgress[];
  categoryProgress: CategoryProgress[];
  overallStats: {
    totalEnrolledCourses: number;
    totalCompletedCourses: number;
    totalLessonsCompleted: number;
    averageProgress: number;
  };
  loading: boolean;
  error: string | null;
}

export const useLearningProgress = (): LearningProgressData => {
  const { user } = useAuth();
  const [data, setData] = useState<LearningProgressData>({
    courseProgress: [],
    categoryProgress: [],
    overallStats: {
      totalEnrolledCourses: 0,
      totalCompletedCourses: 0,
      totalLessonsCompleted: 0,
      averageProgress: 0,
    },
    loading: true,
    error: null,
  });

  useEffect(() => {
    if (!user) {
      setData(prev => ({ ...prev, loading: false, error: 'Usuario no autenticado' }));
      return;
    }

    fetchLearningProgress();
  }, [user]);

  const fetchLearningProgress = async () => {
    try {
      setData(prev => ({ ...prev, loading: true, error: null }));

      // Obtener matrículas del usuario
      const { data: enrollmentData, error: enrollmentError } = await supabase
        .from('course_enrollments')
        .select('id, progress_percentage, course_id, enrolled_at, completed_at')
        .eq('user_id', user.id);

      if (enrollmentError) {
        throw new Error(`Error obteniendo matrículas: ${enrollmentError.message}`);
      }

      if (!enrollmentData || enrollmentData.length === 0) {
        setData({
          courseProgress: [],
          categoryProgress: [],
          overallStats: {
            totalEnrolledCourses: 0,
            totalCompletedCourses: 0,
            totalLessonsCompleted: 0,
            averageProgress: 0,
          },
          loading: false,
          error: null,
        });
        return;
      }

      // Obtener información de cursos
      const courseIds = enrollmentData.map(e => e.course_id);
      const { data: coursesData, error: coursesError } = await supabase
        .from('courses')
        .select(`
          id,
          title,
          category_id,
          categories (
            name,
            slug
          )
        `)
        .in('id', courseIds);

      if (coursesError) {
        console.warn('Error obteniendo cursos:', coursesError.message);
      }

      // Obtener conteo de lecciones por curso
      const { data: lessonsCount, error: lessonsError } = await supabase
        .from('lessons')
        .select('course_id')
        .in('course_id', courseIds);

      if (lessonsError) {
        console.warn('Error obteniendo lecciones:', lessonsError.message);
      }

      // Obtener progreso de lecciones completadas
      const { data: lessonProgressData, error: lessonError } = await supabase
        .from('lesson_progress')
        .select('course_id, completed')
        .eq('user_id', user.id)
        .in('course_id', courseIds);

      if (lessonError) {
        console.warn('Error obteniendo progreso de lecciones:', lessonError.message);
      }

      // Crear mapas para procesamiento
      const coursesMap = new Map(coursesData?.map(c => [c.id, c]) || []);
      const lessonsCountMap = new Map<string, number>();
      const completedLessonsMap = new Map<string, number>();

      // Contar lecciones totales por curso
      lessonsCount?.forEach(lesson => {
        const count = lessonsCountMap.get(lesson.course_id) || 0;
        lessonsCountMap.set(lesson.course_id, count + 1);
      });

      // Contar lecciones completadas por curso
      lessonProgressData?.forEach(progress => {
        if (progress.completed) {
          const count = completedLessonsMap.get(progress.course_id) || 0;
          completedLessonsMap.set(progress.course_id, count + 1);
        }
      });

      // Procesar progreso por curso
      const courseProgress: CourseProgress[] = enrollmentData.map(enrollment => {
        const course = coursesMap.get(enrollment.course_id);
        const totalLessons = lessonsCountMap.get(enrollment.course_id) || 0;
        const completedLessons = completedLessonsMap.get(enrollment.course_id) || 0;

        return {
          id: enrollment.course_id,
          title: course?.title || 'Curso sin nombre',
          category: course?.categories?.name || 'Sin categoría',
          progress_percentage: Number(enrollment.progress_percentage) || 0,
          total_lessons: totalLessons,
          completed_lessons: completedLessons,
          last_accessed: enrollment.enrolled_at,
        };
      });

      // Agrupar por categoría
      const categoryMap = new Map<string, {
        category: string;
        category_slug: string;
        courses: CourseProgress[];
        total_progress: number;
        total_lessons: number;
        completed_lessons: number;
      }>();

      courseProgress.forEach(course => {
        const categoryName = course.category;
        const courseData = coursesMap.get(course.id);
        const categorySlug = courseData?.categories?.slug || 'general';

        if (!categoryMap.has(categoryName)) {
          categoryMap.set(categoryName, {
            category: categoryName,
            category_slug: categorySlug,
            courses: [],
            total_progress: 0,
            total_lessons: 0,
            completed_lessons: 0,
          });
        }

        const categoryData = categoryMap.get(categoryName)!;
        categoryData.courses.push(course);
        categoryData.total_progress += course.progress_percentage;
        categoryData.total_lessons += course.total_lessons;
        categoryData.completed_lessons += course.completed_lessons;
      });

      // Convertir a array de progreso por categoría
      const categoryProgress: CategoryProgress[] = Array.from(categoryMap.values()).map(cat => ({
        category: cat.category,
        category_slug: cat.category_slug,
        total_courses: cat.courses.length,
        enrolled_courses: cat.courses.length,
        average_progress: cat.courses.length > 0 ? Math.round(cat.total_progress / cat.courses.length) : 0,
        total_lessons: cat.total_lessons,
        completed_lessons: cat.completed_lessons,
      }));

      // Calcular estadísticas generales
      const totalEnrolledCourses = courseProgress.length;
      const totalCompletedCourses = courseProgress.filter(c => c.progress_percentage >= 100).length;
      const totalLessonsCompleted = courseProgress.reduce((sum, c) => sum + c.completed_lessons, 0);
      const averageProgress = totalEnrolledCourses > 0 
        ? Math.round(courseProgress.reduce((sum, c) => sum + c.progress_percentage, 0) / totalEnrolledCourses)
        : 0;

      setData({
        courseProgress,
        categoryProgress,
        overallStats: {
          totalEnrolledCourses,
          totalCompletedCourses,
          totalLessonsCompleted,
          averageProgress,
        },
        loading: false,
        error: null,
      });

    } catch (error) {
      console.error('Error fetching learning progress:', error);
      setData(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
      }));
    }
  };

  return data;
};
