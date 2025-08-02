#!/usr/bin/env node

// Script para generar configuración de entorno para producción
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Obtener variables de entorno con fallbacks
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://xfuhbjqqlgfxxkjvezhy.supabase.co';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhmdWhianFxbGdmeHhranZlemh5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwOTQ2MzgsImV4cCI6MjA2ODY3MDYzOH0.EFZFZyDF7eR1rkXCgZq-Q-B96I_H9XP1ulQsyzAyVOI';

// Validar que las variables no están vacías
if (!supabaseUrl || supabaseUrl === 'undefined') {
  console.warn('⚠️  VITE_SUPABASE_URL not found, using fallback');
}

if (!supabaseAnonKey || supabaseAnonKey === 'undefined') {
  console.warn('⚠️  VITE_SUPABASE_ANON_KEY not found, using fallback');
}

const envConfig = `// Configuración de variables de entorno para producción
// Generated on ${new Date().toISOString()}
window.ENV = {
  VITE_SUPABASE_URL: "${supabaseUrl}",
  VITE_SUPABASE_ANON_KEY: "${supabaseAnonKey}"
};

// Debug info (remove in production)
console.log('🔧 Environment configuration loaded:', {
  supabaseUrl: "${supabaseUrl}",
  hasAnonKey: ${!!supabaseAnonKey}
});`;

// Escribir al directorio dist
const distDir = path.join(__dirname, 'dist');
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

// Escribir también al directorio public (para desarrollo)
const publicPath = path.join(__dirname, 'public', 'env-config.js');
fs.writeFileSync(publicPath, envConfig);

// Escribir al directorio dist (para producción)
const envPath = path.join(distDir, 'env-config.js');
fs.writeFileSync(envPath, envConfig);

console.log('✅ Environment configuration generated successfully');
console.log(`📁 Files created:`);
console.log(`   - ${publicPath}`);
console.log(`   - ${envPath}`);
console.log(`🔧 Supabase URL: ${supabaseUrl}`);
console.log(`🔑 Anon Key: ${supabaseAnonKey.substring(0, 20)}...`);
