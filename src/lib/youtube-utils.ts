/**
 * Utilidades para trabajar con videos de YouTube
 */

/**
 * Extrae el ID de video de una URL de YouTube
 * Soporta varios formatos:
 * - https://www.youtube.com/watch?v=dQw4w9WgXcQ
 * - https://youtu.be/dQw4w9WgXcQ
 * - https://www.youtube.com/embed/dQw4w9WgXcQ
 * - https://m.youtube.com/watch?v=dQw4w9WgXcQ
 */
export function extractYouTubeVideoId(url: string): string | null {
  if (!url) return null;

  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/v\/([^&\n?#]+)/,
    /youtube\.com\/.*[?&]v=([^&\n?#]+)/
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  return null;
}

/**
 * Genera la URL del thumbnail de un video de YouTube
 * @param videoId - ID del video de YouTube
 * @param quality - Calidad del thumbnail: 'default', 'hq', 'mq', 'sd', 'maxres'
 */
export function getYouTubeThumbnail(videoId: string, quality: 'default' | 'hq' | 'mq' | 'sd' | 'maxres' = 'hq'): string {
  const qualityMap = {
    'default': 'default',
    'hq': 'hqdefault',
    'mq': 'mqdefault', 
    'sd': 'sddefault',
    'maxres': 'maxresdefault'
  };

  return `https://img.youtube.com/vi/${videoId}/${qualityMap[quality]}.jpg`;
}

/**
 * Genera la URL de embed de un video de YouTube
 * @param videoId - ID del video de YouTube
 * @param options - Opciones adicionales para el embed
 */
export function getYouTubeEmbedUrl(videoId: string, options: {
  autoplay?: boolean;
  mute?: boolean;
  controls?: boolean;
  start?: number;
  end?: number;
} = {}): string {
  const params = new URLSearchParams();
  
  if (options.autoplay) params.set('autoplay', '1');
  if (options.mute) params.set('mute', '1');
  if (options.controls === false) params.set('controls', '0');
  if (options.start) params.set('start', options.start.toString());
  if (options.end) params.set('end', options.end.toString());

  const queryString = params.toString();
  return `https://www.youtube.com/embed/${videoId}${queryString ? `?${queryString}` : ''}`;
}

/**
 * Valida si una URL es de YouTube
 */
export function isYouTubeUrl(url: string): boolean {
  return extractYouTubeVideoId(url) !== null;
}

/**
 * Obtiene información básica de un video de YouTube (solo con datos disponibles desde la URL)
 */
export function getYouTubeVideoInfo(url: string) {
  const videoId = extractYouTubeVideoId(url);
  
  if (!videoId) {
    return null;
  }

  return {
    videoId,
    thumbnailUrl: getYouTubeThumbnail(videoId),
    embedUrl: getYouTubeEmbedUrl(videoId),
    watchUrl: `https://www.youtube.com/watch?v=${videoId}`,
    isValid: true
  };
}
