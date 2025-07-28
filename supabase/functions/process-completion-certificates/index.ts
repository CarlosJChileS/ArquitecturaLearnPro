import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type"
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[PROCESS-COMPLETION-CERTIFICATES] ${step}${detailsStr}`);
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
    logStep("Certificate request received", { action: requestData.action });

    let result = {};

    switch (requestData.action) {
      case 'generate':
        if (requestData.examAttemptId) {
          result = await generateCertificateFromExam(supabaseClient, requestData.examAttemptId, user.id);
        } else if (requestData.courseId) {
          result = await generateCertificateFromCourse(supabaseClient, requestData.courseId, user.id);
        } else {
          throw new Error("Either examAttemptId or courseId is required for certificate generation");
        }
        break;
      case 'regenerate':
        result = await regenerateCertificate(supabaseClient, requestData.courseId, user.id);
        break;
      case 'validate':
        result = await validateCertificate(supabaseClient, requestData);
        break;
      case 'list':
        result = await listUserCertificates(supabaseClient, user.id);
        break;
      default:
        throw new Error(`Unknown action: ${requestData.action}`);
    }

    logStep("Certificate processing completed", { action: requestData.action });

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    logStep("ERROR in process-completion-certificates", { message: error.message });
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});

async function generateCertificateFromExam(supabaseClient: any, examAttemptId: string, userId: string) {
  logStep("Generating certificate from exam attempt", { examAttemptId, userId });

  // Get exam attempt details
  const { data: attempt, error: attemptError } = await supabaseClient
    .from('exam_attempts')
    .select(`
      id, score, max_score, percentage, passed, completed_at, user_id,
      exams (
        id, title, course_id, passing_score,
        courses (
          id, title, description, instructor_id,
          profiles!instructor_id (full_name)
        )
      )
    `)
    .eq('id', examAttemptId)
    .eq('user_id', userId)
    .single();

  if (attemptError || !attempt) {
    throw new Error("Exam attempt not found or unauthorized");
  }

  if (!attempt.passed) {
    throw new Error("Certificate can only be generated for passed exams");
  }

  // Check if certificate already exists
  const { data: existingCertificate } = await supabaseClient
    .from('certificates')
    .select('id, certificate_number')
    .eq('exam_attempt_id', examAttemptId)
    .single();

  if (existingCertificate) {
    logStep("Certificate already exists", { certificateId: existingCertificate.id });
    return {
      success: true,
      certificate: existingCertificate,
      message: "Certificate already exists"
    };
  }

  // Generate certificate number
  const certificateNumber = await generateCertificateNumber();

  // Get user profile
  const { data: userProfile } = await supabaseClient
    .from('profiles')
    .select('full_name, email')
    .eq('user_id', userId)
    .single();

  // Create certificate record
  const { data: certificate, error: certError } = await supabaseClient
    .from('certificates')
    .insert({
      user_id: userId,
      course_id: attempt.exams.course_id,
      exam_attempt_id: examAttemptId,
      certificate_number: certificateNumber,
      score: attempt.score,
      issued_at: new Date().toISOString()
    })
    .select()
    .single();

  if (certError) {
    throw new Error(`Failed to create certificate: ${certError.message}`);
  }

  // Generate certificate metadata
  const certificateData = {
    id: certificate.id,
    certificate_number: certificateNumber,
    student_name: userProfile?.full_name || 'Student',
    student_email: userProfile?.email,
    course_title: attempt.exams.courses.title,
    course_description: attempt.exams.courses.description,
    instructor_name: attempt.exams.courses.profiles?.full_name || 'Instructor',
    exam_title: attempt.exams.title,
    score: attempt.score,
    max_score: attempt.max_score,
    percentage: attempt.percentage,
    completion_date: attempt.completed_at,
    issue_date: certificate.issued_at
  };

  // Send notification
  await supabaseClient.from("notifications").insert({
    user_id: userId,
    title: "¡Certificado generado!",
    message: `Tu certificado para ${attempt.exams.courses.title} está listo`,
    type: 'success',
    action_url: `/certificates/${certificate.id}`,
    metadata: {
      certificate_id: certificate.id,
      certificate_number: certificateNumber,
      course_id: attempt.exams.course_id
    }
  });

  logStep("Certificate generated successfully", { certificateId: certificate.id, certificateNumber });

  return {
    success: true,
    certificate: certificateData,
    message: "Certificate generated successfully"
  };
}

async function generateCertificateFromCourse(supabaseClient: any, courseId: string, userId: string) {
  logStep("Generating certificate from course completion", { courseId, userId });

  // Check if user has completed the course
  const { data: enrollment, error: enrollmentError } = await supabaseClient
    .from('course_enrollments')
    .select(`
      id, progress_percentage, completed_at,
      courses (
        id, title, description, instructor_id, has_final_exam, exam_required_for_completion,
        profiles!instructor_id (full_name)
      )
    `)
    .eq('course_id', courseId)
    .eq('user_id', userId)
    .single();

  if (enrollmentError || !enrollment) {
    throw new Error("Course enrollment not found");
  }

  if (!enrollment.completed_at) {
    throw new Error("Course must be completed to generate certificate");
  }

  // Check if certificate already exists
  const { data: existingCertificate } = await supabaseClient
    .from('certificates')
    .select('id, certificate_number')
    .eq('course_id', courseId)
    .eq('user_id', userId)
    .single();

  if (existingCertificate) {
    return {
      success: true,
      certificate: existingCertificate,
      message: "Certificate already exists"
    };
  }

  // Generate certificate
  const certificateNumber = await generateCertificateNumber();
  const { data: userProfile } = await supabaseClient
    .from('profiles')
    .select('full_name, email')
    .eq('user_id', userId)
    .single();

  const { data: certificate, error: certError } = await supabaseClient
    .from('certificates')
    .insert({
      user_id: userId,
      course_id: courseId,
      certificate_number: certificateNumber,
      score: null,
      issued_at: new Date().toISOString()
    })
    .select()
    .single();

  if (certError) {
    throw new Error(`Failed to create certificate: ${certError.message}`);
  }

  const certificateData = {
    id: certificate.id,
    certificate_number: certificateNumber,
    student_name: userProfile?.full_name || 'Student',
    student_email: userProfile?.email,
    course_title: enrollment.courses.title,
    course_description: enrollment.courses.description,
    instructor_name: enrollment.courses.profiles?.full_name || 'Instructor',
    completion_date: enrollment.completed_at,
    issue_date: certificate.issued_at
  };

  // Send notification
  await supabaseClient.from("notifications").insert({
    user_id: userId,
    title: "¡Certificado de finalización generado!",
    message: `Tu certificado de finalización para ${enrollment.courses.title} está listo`,
    type: 'success',
    action_url: `/certificates/${certificate.id}`,
    metadata: {
      certificate_id: certificate.id,
      certificate_number: certificateNumber,
      course_id: courseId
    }
  });

  logStep("Course completion certificate generated", { certificateId: certificate.id });

  return {
    success: true,
    certificate: certificateData,
    message: "Course completion certificate generated successfully"
  };
}

async function regenerateCertificate(supabaseClient: any, courseId: string, userId: string) {
  logStep("Regenerating certificate", { courseId, userId });

  // Find existing certificate
  const { data: existingCertificate } = await supabaseClient
    .from('certificates')
    .select('id')
    .eq('course_id', courseId)
    .eq('user_id', userId)
    .single();

  if (!existingCertificate) {
    throw new Error("No existing certificate found to regenerate");
  }

  // Delete old certificate
  await supabaseClient
    .from('certificates')
    .delete()
    .eq('id', existingCertificate.id);

  // Generate new certificate
  return await generateCertificateFromCourse(supabaseClient, courseId, userId);
}

async function validateCertificate(supabaseClient: any, requestData: any) {
  // Implementation for certificate validation by certificate number
  return {
    success: true,
    message: "Certificate validation feature to be implemented"
  };
}

async function listUserCertificates(supabaseClient: any, userId: string) {
  logStep("Listing user certificates", { userId });

  const { data: certificates, error } = await supabaseClient
    .from('certificates')
    .select(`
      id, certificate_number, score, issued_at,
      courses (
        id, title, description,
        profiles!instructor_id (full_name)
      ),
      exam_attempts (
        score, max_score, percentage
      )
    `)
    .eq('user_id', userId)
    .order('issued_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch certificates: ${error.message}`);
  }

  return {
    success: true,
    certificates: certificates || [],
    total: certificates?.length || 0
  };
}

async function generateCertificateNumber(): Promise<string> {
  // Generate unique certificate number
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `CERT-${timestamp}-${random}`;
}
