# Script para desplegar en Google Cloud Run (PowerShell)
# Configuración automática - solo ajusta las variables al inicio

# ====== CONFIGURACIÓN - AJUSTA ESTOS VALORES ======
$PROJECT_ID = "tu-project-id"
$SERVICE_NAME = "learnpro-app"
$REGION = "us-central1"

# Variables de entorno para la aplicación
$SUPABASE_URL = "https://xfuhbjqqlgfxxkjvezhy.supabase.co"
$SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhmdWhianFxbGdmeHhranZlemh5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwOTQ2MzgsImV4cCI6MjA2ODY3MDYzOH0.EFZFZyDF7eR1rkXCgZq-Q-B96I_H9XP1ulQsyzAyVOI"
$STRIPE_PUBLISHABLE_KEY = "pk_test_51RnmE4CBD94NZhoQpLTmmEkmqwe9NxZVTbnVYZ5RYHBteMUawAHaO6U07teBTAVOzPQ36OK4LY7JRaZhA7UQ3AX300wfY5Xb4q"
# ================================================

$IMAGE_NAME = "gcr.io/$PROJECT_ID/$SERVICE_NAME"

Write-Host "🚀 Iniciando despliegue automático en Google Cloud Run..." -ForegroundColor Green
Write-Host "📝 Proyecto: $PROJECT_ID" -ForegroundColor Yellow
Write-Host "📝 Servicio: $SERVICE_NAME" -ForegroundColor Yellow
Write-Host "📝 Región: $REGION" -ForegroundColor Yellow

try {
    # Verificar que gcloud esté configurado
    $currentProject = gcloud config get-value project 2>$null
    if (-not $currentProject) {
        Write-Host "❌ Error: gcloud no está configurado. Ejecuta 'gcloud auth login' primero." -ForegroundColor Red
        exit 1
    }

    # Configurar proyecto si es diferente
    if ($currentProject -ne $PROJECT_ID) {
        Write-Host "📝 Configurando proyecto: $PROJECT_ID" -ForegroundColor Yellow
        gcloud config set project $PROJECT_ID
        if ($LASTEXITCODE -ne 0) { throw "Error configurando proyecto" }
    }

    # Habilitar APIs necesarias
    Write-Host "🔧 Habilitando APIs necesarias..." -ForegroundColor Yellow
    gcloud services enable run.googleapis.com --quiet
    gcloud services enable containerregistry.googleapis.com --quiet

    # 1. Construir la imagen Docker
    Write-Host "📦 Construyendo imagen Docker..." -ForegroundColor Yellow
    docker build -t $IMAGE_NAME . --no-cache
    if ($LASTEXITCODE -ne 0) { throw "Error construyendo imagen Docker" }

    # 2. Configurar autenticación de Docker para GCR
    Write-Host "🔐 Configurando autenticación Docker..." -ForegroundColor Yellow
    gcloud auth configure-docker --quiet

    # 3. Subir imagen a Google Container Registry
    Write-Host "⬆️ Subiendo imagen a Container Registry..." -ForegroundColor Yellow
    docker push $IMAGE_NAME
    if ($LASTEXITCODE -ne 0) { throw "Error subiendo imagen" }

    # 4. Desplegar en Cloud Run con variables de entorno
    Write-Host "🌐 Desplegando en Cloud Run con configuración completa..." -ForegroundColor Yellow
    gcloud run deploy $SERVICE_NAME `
        --image $IMAGE_NAME `
        --platform managed `
        --region $REGION `
        --allow-unauthenticated `
        --port 8080 `
        --memory 1Gi `
        --cpu 1 `
        --min-instances 0 `
        --max-instances 10 `
        --timeout 300 `
        --concurrency 80 `
        --set-env-vars "VITE_SUPABASE_URL=$SUPABASE_URL" `
        --set-env-vars "VITE_SUPABASE_ANON_KEY=$SUPABASE_ANON_KEY" `
        --set-env-vars "VITE_STRIPE_PUBLISHABLE_KEY=$STRIPE_PUBLISHABLE_KEY" `
        --set-env-vars "NODE_ENV=production" `
        --project $PROJECT_ID

    if ($LASTEXITCODE -ne 0) { throw "Error desplegando en Cloud Run" }

    # Obtener URL del servicio y configurar VITE_APP_URL
    Write-Host "🔧 Configurando URL de la aplicación..." -ForegroundColor Yellow
    $SERVICE_URL = gcloud run services describe $SERVICE_NAME --platform managed --region $REGION --format 'value(status.url)' --project $PROJECT_ID

    # Actualizar con la URL real del servicio
    gcloud run services update $SERVICE_NAME `
        --set-env-vars "VITE_APP_URL=$SERVICE_URL" `
        --region $REGION `
        --project $PROJECT_ID

    Write-Host "✅ Despliegue completado exitosamente!" -ForegroundColor Green
    Write-Host ""
    Write-Host "🌍 Tu aplicación está disponible en: $SERVICE_URL" -ForegroundColor Cyan
    Write-Host "🔑 Panel de admin: $SERVICE_URL/admin-login" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "📋 Información del despliegue:" -ForegroundColor White
    Write-Host "   - Proyecto: $PROJECT_ID" -ForegroundColor Gray
    Write-Host "   - Servicio: $SERVICE_NAME" -ForegroundColor Gray
    Write-Host "   - Región: $REGION" -ForegroundColor Gray
    Write-Host "   - Memoria: 1GB" -ForegroundColor Gray
    Write-Host "   - CPU: 1 vCPU" -ForegroundColor Gray
    Write-Host "   - Scaling: 0-10 instancias" -ForegroundColor Gray
    Write-Host ""
    Write-Host "🔧 Para ver logs: gcloud run services logs read $SERVICE_NAME --region=$REGION" -ForegroundColor Yellow

} catch {
    Write-Host "❌ Error durante el despliegue: $_" -ForegroundColor Red
    exit 1
}
