# Guía para Crear Usuario Administrador en Supabase

## Credenciales del Sistema

**El sistema usa estas credenciales por defecto:**
- **Email:** admin@learnpro.com
- **Contraseña:** admin123

**O también puedes crear tu propio admin:**
- **Email:** carlosjchiles@gmail.com
- **Contraseña:** Cjchs123@

## Método Manual (Recomendado)

### Opción A: Crear admin@learnpro.com

1. Ve a tu dashboard de Supabase: https://supabase.com/dashboard
2. Selecciona tu proyecto: `xfuhbjqqlgfxxkjvezhy`
3. Ve a **Authentication** > **Users**
4. Haz clic en **"Add user"**
5. Completa los datos:
   - **Email:** admin@learnpro.com
   - **Password:** admin123
   - **Confirm password:** admin123
   - Marca **"Auto confirm user"** ✅
6. Haz clic en **"Create user"**

### Opción B: Crear carlosjchiles@gmail.com

1. Sigue los mismos pasos pero con:
   - **Email:** carlosjchiles@gmail.com
   - **Password:** Cjchs123@

### Paso 2: Crear Perfil de Administrador

1. Ve a **Database** > **Table Editor**
2. Selecciona la tabla **`profiles`**
3. Haz clic en **"Insert row"**
4. Completa los campos:
   - **user_id:** [Copia el UUID del usuario que acabas de crear]
   - **full_name:** Administrador Principal (o Carlos J. Chile S.)
   - **role:** admin
   - **created_at:** now() [se llena automáticamente]
   - **updated_at:** now() [se llena automáticamente]
5. Haz clic en **"Save"**

### Paso 3: Verificar

1. Ve a **Database** > **SQL Editor**
2. Ejecuta esta consulta para verificar:

```sql
SELECT 
    p.user_id,
    u.email,
    p.full_name,
    p.role,
    p.created_at
FROM public.profiles p
JOIN auth.users u ON p.user_id = u.id
WHERE u.email IN ('admin@learnpro.com', 'carlosjchiles@gmail.com');
```

## Datos de Acceso

### Credenciales del Sistema:
- **Email:** admin@learnpro.com
- **Contraseña:** admin123

### Credenciales Personales:
- **Email:** carlosjchiles@gmail.com
- **Contraseña:** Cjchs123@

## Acceso al Panel

Una vez creado, puedes acceder al panel de administración en:
- URL: http://localhost:5173/admin
- Usa cualquiera de las dos credenciales de arriba

## Problemas Comunes

### "User already exists"
Si el usuario ya existe, solo ejecuta el script SQL para actualizar el rol.

### No aparece como admin
Verifica que el perfil en la tabla `profiles` tenga:
- `role = 'admin'`
- `user_id` coincida con el UUID del usuario en auth.users

### No puede acceder al panel
1. Verifica que el usuario esté confirmado en Authentication
2. Verifica que exista el perfil en la tabla profiles
3. Verifica que el rol sea exactamente 'admin' (en minúsculas)
