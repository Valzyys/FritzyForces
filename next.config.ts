import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  agentRules: false,
  images: { unoptimized: true },
  experimental: {
    serverActions: { bodySizeLimit: "10mb" },
  },
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      { source: "/admin/:path*", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }] },
    ];
  },
  async redirects() {
    return [
      { source: "/about", destination: "/tentang", permanent: true },
      { source: "/about-us", destination: "/tentang", permanent: true },
      { source: "/profile", destination: "/fritzy", permanent: true },
      { source: "/schedule", destination: "/jadwal", permanent: true },
      { source: "/setlist", destination: "/diskografi", permanent: true },
      { source: "/discography", destination: "/diskografi", permanent: true },
      { source: "/gallery", destination: "/galeri", permanent: true },
      { source: "/news", destination: "/berita", permanent: true },
      { source: "/news/:slug", destination: "/berita/:slug", permanent: true },
      { source: "/game", destination: "/games", permanent: true },
    ];
  },
};

export default nextConfig;

initOpenNextCloudflareForDev();
