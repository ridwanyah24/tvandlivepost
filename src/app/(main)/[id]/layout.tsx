import { Metadata } from "next";
import { generateBaseMetadata } from "@/utils/metadata";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  
  // TODO: In a real implementation, you would fetch the post data here
  // For now, we'll create a generic metadata structure
  // The actual image will be handled by the client-side sharing utility
  return generateBaseMetadata(
    "Post Update",
    "Read the latest update from BlaccTheddi. Stay informed with real-time news and updates.",
    `/${id}`,
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
