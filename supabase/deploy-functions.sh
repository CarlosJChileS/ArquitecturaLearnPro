#!/bin/bash

# Script de despliegue para Supabase Edge Functions
# Ejecutar desde la raíz del proyecto: ./supabase/deploy-functions.sh

echo "🚀 Iniciando despliegue de Edge Functions..."

# Verificar que Supabase CLI esté instalado
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI no está instalado. Instalando..."
    npm install -g supabase
fi

# Verificar login
echo "🔐 Verificando autenticación..."
if ! supabase status &> /dev/null; then
    echo "🔑 Necesitas hacer login en Supabase:"
    supabase login
fi

# Lista de funciones a desplegar
functions=(
    "stripe-checkout"
    "stripe-payment" 
    "create-subscription"
    "webhook-stripe"
    "cancel-subscription"
    "student-dashboard"
    "course-management"
    "manage-course-content"
    "get-course-analytics"
    "generate-course-analytics"
    "instructor-analytics"
    "course-analytics"
    "send-notification-email"
    "send-email-notification"
    "send-course-reminder"
    "send-course-reminders"
    "process-reminders"
    "notifications-api"
    "generate-certificate"
    "process-completion-certificates"
    "validate-course-content"
    "upload-file"
    "admin-storage"
    "admin-lessons"
    "admin-courses"
    "admin-categories"
    "backup-system"
    "health-check"
    "database-cleanup"
    "advanced-reports"
)

echo "📦 Desplegando ${#functions[@]} funciones..."

# Desplegar cada función
for func in "${functions[@]}"; do
    echo "🔄 Desplegando $func..."
    
    if supabase functions deploy "$func"; then
        echo "✅ $func desplegada exitosamente"
    else
        echo "❌ Error desplegando $func"
        exit 1
    fi
done

echo ""
echo "🎉 ¡Todas las funciones han sido desplegadas exitosamente!"
echo ""
echo "📋 Próximos pasos:"
echo "1. Configura las variables de entorno en Supabase Dashboard > Settings > Edge Functions"
echo "2. Copia las variables desde supabase/.env.functions"
echo "3. Prueba las funciones con el frontend"
echo ""
echo "🔗 Dashboard: https://supabase.com/dashboard/project/[tu-project-id]/functions"
