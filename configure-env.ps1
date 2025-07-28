# =================================================================
# 🔧 Script para Configurar Variables de Entorno en Cloud Run
# =================================================================
# Este script configura las variables de entorno necesarias para
# LearnPro después del despliegue inicial

param(
    [Parameter(Mandatory=$false)]
    [string]$ProjectId = "calcium-backup-462023-s6",
    
    [Parameter(Mandatory=$false)]
    [string]$ServiceName = "learnpro-app",
    
    [Parameter(Mandatory=$false)]
    [string]$Region = "europe-west1",
    
    [Parameter(Mandatory=$true)]
    [string]$SupabaseUrl,
    
    [Parameter(Mandatory=$true)]
    [string]$SupabaseAnonKey,
    
    [Parameter(Mandatory=$false)]
    [string]$StripePublishableKey = "",
    
    [Parameter(Mandatory=$false)]
    [string]$AppUrl = ""
)

Write-Host "🔧 Configurando variables de entorno en Cloud Run..." -ForegroundColor Cyan

# Si no se proporciona AppUrl, obtenerla del servicio
if (-not $AppUrl) {
    Write-Host "📡 Obteniendo URL del servicio..." -ForegroundColor Yellow
    $AppUrl = gcloud run services describe $ServiceName --platform managed --region $Region --format 'value(status.url)'
    if ($AppUrl) {
        Write-Host "✅ URL detectada: $AppUrl" -ForegroundColor Green
    } else {
        Write-Host "⚠️  No se pudo obtener la URL automáticamente" -ForegroundColor Yellow
        $AppUrl = Read-Host "Introduce la URL de tu aplicación (ej: https://tu-app-xyz.a.run.app)"
    }
}

# Construir el string de variables de entorno
$envVars = "VITE_SUPABASE_URL=$SupabaseUrl,VITE_SUPABASE_ANON_KEY=$SupabaseAnonKey,VITE_APP_URL=$AppUrl"

if ($StripePublishableKey) {
    $envVars += ",VITE_STRIPE_PUBLISHABLE_KEY=$StripePublishableKey"
}

Write-Host "📝 Aplicando variables de entorno..." -ForegroundColor Blue

# Actualizar el servicio con las variables de entorno
gcloud run services update $ServiceName `
    --region $Region `
    --set-env-vars $envVars `
    --quiet

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Variables de entorno configuradas exitosamente" -ForegroundColor Green
    Write-Host ""
    Write-Host "🎉 Configuración completada:" -ForegroundColor Green
    Write-Host "- VITE_SUPABASE_URL: $SupabaseUrl"
    Write-Host "- VITE_SUPABASE_ANON_KEY: [CONFIGURADA]"
    Write-Host "- VITE_APP_URL: $AppUrl"
    if ($StripePublishableKey) {
        Write-Host "- VITE_STRIPE_PUBLISHABLE_KEY: [CONFIGURADA]"
    }
    Write-Host ""
    Write-Host "📱 Tu aplicación está lista en: $AppUrl" -ForegroundColor Cyan
    Write-Host "🔐 Panel de admin: $AppUrl/admin-login" -ForegroundColor Cyan
} else {
    Write-Host "❌ Error al configurar variables de entorno" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "📋 Para verificar la configuración:" -ForegroundColor Yellow
Write-Host "gcloud run services describe $ServiceName --region $Region"

Write-Host ""
Write-Host "Presiona Enter para continuar..." -ForegroundColor Yellow
Read-Host
