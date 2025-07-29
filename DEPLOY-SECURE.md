# 🚀 Guía de Deployment Seguro

## 📋 Resumen
Esta guía explica cómo hacer deployment de la aplicación de forma segura, separando las claves públicas de las privadas.

## 🏗️ Arquitectura de Seguridad

### Frontend (entrypoint.sh)
```bash
# Solo variables PÚBLICAS expuestas al cliente
window.ENV = {
  VITE_SUPABASE_URL: "https://tu-proyecto.supabase.co",
  VITE_SUPABASE_ANON_KEY: "eyJ...", // Clave pública
  VITE_STRIPE_PUBLISHABLE_KEY: "pk_live_...", // Clave pública
  VITE_PAYPAL_CLIENT_ID: "ATg...", // Client ID público
}
```

### Backend (Supabase Edge Functions)
```bash
# Variables SECRETAS configuradas en dashboard
SUPABASE_SERVICE_ROLE_KEY=eyJ... # 🔒 SECRETA
STRIPE_SECRET_KEY=sk_live_...    # 🔒 SECRETA
PAYPAL_CLIENT_SECRET=EPg...      # 🔒 SECRETA
RESEND_API_KEY=re_...           # 🔒 SECRETA
```

## 🐳 Deployment con Docker

### 1. Variables de Entorno del Contenedor
```bash
# docker-compose.yml o variables de entorno
services:
  app:
    environment:
      # Variables PÚBLICAS para el frontend
      - VITE_SUPABASE_URL=https://xfuhbjqqlgfxxkjvezhy.supabase.co
      - VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
      - VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
      - VITE_PAYPAL_CLIENT_ID=[TU_PAYPAL_CLIENT_ID_PUBLICO]
      - VITE_APP_URL=https://tu-dominio.com
```

### 2. Configuración en Supabase
```bash
# Dashboard > Settings > Edge Functions > Environment Variables
SUPABASE_SERVICE_ROLE_KEY=[TU_SUPABASE_SERVICE_ROLE_KEY]
STRIPE_SECRET_KEY=[TU_STRIPE_SECRET_KEY]
STRIPE_WEBHOOK_SECRET=[TU_STRIPE_WEBHOOK_SECRET]
PAYPAL_CLIENT_SECRET=[TU_PAYPAL_CLIENT_SECRET]
RESEND_API_KEY=[TU_RESEND_API_KEY]
```

## ☁️ Deployment en Servicios Cloud

### Vercel
```bash
# Variables de entorno en dashboard de Vercel
VITE_SUPABASE_URL=[TU_SUPABASE_URL]
VITE_SUPABASE_ANON_KEY=[TU_SUPABASE_ANON_KEY]
VITE_STRIPE_PUBLISHABLE_KEY=[TU_STRIPE_PUBLISHABLE_KEY]
VITE_PAYPAL_CLIENT_ID=[TU_PAYPAL_CLIENT_ID]
```

### Netlify
```bash
# netlify.toml o Variables de entorno en dashboard
[build.environment]
VITE_SUPABASE_URL = "[TU_SUPABASE_URL]"
VITE_SUPABASE_ANON_KEY = "[TU_SUPABASE_ANON_KEY]"
```

## 🔒 Mejores Prácticas de Seguridad

### ✅ SÍ hacer:
- **Separar claves públicas/privadas** claramente
- **Usar variables VITE_*** solo para el frontend
- **Configurar claves secretas** en dashboards de servicios
- **Rotar claves** regularmente
- **Usar HTTPS** en producción

### ❌ NO hacer:
- **Exponer claves secretas** en el frontend
- **Hardcodear credenciales** en el código
- **Usar claves de producción** en desarrollo
- **Compartir archivos** con claves reales

## 🧪 Testing del Deployment

### 1. Verificar Frontend
```bash
# Inspeccionar en DevTools > Console
console.log(window.ENV);
// Debería mostrar solo variables VITE_*
```

### 2. Verificar Backend
```bash
# Test de Supabase Edge Functions
curl -X POST 'https://xfuhbjqqlgfxxkjvezhy.supabase.co/functions/v1/test' \
  -H 'Authorization: Bearer [ANON_KEY]'
```

### 3. Verificar Variables
```bash
# Comprobar que las variables estén disponibles
docker exec -it container_name env | grep VITE_
```

## 🚨 Troubleshooting

### Error: "Cannot access STRIPE_SECRET_KEY"
- **Problema**: Variable secreta expuesta en frontend
- **Solución**: Mover a Supabase Edge Functions

### Error: "VITE_SUPABASE_URL is undefined"
- **Problema**: Variable no configurada en entorno
- **Solución**: Verificar docker-compose.yml o variables del servicio

### Error: "GitHub push protection"
- **Problema**: Claves reales en código
- **Solución**: Usar solo placeholders en archivos versionados

## 📞 Soporte
Para más información, revisa:
- [Documentación de Supabase](https://supabase.com/docs)
- [Variables de Entorno de Vite](https://vitejs.dev/guide/env-and-mode.html)
- [Docker Environment Variables](https://docs.docker.com/compose/environment-variables/)
