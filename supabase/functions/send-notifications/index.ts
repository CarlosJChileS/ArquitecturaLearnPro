import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@4.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type"
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[SEND-NOTIFICATIONS] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const resendKey = Deno.env.get("RESEND_API_KEY");
    if (!resendKey) throw new Error("RESEND_API_KEY is not set");

    const resend = new Resend(resendKey);

    // Use service role key for database operations
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      {
        auth: {
          persistSession: false
        }
      }
    );

    const { type, notification_id, reminder_id } = await req.json();

    if (type === "notification" && notification_id) {
      await processNotification(supabaseClient, resend, notification_id);
    } else if (type === "reminder" && reminder_id) {
      await processReminder(supabaseClient, resend, reminder_id);
    } else if (type === "batch_reminders") {
      await processBatchReminders(supabaseClient, resend);
    } else {
      throw new Error("Invalid request type or missing IDs");
    }

    return new Response(JSON.stringify({
      success: true
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in send-notifications", { message: errorMessage });
    
    return new Response(JSON.stringify({
      error: errorMessage
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500
    });
  }
});

async function processNotification(supabase: any, resend: any, notificationId: string) {
  logStep("Processing notification", { notificationId });

  // Get notification with user profile
  const { data: notification, error } = await supabase
    .from("notifications")
    .select(`
      *,
      profiles!inner (
        user_id,
        email,
        full_name,
        user_preferences (
          email_notifications
        )
      )
    `)
    .eq("id", notificationId)
    .single();

  if (error || !notification) {
    throw new Error("Notification not found");
  }

  const profile = notification.profiles;

  // Check if user wants email notifications
  if (profile.user_preferences?.[0]?.email_notifications === false) {
    logStep("User has disabled email notifications", { userId: profile.user_id });
    return;
  }

  // Send email
  const emailResult = await resend.emails.send({
    from: "LearnPro <notifications@resend.dev>",
    to: [profile.email],
    subject: notification.title,
    html: createNotificationEmail(notification, profile.full_name)
  });

  logStep("Email sent", { emailId: emailResult.data?.id, to: profile.email });
}

async function processReminder(supabase: any, resend: any, reminderId: string) {
  logStep("Processing reminder", { reminderId });

  // Get reminder with user profile
  const { data: reminder, error } = await supabase
    .from("reminders")
    .select(`
      *,
      profiles!inner (
        user_id,
        email,
        full_name,
        user_preferences (
          course_reminders
        )
      ),
      courses (
        title
      )
    `)
    .eq("id", reminderId)
    .single();

  if (error || !reminder) {
    throw new Error("Reminder not found");
  }

  const profile = reminder.profiles;

  // Check if user wants course reminders
  if (profile.user_preferences?.[0]?.course_reminders === false) {
    logStep("User has disabled course reminders", { userId: profile.user_id });
    return;
  }

  // Send email
  const emailResult = await resend.emails.send({
    from: "LearnPro <reminders@resend.dev>",
    to: [profile.email],
    subject: reminder.title,
    html: createReminderEmail(reminder, profile.full_name)
  });

  // Mark reminder as sent
  await supabase.rpc("mark_reminder_sent", { reminder_id: reminderId });

  logStep("Reminder email sent", { emailId: emailResult.data?.id, to: profile.email });
}

async function processBatchReminders(supabase: any, resend: any) {
  logStep("Processing batch reminders");

  // Get pending reminders
  const { data: reminders, error } = await supabase.rpc("get_pending_reminders");

  if (error) {
    throw new Error("Failed to get pending reminders");
  }

  logStep("Found pending reminders", { count: reminders?.length || 0 });

  for (const reminder of reminders || []) {
    try {
      await processReminder(supabase, resend, reminder.id);
    } catch (error) {
      logStep("Error processing reminder", { 
        reminderId: reminder.id, 
        error: error.message 
      });
    }
  }
}

function createNotificationEmail(notification: any, userName: string) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${notification.title}</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #2563eb; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background-color: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px; }
        .button { display: inline-block; background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0; color: #64748b; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>LearnPro</h1>
        </div>
        <div class="content">
          <h2>Hola ${userName || 'Estudiante'}!</h2>
          <h3>${notification.title}</h3>
          <p>${notification.message}</p>
          ${notification.action_url ? `<a href="${notification.action_url}" class="button">Ver más</a>` : ''}
        </div>
        <div class="footer">
          <p>Este es un mensaje automático de LearnPro</p>
          <p>Si no deseas recibir estas notificaciones, puedes cambiar tus preferencias en tu perfil.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

function createReminderEmail(reminder: any, userName: string) {
  const courseTitle = reminder.courses?.title || 'tu curso';
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${reminder.title}</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #059669; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background-color: #f0fdf4; padding: 30px; border-radius: 0 0 8px 8px; }
        .button { display: inline-block; background-color: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0; color: #64748b; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>📚 Recordatorio LearnPro</h1>
        </div>
        <div class="content">
          <h2>Hola ${userName || 'Estudiante'}!</h2>
          <h3>${reminder.title}</h3>
          <p>${reminder.message}</p>
          ${reminder.course_id ? `<p><strong>Curso:</strong> ${courseTitle}</p>` : ''}
          <a href="${Deno.env.get('SUPABASE_URL') || 'http://localhost:8080'}/dashboard" class="button">Continuar aprendiendo</a>
        </div>
        <div class="footer">
          <p>Este es un recordatorio automático de LearnPro</p>
          <p>¡Sigue avanzando en tu aprendizaje!</p>
        </div>
      </div>
    </body>
    </html>
  `;
}
