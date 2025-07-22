# LearnPro

Plataforma de aprendizaje simple basada en suscripción, utilizando una arquitectura modular. El proyecto es una pequeña prueba de concepto en Node.js que expone varios módulos de funcionalidades y un front-end en React.

## Estructura

```
api-gateway/
    index.js                # Punto de entrada de Express
    public/                 # Front-end en React
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

* **api-gateway/** aloja la aplicación Express y expone los diferentes módulos de funcionalidades.
* **public/** dentro de `api-gateway` contiene el front-end de React (Vite).
* **core/** contiene los modelos de dominio y servicios de aplicación utilizados por los módulos de funcionalidades.
* **modules/** agrupa las rutas para autenticación, productos, pagos y notificaciones.
* **shared/** contiene middleware, utilidades y patrones comunes.
* **docker/** se puede usar para los archivos de contenedores (Docker).
* **database/** incluye el archivo `supabase-schema.sql` con las tablas normalizadas de PostgreSQL usadas en el proyecto.

## Ejecutar el backend

Instala las dependencias y arranca el API gateway:

```bash
npm install
npm start
```

El servidor se ejecuta por defecto en el puerto `3000`.

## Ejecutar el front-end

El cliente de React se encuentra dentro de `api-gateway/public`. Para ejecutarlo en modo desarrollo:

```bash
cd api-gateway/public
npm install
npm run dev
```

Esto inicia el servidor de desarrollo de Vite.

## Ejecutar con Docker

El `Dockerfile` incluido construye el front-end de React y lo empaqueta junto con la API de Express, así ambos corren en un solo contenedor. Para construir y ejecutar:

```bash
docker build -t learnpro -f docker/Dockerfile .
docker run -p 3000:3000 learnpro
```

La aplicación estará disponible en `http://localhost:3000`.

## Usar Supabase localmente

El proyecto puede conectarse a un backend de Supabase. Se provee un cliente en `shared/utils/supabaseClient.js` que lee `SUPABASE_URL` y `SUPABASE_ANON_KEY` desde las variables de entorno. Puedes ejecutar todo Supabase localmente usando la [CLI de Supabase](https://supabase.com/docs/guides/cli). Tras instalar la CLI, inicia los servicios:

```bash
supabase start
```

Este comando inicia una instancia local de Postgres e imprime las credenciales de conexión. Establece las variables `SUPABASE_URL` y `SUPABASE_ANON_KEY` antes de iniciar el API gateway para que se conecte a tu entorno local:

```bash
export SUPABASE_URL=http://localhost:54321
export SUPABASE_ANON_KEY=your-local-anon-key
npm start
```

Para usar un proyecto de Supabase en la nube, simplemente configura esas variables con la URL y la API key de tu proyecto remoto.

## Variables de entorno

Crea un archivo `.env` en la raíz del proyecto que contenga las siguientes claves:

* `SUPABASE_URL` y `SUPABASE_ANON_KEY` – detalles de conexión a Supabase.
* `SUPABASE_SERVICE_ROLE_KEY` – clave de servicio para operaciones privilegiadas.
* `ADMIN_EMAILS` – lista de correos de administradores, separados por coma.
* `PORT` – puerto para el API gateway (por defecto `3000`).
* `DB_HOST`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` – información de conexión a la base de datos.
* `ADMIN_ACCOUNTS` – opcional, pares `email:password` para cuentas admin iniciales.

Consulta `.env` para un ejemplo de configuración.
