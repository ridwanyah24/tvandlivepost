/**
 * Utility functions for updating page metadata dynamically
 */

export interface MetadataUpdateData {
  title: string;
  description: string;
  imageUrl?: string;
  url?: string;
}

/**
 * Update page metadata dynamically
 */
export function updatePageMetadata(data: MetadataUpdateData) {
  // Update document title
  document.title = `${data.title} | BlaccTheddiLiveUpdatesAndTv`;
  
  // Update meta description
  const metaDescription = document.querySelector('meta[name="description"]');
  if (metaDescription) {
    metaDescription.setAttribute('content', data.description);
  }
  
  // Update OpenGraph tags
  const ogTitle = document.querySelector('meta[property="og:title"]');
  if (ogTitle) {
    ogTitle.setAttribute('content', `${data.title} | BlaccTheddiLiveUpdatesAndTv`);
  }
  
  const ogDescription = document.querySelector('meta[property="og:description"]');
  if (ogDescription) {
    ogDescription.setAttribute('content', data.description);
  }
  
  const ogImage = document.querySelector('meta[property="og:image"]');
  if (ogImage && data.imageUrl) {
    ogImage.setAttribute('content', data.imageUrl);
  }
  
  const ogUrl = document.querySelector('meta[property="og:url"]');
  if (ogUrl && data.url) {
    ogUrl.setAttribute('content', data.url);
  }
  
  // Update Twitter Card tags
  const twitterTitle = document.querySelector('meta[name="twitter:title"]');
  if (twitterTitle) {
    twitterTitle.setAttribute('content', `${data.title} | BlaccTheddiLiveUpdatesAndTv`);
  }
  
  const twitterDescription = document.querySelector('meta[name="twitter:description"]');
  if (twitterDescription) {
    twitterDescription.setAttribute('content', data.description);
  }
  
  const twitterImage = document.querySelector('meta[name="twitter:image"]');
  if (twitterImage && data.imageUrl) {
    twitterImage.setAttribute('content', data.imageUrl);
  }
}

/**
 * Update metadata for a post
 */
export function updatePostMetadata(post: {
  id: string;
  title: string;
  details?: string;
  image_url?: string;
}) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || (typeof window !== 'undefined' ? window.location.origin : 'https://blacctheddi.com');
  const description = post.details?.replace(/<[^>]*>/g, '').substring(0, 160) || 'Read the latest update from BlaccTheddi.';
  
  updatePageMetadata({
    title: post.title,
    description,
    imageUrl: post.image_url,
    url: `${baseUrl}/${post.id}`,
  });
}

/**
 * Update metadata for a video
 */
export function updateVideoMetadata(video: {
  id: string;
  title: string;
  description?: string;
  thumbnail_url?: string;
}) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || (typeof window !== 'undefined' ? window.location.origin : 'https://blacctheddi.com');
  const description = video.description?.substring(0, 160) || 'Watch this video from BlaccTheddi.';
  
  updatePageMetadata({
    title: video.title,
    description,
    imageUrl: video.thumbnail_url,
    url: `${baseUrl}/tv/${video.id}`,
  });
}
