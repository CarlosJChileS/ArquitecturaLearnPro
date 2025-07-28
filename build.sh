#!/bin/bash

# Script simple para Cloud Run - Solo necesitas Docker
# No necesitas Project ID específico

echo "🚀 Construyendo aplicación para Cloud Run..."

# Construir imagen Docker
echo "📦 Construyendo imagen Docker..."
docker build -t learnpro-app:latest .

echo "✅ Imagen construida exitosamente!"
echo ""
echo "📋 Para desplegar en Cloud Run:"
echo "1. Sube la imagen a tu registry preferido"
echo "2. Usa el archivo cloud-run.yaml"
echo "3. O despliega directamente desde Cloud Console"
echo ""
echo "🔧 Comandos útiles:"
echo "  - Ejecutar localmente: docker run -p 8080:8080 learnpro-app:latest"
echo "  - Ver la imagen: docker images learnpro-app"
