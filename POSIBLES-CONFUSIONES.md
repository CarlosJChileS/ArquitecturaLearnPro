# 🚨 PUNTOS DE CONFUSIÓN IDENTIFICADOS

## 1. 🔄 **Campo `is_published` vs `published`**

### **PROBLEMA**:
- **Base de datos**: Puede tener `is_published` (campo viejo)
- **Frontend**: Usa `published` (campo nuevo)
- **AdminDashboard**: Hace conversión manual `published: course.is_published || false`

### **EVIDENCIA**:
```typescript
// En AdminDashboard.tsx línea 363
is_published,

// Línea 381 - Conversión manual
published: course.is_published || false,
```

### **SOLUCIÓN**:
El script de migración ya maneja esto correctamente:
```sql
UPDATE courses SET published = COALESCE(is_published, false);
```

---

## 2. 🆔 **Campo `user_id` vs `id` en profiles**

### **PROBLEMA**:
- **Profiles**: Tiene tanto `id` como `user_id`
- **Foreign keys**: Apuntan a `profiles.user_id`
- **AuthContext**: Hace doble query (user_id, luego id como fallback)

### **EVIDENCIA**:
```typescript
// AuthContext.tsx - Doble query
.eq('user_id', userId)  // Primero
.eq('id', userId)       // Fallback
```

### **ESTADO**: ✅ **MANEJADO CORRECTAMENTE**
El AuthContext ya tiene fallback y la migración sincroniza ambos campos.

---

## 3. 🎬 **Campo `trailer_url` en CourseDetail**

### **PROBLEMA**:
- **CourseDetail.tsx**: Todavía usa `trailer_url`
- **Migración**: Consolida a `intro_video_url`
- **AdminCourseEditor**: Ya actualizado a `intro_video_url`

### **EVIDENCIA**:
```typescript
// CourseDetail.tsx línea 55
trailer_url?: string;

// Línea 415
{course.trailer_url ? (
```

### **SOLUCIÓN NECESARIA**: ❌ **REQUIERE ACTUALIZACIÓN**

---

## 4. 📊 **Inconsistencia en datos de prueba**

### **PROBLEMA**:
- **database-utils.ts**: Crea datos con `published: true`
- **AdminDashboard**: Datos de ejemplo con `published: false`

### **EVIDENCIA**:
```typescript
// database-utils.ts línea 172
published: true

// AdminDashboard.tsx línea 134
published: false,
```

### **ESTADO**: ⚠️ **MENOR - Solo afecta datos de prueba**

---

## 🎯 **ACCIONES REQUERIDAS**:

### ✅ **YA CORREGIDAS**:
1. `enrollments` → `course_enrollments` (migración)
2. `is_published` → `published` (migración)  
3. `trailer_url` → `intro_video_url` en AdminCourseEditor ✅
4. `user_id` vs `id` (AuthContext con fallback) ✅
5. **NUEVO**: `trailer_url` → `intro_video_url` en CourseDetail ✅
6. **NUEVO**: Interface `Enrollment` actualizada con `enrolled_at` ✅
7. **NUEVO**: VideoUploader creado con selector de tipo ✅

### ❌ **PENDIENTES DE CORRECCIÓN**:
~~1. CourseDetail.tsx - Actualizar trailer_url → intro_video_url~~ ✅ **CORREGIDO**
~~2. Tipos TypeScript - Actualizar interfaces~~ ✅ **CORREGIDO**  
3. **Verificar otros componentes** que usen `trailer_url` (ninguno encontrado)

### 🎉 **ESTADO FINAL**: ✅ **TODAS LAS CONFUSIONES RESUELTAS**

## 📋 **RESUMEN DE CAMBIOS APLICADOS**:

### 🗃️ **Base de Datos** (migration-fixed.sql):
- ✅ Consolida `trailer_url` → `intro_video_url`
- ✅ Agrega `intro_video_type` ('upload' | 'youtube')
- ✅ Migra `is_published` → `published`
- ✅ Migra `enrollments` → `course_enrollments`
- ✅ Sincroniza `user_id` en profiles

### 🎨 **Frontend**:
- ✅ **AdminCourseEditor**: Usa nuevo `VideoUploader` con selector
- ✅ **CourseDetail**: Actualizado a `intro_video_url` + `intro_video_type`
- ✅ **VideoUploader**: Componente nuevo con doble funcionalidad
- ✅ **AuthContext**: Maneja user_id/id con fallback
- ✅ **Interfaces TypeScript**: Actualizadas y sincronizadas

## 🚀 **PARA USAR TODO**:
1. **Ejecuta**: `migration-fixed.sql` en Supabase SQL Editor
2. **Admin funciona**: Crear curso con video (subir O YouTube)
3. **Usuario ve**: Video en CourseDetail (ambos tipos)
4. **Sin confusiones**: Un solo campo, interfaz clara

## 📋 **SCRIPT DE VERIFICACIÓN**:
```bash
# Buscar referencias pendientes
grep -r "trailer_url" src/
grep -r "is_published" src/
grep -r "enrollments[^_]" src/
```
