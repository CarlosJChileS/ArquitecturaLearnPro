# Script simple para aplicar migraciones
Write-Host "LEARNPRO MVP - APLICADOR DE MIGRACIONES" -ForegroundColor Green

if (-not (Test-Path "supabase/migrations")) {
    Write-Host "Error: No se encontro el directorio supabase/migrations" -ForegroundColor Red
    exit 1
}

Write-Host "Archivos de migraciones disponibles:" -ForegroundColor Blue
Get-ChildItem "supabase/migrations/*.sql" | Sort-Object Name | ForEach-Object {
    Write-Host "  $($_.Name)" -ForegroundColor Cyan
}

Write-Host "Probando conexion a Supabase..." -ForegroundColor Blue

try {
    Write-Host "Ejecutando: npx supabase db push" -ForegroundColor Blue
    npx supabase db push
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Migraciones aplicadas exitosamente!" -ForegroundColor Green
        Write-Host "Para verificar:" -ForegroundColor Yellow
        Write-Host "1. Ve a https://app.supabase.com/project/xfuhbjqqlgfxxkjvezhy" -ForegroundColor Cyan
        Write-Host "2. Navega a SQL Editor" -ForegroundColor Cyan
        Write-Host "3. Ejecuta verify-database-structure.sql" -ForegroundColor Cyan
    } else {
        Write-Host "Error aplicando migraciones automaticamente" -ForegroundColor Yellow
        Write-Host "INSTRUCCIONES MANUALES:" -ForegroundColor Yellow
        Write-Host "1. Ve a https://app.supabase.com/project/xfuhbjqqlgfxxkjvezhy" -ForegroundColor Cyan
        Write-Host "2. Ve a SQL Editor" -ForegroundColor Cyan
        Write-Host "3. Ejecuta primero: 20250729150000_fix_database_structure.sql" -ForegroundColor Cyan
        Write-Host "4. Luego ejecuta: 20250729160000_create_missing_functions.sql" -ForegroundColor Cyan
        Write-Host "5. Finalmente: verify-database-structure.sql" -ForegroundColor Cyan
    }
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "Para mas informacion revisa: DATABASE-FIX-GUIDE.md" -ForegroundColor Blue
