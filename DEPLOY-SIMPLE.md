# 🚀 Despliegue Simplificado

## 🏠 Desarrollo Local

### Opción 1: npm (desarrollo)
```bash
npm install
npm run dev
```
Abre: http://localhost:8083

### Opción 2: Docker (producción local)
```bash
# Construcción simple
docker build -t learnpro-app .
docker run -p 8080:8080 learnpro-app

# O con docker-compose
docker-compose up
```
Abre: http://localhost:8080

## ☁️ Cloud Run

### Opción 1: Desde Cloud Console (GUI)
1. Ve a [Cloud Run](https://console.cloud.google.com/run)
2. Click "CREATE SERVICE"
3. Selecciona "Deploy one revision from an existing container image"
4. Sube tu `Dockerfile` o usa el `cloud-run.yaml`
5. ¡Listo!

### Opción 2: Con gcloud CLI
```bash
# Solo construir imagen
./build.sh      # Linux/Mac
.\build.ps1     # Windows

# Desplegar usando cloud-run.yaml
gcloud run services replace cloud-run.yaml
```

### Opción 3: Desde GitHub/Repository
1. Conecta tu repo a Cloud Build
2. Cloud Build construirá automáticamente desde el Dockerfile
3. Se despliega automáticamente en Cloud Run

## 🔧 Variables de Entorno

Ya están preconfiguradas en:
- `.env.local` (desarrollo)
- `.env.production` (producción)
- `cloud-run.yaml` (Cloud Run)

Para cambiar valores, edita estos archivos.

## 📁 Archivos Importantes

- `Dockerfile` - Imagen para producción
- `cloud-run.yaml` - Configuración Cloud Run
- `docker-compose.yml` - Desarrollo local con Docker
- `.env.production` - Variables de producción
- `nginx.conf` - Configuración del servidor web

## 🎯 URLs

- **Local (dev)**: http://localhost:8083
- **Local (docker)**: http://localhost:8080  
- **Cloud Run**: https://tu-servicio.run.app
- **Admin Panel**: `/admin-login` en cualquier URL

---

**¡Simple y directo! 🎉**
