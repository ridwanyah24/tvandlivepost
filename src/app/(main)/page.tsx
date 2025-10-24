import LiveUpdates from "@/components/liveUpdates/liveupdates";
import { Metadata } from "next";
import '../globals.css'

export const metadata: Metadata = {
  title: "Live Updates",
  description: "Get the latest live updates and news from BlaccTheddi. Stay informed with real-time updates and breaking news.",
  openGraph: {
    title: "Live Updates | BlaccTheddiLiveUpdatesAndTv",
    description: "Get the latest live updates and news from BlaccTheddi. Stay informed with real-time updates and breaking news.",
    type: "website",
    url: "/",
    images: [
      {
        url: "/blacctheddi.jpg",
        width: 1200,
        height: 630,
        alt: "BlaccTheddi Live Updates",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Live Updates | BlaccTheddiLiveUpdatesAndTv",
    description: "Get the latest live updates and news from BlaccTheddi. Stay informed with real-time updates and breaking news.",
    images: ["/blacctheddi.jpg"],
  },
};

export default function Page() {

  return (
    <>
      <LiveUpdates />
    </>
  )
}