#!/bin/bash
# Script de configuración completa para Academia Online
# Ejecutar después de clonar el repositorio

echo "🚀 Configurando Academia Online..."

# Verificar dependencias
echo "📋 Verificando dependencias..."

# Verificar Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js no está instalado. Por favor instala Node.js 18+ antes de continuar."
    exit 1
fi

# Verificar npm/yarn/bun
if command -v bun &> /dev/null; then
    PACKAGE_MANAGER="bun"
elif command -v yarn &> /dev/null; then
    PACKAGE_MANAGER="yarn"
elif command -v npm &> /dev/null; then
    PACKAGE_MANAGER="npm"
else
    echo "❌ No se encontró ningún gestor de paquetes (npm/yarn/bun)"
    exit 1
fi

echo "📦 Usando $PACKAGE_MANAGER como gestor de paquetes"

# Verificar Supabase CLI
if ! command -v supabase &> /dev/null; then
    echo "🔧 Instalando Supabase CLI..."
    npm install -g supabase
fi

# Instalar dependencias del proyecto
echo "📦 Instalando dependencias del proyecto..."
$PACKAGE_MANAGER install

# Configurar Supabase
echo "🗄️ Configurando Supabase..."

# Inicializar Supabase (si no está inicializado)
if [ ! -f "supabase/config.toml" ]; then
    supabase init
fi

# Crear archivo .env.local si no existe
if [ ! -f ".env.local" ]; then
    echo "📝 Creando archivo .env.local..."
    cp .env.example .env.local 2>/dev/null || cat > .env.local << 'EOF'
# Supabase
VITE_SUPABASE_URL=tu_supabase_url
VITE_SUPABASE_ANON_KEY=tu_supabase_anon_key

# Stripe
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# PayPal
VITE_PAYPAL_CLIENT_ID=tu_paypal_client_id
PAYPAL_CLIENT_SECRET=tu_paypal_client_secret

# Resend
RESEND_API_KEY=re_...

# URLs del sitio
VITE_SITE_URL=http://localhost:5173
VITE_API_URL=http://localhost:54321
EOF
    echo "✅ Archivo .env.local creado. Por favor, completa las variables de entorno."
fi

# Verificar si ya hay un proyecto Supabase vinculado
if [ ! -f ".supabase/config.toml" ]; then
    echo "🔗 ¿Tienes un proyecto Supabase existente? (y/n)"
    read -r has_project
    
    if [ "$has_project" = "y" ] || [ "$has_project" = "Y" ]; then
        echo "🔗 Vinculando proyecto existente..."
        echo "Por favor, ejecuta: supabase link --project-ref TU_PROJECT_ID"
    else
        echo "🆕 Creando nuevo proyecto Supabase..."
        supabase projects create academia-online
    fi
else
    echo "✅ Proyecto Supabase ya vinculado"
fi

# Ejecutar migraciones
echo "🗄️ Ejecutando migraciones de base de datos..."
supabase db push

# Hacer build del proyecto
echo "🔨 Compilando proyecto..."
$PACKAGE_MANAGER run build

echo ""
echo "🎉 ¡Configuración completada!"
echo ""
echo "📋 Próximos pasos:"
echo "1. Completa las variables de entorno en .env.local"
echo "2. Configura los webhooks según webhooks-config.md"
echo "3. Ejecuta 'supabase start' para desarrollo local"
echo "4. Ejecuta '$PACKAGE_MANAGER run dev' para iniciar el frontend"
echo "5. Despliega las funciones con './supabase/deploy-functions.sh'"
echo ""
echo "📚 Documentación:"
echo "- README.md para guía completa"
echo "- supabase/webhooks-config.md para configuración de webhooks"
echo "- .env.functions para variables de entorno de Edge Functions"
echo ""
echo "🔗 Enlaces útiles:"
echo "- Supabase Dashboard: https://supabase.com/dashboard"
echo "- Stripe Dashboard: https://dashboard.stripe.com"
echo "- Documentación: https://docs.supabase.com"
