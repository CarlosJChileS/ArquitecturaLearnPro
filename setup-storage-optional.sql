-- ===================================================================
-- CONFIGURACIÓN OPCIONAL: Supabase Storage para avatares
-- Descripción: Configuración opcional de storage (puede ejecutarse después)
-- Fecha: 2025-08-01
-- ===================================================================

-- NOTA: Este script es opcional y puede ejecutarse cuando se desee 
-- habilitar la subida de archivos reales. Por ahora la app funciona
-- con base64 como solución temporal.

-- Verificar si el bucket ya existe
SELECT 
    id, 
    name, 
    public, 
    created_at,
    CASE WHEN public THEN 'Público' ELSE 'Privado' END as acceso
FROM storage.buckets 
WHERE id = 'user-content';

-- Solo crear bucket si no existe
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'user-content') THEN
        INSERT INTO storage.buckets (id, name, public) 
        VALUES ('user-content', 'user-content', true);
        RAISE NOTICE 'Bucket user-content creado exitosamente';
    ELSE
        RAISE NOTICE 'Bucket user-content ya existe';
    END IF;
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Error creando bucket: %', SQLERRM;
END $$;

-- Verificar buckets existentes
SELECT 
    id, 
    name, 
    public,
    created_at
FROM storage.buckets 
ORDER BY created_at DESC;

RAISE NOTICE 'Configuración de storage opcional completada';
RAISE NOTICE 'La aplicación funciona con o sin storage configurado';
