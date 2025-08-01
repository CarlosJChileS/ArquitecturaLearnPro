#!/bin/bash

# Script para desplegar la aplicación en Google Cloud Run.
# Carga variables de un archivo `.env` si existe y las
# aplica automáticamente al servicio.

set -e

SERVICE_NAME="learnpro-app"
REGION="europe-west1"

echo "🚀 Desplegando en Google Cloud Run..."

# Cargar variables desde .env si el archivo está presente
if [ -f .env ]; then
  echo "Cargando configuración desde .env"
  export $(grep -v '^#' .env | xargs)
fi

gcloud run deploy "$SERVICE_NAME" \
  --source . \
  --platform managed \
  --region "$REGION" \
  --allow-unauthenticated \
  --port 8080

echo "✅ Despliegue completado"

# Aplicar variables de entorno al servicio
gcloud run services update "$SERVICE_NAME" \
  --region "$REGION" \
  --set-env-vars "VITE_SUPABASE_URL=$VITE_SUPABASE_URL,VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY,SUPABASE_URL=$SUPABASE_URL,SUPABASE_ANON_KEY=$SUPABASE_ANON_KEY,SUPABASE_SERVICE_ROLE_KEY=$SUPABASE_SERVICE_ROLE_KEY,STRIPE_SECRET_KEY=$STRIPE_SECRET_KEY,STRIPE_WEBHOOK_SECRET=$STRIPE_WEBHOOK_SECRET,VITE_STRIPE_PUBLISHABLE_KEY=$VITE_STRIPE_PUBLISHABLE_KEY,PAYPAL_CLIENT_ID=$PAYPAL_CLIENT_ID,PAYPAL_CLIENT_SECRET=$PAYPAL_CLIENT_SECRET,RESEND_API_KEY=$RESEND_API_KEY,VITE_APP_URL=$VITE_APP_URL,NODE_ENV=$NODE_ENV"

echo "🔧 Variables de entorno configuradas"
echo "🌐 Visita la URL mostrada arriba para ver tu aplicación"

