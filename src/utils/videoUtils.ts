/**
 * Converts standard YouTube/Vimeo URLs into their corresponding embed formats.
 * Supported: YouTube, Vimeo
 */
export const getEmbedUrl = (url: string): string => {
  if (!url) return '';

  // YouTube
  // Matches: 
  // - https://www.youtube.com/watch?v=dQw4w9WgXcQ
  // - https://youtu.be/dQw4w9WgXcQ
  // - https://www.youtube.com/shorts/someid
  const ytMatch = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
  if (ytMatch && ytMatch[1]) {
    return `https://www.youtube.com/embed/${ytMatch[1]}`;
  }

  // Vimeo
  // Matches: https://vimeo.com/123456789
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch && vimeoMatch[1]) {
    return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
  }

  // Google Drive
  // Matches: https://drive.google.com/file/d/1abc.../view?usp=sharing
  const gdriveMatch = url.match(/drive\.google\.com\/file\/d\/([^\/]+)/);
  if (gdriveMatch && gdriveMatch[1]) {
    return `https://drive.google.com/file/d/${gdriveMatch[1]}/preview`;
  }

  // If already an embed URL or other, return as is (safely)
  return url;
};

/**
 * Extracts a thumbnail for YouTube if possible
 */
export const getThumbnail = (url: string): string => {
  const ytMatch = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
  if (ytMatch && ytMatch[1]) {
    return `https://img.youtube.com/vi/${ytMatch[1]}/maxresdefault.jpg`;
  }
  
  // Default fallback if no thumbnail can be extracted
  return 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&q=80';
};
