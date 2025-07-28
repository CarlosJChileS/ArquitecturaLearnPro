// Script para arreglar el perfil de administrador
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://xfuhbjqqlgfxxkjvezhy.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhmdWhianFxbGdmeHhranZlemh5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzA5NDYzOCwiZXhwIjoyMDY4NjcwNjM4fQ.NJtdJqU5bvjyGe12vmR4CTkcTcgZwmGMB3fizEBv4pE'

// Crear cliente con service role para operaciones administrativas
const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function fixAdminProfile() {
  try {
    console.log('🔧 Iniciando reparación del perfil de administrador...')
    
    // 1. Verificar si el usuario admin existe en auth.users
    console.log('1. Verificando usuario admin en auth.users...')
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers()
    
    if (authError) {
      console.error('Error obteniendo usuarios:', authError)
      return
    }
    
    const adminUser = authUsers.users.find(u => u.email === 'carlosjchiles@gmail.com')
    
    if (!adminUser) {
      console.log('❌ Usuario admin no encontrado en auth.users')
      console.log('Necesitas crear el usuario primero en Supabase Auth')
      return
    }
    
    console.log('✅ Usuario admin encontrado:', adminUser.id)
    
    // 2. Verificar si existe el perfil
    console.log('2. Verificando perfil existente...')
    const { data: existingProfile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', adminUser.id)
      .single()
    
    if (profileError && profileError.code !== 'PGRST116') {
      console.error('Error verificando perfil:', profileError)
    }
    
    // 3. Crear o actualizar el perfil de admin
    if (!existingProfile) {
      console.log('3. Creando nuevo perfil de admin...')
      const { data: newProfile, error: createError } = await supabase
        .from('profiles')
        .insert({
          user_id: adminUser.id,
          full_name: 'Carlos J. Chile S.',
          email: adminUser.email,
          role: 'admin',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single()
      
      if (createError) {
        console.error('❌ Error creando perfil:', createError)
        return
      }
      
      console.log('✅ Perfil de admin creado:', newProfile)
    } else {
      console.log('3. Actualizando perfil existente...')
      const { data: updatedProfile, error: updateError } = await supabase
        .from('profiles')
        .update({
          role: 'admin',
          full_name: 'Carlos J. Chile S.',
          updated_at: new Date().toISOString()
        })
        .eq('user_id', adminUser.id)
        .select()
        .single()
      
      if (updateError) {
        console.error('❌ Error actualizando perfil:', updateError)
        return
      }
      
      console.log('✅ Perfil de admin actualizado:', updatedProfile)
    }
    
    // 4. Verificar el resultado final
    console.log('4. Verificación final...')
    const { data: finalProfile, error: finalError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', adminUser.id)
      .single()
    
    if (finalError) {
      console.error('❌ Error en verificación final:', finalError)
      return
    }
    
    console.log('✅ Perfil final verificado:')
    console.log('- ID:', finalProfile.id)
    console.log('- Email:', finalProfile.email)
    console.log('- Nombre:', finalProfile.full_name)
    console.log('- Rol:', finalProfile.role)
    console.log('- Creado:', finalProfile.created_at)
    
    console.log('🎉 ¡Reparación completada! El admin debería poder hacer login ahora.')
    
  } catch (error) {
    console.error('💥 Error inesperado:', error)
  }
}

// Ejecutar la función
fixAdminProfile()
