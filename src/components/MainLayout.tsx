'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { Sidebar, BottomNav, TopNavbar, MobileHeader } from './common/Navigation';
import { AuthInitializer } from './AuthInitializer';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)); }

export function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Pages that don't need navigation (Auth)
  const noNavPages = ['/login', '/register', '/forgot-password', '/reset-password'];
  const isNoNav = noNavPages.some(p => pathname?.startsWith(p));
  const isAdminRoute = pathname?.startsWith('/admin');

  // Detail pages often have their own headers/footers and need full immersion
  const detailPatterns = [
    /^\/exercises\//,
    /^\/documents\/[^/]+\/(view|summary)$/,
    /^\/subjects\/[^/]+$/,
    /^\/study-groups\/(?!create)[^/]+(?!\/chat)$/,
    /^\/study-groups\/[^/]+\/chat$/
  ];
  const isDetail = detailPatterns.some(pattern => pattern.test(pathname || ''));
  const isChat = pathname === '/chat';
  const isImmersive = isDetail || isChat;

  if (isNoNav || isAdminRoute) {
    return <AuthInitializer>{children}</AuthInitializer>;
  }

  return (
    <AuthInitializer>
      <div className={cn(
        "bg-[#FAFAFA] text-[#1F2937] flex flex-col font-sans h-screen overflow-hidden"
      )}>
        {/* Mobile Header */}
        <MobileHeader />

        {/* Desktop Top Nav */}
        <TopNavbar />

        <main className={cn(
          "flex-1 relative flex flex-col overflow-y-auto",
          pathname === '/study-groups' ? "no-scrollbar" : ""
        )}>
          {children}
        </main>

        {/* Mobile Bottom Nav */}
        {!isDetail && !isChat && <BottomNav />}
      </div>
    </AuthInitializer>
  );
}
