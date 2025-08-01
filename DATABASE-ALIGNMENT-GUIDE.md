# Guía de Alineación Frontend-Backend

## Resumen de Problemas Identificados y Soluciones

### Problemas Encontrados:

1. **Inconsistencia en nombres de tablas**: El frontend usa `course_enrollments` pero las migraciones usaban `enrollments`
2. **Estructura de foreign keys**: Faltaban algunas foreign keys según la especificación proporcionada
3. **Campo user_id en profiles**: Inconsistencias entre `id` y `user_id` para referencias
4. **Campos faltantes**: Algunos campos requeridos por el frontend no existían en la base de datos

### Estructura de Foreign Keys Implementada:

```sql
-- course_enrollments
course_enrollments_course_id_fkey: course_enrollments.course_id -> courses.id
course_enrollments_user_id_fkey: course_enrollments.user_id -> profiles.user_id

-- lesson_progress  
lesson_progress_course_id_fkey: lesson_progress.course_id -> courses.id
lesson_progress_lesson_id_fkey: lesson_progress.lesson_id -> lessons.id
lesson_progress_user_id_fkey: lesson_progress.user_id -> profiles.user_id

-- courses
courses_category_id_fkey: courses.category_id -> categories.id
courses_instructor_id_fkey: courses.instructor_id -> profiles.user_id

-- lessons
lessons_course_id_fkey: lessons.course_id -> courses.id
```

## Archivos Creados/Modificados:

### Archivos SQL de Migración:
- `fix-database-alignment.sql` - Script inicial de corrección
- `migration-complete.sql` - Script completo con logging y verificación

### Archivos de Frontend Corregidos:
- `src/contexts/AuthContext.tsx` - Corregido para manejar user_id correctamente
- `src/lib/database-utils.ts` - Utilidades para verificar estructura de BD
- `src/pages/DatabaseValidator.tsx` - Herramienta de validación para admins
- `src/pages/AdminDashboard.tsx` - Agregada pestaña de validación
- `src/App.tsx` - Ruta para validador de BD

## Pasos para Aplicar las Correcciones:

### 1. Ejecutar Script de Migración
```sql
-- En Supabase SQL Editor, ejecutar:
-- migration-complete.sql
```

### 2. Verificar en el Frontend
1. Acceder como administrador
2. Ir a `Admin Dashboard > Base de Datos`
3. O acceder directamente a `/admin/database`
4. Hacer clic en "Verificar Estructura"

### 3. Crear Datos de Prueba (Opcional)
- Usar el botón "Crear Datos de Prueba" en el validador
- Esto creará datos de ejemplo para verificar que todo funciona

### 4. Verificar Funcionamiento
- Probar inscripción en cursos
- Verificar progreso de lecciones
- Comprobar dashboard de estudiantes
- Revisar panel de administración

## Características de la Solución:

### ✅ Migración Segura:
- Preserva datos existentes
- Logging completo de operaciones
- Verificación automática al final

### ✅ Compatibilidad Completa:
- Frontend alineado con estructura de BD
- Manejo de errores mejorado
- Fallbacks para compatibilidad

### ✅ Herramientas de Desarrollo:
- Validador de estructura integrado
- Datos de prueba fáciles de crear/limpiar
- Dashboard administrativo mejorado

### ✅ Performance:
- Índices optimizados
- Consultas eficientes
- RLS configurado para desarrollo

## Uso del Validador de Base de Datos:

El validador incluye las siguientes funciones:

1. **Verificar Estructura**: Comprueba que todas las tablas y foreign keys estén correctas
2. **Crear Datos de Prueba**: Genera datos de ejemplo para testing
3. **Limpiar Datos de Prueba**: Elimina los datos de ejemplo
4. **Visualización de Problemas**: Muestra problemas encontrados con detalles

## Estructura Final de Tablas:

### course_enrollments
- `id` (UUID, PK)
- `user_id` (UUID, FK -> profiles.user_id)
- `course_id` (UUID, FK -> courses.id)
- `enrolled_at`, `status`, `progress_percentage`, etc.

### lesson_progress
- `id` (UUID, PK)
- `user_id` (UUID, FK -> profiles.user_id)
- `lesson_id` (UUID, FK -> lessons.id)
- `course_id` (UUID, FK -> courses.id)
- `completed`, `progress`, `watch_time_seconds`, etc.

### courses
- `id` (UUID, PK)
- `instructor_id` (UUID, FK -> profiles.user_id)
- `category_id` (UUID, FK -> categories.id)
- `title`, `description`, `published`, etc.

### profiles
- `id` (UUID, PK, auth.users.id)
- `user_id` (UUID, unique, mismo valor que id)
- `email`, `full_name`, `role`, etc.

## Notas Importantes:

1. **RLS Deshabilitado**: Para MVP, se han configurado políticas permisivas
2. **Desarrollo**: La configuración actual es ideal para desarrollo, para producción considerar endurecer las políticas de RLS
3. **Backup**: El script mantiene un log completo de todas las operaciones realizadas

## Solución de Problemas:

Si encuentras errores después de la migración:

1. Revisa el log en la tabla `migration_backup_log`
2. Usa el validador de BD para identificar problemas específicos
3. Verifica que el usuario tenga permisos de administrador
4. Comprueba la consola del navegador para errores de JavaScript

La estructura ahora está completamente alineada con los requerimientos del frontend y debería funcionar sin errores de foreign keys.
