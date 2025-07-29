#!/bin/sh

# Script para inyectar variables de entorno en tiempo de ejecución
# Esto permite configurar variables sin reconstruir la imagen

# Crear archivo de configuración JavaScript con las variables de entorno
cat <<EOF > /usr/share/nginx/html/env-config.js
window.ENV = {
  // Supabase Configuration (SOLO claves públicas)
  VITE_SUPABASE_URL: "${VITE_SUPABASE_URL}",
  VITE_SUPABASE_ANON_KEY: "${VITE_SUPABASE_ANON_KEY}",
  
  // Stripe Configuration (SOLO clave pública)
  VITE_STRIPE_PUBLISHABLE_KEY: "${VITE_STRIPE_PUBLISHABLE_KEY}",
  
  // PayPal Configuration (SOLO client ID público)
  VITE_PAYPAL_CLIENT_ID: "${VITE_PAYPAL_CLIENT_ID}",
  
  // App Configuration
  VITE_APP_URL: "${VITE_APP_URL}",
  NODE_ENV: "${NODE_ENV:-production}"
  
  // ⚠️ IMPORTANTE: Este archivo solo contiene claves PÚBLICAS
  // Las claves secretas se configuran directamente en:
  // - Supabase Dashboard > Settings > Edge Functions
  // - Variables de entorno del servidor/contenedor
};
EOF

# Iniciar nginx
exec nginx -g "daemon off;"
