/**
 * Sharing utility functions for social media and link sharing
 */

export interface ShareData {
  url: string;
  title: string;
  description?: string;
  image?: string;
}

/**
 * Get the base URL for sharing
 */
export function getBaseUrl(): string {
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  return process.env.NEXT_PUBLIC_BASE_URL || 'https://blacctheddi.com';
}

/**
 * Generate sharing URLs for different platforms
 */
export function generateShareUrls(data: ShareData) {
  const { url, title, description } = data;
  
  return {
    twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    whatsapp: `https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}`,
    telegram: `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
    reddit: `https://reddit.com/submit?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`,
  };
}

/**
 * Copy text to clipboard with fallback
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const result = document.execCommand('copy');
      document.body.removeChild(textArea);
      return result;
    }
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return false;
  }
}

/**
 * Open sharing window for a specific platform
 */
export function openShareWindow(platform: string, url: string, title?: string) {
  const shareUrls = generateShareUrls({ url, title: title || '' });
  const shareUrl = shareUrls[platform as keyof typeof shareUrls];
  
  if (shareUrl) {
    window.open(shareUrl, '_blank', 'width=600,height=400,scrollbars=yes,resizable=yes');
  }
}

/**
 * Generate post sharing data
 */
export function generatePostShareData(postId: string, title: string, description?: string): ShareData {
  const baseUrl = getBaseUrl();
  return {
    url: `${baseUrl}/${postId}`,
    title,
    description,
  };
}

/**
 * Generate video sharing data
 */
export function generateVideoShareData(videoId: string, title: string, description?: string): ShareData {
  const baseUrl = getBaseUrl();
  return {
    url: `${baseUrl}/tv/${videoId}`,
    title,
    description,
  };
}

/**
 * Share to native mobile apps (if available)
 */
export function shareNative(data: ShareData): Promise<boolean> {
  return new Promise((resolve) => {
    if (navigator.share) {
      navigator.share({
        title: data.title,
        text: data.description,
        url: data.url,
      })
        .then(() => resolve(true))
        .catch(() => resolve(false));
    } else {
      resolve(false);
    }
  });
}
