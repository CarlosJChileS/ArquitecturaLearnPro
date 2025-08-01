import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
}

interface ReportRequest {
  type: 'revenue' | 'enrollments' | 'user_activity' | 'course_performance' | 'instructor_metrics'
  period: 'daily' | 'weekly' | 'monthly' | 'yearly'
  start_date?: string
  end_date?: string
  course_ids?: string[]
  instructor_ids?: string[]
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Verificar autenticación
    const authHeader = req.headers.get('Authorization')!
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token)

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'No autorizado' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Verificar permisos (admin o instructor)
    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('role')
      .eq('user_id', user.id)
      .single()

    if (!profile || !['admin', 'instructor'].includes(profile.role)) {
      return new Response(
        JSON.stringify({ error: 'Acceso denegado' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (req.method === 'POST') {
      const { 
        type, 
        period, 
        start_date, 
        end_date,
        course_ids = [],
        instructor_ids = []
      }: ReportRequest = await req.json()

      // Configurar fechas por defecto
      const endDate = end_date ? new Date(end_date) : new Date()
      const startDate = start_date ? new Date(start_date) : (() => {
        const date = new Date()
        switch (period) {
          case 'daily': date.setDate(date.getDate() - 30); break
          case 'weekly': date.setDate(date.getDate() - 90); break
          case 'monthly': date.setMonth(date.getMonth() - 12); break
          case 'yearly': date.setFullYear(date.getFullYear() - 3); break
        }
        return date
      })()

      let reportData: any = {}

      // Generar reporte según el tipo
      switch (type) {
        case 'revenue':
          reportData = await generateRevenueReport(supabaseClient, { period, startDate, endDate, course_ids })
          break
        case 'enrollments':
          reportData = await generateEnrollmentsReport(supabaseClient, { period, startDate, endDate, course_ids })
          break
        case 'user_activity':
          reportData = await generateUserActivityReport(supabaseClient, { period, startDate, endDate })
          break
        case 'course_performance':
          reportData = await generateCoursePerformanceReport(supabaseClient, { startDate, endDate, course_ids })
          break
        case 'instructor_metrics':
          reportData = await generateInstructorMetricsReport(supabaseClient, { startDate, endDate, instructor_ids })
          break
        default:
          throw new Error('Tipo de reporte no válido')
      }

      // Guardar el reporte generado
      await supabaseClient
        .from('generated_reports')
        .insert({
          type,
          period,
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString(),
          generated_by: user.id,
          data: reportData,
          filters: { course_ids, instructor_ids }
        })

      return new Response(
        JSON.stringify({
          success: true,
          type,
          period,
          date_range: {
            start: startDate.toISOString(),
            end: endDate.toISOString()
          },
          data: reportData
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // GET: Listar reportes guardados
    if (req.method === 'GET') {
      const { data: reports, error } = await supabaseClient
        .from('generated_reports')
        .select(`
          *,
          profiles:generated_by(email)
        `)
        .order('created_at', { ascending: false })
        .limit(50)

      if (error) throw error

      return new Response(
        JSON.stringify({ reports }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

  } catch (error) {
    console.error('Error in advanced-reports:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

// Función para generar reporte de ingresos
async function generateRevenueReport(supabaseClient: any, params: any) {
  const { period, startDate, endDate, course_ids } = params
  
  let query = supabaseClient
    .from('payments')
    .select(`
      amount,
      created_at,
      status,
      subscriptions(
        course_id,
        courses(title)
      )
    `)
    .gte('created_at', startDate.toISOString())
    .lte('created_at', endDate.toISOString())
    .eq('status', 'completed')

  if (course_ids.length > 0) {
    query = query.in('subscriptions.course_id', course_ids)
  }

  const { data: payments, error } = await query

  if (error) throw error

  // Agrupar por período
  const grouped = groupByPeriod(payments, period, 'created_at')
  
  // Calcular métricas
  const totalRevenue = payments?.reduce((sum: number, p: any) => sum + p.amount, 0) || 0
  const averageOrderValue = payments?.length ? totalRevenue / payments.length : 0

  return {
    total_revenue: totalRevenue,
    total_transactions: payments?.length || 0,
    average_order_value: averageOrderValue,
    period_data: grouped,
    by_course: groupByCourse(payments)
  }
}

// Función para generar reporte de inscripciones
async function generateEnrollmentsReport(supabaseClient: any, params: any) {
  const { period, startDate, endDate, course_ids } = params
  
  let query = supabaseClient
    .from('course_enrollments')
    .select(`
      created_at,
      course_id,
      user_id,
      courses(title, price)
    `)
    .gte('created_at', startDate.toISOString())
    .lte('created_at', endDate.toISOString())

  if (course_ids.length > 0) {
    query = query.in('course_id', course_ids)
  }

  const { data: enrollments, error } = await query

  if (error) throw error

  const grouped = groupByPeriod(enrollments, period, 'created_at')

  return {
    total_enrollments: enrollments?.length || 0,
    period_data: grouped,
    by_course: groupByCourse(enrollments, 'course_id'),
    conversion_rate: await calculateConversionRate(supabaseClient, startDate, endDate)
  }
}

// Función para generar reporte de actividad de usuarios
async function generateUserActivityReport(supabaseClient: any, params: any) {
  const { period, startDate, endDate } = params
  
  const { data: sessions, error } = await supabaseClient
    .from('user_sessions')
    .select('created_at, user_id, duration')
    .gte('created_at', startDate.toISOString())
    .lte('created_at', endDate.toISOString())

  if (error) throw error

  const grouped = groupByPeriod(sessions, period, 'created_at')
  const averageSessionDuration = sessions?.reduce((sum: number, s: any) => sum + (s.duration || 0), 0) / (sessions?.length || 1)

  return {
    total_sessions: sessions?.length || 0,
    unique_users: new Set(sessions?.map((s: any) => s.user_id)).size,
    average_session_duration: averageSessionDuration,
    period_data: grouped
  }
}

// Función para generar reporte de rendimiento de cursos
async function generateCoursePerformanceReport(supabaseClient: any, params: any) {
  const { startDate, endDate, course_ids } = params
  
  let query = supabaseClient
    .from('courses')
    .select(`
      id,
      title,
      price,
      course_enrollments!inner(created_at),
      course_reviews(rating),
      lesson_progress(is_completed)
    `)

  if (course_ids.length > 0) {
    query = query.in('id', course_ids)
  }

  const { data: courses, error } = await query

  if (error) throw error

  return courses?.map((course: any) => ({
    course_id: course.id,
    title: course.title,
    price: course.price,
    enrollments: course.enrollments?.length || 0,
    average_rating: course.course_reviews?.reduce((sum: number, r: any) => sum + r.rating, 0) / (course.course_reviews?.length || 1),
    completion_rate: course.lesson_progress?.filter((p: any) => p.is_completed).length / (course.lesson_progress?.length || 1) * 100
  })) || []
}

// Función para generar métricas de instructores
async function generateInstructorMetricsReport(supabaseClient: any, params: any) {
  const { startDate, endDate, instructor_ids } = params
  
  let query = supabaseClient
    .from('profiles')
    .select(`
      id,
      email,
      full_name,
      courses!inner(
        id,
        title,
        course_enrollments(created_at),
        course_reviews(rating)
      )
    `)
    .eq('role', 'instructor')

  if (instructor_ids.length > 0) {
    query = query.in('id', instructor_ids)
  }

  const { data: instructors, error } = await query

  if (error) throw error

  return instructors?.map((instructor: any) => ({
    instructor_id: instructor.id,
    name: instructor.full_name,
    email: instructor.email,
    total_courses: instructor.courses?.length || 0,
    total_enrollments: instructor.courses?.reduce((sum: number, c: any) => sum + (c.enrollments?.length || 0), 0),
    average_rating: instructor.courses?.reduce((sum: number, c: any) => {
      const courseRating = c.course_reviews?.reduce((cSum: number, r: any) => cSum + r.rating, 0) / (c.course_reviews?.length || 1)
      return sum + courseRating
    }, 0) / (instructor.courses?.length || 1)
  })) || []
}

// Funciones auxiliares
function groupByPeriod(data: any[], period: string, dateField: string) {
  // Implementar agrupación por período
  return data?.reduce((acc: any, item: any) => {
    const date = new Date(item[dateField])
    let key = ''
    
    switch (period) {
      case 'daily':
        key = date.toISOString().split('T')[0]
        break
      case 'weekly':
        const week = Math.floor(date.getTime() / (7 * 24 * 60 * 60 * 1000))
        key = `week-${week}`
        break
      case 'monthly':
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
        break
      case 'yearly':
        key = String(date.getFullYear())
        break
    }
    
    if (!acc[key]) acc[key] = []
    acc[key].push(item)
    return acc
  }, {}) || {}
}

function groupByCourse(data: any[], courseField = 'courses') {
  return data?.reduce((acc: any, item: any) => {
    const courseTitle = item[courseField]?.title || 'Unknown'
    if (!acc[courseTitle]) acc[courseTitle] = 0
    acc[courseTitle]++
    return acc
  }, {}) || {}
}

async function calculateConversionRate(supabaseClient: any, startDate: Date, endDate: Date) {
  // Calcular tasa de conversión (simplificado)
  const { data: visitors } = await supabaseClient
    .from('page_views')
    .select('count')
    .gte('created_at', startDate.toISOString())
    .lte('created_at', endDate.toISOString())

  const { data: conversions } = await supabaseClient
    .from('course_enrollments')
    .select('count')
    .gte('created_at', startDate.toISOString())
    .lte('created_at', endDate.toISOString())

  const visitorCount = visitors?.length || 1
  const conversionCount = conversions?.length || 0

  return (conversionCount / visitorCount) * 100
}
