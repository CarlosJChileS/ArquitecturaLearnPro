# Manual de Corrección de Base de Datos - LearnPro MVP

## Problemas Identificados

Después de revisar el código y las migraciones, he identificado varios problemas críticos en la estructura de la base de datos:

### 1. **Inconsistencias en nombres de tablas**
- El código usa tanto `course_enrollments` como `enrollments`
- Se necesita estandarizar en `course_enrollments`

### 2. **Tablas faltantes o incompletas**
- `student_analytics` - Referenciada en funciones pero puede no existir
- `student_events` - Necesaria para la función `track_student_event`
- `certificates` - Referenciada en dashboard
- `exams` y `exam_attempts` - Referenciadas en dashboard y funciones

### 3. **Campos faltantes en tablas existentes**
- `courses.long_description` - Usado en edge functions
- `courses.trailer_url` - Usado para videos de preview
- `courses.subscription_tier` - Usado para filtros de suscripción
- `courses.average_rating` - Usado para mostrar ratings
- `lessons.content` - Usado para lecciones de texto
- `lessons.type` - Ya agregado pero necesita verificación
- `lesson_progress.progress` - Campo adicional para porcentaje
- `lesson_progress.time_spent` - Usado en varias funciones
- `lesson_progress.last_accessed` - Para tracking de actividad

### 4. **Funciones faltantes**
- `get_user_dashboard()` - Dashboard del estudiante
- `get_user_notifications()` - Sistema de notificaciones
- `complete_course_with_exam()` - Completar cursos
- `track_student_event()` - Tracking de eventos
- `get_course_progress()` - Progreso detallado de cursos
- `update_lesson_progress()` - Actualizar progreso de lecciones

## Solución Implementada

He creado dos nuevas migraciones:

### 1. `20250729150000_fix_database_structure.sql`
- Crea todas las tablas faltantes con estructura completa
- Estandariza en `course_enrollments` (elimina `enrollments`)
- Agrega todos los campos faltantes a tablas existentes
- Crea índices para optimización
- Deshabilita RLS para MVP
- Inserta datos básicos (categorías y planes de suscripción)

### 2. `20250729160000_create_missing_functions.sql`
- Crea todas las funciones SQL faltantes
- Implementa lógica de negocio para dashboard, progreso, etc.
- Agrega triggers para `updated_at` automático
- Funciones optimizadas para el MVP

## Instrucciones de Aplicación

### Opción A: Via Supabase CLI (Recomendada)
```bash
cd ArquitecturaLearnPro
npx supabase db push
```

### Opción B: Via Dashboard de Supabase
1. Ve a tu proyecto en https://app.supabase.com
2. Ve a "SQL Editor"
3. Ejecuta el contenido de cada migración en orden:
   - Primero `20250729150000_fix_database_structure.sql`
   - Luego `20250729160000_create_missing_functions.sql`

### Opción C: Via psql (Si tienes acceso directo)
```bash
psql "postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres" -f supabase/migrations/20250729150000_fix_database_structure.sql
psql "postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres" -f supabase/migrations/20250729160000_create_missing_functions.sql
```

## Verificación Post-Migración

Ejecuta el script `verify-database-structure.sql` para verificar que todo esté correcto:

```sql
-- En SQL Editor de Supabase, ejecuta el contenido de verify-database-structure.sql
```

## Problemas de Código que Necesitan Actualización

### 1. **Inconsistencias en edge functions**
Algunas funciones usan nombres de tabla inconsistentes. Busca y reemplaza:
- `enrollments` → `course_enrollments`
- `lesson_progress.completed` → `lesson_progress.is_completed`

### 2. **Campos renombrados**
- `lesson_progress.watch_time_seconds` está bien
- `lesson_progress.time_spent` se calcula automáticamente
- `course_enrollments.progress_percentage` está estandarizado

### 3. **Nuevas funciones disponibles**
Ahora puedes usar estas funciones SQL directamente:
```sql
SELECT get_user_dashboard('user-uuid');
SELECT get_course_progress('course-uuid', 'user-uuid');
SELECT update_lesson_progress('user-uuid', 'lesson-uuid', 'course-uuid', true, 300);
```

## Datos de Prueba

Las migraciones incluyen datos básicos:
- 6 categorías predefinidas (Programación, Diseño, Marketing, etc.)
- 3 planes de suscripción (Gratuito, Premium, Anual)

## Configuración RLS

Para el MVP, todas las políticas RLS están **DESHABILITADAS** para simplificar el desarrollo. Esto significa:
- ✅ Acceso completo a todas las tablas
- ✅ Sin restricciones de usuario
- ⚠️ **NO usar en producción sin revisar seguridad**

## Próximos Pasos

1. **Aplicar las migraciones**
2. **Verificar con el script de verificación**
3. **Probar las funciones principales de la app**
4. **Revisar logs de errores en funciones edge**
5. **Ajustar código si es necesario**

## Soporte

Si encuentras errores después de aplicar las migraciones:
1. Revisa los logs en Supabase Dashboard → Edge Functions
2. Verifica la estructura con el script de verificación
3. Revisa la consola del navegador para errores de frontend
