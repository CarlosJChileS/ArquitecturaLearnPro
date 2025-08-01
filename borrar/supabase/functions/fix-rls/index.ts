import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

export default async function handler(req: Request) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  };

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    console.log('🔧 Ejecutando script para deshabilitar RLS...');

    // Deshabilitar RLS en todas las tablas principales
    const tables = [
      'profiles', 'categories', 'subscription_plans', 'courses', 
      'lessons', 'course_enrollments', 'lesson_progress', 
      'user_subscriptions', 'subscribers', 'course_reviews', 
      'certificates', 'exams', 'exam_attempts', 'student_analytics', 
      'student_events', 'notifications'
    ];

    const results = [];

    for (const table of tables) {
      try {
        // Intentar deshabilitar RLS
        const { error } = await supabase.rpc('exec_sql', {
          sql: `ALTER TABLE IF EXISTS public.${table} DISABLE ROW LEVEL SECURITY;`
        });

        if (error) {
          console.log(`⚠️ No se pudo deshabilitar RLS para ${table}:`, error.message);
          results.push({ table, status: 'error', message: error.message });
        } else {
          console.log(`✅ RLS deshabilitado para ${table}`);
          results.push({ table, status: 'success' });
        }
      } catch (err) {
        console.log(`❌ Error procesando ${table}:`, err);
        results.push({ table, status: 'error', message: err.message });
      }
    }

    // Verificar si se puede insertar en courses
    try {
      const testData = {
        title: 'Test Course ' + Date.now(),
        description: 'Test description',
        category_id: null,
        instructor_id: null
      };

      const { data: testCourse, error: testError } = await supabase
        .from('courses')
        .insert(testData)
        .select()
        .single();

      if (testError) {
        console.log('❌ Test de inserción falló:', testError.message);
        results.push({ 
          table: 'test_insert', 
          status: 'error', 
          message: testError.message 
        });
      } else {
        console.log('✅ Test de inserción exitoso');
        // Limpiar el curso de prueba
        await supabase.from('courses').delete().eq('id', testCourse.id);
        results.push({ 
          table: 'test_insert', 
          status: 'success' 
        });
      }
    } catch (testErr) {
      console.log('❌ Error en test de inserción:', testErr);
      results.push({ 
        table: 'test_insert', 
        status: 'error', 
        message: testErr.message 
      });
    }

    return Response.json({
      success: true,
      message: 'Script RLS ejecutado',
      results
    }, { headers: corsHeaders });

  } catch (error) {
    console.error('❌ Error general:', error);
    return Response.json({
      success: false,
      error: error.message,
      stack: error.stack
    }, { 
      headers: corsHeaders,
      status: 500 
    });
  }
}
