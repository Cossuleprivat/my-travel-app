import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Travel Scorer — Track every journey",
  description:
    "Track your travels, level up your character, and explore the world.",
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
