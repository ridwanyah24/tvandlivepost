import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Console",
  description: "Admin console for managing BlaccTheddi content - events, updates, and videos.",
  robots: {
    index: false,
    follow: false,
    noarchive: true,
    nosnippet: true,
    noimageindex: true,
  },
};

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
