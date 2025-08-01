# Supabase Edge Functions

Esta carpeta contiene todas las Edge Functions para el proyecto Academia Online. Estas funciones manejan la lógica de negocio del backend.

**Nota:** Las Edge Functions incluidas son definitivas. No se agregarán nuevas funciones; se trabajará únicamente con las que ya existen.

## � Configuración de Variables de Entorno

Antes de desplegar las funciones, necesitas configurar las siguientes variables de entorno en tu dashboard de Supabase:

### En Supabase Dashboard > Settings > Edge Functions:

```bash
# Supabase Configuration
SUPABASE_URL=your_supabase_url_here
SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Stripe Configuration
STRIPE_SECRET_KEY=your_stripe_secret_key_here
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret_here

# PayPal Configuration
PAYPAL_CLIENT_ID=tu_paypal_client_id
PAYPAL_CLIENT_SECRET=tu_paypal_client_secret

# Resend Email Service
RESEND_API_KEY=re_...
```

## 🚀 Despliegue

Para desplegar todas las funciones a Supabase:

```bash
# Instalar Supabase CLI
npm install -g supabase

# Hacer login en Supabase
supabase login

# Inicializar proyecto (si es necesario)
supabase init

# Desplegar funciones específicas
supabase functions deploy stripe-checkout
supabase functions deploy student-dashboard
supabase functions deploy send-notification-email

# O desplegar todas las funciones de una vez
supabase functions deploy
```

## 📝 Uso de las Funciones

### Ejemplo de uso desde el frontend:

```typescript
// Llamar al checkout de Stripe
const { data } = await supabase.functions.invoke('stripe-checkout', {
  body: { 
    planType: 'monthly' 
  }
});

// Obtener dashboard del estudiante
const { data: dashboard } = await supabase.functions.invoke('student-dashboard');

// Enviar notificación por email
const { data: emailResult } = await supabase.functions.invoke('send-notification-email', {
  body: {
    to: 'usuario@example.com',
    subject: 'Bienvenido',
    message: 'Gracias por registrarte',
    type: 'welcome',
    data: {
      userName: 'Juan Pérez'
    }
  }
});
```

## 🔧 Desarrollo Local

Para desarrollar y probar las funciones localmente:

```bash
# Iniciar Supabase localmente
supabase start

# Servir funciones en modo desarrollo
supabase functions serve

# Probar una función específica
supabase functions serve --env-file supabase/.env.functions stripe-checkout
```

## 🛠️ Estructura de las Funciones

Cada función tiene la siguiente estructura:

```
function-name/
├── index.ts          # Función principal
└── README.md         # Documentación específica (opcional)
```

## 📊 Monitoreo y Logs

Para ver los logs de las funciones:

```bash
# Ver logs en tiempo real
supabase functions logs

# Ver logs de una función específica
supabase functions logs --function-name stripe-checkout
```

## 🔒 Seguridad

Todas las funciones implementan:

- ✅ Verificación de autenticación de usuarios
- ✅ Control de acceso basado en roles (RBAC)
- ✅ Validación de datos de entrada
- ✅ Headers CORS apropiados
- ✅ Manejo seguro de variables de entorno
- ✅ Logging de errores y actividad

## 📈 Escalabilidad

Las funciones están diseñadas para:

- Manejar múltiples usuarios concurrentes
- Procesar pagos de manera confiable
- Gestionar notificaciones masivas
- Generar reportes en tiempo real
- Administrar contenido de cursos eficientemente

## 🐛 Solución de Problemas

### Errores Comunes:

1. **Error 401 - No autorizado**: Verificar que el token de autenticación sea válido
2. **Error 403 - Acceso denegado**: Verificar roles de usuario (admin/instructor/student)
3. **Error 500 - Variables de entorno**: Asegurar que todas las variables estén configuradas
4. **Timeouts**: Verificar conexiones a servicios externos (Stripe, PayPal, Resend)

### Debugging:

```bash
# Ver logs detallados
supabase functions logs --level debug

# Probar función con curl
curl -X POST 'https://tu-proyecto.supabase.co/functions/v1/stripe-checkout' \
  -H 'Authorization: Bearer tu-jwt-token' \
  -H 'Content-Type: application/json' \
  -d '{"planType": "monthly"}'
```

## 📚 Documentación Adicional

- [Supabase Edge Functions Docs](https://supabase.com/docs/guides/functions)
- [Stripe API Documentation](https://stripe.com/docs/api)
- [PayPal Developer Docs](https://developer.paypal.com/docs/api/)
- [Resend API Docs](https://resend.com/docs/api-reference)

---

**⚠️ Importante**: Recuerda nunca commitear claves secretas al repositorio. Usa siempre variables de entorno para información sensible.

### 🔐 Autenticación y Suscripciones
- **check-subscription** - Verifica el estado de suscripción del usuario con Stripe
- **create-checkout** - Crea sesiones de checkout para suscripciones
- **customer-portal** - Genera enlaces al portal de cliente de Stripe
- **create-subscription** - Creación de suscripciones
- **stripe-checkout** - Checkout de suscripciones con Stripe

### 💳 Pagos
- **stripe-payment** - Procesa pagos únicos con Stripe
- **paypal-payment** - Procesa pagos con PayPal
- **webhook-stripe** - Webhook para eventos de Stripe (maneja webhooks)
- **cancel-subscription** - Cancela suscripciones

### 📚 Gestión de Cursos
- **course-enrollment** - Inscribe usuarios en cursos
- **lesson-progress** - Actualiza el progreso de lecciones
- **course-management** - API central para gestión de cursos
- **manage-course-content** - Gestión avanzada de contenido de cursos
- **course-analytics** - Analíticas de cursos
- **get-course-analytics** - Obtiene métricas específicas de cursos
- **generate-course-analytics** - Generación de reportes analíticos
- **validate-course-content** - Validación de contenido de cursos

### 📊 Dashboard y Estadísticas
- **dashboard-stats** - Estadísticas del dashboard del usuario
- **student-dashboard** - Dashboard específico para estudiantes
- **instructor-analytics** - Analíticas para instructores

### 🏆 Certificados
- **generate-certificate** - Generación de certificados HTML/PDF
- **process-completion-certificates** - Procesamiento de certificados de finalización

### 📧 Notificaciones y Comunicación
- **send-notifications** - Sistema de notificaciones básico
- **send-notification-email** - Envío de emails con plantillas
- **send-email-notification** - Sistema avanzado de emails
- **send-course-reminder** - Recordatorios de cursos
- **process-reminders** - Procesamiento automático de recordatorios
- **notifications-api** - API REST para notificaciones

### 🛠️ Administración
- **upload-file** - Subida de archivos al storage
- **admin-storage** - Gestión administrativa del storage
- **admin-lessons** - Administración de lecciones

### 📧 Notificaciones
- **send-notifications** - Envía notificaciones por email
- **send-email-notification** - Función auxiliar para emails
- **process-reminders** - Procesa recordatorios automáticos
- **send-course-reminders** - Recordatorios específicos de cursos
- **notifications-api** - API para gestión de notificaciones

### 👨‍💼 Administración
- **admin-categories** - Gestión de categorías (admin)
- **admin-courses** - Gestión de cursos (admin)
- **admin-lessons** - Gestión de lecciones (admin)
- **admin-storage** - Gestión de archivos (admin)

### 📜 Certificados y Exámenes
- **generate-certificate** - Genera certificados de completación
- **process-completion-certificates** - Procesa certificados automáticamente

### 📁 Archivos
- **upload-file** - Subida de archivos
- **manage-course-content** - Gestión de contenido de cursos
- **validate-course-content** - Validación de contenido

## 🔧 Variables de Entorno Requeridas

Asegúrate de configurar estas variables en tu proyecto de Supabase:

```bash
# Supabase
SUPABASE_URL=tu_url_de_supabase
SUPABASE_ANON_KEY=tu_anon_key
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key

# Stripe
STRIPE_SECRET_KEY=tu_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=tu_stripe_publishable_key

# PayPal
PAYPAL_CLIENT_ID=tu_paypal_client_id
PAYPAL_CLIENT_SECRET=tu_paypal_client_secret

# Email (Resend)
RESEND_API_KEY=tu_resend_api_key
```

## 🚀 Despliegue

Para desplegar las funciones:

```bash
# Instalar Supabase CLI
npm install -g @supabase/supabase-js

# Login a Supabase
supabase login

# Enlazar tu proyecto
supabase link --project-ref tu-project-ref

# Desplegar todas las funciones
supabase functions deploy

# Desplegar una función específica
supabase functions deploy nombre-funcion
```

## 📝 Uso desde el Frontend

Ejemplo de cómo llamar a las funciones desde tu aplicación React:

```typescript
import { supabase } from '@/integrations/supabase/client'

// Inscribirse en un curso
const { data, error } = await supabase.functions.invoke('course-enrollment', {
  body: { course_id: 'uuid-del-curso' }
})

// Verificar suscripción
const { data: subscription } = await supabase.functions.invoke('check-subscription')

// Crear checkout
const { data: checkout } = await supabase.functions.invoke('create-checkout', {
  body: { planType: 'monthly', planName: 'Premium' }
})
```

## 🔒 Seguridad

- Todas las funciones incluyen validación de autenticación
- Se usan headers CORS apropiados
- Las funciones de administrador verifican roles
- Tokens JWT son validados en cada request

## 🐛 Debugging

Para ver logs de las funciones:

```bash
# Ver logs en tiempo real
supabase functions logs --follow

# Ver logs de una función específica
supabase functions logs nombre-funcion
```

## 📚 Documentación

Cada función incluye:
- Logging detallado para debugging
- Manejo de errores consistente
- Validación de entrada
- Respuestas estructuradas

Para más información sobre Edge Functions: [Supabase Edge Functions Docs](https://supabase.com/docs/guides/functions)
