'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { Sidebar, BottomNav } from './common/Navigation';
import { AuthInitializer } from './AuthInitializer';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)); }

export function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // Pages that don't need navigation (Auth)
  const noNavPages = ['/login', '/register', '/forgot-password', '/reset-password'];
  const isNoNav = noNavPages.some(p => pathname?.startsWith(p));
  
  // Detail pages often have their own headers/footers and need full immersion
  const detailPatterns = [
    /^\/exercises\//,
    /^\/documents\/[^/]+\/(view|summary)$/,
    /^\/subjects\/[^/]+$/
  ];
  const isDetail = detailPatterns.some(pattern => pattern.test(pathname || ''));

  if (isNoNav) {
    return <AuthInitializer>{children}</AuthInitializer>;
  }

  return (
    <AuthInitializer>
      <div className="min-h-screen bg-[#FAFAFA] text-[#1F2937] flex flex-col md:flex-row font-sans">
        {!isDetail && <Sidebar />}
        <main className={cn(
          "flex-1 flex flex-col min-h-screen relative",
          !isDetail ? "pb-[calc(76px+env(safe-area-inset-bottom))] md:pb-0" : ""
        )}>
          {children}
        </main>
        {!isDetail && <BottomNav />}
      </div>
    </AuthInitializer>
  );
}
