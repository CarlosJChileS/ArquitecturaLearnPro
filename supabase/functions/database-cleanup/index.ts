import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE',
}

interface CleanupRequest {
  type: 'expired_certificates' | 'old_sessions' | 'orphaned_files' | 'inactive_users' | 'all'
  days_old?: number
  dry_run?: boolean
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
      .eq('user_id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      return new Response(
        JSON.stringify({ error: 'Acceso denegado. Solo administradores pueden ejecutar limpieza.' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (req.method === 'POST') {
      const { type, days_old = 30, dry_run = false }: CleanupRequest = await req.json()

      const cleanupResults = {
        expired_certificates: 0,
        old_sessions: 0,
        orphaned_files: 0,
        inactive_users: 0,
        errors: [] as string[]
      }

      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - days_old)

      // Limpiar certificados expirados
      if (type === 'expired_certificates' || type === 'all') {
        try {
          const query = supabaseClient
            .from('certificates')
            .select('id')
            .lt('expires_at', cutoffDate.toISOString())

          if (!dry_run) {
            const { error } = await supabaseClient
              .from('certificates')
              .delete()
              .lt('expires_at', cutoffDate.toISOString())
            
            if (error) throw error
          }

          const { data, error } = await query
          if (!error) {
            cleanupResults.expired_certificates = data?.length || 0
          }
        } catch (err) {
          cleanupResults.errors.push(`Error limpiando certificados: ${err.message}`)
        }
      }

      // Limpiar sesiones antiguas
      if (type === 'old_sessions' || type === 'all') {
        try {
          const query = supabaseClient
            .from('user_sessions')
            .select('id')
            .lt('last_activity', cutoffDate.toISOString())

          if (!dry_run) {
            const { error } = await supabaseClient
              .from('user_sessions')
              .delete()
              .lt('last_activity', cutoffDate.toISOString())
            
            if (error) throw error
          }

          const { data, error } = await query
          if (!error) {
            cleanupResults.old_sessions = data?.length || 0
          }
        } catch (err) {
          cleanupResults.errors.push(`Error limpiando sesiones: ${err.message}`)
        }
      }

      // Limpiar archivos huérfanos
      if (type === 'orphaned_files' || type === 'all') {
        try {
          // Obtener todos los archivos en storage
          const { data: files, error: filesError } = await supabaseClient.storage
            .from('course-materials')
            .list()

          if (filesError) throw filesError

          let orphanedCount = 0
          for (const file of files || []) {
            // Verificar si el archivo está referenciado en la base de datos
            const { data: referenced } = await supabaseClient
              .from('lessons')
              .select('id')
              .like('content', `%${file.name}%`)
              .limit(1)

            if (!referenced || referenced.length === 0) {
              if (!dry_run) {
                await supabaseClient.storage
                  .from('course-materials')
                  .remove([file.name])
              }
              orphanedCount++
            }
          }

          cleanupResults.orphaned_files = orphanedCount
        } catch (err) {
          cleanupResults.errors.push(`Error limpiando archivos: ${err.message}`)
        }
      }

      // Limpiar usuarios inactivos
      if (type === 'inactive_users' || type === 'all') {
        try {
          const { data: inactiveUsers, error } = await supabaseClient
            .from('profiles')
            .select('id')
            .lt('last_login', cutoffDate.toISOString())
            .eq('role', 'student')

          if (error) throw error

          if (!dry_run && inactiveUsers) {
            // Marcar como inactivos en lugar de eliminar completamente
            const { error: updateError } = await supabaseClient
              .from('profiles')
              .update({ status: 'inactive' })
              .in('id', inactiveUsers.map(u => u.id))

            if (updateError) throw updateError
          }

          cleanupResults.inactive_users = inactiveUsers?.length || 0
        } catch (err) {
          cleanupResults.errors.push(`Error procesando usuarios inactivos: ${err.message}`)
        }
      }

      // Registrar la operación de limpieza
      if (!dry_run) {
        await supabaseClient
          .from('system_maintenance')
          .insert({
            type: 'cleanup',
            performed_by: user.id,
            details: {
              cleanup_type: type,
              days_old,
              results: cleanupResults
            },
            status: cleanupResults.errors.length > 0 ? 'completed_with_errors' : 'completed'
          })
      }

      return new Response(
        JSON.stringify({
          success: true,
          dry_run,
          cleanup_type: type,
          days_old,
          results: cleanupResults
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ error: 'Método no permitido' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in database-cleanup:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
