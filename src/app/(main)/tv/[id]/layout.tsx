import { Metadata } from "next";
import { generateBaseMetadata } from "@/utils/metadata";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  
  try {
    // Fetch the actual video data server-side
    const response = await fetch(`https://api.madeinblacc.net/tvs/${id}`, {
      cache: 'no-store' // Ensure fresh data
    });
    
    if (response.ok) {
      const video = await response.json();
      
      return generateBaseMetadata(
        video.title || "TV Show",
        video.description?.substring(0, 160) || "Watch this TV show from BlaccTheddi. Enjoy high-quality video content and entertainment.",
        `/tv/${id}`,
        video.thumbnail_url || '/blacctheddi.jpg'
      );
    }
  } catch (error) {
    console.error('Failed to fetch video data for metadata:', error);
  }
  
  // Fallback to generic metadata
  return generateBaseMetadata(
    "TV Show",
    "Watch this TV show from BlaccTheddi. Enjoy high-quality video content and entertainment.",
    `/tv/${id}`,
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
