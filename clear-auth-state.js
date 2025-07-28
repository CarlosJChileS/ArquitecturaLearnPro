// Script para limpiar el estado de autenticación
// Ejecutar en la consola del navegador si hay problemas de sesión

console.log('🧹 Limpiando estado de autenticación...');

// Limpiar localStorage
const keysToRemove = [];
for (let i = 0; i < localStorage.length; i++) {
  const key = localStorage.key(i);
  if (key && (key.includes('supabase') || key.includes('auth') || key.includes('session'))) {
    keysToRemove.push(key);
  }
}

keysToRemove.forEach(key => {
  localStorage.removeItem(key);
  console.log('🗑️ Eliminado:', key);
});

// Limpiar sessionStorage
const sessionKeysToRemove = [];
for (let i = 0; i < sessionStorage.length; i++) {
  const key = sessionStorage.key(i);
  if (key && (key.includes('supabase') || key.includes('auth') || key.includes('session'))) {
    sessionKeysToRemove.push(key);
  }
}

sessionKeysToRemove.forEach(key => {
  sessionStorage.removeItem(key);
  console.log('🗑️ Eliminado (session):', key);
});

console.log('✅ Estado limpio. Recarga la página y prueba el login nuevamente.');
