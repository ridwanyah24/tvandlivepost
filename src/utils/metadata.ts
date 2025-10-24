import { Metadata } from "next";

interface PostData {
  id: string;
  title: string;
  details?: string;
  image_url?: string;
  timestamp?: string;
  event?: {
    title: string;
    details?: string;
    image_url?: string;
  };
}

interface VideoData {
  id: string;
  title: string;
  description?: string;
  thumbnail_url?: string;
  url?: string;
  views?: number;
  likes?: number;
  comments?: number;
}

export function generatePostMetadata(post: PostData): Metadata {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://blacctheddi.com';
  const postUrl = `/${post.id}`;
  const imageUrl = post.image_url || post.event?.image_url || '/blacctheddi.jpg';
  
  // Clean HTML from details for description
  const cleanDescription = post.details 
    ? post.details.replace(/<[^>]*>/g, '').substring(0, 160)
    : post.event?.details 
    ? post.event.details.replace(/<[^>]*>/g, '').substring(0, 160)
    : 'Read the latest update from BlaccTheddi. Stay informed with real-time news and updates.';

  return {
    title: post.title,
    description: cleanDescription,
    openGraph: {
      title: `${post.title} | BlaccTheddiLiveUpdatesAndTv`,
      description: cleanDescription,
      type: "article",
      url: postUrl,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
      publishedTime: post.timestamp,
      authors: ['BlaccTheddi'],
      siteName: 'BlaccTheddiLiveUpdatesAndTv',
    },
    twitter: {
      card: "summary_large_image",
      title: `${post.title} | BlaccTheddiLiveUpdatesAndTv`,
      description: cleanDescription,
      images: [imageUrl],
      creator: '@blacctheddi',
    },
    alternates: {
      canonical: postUrl,
    },
  };
}

export function generateVideoMetadata(video: VideoData): Metadata {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://blacctheddi.com';
  const videoUrl = `/tv/${video.id}`;
  const imageUrl = video.thumbnail_url || '/blacctheddi.jpg';
  
  const cleanDescription = video.description 
    ? video.description.substring(0, 160)
    : 'Watch this TV show from BlaccTheddi. Enjoy high-quality video content and entertainment.';

  return {
    title: video.title,
    description: cleanDescription,
    openGraph: {
      title: `${video.title} | BlaccTheddiLiveUpdatesAndTv`,
      description: cleanDescription,
      type: "video.other",
      url: videoUrl,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: video.title,
        },
      ],
      siteName: 'BlaccTheddiLiveUpdatesAndTv',
    },
    twitter: {
      card: "player",
      title: `${video.title} | BlaccTheddiLiveUpdatesAndTv`,
      description: cleanDescription,
      images: [imageUrl],
      creator: '@blacctheddi',
    },
    alternates: {
      canonical: videoUrl,
    },
  };
}

export function generateBaseMetadata(title: string, description: string, url: string, image?: string): Metadata {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://blacctheddi.com';
  const fullUrl = url.startsWith('http') ? url : `${baseUrl}${url}`;
  const imageUrl = image || '/blacctheddi.jpg';

  return {
    title,
    description,
    openGraph: {
      title: `${title} | BlaccTheddiLiveUpdatesAndTv`,
      description,
      type: "website",
      url: fullUrl,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      siteName: 'BlaccTheddiLiveUpdatesAndTv',
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | BlaccTheddiLiveUpdatesAndTv`,
      description,
      images: [imageUrl],
      creator: '@blacctheddi',
    },
    alternates: {
      canonical: fullUrl,
    },
  };
}
