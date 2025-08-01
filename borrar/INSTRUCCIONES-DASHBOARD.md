# 🎯 INSTRUCCIONES PASO A PASO - DASHBOARD SUPABASE

## 📍 PASO 1: ABRIR SQL EDITOR

1. **Abre tu navegador** y ve a: https://app.supabase.com/project/xfuhbjqqlgfxxkjvezhy/sql
2. **Inicia sesión** si no lo has hecho
3. **Click en "New query"** (botón verde en la esquina superior derecha)

## 📍 PASO 2: EJECUTAR PRIMERA MIGRACIÓN

1. **Copia TODO el contenido** del archivo: `COPIAR-MIGRACION-1.sql`

2. **Pégalo** en el editor SQL

3. **Click en "RUN"** (botón azul) ▶️

4. **Espera** a que aparezca "Success" en verde

⚠️ **IMPORTANTE**: Si ves errores como "already exists", NO te preocupes. Continúa con el siguiente paso.

## 📍 PASO 3: EJECUTAR SEGUNDA MIGRACIÓN (CORREGIDA)

1. **Click en "New query"** nuevamente

2. **Copia TODO el contenido** del archivo: `COPIAR-MIGRACION-2.sql` ⭐ **(ESTE ARCHIVO ESTÁ CORREGIDO)**

3. **Pégalo** en el editor SQL

4. **Click en "RUN"** ▶️

5. **Espera** a que aparezca "Success"

## 📍 PASO 4: VERIFICAR (OPCIONAL)

1. **Click en "New query"** una vez más

2. **Copia TODO el contenido** del archivo: `verify-database-structure.sql`

3. **Pégalo** y **ejecuta**

4. **Revisa los resultados** - deberías ver tablas marcadas como "✓ Existe"

---

## � **CORRECCIÓN APLICADA**

El error que experimentaste:
```
ERROR: cannot change name of input parameter "user_id"
```

Ha sido **SOLUCIONADO** en `COPIAR-MIGRACION-2.sql` mediante:
- ✅ Eliminación de funciones existentes antes de crearlas
- ✅ Manejo seguro de triggers
- ✅ Verificaciones de existencia de tablas

---

## �🚨 ERRORES COMUNES (NO TE PREOCUPES)

Si ves estos errores, es normal:
- `relation "profiles" already exists` ✅ 
- `column "subscription_tier" already exists` ✅
- `function "track_student_event" does not exist` ✅ (se crea después)
- `trigger "..." already exists` ✅

## ✅ SEÑALES DE ÉXITO

Después de ejecutar las migraciones, deberías poder:
- ✅ Navegar por la aplicación sin errores de consola
- ✅ Ver el dashboard de estudiante
- ✅ Inscribirte en cursos
- ✅ Ver progreso de lecciones

---

## 📞 ¿NECESITAS AYUDA?

Si algo no funciona:
1. Revisa la consola del navegador (F12)
2. Ve a Supabase → Edge Functions → Logs
3. Mira si hay errores específicos

**¡Estoy aquí para ayudarte! 🚀**
