// Script de configuración rápida para MVP Universitario
// Ejecutar en la consola del navegador en Supabase Dashboard

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Función para verificar conexión
async function testConnection() {
  try {
    const { data, error } = await supabase.from('profiles').select('count');
    if (error) {
      console.error('Error de conexión:', error);
      return false;
    }
    console.log('✅ Conexión exitosa a Supabase');
    return true;
  } catch (error) {
    console.error('❌ Error de conexión:', error);
    return false;
  }
}

// Función para crear datos de prueba
async function createTestData() {
  console.log('🔄 Creando datos de prueba...');
  
  // Crear categorías básicas
  const categories = [
    { name: 'Programación', description: 'Cursos de programación', icon: '💻' },
    { name: 'Diseño', description: 'Cursos de diseño', icon: '🎨' },
    { name: 'Marketing', description: 'Cursos de marketing', icon: '📈' }
  ];
  
  for (const category of categories) {
    await supabase.from('categories').upsert(category);
  }
  
  // Crear curso de ejemplo
  const testCourse = {
    title: 'Curso de Prueba MVP',
    description: 'Un curso de ejemplo para el MVP',
    instructor_id: '00000000-0000-0000-0000-000000000001',
    category: 'Programación',
    level: 'beginner',
    published: true,
    featured: true,
    price: 0,
    duration_hours: 2
  };
  
  await supabase.from('courses').upsert(testCourse);
  
  console.log('✅ Datos de prueba creados');
}

// Función principal de configuración
async function setupMVP() {
  console.log('🚀 Configurando MVP para Universidad...');
  
  if (await testConnection()) {
    await createTestData();
    console.log('🎉 MVP configurado exitosamente!');
    console.log('📝 Credenciales de prueba:');
    console.log('   Email: admin@test.com');
    console.log('   Password: admin123');
  }
}

// Ejecutar configuración
setupMVP();
