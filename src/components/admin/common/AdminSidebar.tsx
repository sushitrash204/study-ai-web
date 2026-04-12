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
    <aside className="hidden md:flex w-72 bg-white flex-col p-6 sticky top-0 h-screen border-r border-gray-100 z-20 shadow-sm">
      {/* Brand / Logo */}
      <div className="flex items-center space-x-3 mb-10 px-2">
        <div className="w-10 h-10 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-violet-200">
          <Settings className="text-white" size={22} strokeWidth={2.5} />
        </div>
        <div className="flex flex-col">
          <span className="text-lg font-black text-gray-900 tracking-tight leading-none">ADMIN HUB</span>
          <span className="text-[10px] font-bold text-violet-600 uppercase tracking-[0.2em] mt-1">Management</span>
        </div>
      </div>

      <nav className="flex-1 space-y-1.5">
        <p className="text-gray-400 font-bold text-[11px] uppercase tracking-widest mb-4 px-4">Menu quản trị</p>
        {navItems.map((item, i) => {
          const active = pathname === item.href || (item.href !== '/admin' && pathname?.startsWith(item.href));
          return (
            <Link
              key={i}
              href={item.href}
              className={`flex items-center space-x-3 px-4 py-3.5 rounded-2xl transition-all font-bold group relative overflow-hidden ${active
                  ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-200 active:scale-95'
                  : 'hover:bg-gray-50 text-gray-600 hover:text-gray-900'
                }`}
            >
              <item.icon
                size={20}
                strokeWidth={active ? 2.5 : 2}
                className={`${active ? 'text-white' : 'text-gray-400 group-hover:text-violet-600'} transition-colors`}
              />
              <span className="relative z-10">{item.label}</span>
              {active && <div className="absolute right-0 top-0 bottom-0 w-1.5 bg-white/30 rounded-l-full"></div>}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto pt-6 border-t border-gray-100 space-y-2">
        <button
          onClick={() => router.push('/')}
          className="w-full flex items-center space-x-3 px-4 py-3.5 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-2xl transition-all font-bold group"
        >
          <ChevronLeft size={20} strokeWidth={2.5} className="group-hover:-translate-x-1 transition-transform" />
          <span>Về trang chủ</span>
        </button>
        <button
          onClick={() => { logout(); router.push('/login'); }}
          className="w-full flex items-center space-x-3 px-4 py-3.5 text-red-600 hover:bg-red-50 rounded-2xl transition-all font-bold"
        >
          <LogOut size={20} strokeWidth={2.5} />
          <span>Đăng xuất</span>
        </button>
      </div>
    </aside>
  );
}
