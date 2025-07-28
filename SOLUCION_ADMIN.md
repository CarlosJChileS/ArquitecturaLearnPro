# Solución: Problema de Redirección para Administradores

## El Problema
El sistema de login no redirige correctamente a los administradores después de autenticarse.

## Cambios Realizados

### 1. AdminLogin.tsx actualizado
- Ahora usa el sistema de autenticación de Supabase en lugar de localStorage
- Redirige automáticamente a `/admin` cuando el usuario se autentica como admin

### 2. Login.tsx actualizado  
- Ahora detecta el rol del usuario y redirige según corresponda:
  - Admin → `/admin`
  - Instructor → `/instructor` 
  - Student → `/dashboard`

### 3. Rutas actualizadas en App.tsx
- Agregada ruta `/admin` que apunta al AdminDashboard
- Mantiene `/admin/dashboard` como alternativa

## Pasos para Resolver

### Opción 1: Crear usuario admin@learnpro.com en Supabase

1. **Dashboard de Supabase:** https://supabase.com/dashboard
2. **Proyecto:** `xfuhbjqqlgfxxkjvezhy`
3. **Authentication > Users > Add user:**
   - Email: `admin@learnpro.com`
   - Password: `admin123`
   - Auto confirm: ✅

4. **Database > SQL Editor** - Ejecutar:
```sql
-- Script para crear perfil de admin
DO $$
DECLARE
    user_uuid UUID;
BEGIN
    SELECT id INTO user_uuid 
    FROM auth.users 
    WHERE email = 'admin@learnpro.com';
    
    IF user_uuid IS NOT NULL THEN
        INSERT INTO public.profiles (user_id, full_name, role, created_at, updated_at)
        VALUES (
            user_uuid,
            'Administrador Principal',
            'admin',
            NOW(),
            NOW()
        )
        ON CONFLICT (user_id) 
        DO UPDATE SET 
            role = 'admin',
            updated_at = NOW();
    END IF;
END $$;
```

### Opción 2: Verificar y reparar usuarios existentes

Ejecuta el script `scripts/verify-admin.sql` para:
- Ver usuarios existentes
- Detectar usuarios sin perfil
- Crear perfiles faltantes automáticamente

## URLs de Acceso

- **Login General:** `/login`
- **Login Admin:** `/admin/login` 
- **Panel Admin:** `/admin`

## Credenciales de Prueba

```
Email: admin@learnpro.com
Password: admin123
```

## Flujo Correcto

1. Usuario va a `/login` o `/admin/login`
2. Ingresa credenciales admin@learnpro.com / admin123
3. Sistema autentica con Supabase
4. AuthContext detecta role = 'admin'
5. Redirecciona automáticamente a `/admin`
6. AdminProtectedRoute verifica permisos
7. Muestra AdminDashboard

## Debug: Verificar Estado

En las herramientas de desarrollador:

```javascript
// Verificar usuario actual
console.log('User:', window.supabase.auth.getUser());

// Verificar perfil en localStorage
console.log('Profile:', localStorage.getItem('profile'));
```

## Si Sigue Sin Funcionar

1. Verificar que el usuario existe en `auth.users`
2. Verificar que tiene perfil en `profiles` con `role = 'admin'`
3. Limpiar caché del navegador
4. Verificar que no hay errores en la consola
5. Usar el script `verify-admin.sql` para diagnosticar
