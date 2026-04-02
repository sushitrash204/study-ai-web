'use client';

import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  BookOpen,
  Settings,
  LogOut,
  LayoutDashboard,
  MessageSquare,
  FileText,
  User as UserIcon,
  Plus
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

interface NavItem {
  icon: any;
  label: string;
  href: string;
}

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuthStore();

  const navItems: NavItem[] = [
    { icon: LayoutDashboard, label: 'Tổng quan', href: '/' },
    { icon: BookOpen, label: 'Môn học', href: '/subjects' },
    { icon: MessageSquare, label: 'Thảo luận AI', href: '/chat' },
    { icon: FileText, label: 'Tài liệu', href: '/documents' },
    { icon: UserIcon, label: 'Cá nhân', href: '/profile' },
  ];

  return (
    <aside className="hidden md:flex w-72 bg-white border-r border-[#E5E7EB] flex-col p-6 sticky top-0 h-screen shadow-sm z-20">
      <div className="flex items-center space-x-3 mb-12 px-2">
        <div className="w-10 h-10 bg-[#8B5CF6] rounded-xl flex items-center justify-center shadow-lg shadow-[#8B5CF6]/20">
          <BookOpen className="text-white" size={24} />
        </div>
        <span className="text-xl font-extrabold text-[#1F2937] tracking-tight">AI Study Hub</span>
      </div>

      <nav className="flex-1 space-y-2">
        {navItems.map((item, i) => {
          const active = pathname === item.href;
          return (
            <Link
              key={i}
              href={item.href}
              className={`flex items-center space-x-3 px-4 py-3 rounded-2xl transition-all font-semibold group ${active
                  ? 'bg-[#F5F3FF] text-[#8B5CF6] border border-[#C4B5FD]/30 shadow-sm'
                  : 'hover:bg-[#F3F4F6] text-[#6B7280] hover:text-[#1F2937]'
                }`}
            >
              <item.icon size={20} strokeWidth={active ? 2.5 : 2} className={active ? 'text-[#8B5CF6]' : 'text-[#9CA3AF] group-hover:text-[#6B7280]'} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto pt-6 border-t border-[#E5E7EB] space-y-2">
        <button
          onClick={() => router.push('/settings')}
          className="w-full flex items-center space-x-3 px-4 py-3 text-[#6B7280] hover:text-[#1F2937] hover:bg-[#F3F4F6] rounded-2xl transition-all font-medium"
        >
          <Settings size={20} strokeWidth={2} className="text-[#9CA3AF]" />
          <span>Cài đặt</span>
        </button>
        <button
          onClick={() => { logout(); router.push('/login'); }}
          className="w-full flex items-center space-x-3 px-4 py-3 text-[#DC2626] hover:bg-[#FEF2F2] rounded-2xl transition-all font-medium"
        >
          <LogOut size={20} strokeWidth={2} />
          <span>Đăng xuất</span>
        </button>
      </div>
    </aside>
  );
}

export function BottomNav() {
  const pathname = usePathname();

  const navItems: NavItem[] = [
    { icon: BookOpen, href: '/subjects', label: "Môn học" },
    { icon: FileText, href: '/documents', label: "Tài liệu" },
    { icon: MessageSquare, href: '/chat', label: "Chat AI" },
    { icon: UserIcon, href: '/profile', label: "Hồ sơ" },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-[#E5E7EB] px-6 py-4 flex items-center justify-between z-50 pb-[max(env(safe-area-inset-bottom),18px)] shadow-[0_-8px_25px_rgba(0,0,0,0.04)]">
      {navItems.map((item, i) => {
        const active = pathname === item.href;
        return (
          <Link
            key={i}
            href={item.href}
            className="flex flex-col items-center justify-center transition-all w-12 h-12"
          >
            <item.icon
              size={24}
              strokeWidth={active ? 2.5 : 2}
              className={active ? 'text-[#8B5CF6]' : 'text-[#8E8E93]'}
            />
            {item.label && <span className={`text-[10px] font-bold mt-1 ${active ? 'text-[#8B5CF6]' : 'text-[#8E8E93]'}`}>{item.label}</span>}
          </Link>
        );
      })}
    </nav>
  );
}
