import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { Resend } from "npm:resend@2.0.0"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const resend = new Resend(Deno.env.get('RESEND_API_KEY'))
    const supabaseServiceClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          persistSession: false
        }
      }
    )

    console.log('Procesando recordatorios de cursos...')

    // Obtener recordatorios pendientes
    const { data: reminders, error: remindersError } = await supabaseServiceClient.rpc('get_pending_reminders')

    if (remindersError) {
      throw new Error(`Error obteniendo recordatorios: ${remindersError.message}`)
    }

    if (!reminders || reminders.length === 0) {
      console.log('No hay recordatorios pendientes')
      return new Response(
        JSON.stringify({
          processed: 0,
          message: 'No hay recordatorios pendientes'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200
        }
      )
    }

    let processedCount = 0
    let errors: any[] = []

    for (const reminder of reminders) {
      try {
        // Obtener información del usuario
        const { data: profile } = await supabaseServiceClient
          .from('profiles')
          .select('email, full_name')
          .eq('id', reminder.user_id)
          .single()

        if (!profile?.email) {
          console.error(`No se encontró email para usuario: ${reminder.user_id}`)
          continue
        }

        // Verificar preferencias del usuario
        const { data: preferences } = await supabaseServiceClient
          .from('user_preferences')
          .select('course_reminders, email_notifications')
          .eq('user_id', reminder.user_id)
          .single()

        if (preferences && (!preferences.course_reminders || !preferences.email_notifications)) {
          console.log(`Usuario ${reminder.user_id} no quiere recordatorios`)
          await supabaseServiceClient.rpc('mark_reminder_sent', {
            reminder_id: reminder.id
          })
          continue
        }

        let courseInfo = ''
        if (reminder.course_id) {
          const { data: course } = await supabaseServiceClient
            .from('courses')
            .select('title')
            .eq('id', reminder.course_id)
            .single()
          courseInfo = course ? ` para el curso "${course.title}"` : ''
        }

        // Enviar email
        const emailResponse = await resend.emails.send({
          from: 'LearnPro <noreply@learnpro.com>',
          to: [profile.email],
          subject: reminder.title,
          html: `
            <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
              <div style="background: linear-gradient(135deg, #3b82f6, #1d4ed8); padding: 30px; text-align: center;">
                <h1 style="color: white; margin: 0; font-size: 24px;">LearnPro</h1>
              </div>
              
              <div style="padding: 30px; background: #ffffff;">
                <h2 style="color: #1f2937; margin-bottom: 20px;">${reminder.title}</h2>
                <p style="color: #4b5563; line-height: 1.6; margin-bottom: 20px;">
                  Hola ${profile.full_name || 'Estudiante'},
                </p>
                <p style="color: #4b5563; line-height: 1.6; margin-bottom: 20px;">
                  ${reminder.message}${courseInfo}
                </p>
                
                ${reminder.course_id ? `
                  <div style="text-align: center; margin: 30px 0;">
                    <a href="${Deno.env.get('VITE_APP_URL')}/courses/${reminder.course_id}" 
                       style="background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">
                      Continuar Aprendiendo
                    </a>
                  </div>
                ` : ''}
                
                <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
                  Si no deseas recibir más recordatorios, puedes desactivarlos en tu perfil.
                </p>
              </div>
              
              <div style="background: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
                <p style="color: #6b7280; font-size: 12px; margin: 0;">
                  © 2025 LearnPro. Todos los derechos reservados.
                </p>
              </div>
            </div>
          `
        })

        if (emailResponse.error) {
          throw new Error(`Error enviando email: ${emailResponse.error.message}`)
        }

        // Marcar recordatorio como enviado
        await supabaseServiceClient.rpc('mark_reminder_sent', {
          reminder_id: reminder.id
        })

        // Crear notificación en la app
        await supabaseServiceClient.rpc('create_notification', {
          target_user_id: reminder.user_id,
          notification_title: reminder.title,
          notification_message: reminder.message,
          notification_type: reminder.reminder_type,
          action_url: reminder.course_id ? `/courses/${reminder.course_id}` : null
        })

        processedCount++
        console.log(`Recordatorio enviado a: ${profile.email}`)

      } catch (reminderError) {
        console.error(`Error procesando recordatorio ${reminder.id}:`, reminderError)
        errors.push({
          reminder_id: reminder.id,
          error: reminderError.message
        })
      }
    }

    return new Response(
      JSON.stringify({
        processed: processedCount,
        total: reminders.length,
        errors: errors.length > 0 ? errors : undefined,
        message: `Se procesaron ${processedCount} de ${reminders.length} recordatorios`
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )

  } catch (error) {
    console.error('Error en send-course-reminders:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})
