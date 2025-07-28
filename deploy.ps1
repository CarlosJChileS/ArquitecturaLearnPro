# Script para desplegar en Google Cloud Run desde PowerShell
# Configuración automática - solo ajusta las variables al inicio

# ====== CONFIGURACIÓN - AJUSTA ESTOS VALORES ======
$PROJECT_ID = "tu-project-id"
$SERVICE_NAME = "learnpro-app" 
$REGION = "us-central1"

# Variables de entorno para la aplicación - CONFIGURA TUS VALORES REALES
$SUPABASE_URL = "your_supabase_url_here"
$SUPABASE_ANON_KEY = "your_supabase_anon_key_here"
$STRIPE_PUBLISHABLE_KEY = "your_stripe_publishable_key_here"
# ================================================

$IMAGE_NAME = "gcr.io/$PROJECT_ID/$SERVICE_NAME"

Write-Host "🚀 Iniciando despliegue automático en Google Cloud Run..." -ForegroundColor Green
Write-Host "📝 Proyecto: $PROJECT_ID"
Write-Host "📝 Servicio: $SERVICE_NAME" 
Write-Host "📝 Región: $REGION"

# Verificar que gcloud esté configurado
try {
    $currentProject = gcloud config get-value project 2>$null
    if (-not $currentProject) {
        throw "No project configured"
    }
} catch {
    Write-Host "❌ Error: gcloud no está configurado. Ejecuta 'gcloud auth login' primero." -ForegroundColor Red
    exit 1
}

# Configurar proyecto
Write-Host "🔧 Configurando proyecto..." -ForegroundColor Yellow
gcloud config set project $PROJECT_ID

# Habilitar APIs necesarias
Write-Host "🔧 Habilitando APIs necesarias..." -ForegroundColor Yellow
gcloud services enable cloudbuild.googleapis.com --quiet
gcloud services enable run.googleapis.com --quiet
gcloud services enable containerregistry.googleapis.com --quiet

# Construir imagen
Write-Host "🏗️ Construyendo imagen Docker..." -ForegroundColor Yellow
gcloud builds submit --tag $IMAGE_NAME

# Desplegar en Cloud Run
Write-Host "🚀 Desplegando en Cloud Run..." -ForegroundColor Yellow
gcloud run deploy $SERVICE_NAME `
    --image $IMAGE_NAME `
    --platform managed `
    --region $REGION `
    --set-env-vars "VITE_SUPABASE_URL=$SUPABASE_URL,VITE_SUPABASE_ANON_KEY=$SUPABASE_ANON_KEY,VITE_STRIPE_PUBLISHABLE_KEY=$STRIPE_PUBLISHABLE_KEY" `
    --allow-unauthenticated `
    --memory 1Gi `
    --cpu 1 `
    --min-instances 0 `
    --max-instances 10 `
    --port 8080 `
    --quiet

# Obtener URL del servicio
$SERVICE_URL = gcloud run services describe $SERVICE_NAME --platform managed --region $REGION --format "value(status.url)"

Write-Host ""
Write-Host "✅ ¡Despliegue completado exitosamente!" -ForegroundColor Green
Write-Host "🌐 URL del servicio: $SERVICE_URL" -ForegroundColor Cyan
Write-Host ""
Write-Host "🔧 Para configurar variables de entorno adicionales:" -ForegroundColor Yellow
Write-Host "gcloud run services update $SERVICE_NAME --set-env-vars KEY=VALUE --region $REGION"
