#!/usr/bin/env node

// Script para verificar que la configuración de build es correcta
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔍 Verificando configuración de build...\n');

// Verificar que existe el directorio dist
const distDir = path.join(__dirname, 'dist');
if (!fs.existsSync(distDir)) {
  console.error('❌ El directorio dist no existe. Ejecuta npm run build primero.');
  process.exit(1);
}

// Verificar que existe el archivo env-config.js en dist
const envConfigPath = path.join(distDir, 'env-config.js');
if (!fs.existsSync(envConfigPath)) {
  console.error('❌ El archivo env-config.js no existe en dist.');
  process.exit(1);
}

// Leer y verificar el contenido del archivo env-config.js
try {
  const envConfigContent = fs.readFileSync(envConfigPath, 'utf8');
  
  // Verificar que contiene las variables necesarias
  if (!envConfigContent.includes('VITE_SUPABASE_URL')) {
    console.error('❌ env-config.js no contiene VITE_SUPABASE_URL');
    process.exit(1);
  }
  
  if (!envConfigContent.includes('VITE_SUPABASE_ANON_KEY')) {
    console.error('❌ env-config.js no contiene VITE_SUPABASE_ANON_KEY');
    process.exit(1);
  }
  
  // Verificar que las variables no están vacías
  if (envConfigContent.includes('VITE_SUPABASE_URL: ""') || envConfigContent.includes('VITE_SUPABASE_URL: "undefined"')) {
    console.error('❌ VITE_SUPABASE_URL está vacía o es undefined');
    process.exit(1);
  }
  
  if (envConfigContent.includes('VITE_SUPABASE_ANON_KEY: ""') || envConfigContent.includes('VITE_SUPABASE_ANON_KEY: "undefined"')) {
    console.error('❌ VITE_SUPABASE_ANON_KEY está vacía o es undefined');
    process.exit(1);
  }
  
  console.log('✅ env-config.js existe y contiene las variables necesarias');
  
} catch (error) {
  console.error('❌ Error leyendo env-config.js:', error.message);
  process.exit(1);
}

// Verificar que existe el archivo index.html en dist
const indexHtmlPath = path.join(distDir, 'index.html');
if (!fs.existsSync(indexHtmlPath)) {
  console.error('❌ El archivo index.html no existe en dist.');
  process.exit(1);
}

// Verificar que index.html carga el env-config.js
try {
  const indexHtmlContent = fs.readFileSync(indexHtmlPath, 'utf8');
  
  if (!indexHtmlContent.includes('env-config.js')) {
    console.error('❌ index.html no carga el archivo env-config.js');
    process.exit(1);
  }
  
  console.log('✅ index.html carga correctamente env-config.js');
  
} catch (error) {
  console.error('❌ Error leyendo index.html:', error.message);
  process.exit(1);
}

// Mostrar información sobre los archivos
console.log('\n📊 Información de archivos:');
console.log(`📁 Directorio dist: ${distDir}`);
console.log(`📄 env-config.js: ${fs.statSync(envConfigPath).size} bytes`);
console.log(`📄 index.html: ${fs.statSync(indexHtmlPath).size} bytes`);

// Mostrar contenido del env-config.js (primeras líneas)
console.log('\n📝 Contenido de env-config.js (preview):');
const envContent = fs.readFileSync(envConfigPath, 'utf8').split('\n').slice(0, 5).join('\n');
console.log(envContent);

console.log('\n🎉 ¡Verificación completa! El build parece estar correcto.');
console.log('\n💡 Para desplegar:');
console.log('   1. Asegúrate de que tu servidor sirve archivos estáticos desde ./dist');
console.log('   2. Asegúrate de que env-config.js es accesible desde la raíz');
console.log('   3. Verifica que no hay restricciones CORS para cargar env-config.js');
