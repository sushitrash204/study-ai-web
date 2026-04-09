'use client';

import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard,
  GraduationCap,
  BookOpen,
  BookMarked,
  Users,
  LogOut,
  ChevronLeft,
  Settings
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

interface NavItem {
  icon: any;
  label: string;
  href: string;
}

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuthStore();

  const navItems: NavItem[] = [
    { icon: LayoutDashboard, label: 'Tổng quan', href: '/admin' },
    { icon: GraduationCap, label: 'Khối lớp', href: '/admin/classes' },
    { icon: BookOpen, label: 'Môn học', href: '/admin/subjects' },
    { icon: BookMarked, label: 'Bài học', href: '/admin/lessons' },
    { icon: Users, label: 'Người dùng', href: '/admin/users' },
  ];

  return (
    <aside className="hidden md:flex w-72 bg-white flex-col p-6 sticky top-0 h-screen border-r border-[#E5E7EB] z-20">
      {/* Brand / Logo */}
      <div className="flex items-center space-x-3 mb-10 px-2">
        <div className="w-10 h-10 bg-[#F5F3FF] rounded-xl flex items-center justify-center border border-[#E5E7EB]">
          <Settings className="text-[#8B5CF6]" size={24} strokeWidth={2.5} />
        </div>
        <div className="flex flex-col">
          <span className="text-lg font-black text-[#1F2937] tracking-tight leading-none">ADMIN HUB</span>
          <span className="text-[10px] font-bold text-[#8B5CF6] uppercase tracking-[0.2em] mt-1">Management</span>
        </div>
      </div>

      <nav className="flex-1 space-y-1.5">
        <p className="text-[#9CA3AF] font-bold text-[11px] uppercase tracking-widest mb-4 px-4">Menu quản trị</p>
        {navItems.map((item, i) => {
          const active = pathname === item.href || (item.href !== '/admin' && pathname?.startsWith(item.href));
          return (
            <Link
              key={i}
              href={item.href}
              className={`flex items-center space-x-3 px-4 py-3.5 rounded-2xl transition-all font-bold group relative overflow-hidden ${active
                  ? 'bg-[#8B5CF6] text-white shadow-lg shadow-purple-500/20 active:scale-95'
                  : 'hover:bg-[#F9FAFB] text-[#6B7280] hover:text-[#1F2937]'
                }`}
            >
              <item.icon 
                size={20} 
                strokeWidth={active ? 2.5 : 2} 
                className={`${active ? 'text-white' : 'text-[#9CA3AF] group-hover:text-[#8B5CF6]'} transition-colors`} 
              />
              <span className="relative z-10">{item.label}</span>
              {active && <div className="absolute right-0 top-0 bottom-0 w-1.5 bg-white/30 rounded-l-full"></div>}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto pt-6 border-t border-[#F3F4F6] space-y-2">
        <button
          onClick={() => router.push('/')}
          className="w-full flex items-center space-x-3 px-4 py-3.5 text-[#6B7280] hover:text-[#1F2937] hover:bg-[#F9FAFB] rounded-2xl transition-all font-bold group"
        >
          <ChevronLeft size={20} strokeWidth={2.5} className="group-hover:-translate-x-1 transition-transform" />
          <span>Về trang chủ</span>
        </button>
        <button
          onClick={() => { logout(); router.push('/login'); }}
          className="w-full flex items-center space-x-3 px-4 py-3.5 text-[#EF4444] hover:bg-red-500/10 rounded-2xl transition-all font-bold"
        >
          <LogOut size={20} strokeWidth={2.5} />
          <span>Đăng xuất</span>
        </button>
      </div>
    </aside>
  );
}
