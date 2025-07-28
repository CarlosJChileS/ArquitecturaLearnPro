# 🚀 Guía de Despliegue Seguro - Google Cloud Run

## ⚠️ **IMPORTANTE - Variables de Entorno**

Por seguridad, las credenciales ahora se manejan con variables de entorno. Antes de desplegar:

### 1. **Configura tus credenciales reales**

Edita el archivo que corresponda a tu sistema operativo:

#### **Windows (PowerShell)** - Editar `deploy.ps1`:
```powershell
$SUPABASE_URL = "https://tu-proyecto.supabase.co"
$SUPABASE_ANON_KEY = "tu_anon_key_real"
$STRIPE_PUBLISHABLE_KEY = "tu_stripe_publishable_key_real"
```

#### **Linux/Mac** - Editar `deploy.sh`:
```bash
SUPABASE_URL="https://tu-proyecto.supabase.co"
SUPABASE_ANON_KEY="tu_anon_key_real"
STRIPE_PUBLISHABLE_KEY="tu_stripe_publishable_key_real"
```

### 2. **Configurar Google Cloud**
```bash
gcloud auth login
gcloud config set project TU_PROJECT_ID_REAL
```

### 3. **Ejecutar despliegue**

#### **Windows:**
```powershell
.\deploy.ps1
```

#### **Linux/Mac:**
```bash
chmod +x deploy.sh
./deploy.sh
```

## 🔧 **Configuración Manual de Variables**

Si prefieres configurar las variables manualmente en Cloud Run:

```bash
gcloud run services update tu-servicio \
  --set-env-vars "VITE_SUPABASE_URL=https://tu-proyecto.supabase.co" \
  --set-env-vars "VITE_SUPABASE_ANON_KEY=tu_anon_key" \
  --set-env-vars "VITE_STRIPE_PUBLISHABLE_KEY=tu_stripe_key" \
  --region us-central1
```

## 🔒 **Seguridad**

- ✅ Credenciales ya no están hardcodeadas en el código
- ✅ Variables de entorno protegidas en `.gitignore`
- ✅ Solo keys públicas en el frontend (Stripe publishable, Supabase anon)
- ⚠️ **NUNCA** pongas secret keys en variables de frontend

## 🛠️ **Solución de Problemas**

### Error: "Missing Supabase environment variables"
- Verifica que las variables estén configuradas en Cloud Run
- Reinicia el servicio después de cambiar variables

### Build falla con "file not found"
- El Dockerfile ya no requiere `.env.production`
- Las variables se pasan en tiempo de ejecución

### Variables no se aplican
```bash
# Reiniciar servicio para aplicar nuevas variables
gcloud run services update tu-servicio --region us-central1
```

## 📋 **Checklist de Despliegue**

- [ ] Credenciales reales configuradas en script de despliegue
- [ ] Project ID actualizado
- [ ] Google Cloud CLI configurado y autenticado
- [ ] APIs habilitadas (Cloud Build, Cloud Run, Container Registry)
- [ ] Variables de entorno verificadas en Cloud Run después del despliegue

---

**🎉 ¡Tu aplicación ahora es segura para producción!**
