import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type"
};

const handler = async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    {
      auth: {
        persistSession: false
      }
    }
  );

  try {
    const { to, subject, message, type, data } = await req.json();
    
    console.log(`[SEND-EMAIL] Sending ${type} email to ${to}`);

    let htmlContent = "";

    switch (type) {
      case 'welcome':
        htmlContent = getWelcomeEmailTemplate(data?.userName || "Usuario", message);
        break;
      case 'course_reminder':
        htmlContent = getCourseReminderTemplate(data?.courseName || "tu curso", message);
        break;
      case 'certificate':
        htmlContent = getCertificateEmailTemplate(
          data?.courseName || "tu curso", 
          data?.certificateNumber || "", 
          message
        );
        break;
      case 'subscription':
        htmlContent = getSubscriptionEmailTemplate(data?.planName || "Premium", message);
        break;
      default:
        htmlContent = getGeneralEmailTemplate(message);
    }

    const emailResponse = await resend.emails.send({
      from: "Academia Online <onboarding@resend.dev>",
      to: [to],
      subject: subject,
      html: htmlContent
    });

    console.log("Email sent successfully:", emailResponse);

    // Log email in user_events
    if (data?.userId) {
      await supabaseClient.from("user_events").insert({
        user_id: data.userId,
        event_type: "email_sent",
        event_data: {
          email_type: type,
          subject: subject,
          to: to
        }
      });
    }

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders
      }
    });

  } catch (error) {
    console.error("Error in send-notification-email function:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders
      }
    });
  }
};

function getWelcomeEmailTemplate(userName: string, message: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f4f4f4; }
        .container { max-width: 600px; margin: 0 auto; background: white; padding: 40px; border-radius: 10px; }
        .header { text-align: center; margin-bottom: 30px; }
        .logo { color: #3b82f6; font-size: 24px; font-weight: bold; }
        .content { color: #333; line-height: 1.6; }
        .button { display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">🎓 Academia Online</div>
        </div>
        <div class="content">
          <h1>¡Bienvenido/a ${userName}!</h1>
          <p>${message}</p>
          <p>Estamos emocionados de tenerte en nuestra comunidad de aprendizaje. Con tu cuenta podrás:</p>
          <ul>
            <li>Acceder a cursos de alta calidad</li>
            <li>Seguir tu progreso de aprendizaje</li>
            <li>Obtener certificados al completar cursos</li>
            <li>Conectar con otros estudiantes</li>
          </ul>
          <a href="#" class="button">Explorar Cursos</a>
        </div>
        <div class="footer">
          <p>¡Gracias por unirte a nosotros!</p>
          <p>El equipo de Academia Online</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

function getCourseReminderTemplate(courseName: string, message: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f4f4f4; }
        .container { max-width: 600px; margin: 0 auto; background: white; padding: 40px; border-radius: 10px; }
        .header { text-align: center; margin-bottom: 30px; }
        .logo { color: #3b82f6; font-size: 24px; font-weight: bold; }
        .content { color: #333; line-height: 1.6; }
        .button { display: inline-block; background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">📚 Recordatorio de Curso</div>
        </div>
        <div class="content">
          <h1>No olvides continuar con "${courseName}"</h1>
          <p>${message}</p>
          <p>Tu progreso de aprendizaje es importante para nosotros. ¡Continúa donde lo dejaste!</p>
          <a href="#" class="button">Continuar Curso</a>
        </div>
        <div class="footer">
          <p>¡Sigue aprendiendo!</p>
          <p>El equipo de Academia Online</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

function getCertificateEmailTemplate(courseName: string, certificateNumber: string, message: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f4f4f4; }
        .container { max-width: 600px; margin: 0 auto; background: white; padding: 40px; border-radius: 10px; }
        .header { text-align: center; margin-bottom: 30px; }
        .logo { color: #3b82f6; font-size: 24px; font-weight: bold; }
        .content { color: #333; line-height: 1.6; }
        .certificate-box { background: #f8fafc; border: 2px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center; }
        .button { display: inline-block; background: #8b5cf6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">🏆 ¡Felicitaciones!</div>
        </div>
        <div class="content">
          <h1>¡Has completado "${courseName}"!</h1>
          <p>${message}</p>
          <div class="certificate-box">
            <h3>🎖️ Certificado Otorgado</h3>
            <p><strong>Número de Certificado:</strong> ${certificateNumber}</p>
            <p>Este certificado valida tu completación exitosa del curso.</p>
          </div>
          <a href="#" class="button">Descargar Certificado</a>
        </div>
        <div class="footer">
          <p>¡Continúa aprendiendo y creciendo!</p>
          <p>El equipo de Academia Online</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

function getSubscriptionEmailTemplate(planName: string, message: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f4f4f4; }
        .container { max-width: 600px; margin: 0 auto; background: white; padding: 40px; border-radius: 10px; }
        .header { text-align: center; margin-bottom: 30px; }
        .logo { color: #3b82f6; font-size: 24px; font-weight: bold; }
        .content { color: #333; line-height: 1.6; }
        .button { display: inline-block; background: #f59e0b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">💳 Suscripción ${planName}</div>
        </div>
        <div class="content">
          <h1>Información sobre tu suscripción</h1>
          <p>${message}</p>
          <a href="#" class="button">Gestionar Suscripción</a>
        </div>
        <div class="footer">
          <p>Gracias por tu confianza</p>
          <p>El equipo de Academia Online</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

function getGeneralEmailTemplate(message: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f4f4f4; }
        .container { max-width: 600px; margin: 0 auto; background: white; padding: 40px; border-radius: 10px; }
        .header { text-align: center; margin-bottom: 30px; }
        .logo { color: #3b82f6; font-size: 24px; font-weight: bold; }
        .content { color: #333; line-height: 1.6; }
        .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">📧 Academia Online</div>
        </div>
        <div class="content">
          <p>${message}</p>
        </div>
        <div class="footer">
          <p>Saludos cordiales</p>
          <p>El equipo de Academia Online</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

serve(handler);
