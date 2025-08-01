# 🔄 ACTUALIZACIÓN DE EDGE FUNCTIONS - ANÁLISIS

## ✅ **Edge Functions que YA ESTÁN ACTUALIZADAS**

### 1. `student-dashboard` ✅
- **Estado**: Ya usa `get_user_dashboard()` correctamente
- **Línea 43**: `supabaseClient.rpc("get_user_dashboard", { target_user_id: user.id })`
- **¿Necesita cambios?**: NO

### 2. `get-course-analytics` ✅ 
- **Estado**: Ya usa `get_user_dashboard()` correctamente
- **Línea 180**: `.rpc('get_user_dashboard', { target_user_id: user.id })`
- **¿Necesita cambios?**: NO

### 3. `course-management` ✅
- **Estado**: Ya usa `get_user_dashboard()` correctamente
- **Línea 212**: `.rpc('get_user_dashboard', { target_user_id: user.id })`
- **¿Necesita cambios?**: NO

---

## 🔧 **Edge Functions que NECESITAN ACTUALIZACIÓN**

### 1. `lesson-progress` ⚠️ **NECESITA ACTUALIZACIÓN**
**Problema**: Está haciendo el cálculo de progreso manualmente en lugar de usar la función SQL optimizada.

**Código actual** (líneas 66-103):
```typescript
// Manual calculation - INEFICIENTE
const { data: totalLessons } = await supabaseClient
  .from('lessons')
  .select('id')
  .eq('course_id', course_id);

const { data: completedLessons } = await supabaseClient
  .from('lesson_progress')
  .select('id')
  .eq('user_id', user.id)
  .eq('course_id', course_id)
  .eq('is_completed', true);

const courseProgress = totalLessons && totalLessons.length > 0 
  ? Math.round((completedLessons?.length || 0) / totalLessons.length * 100)
  : 0;
```

**Debe cambiarse a**:
```typescript
// Usar función SQL optimizada - EFICIENTE
const { data: progressResult, error: progressError } = await supabaseClient
  .rpc('update_lesson_progress', {
    user_id_param: user.id,
    lesson_id_param: lesson_id,
    course_id_param: course_id,
    is_completed_param: is_completed || false,
    watch_time_seconds_param: watch_time_seconds || 0
  });
```

---

## 🔍 **Funciones que PODRÍAN beneficiarse de las nuevas SQL functions**

### 2. Funciones que podrían usar `track_student_event()` para analytics:
- `course-enrollment`
- `course-management` 
- `lesson-progress`
- `generate-certificate`

### 3. Funciones que podrían usar `get_course_progress()`:
- `course-analytics`
- `get-enrollment`
- `instructor-analytics`

### 4. Funciones que podrían usar `get_user_notifications()`:
- `notifications-api`
- `send-notifications`

---

## 📊 **PRIORIDAD DE ACTUALIZACIÓN**

### 🔥 **ALTA PRIORIDAD** (Arregla problemas de rendimiento):
1. ✅ `lesson-progress` - Usar `update_lesson_progress()` en lugar de cálculo manual

### 🟡 **MEDIA PRIORIDAD** (Mejora rendimiento pero funciona):
2. `course-enrollment` - Agregar `track_student_event()` para analytics
3. `generate-certificate` - Agregar `track_student_event()` para tracking

### 🟢 **BAJA PRIORIDAD** (Solo optimizaciones):
4. Otras funciones para usar las SQL functions optimizadas

---

## 🎯 **RECOMENDACIÓN**

**¿NECESITAS ACTUALIZAR AHORA?** 
- **SÍ** para `lesson-progress` (mejora significativa de rendimiento)
- **NO** urgente para las demás (funcionan pero podrían ser más eficientes)

**¿Quieres que actualice la función `lesson-progress` ahora?** 🚀
