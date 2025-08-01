# 📹 Campos de Video en la Base de Datos

## Estructura Actual de la Tabla `courses`:

Según las migraciones y el script actualizado, la tabla `courses` acepta los siguientes campos para videos:

### 🎬 Campos de Video Disponibles:

| Campo | Tipo | Descripción | Estado Actual |
|-------|------|-------------|---------------|
| `thumbnail_url` | TEXT | URL de la imagen de vista previa | ✅ **Necesario** |
| `intro_video_url` | TEXT | Video introductorio (archivo subido) | ⚠️ **Duplicado** |
| `trailer_url` | TEXT | Video introductorio (YouTube embed) | ⚠️ **Duplicado** |

> **⚠️ PROBLEMA IDENTIFICADO**: `intro_video_url` y `trailer_url` son conceptualmente lo mismo (video introductorio), pero manejan diferentes fuentes (archivo vs YouTube). Esto puede crear confusión.

### 💡 **Solución Recomendada**: Unificar en un solo campo

**Opción A - Campo único flexible:**
```sql
-- Usar solo un campo que acepte ambos tipos de URL
ALTER TABLE courses ADD COLUMN video_intro_url TEXT; -- URLs de archivos O YouTube
```

**Opción B - Campo con tipo:**
```sql  
-- Un campo para URL y otro para indicar el tipo
ALTER TABLE courses ADD COLUMN video_intro_url TEXT;
ALTER TABLE courses ADD COLUMN video_intro_type TEXT; -- 'uploaded' o 'youtube'
```

### 📋 Estructura Completa de `courses`:

```sql
CREATE TABLE courses (
    id UUID PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    thumbnail_url TEXT,           -- 🖼️ Imagen del curso
    intro_video_url TEXT,         -- 📹 Video subido
    trailer_url TEXT,             -- 🎬 YouTube embed
    price DECIMAL(10,2),
    instructor_id UUID,
    category_id UUID,
    level TEXT,
    duration_hours INTEGER,
    published BOOLEAN,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

## 📋 Estructura de la Tabla `lessons`:

```sql
CREATE TABLE lessons (
    id UUID PRIMARY KEY,
    course_id UUID,
    title TEXT NOT NULL,
    description TEXT,
    video_url TEXT,               -- 📹 Video de la lección
    duration_minutes INTEGER,
    order_index INTEGER,
    is_free BOOLEAN,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

## 🚀 ¿Qué Puedes Usar Ahora?

### **Estado Actual** (Duplicado):
- **`intro_video_url`**: Videos subidos a Supabase Storage
- **`trailer_url`**: Links de YouTube embebidos
- **`thumbnail_url`**: Imagen de vista previa

### **Recomendación**: Elegir UNA de estas opciones:

#### ✅ **Opción 1: Solo `intro_video_url`** (Más Simple)
- Usar este campo para **ambos casos** (archivos subidos Y YouTube)
- El frontend detecta automáticamente el tipo por la URL
- Eliminar `trailer_url` en una futura migración

#### ✅ **Opción 2: Solo `trailer_url`** (Más Descriptivo)  
- Usar este campo para **ambos casos**
- Renombrar a `video_url` para mayor claridad
- Eliminar `intro_video_url` en una futura migración

### Para **Lecciones**:
1. **`video_url`**: Para videos de lecciones (pueden ser subidos o YouTube)

## 💡 Mi Recomendación Final - ✅ IMPLEMENTADA:

### 🔧 **Solución: Un campo + selector de tipo**

```sql
-- Estructura final (ya en migration-fixed.sql)
CREATE TABLE courses (
    intro_video_url TEXT,         -- 📹 Video único (archivo O YouTube)
    intro_video_type TEXT,        -- 🎛️ Tipo: 'upload' o 'youtube'
    thumbnail_url TEXT            -- 🖼️ Imagen del curso
);
```

### ✅ **Interfaz de Admin Creada**:
- **Componente**: `VideoUploader.tsx` 
- **Opciones**: Radio buttons para elegir tipo
- **Upload**: Drag & drop con preview y progreso
- **YouTube**: Input URL con conversión automática a embed
- **Preview**: Muestra video en ambos casos

### 🎯 **Cómo funciona para el usuario**:
1. **Selecciona tipo**: "Subir Archivo" O "Link de YouTube"
2. **Subir archivo**: Drag & drop → se guarda en Supabase Storage
3. **YouTube**: Pega URL → se convierte automáticamente a embed
4. **Preview**: Ve el video inmediatamente
5. **Base de datos**: Todo se guarda en `intro_video_url` + `intro_video_type`

### 🚀 **Para usar**:
1. Ejecuta `migration-fixed.sql` para consolidar campos
2. El `AdminCourseEditor` ya tiene el nuevo componente
3. El usuario puede elegir subir O poner YouTube

**¡Problema resuelto!** Un solo campo, doble funcionalidad, interfaz intuitiva.
