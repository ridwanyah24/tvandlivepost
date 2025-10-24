# Metadata Implementation Guide

This document outlines the comprehensive metadata implementation for the BlaccTheddiLiveUpdatesAndTv project to ensure proper link previews when sharing content.

## Overview

The metadata implementation includes:
- **OpenGraph tags** for Facebook, LinkedIn, and other social platforms
- **Twitter Card tags** for Twitter sharing
- **SEO metadata** for search engines
- **Dynamic metadata** for individual posts and TV shows
- **Structured data** for better search engine understanding

## Implementation Details

### 1. Root Layout Metadata (`/src/app/layout.tsx`)

The root layout provides the base metadata for the entire application:

```typescript
export const metadata: Metadata = {
  title: {
    default: "BlaccTheddiLiveUpdatesAndTv",
    template: "%s | BlaccTheddiLiveUpdatesAndTv"
  },
  description: "BlaccTheddiPost TV by Madeinblacc - Latest live updates and TV shows",
  // ... comprehensive metadata including OpenGraph, Twitter Cards, etc.
};
```

### 2. Page-Specific Metadata

#### Main Pages
- **Homepage** (`/src/app/(main)/page.tsx`): Live updates page metadata
- **TV Page** (`/src/app/(main)/tv/layout.tsx`): TV shows listing metadata
- **Admin Page** (`/src/app/admin/layout.tsx`): Admin console metadata (no-index)
- **Auth Page** (`/src/app/auth/layout.tsx`): Authentication metadata (no-index)

#### Dynamic Pages
- **Individual Posts** (`/src/app/(main)/[id]/layout.tsx`): Dynamic metadata for each post
- **Individual TV Shows** (`/src/app/(main)/tv/[id]/layout.tsx`): Dynamic metadata for each video

### 3. Metadata Utility (`/src/utils/metadata.ts`)

A comprehensive utility for generating metadata:

```typescript
// Generate metadata for posts
export function generatePostMetadata(post: PostData): Metadata

// Generate metadata for videos
export function generateVideoMetadata(video: VideoData): Metadata

// Generate base metadata
export function generateBaseMetadata(title: string, description: string, url: string, image?: string): Metadata
```

## Features Implemented

### 1. OpenGraph Tags
- `og:title` - Page title
- `og:description` - Page description
- `og:type` - Content type (website, article, video.other)
- `og:url` - Canonical URL
- `og:image` - Preview image (1200x630 recommended)
- `og:site_name` - Site name
- `og:locale` - Language locale

### 2. Twitter Card Tags
- `twitter:card` - Card type (summary_large_image, player)
- `twitter:title` - Card title
- `twitter:description` - Card description
- `twitter:image` - Card image
- `twitter:creator` - Content creator

### 3. SEO Metadata
- `title` - Page title with template
- `description` - Meta description
- `keywords` - Relevant keywords
- `authors` - Content authors
- `robots` - Search engine directives
- `canonical` - Canonical URL

### 4. Dynamic Content Support
- Individual post metadata with actual content
- Video metadata with thumbnails
- Event metadata for live updates
- Related content suggestions

## Environment Variables

Set the following environment variable for proper URL generation:

```bash
NEXT_PUBLIC_BASE_URL=https://yourdomain.com
```

## Image Requirements

### OpenGraph Images
- **Size**: 1200x630 pixels (recommended)
- **Format**: JPG, PNG, or WebP
- **Aspect Ratio**: 1.91:1
- **File Size**: Under 5MB

### Twitter Card Images
- **Summary Card**: 1200x630 pixels
- **Player Card**: 1200x630 pixels (for videos)
- **Format**: JPG, PNG, or WebP

## Testing Metadata

### 1. Facebook Sharing Debugger
- URL: https://developers.facebook.com/tools/debug/
- Test your URLs to see how they appear on Facebook

### 2. Twitter Card Validator
- URL: https://cards-dev.twitter.com/validator
- Test your URLs to see how they appear on Twitter

### 3. LinkedIn Post Inspector
- URL: https://www.linkedin.com/post-inspector/
- Test your URLs to see how they appear on LinkedIn

### 4. OpenGraph.xyz
- URL: https://www.opengraph.xyz/
- General OpenGraph tag testing

## Best Practices

### 1. Title Tags
- Keep under 60 characters
- Include brand name
- Make them descriptive and clickable

### 2. Meta Descriptions
- Keep under 160 characters
- Include relevant keywords
- Write compelling descriptions

### 3. Images
- Use high-quality, relevant images
- Ensure proper dimensions
- Optimize file sizes
- Include alt text

### 4. URLs
- Use clean, descriptive URLs
- Include relevant keywords
- Avoid special characters

## Future Enhancements

### 1. Real-time Data Integration
- Fetch actual post data for dynamic metadata
- Include real images from posts
- Add structured data for events

### 2. Analytics Integration
- Track social sharing metrics
- Monitor click-through rates
- A/B test different metadata

### 3. Advanced Features
- Video previews for TV shows
- Live event metadata
- User-generated content metadata

## Troubleshooting

### Common Issues

1. **Images not showing**: Check image URLs and dimensions
2. **Title not updating**: Clear browser cache and test again
3. **Description truncated**: Keep under character limits
4. **URLs not canonical**: Ensure proper base URL configuration

### Debugging Steps

1. Check the page source for meta tags
2. Use browser developer tools
3. Test with social media debuggers
4. Validate with online tools

## Conclusion

This metadata implementation ensures that when users share links from your BlaccTheddiLiveUpdatesAndTv platform, they will see rich previews with:
- Proper titles and descriptions
- Relevant images
- Correct content type indicators
- Brand consistency across platforms

The implementation is scalable and can be easily extended for new content types or social platforms.
