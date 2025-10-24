
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Providers } from "@/components/Providers";

import "./globals.css"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "BlaccTheddiLiveUpdatesAndTv",
    template: "%s | BlaccTheddiLiveUpdatesAndTv"
  },
  description: "BlaccTheddiPost TV by Madeinblacc - Latest live updates and TV shows",
  keywords: ["BlaccTheddi", "live updates", "TV shows", "Madeinblacc", "entertainment"],
  authors: [{ name: "Madeinblacc" }],
  creator: "Madeinblacc",
  publisher: "BlaccTheddi",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'https://blacctheddi.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    title: 'BlaccTheddiLiveUpdatesAndTv',
    description: 'BlaccTheddiPost TV by Madeinblacc - Latest live updates and TV shows',
    siteName: 'BlaccTheddiLiveUpdatesAndTv',
    images: [
      {
        url: '/blacctheddi.jpg',
        width: 1200,
        height: 630,
        alt: 'BlaccTheddiLiveUpdatesAndTv',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'BlaccTheddiLiveUpdatesAndTv',
    description: 'BlaccTheddiPost TV by Madeinblacc - Latest live updates and TV shows',
    images: ['/blacctheddi.jpg'],
    creator: '@blacctheddi',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background min-h-screen`}
      >
        <Providers>
          {/* <Navigation /> */}
          {children}
        </Providers>
      </body>
    </html>
  );
}
