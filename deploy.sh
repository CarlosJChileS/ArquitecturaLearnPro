#!/bin/bash

# Script para desplegar en Google Cloud Run
# Configuración automática - solo ajusta las variables al inicio

set -e

# ====== CONFIGURACIÓN - AJUSTA ESTOS VALORES ======
PROJECT_ID="tu-project-id"
SERVICE_NAME="learnpro-app"
REGION="us-central1"

# Variables de entorno para la aplicación
SUPABASE_URL="https://xfuhbjqqlgfxxkjvezhy.supabase.co"
SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhmdWhianFxbGdmeHhranZlemh5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwOTQ2MzgsImV4cCI6MjA2ODY3MDYzOH0.EFZFZyDF7eR1rkXCgZq-Q-B96I_H9XP1ulQsyzAyVOI"
STRIPE_PUBLISHABLE_KEY="pk_test_51RnmE4CBD94NZhoQpLTmmEkmqwe9NxZVTbnVYZ5RYHBteMUawAHaO6U07teBTAVOzPQ36OK4LY7JRaZhA7UQ3AX300wfY5Xb4q"
# ================================================

IMAGE_NAME="gcr.io/$PROJECT_ID/$SERVICE_NAME"

echo "🚀 Iniciando despliegue automático en Google Cloud Run..."
echo "📝 Proyecto: $PROJECT_ID"
echo "📝 Servicio: $SERVICE_NAME"
echo "📝 Región: $REGION"

# Verificar que gcloud esté configurado
if ! gcloud config get-value project > /dev/null 2>&1; then
    echo "❌ Error: gcloud no está configurado. Ejecuta 'gcloud auth login' primero."
    exit 1
fi

# Configurar proyecto si es diferente
CURRENT_PROJECT=$(gcloud config get-value project)
if [ "$CURRENT_PROJECT" != "$PROJECT_ID" ]; then
    echo "📝 Configurando proyecto: $PROJECT_ID"
    gcloud config set project $PROJECT_ID
fi

# Habilitar APIs necesarias
echo "🔧 Habilitando APIs necesarias..."
gcloud services enable run.googleapis.com --quiet
gcloud services enable containerregistry.googleapis.com --quiet

# 1. Construir la imagen Docker
echo "📦 Construyendo imagen Docker..."
docker build -t $IMAGE_NAME . --no-cache

# 2. Configurar autenticación de Docker para GCR
echo "🔐 Configurando autenticación Docker..."
gcloud auth configure-docker --quiet

# 3. Subir imagen a Google Container Registry
echo "⬆️ Subiendo imagen a Container Registry..."
docker push $IMAGE_NAME

# 4. Desplegar en Cloud Run con variables de entorno
echo "🌐 Desplegando en Cloud Run con configuración completa..."
gcloud run deploy $SERVICE_NAME \
  --image $IMAGE_NAME \
  --platform managed \
  --region $REGION \
  --allow-unauthenticated \
  --port 8080 \
  --memory 1Gi \
  --cpu 1 \
  --min-instances 0 \
  --max-instances 10 \
  --timeout 300 \
  --concurrency 80 \
  --set-env-vars "VITE_SUPABASE_URL=$SUPABASE_URL" \
  --set-env-vars "VITE_SUPABASE_ANON_KEY=$SUPABASE_ANON_KEY" \
  --set-env-vars "VITE_STRIPE_PUBLISHABLE_KEY=$STRIPE_PUBLISHABLE_KEY" \
  --set-env-vars "NODE_ENV=production" \
  --project $PROJECT_ID

# Obtener URL del servicio y configurar VITE_APP_URL
echo "🔧 Configurando URL de la aplicación..."
SERVICE_URL=$(gcloud run services describe $SERVICE_NAME --platform managed --region $REGION --format 'value(status.url)' --project $PROJECT_ID)

# Actualizar con la URL real del servicio
gcloud run services update $SERVICE_NAME \
  --set-env-vars "VITE_APP_URL=$SERVICE_URL" \
  --region $REGION \
  --project $PROJECT_ID

echo "✅ Despliegue completado exitosamente!"
echo ""
echo "🌍 Tu aplicación está disponible en: $SERVICE_URL"
echo "🔑 Panel de admin: $SERVICE_URL/admin-login"
echo ""
echo "📋 Información del despliegue:"
echo "   - Proyecto: $PROJECT_ID"
echo "   - Servicio: $SERVICE_NAME"
echo "   - Región: $REGION"
echo "   - Memoria: 1GB"
echo "   - CPU: 1 vCPU"
echo "   - Scaling: 0-10 instancias"
echo ""
echo "🔧 Para ver logs: gcloud run services logs read $SERVICE_NAME --region=$REGION"
