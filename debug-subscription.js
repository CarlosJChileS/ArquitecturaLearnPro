// Script para diagnosticar el estado de suscripción
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'http://localhost:54321'
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'tu-anon-key-local'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function debugSubscription() {
  try {
    console.log('=== DIAGNÓSTICO DE SUSCRIPCIÓN ===')
    
    // 1. Verificar si hay planes en la base de datos
    console.log('\n1. Verificando planes de suscripción...')
    const { data: plans, error: plansError } = await supabase
      .from('subscription_plans')
      .select('*')
    
    if (plansError) {
      console.error('Error obteniendo planes:', plansError)
    } else {
      console.log('Planes encontrados:', plans?.length || 0)
      plans?.forEach(plan => {
        console.log(`  - ${plan.name}: $${plan.price} (${plan.duration_months} meses)`)
      })
    }
    
    // 2. Verificar autenticación (necesita usuario logueado)
    console.log('\n2. Verificando autenticación...')
    const { data: { session } } = await supabase.auth.getSession()
    if (session) {
      console.log('Usuario autenticado:', session.user.email)
    } else {
      console.log('No hay usuario autenticado')
    }
    
    // 3. Si hay usuario, verificar su suscripción
    if (session) {
      console.log('\n3. Verificando suscripción del usuario...')
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('subscription_tier, subscription_end, subscribed')
        .eq('id', session.user.id)
        .single()
      
      if (profileError) {
        console.error('Error obteniendo perfil:', profileError)
      } else {
        console.log('Estado de suscripción:', profile)
      }
    }
    
  } catch (error) {
    console.error('Error en diagnóstico:', error)
  }
}

debugSubscription()
