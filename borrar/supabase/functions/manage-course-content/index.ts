import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type"
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? ""
  );

  try {
    const authHeader = req.headers.get("Authorization");
    const token = authHeader!.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;

    if (!user) {
      throw new Error("Usuario no autenticado");
    }

    // Verificar que el usuario es instructor o admin
    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (!profile || !['instructor', 'admin'].includes(profile.role)) {
      throw new Error("No tienes permisos para gestionar contenido de cursos");
    }

    const { action, courseId, courseData, lessonData } = await req.json();
    let result = {};

    switch (action) {
      case 'create': {
        if (!courseData) {
          throw new Error("Datos del curso requeridos para crear");
        }

        // Crear curso
        const { data: course, error: courseError } = await supabaseClient
          .from('courses')
          .insert({
            ...courseData,
            instructor_id: user.id,
            is_published: false
          })
          .select()
          .single();

        if (courseError) {
          throw new Error(`Error creando curso: ${courseError.message}`);
        }

        result = { course };
        break;
      }

      case 'update': {
        if (!courseId || !courseData) {
          throw new Error("ID del curso y datos requeridos para actualizar");
        }

        // Verificar propiedad del curso
        const { data: existingCourse } = await supabaseClient
          .from('courses')
          .select('instructor_id')
          .eq('id', courseId)
          .single();

        if (!existingCourse || 
            (existingCourse.instructor_id !== user.id && profile.role !== 'admin')) {
          throw new Error("No tienes permisos para editar este curso");
        }

        // Actualizar curso
        const { data: course, error: updateError } = await supabaseClient
          .from('courses')
          .update(courseData)
          .eq('id', courseId)
          .select()
          .single();

        if (updateError) {
          throw new Error(`Error actualizando curso: ${updateError.message}`);
        }

        result = { course };
        break;
      }

      case 'publish': {
        if (!courseId) {
          throw new Error("ID del curso requerido para publicar");
        }

        // Verificar propiedad del curso
        const { data: existingCourse } = await supabaseClient
          .from('courses')
          .select('instructor_id, title')
          .eq('id', courseId)
          .single();

        if (!existingCourse || 
            (existingCourse.instructor_id !== user.id && profile.role !== 'admin')) {
          throw new Error("No tienes permisos para publicar este curso");
        }

        // Verificar que el curso tenga al menos una lección
        const { data: lessons } = await supabaseClient
          .from('lessons')
          .select('count')
          .eq('course_id', courseId);

        if (!lessons || lessons.length === 0) {
          throw new Error("El curso debe tener al menos una lección para ser publicado");
        }

        // Publicar curso
        const { data: course, error: publishError } = await supabaseClient
          .from('courses')
          .update({ is_published: true })
          .eq('id', courseId)
          .select()
          .single();

        if (publishError) {
          throw new Error(`Error publicando curso: ${publishError.message}`);
        }

        // Crear notificación para estudiantes suscritos (opcional)
        await supabaseClient.rpc('create_notification', {
          target_user_id: user.id,
          notification_title: 'Curso publicado',
          notification_message: `Tu curso "${existingCourse.title}" ha sido publicado exitosamente`,
          notification_type: 'success'
        });

        result = { course, published: true };
        break;
      }

      case 'delete': {
        if (!courseId) {
          throw new Error("ID del curso requerido para eliminar");
        }

        // Verificar propiedad del curso
        const { data: existingCourse } = await supabaseClient
          .from('courses')
          .select('instructor_id')
          .eq('id', courseId)
          .single();

        if (!existingCourse || 
            (existingCourse.instructor_id !== user.id && profile.role !== 'admin')) {
          throw new Error("No tienes permisos para eliminar este curso");
        }

        // Verificar que no hay inscripciones activas
        const { data: enrollments } = await supabaseClient
          .from('course_enrollments')
          .select('count')
          .eq('course_id', courseId);

        if (enrollments && enrollments.length > 0) {
          throw new Error("No se puede eliminar un curso con estudiantes inscritos");
        }

        // Eliminar curso (las lecciones se eliminarán en cascada)
        const { error: deleteError } = await supabaseClient
          .from('courses')
          .delete()
          .eq('id', courseId);

        if (deleteError) {
          throw new Error(`Error eliminando curso: ${deleteError.message}`);
        }

        result = { deleted: true };
        break;
      }

      default:
        throw new Error("Acción no válida");
    }

    // Si hay datos de lección, gestionar lección
    if (lessonData && courseId) {
      const { data: lesson, error: lessonError } = await supabaseClient
        .from('lessons')
        .insert({
          ...lessonData,
          course_id: courseId
        })
        .select()
        .single();

      if (lessonError) {
        console.error("Error creando lección:", lessonError);
      } else {
        result = { ...result, lesson };
      }
    }

    console.log(`Acción ${action} completada para usuario: ${user.id}`);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200
    });

  } catch (error) {
    console.error("Error en manage-course-content:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500
    });
  }
});
