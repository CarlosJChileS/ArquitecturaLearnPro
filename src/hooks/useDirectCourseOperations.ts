import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase-mvp';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface UseDirectCourseOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
}

export const useDirectCreateCourse = (options?: UseDirectCourseOptions) => {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const execute = useCallback(async (courseData: any) => {
    if (!user) {
      toast({
        title: "Error",
        description: "Debes estar autenticado para crear cursos",
        variant: "destructive",
      });
      return { error: new Error('No authenticated user'), data: null };
    }

    setLoading(true);
    try {
      // Asegurar que el instructor_id sea el usuario actual
      const dataToInsert = {
        ...courseData,
        instructor_id: user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Validar que category_id existe
      if (dataToInsert.category_id) {
        const { data: categoryExists } = await supabase
          .from('categories')
          .select('id')
          .eq('id', dataToInsert.category_id)
          .single();

        if (!categoryExists) {
          // Si no existe la categoría, usar una por defecto o crear una
          const { data: defaultCategory } = await supabase
            .from('categories')
            .select('id')
            .eq('slug', 'general')
            .single();

          if (defaultCategory) {
            dataToInsert.category_id = defaultCategory.id;
          } else {
            // Crear categoría general si no existe
            const { data: newCategory } = await supabase
              .from('categories')
              .insert({
                name: 'General',
                slug: 'general',
                description: 'Categoría general'
              })
              .select('id')
              .single();

            if (newCategory) {
              dataToInsert.category_id = newCategory.id;
            }
          }
        }
      }

      const { data, error } = await supabase
        .from('courses')
        .insert(dataToInsert)
        .select(`
          *,
          categories(name),
          profiles(full_name)
        `)
        .single();

      if (error) throw error;

      toast({
        title: "¡Éxito!",
        description: "Curso creado exitosamente",
      });

      options?.onSuccess?.(data);
      return { data, error: null };

    } catch (error: any) {
      console.error('Error creating course:', error);
      
      let errorMessage = 'Error al crear el curso';
      if (error.message?.includes('violates foreign key constraint')) {
        errorMessage = 'Error: Categoría o instructor no válido';
      } else if (error.message?.includes('duplicate key')) {
        errorMessage = 'Error: Ya existe un curso con ese nombre';
      }

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });

      options?.onError?.(error);
      return { error, data: null };
    } finally {
      setLoading(false);
    }
  }, [user, toast, options]);

  return { execute, loading };
};

export const useDirectUpdateCourse = (options?: UseDirectCourseOptions) => {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const execute = useCallback(async (courseId: string, courseData: any) => {
    if (!user) {
      toast({
        title: "Error",
        description: "Debes estar autenticado para actualizar cursos",
        variant: "destructive",
      });
      return { error: new Error('No authenticated user'), data: null };
    }

    setLoading(true);
    try {
      const dataToUpdate = {
        ...courseData,
        updated_at: new Date().toISOString()
      };

      // Validar que category_id existe si se está actualizando
      if (dataToUpdate.category_id) {
        const { data: categoryExists } = await supabase
          .from('categories')
          .select('id')
          .eq('id', dataToUpdate.category_id)
          .single();

        if (!categoryExists) {
          const { data: defaultCategory } = await supabase
            .from('categories')
            .select('id')
            .eq('slug', 'general')
            .single();

          if (defaultCategory) {
            dataToUpdate.category_id = defaultCategory.id;
          }
        }
      }

      const { data, error } = await supabase
        .from('courses')
        .update(dataToUpdate)
        .eq('id', courseId)
        .select(`
          *,
          categories(name),
          profiles(full_name)
        `)
        .single();

      if (error) throw error;

      toast({
        title: "¡Éxito!",
        description: "Curso actualizado exitosamente",
      });

      options?.onSuccess?.(data);
      return { data, error: null };

    } catch (error: any) {
      console.error('Error updating course:', error);
      
      let errorMessage = 'Error al actualizar el curso';
      if (error.message?.includes('violates foreign key constraint')) {
        errorMessage = 'Error: Categoría o instructor no válido';
      }

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });

      options?.onError?.(error);
      return { error, data: null };
    } finally {
      setLoading(false);
    }
  }, [user, toast, options]);

  return { execute, loading };
};

export const useDirectDeleteCourse = (options?: UseDirectCourseOptions) => {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const execute = useCallback(async (courseId: string) => {
    if (!user) {
      toast({
        title: "Error",
        description: "Debes estar autenticado para eliminar cursos",
        variant: "destructive",
      });
      return { error: new Error('No authenticated user'), data: null };
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('courses')
        .delete()
        .eq('id', courseId)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "¡Éxito!",
        description: "Curso eliminado exitosamente",
      });

      options?.onSuccess?.(data);
      return { data, error: null };

    } catch (error: any) {
      console.error('Error deleting course:', error);
      
      let errorMessage = 'Error al eliminar el curso';
      if (error.message?.includes('violates foreign key constraint')) {
        errorMessage = 'Error: No se puede eliminar el curso porque tiene estudiantes inscritos';
      }

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });

      options?.onError?.(error);
      return { error, data: null };
    } finally {
      setLoading(false);
    }
  }, [user, toast, options]);

  return { execute, loading };
};
