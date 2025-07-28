#!/bin/bash

# Script para crear un administrador en Supabase
# Este script utiliza la Supabase CLI para crear el usuario

echo "🚀 Creando usuario administrador en Supabase..."

# Configuración
EMAIL="carlosjchiles@gmail.com"
PASSWORD="Cjchs123@"
FULL_NAME="Carlos J. Chile S."

# Verificar que supabase CLI esté instalado
if ! command -v supabase &> /dev/null; then
    echo "❌ Error: Supabase CLI no está instalado"
    echo "Instala Supabase CLI: npm install -g supabase"
    exit 1
fi

echo "📧 Email: $EMAIL"
echo "👤 Nombre: $FULL_NAME"
echo "🔑 Rol: admin"

# Crear el usuario usando Supabase CLI
echo "📝 Creando usuario en Supabase Auth..."

# Nota: Este comando requiere estar autenticado con Supabase CLI
# Ejecutar: supabase login primero

supabase auth users create \
  --email "$EMAIL" \
  --password "$PASSWORD" \
  --confirm

if [ $? -eq 0 ]; then
    echo "✅ Usuario creado exitosamente en Auth"
    
    # Ahora ejecutar el script SQL para crear el perfil de admin
    echo "📊 Creando perfil de administrador..."
    
    # Ejecutar el script SQL
    supabase db exec --file scripts/create-admin.sql
    
    if [ $? -eq 0 ]; then
        echo "✅ Perfil de administrador creado exitosamente"
        echo ""
        echo "🎉 ¡Usuario administrador creado completamente!"
        echo "📧 Email: $EMAIL"
        echo "🔑 Contraseña: $PASSWORD"
        echo "👤 Rol: Administrador"
        echo ""
        echo "Puedes acceder al panel de administración en: /admin"
    else
        echo "❌ Error al crear el perfil de administrador"
        exit 1
    fi
else
    echo "❌ Error al crear el usuario en Auth"
    exit 1
fi
