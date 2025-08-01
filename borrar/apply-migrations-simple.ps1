# Script simplificado para aplicar migraciones de base de datos
# Filename: apply-migrations-simple.ps1

Write-Host "🚀 LEARNPRO MVP - APLICADOR DE MIGRACIONES" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════" -ForegroundColor Green

# Verificar directorio
if (-not (Test-Path "supabase/migrations")) {
    Write-Host "❌ No se encontró el directorio supabase/migrations" -ForegroundColor Red
    Write-Host "💡 Asegúrate de estar en el directorio raíz del proyecto" -ForegroundColor Yellow
    exit 1
}

# Mostrar archivos disponibles
Write-Host "`n📁 Migraciones disponibles:" -ForegroundColor Blue
Get-ChildItem "supabase/migrations/*.sql" | Sort-Object Name | ForEach-Object {
    Write-Host "   📄 $($_.Name)" -ForegroundColor Cyan
}

Write-Host "`n🔗 Probando conexión a Supabase..." -ForegroundColor Blue

# Intentar push de migraciones
try {
    Write-Host "🚀 Ejecutando: npx supabase db push" -ForegroundColor Blue
    $result = npx supabase db push 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ ¡Migraciones aplicadas exitosamente!" -ForegroundColor Green
        Write-Host "`n📊 Verificando estructura..." -ForegroundColor Blue
        
        # Mostrar instrucciones de verificación
        Write-Host "`n🔍 Para verificar que todo esté correcto:" -ForegroundColor Yellow
        Write-Host "1. Ve a https://app.supabase.com/project/xfuhbjqqlgfxxkjvezhy" -ForegroundColor Cyan
        Write-Host "2. Navega a 'SQL Editor'" -ForegroundColor Cyan
        Write-Host "3. Ejecuta el contenido de: verify-database-structure.sql" -ForegroundColor Cyan
        
    } else {
        Write-Host "⚠️  Error aplicando migraciones automáticamente" -ForegroundColor Yellow
        Write-Host "Resultado: $result" -ForegroundColor Red
        Show-ManualInstructions
    }
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
    Show-ManualInstructions
}

function Show-ManualInstructions {
    Write-Host "`n📋 INSTRUCCIONES MANUALES" -ForegroundColor Yellow
    Write-Host "═══════════════════════════" -ForegroundColor Yellow
    Write-Host "1. Ve a https://app.supabase.com/project/xfuhbjqqlgfxxkjvezhy" -ForegroundColor Cyan
    Write-Host "2. Navega a 'SQL Editor'" -ForegroundColor Cyan
    Write-Host "3. Ejecuta los siguientes archivos EN ORDEN:" -ForegroundColor Cyan
    Write-Host "   a) 20250729150000_fix_database_structure.sql" -ForegroundColor Cyan
    Write-Host "   b) 20250729160000_create_missing_functions.sql" -ForegroundColor Cyan
    Write-Host "4. Ejecuta verify-database-structure.sql para verificar" -ForegroundColor Cyan
    Write-Host "`n📄 Los archivos están en la carpeta supabase/migrations/" -ForegroundColor Blue
}

# Si llegamos aquí y no pudimos aplicar automáticamente
if ($LASTEXITCODE -ne 0) {
    Show-ManualInstructions
}

Write-Host "`n📚 Para más información:" -ForegroundColor Blue
Write-Host "   📄 DATABASE-FIX-GUIDE.md" -ForegroundColor Cyan
Write-Host "`n🎉 ¡Listo!" -ForegroundColor Green
