import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import "./globals.css";

const nunito = Nunito({
  subsets: ["latin", "vietnamese"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-nunito",
  display: 'swap',
});

export const metadata: Metadata = {
  title: "AI Study App",
  description: "Trợ lý học tập thông minh",
};

import { AuthInitializer } from "@/components/AuthInitializer"
import { MainLayout } from "@/components/MainLayout";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${nunito.variable} h-full antialiased font-sans`}
      style={{ colorScheme: 'light' }}
    >
      <body className="min-h-full flex flex-col bg-[#F9FAFA] text-[#1F2937]">
        <MainLayout>
          {children}
        </MainLayout>
      </body>
    </html>
  );
}

