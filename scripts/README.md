# Crear Usuario Administrador en Supabase

Este directorio contiene scripts para crear un usuario administrador en tu proyecto de Supabase.

## Información del Administrador

- **Email:** carlosjchiles@gmail.com
- **Contraseña:** Cjchs123@
- **Nombre:** Carlos J. Chile S.
- **Rol:** admin

## Métodos de Creación

### Método 1: Usando PowerShell (Recomendado para Windows)

```powershell
# Ejecutar desde la raíz del proyecto
.\scripts\create-admin.ps1
```

### Método 2: Usando Bash (Linux/macOS)

```bash
# Ejecutar desde la raíz del proyecto
chmod +x scripts/create-admin.sh
./scripts/create-admin.sh
```

### Método 3: Manualmente usando SQL

1. Ve al dashboard de Supabase
2. Navega a Authentication > Users
3. Crea el usuario manualmente:
   - Email: carlosjchiles@gmail.com
   - Contraseña: Cjchs123@
   - Confirma el email automáticamente
4. Luego ejecuta el script SQL en SQL Editor:

```sql
-- Ejecutar en Supabase SQL Editor
\i scripts/create-admin.sql
```

### Método 4: Usando la Dashboard de Supabase

1. **Crear Usuario en Auth:**
   - Ve a Authentication > Users
   - Haz clic en "Invite"
   - Email: carlosjchiles@gmail.com
   - Contraseña: Cjchs123@
   - Confirma automáticamente

2. **Crear Perfil de Admin:**
   - Ve a Database > Table Editor
   - Selecciona la tabla `profiles`
   - Inserta un nuevo registro:
     ```
     user_id: [UUID del usuario creado]
     full_name: Carlos J. Chile S.
     role: admin
     created_at: now()
     updated_at: now()
     ```

## Requisitos Previos

### Para scripts automatizados:

1. **Instalar Supabase CLI:**
   ```bash
   npm install -g supabase
   ```

2. **Autenticarse con Supabase:**
   ```bash
   supabase login
   ```

3. **Vincular el proyecto:**
   ```bash
   supabase link --project-ref xfuhbjqqlgfxxkjvezhy
   ```

## Verificación

Después de crear el usuario, puedes verificar que todo funciona:

1. Ve a `/admin/login` en tu aplicación
2. Inicia sesión con:
   - Email: carlosjchiles@gmail.com
   - Contraseña: Cjchs123@
3. Deberías acceder al panel de administración

## Resolución de Problemas

### Error: "User already exists"
Si el usuario ya existe, solo ejecuta el script SQL para actualizar el rol a admin.

### Error: "Supabase CLI not found"
Instala la CLI de Supabase:
```bash
npm install -g supabase
```

### Error: "Not logged in"
Autentícate con Supabase:
```bash
supabase login
```

### Error de permisos en scripts
Para Linux/macOS, dale permisos de ejecución:
```bash
chmod +x scripts/create-admin.sh
```
