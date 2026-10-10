import type { Metadata, Viewport } from "next";
import { Toaster } from "sonner";
import "./globals.css";
import { siteUrl } from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: { default: "Fritzy Force — Fanbase Fritzy JKT48", template: "%s · Fritzy Force" },
  description: "Rumah ZyFriends: jadwal teater, kegiatan, diskografi, dan kabar terbaru seputar Fritzy JKT48.",
  applicationName: "Fritzy Force",
  openGraph: { type: "website", locale: "id_ID", siteName: "Fritzy Force" },
  twitter: { card: "summary_large_image" },
  icons: { icon: "/icon.svg" },
};

export const viewport: Viewport = {
  themeColor: "#6d36d6",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body className="min-h-dvh antialiased">
        {children}
        <Toaster position="bottom-center" toastOptions={{ className: "font-sans" }} />
      </body>
    </html>
  );
}
