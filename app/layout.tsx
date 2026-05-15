import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LiveOS — Travel Scorer",
  description: "Track every journey. Level up your explorer.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    title: "LiveOS",
    statusBarStyle: "black-translucent",
  },
  icons: {
    icon: "/icons/icon.svg",
    apple: "/icons/icon.svg",
  },
};

export const viewport: Viewport = {
  themeColor: "#0e0e0f",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased bg-bg-base text-text-primary font-sans min-h-screen">
        {children}
      </body>
    </html>
  );
}
