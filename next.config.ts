import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: '/explore', destination: '/travel/explore', permanent: true },
      { source: '/explore/:path*', destination: '/travel/explore/:path*', permanent: true },
      { source: '/trips', destination: '/travel/trips', permanent: true },
      { source: '/trips/:path*', destination: '/travel/trips/:path*', permanent: true },
    ];
  },
};

export default nextConfig;
