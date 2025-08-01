// Mejora sugerida para AdminDashboard.tsx - Sección de Video Introductorio

const VideoIntroSection = () => {
  const [videoType, setVideoType] = useState<'upload' | 'youtube'>('upload');

  return (
    <div className="space-y-2">
      <Label>Video Introductorio</Label>
      
      {/* Selector de tipo de video */}
      <div className="flex items-center space-x-4 mb-2">
        <label className="flex items-center">
          <input
            type="radio"
            name="videoType"
            value="upload"
            checked={videoType === 'upload'}
            onChange={(e) => setVideoType(e.target.value as 'upload' | 'youtube')}
            className="mr-2"
          />
          Subir Video
        </label>
        <label className="flex items-center">
          <input
            type="radio"
            name="videoType"
            value="youtube"
            checked={videoType === 'youtube'}
            onChange={(e) => setVideoType(e.target.value as 'upload' | 'youtube')}
            className="mr-2"
          />
          Link de YouTube
        </label>
      </div>

      {/* Opción para subir archivo */}
      {videoType === 'upload' && (
        <div className="flex items-center space-x-2">
          <Input
            type="file"
            accept="video/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleIntroVideoUpload(file);
            }}
          />
          {courseForm.intro_video_url && (
            <video controls className="w-24 h-12">
              <source src={courseForm.intro_video_url} type="video/mp4" />
            </video>
          )}
        </div>
      )}

      {/* Opción para link de YouTube */}
      {videoType === 'youtube' && (
        <div className="space-y-2">
          <Input
            type="url"
            placeholder="https://www.youtube.com/embed/VIDEO_ID"
            value={courseForm.trailer_url || ''}
            onChange={(e) => setCourseForm({ 
              ...courseForm, 
              trailer_url: e.target.value 
            })}
          />
          <p className="text-sm text-muted-foreground">
            💡 Usa el formato: https://www.youtube.com/embed/VIDEO_ID
          </p>
          {courseForm.trailer_url && (
            <iframe
              src={courseForm.trailer_url}
              className="w-full h-32 rounded"
              title="Vista previa"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            />
          )}
        </div>
      )}
    </div>
  );
};
