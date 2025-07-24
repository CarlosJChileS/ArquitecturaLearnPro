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
├── core/                     # Núcleo del sistema (DDD)
│   ├── application/          # Casos de uso y lógica de aplicación
│   ├── domain/               # Entidades y modelos de dominio
│   └── infrastructure/       # Adaptadores e infraestructura externa
├── database/                 # Esquema de base de datos Supabase
│   └── supabase-schema.sql
├── docs/                     # Documentación técnica
│   ├── adr/                  # Architecture Decision Records
│   ├── business-model-canvas.md
│   ├── c4-model.md
│   └── index.md
├── modules/                  # Módulos funcionales (auth, payments, etc.)
├── shared/                   # Código compartido (middleware, utils)
├── .gitignore
├── package.json
├── package-lock.json
└── README.md
```

---

## 🚀 Instalación y Ejecución Local

### Requisitos

- Node.js ≥ 18
- Supabase CLI (`npm install -g supabase`)
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

### 3. Iniciar Supabase localmente
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


## ☁️ Despliegue en Producción

- **Google Cloud**

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


## 💳 Pasarelas de Pago

### Stripe

- Checkout en `/payments/stripe`
- Confirmación vía `session_id`

### PayPal

- Función Edge en Supabase
- Ruta: `/payments/paypal`

---

