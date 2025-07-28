# ⚡ Guía de Despliegue Súper Simple

## 🚀 Opción 1: Google Cloud Shell

1. **Abrir Cloud Shell:**
   - Ve a [Google Cloud Console](https://console.cloud.google.com)
   - Haz clic en el ícono de terminal

2. **Ejecutar comandos:**
   ```bash
   git clone https://github.com/CarlosJChileS/ArquitecturaLearnPro.git
   cd ArquitecturaLearnPro
   chmod +x deploy.sh
   ./deploy.sh
   ```

3. **Configurar Supabase:**
   ```bash
   gcloud run services update learnpro-app --region europe-west1 \
     --set-env-vars "VITE_SUPABASE_URL=tu-url,VITE_SUPABASE_ANON_KEY=tu-key"
   ```

## 🖥️ Opción 2: Desde tu computadora

1. **Instalar gcloud CLI:**
   - [Descargar aquí](https://cloud.google.com/sdk/docs/install)

2. **Autenticarse:**
   ```bash
   gcloud auth login
   ```

3. **Desplegar:**
   ```bash
   # Linux/Mac
   ./deploy.sh
   
   # Windows
   .\deploy.ps1
   ```

## � Configurar Supabase

1. Ve a [supabase.com](https://supabase.com)
2. Crea un proyecto
3. Ve a **Settings** > **API**
4. Copia la **URL** y **anon key**
5. Configúralas:
   ```bash
   gcloud run services update learnpro-app --region europe-west1 \
     --set-env-vars "VITE_SUPABASE_URL=https://xyz.supabase.co,VITE_SUPABASE_ANON_KEY=eyJhbGc..."
   ```

## 🎯 ¡Eso es todo!

Tu app estará en: `https://learnpro-app-xxx.a.run.app`

Admin: `https://learnpro-app-xxx.a.run.app/admin-login`

---

**Simple como debe ser 🎓**

### 1. Configurar Google Cloud
```bash
# Instalar gcloud CLI (si no lo tienes)
# https://cloud.google.com/sdk/docs/install

# Autenticarse
gcloud auth login

# Crear proyecto (opcional) o usar uno existente
gcloud projects create tu-project-id
gcloud config set project tu-project-id

# Habilitar facturación en: https://console.cloud.google.com/billing
```

### 2. Configurar variables en el script
Edita el archivo `deploy.sh` (Linux/Mac) o `deploy.ps1` (Windows):

```bash
# Cambiar estas líneas:
PROJECT_ID="tu-project-id-real"           # ⚠️ CAMBIAR por tu Project ID real
SERVICE_NAME="learnpro-app"               # ✅ Puedes dejarlo así
REGION="us-central1"                      # ✅ Puedes dejarlo así

# Variables de Supabase (OBLIGATORIAS):
SUPABASE_URL="tu-url-supabase"            # ⚠️ CAMBIAR por tu URL de Supabase
SUPABASE_ANON_KEY="tu-anon-key"           # ⚠️ CAMBIAR por tu Anon Key

# Variables de Stripe (OPCIONALES):
STRIPE_PUBLISHABLE_KEY="tu-stripe-key"    # ⚠️ CAMBIAR si usas pagos
```

### 3. Ejecutar despliegue
```bash
# Linux/Mac
chmod +x deploy.sh
./deploy.sh

# Windows PowerShell
.\deploy.ps1
```

## 🎯 Resultado:
- ✅ Tu app estará en: `https://SERVICE_NAME-xxx-uc.a.run.app`
- ✅ Admin panel en: `https://SERVICE_NAME-xxx-uc.a.run.app/admin-login`
- ✅ Auto-scaling: 0-10 instancias
- ✅ Variables de entorno configuradas automáticamente

## 🔧 ¿Cómo obtener las claves de Supabase?

1. Ve a [supabase.com](https://supabase.com)
2. Crea un proyecto o abre uno existente
3. Ve a `Settings > API`
4. Copia:
   - **URL**: Algo como `https://xxxxx.supabase.co`
   - **Anon Key**: Una clave larga que empieza con `eyJ...`

## 🔧 ¿Cómo obtener las claves de Stripe? (Opcional)

1. Ve a [stripe.com](https://stripe.com)
2. Crea una cuenta o inicia sesión
3. Ve a `Developers > API keys`
4. Usa las claves de **Test** para desarrollo
5. Copia la **Publishable key** (empieza con `pk_test_...`)

## ⚡ Despliegue Express (con valores por defecto):

Si quieres probar rápidamente, solo cambia el `PROJECT_ID` y ejecuta. 
Los valores de Supabase y Stripe están preconfigurados para pruebas.

```bash
# Solo editar esta línea en deploy.sh:
PROJECT_ID="mi-proyecto-123"

# Ejecutar
./deploy.sh
```

---

**🎉 ¡Listo! Tu aplicación estará funcionando en Google Cloud Run en unos minutos.**
