import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Jarvis — Dein persönliches Lebens-OS",
  description: "Jarvis ist dein intelligenter Assistent für Reisen, Abenteuer und alles was zählt.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    title: "Jarvis",
    statusBarStyle: "black-translucent",
  },
  icons: {
    icon: "/icons/icon.svg",
    apple: "/icons/icon.svg",
  },
};

export const viewport: Viewport = {
  themeColor: "#060c14",
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
