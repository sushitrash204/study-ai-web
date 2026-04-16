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
  Plus,
  Users,
  Search,
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { NotificationBell } from '../notifications/NotificationBell';

interface NavItem {
  icon: any;
  label: string;
  href: string;
}

export function TopNavbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout, user } = useAuthStore();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const baseNavItems: NavItem[] = [
    { icon: LayoutDashboard, label: 'Tổng quan', href: '/' },
    { icon: BookOpen, label: 'Môn học', href: '/subjects' },
    { icon: Users, label: 'Học nhóm', href: '/study-groups' },
    { icon: MessageSquare, label: 'Thảo luận AI', href: '/chat' },
    { icon: FileText, label: 'Tài liệu', href: '/documents' },
  ];

  // Add Admin Panel link if user is ADMIN
  const navItems = user?.role === 'ADMIN'
    ? [...baseNavItems, { icon: Settings, label: 'Quản trị', href: '/admin' }]
    : baseNavItems;

  return (
    <header className="hidden md:block sticky top-0 z-50 w-full bg-white/70 backdrop-blur-2xl border-b border-gray-100">
      <div className="max-w-[1400px] mx-auto px-8 h-20 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-3 group shrink-0">
          <div className="w-9 h-9 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-200">
            <BookOpen className="text-white" size={20} />
          </div>
          <span className="text-xl font-black text-gray-900 tracking-tight">Aivora</span>
        </Link>

        {/* Navigation Links - Centered */}
        <nav className="flex-1 flex items-center justify-center space-x-6 px-8">
          {[
            { label: 'Tổng quan', href: '/' },
            { label: 'Thư viện', href: '/subjects' },
            { label: 'Học nhóm', href: '/study-groups' },
            { label: 'Chat AI', href: '/chat' },
            { label: 'Tài liệu', href: '/documents' },
          ].map((item, i) => {
            const active = pathname === item.href;
            return (
              <Link
                key={i}
                href={item.href}
                className={`relative py-2 text-[13px] font-black transition-all whitespace-nowrap ${active ? 'text-indigo-600' : 'text-gray-400 hover:text-gray-900'
                  }`}
              >
                {item.label}
                {active && (
                  <span className="absolute bottom-0 left-0 w-full h-[3px] bg-indigo-600 rounded-full animate-in fade-in slide-in-from-bottom-1 duration-300"></span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center space-x-4 shrink-0">
          {/* Admin Panel Button - Only for ADMIN role */}
          {mounted && user?.role === 'ADMIN' && (
            <button
              onClick={() => router.push('/admin')}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl font-bold text-xs shadow-lg shadow-violet-200 hover:shadow-xl hover:scale-105 transition-all group shrink-0"
            >
              <Settings size={16} className="group-hover:rotate-90 transition-transform duration-300" />
              <span className="hidden xl:inline">Admin Panel</span>
              <span className="px-2 py-0.5 bg-white/20 rounded-lg text-[10px] font-black uppercase tracking-wider">PRO</span>
            </button>
          )}

          <div className="hidden lg:flex items-center bg-gray-50 border border-gray-100 rounded-xl px-4 py-2 w-64 focus-within:ring-2 focus-within:ring-indigo-100 transition-all">
            <Search size={18} className="text-gray-400" />
            <input type="text" placeholder="Tìm kiếm khóa học..." className="bg-transparent border-none focus:ring-0 text-xs font-bold ml-2 w-full text-gray-900" />
          </div>

          <div className="flex items-center space-x-2">
            <NotificationBell />
            <button
              onClick={() => router.push('/settings')}
              className="p-2.5 text-gray-400 hover:text-gray-900 hover:bg-gray-50 rounded-xl transition-all"
            >
              <Settings size={20} />
            </button>
          </div>

          {/* Admin Quick Access - Mobile/Tablet */}
          {mounted && user?.role === 'ADMIN' && (
            <button
              onClick={() => router.push('/admin')}
              className="lg:hidden p-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl shadow-lg shadow-violet-200 hover:shadow-xl hover:scale-105 transition-all"
            >
              <Settings size={20} className="animate-spin-slow" />
            </button>
          )}

          <button
            onClick={() => router.push('/profile')}
            className="w-10 h-10 rounded-xl overflow-hidden ring-2 ring-gray-100 hover:ring-indigo-200 transition-all hover:scale-105 active:scale-95"
          >
            <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black text-sm">
              {mounted ? (user?.firstName?.charAt(0) || 'U') : 'U'}
            </div>
          </button>
        </div>
      </div>
    </header>
  );
}

export function MobileHeader() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <header className="md:hidden flex items-center justify-between px-6 py-4 bg-white/80 backdrop-blur-xl sticky top-0 z-40 border-b border-gray-100">
      <div className="flex flex-col">
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-0.5">Xin chào,</p>
        <h1 className="text-lg font-black text-gray-900 leading-none">
          {mounted ? `${user?.firstName || ''} ${user?.lastName || ''}` : '...'}
        </h1>
      </div>
      <div className="flex items-center space-x-3">
        <NotificationBell />
        <button
          onClick={() => router.push('/profile')}
          className="w-10 h-10 rounded-2xl overflow-hidden ring-2 ring-gray-50 flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-black text-xs shadow-lg shadow-indigo-100"
        >
          {mounted ? (user?.firstName?.charAt(0) || 'U') : 'U'}
        </button>
      </div>
    </header>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuthStore();

  const navItems: NavItem[] = [
    { icon: LayoutDashboard, label: 'Tổng quan', href: '/' },
    { icon: BookOpen, label: 'Môn học', href: '/subjects' },
    { icon: Users, label: 'Học nhóm', href: '/study-groups' },
    { icon: MessageSquare, label: 'Thảo luận AI', href: '/chat' },
    { icon: FileText, label: 'Tài liệu', href: '/documents' },
    { icon: UserIcon, label: 'Cá nhân', href: '/profile' },
  ];

  // Check if user is admin (need to get from authStore)
  const { user } = useAuthStore();

  return (
    <aside className="hidden md:flex w-72 bg-white border-r border-[#E5E7EB] flex-col p-6 sticky top-0 h-screen shadow-sm z-20">
      <div className="flex items-center space-x-3 mb-12 px-2">
        <div className="w-10 h-10 bg-[#8B5CF6] rounded-xl flex items-center justify-center shadow-lg shadow-[#8B5CF6]/20">
          <BookOpen className="text-white" size={24} />
        </div>
        <span className="text-xl font-extrabold text-[#1F2937] tracking-tight">Aivora</span>
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

      {/* Admin Panel Link */}
      {user?.role === 'ADMIN' && (
        <div className="mt-4 p-4 bg-gradient-to-br from-violet-50 to-indigo-50 rounded-2xl border border-violet-100">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-gradient-to-r from-violet-600 to-indigo-600 rounded-lg flex items-center justify-center">
              <Settings size={16} className="text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-black text-gray-900 truncate">Admin Panel</p>
              <p className="text-[10px] text-gray-500 font-medium">Quản trị hệ thống</p>
            </div>
          </div>
          <button
            onClick={() => router.push('/admin')}
            className="w-full py-2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl text-xs font-bold shadow-md shadow-violet-200 hover:shadow-lg hover:scale-105 transition-all"
          >
            Vào trang quản trị
          </button>
        </div>
      )}

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
    { icon: LayoutDashboard, href: '/', label: "Trang chủ" },
    { icon: BookOpen, href: '/subjects', label: "Thư viện" },
    { icon: MessageSquare, href: '/chat', label: "AI Chat" },
    { icon: Users, href: '/study-groups', label: "Học nhóm" },
    { icon: UserIcon, href: '/profile', label: "Cài đặt" },
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
