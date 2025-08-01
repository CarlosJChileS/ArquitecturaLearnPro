import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

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
    Deno.env.get("SUPABASE_ANON_KEY") ?? ""
  );

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);

    if (userError) throw new Error(`Authentication error: ${userError.message}`);

    const user = userData.user;
    if (!user) throw new Error("User not authenticated");

    const { certificateId } = await req.json();

    console.log(`[GENERATE-CERTIFICATE] Generating certificate ${certificateId} for user ${user.id}`);

    // Get certificate details
    const { data: certificate, error: certError } = await supabaseClient
      .from('certificates')
      .select(`
        *,
        courses (
          title,
          description,
          instructor_id,
          profiles!courses_instructor_id_fkey (
            full_name
          )
        ),
        profiles (
          full_name
        )
      `)
      .eq('id', certificateId)
      .eq('user_id', user.id)
      .single();

    if (certError || !certificate) {
      throw new Error("Certificate not found or not authorized");
    }

    // Generate PDF-like HTML content
    const certificateHtml = generateCertificateHTML({
      studentName: certificate.profiles?.full_name || "Student",
      courseName: certificate.courses?.title || "Course",
      instructorName: certificate.courses?.profiles?.full_name || "Instructor",
      certificateNumber: certificate.certificate_number,
      issueDate: new Date(certificate.issued_at).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      score: certificate.score
    });

    console.log(`[GENERATE-CERTIFICATE] Certificate HTML generated for ${certificate.certificate_number}`);

    // Track certificate generation event
    const { error: trackingError } = await supabaseClient
      .rpc('track_student_event', {
        user_id_param: user.id,
        event_type_param: 'certificate_generated',
        event_data_param: {
          certificate_id: certificateId,
          certificate_number: certificate.certificate_number,
          course_id: certificate.course_id,
          course_title: certificate.courses?.title,
          score: certificate.score
        }
      });

    if (trackingError) {
      console.warn("Failed to track certificate generation event:", trackingError);
    } else {
      console.log(`[GENERATE-CERTIFICATE] Event tracked for certificate ${certificate.certificate_number}`);
    }

    return new Response(certificateHtml, {
      status: 200,
      headers: {
        "Content-Type": "text/html",
        "Content-Disposition": `inline; filename="certificate-${certificate.certificate_number}.html"`,
        ...corsHeaders
      }
    });

  } catch (error) {
    console.error("Error in generate-certificate function:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders }
    });
  }
};

function generateCertificateHTML(data: {
  studentName: string;
  courseName: string;
  instructorName: string;
  certificateNumber: string;
  issueDate: string;
  score?: number;
}): string {
  return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Certificado de Completación - ${data.certificateNumber}</title>
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Inter:wght@300;400;500&display=swap');
            
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            
            body {
                font-family: 'Inter', sans-serif;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                min-height: 100vh;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 20px;
            }
            
            .certificate {
                background: white;
                width: 800px;
                max-width: 100%;
                padding: 60px 80px;
                border-radius: 20px;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
                position: relative;
                overflow: hidden;
            }
            
            .certificate::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                height: 8px;
                background: linear-gradient(90deg, #3b82f6, #8b5cf6, #f59e0b, #10b981);
            }
            
            .header {
                text-align: center;
                margin-bottom: 40px;
            }
            
            .logo {
                font-size: 48px;
                margin-bottom: 10px;
            }
            
            .academy-name {
                font-family: 'Playfair Display', serif;
                font-size: 32px;
                font-weight: 700;
                color: #1f2937;
                margin-bottom: 10px;
            }
            
            .subtitle {
                font-size: 16px;
                color: #6b7280;
                font-weight: 300;
                letter-spacing: 2px;
                text-transform: uppercase;
            }
            
            .certificate-title {
                font-family: 'Playfair Display', serif;
                font-size: 42px;
                font-weight: 700;
                color: #3b82f6;
                text-align: center;
                margin: 40px 0;
                letter-spacing: 1px;
            }
            
            .content {
                text-align: center;
                line-height: 1.8;
                color: #374151;
                font-size: 18px;
                margin-bottom: 40px;
            }
            
            .student-name {
                font-family: 'Playfair Display', serif;
                font-size: 36px;
                font-weight: 700;
                color: #1f2937;
                border-bottom: 2px solid #e5e7eb;
                display: inline-block;
                padding-bottom: 8px;
                margin: 20px 0;
            }
            
            .course-name {
                font-weight: 600;
                color: #3b82f6;
                font-size: 24px;
                margin: 20px 0;
            }
            
            .details {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-top: 50px;
                padding-top: 30px;
                border-top: 1px solid #e5e7eb;
            }
            
            .signature {
                text-align: center;
            }
            
            .signature-line {
                width: 200px;
                height: 1px;
                background: #d1d5db;
                margin: 30px auto 10px;
            }
            
            .instructor-name {
                font-weight: 600;
                color: #374151;
                margin-bottom: 5px;
            }
            
            .instructor-title {
                font-size: 14px;
                color: #6b7280;
            }
            
            .certificate-info {
                text-align: right;
                font-size: 14px;
                color: #6b7280;
            }
            
            .certificate-number {
                font-weight: 600;
                color: #374151;
                margin-bottom: 5px;
            }
            
            .issue-date {
                margin-bottom: 5px;
            }
            
            .score {
                font-weight: 600;
                color: #10b981;
            }
            
            .decoration {
                position: absolute;
                top: 20px;
                right: 20px;
                font-size: 80px;
                opacity: 0.05;
                color: #3b82f6;
                transform: rotate(15deg);
            }
            
            @media print {
                body {
                    background: white;
                    padding: 0;
                }
                
                .certificate {
                    box-shadow: none;
                    margin: 0;
                    width: 100%;
                    max-width: none;
                }
            }
            
            @media (max-width: 768px) {
                .certificate {
                    padding: 40px 30px;
                }
                
                .academy-name {
                    font-size: 24px;
                }
                
                .certificate-title {
                    font-size: 28px;
                }
                
                .student-name {
                    font-size: 24px;
                }
                
                .course-name {
                    font-size: 18px;
                }
                
                .content {
                    font-size: 16px;
                }
                
                .details {
                    flex-direction: column;
                    gap: 30px;
                }
                
                .certificate-info {
                    text-align: center;
                }
            }
        </style>
    </head>
    <body>
        <div class="certificate">
            <div class="decoration">🎓</div>
            
            <div class="header">
                <div class="logo">🏆</div>
                <h1 class="academy-name">Academia Online</h1>
                <p class="subtitle">Centro de Excelencia Educativa</p>
            </div>
            
            <h2 class="certificate-title">Certificado de Completación</h2>
            
            <div class="content">
                <p>Por la presente se certifica que</p>
                
                <div class="student-name">${data.studentName}</div>
                
                <p>ha completado satisfactoriamente el curso</p>
                
                <div class="course-name">"${data.courseName}"</div>
                
                <p>cumpliendo con todos los requisitos académicos establecidos${data.score ? ` con una puntuación de <strong>${data.score} puntos</strong>` : ''}.</p>
                
                <p>Este certificado reconoce el compromiso, dedicación y logros académicos del estudiante.</p>
            </div>
            
            <div class="details">
                <div class="signature">
                    <div class="signature-line"></div>
                    <div class="instructor-name">${data.instructorName}</div>
                    <div class="instructor-title">Instructor del Curso</div>
                </div>
                
                <div class="certificate-info">
                    <div class="certificate-number">Certificado #${data.certificateNumber}</div>
                    <div class="issue-date">Fecha de emisión: ${data.issueDate}</div>
                    ${data.score ? `<div class="score">Puntuación: ${data.score} puntos</div>` : ''}
                </div>
            </div>
        </div>
        
        <script>
            // Auto-print functionality for better UX
            window.addEventListener('load', function() {
                // Option to print the certificate
                const printBtn = document.createElement('button');
                printBtn.textContent = 'Imprimir Certificado';
                printBtn.style.cssText = \`
                    position: fixed;
                    bottom: 20px;
                    right: 20px;
                    background: #3b82f6;
                    color: white;
                    border: none;
                    padding: 12px 24px;
                    border-radius: 8px;
                    cursor: pointer;
                    font-weight: 600;
                    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
                    z-index: 1000;
                \`;
                
                printBtn.addEventListener('click', () => window.print());
                document.body.appendChild(printBtn);
            });
        </script>
    </body>
    </html>
  `;
}

serve(handler);
