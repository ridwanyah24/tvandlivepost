import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    domains: [
      'pub-c6fdcb550b324c029bd6224f3610cf31.r2.dev', // ✅ Add your domain here
      'pub-95b80b7d47524d84bbde205e86dd0e55.r2.dev'
    ],
  },
};

export default nextConfig;
