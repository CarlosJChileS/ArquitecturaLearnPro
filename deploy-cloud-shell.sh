#!/bin/bash

# =================================================================
# 🚀 Script de Despliegue Simple para Google Cloud Run
# =================================================================
# Ejecutar este script en Google Cloud Shell

set -e

echo "🚀 Desplegando LearnPro en Google Cloud Run..."

# Configuración
PROJECT_ID="calcium-backup-462023-s6"
SERVICE_NAME="learnpro-app" 
REGION="europe-west1"

echo "📋 Configurando proyecto: $PROJECT_ID"
gcloud config set project $PROJECT_ID

echo "🔧 Habilitando APIs necesarias..."
gcloud services enable cloudbuild.googleapis.com --quiet
gcloud services enable run.googleapis.com --quiet

echo "🐳 Desplegando aplicación (puede tomar varios minutos)..."
gcloud run deploy $SERVICE_NAME \
    --source . \
    --platform managed \
    --region $REGION \
    --allow-unauthenticated \
    --port 8080 \
    --memory 512Mi \
    --cpu 1 \
    --min-instances 0 \
    --max-instances 10 \
    --timeout 300s \
    --quiet

if [ $? -eq 0 ]; then
    echo "✅ Despliegue completado exitosamente"
    
    # Obtener URL del servicio
    SERVICE_URL=$(gcloud run services describe $SERVICE_NAME --platform managed --region $REGION --format 'value(status.url)')
    
    echo ""
    echo "🎉 ¡Aplicación desplegada!"
    echo "📱 URL: $SERVICE_URL"
    echo ""
    echo "📋 Configurar variables de entorno:"
    echo "gcloud run services update $SERVICE_NAME --region $REGION \\"
    echo '  --set-env-vars "VITE_SUPABASE_URL=https://xfuhbjqqlgfxxkjvezhy.supabase.co,VITE_SUPABASE_ANON_KEY=eyJhbGc...tu-key"'
    echo ""
    echo "🔐 Panel de admin: $SERVICE_URL/admin-login"
    
else
    echo "❌ Error en el despliegue"
    exit 1
fi
