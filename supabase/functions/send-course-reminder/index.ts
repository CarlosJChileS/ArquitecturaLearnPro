import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type"
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[SEND-COURSE-REMINDER] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    {
      auth: {
        persistSession: false,
      },
    }
  );

  try {
    logStep("Function started");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    
    const user = userData.user;
    if (!user) throw new Error("User not authenticated");

    const requestData = await req.json();
    logStep("Reminder request received", requestData);

    let result = {};

    switch (requestData.action) {
      case 'send_single':
        result = await sendSingleReminder(supabaseClient, requestData, user.id);
        break;
      case 'send_bulk':
        result = await sendBulkReminders(supabaseClient, requestData, user.id);
        break;
      case 'schedule':
        result = await scheduleReminder(supabaseClient, requestData, user.id);
        break;
      default:
        throw new Error(`Unknown action: ${requestData.action}`);
    }

    logStep("Reminder processing completed", { action: requestData.action });

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    logStep("ERROR in send-course-reminder", { message: error.message });
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});

async function sendSingleReminder(supabaseClient: any, requestData: any, userId: string) {
  const { recipientId, courseId, message, reminderType } = requestData;

  // Get recipient profile
  const { data: profile } = await supabaseClient
    .from('profiles')
    .select('email, full_name')
    .eq('user_id', recipientId)
    .single();

  if (!profile?.email) {
    throw new Error("Recipient email not found");
  }

  // Get course info if provided
  let courseInfo = null;
  if (courseId) {
    const { data: course } = await supabaseClient
      .from('courses')
      .select('title, description')
      .eq('id', courseId)
      .single();
    courseInfo = course;
  }

  // Send email reminder
  const emailSubject = getEmailSubject(reminderType, courseInfo?.title);
  const emailContent = getEmailContent(reminderType, profile.full_name, courseInfo, message);

  const emailResponse = await resend.emails.send({
    from: "LearnPro <noreply@learnpro.com>",
    to: [profile.email],
    subject: emailSubject,
    html: emailContent
  });

  if (emailResponse.error) {
    throw new Error(`Failed to send email: ${emailResponse.error.message}`);
  }

  // Create in-app notification
  await supabaseClient.from("notifications").insert({
    user_id: recipientId,
    title: emailSubject,
    message: message || getDefaultMessage(reminderType, courseInfo?.title),
    type: 'reminder',
    action_url: courseId ? `/courses/${courseId}` : null,
    metadata: {
      reminder_type: reminderType,
      course_id: courseId,
      sent_by: userId
    }
  });

  logStep("Single reminder sent", { recipientEmail: profile.email, courseId });

  return {
    success: true,
    message: "Reminder sent successfully",
    recipient: profile.email
  };
}

async function sendBulkReminders(supabaseClient: any, requestData: any, userId: string) {
  const { courseId, message, reminderType, targetAudience } = requestData;

  // Get course info
  const { data: course } = await supabaseClient
    .from('courses')
    .select('title, description, instructor_id')
    .eq('id', courseId)
    .single();

  if (!course) {
    throw new Error("Course not found");
  }

  // Verify permissions
  const { data: profile } = await supabaseClient
    .from('profiles')
    .select('role')
    .eq('user_id', userId)
    .single();

  const isAdmin = profile?.role === 'admin';
  const isInstructor = course.instructor_id === userId;

  if (!isAdmin && !isInstructor) {
    throw new Error("Unauthorized: Only course instructors and admins can send bulk reminders");
  }

  // Get target users based on audience
  let targetUsers = [];
  
  switch (targetAudience) {
    case 'enrolled':
      const { data: enrolled } = await supabaseClient
        .from('course_enrollments')
        .select(`
          user_id,
          profiles (email, full_name)
        `)
        .eq('course_id', courseId)
        .is('completed_at', null);
      targetUsers = enrolled || [];
      break;
    
    case 'inactive':
      const { data: inactive } = await supabaseClient
        .from('course_enrollments')
        .select(`
          user_id,
          profiles (email, full_name)
        `)
        .eq('course_id', courseId)
        .lt('last_accessed_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());
      targetUsers = inactive || [];
      break;
    
    case 'low_progress':
      const { data: lowProgress } = await supabaseClient
        .from('course_enrollments')
        .select(`
          user_id,
          profiles (email, full_name)
        `)
        .eq('course_id', courseId)
        .lt('progress_percentage', 50)
        .is('completed_at', null);
      targetUsers = lowProgress || [];
      break;
  }

  // Send reminders to all target users
  let successCount = 0;
  const errors = [];

  for (const user of targetUsers) {
    try {
      if (user.profiles?.email) {
        const emailSubject = getEmailSubject(reminderType, course.title);
        const emailContent = getEmailContent(reminderType, user.profiles.full_name, course, message);

        await resend.emails.send({
          from: "LearnPro <noreply@learnpro.com>",
          to: [user.profiles.email],
          subject: emailSubject,
          html: emailContent
        });

        // Create in-app notification
        await supabaseClient.from("notifications").insert({
          user_id: user.user_id,
          title: emailSubject,
          message: message || getDefaultMessage(reminderType, course.title),
          type: 'reminder',
          action_url: `/courses/${courseId}`,
          metadata: {
            reminder_type: reminderType,
            course_id: courseId,
            sent_by: userId,
            bulk_reminder: true
          }
        });

        successCount++;
      }
    } catch (error) {
      errors.push({
        user_id: user.user_id,
        email: user.profiles?.email,
        error: error.message
      });
    }
  }

  logStep("Bulk reminders sent", { 
    courseId, 
    targetAudience, 
    totalUsers: targetUsers.length, 
    successCount, 
    errorCount: errors.length 
  });

  return {
    success: true,
    message: `Bulk reminders sent to ${successCount} users`,
    details: {
      total_users: targetUsers.length,
      successful_sends: successCount,
      failed_sends: errors.length,
      errors: errors.length > 0 ? errors : undefined
    }
  };
}

async function scheduleReminder(supabaseClient: any, requestData: any, userId: string) {
  const { courseId, message, reminderType, scheduledDate, recipientIds } = requestData;

  // Insert scheduled reminder
  const { data: scheduledReminder, error } = await supabaseClient
    .from('scheduled_reminders')
    .insert({
      course_id: courseId,
      created_by: userId,
      reminder_type: reminderType,
      message: message,
      scheduled_date: scheduledDate,
      recipient_ids: recipientIds,
      status: 'pending'
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to schedule reminder: ${error.message}`);
  }

  logStep("Reminder scheduled", { 
    scheduledId: scheduledReminder.id, 
    scheduledDate,
    recipientCount: recipientIds?.length || 0
  });

  return {
    success: true,
    message: "Reminder scheduled successfully",
    scheduled_reminder_id: scheduledReminder.id,
    scheduled_date: scheduledDate
  };
}

function getEmailSubject(reminderType: string, courseTitle?: string): string {
  switch (reminderType) {
    case 'progress':
      return courseTitle 
        ? `Continúa tu progreso en ${courseTitle}` 
        : 'Continúa tu progreso en el curso';
    case 'completion':
      return courseTitle 
        ? `¡Completa ${courseTitle} y obtén tu certificado!` 
        : '¡Completa tu curso y obtén tu certificado!';
    case 'new_lesson':
      return courseTitle 
        ? `Nueva lección disponible en ${courseTitle}` 
        : 'Nueva lección disponible';
    case 'exam_reminder':
      return courseTitle 
        ? `Examen pendiente en ${courseTitle}` 
        : 'Tienes un examen pendiente';
    default:
      return courseTitle 
        ? `Recordatorio de ${courseTitle}` 
        : 'Recordatorio de curso';
  }
}

function getEmailContent(reminderType: string, userName: string, courseInfo: any, customMessage?: string): string {
  const courseName = courseInfo?.title || 'tu curso';
  const baseMessage = customMessage || getDefaultMessage(reminderType, courseName);

  return `
    <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
      <div style="background: linear-gradient(135deg, #3b82f6, #1d4ed8); padding: 30px; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 24px;">LearnPro</h1>
      </div>
      
      <div style="padding: 30px; background: #ffffff;">
        <p style="color: #1f2937; margin-bottom: 20px;">
          Hola ${userName || 'estudiante'},
        </p>
        
        <div style="background-color: #f0f9ff; border-left: 4px solid #3b82f6; padding: 20px; margin: 20px 0;">
          <p style="color: #1f2937; line-height: 1.6; margin: 0;">
            ${baseMessage}
          </p>
        </div>
        
        ${courseInfo ? `
          <div style="text-align: center; margin: 30px 0;">
            <a href="${Deno.env.get("VITE_APP_URL")}/courses/${courseInfo.id}" 
               style="background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
              Ir al Curso
            </a>
          </div>
        ` : ''}
        
        <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
          ¡Sigue aprendiendo y alcanza tus metas!
        </p>
      </div>
      
      <div style="background: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
        <p style="color: #6b7280; font-size: 12px; margin: 0;">
          © 2024 LearnPro. Todos los derechos reservados.
        </p>
      </div>
    </div>
  `;
}

function getDefaultMessage(reminderType: string, courseTitle: string): string {
  switch (reminderType) {
    case 'progress':
      return `Te recordamos que tienes progreso pendiente en ${courseTitle}. ¡Continúa donde lo dejaste!`;
    case 'completion':
      return `Estás muy cerca de completar ${courseTitle}. ¡Finaliza el curso y obtén tu certificado!`;
    case 'new_lesson':
      return `Hay nueva lección disponible en ${courseTitle}. ¡No te la pierdas!`;
    case 'exam_reminder':
      return `Tienes un examen pendiente en ${courseTitle}. ¡Demuestra lo que has aprendido!`;
    default:
      return `Recordatorio sobre tu curso ${courseTitle}. ¡Sigue aprendiendo!`;
  }
}
