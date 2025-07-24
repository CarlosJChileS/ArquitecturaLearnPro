# LearnPro 📚

**Plataforma de aprendizaje por suscripción** desarrollada con Node.js (backend) y React (frontend), siguiendo principios de arquitectura modular, integración continua y despliegue automatizado.

---

## 🧠 Funcionalidades Principales

- Gestión de cursos, lecciones y usuarios
- Autenticación segura y control de acceso por planes (mensual/anual)
- Suscripciones con pagos integrados vía **Stripe** y **PayPal**
- Dashboard del estudiante con progreso
- Panel de administración para cursos y usuarios
- Notificaciones y recordatorios
- Documentación técnica y despliegue cloud-native

---

## 🏗️ Estructura del Proyecto

```
├── api-gateway/              # Servidor Express y React frontend
│   ├── index.js              # Punto de entrada del backend
│   └── public/               # Cliente React (Vite)
├── core/                     # Modelos de dominio y servicios de aplicación
├── modules/                  # Módulos por dominio (auth, payments, etc.)
├── shared/                   # Middleware, utils, patrones comunes
├── docker/                   # Archivos Docker
├── database/                 # Esquema Supabase (SQL)
└── docs/                     # Documentación C4, ADRs, Canvas
```

---

## 🚀 Instalación y Ejecución Local

### Requisitos

- Node.js ≥ 18
- Supabase CLI (`npm install -g supabase`)
- Docker (opcional)
- Git

### 1. Clonar el repositorio

```bash
git clone https://github.com/CarlosJChileS/ArquitecturaLearnPro.git
cd ArquitecturaLearnPro
```

### 2. Configurar variables de entorno

Copia el archivo de ejemplo:

```bash
cp .env.example .env
```

Agrega tus claves de Supabase, Stripe y PayPal. Más abajo encontrarás los campos requeridos.

### 3. Iniciar Supabase localmente (opcional)

```bash
supabase start
```

Luego configura las variables `SUPABASE_URL` y `SUPABASE_ANON_KEY`.

---

### 4. Iniciar el backend

```bash
npm install
npm start
```

Por defecto corre en `http://localhost:8080`

---

### 5. Iniciar el frontend

```bash
cd api-gateway/public
npm install
npm run dev
```

Se abrirá en `http://localhost:5173`

---

## 🐳 Ejecución con Docker

```bash
docker build -t learnpro .
docker run -p 8080:8080 learnpro
```

Asegúrate de que las variables de entorno estén configuradas correctamente. Usa `--build-arg` o un archivo `.env`.

---

## ☁️ Despliegue en Producción

Puedes desplegar este proyecto en:

- **Render**
- **Railway**
- **Vercel (frontend)**
- **Supabase (backend)**
- **GCP / AWS / Azure** (opcional)

Usa los scripts y configuración en la carpeta `/docker` o archivos de CI/CD disponibles.

---

## 📄 Variables de Entorno

| Variable | Descripción |
|---------|-------------|
| `SUPABASE_URL` | URL de Supabase |
| `SUPABASE_ANON_KEY` | API Key pública |
| `SUPABASE_SERVICE_ROLE_KEY` | Clave de servicio |
| `STRIPE_SECRET_KEY` | Clave secreta de Stripe |
| `PAYPAL_CLIENT_ID` | Client ID de PayPal |
| `PAYPAL_CLIENT_SECRET` | Client Secret de PayPal |
| `ADMIN_EMAILS` | Correos de administradores |
| `PORT` | Puerto del servidor |
| `DB_HOST`, `DB_NAME`, etc. | Configuración opcional de DB externa |

---

## 📦 Documentación Técnica

- 📌 Modelo C4: `docs/c4-diagrams/`
- 🧠 Decisiones arquitectónicas (ADRs): `docs/adr/`
- 📃 Documentación API: `/api-docs` (Swagger/OpenAPI)
- 💼 Modelo de Negocio: `docs/business-model-canvas.pdf`

---

## 🧪 Pruebas y Calidad

- Análisis de calidad automatizado con **SonarQube**
- Cobertura mínima del 70%
- Linter configurado
- Scripts de pruebas unitarias y funcionales

---

## 🔐 Autenticación

Sistema basado en tokens JWT con middleware para validar roles y permisos. Se incluyen roles: `admin`, `student`.

---

## 💳 Pasarelas de Pago

### Stripe

- Checkout en `/payments/stripe`
- Confirmación vía `session_id`

### PayPal

- Función Edge en Supabase
- Ruta: `/payments/paypal`

---

## 🔄 CI/CD

- GitHub Actions con SonarQube
- Scripts para build, test y despliegue automático
- Ramas organizadas con **GitFlow**

---

## 📂 Modelo GitFlow

- `main`: versión estable
- `develop`: integración
- `feature/*`: nuevas funcionalidades
- `release/*`, `hotfix/*`, etc.

---

## 👨‍💻 Autores

- Equipo LearnPro - ULEAM 2025-1
- Docente: [Nombre del Docente]

---

## 📃 Licencia

MIT © 2025 - Universidad Laica Eloy Alfaro de Manabí