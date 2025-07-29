// Script de verificación del estado del MVP
// Ejecutar con: node verify-mvp.js

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://xfuhbjqqlgfxxkjvezhy.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhmdWhianFxbGdmeHhranZlemh5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwOTQ2MzgsImV4cCI6MjA2ODY3MDYzOH0.EFZFZyDF7eR1rkXCgZq-Q-B96I_H9XP1ulQsyzAyVOI';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function verifyMVP() {
  console.log('🔍 Verificando estado del MVP...\n');

  const checks = [
    {
      name: 'Conexión a Supabase',
      test: async () => {
        const { error } = await supabase.from('profiles').select('count').limit(1);
        return !error;
      }
    },
    {
      name: 'Tabla Categories',
      test: async () => {
        const { data, error } = await supabase.from('categories').select('*');
        return !error && data && data.length > 0;
      }
    },
    {
      name: 'Tabla Subscription Plans',
      test: async () => {
        const { data, error } = await supabase.from('subscription_plans').select('*');
        return !error && data;
      }
    },
    {
      name: 'Tabla Enrollments',
      test: async () => {
        const { error } = await supabase.from('enrollments').select('count').limit(1);
        return !error;
      }
    },
    {
      name: 'Tabla Lesson Progress',
      test: async () => {
        const { error } = await supabase.from('lesson_progress').select('count').limit(1);
        return !error;
      }
    }
  ];

  let passed = 0;
  let total = checks.length;

  for (const check of checks) {
    try {
      const result = await check.test();
      const status = result ? '✅' : '❌';
      console.log(`${status} ${check.name}`);
      if (result) passed++;
    } catch (error) {
      console.log(`❌ ${check.name} - Error: ${error.message}`);
    }
  }

  console.log(`\n📊 Resultado: ${passed}/${total} verificaciones pasadas`);
  
  if (passed === total) {
    console.log('🎉 ¡MVP configurado correctamente!');
    console.log('\n🚀 Tu aplicación está lista para desarrollo universitario');
    console.log('🌐 URL: http://localhost:8081/');
    console.log('👤 Admin: admin@test.com / admin123');
  } else {
    console.log('⚠️  Algunas verificaciones fallaron. Revisa la configuración.');
  }
}

verifyMVP().catch(console.error);
