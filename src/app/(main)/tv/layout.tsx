import { Metadata } from "next";

export const metadata: Metadata = {
  title: "TV Shows",
  description: "Watch the latest TV shows and videos from BlaccTheddi. Discover trending content and entertainment.",
  openGraph: {
    title: "TV Shows | BlaccTheddiLiveUpdatesAndTv",
    description: "Watch the latest TV shows and videos from BlaccTheddi. Discover trending content and entertainment.",
    type: "website",
    url: "/tv",
    images: [
      {
        url: "/blacctheddi.jpg",
        width: 1200,
        height: 630,
        alt: "BlaccTheddi TV Shows",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "TV Shows | BlaccTheddiLiveUpdatesAndTv",
    description: "Watch the latest TV shows and videos from BlaccTheddi. Discover trending content and entertainment.",
    images: ["/blacctheddi.jpg"],
  },
  alternates: {
    canonical: "/tv",
  },
};

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
