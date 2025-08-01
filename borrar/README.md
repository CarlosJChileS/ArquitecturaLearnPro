# 🎓 Academia Online - Plataforma de Cursos en Línea

Una plataforma completa de cursos en línea construida con React, TypeScript, Supabase y Edge Functions.
Para más detalles sobre el modelo arquitectónico y el uso del gateway revisa [docs/ARCHITECTURE.md](../docs/ARCHITECTURE.md).


## 🚀 Edge Functions Implementadas (30 funciones)

### **💰 Pagos y Suscripciones**
- `stripe-checkout` - Procesar checkout de Stripe
- `stripe-payment` - Manejar pagos de Stripe  
- `create-subscription` - Crear suscripciones
- `cancel-subscription` - Cancelar suscripciones
- `webhook-stripe` - Webhooks de Stripe

### **📊 Dashboard y Analytics**
- `student-dashboard` - Dashboard completo para estudiantes
- `course-analytics` - Analytics de cursos
- `instructor-analytics` - Métricas para instructores
- `get-course-analytics` - Obtener analytics específicos
- `generate-course-analytics` - Generar reportes
- `advanced-reports` - Reportes avanzados del sistema

### **📚 Gestión de Cursos**
- `course-management` - Gestión completa de cursos
- `manage-course-content` - Gestionar contenido
- `validate-course-content` - Validar contenido
- `admin-lessons` - Administración de lecciones
- `admin-courses` - Administración de cursos
- `admin-categories` - Administración de categorías

### **📧 Notificaciones y Email**
- `send-notification-email` - Sistema avanzado de emails
- `send-email-notification` - Notificaciones por email
- `send-course-reminder` - Recordatorios de cursos
- `send-course-reminders` - Procesar recordatorios automáticos
- `process-reminders` - Procesar recordatorios automáticos
- `notifications-api` - API de notificaciones

### **🎓 Certificados y Archivos**
- `generate-certificate` - Generar certificados HTML
- `process-completion-certificates` - Procesar certificados automáticamente
- `upload-file` - Subida de archivos
- `admin-storage` - Gestión de almacenamiento

### **🔧 Sistema y Administración**
- `backup-system` - Sistema de backups completo
- `health-check` - Verificación de salud del sistema
- `database-cleanup` - Limpieza automática de base de datos

## ⚡ Configuración Rápida

### 1. Configuración Inicial
```bash
# Windows
.\setup.ps1

# Linux/Mac
./setup.sh
```

### 2. Desplegar Edge Functions
```bash
# Windows
.\supabase\deploy-functions.ps1

# Linux/Mac
./supabase/deploy-functions.sh
```

### 3. Configurar Variables de Entorno
Ve a **Supabase Dashboard > Settings > Edge Functions** y agrega las variables desde `.env.functions`

## 🛠️ Tecnologías Utilizadas

- **Frontend**: React, TypeScript, Vite, Tailwind CSS, shadcn/ui
- **Backend**: Supabase, Edge Functions (Deno)
- **Pagos**: Stripe, PayPal
- **Email**: Resend
- **Base de Datos**: PostgreSQL (Supabase)
- **Autenticación**: Supabase Auth
- **Storage**: Supabase Storage

## 📂 Estructura del Proyecto

```
arquitecturaconjunto/
├── src/                    # Frontend React
├── supabase/
│   ├── functions/         # Edge Functions (30 funciones)
│   ├── migrations/        # Migraciones de BD
│   └── config.toml       # Configuración Supabase
├── scripts/              # Scripts de despliegue
└── docs/                # Documentación
```

## 🔐 Características de Seguridad

- ✅ Autenticación JWT verificada
- ✅ Roles y permisos (admin/instructor/student)
- ✅ Políticas RLS en todas las tablas
- ✅ Verificación de firmas en webhooks
- ✅ Validación de datos en Edge Functions

## 📊 Analytics y Reportes

- **Métricas de Ingresos**: Análisis de pagos y suscripciones
- **Comportamiento de Usuarios**: Sesiones, vistas de página
- **Rendimiento de Cursos**: Inscripciones, completación
- **Dashboard para Instructores**: Métricas personalizadas
- **Reportes Avanzados**: Exportación en JSON/CSV

## 🎯 Funcionalidades Principales

### Para Estudiantes
- 📚 Catálogo de cursos con filtros
- 🎥 Reproductor de video integrado
- 📈 Seguimiento de progreso
- 🏆 Certificados automáticos
- 📱 Dashboard personalizado
- 💳 Suscripciones y pagos

### Para Instructores
- ✏️ Editor de cursos avanzado
- 📊 Analytics detallados
- 👥 Gestión de estudiantes
- 📧 Sistema de notificaciones
- 💰 Reportes de ingresos

### Para Administradores
- 🔧 Panel de administración completo
- 👤 Gestión de usuarios y roles
- 📈 Analytics del sistema
- 🔄 Backups automáticos
- 🛡️ Monitoreo de seguridad

## 🚀 Despliegue

### Desarrollo Local
```bash
# Iniciar Supabase local
supabase start

# Iniciar frontend
npm run dev

# Desplegar funciones
supabase functions deploy
```

### Producción
1. Configura las variables de entorno en Supabase
2. Despliega las Edge Functions
3. Configura los webhooks según `webhooks-config.md`
4. Despliega el frontend en Vercel/Netlify

## 📚 Documentación

- [Configuración de Webhooks](supabase/webhooks-config.md)
- [Variables de Entorno](supabase/.env.functions)
- [Migraciones de BD](supabase/migrations/)
- [API de Edge Functions](docs/api.md)

## 🔗 Enlaces Útiles

- [Supabase Dashboard](https://supabase.com/dashboard)
- [Stripe Dashboard](https://dashboard.stripe.com)
- [Documentación Supabase](https://docs.supabase.com)

## 🤝 Contribuciones

1. Fork el proyecto
2. Crea tu rama de feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver `LICENSE` para más detalles.

---

## Cómo editar este proyecto

Puedes editar este proyecto de varias maneras:

### Desarrollo Local

Para trabajar en el proyecto localmente:

1. Clona el repositorio
2. Instala las dependencias: `npm install`
3. Configura las variables de entorno en `.env`
4. Ejecuta el servidor de desarrollo: `npm run dev`

### GitHub Codespaces

- Haz clic en "New codespace" para lanzar un nuevo entorno Codespace.
- Edita archivos directamente dentro del Codespace y haz commit y push de tus cambios una vez que hayas terminado.

## ¿Qué tecnologías se utilizan en este proyecto?

Este proyecto está construido con:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS
- Supabase
- Edge Functions

## ¿Cómo puedo desplegar este proyecto?

Para desplegar el proyecto:

1. Configura tu entorno de producción
2. Ejecuta `npm run build` para generar la build de producción
3. Despliega los archivos generados en tu servidor web preferido
4. Configura las Edge Functions en Supabase

## ¿Puedo conectar un dominio personalizado?

Sí, puedes configurar un dominio personalizado en tu servidor de hosting. Asegúrate de:

1. Configurar los DNS correctamente
2. Establecer certificados SSL
3. Configurar las variables de entorno para el dominio personalizado
