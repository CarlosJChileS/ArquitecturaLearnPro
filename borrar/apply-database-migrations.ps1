# Script para aplicar migraciones de base de datos - LearnPro MVP
# Filename: apply-database-migrations.ps1

param(
    [string]$ProjectRef = "xfuhbjqqlgfxxkjvezhy",
    [string]$Password = "",
    [switch]$UseLocal = $false,
    [switch]$Verify = $false
)

# Colores para output
$Green = "`e[32m"
$Red = "`e[31m"
$Yellow = "`e[33m"
$Blue = "`e[34m"
$Reset = "`e[0m"

function Write-ColorOutput {
    param([string]$Message, [string]$Color = $Reset)
    Write-Host "$Color$Message$Reset"
}

function Test-SupabaseConnection {
    param([string]$ConnectionString)
    
    try {
        Write-ColorOutput "🔗 Probando conexión a Supabase..." $Blue
        
        # Intentar conectar con Supabase CLI
        $result = npx supabase status 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-ColorOutput "✅ Conexión exitosa via Supabase CLI" $Green
            return $true
        } else {
            Write-ColorOutput "⚠️  Supabase CLI no disponible, intentando conexión directa..." $Yellow
            return $false
        }
    } catch {
        Write-ColorOutput "❌ Error al conectar: $($_.Exception.Message)" $Red
        return $false
    }
}

function Apply-Migration {
    param([string]$MigrationFile, [string]$Description)
    
    Write-ColorOutput "📦 Aplicando migración: $Description" $Blue
    Write-ColorOutput "📄 Archivo: $MigrationFile" $Blue
    
    if (-not (Test-Path $MigrationFile)) {
        Write-ColorOutput "❌ Archivo de migración no encontrado: $MigrationFile" $Red
        return $false
    }
    
    try {
        # Intentar con Supabase CLI primero
        Write-ColorOutput "🚀 Ejecutando migración..." $Blue
        $result = npx supabase db push 2>&1
        
        if ($LASTEXITCODE -eq 0) {
            Write-ColorOutput "✅ Migración aplicada exitosamente" $Green
            return $true
        } else {
            Write-ColorOutput "⚠️  Error con Supabase CLI: $result" $Yellow
            Write-ColorOutput "💡 Intenta aplicar manualmente via Dashboard de Supabase" $Yellow
            return $false
        }
    } catch {
        Write-ColorOutput "❌ Error aplicando migración: $($_.Exception.Message)" $Red
        return $false
    }
}

function Show-ManualInstructions {
    Write-ColorOutput "`n📋 INSTRUCCIONES MANUALES" $Yellow
    Write-ColorOutput "═══════════════════════════" $Yellow
    Write-ColorOutput "1. Ve a https://app.supabase.com/project/$ProjectRef" $Blue
    Write-ColorOutput "2. Navega a 'SQL Editor'" $Blue
    Write-ColorOutput "3. Ejecuta los siguientes archivos EN ORDEN:" $Blue
    Write-ColorOutput "   a) supabase/migrations/20250729150000_fix_database_structure.sql" $Blue
    Write-ColorOutput "   b) supabase/migrations/20250729160000_create_missing_functions.sql" $Blue
    Write-ColorOutput "4. Ejecuta verify-database-structure.sql para verificar" $Blue
    Write-ColorOutput "`n🔗 Contenido de las migraciones disponible en los archivos." $Blue
}

function Run-Verification {
    Write-ColorOutput "`n🔍 VERIFICACIÓN DE BASE DE DATOS" $Blue
    Write-ColorOutput "══════════════════════════════════" $Blue
    
    $verifyFile = "verify-database-structure.sql"
    if (Test-Path $verifyFile) {
        Write-ColorOutput "📄 Ejecuta este script en SQL Editor de Supabase:" $Blue
        Write-ColorOutput "   $verifyFile" $Blue
        Write-ColorOutput "`n💡 Este script verificará:" $Yellow
        Write-ColorOutput "   ✓ Existencia de todas las tablas" $Yellow
        Write-ColorOutput "   ✓ Estructura de columnas críticas" $Yellow
        Write-ColorOutput "   ✓ Funciones SQL creadas" $Yellow
        Write-ColorOutput "   ✓ Índices de optimización" $Yellow
        Write-ColorOutput "   ✓ Estado de políticas RLS" $Yellow
        Write-ColorOutput "   ✓ Datos básicos insertados" $Yellow
    } else {
        Write-ColorOutput "❌ Archivo de verificación no encontrado" $Red
    }
}

# Script principal
Write-ColorOutput "🚀 LEARNPRO MVP - APLICADOR DE MIGRACIONES" $Green
Write-ColorOutput "═══════════════════════════════════════════" $Green

# Verificar que estamos en el directorio correcto
if (-not (Test-Path "supabase/migrations")) {
    Write-ColorOutput "❌ No se encontró el directorio supabase/migrations" $Red
    Write-ColorOutput "💡 Asegúrate de estar en el directorio raíz del proyecto" $Yellow
    exit 1
}

# Mostrar archivos de migración disponibles
Write-ColorOutput "`n📁 Migraciones disponibles:" $Blue
Get-ChildItem "supabase/migrations/*.sql" | ForEach-Object {
    Write-ColorOutput "   📄 $($_.Name)" $Blue
}

# Verificar conexión
$connected = Test-SupabaseConnection

if ($connected) {
    Write-ColorOutput "`n🎯 Aplicando migraciones automáticamente..." $Green
    
    # Aplicar migraciones en orden
    $migrations = @(
        @{File="supabase/migrations/20250729150000_fix_database_structure.sql"; Desc="Estructura de base de datos"},
        @{File="supabase/migrations/20250729160000_create_missing_functions.sql"; Desc="Funciones SQL faltantes"}
    )
    
    $success = $true
    foreach ($migration in $migrations) {
        if (-not (Apply-Migration $migration.File $migration.Desc)) {
            $success = $false
            break
        }
        Start-Sleep -Seconds 2
    }
    
    if ($success) {
        Write-ColorOutput "`n✅ TODAS LAS MIGRACIONES APLICADAS EXITOSAMENTE" $Green
        if ($Verify) {
            Run-Verification
        }
    } else {
        Write-ColorOutput "`n❌ Error aplicando migraciones" $Red
        Show-ManualInstructions
    }
} else {
    Write-ColorOutput "`n⚠️  No se pudo conectar automáticamente" $Yellow
    Show-ManualInstructions
}

if ($Verify -and -not $connected) {
    Run-Verification
}

Write-ColorOutput "`n📚 Para más información, revisa:" $Blue
Write-ColorOutput "   📄 DATABASE-FIX-GUIDE.md" $Blue
Write-ColorOutput "`n🎉 ¡Listo! Tu base de datos debería estar actualizada." $Green
