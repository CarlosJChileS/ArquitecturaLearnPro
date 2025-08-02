-- ===================================================================
-- CONFIGURACIÓN: Supabase Storage para avatares de usuario
-- Descripción: Crea bucket y políticas para subir avatares de perfil
-- Fecha: 2025-08-01
-- ===================================================================

-- Crear bucket para contenido de usuarios si no existe
INSERT INTO storage.buckets (id, name, public) 
VALUES ('user-content', 'user-content', true)
ON CONFLICT (id) DO NOTHING;

-- Eliminar políticas existentes si existen
DROP POLICY IF EXISTS "Users can upload their own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Public can view avatars" ON storage.objects;

-- Política: Permitir a usuarios autenticados subir archivos a su carpeta
CREATE POLICY "Users can upload to their own folder" ON storage.objects
FOR INSERT 
WITH CHECK (
  bucket_id = 'user-content' 
  AND auth.uid()::text = (string_to_array(name, '/'))[1]
);

-- Política: Permitir a usuarios actualizar archivos en su carpeta
CREATE POLICY "Users can update their own files" ON storage.objects
FOR UPDATE 
USING (
  bucket_id = 'user-content' 
  AND auth.uid()::text = (string_to_array(name, '/'))[1]
);

-- Política: Permitir a usuarios eliminar archivos en su carpeta
CREATE POLICY "Users can delete their own files" ON storage.objects
FOR DELETE 
USING (
  bucket_id = 'user-content' 
  AND auth.uid()::text = (string_to_array(name, '/'))[1]
);

-- Política: Permitir acceso público de lectura a todos los archivos
CREATE POLICY "Public can view all files" ON storage.objects
FOR SELECT 
USING (bucket_id = 'user-content');

-- Verificar que el bucket fue creado
SELECT id, name, public, created_at 
FROM storage.buckets 
WHERE id = 'user-content';

-- Verificar las políticas creadas
SELECT policyname, permissive, cmd
FROM pg_policies 
WHERE tablename = 'objects' 
AND schemaname = 'storage'
AND policyname LIKE '%user-content%' OR policyname LIKE '%avatar%' OR policyname LIKE '%files%';
