#!/bin/sh

# Script para inyectar variables de entorno en tiempo de ejecución
# Esto permite configurar variables sin reconstruir la imagen

# Crear archivo de configuración JavaScript con las variables de entorno
cat <<EOF > /usr/share/nginx/html/env-config.js
window.ENV = {
  VITE_SUPABASE_URL: "${VITE_SUPABASE_URL}",
  VITE_SUPABASE_ANON_KEY: "${VITE_SUPABASE_ANON_KEY}",
  VITE_STRIPE_PUBLISHABLE_KEY: "${VITE_STRIPE_PUBLISHABLE_KEY}",
  VITE_APP_URL: "${VITE_APP_URL}",
  NODE_ENV: "${NODE_ENV:-production}"
};
EOF

# Iniciar nginx
exec nginx -g "daemon off;"
