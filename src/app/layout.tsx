import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import "./globals.css";
import { Toaster } from 'react-hot-toast';

const nunito = Nunito({
  subsets: ["latin", "vietnamese"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-nunito",
  display: 'swap',
});

export const metadata: Metadata = {
  title: "Aivora - Trợ lý học tập thông minh",
  description: "Nền tảng học tập thông minh tích hợp trí tuệ nhân tạo dành cho sinh viên Việt Nam",
  icons: {
    icon: "/logo.png",
  },
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
      suppressHydrationWarning
    >
      <body
        className="min-h-full flex flex-col bg-[#F9FAFA] text-[#1F2937] overflow-x-hidden"
        suppressHydrationWarning
      >
        <MainLayout>
          {children}
        </MainLayout>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              iconTheme: {
                primary: '#10B981',
                secondary: '#fff',
              },
            },
            error: {
              iconTheme: {
                primary: '#EF4444',
                secondary: '#fff',
              },
            },
          }}
        />
      </body>
    </html>
  );
}

