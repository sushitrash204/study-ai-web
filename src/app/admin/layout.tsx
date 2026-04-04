'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { AdminSidebar } from '@/components/admin/common/AdminSidebar';
import { AdminMobileNav } from '@/components/admin/common/AdminMobileNav';
import { AuthInitializer } from '@/components/AuthInitializer';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, isInitializing } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    // Only redirect once initialization is complete
    if (!isInitializing) {
      if (!isAuthenticated) {
        router.push('/login');
      } else if (user?.role !== 'ADMIN') {
        // Log to debug if needed
        console.warn('Unauthorized access to Admin. Role:', user?.role);
        router.push('/');
      }
    }
  }, [isAuthenticated, isInitializing, user?.role, router]);

  // Loading state
  if (isInitializing) {
    return (
      <div className="min-h-screen bg-[#F9FAFA] flex flex-col items-center justify-center p-6">
        <div className="w-16 h-16 border-4 border-[#8B5CF6]/20 border-t-[#8B5CF6] rounded-full animate-spin mb-6"></div>
        <p className="text-gray-500 font-bold text-lg animate-pulse">Đang xác thực quyền Admin...</p>
      </div>
    );
  }

  // Not authenticated or not Admin - handled by useEffect, but avoid rendering shell
  if (!isAuthenticated || user?.role !== 'ADMIN') {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#F9FAFA] text-[#1F2937] flex flex-col md:flex-row items-start font-sans">
      {/* Sidebar for Admin */}
      <AdminSidebar />
      
      <main className="flex-1 flex flex-col min-h-screen w-full relative pb-[calc(100px+env(safe-area-inset-bottom))] md:pb-0">
        <div className="flex-1 animate-in fade-in slide-in-from-bottom-2 duration-500">
          {children}
        </div>
      </main>

      {/* Mobile Navigation for Admin */}
      <AdminMobileNav />
    </div>
  );
}
