import React, { useState } from 'react';
import { Play, ExternalLink } from 'lucide-react';
import { extractYouTubeVideoId, getYouTubeThumbnail } from '../lib/youtube-utils';

interface CourseVideoPreviewProps {
  videoUrl?: string;
  courseName?: string;
  className?: string;
}

export function CourseVideoPreview({ videoUrl, courseName, className = '' }: CourseVideoPreviewProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  if (!videoUrl) {
    return null;
  }

  const videoId = extractYouTubeVideoId(videoUrl);
  
  if (!videoId) {
    // For non-YouTube URLs, show a generic video link
    return (
      <div className={`bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg p-6 text-center ${className}`}>
        <ExternalLink className="w-8 h-8 mx-auto mb-2 text-gray-600" />
        <p className="text-sm text-gray-600 mb-3">Video introductorio disponible</p>
        <a
          href={videoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <ExternalLink className="w-4 h-4 mr-2" />
          Ver video
        </a>
      </div>
    );
  }

  if (isPlaying) {
    return (
      <div className={`relative aspect-video rounded-lg overflow-hidden ${className}`}>
        <iframe
          src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
          title={`Video introductorio: ${courseName || 'Curso'}`}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="w-full h-full"
        />
      </div>
    );
  }

  return (
    <div className={`relative aspect-video rounded-lg overflow-hidden cursor-pointer group ${className}`}>
      <img
        src={getYouTubeThumbnail(videoId, 'maxres')}
        alt={`Vista previa: ${courseName || 'Video introductorio'}`}
        className="w-full h-full object-cover transition-transform group-hover:scale-105"
        onError={(e) => {
          // Fallback to medium quality thumbnail if maxres fails
          const target = e.target as HTMLImageElement;
          target.src = getYouTubeThumbnail(videoId, 'hq');
        }}
      />
      
      {/* Overlay oscuro */}
      <div className="absolute inset-0 bg-black bg-opacity-30 group-hover:bg-opacity-20 transition-all" />
      
      {/* Botón de play */}
      <div 
        className="absolute inset-0 flex items-center justify-center"
        onClick={() => setIsPlaying(true)}
      >
        <div className="bg-red-600 text-white rounded-full p-4 shadow-lg transform group-hover:scale-110 transition-transform">
          <Play className="w-8 h-8 ml-1" fill="currentColor" />
        </div>
      </div>
      
      {/* Etiqueta de YouTube */}
      <div className="absolute top-3 right-3 bg-red-600 text-white px-2 py-1 rounded text-xs font-medium">
        YouTube
      </div>
      
      {/* Título en la parte inferior */}
      {courseName && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
          <p className="text-white text-sm font-medium">
            Video introductorio: {courseName}
          </p>
        </div>
      )}
    </div>
  );
}

export default CourseVideoPreview;
