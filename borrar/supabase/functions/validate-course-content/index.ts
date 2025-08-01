import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type"
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[VALIDATE-COURSE-CONTENT] ${step}${detailsStr}`);
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
    logStep("Validation request received", {
      courseId: requestData.courseId,
      action: requestData.action,
      level: requestData.validationLevel
    });

    // Verify user has access to this course
    const { data: course, error: courseError } = await supabaseClient
      .from('courses')
      .select('id, instructor_id, title, description, is_published')
      .eq('id', requestData.courseId)
      .single();

    if (courseError || !course) {
      throw new Error("Course not found");
    }

    // Check permissions
    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    const isAdmin = profile?.role === 'admin';
    const isOwner = course.instructor_id === user.id;

    if (!isAdmin && !isOwner) {
      throw new Error("Unauthorized: You can only validate your own courses");
    }

    let result;

    switch (requestData.action) {
      case 'validate':
        result = await validateCourseContent(supabaseClient, requestData.courseId, requestData.validationLevel);
        break;
      case 'auto_fix':
        result = await autoFixCourseIssues(supabaseClient, requestData.courseId);
        break;
      case 'publish_check':
        result = await checkPublishReadiness(supabaseClient, requestData.courseId);
        break;
      default:
        throw new Error(`Unknown action: ${requestData.action}`);
    }

    // Log validation results
    await supabaseClient.from("student_analytics").insert({
      user_id: user.id,
      course_id: requestData.courseId,
      event_type: 'course_validation',
      event_data: {
        action: requestData.action,
        validation_level: requestData.validationLevel,
        score: result.score,
        issues_count: result.issues.length,
        warnings_count: result.warnings.length,
        ready_for_publish: result.readyForPublish
      }
    });

    logStep("Validation completed", { 
      score: result.score, 
      issues: result.issues.length, 
      readyForPublish: result.readyForPublish 
    });

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    logStep("ERROR in validate-course-content", { message: error.message });
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});

async function validateCourseContent(supabaseClient: any, courseId: string, level: string) {
  logStep("Starting course validation", { courseId, level });

  const issues: any[] = [];
  const warnings: any[] = [];
  const suggestions: any[] = [];

  // Get course data
  const { data: course } = await supabaseClient
    .from('courses')
    .select('*')
    .eq('id', courseId)
    .single();

  // Get lessons
  const { data: lessons } = await supabaseClient
    .from('lessons')
    .select('*')
    .eq('course_id', courseId)
    .order('order_index');

  // Get exams if any
  const { data: exams } = await supabaseClient
    .from('exams')
    .select('*, exam_questions(*)')
    .eq('course_id', courseId);

  // Basic validations
  await validateBasicContent(course, lessons, issues, warnings, suggestions);

  if (level === 'comprehensive' || level === 'publish_ready') {
    await validateComprehensiveContent(course, lessons, exams, issues, warnings, suggestions);
  }

  if (level === 'publish_ready') {
    await validatePublishReadiness(course, lessons, exams, issues, warnings, suggestions);
  }

  // Calculate score
  const score = calculateValidationScore(issues, warnings, suggestions);
  const readyForPublish = issues.length === 0 && score >= 80;

  return {
    valid: issues.length === 0,
    score: score,
    issues: issues,
    warnings: warnings,
    suggestions: suggestions,
    readyForPublish: readyForPublish
  };
}

async function validateBasicContent(course: any, lessons: any[], issues: any[], warnings: any[], suggestions: any[]) {
  // Course title validation
  if (!course.title || course.title.trim().length < 3) {
    issues.push({
      type: 'error',
      category: 'metadata',
      description: 'El título del curso debe tener al menos 3 caracteres',
      location: 'course.title',
      severity: 'critical',
      autoFixable: false
    });
  }

  // Course description validation
  if (!course.description || course.description.trim().length < 50) {
    issues.push({
      type: 'error',
      category: 'metadata',
      description: 'La descripción del curso debe tener al menos 50 caracteres',
      location: 'course.description',
      severity: 'high',
      autoFixable: false
    });
  }

  // Thumbnail validation
  if (!course.thumbnail_url) {
    warnings.push({
      type: 'warning',
      category: 'metadata',
      description: 'Se recomienda agregar una imagen de portada al curso',
      location: 'course.thumbnail_url',
      severity: 'medium',
      autoFixable: false
    });
  }

  // Lessons validation
  if (!lessons || lessons.length === 0) {
    issues.push({
      type: 'error',
      category: 'content',
      description: 'El curso debe tener al menos una lección',
      location: 'lessons',
      severity: 'critical',
      autoFixable: false
    });
  } else {
    // Validate individual lessons
    lessons.forEach((lesson, index) => {
      if (!lesson.title || lesson.title.trim().length < 3) {
        issues.push({
          type: 'error',
          category: 'content',
          description: `La lección ${index + 1} debe tener un título válido`,
          location: `lessons[${index}].title`,
          severity: 'high',
          autoFixable: false
        });
      }

      if (!lesson.content_url && !lesson.video_url) {
        issues.push({
          type: 'error',
          category: 'content',
          description: `La lección "${lesson.title}" debe tener contenido (video o material)`,
          location: `lessons[${index}].content`,
          severity: 'high',
          autoFixable: false
        });
      }

      if (lesson.duration_minutes === 0 || lesson.duration_minutes === null) {
        warnings.push({
          type: 'warning',
          category: 'content',
          description: `La lección "${lesson.title}" no tiene duración especificada`,
          location: `lessons[${index}].duration`,
          severity: 'medium',
          autoFixable: true
        });
      }
    });

    // Check lesson order
    const orderIndexes = lessons.map(l => l.order_index).sort((a, b) => a - b);
    const expectedIndexes = Array.from({ length: lessons.length }, (_, i) => i);
    
    if (!orderIndexes.every((val, i) => val === expectedIndexes[i])) {
      warnings.push({
        type: 'warning',
        category: 'structure',
        description: 'El orden de las lecciones no es secuencial',
        location: 'lessons.order_index',
        severity: 'medium',
        autoFixable: true
      });
    }
  }

  // Category validation
  if (!course.category_id) {
    warnings.push({
      type: 'warning',
      category: 'metadata',
      description: 'Se recomienda asignar una categoría al curso',
      location: 'course.category_id',
      severity: 'medium',
      autoFixable: false
    });
  }

  // Price validation
  if (course.price && course.price < 0) {
    issues.push({
      type: 'error',
      category: 'metadata',
      description: 'El precio del curso no puede ser negativo',
      location: 'course.price',
      severity: 'high',
      autoFixable: true
    });
  }
}

async function validateComprehensiveContent(course: any, lessons: any[], exams: any[], issues: any[], warnings: any[], suggestions: any[]) {
  // SEO validations
  if (course.title && course.title.length > 60) {
    suggestions.push({
      type: 'suggestion',
      category: 'seo',
      description: 'El título es muy largo para SEO (máximo 60 caracteres recomendado)',
      location: 'course.title',
      severity: 'low',
      autoFixable: false
    });
  }

  if (course.description && course.description.length > 160) {
    suggestions.push({
      type: 'suggestion',
      category: 'seo', 
      description: 'La descripción es muy larga para meta descripción (máximo 160 caracteres)',
      location: 'course.description',
      severity: 'low',
      autoFixable: false
    });
  }

  // Content structure validation
  const totalDuration = lessons.reduce((sum, lesson) => sum + (lesson.duration_minutes || 0), 0);
  
  if (totalDuration < 30) {
    warnings.push({
      type: 'warning',
      category: 'content',
      description: 'El curso es muy corto (menos de 30 minutos total)',
      location: 'course.duration',
      severity: 'medium',
      autoFixable: false
    });
  }

  if (totalDuration > 600) {
    suggestions.push({
      type: 'suggestion',
      category: 'content',
      description: 'El curso es muy largo, considera dividirlo en módulos',
      location: 'course.duration',
      severity: 'low',
      autoFixable: false
    });
  }

  // Exam validations
  if (course.has_final_exam && exams && exams.length > 0) {
    const exam = exams[0];
    
    if (!exam.exam_questions || exam.exam_questions.length < 5) {
      warnings.push({
        type: 'warning',
        category: 'content',
        description: 'El examen final debe tener al menos 5 preguntas',
        location: 'exam.questions',
        severity: 'medium',
        autoFixable: false
      });
    }

    if (exam.passing_score < 60) {
      suggestions.push({
        type: 'suggestion',
        category: 'content',
        description: 'Se recomienda un puntaje mínimo de aprobación del 60%',
        location: 'exam.passing_score',
        severity: 'low',
        autoFixable: true
      });
    }
  }

  // Accessibility checks
  lessons.forEach((lesson, index) => {
    if (lesson.video_url && !lesson.description) {
      suggestions.push({
        type: 'suggestion',
        category: 'accessibility',
        description: `Agregar descripción a la lección "${lesson.title}" para mejor accesibilidad`,
        location: `lessons[${index}].description`,
        severity: 'low',
        autoFixable: false
      });
    }
  });
}

async function validatePublishReadiness(course: any, lessons: any[], exams: any[], issues: any[], warnings: any[], suggestions: any[]) {
  // All lessons must have content
  lessons.forEach((lesson, index) => {
    if (!lesson.video_url && !lesson.content_url) {
      issues.push({
        type: 'error',
        category: 'content',
        description: `La lección "${lesson.title}" necesita contenido antes de publicar`,
        location: `lessons[${index}].content`,
        severity: 'critical',
        autoFixable: false
      });
    }
  });

  // Course must have thumbnail for publishing
  if (!course.thumbnail_url) {
    issues.push({
      type: 'error',
      category: 'metadata',
      description: 'Se requiere imagen de portada para publicar el curso',
      location: 'course.thumbnail_url',
      severity: 'critical',
      autoFixable: false
    });
  }

  // Level must be set
  if (!course.level) {
    issues.push({
      type: 'error',
      category: 'metadata',
      description: 'Se debe especificar el nivel del curso (principiante, intermedio, avanzado)',
      location: 'course.level',
      severity: 'high',
      autoFixable: true
    });
  }

  // Duration should be calculated
  if (!course.duration_hours || course.duration_hours === 0) {
    warnings.push({
      type: 'warning',
      category: 'metadata',
      description: 'La duración total del curso debe estar calculada',
      location: 'course.duration_hours',
      severity: 'medium',
      autoFixable: true
    });
  }
}

async function autoFixCourseIssues(supabaseClient: any, courseId: string) {
  logStep("Starting auto-fix", { courseId });

  // First validate to get current issues
  const validation = await validateCourseContent(supabaseClient, courseId, 'comprehensive');

  // Filter auto-fixable issues
  const fixableIssues = [...validation.issues, ...validation.warnings, ...validation.suggestions]
    .filter(issue => issue.autoFixable);

  let fixedCount = 0;

  for (const issue of fixableIssues) {
    try {
      await applyAutoFix(supabaseClient, courseId, issue);
      fixedCount++;
      logStep("Auto-fix applied", { issue: issue.description });
    } catch (error) {
      logStep("Auto-fix failed", { issue: issue.description, error: error.message });
    }
  }

  // Re-validate after fixes
  const newValidation = await validateCourseContent(supabaseClient, courseId, 'comprehensive');

  logStep("Auto-fix completed", { fixedCount, remainingIssues: newValidation.issues.length });

  return {
    ...newValidation,
    suggestions: [
      {
        type: 'suggestion',
        category: 'content',
        description: `Se aplicaron ${fixedCount} correcciones automáticas`,
        severity: 'low',
        autoFixable: false
      },
      ...newValidation.suggestions
    ]
  };
}

async function applyAutoFix(supabaseClient: any, courseId: string, issue: any) {
  // Apply specific fixes based on issue location and type
  if (issue.location === 'course.price' && issue.description.includes('negativo')) {
    await supabaseClient
      .from('courses')
      .update({ price: 0 })
      .eq('id', courseId);
  }

  if (issue.location === 'course.level') {
    await supabaseClient
      .from('courses')
      .update({ level: 'beginner' })
      .eq('id', courseId);
  }

  if (issue.location === 'course.duration_hours') {
    // Calculate total duration from lessons
    const { data: lessons } = await supabaseClient
      .from('lessons')
      .select('duration_minutes')
      .eq('course_id', courseId);

    const totalMinutes = lessons?.reduce((sum, lesson) => sum + (lesson.duration_minutes || 0), 0) || 0;
    const totalHours = Math.ceil(totalMinutes / 60);

    await supabaseClient
      .from('courses')
      .update({ duration_hours: totalHours })
      .eq('id', courseId);
  }

  if (issue.location === 'lessons.order_index') {
    // Fix lesson ordering
    const { data: lessons } = await supabaseClient
      .from('lessons')
      .select('id')
      .eq('course_id', courseId)
      .order('created_at');

    if (lessons) {
      for (let i = 0; i < lessons.length; i++) {
        await supabaseClient
          .from('lessons')
          .update({ order_index: i })
          .eq('id', lessons[i].id);
      }
    }
  }
}

async function checkPublishReadiness(supabaseClient: any, courseId: string) {
  return await validateCourseContent(supabaseClient, courseId, 'publish_ready');
}

function calculateValidationScore(issues: any[], warnings: any[], suggestions: any[]): number {
  let score = 100;

  // Deduct points for issues
  issues.forEach(issue => {
    switch (issue.severity) {
      case 'critical':
        score -= 25;
        break;
      case 'high':
        score -= 15;
        break;
      case 'medium':
        score -= 10;
        break;
      case 'low':
        score -= 5;
        break;
    }
  });

  // Deduct fewer points for warnings
  warnings.forEach(warning => {
    switch (warning.severity) {
      case 'high':
        score -= 5;
        break;
      case 'medium':
        score -= 3;
        break;
      case 'low':
        score -= 1;
        break;
    }
  });

  // Suggestions don't affect score but could give bonus points for completeness
  return Math.max(0, score);
}
