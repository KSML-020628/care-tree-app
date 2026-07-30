import type { Metadata, Viewport } from "next";
import AppProviders from "@/components/common/AppProviders";
import "./globals.css";

export const metadata: Metadata = {
  title: "함께 그리는 우리 숲",
  description: "장기입원 아동을 위한 협동 색칠놀이",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full antialiased">
      <body className="flex min-h-full flex-col">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
