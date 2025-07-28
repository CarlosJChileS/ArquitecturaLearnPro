#!/bin/bash

# =================================================================
# 🚀 Script de Despliegue Automático - Google Cloud Run
# =================================================================
# Este script despliega LearnPro en Google Cloud Run de forma segura
# usando variables de entorno en lugar de archivos con credenciales

set -e  # Salir si hay algún error

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # Sin color

echo -e "${BLUE}🚀 Iniciando despliegue de LearnPro en Google Cloud Run${NC}"

# =================================================================
# ⚠️  CONFIGURACIÓN REQUERIDA - EDITAR ANTES DE USAR
# =================================================================
PROJECT_ID="calcium-backup-462023-s6"  # 🔧 CAMBIAR por tu Project ID
SERVICE_NAME="learnpro-app"            # Nombre del servicio en Cloud Run
REGION="europe-west1"                  # Región de despliegue

# Variables de entorno para la aplicación (SIN valores por seguridad)
# Estas se configurarán directamente en Cloud Run
echo -e "${YELLOW}⚠️  IMPORTANTE: Configurar estas variables en Cloud Run:${NC}"
echo "- VITE_SUPABASE_URL"
echo "- VITE_SUPABASE_ANON_KEY"
echo "- VITE_STRIPE_PUBLISHABLE_KEY"
echo "- VITE_APP_URL"

# =================================================================
# 📋 Pre-requisitos
# =================================================================
echo -e "${BLUE}📋 Verificando pre-requisitos...${NC}"

# Verificar que gcloud esté instalado
if ! command -v gcloud &> /dev/null; then
    echo -e "${RED}❌ Error: gcloud CLI no está instalado${NC}"
    echo "Instala gcloud desde: https://cloud.google.com/sdk/docs/install"
    exit 1
fi

# Verificar que el usuario esté autenticado
if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" | grep -q @; then
    echo -e "${RED}❌ Error: No estás autenticado en gcloud${NC}"
    echo "Ejecuta: gcloud auth login"
    exit 1
fi

# Verificar configuración del proyecto
CURRENT_PROJECT=$(gcloud config get-value project 2>/dev/null)
if [ "$CURRENT_PROJECT" != "$PROJECT_ID" ]; then
    echo -e "${YELLOW}⚠️  Configurando proyecto: $PROJECT_ID${NC}"
    gcloud config set project $PROJECT_ID
fi

echo -e "${GREEN}✅ Pre-requisitos verificados${NC}"

# =================================================================
# 🔧 Habilitar APIs necesarias
# =================================================================
echo -e "${BLUE}🔧 Habilitando APIs de Google Cloud...${NC}"

APIs=(
    "cloudbuild.googleapis.com"
    "run.googleapis.com"
    "containerregistry.googleapis.com"
    "artifactregistry.googleapis.com"
)

for api in "${APIs[@]}"; do
    echo "Habilitando $api..."
    gcloud services enable $api --quiet
done

echo -e "${GREEN}✅ APIs habilitadas${NC}"

# =================================================================
# 🐳 Construir y desplegar
# =================================================================
echo -e "${BLUE}🐳 Construyendo e implementando aplicación...${NC}"

# Desplegar usando Cloud Build (más eficiente)
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
    --concurrency 80 \
    --quiet

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Despliegue completado exitosamente${NC}"
    
    # Obtener la URL del servicio
    SERVICE_URL=$(gcloud run services describe $SERVICE_NAME --platform managed --region $REGION --format 'value(status.url)')
    
    echo -e "${GREEN}🎉 ¡Aplicación desplegada!${NC}"
    echo -e "${BLUE}📱 URL de la aplicación: ${SERVICE_URL}${NC}"
    
    # Mostrar información importante
    echo -e "${YELLOW}📋 Siguientes pasos:${NC}"
    echo "1. Configurar variables de entorno en Cloud Run:"
    echo "   gcloud run services update $SERVICE_NAME --region $REGION \\"
    echo "     --set-env-vars \"VITE_SUPABASE_URL=tu_url,VITE_SUPABASE_ANON_KEY=tu_key\""
    echo ""
    echo "2. Acceder al panel de administración:"
    echo "   ${SERVICE_URL}/admin-login"
    echo ""
    echo "3. Verificar logs:"
    echo "   gcloud run logs read --service $SERVICE_NAME --region $REGION"
    
else
    echo -e "${RED}❌ Error en el despliegue${NC}"
    exit 1
fi

echo -e "${GREEN}🚀 Despliegue completado${NC}"
