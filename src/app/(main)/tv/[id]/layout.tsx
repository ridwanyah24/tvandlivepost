import { Metadata } from "next";
import { generateBaseMetadata } from "@/utils/metadata";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  
  // In a real implementation, you would fetch the video data here
  // For now, we'll create a generic metadata structure
  return generateBaseMetadata(
    "TV Show",
    "Watch this TV show from BlaccTheddi. Enjoy high-quality video content and entertainment.",
    `/tv/${id}`,
    '/blacctheddi.jpg' // Fallback to site logo
  );
}

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
