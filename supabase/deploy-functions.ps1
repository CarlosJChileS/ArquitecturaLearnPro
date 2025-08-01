# Script de despliegue para Supabase Edge Functions (Windows PowerShell)
# Ejecutar desde la raíz del proyecto: .\supabase\deploy-functions.ps1

Write-Host "🚀 Iniciando despliegue de Edge Functions..." -ForegroundColor Green

# Verificar que Supabase CLI esté instalado
if (!(Get-Command supabase -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Supabase CLI no está instalado. Instalando..." -ForegroundColor Red
    npm install -g supabase
}

# Verificar login
Write-Host "🔐 Verificando autenticación..." -ForegroundColor Yellow
try {
    npx supabase --version | Out-Null
}
catch {
    Write-Host "🔑 Necesitas hacer login en Supabase:" -ForegroundColor Yellow
    npx supabase login
}

# Lista de funciones a desplegar
$functions = @(
    "stripe-checkout",
    "stripe-payment", 
    "paypal-payment",
    "create-subscription",
    "webhook-stripe",
    "cancel-subscription",
    "student-dashboard",
    "course-management",
    "manage-course-content",
    "get-course-analytics",
    "generate-course-analytics",
    "instructor-analytics",
    "course-analytics",
    "send-notification-email",
    "send-email-notification",
    "send-course-reminder",
    "send-course-reminders",
    "process-reminders",
    "notifications-api",
    "generate-certificate",
    "process-completion-certificates",
    "validate-course-content",
    "upload-file",
    "admin-storage",
    "admin-lessons",
    "admin-courses",
    "admin-categories",
    "backup-system",
    "health-check",
    "database-cleanup",
    "advanced-reports"
)

Write-Host "📦 Desplegando $($functions.Count) funciones..." -ForegroundColor Cyan

# Desplegar cada función
foreach ($func in $functions) {
    Write-Host "🔄 Desplegando $func..." -ForegroundColor Blue
    
    try {
        npx supabase functions deploy $func
        Write-Host "✅ $func desplegada exitosamente" -ForegroundColor Green
    }
    catch {
        Write-Host "❌ Error desplegando $func" -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "🎉 ¡Todas las funciones han sido desplegadas exitosamente!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Próximos pasos:" -ForegroundColor Yellow
Write-Host "1. Configura las variables de entorno en Supabase Dashboard > Settings > Edge Functions"
Write-Host "2. Copia las variables desde supabase\.env.functions"
Write-Host "3. Prueba las funciones con el frontend"
Write-Host ""
Write-Host "🔗 Dashboard: https://supabase.com/dashboard/project/[tu-project-id]/functions" -ForegroundColor Cyan
