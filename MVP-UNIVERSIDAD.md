# MVP Simplificado para Universidad 🎓

Este proyecto ha sido configurado como un **MVP (Minimum Viable Product)** simplificado especialmente para uso universitario, eliminando complejidades innecesarias y facilitando el desarrollo.

## 🚀 Configuración Simplificada

### ✅ Lo que se ha simplificado:

1. **Políticas de Seguridad RLS Permisivas**
   - Todas las tablas permiten operaciones CRUD completas
   - No hay restricciones complejas de acceso
   - Ideal para desarrollo y pruebas

2. **Autenticación Simplificada**
   - JWT verification deshabilitada para desarrollo
   - Registro y login básico
   - Auto-creación de perfiles

3. **Cliente Supabase Helper**
   - Funciones helper para operaciones CRUD fáciles
   - Manejo de errores simplificado
   - Métodos directos sin validaciones complejas

## 📋 Credenciales de Prueba

```
Email: admin@test.com
Password: admin123
Role: admin
```

## 🛠️ Uso del Cliente Simplificado

```typescript
import { mvpHelpers } from '@/lib/supabase-mvp';

// Insertar datos fácilmente
await mvpHelpers.insertData('courses', {
  title: 'Mi Curso',
  description: 'Descripción del curso'
});

// Obtener datos sin restricciones
const { data } = await mvpHelpers.getData('courses');

// Actualizar datos
await mvpHelpers.updateData('courses', courseId, {
  title: 'Nuevo título'
});

// Eliminar datos
await mvpHelpers.deleteData('courses', courseId);
```

## 🔧 Edge Functions Simplificadas

Las siguientes funciones están desplegadas y listas para usar:

### Pagos
- `paypal-payment` - Procesamiento de pagos PayPal
- `stripe-payment` - Procesamiento de pagos Stripe
- `stripe-checkout` - Checkout de Stripe
- `create-checkout` - Crear sesiones de checkout

### Gestión de Cursos
- `course-management` - Gestión completa de cursos
- `course-enrollment` - Inscripción a cursos
- `lesson-progress` - Seguimiento de progreso
- `admin-courses` - Administración de cursos

### Utilidades
- `health-check` - Verificación de estado
- `upload-file` - Subida de archivos
- `send-email-notification` - Envío de emails

## 📚 Estructura de Base de Datos

### Tablas Principales:
- `profiles` - Perfiles de usuario
- `courses` - Cursos disponibles
- `lessons` - Lecciones de los cursos
- `enrollments` - Inscripciones
- `lesson_progress` - Progreso de lecciones
- `subscription_plans` - Planes de suscripción
- `categories` - Categorías de cursos

## 🧪 Datos de Prueba

El sistema incluye datos de prueba básicos:
- Categorías: Programación, Diseño, Marketing
- Usuario admin predefinido
- Planes de suscripción básicos

## ⚠️ Consideraciones para Producción

**IMPORTANTE**: Esta configuración es SOLO para desarrollo/MVP universitario:

1. **Antes de producción, implementar:**
   - Políticas RLS apropiadas
   - Validaciones de datos
   - Autenticación robusta
   - Logs de auditoría

2. **Límites actuales del MVP:**
   - Sin restricciones de acceso
   - Validaciones mínimas
   - Configuración permisiva

## 🔗 URLs Importantes

- **App Local**: http://localhost:8081/
- **Supabase Dashboard**: https://supabase.com/dashboard/project/xfuhbjqqlgfxxkjvezhy
- **Functions Dashboard**: https://supabase.com/dashboard/project/xfuhbjqqlgfxxkjvezhy/functions

## 🎯 Próximos Pasos

1. **Iniciar la aplicación**:
   ```bash
   npm run dev
   ```

2. **Probar funcionalidades**:
   - Registro/Login de usuarios
   - Creación de cursos
   - Sistema de pagos (modo sandbox)

3. **Desarrollar nuevas features**:
   - Usar `mvpHelpers` para operaciones de DB
   - Agregar nuevas páginas según necesidades
   - Implementar lógica de negocio específica

---

*Este MVP está optimizado para facilitar el desarrollo universitario sin complejidades innecesarias. ¡Perfecto para aprender y experimentar! 🚀*
