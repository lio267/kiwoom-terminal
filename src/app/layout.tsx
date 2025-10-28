import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Providers from "@/app/providers";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Kiwoom Market Dashboard",
  description:
    "Next.js + Tailwind + Zustand 기반의 Kiwoom REST API 시각화 대시보드",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className={`${inter.className} bg-slate-100 antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
