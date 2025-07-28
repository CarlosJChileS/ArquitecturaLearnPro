import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE',
}

interface BackupRequest {
  tables?: string[]
  include_auth?: boolean
  format?: 'json' | 'csv'
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

    // Verificar autenticación y rol de administrador
    const authHeader = req.headers.get('Authorization')!
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token)

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'No autorizado' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Verificar si es administrador
    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      return new Response(
        JSON.stringify({ error: 'Acceso denegado. Solo administradores pueden hacer backups.' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (req.method === 'POST') {
      const { tables = [], include_auth = false, format = 'json' }: BackupRequest = await req.json()

      const defaultTables = [
        'profiles',
        'courses',
        'lessons',
        'enrollments',
        'lesson_progress',
        'certificates',
        'exam_questions',
        'exam_answers',
        'user_exam_attempts',
        'course_reviews',
        'subscriptions',
        'payments'
      ]

      const tablesToBackup = tables.length > 0 ? tables : defaultTables
      const backupData: Record<string, any> = {}

      // Realizar backup de cada tabla
      for (const table of tablesToBackup) {
        try {
          const { data, error } = await supabaseClient
            .from(table)
            .select('*')

          if (error) {
            console.error(`Error backing up table ${table}:`, error)
            continue
          }

          backupData[table] = data
        } catch (err) {
          console.error(`Error accessing table ${table}:`, err)
        }
      }

      // Incluir datos de autenticación si se solicita
      if (include_auth) {
        try {
          const { data: authUsers, error: authError } = await supabaseClient.auth.admin.listUsers()
          if (!authError) {
            backupData.auth_users = authUsers
          }
        } catch (err) {
          console.error('Error backing up auth users:', err)
        }
      }

      // Agregar metadatos del backup
      const backupMetadata = {
        created_at: new Date().toISOString(),
        created_by: user.id,
        tables_included: tablesToBackup,
        include_auth,
        format,
        version: '1.0'
      }

      const response = {
        metadata: backupMetadata,
        data: backupData
      }

      // Generar respuesta según el formato
      if (format === 'csv') {
        // Para CSV, convertir cada tabla a CSV
        let csvContent = ''
        for (const [tableName, tableData] of Object.entries(backupData)) {
          if (Array.isArray(tableData) && tableData.length > 0) {
            csvContent += `\n\n=== ${tableName.toUpperCase()} ===\n`
            const headers = Object.keys(tableData[0]).join(',')
            csvContent += headers + '\n'
            
            for (const row of tableData) {
              const values = Object.values(row).map(val => 
                typeof val === 'string' ? `"${val.replace(/"/g, '""')}"` : val
              ).join(',')
              csvContent += values + '\n'
            }
          }
        }

        return new Response(csvContent, {
          status: 200,
          headers: {
            ...corsHeaders,
            'Content-Type': 'text/csv',
            'Content-Disposition': `attachment; filename="backup_${new Date().toISOString().split('T')[0]}.csv"`
          }
        })
      }

      // Registrar el backup en la base de datos
      await supabaseClient
        .from('system_backups')
        .insert({
          created_by: user.id,
          tables_included: tablesToBackup,
          include_auth,
          format,
          status: 'completed'
        })

      return new Response(
        JSON.stringify(response),
        {
          status: 200,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
            'Content-Disposition': `attachment; filename="backup_${new Date().toISOString().split('T')[0]}.json"`
          }
        }
      )
    }

    // GET: Listar backups anteriores
    if (req.method === 'GET') {
      const { data: backups, error } = await supabaseClient
        .from('system_backups')
        .select(`
          *,
          profiles:created_by(email)
        `)
        .order('created_at', { ascending: false })
        .limit(50)

      if (error) {
        throw error
      }

      return new Response(
        JSON.stringify({ backups }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

  } catch (error) {
    console.error('Error in backup-system:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
