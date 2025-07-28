#!/bin/bash

# Script simple para desplegar en Google Cloud Run
# Solo ejecuta: ./deploy.sh

echo "🚀 Desplegando en Google Cloud Run..."

gcloud run deploy learnpro-app \
    --source . \
    --platform managed \
    --region europe-west1 \
    --allow-unauthenticated \
    --port 8080

echo "✅ ¡Listo! Tu app está en la URL que aparece arriba"
echo "🔧 Ahora configura las variables de entorno:"
echo "gcloud run services update learnpro-app --region europe-west1 --set-env-vars \"VITE_SUPABASE_URL=tu-url,VITE_SUPABASE_ANON_KEY=tu-key\""
