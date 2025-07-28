import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type"
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[SEND-EMAIL-NOTIFICATION] ${step}${detailsStr}`);
};

const emailTemplates = {
  welcome: {
    subject: "¡Bienvenido a LearnPro!",
    html: (data: any) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #2563eb; text-align: center;">¡Bienvenido a LearnPro!</h1>
        <p>Hola ${data.recipientName || 'estudiante'},</p>
        <p>Te damos la bienvenida a nuestra plataforma de aprendizaje online. Estamos emocionados de tenerte con nosotros.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${data.actionUrl || 'https://learnpro.com/courses'}" 
             style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Explorar Cursos
          </a>
        </div>
        <p>¡Comienza tu viaje de aprendizaje hoy mismo!</p>
        <p>Saludos,<br>El equipo de LearnPro</p>
      </div>
    `
  },

  course_completion: {
    subject: "¡Felicitaciones! Has completado un curso",
    html: (data: any) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #059669; text-align: center;">🎉 ¡Felicitaciones!</h1>
        <p>Hola ${data.recipientName || 'estudiante'},</p>
        <p>Has completado exitosamente el curso: <strong>${data.courseName}</strong></p>
        ${data.certificateNumber ? `
          <div style="background-color: #f0fdf4; border: 2px solid #059669; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center;">
            <h3 style="color: #059669; margin-top: 0;">Certificado de Finalización</h3>
            <p style="font-size: 18px; font-weight: bold;">Número: ${data.certificateNumber}</p>
          </div>
        ` : ''}
        <div style="text-align: center; margin: 30px 0;">
          <a href="${data.actionUrl || 'https://learnpro.com/certificates'}" 
             style="background-color: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Ver Certificado
          </a>
        </div>
        <p>¡Sigue aprendiendo y explorando nuevos cursos!</p>
        <p>Saludos,<br>El equipo de LearnPro</p>
      </div>
    `
  },

  subscription_welcome: {
    subject: "¡Tu suscripción está activa!",
    html: (data: any) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #7c3aed; text-align: center;">¡Suscripción Activada!</h1>
        <p>Hola ${data.recipientName || 'estudiante'},</p>
        <p>Tu suscripción <strong>${data.subscriptionTier}</strong> está ahora activa.</p>
        <div style="background-color: #faf5ff; border: 2px solid #7c3aed; border-radius: 8px; padding: 20px; margin: 20px 0;">
          <h3 style="color: #7c3aed; margin-top: 0;">Beneficios de tu suscripción:</h3>
          <ul style="color: #374151;">
            <li>Acceso ilimitado a todos los cursos</li>
            <li>Certificados de finalización</li>
            <li>Soporte prioritario</li>
            <li>Contenido exclusivo premium</li>
          </ul>
        </div>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${data.actionUrl || 'https://learnpro.com/courses'}" 
             style="background-color: #7c3aed; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Comenzar a Aprender
          </a>
        </div>
        <p>¡Aprovecha al máximo tu suscripción!</p>
        <p>Saludos,<br>El equipo de LearnPro</p>
      </div>
    `
  },

  subscription_expiry: {
    subject: "Tu suscripción está por vencer",
    html: (data: any) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #dc2626; text-align: center;">⚠️ Suscripción por Vencer</h1>
        <p>Hola ${data.recipientName || 'estudiante'},</p>
        <p>Te informamos que tu suscripción <strong>${data.subscriptionTier}</strong> vencerá el <strong>${data.expiryDate}</strong>.</p>
        <div style="background-color: #fef2f2; border: 2px solid #dc2626; border-radius: 8px; padding: 20px; margin: 20px 0;">
          <h3 style="color: #dc2626; margin-top: 0;">No pierdas el acceso a:</h3>
          <ul style="color: #374151;">
            <li>Todos los cursos premium</li>
            <li>Tus certificados y progreso</li>
            <li>Contenido exclusivo</li>
            <li>Soporte prioritario</li>
          </ul>
        </div>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${data.actionUrl || 'https://learnpro.com/billing'}" 
             style="background-color: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Renovar Suscripción
          </a>
        </div>
        <p>Renueva ahora para continuar sin interrupciones.</p>
        <p>Saludos,<br>El equipo de LearnPro</p>
      </div>
    `
  },

  course_reminder: {
    subject: "Recordatorio de curso",
    html: (data: any) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #f59e0b; text-align: center;">📚 Recordatorio de Curso</h1>
        <p>Hola ${data.userName || 'estudiante'},</p>
        <p>Te recordamos que tienes progreso pendiente en <strong>${data.courseName}</strong>.</p>
        <div style="background-color: #fffbeb; border: 2px solid #f59e0b; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center;">
          <p style="color: #92400e; font-size: 16px; margin: 0;">
            ¡Continúa donde lo dejaste y completa tu aprendizaje!
          </p>
        </div>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${Deno.env.get("VITE_APP_URL") || 'https://learnpro.com'}/courses" 
             style="background-color: #f59e0b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Continuar Curso
          </a>
        </div>
        <p>¡No pierdas el impulso y sigue aprendiendo!</p>
        <p>Saludos,<br>El equipo de LearnPro</p>
      </div>
    `
  },

  exam_reminder: {
    subject: "Recordatorio de examen",
    html: (data: any) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #dc2626; text-align: center;">📝 Examen Pendiente</h1>
        <p>Hola ${data.userName || 'estudiante'},</p>
        <p>Tienes un examen pendiente en <strong>${data.courseName}</strong>.</p>
        <div style="background-color: #fef2f2; border: 2px solid #dc2626; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center;">
          <p style="color: #991b1b; font-size: 16px; margin: 0;">
            ¡Demuestra todo lo que has aprendido!
          </p>
        </div>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${Deno.env.get("VITE_APP_URL") || 'https://learnpro.com'}/courses" 
             style="background-color: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Realizar Examen
          </a>
        </div>
        <p>¡Confía en tu preparación y obtén tu certificado!</p>
        <p>Saludos,<br>El equipo de LearnPro</p>
      </div>
    `
  },

  custom: {
    subject: (data: any) => data.customSubject || "Notificación de LearnPro",
    html: (data: any) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #2563eb; text-align: center;">LearnPro</h1>
        <p>Hola ${data.recipientName || 'estudiante'},</p>
        <div style="background-color: #f8fafc; border-radius: 8px; padding: 20px; margin: 20px 0;">
          ${data.customMessage || 'Tienes una nueva notificación.'}
        </div>
        ${data.actionUrl ? `
          <div style="text-align: center; margin: 30px 0;">
            <a href="${data.actionUrl}" 
               style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Ver Más
            </a>
          </div>
        ` : ''}
        <p>Saludos,<br>El equipo de LearnPro</p>
      </div>
    `
  }
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

    const resendKey = Deno.env.get("RESEND_API_KEY");
    if (!resendKey) throw new Error("RESEND_API_KEY is not set");

    const emailData = await req.json();
    logStep("Email request received", { 
      type: emailData.type, 
      to: emailData.to,
      subject: emailData.subject 
    });

    // Validate required fields
    if (!emailData.to) {
      throw new Error("Recipient email is required");
    }

    if (!emailData.type && !emailData.subject) {
      throw new Error("Email type or custom subject is required");
    }

    let subject: string;
    let html: string;

    if (emailData.type && emailTemplates[emailData.type as keyof typeof emailTemplates]) {
      // Use predefined template
      const template = emailTemplates[emailData.type as keyof typeof emailTemplates];
      subject = typeof template.subject === 'function' 
        ? template.subject(emailData.data || {}) 
        : template.subject;
      html = template.html(emailData.data || {});
    } else {
      // Use custom email
      subject = emailData.subject || "Notificación de LearnPro";
      html = emailData.html || `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #2563eb; text-align: center;">LearnPro</h1>
          <div style="background-color: #f8fafc; border-radius: 8px; padding: 20px; margin: 20px 0;">
            ${emailData.message || 'Tienes una nueva notificación.'}
          </div>
          <p>Saludos,<br>El equipo de LearnPro</p>
        </div>
      `;
    }

    // Send email
    const emailResponse = await resend.emails.send({
      from: "LearnPro <onboarding@resend.dev>",
      to: Array.isArray(emailData.to) ? emailData.to : [emailData.to],
      subject: subject,
      html: html
    });

    if (emailResponse.error) {
      throw new Error(`Failed to send email: ${emailResponse.error.message}`);
    }

    logStep("Email sent successfully", { messageId: emailResponse.data?.id });

    // Log notification in database if user info is provided
    if (emailData.userId) {
      await supabaseClient.from("notifications").insert({
        user_id: emailData.userId,
        title: subject,
        message: `Email enviado a ${emailData.to}`,
        type: 'email',
        metadata: {
          email_type: emailData.type || 'custom',
          recipient: emailData.to,
          message_id: emailResponse.data?.id
        }
      });
    }

    return new Response(JSON.stringify({
      success: true,
      messageId: emailResponse.data?.id,
      message: "Email sent successfully"
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    logStep("ERROR in send-email-notification", { message: error.message });
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});
