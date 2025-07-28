# Script de configuración completa para Academia Online (Windows PowerShell)
# Ejecutar después de clonar el repositorio

Write-Host "🚀 Configurando Academia Online..." -ForegroundColor Green

# Verificar dependencias
Write-Host "📋 Verificando dependencias..." -ForegroundColor Yellow

# Verificar Node.js
if (!(Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Node.js no está instalado. Por favor instala Node.js 18+ antes de continuar." -ForegroundColor Red
    exit 1
}

# Verificar gestor de paquetes
$packageManager = ""
if (Get-Command bun -ErrorAction SilentlyContinue) {
    $packageManager = "bun"
} elseif (Get-Command yarn -ErrorAction SilentlyContinue) {
    $packageManager = "yarn"
} elseif (Get-Command npm -ErrorAction SilentlyContinue) {
    $packageManager = "npm"
} else {
    Write-Host "❌ No se encontró ningún gestor de paquetes (npm/yarn/bun)" -ForegroundColor Red
    exit 1
}

Write-Host "📦 Usando $packageManager como gestor de paquetes" -ForegroundColor Cyan

# Verificar Supabase CLI
if (!(Get-Command supabase -ErrorAction SilentlyContinue)) {
    Write-Host "🔧 Instalando Supabase CLI..." -ForegroundColor Yellow
    npm install -g supabase
}

# Instalar dependencias del proyecto
Write-Host "📦 Instalando dependencias del proyecto..." -ForegroundColor Blue
& $packageManager install

# Configurar Supabase
Write-Host "🗄️ Configurando Supabase..." -ForegroundColor Blue

# Inicializar Supabase (si no está inicializado)
if (!(Test-Path "supabase\config.toml")) {
    supabase init
}

# Crear archivo .env.local si no existe
if (!(Test-Path ".env.local")) {
    Write-Host "📝 Creando archivo .env.local..." -ForegroundColor Yellow
    
    $envContent = @"
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
"@
    
    $envContent | Out-File -FilePath ".env.local" -Encoding UTF8
    Write-Host "✅ Archivo .env.local creado. Por favor, completa las variables de entorno." -ForegroundColor Green
}

# Verificar si ya hay un proyecto Supabase vinculado
if (!(Test-Path ".supabase\config.toml")) {
    $hasProject = Read-Host "🔗 ¿Tienes un proyecto Supabase existente? (y/n)"
    
    if ($hasProject -eq "y" -or $hasProject -eq "Y") {
        Write-Host "🔗 Vinculando proyecto existente..." -ForegroundColor Yellow
        Write-Host "Por favor, ejecuta: supabase link --project-ref TU_PROJECT_ID" -ForegroundColor Cyan
    } else {
        Write-Host "🆕 Creando nuevo proyecto Supabase..." -ForegroundColor Yellow
        supabase projects create academia-online
    }
} else {
    Write-Host "✅ Proyecto Supabase ya vinculado" -ForegroundColor Green
}

# Ejecutar migraciones
Write-Host "🗄️ Ejecutando migraciones de base de datos..." -ForegroundColor Blue
supabase db push

# Hacer build del proyecto
Write-Host "🔨 Compilando proyecto..." -ForegroundColor Blue
& $packageManager run build

Write-Host ""
Write-Host "🎉 ¡Configuración completada!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Próximos pasos:" -ForegroundColor Yellow
Write-Host "1. Completa las variables de entorno en .env.local"
Write-Host "2. Configura los webhooks según webhooks-config.md"
Write-Host "3. Ejecuta 'supabase start' para desarrollo local"
Write-Host "4. Ejecuta '$packageManager run dev' para iniciar el frontend"
Write-Host "5. Despliega las funciones con '.\supabase\deploy-functions.ps1'"
Write-Host ""
Write-Host "📚 Documentación:" -ForegroundColor Yellow
Write-Host "- README.md para guía completa"
Write-Host "- supabase\webhooks-config.md para configuración de webhooks"
Write-Host "- .env.functions para variables de entorno de Edge Functions"
Write-Host ""
Write-Host "🔗 Enlaces útiles:" -ForegroundColor Cyan
Write-Host "- Supabase Dashboard: https://supabase.com/dashboard"
Write-Host "- Stripe Dashboard: https://dashboard.stripe.com"
Write-Host "- Documentación: https://docs.supabase.com"
