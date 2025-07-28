# Script PowerShell para crear un administrador en Supabase
# Este script utiliza la Supabase CLI para crear el usuario

Write-Host "Creando usuario administrador en Supabase..." -ForegroundColor Green

# Configuracion
$EMAIL = "carlosjchiles@gmail.com"
$PASSWORD = "Cjchs123@"
$FULL_NAME = "Carlos J. Chile S."

# Verificar que supabase CLI este instalado
$supabaseCmd = Get-Command supabase -ErrorAction SilentlyContinue
if (-not $supabaseCmd) {
    Write-Host "Error: Supabase CLI no esta instalado" -ForegroundColor Red
    Write-Host "Instala Supabase CLI: npm install -g supabase" -ForegroundColor Yellow
    exit 1
}

Write-Host "Email: $EMAIL" -ForegroundColor Cyan
Write-Host "Nombre: $FULL_NAME" -ForegroundColor Cyan
Write-Host "Rol: admin" -ForegroundColor Cyan

# Crear el usuario usando Supabase CLI
Write-Host "Creando usuario en Supabase Auth..." -ForegroundColor Yellow

# Nota: Este comando requiere estar autenticado con Supabase CLI
# Ejecutar: supabase login primero

supabase auth users create --email $EMAIL --password $PASSWORD --confirm

if ($LASTEXITCODE -eq 0) {
    Write-Host "Usuario creado exitosamente en Auth" -ForegroundColor Green
    
    # Ahora ejecutar el script SQL para crear el perfil de admin
    Write-Host "Creando perfil de administrador..." -ForegroundColor Yellow
    
    # Ejecutar el script SQL
    supabase db exec --file scripts/create-admin.sql
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Perfil de administrador creado exitosamente" -ForegroundColor Green
        Write-Host ""
        Write-Host "Usuario administrador creado completamente!" -ForegroundColor Green
        Write-Host "Email: $EMAIL" -ForegroundColor Cyan
        Write-Host "Contrasena: $PASSWORD" -ForegroundColor Cyan
        Write-Host "Rol: Administrador" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "Puedes acceder al panel de administracion en: /admin" -ForegroundColor Yellow
    } else {
        Write-Host "Error al crear el perfil de administrador" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "Error al crear el usuario en Auth" -ForegroundColor Red
    exit 1
}
