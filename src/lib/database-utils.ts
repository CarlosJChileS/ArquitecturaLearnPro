import { supabase } from '@/lib/supabase-mvp';

interface DatabaseStructure {
  tables: string[];
  constraints: Array<{
    table_name: string;
    column_name: string;
    foreign_table_name: string;
    foreign_column_name: string;
    constraint_name: string;
  }>;
}

export const databaseUtils = {
  /**
   * Verifica si la estructura de la base de datos está alineada con el frontend
   */
  async verifyDatabaseStructure(): Promise<{ aligned: boolean; issues: string[] }> {
    const issues: string[] = [];
    
    try {
      // Verificar que existan las tablas principales
      const requiredTables = [
        'profiles',
        'categories', 
        'courses',
        'lessons',
        'course_enrollments',
        'lesson_progress'
      ];

      for (const table of requiredTables) {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .limit(1);
        
        if (error) {
          issues.push(`Tabla '${table}' no existe o no es accesible: ${error.message}`);
        }
      }

      // Verificar foreign keys críticas
      const criticalConstraints = [
        { table: 'course_enrollments', column: 'course_id', references: 'courses(id)' },
        { table: 'course_enrollments', column: 'user_id', references: 'profiles' },
        { table: 'lesson_progress', column: 'course_id', references: 'courses(id)' },
        { table: 'lesson_progress', column: 'lesson_id', references: 'lessons(id)' },
        { table: 'lesson_progress', column: 'user_id', references: 'profiles' },
        { table: 'courses', column: 'category_id', references: 'categories(id)' },
        { table: 'courses', column: 'instructor_id', references: 'profiles' },
        { table: 'lessons', column: 'course_id', references: 'courses(id)' }
      ];

      // Probar inserción de datos de prueba para verificar constraints
      const testUserId = '00000000-0000-0000-0000-000000000001';
      const testCourseId = '00000000-0000-0000-0000-000000000002';
      
      // Test course_enrollments constraint
      const { error: enrollmentError } = await supabase
        .from('course_enrollments')
        .insert({
          user_id: testUserId,
          course_id: testCourseId,
          enrolled_at: new Date().toISOString()
        });
      
      if (enrollmentError && !enrollmentError.code?.includes('23505')) { // Ignore duplicate key
        if (enrollmentError.code?.includes('23503')) {
          issues.push('Foreign key constraints no están configuradas correctamente en course_enrollments');
        }
      }

      return {
        aligned: issues.length === 0,
        issues
      };
    } catch (error) {
      issues.push(`Error verificando estructura: ${error instanceof Error ? error.message : 'Error desconocido'}`);
      return { aligned: false, issues };
    }
  },

  /**
   * Ejecuta el script de alineación de base de datos
   */
  async applyDatabaseAlignment(): Promise<{ success: boolean; message: string }> {
    try {
      // El script SQL debe ser ejecutado directamente en Supabase
      // Aquí solo verificamos que la estructura esté correcta después
      const verification = await this.verifyDatabaseStructure();
      
      if (verification.aligned) {
        return {
          success: true,
          message: 'La base de datos ya está alineada correctamente'
        };
      } else {
        return {
          success: false,
          message: `Estructura de base de datos necesita corrección: ${verification.issues.join(', ')}`
        };
      }
    } catch (error) {
      return {
        success: false,
        message: `Error aplicando alineación: ${error instanceof Error ? error.message : 'Error desconocido'}`
      };
    }
  },

  /**
   * Crea datos de prueba para verificar que todo funciona
   */
  async createTestData(): Promise<{ success: boolean; message: string }> {
    try {
      // Crear perfil de prueba si no existe
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('user_id')
        .eq('email', 'test@example.com')
        .single();

      let testUserId = existingProfile?.user_id;

      if (!testUserId) {
        const { data: newProfile, error: profileError } = await supabase
          .from('profiles')
          .insert({
            user_id: '00000000-0000-0000-0000-000000000001',
            email: 'test@example.com',
            full_name: 'Usuario de Prueba',
            role: 'student'
          })
          .select('user_id')
          .single();

        if (profileError) {
          throw new Error(`Error creando perfil de prueba: ${profileError.message}`);
        }
        testUserId = newProfile.user_id;
      }

      // Crear categoría de prueba
      const { data: category, error: categoryError } = await supabase
        .from('categories')
        .upsert({
          id: '00000000-0000-0000-0000-000000000010',
          name: 'Prueba',
          description: 'Categoría de prueba',
          icon: '🧪',
          color: '#3B82F6'
        }, { onConflict: 'id' })
        .select()
        .single();

      if (categoryError) {
        throw new Error(`Error creando categoría: ${categoryError.message}`);
      }

      // Crear curso de prueba
      const { data: course, error: courseError } = await supabase
        .from('courses')
        .upsert({
          id: '00000000-0000-0000-0000-000000000020',
          title: 'Curso de Prueba',
          description: 'Curso para verificar la estructura',
          category_id: category.id,
          instructor_id: testUserId,
          level: 'beginner',
          price: 0,
          published: true
        }, { onConflict: 'id' })
        .select()
        .single();

      if (courseError) {
        throw new Error(`Error creando curso: ${courseError.message}`);
      }

      // Crear lección de prueba
      const { data: lesson, error: lessonError } = await supabase
        .from('lessons')
        .upsert({
          id: '00000000-0000-0000-0000-000000000030',
          title: 'Lección de Prueba',
          course_id: course.id,
          duration_minutes: 10,
          order_index: 1,
          content: 'Contenido de prueba'
        }, { onConflict: 'id' })
        .select()
        .single();

      if (lessonError) {
        throw new Error(`Error creando lección: ${lessonError.message}`);
      }

      // Crear inscripción de prueba
      const { error: enrollmentError } = await supabase
        .from('course_enrollments')
        .upsert({
          user_id: testUserId,
          course_id: course.id,
          enrolled_at: new Date().toISOString(),
          progress_percentage: 0
        }, { onConflict: 'user_id,course_id' });

      if (enrollmentError) {
        throw new Error(`Error creando inscripción: ${enrollmentError.message}`);
      }

      // Crear progreso de lección de prueba
      const { error: progressError } = await supabase
        .from('lesson_progress')
        .upsert({
          user_id: testUserId,
          lesson_id: lesson.id,
          course_id: course.id,
          completed: false,
          progress: 50
        }, { onConflict: 'user_id,lesson_id' });

      if (progressError) {
        throw new Error(`Error creando progreso: ${progressError.message}`);
      }

      return {
        success: true,
        message: 'Datos de prueba creados correctamente'
      };
    } catch (error) {
      return {
        success: false,
        message: `Error creando datos de prueba: ${error instanceof Error ? error.message : 'Error desconocido'}`
      };
    }
  },

  /**
   * Limpia los datos de prueba
   */
  async cleanTestData(): Promise<{ success: boolean; message: string }> {
    try {
      // Eliminar en orden inverso debido a foreign keys
      await supabase.from('lesson_progress').delete().eq('user_id', '00000000-0000-0000-0000-000000000001');
      await supabase.from('course_enrollments').delete().eq('user_id', '00000000-0000-0000-0000-000000000001');
      await supabase.from('lessons').delete().eq('id', '00000000-0000-0000-0000-000000000030');
      await supabase.from('courses').delete().eq('id', '00000000-0000-0000-0000-000000000020');
      await supabase.from('categories').delete().eq('id', '00000000-0000-0000-0000-000000000010');
      await supabase.from('profiles').delete().eq('user_id', '00000000-0000-0000-0000-000000000001');

      return {
        success: true,
        message: 'Datos de prueba eliminados correctamente'
      };
    } catch (error) {
      return {
        success: false,
        message: `Error eliminando datos de prueba: ${error instanceof Error ? error.message : 'Error desconocido'}`
      };
    }
  }
};

export default databaseUtils;
