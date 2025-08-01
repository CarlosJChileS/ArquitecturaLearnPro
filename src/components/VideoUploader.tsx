import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Upload, Youtube, Play, X } from 'lucide-react';
import { supabase } from '../lib/supabase-mvp';

interface VideoUploaderProps {
  value?: string;
  videoType?: 'upload' | 'youtube';
  onChange: (url: string, type: 'upload' | 'youtube') => void;
  onRemove?: () => void;
  label?: string;
  bucket?: string;
  folder?: string;
}

export function VideoUploader({ 
  value, 
  videoType = 'upload',
  onChange, 
  onRemove,
  label = "Video Introductorio",
  bucket = "course-videos",
  folder = "intros"
}: VideoUploaderProps) {
  const [selectedType, setSelectedType] = useState<'upload' | 'youtube'>(videoType);
  const [youtubeUrl, setYoutubeUrl] = useState(selectedType === 'youtube' ? value || '' : '');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar tipo de archivo
    if (!file.type.startsWith('video/')) {
      alert('Por favor selecciona un archivo de video válido');
      return;
    }

    // Validar tamaño (50MB máximo)
    if (file.size > 50 * 1024 * 1024) {
      alert('El archivo es muy grande. Máximo 50MB');
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${folder}/${fileName}`;

      // Simular progreso (Supabase no tiene callback de progreso nativo)
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (error) throw error;

      // Obtener URL pública
      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      onChange(publicUrl, 'upload');
      setUploadProgress(0);
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Error al subir el archivo. Intenta de nuevo.');
    } finally {
      setUploading(false);
    }
  };

  const handleYoutubeUrlChange = (url: string) => {
    setYoutubeUrl(url);
    
    // Convertir URL de YouTube a formato embed si es necesario
    let embedUrl = url;
    if (url.includes('youtube.com/watch?v=')) {
      const videoId = url.split('v=')[1]?.split('&')[0];
      embedUrl = `https://www.youtube.com/embed/${videoId}`;
    } else if (url.includes('youtu.be/')) {
      const videoId = url.split('youtu.be/')[1]?.split('?')[0];
      embedUrl = `https://www.youtube.com/embed/${videoId}`;
    }
    
    onChange(embedUrl, 'youtube');
  };

  const handleTypeChange = (type: 'upload' | 'youtube') => {
    setSelectedType(type);
    if (type === 'youtube' && youtubeUrl) {
      onChange(youtubeUrl, 'youtube');
    } else if (type === 'upload' && value && !value.includes('youtube')) {
      onChange(value, 'upload');
    }
  };

  const getYoutubeVideoId = (url: string) => {
    if (url.includes('/embed/')) {
      return url.split('/embed/')[1]?.split('?')[0];
    }
    return null;
  };

  return (
    <div className="space-y-4">
      <Label className="text-sm font-medium">{label}</Label>
      
      {/* Selector de tipo */}
      <RadioGroup 
        value={selectedType} 
        onValueChange={(value) => handleTypeChange(value as 'upload' | 'youtube')}
        className="flex space-x-6"
      >
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="upload" id="upload" />
          <Label htmlFor="upload" className="flex items-center gap-2 cursor-pointer">
            <Upload className="w-4 h-4" />
            Subir Archivo
          </Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="youtube" id="youtube" />
          <Label htmlFor="youtube" className="flex items-center gap-2 cursor-pointer">
            <Youtube className="w-4 h-4 text-red-500" />
            Link de YouTube
          </Label>
        </div>
      </RadioGroup>

      {/* Contenido según tipo seleccionado */}
      {selectedType === 'upload' ? (
        <div className="space-y-3">
          <div className="flex items-center justify-center w-full">
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload className="w-8 h-8 mb-4 text-gray-500" />
                <p className="mb-2 text-sm text-gray-500">
                  <span className="font-semibold">Click para subir</span> o arrastra aquí
                </p>
                <p className="text-xs text-gray-500">MP4, MOV, AVI (MAX. 50MB)</p>
              </div>
              <input 
                type="file" 
                className="hidden" 
                accept="video/*"
                onChange={handleFileUpload}
                disabled={uploading}
              />
            </label>
          </div>
          
          {uploading && (
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" 
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          <Input
            type="url"
            placeholder="https://www.youtube.com/watch?v=..."
            value={youtubeUrl}
            onChange={(e) => handleYoutubeUrlChange(e.target.value)}
            className="w-full"
          />
          <p className="text-xs text-gray-500">
            Pega la URL completa de YouTube. Se convertirá automáticamente al formato correcto.
          </p>
        </div>
      )}

      {/* Preview del video */}
      {value && (
        <div className="mt-4 p-4 border rounded-lg bg-gray-50">
          <div className="flex items-center justify-between mb-3">
            <Label className="text-sm font-medium">Vista Previa:</Label>
            {onRemove && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onRemove}
                className="text-red-500 hover:text-red-700"
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
          
          {selectedType === 'youtube' ? (
            <div className="aspect-video bg-black rounded">
              <iframe
                src={value}
                className="w-full h-full rounded"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          ) : (
            <div className="aspect-video bg-black rounded flex items-center justify-center">
              <video
                src={value}
                controls
                className="w-full h-full rounded"
                preload="metadata"
              >
                Tu navegador no soporta el elemento video.
              </video>
            </div>
          )}
          
          <p className="text-xs text-gray-500 mt-2 break-all">
            {selectedType === 'youtube' ? '🎬 YouTube: ' : '📁 Archivo: '}
            {value}
          </p>
        </div>
      )}
    </div>
  );
}
