import { Metadata } from "next";
import { generateBaseMetadata } from "@/utils/metadata";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  
  try {
    // Fetch the actual post data server-side
    const response = await fetch(`https://api.madeinblacc.net/updates/${id}`, {
      cache: 'no-store' // Ensure fresh data
    });
    
    if (response.ok) {
      const post = await response.json();
      
      return generateBaseMetadata(
        post.title || "Post Update",
        post.details?.replace(/<[^>]*>/g, '').substring(0, 160) || "Read the latest update from BlaccTheddi. Stay informed with real-time news and updates.",
        `/${id}`,
        post.image_url || '/blacctheddi.jpg'
      );
    }
  } catch (error) {
    console.error('Failed to fetch post data for metadata:', error);
  }
  
  // Fallback to generic metadata
  return generateBaseMetadata(
    "Post Update",
    "Read the latest update from BlaccTheddi. Stay informed with real-time news and updates.",
    `/${id}`,
    '/blacctheddi.jpg'
  );
}

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
