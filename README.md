# LearnPro 📚

<<<<<<< HEAD
Plataforma de aprendizaje por suscripción construida con Node.js y React. El proyecto sigue una arquitectura modular donde cada dominio (autenticación, cursos, pagos, notificaciones) se implementa como un módulo independiente. Incluye una API REST y un frontend basado en Vite.

La documentación completa se encuentra en la carpeta [docs](docs/), donde se incluyen el modelo C4 y las ADR que describen las decisiones de diseño.

## Structure

```
api-gateway/
    index.js                # Express entry point
    public/                 # React front-end
core/
    domain/
    application/
    infrastructure/
modules/
    auth/
    products/
    payments/
    notifications/
shared/
    middleware/
    utils/
    patterns/
docker/
database/
```

- **api-gateway/** hosts the Express application and serves the different feature modules.
- **public/** inside `api-gateway` contains the Vite React front-end.
- **core/** now holds the domain models and application services used by the feature modules.
- **modules/** groups the feature routes for auth, products, payments and notifications.
- **shared/** holds common middleware, utilities and patterns.
- **docker/** can be used for containerisation files.
- **database/** includes the `supabase-schema.sql` file with the normalized
  PostgreSQL tables used by the project.

## Running the backend

Install dependencies and start the API gateway:
=======
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
>>>>>>> 950f0b609f51b32fe2811cd2a4c52b092d6aa0a1

```bash
npm install
npm start
```

<<<<<<< HEAD
The server runs on port `8080` by default.

### API documentation

When the server is running you can explore all endpoints using Swagger UI at
`http://localhost:8080/api-docs`.

## Running the front-end

The React client lives inside `api-gateway/public`. To run it in development mode:
=======
Por defecto corre en `http://localhost:8080`

---

### 5. Iniciar el frontend
>>>>>>> 950f0b609f51b32fe2811cd2a4c52b092d6aa0a1

```bash
cd api-gateway/public
npm install
npm run dev
```

<<<<<<< HEAD
This launches the Vite dev server.

## Running with Docker

The provided `Dockerfile` builds the React front-end and bundles it with the
Express API using a multi-stage build so the final image only contains the
production files. Ensure you build from the repository root so the Docker
context includes the frontend sources. To build and run:

```bash
docker build -t learnpro .
docker run -p 8080:8080 learnpro
```

The Dockerfile copies `.env.example` by default. Provide a custom file with
`--build-arg ENV_FILE=.env` if needed.

The application will be available on `http://localhost:8080`.

## Using Supabase locally

The project can connect to a Supabase backend. A convenience client is provided in `shared/utils/supabaseClient.js` which reads `SUPABASE_URL` and `SUPABASE_ANON_KEY` from the environment. You can run a full Supabase stack locally using the [Supabase CLI](https://supabase.com/docs/guides/cli). After installing the CLI, start the services:
=======
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
>>>>>>> 950f0b609f51b32fe2811cd2a4c52b092d6aa0a1

---

<<<<<<< HEAD
This command launches a local Postgres instance and prints connection credentials. Set the `SUPABASE_URL` and `SUPABASE_ANON_KEY` variables before starting the API gateway so it connects to your local stack:
=======
>>>>>>> 950f0b609f51b32fe2811cd2a4c52b092d6aa0a1

## 💳 Pasarelas de Pago

<<<<<<< HEAD
To use a hosted Supabase project instead, set the same environment variables to your project's URL and API key. The server will then connect to the remote backend.

## Environment variables

Create a `.env` file in the project root containing the following keys when running locally. You can use `.env.example` as a starting point:

- `SUPABASE_URL` and `SUPABASE_ANON_KEY` – Supabase connection details.
- `SUPABASE_SERVICE_ROLE_KEY` – service role key for privileged operations.
- `ADMIN_EMAILS` – comma-separated list of administrator emails.
- `PORT` – port for the API gateway (defaults to `8080`).
- `DB_HOST`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` – database connection information.
- `ADMIN_ACCOUNTS` – optional `email:password` pairs for initial admin accounts.
- `STRIPE_SECRET_KEY` – secret key used to create checkout sessions.
- `PAYPAL_CLIENT_ID` and `PAYPAL_CLIENT_SECRET` – credentials for the PayPal REST API.
See `.env.example` for an example configuration. When running the Docker container in production you can provide these variables using your orchestrator (for example Cloud Run or `docker run -e`).

## Course management

Administrators can create and manage courses. To perform `POST`, `PUT` or `DELETE`
requests on `/products` endpoints the client must include the header
`x-user-role: admin`. Each course is linked to a subscription plan through the
`plan` field so users only see courses available for the plan from their active
subscription.

Admins can now manage user subscriptions through the `/subscriptions` API.  The
following endpoints require an `x-user-role: admin` header:

```
PUT /subscriptions/:id     # update plan, status or dates
DELETE /subscriptions/:id  # remove a subscription
```

All users (including admins) can retrieve subscriptions with:

```
GET /subscriptions/:id
```

These changes ensure admins share the same subscriptions as regular users and
any modifications are immediately visible through the API.

## Stripe payments

The `/payments/stripe` endpoint creates a checkout session and returns the
Stripe hosted URL. After a successful payment Stripe redirects the user back to
`/success?session_id=...`. The frontend can then call
`/payments/stripe/session/:sessionId` so the backend verifies the payment status
directly with Stripe and records it in the database. No webhook endpoint is
required.

## PayPal edge function

The project includes a Supabase Edge Function called `paypal-payment`. Deploy it
with:

```bash
supabase functions deploy paypal-payment
```

The function requires the `PAYPAL_CLIENT_ID` and `PAYPAL_CLIENT_SECRET`
environment variables. When `SUPABASE_URL` is set, the API gateway invokes this
function through Supabase to create an order and returns the approval URL. If no
Supabase backend is configured, the API falls back to the local PayPal SDK
implementation.
=======
### Stripe

- Checkout en `/payments/stripe`
- Confirmación vía `session_id`

### PayPal

- Función Edge en Supabase
- Ruta: `/payments/paypal`

---

>>>>>>> 950f0b609f51b32fe2811cd2a4c52b092d6aa0a1
