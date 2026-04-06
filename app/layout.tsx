import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "VIP Motors | Lüks hərəkətdədir.",
  description:
    "VIP Motors üçün premium, kinematik və skroll əsaslı təqdimat təcrübəsi."
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
