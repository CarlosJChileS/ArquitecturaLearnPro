# Script simple para desplegar en Google Cloud Run
# Solo ejecuta: .\deploy.ps1

Write-Host "🚀 Desplegando en Google Cloud Run..." -ForegroundColor Cyan

gcloud run deploy learnpro-app `
    --source . `
    --platform managed `
    --region europe-west1 `
    --allow-unauthenticated `
    --port 8080

Write-Host "✅ ¡Listo! Tu app está en la URL que aparece arriba" -ForegroundColor Green
Write-Host "🔧 Ahora configura las variables de entorno:" -ForegroundColor Yellow
Write-Host "gcloud run services update learnpro-app --region europe-west1 --set-env-vars `"VITE_SUPABASE_URL=tu-url,VITE_SUPABASE_ANON_KEY=tu-key`""
