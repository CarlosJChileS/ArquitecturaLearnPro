# Script simple para Cloud Run - Solo necesitas Docker
# No necesitas Project ID específico

Write-Host "🚀 Construyendo aplicación para Cloud Run..." -ForegroundColor Green

# Construir imagen Docker
Write-Host "📦 Construyendo imagen Docker..." -ForegroundColor Yellow
docker build -t learnpro-app:latest .

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Imagen construida exitosamente!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📋 Para desplegar en Cloud Run:" -ForegroundColor White
    Write-Host "1. Sube la imagen a tu registry preferido" -ForegroundColor Gray
    Write-Host "2. Usa el archivo cloud-run.yaml" -ForegroundColor Gray
    Write-Host "3. O despliega directamente desde Cloud Console" -ForegroundColor Gray
    Write-Host ""
    Write-Host "🔧 Comandos útiles:" -ForegroundColor White
    Write-Host "  - Ejecutar localmente: docker run -p 8080:8080 learnpro-app:latest" -ForegroundColor Gray
    Write-Host "  - Ver la imagen: docker images learnpro-app" -ForegroundColor Gray
} else {
    Write-Host "❌ Error construyendo la imagen Docker" -ForegroundColor Red
}
