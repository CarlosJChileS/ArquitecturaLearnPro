# 🎓 Academia Online - Plataforma de Cursos en Línea

Una plataforma completa de cursos en línea construida con React, TypeScript, Supabase y Edge Functions.

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

## How to edit this project

You can edit this project in several ways:

### Use Lovable

Simply open [Lovable](https://lovable.dev/projects/6a4a05c4-befa-49b2-b21a-882f2762f3ab) and start prompting.

You can save a snapshot in order to capture the current state of your repository, and later create a fork from that snapshot to continue building on it.

### Use your preferred IDE

If you want to work locally using your preferred IDE, you can clone this project and push changes. Lovable will remain in sync with your changes.

### Use GitHub Codespaces

- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS
- Supabase
- Edge Functions

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/6a4a05c4-befa-49b2-b21a-882f2762f3ab) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)
