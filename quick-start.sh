#!/bin/bash

# Script de inicio rápido para MVP Universitario
# Ejecutar con: ./quick-start.sh

echo "🚀 Iniciando MVP Universitario - LearnPro..."
echo ""

# Verificar si node_modules existe
if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependencias..."
    npm install
fi

# Iniciar la aplicación
echo "🌐 Iniciando aplicación en http://localhost:8081/"
echo ""
echo "📋 Credenciales de prueba:"
echo "   📧 Email: admin@test.com"
echo "   🔑 Password: admin123"
echo ""
echo "🔧 Funciones desplegadas:"
echo "   💳 Pagos: PayPal y Stripe"
echo "   📚 Gestión de cursos"
echo "   👥 Administración de usuarios"
echo "   📊 Analytics y reportes"
echo ""
echo "✅ MVP listo para desarrollo universitario!"
echo ""

npm run dev
