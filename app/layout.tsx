import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "VIP Motors Baku | Lüks hərəkətdədir.",
  description:
    "VIP Motors Baku üçün premium, kinematik və skroll əsaslı təqdimat təcrübəsi.",
  icons: {
    icon: "/icon.png",
    shortcut: "/icon.png",
    apple: "/icon.png"
  },
  openGraph: {
    title: "VIP Motors Baku",
    description: "Bakıda peşəkar avtomobil servisi.",
    images: ["/images/vip-motors-logo.png"]
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="az">
      <body>{children}</body>
    </html>
  );
}
