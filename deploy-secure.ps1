# =================================================================
# 🚀 Script de Despliegue Automático - Google Cloud Run (PowerShell)
# =================================================================
# Este script despliega LearnPro en Google Cloud Run de forma segura
# usando variables de entorno en lugar de archivos con credenciales

# Configuración de colores
$RED = "Red"
$GREEN = "Green"
$YELLOW = "Yellow"
$BLUE = "Cyan"

Write-Host "🚀 Iniciando despliegue de LearnPro en Google Cloud Run" -ForegroundColor $BLUE

# =================================================================
# ⚠️  CONFIGURACIÓN REQUERIDA - EDITAR ANTES DE USAR
# =================================================================
$PROJECT_ID = "calcium-backup-462023-s6"  # 🔧 CAMBIAR por tu Project ID
$SERVICE_NAME = "learnpro-app"            # Nombre del servicio en Cloud Run
$REGION = "europe-west1"                  # Región de despliegue

# Variables de entorno para la aplicación (SIN valores por seguridad)
Write-Host "⚠️  IMPORTANTE: Configurar estas variables en Cloud Run:" -ForegroundColor $YELLOW
Write-Host "- VITE_SUPABASE_URL"
Write-Host "- VITE_SUPABASE_ANON_KEY"
Write-Host "- VITE_STRIPE_PUBLISHABLE_KEY"
Write-Host "- VITE_APP_URL"

# =================================================================
# 📋 Pre-requisitos
# =================================================================
Write-Host "📋 Verificando pre-requisitos..." -ForegroundColor $BLUE

# Verificar que gcloud esté instalado
try {
    $null = Get-Command gcloud -ErrorAction Stop
    Write-Host "✅ gcloud CLI encontrado" -ForegroundColor $GREEN
} catch {
    Write-Host "❌ Error: gcloud CLI no está instalado" -ForegroundColor $RED
    Write-Host "Instala gcloud desde: https://cloud.google.com/sdk/docs/install"
    exit 1
}

# Verificar autenticación
$authCheck = gcloud auth list --filter=status:ACTIVE --format="value(account)" 2>$null
if (-not $authCheck) {
    Write-Host "❌ Error: No estás autenticado en gcloud" -ForegroundColor $RED
    Write-Host "Ejecuta: gcloud auth login"
    exit 1
}

# Verificar configuración del proyecto
$currentProject = gcloud config get-value project 2>$null
if ($currentProject -ne $PROJECT_ID) {
    Write-Host "⚠️  Configurando proyecto: $PROJECT_ID" -ForegroundColor $YELLOW
    gcloud config set project $PROJECT_ID
}

Write-Host "✅ Pre-requisitos verificados" -ForegroundColor $GREEN

# =================================================================
# 🔧 Habilitar APIs necesarias
# =================================================================
Write-Host "🔧 Habilitando APIs de Google Cloud..." -ForegroundColor $BLUE

$APIs = @(
    "cloudbuild.googleapis.com",
    "run.googleapis.com",
    "containerregistry.googleapis.com",
    "artifactregistry.googleapis.com"
)

foreach ($api in $APIs) {
    Write-Host "Habilitando $api..."
    gcloud services enable $api --quiet
}

Write-Host "✅ APIs habilitadas" -ForegroundColor $GREEN

# =================================================================
# 🐳 Construir y desplegar
# =================================================================
Write-Host "🐳 Construyendo e implementando aplicación..." -ForegroundColor $BLUE

# Desplegar usando Cloud Build
$deployResult = gcloud run deploy $SERVICE_NAME `
    --source . `
    --platform managed `
    --region $REGION `
    --allow-unauthenticated `
    --port 8080 `
    --memory 512Mi `
    --cpu 1 `
    --min-instances 0 `
    --max-instances 10 `
    --timeout 300s `
    --concurrency 80 `
    --quiet

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Despliegue completado exitosamente" -ForegroundColor $GREEN
    
    # Obtener la URL del servicio
    $serviceUrl = gcloud run services describe $SERVICE_NAME --platform managed --region $REGION --format 'value(status.url)'
    
    Write-Host "🎉 ¡Aplicación desplegada!" -ForegroundColor $GREEN
    Write-Host "📱 URL de la aplicación: $serviceUrl" -ForegroundColor $BLUE
    
    # Mostrar información importante
    Write-Host "📋 Siguientes pasos:" -ForegroundColor $YELLOW
    Write-Host "1. Configurar variables de entorno en Cloud Run:"
    Write-Host "   gcloud run services update $SERVICE_NAME --region $REGION \"
    Write-Host "     --set-env-vars `"VITE_SUPABASE_URL=tu_url,VITE_SUPABASE_ANON_KEY=tu_key`""
    Write-Host ""
    Write-Host "2. Acceder al panel de administración:"
    Write-Host "   $serviceUrl/admin-login"
    Write-Host ""
    Write-Host "3. Verificar logs:"
    Write-Host "   gcloud run logs read --service $SERVICE_NAME --region $REGION"
    
} else {
    Write-Host "❌ Error en el despliegue" -ForegroundColor $RED
    exit 1
}

Write-Host "🚀 Despliegue completado" -ForegroundColor $GREEN

# Pausa para leer el output
Write-Host "Presiona Enter para continuar..." -ForegroundColor $YELLOW
Read-Host
