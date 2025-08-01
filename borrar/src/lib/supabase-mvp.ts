import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Cliente simplificado para MVP
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  // Configuración simplificada para desarrollo
  realtime: {
    params: {
      eventsPerSecond: 2
    }
  }
});

// Funciones helper simplificadas para el MVP
export const mvpHelpers = {
  // Insertar datos sin verificar políticas
  async insertData(table: string, data: any) {
    const { data: result, error } = await supabase
      .from(table)
      .insert(data)
      .select();
    
    if (error) {
      console.error(`Error inserting into ${table}:`, error);
      return { success: false, error };
    }
    
    return { success: true, data: result };
  },

  // Obtener datos sin restricciones
  async getData(table: string, filters?: any) {
    let query = supabase.from(table).select('*');
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        query = query.eq(key, value);
      });
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error(`Error getting data from ${table}:`, error);
      return { success: false, error };
    }
    
    return { success: true, data };
  },

  // Actualizar datos fácilmente
  async updateData(table: string, id: string, updates: any) {
    const { data, error } = await supabase
      .from(table)
      .update(updates)
      .eq('id', id)
      .select();
    
    if (error) {
      console.error(`Error updating ${table}:`, error);
      return { success: false, error };
    }
    
    return { success: true, data };
  },

  // Eliminar datos
  async deleteData(table: string, id: string) {
    const { error } = await supabase
      .from(table)
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error(`Error deleting from ${table}:`, error);
      return { success: false, error };
    }
    
    return { success: true };
  },

  // Registro simplificado
  async simpleSignUp(email: string, password: string, fullName?: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName || email.split('@')[0]
        }
      }
    });
    
    return { data, error };
  },

  // Login simplificado
  async simpleSignIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    return { data, error };
  },

  // Obtener usuario actual
  async getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      // Obtener perfil completo
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      return { user, profile };
    }
    
    return { user: null, profile: null };
  },

  // Crear admin de prueba (solo para MVP)
  async createTestAdmin() {
    const adminData = {
      email: 'admin@test.com',
      password: 'admin123',
      fullName: 'Administrador MVP'
    };
    
    const { data, error } = await this.simpleSignUp(
      adminData.email, 
      adminData.password, 
      adminData.fullName
    );
    
    if (!error && data.user) {
      // Actualizar role a admin
      await this.updateData('profiles', data.user.id, { role: 'admin' });
    }
    
    return { data, error };
  }
};

// Export por defecto
export default supabase;
