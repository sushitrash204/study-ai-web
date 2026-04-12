'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard,
  GraduationCap,
  BookOpen,
  BookMarked,
  Users
} from 'lucide-react';

interface NavItem {
  icon: any;
  href: string;
  label: string;
}

export function AdminMobileNav() {
  const pathname = usePathname();

  const navItems: NavItem[] = [
    { icon: LayoutDashboard, href: '/admin', label: 'T.Quan' },
    { icon: GraduationCap, href: '/admin/classes', label: 'Lớp' },
    { icon: BookOpen, href: '/admin/subjects', label: 'Môn' },
    { icon: BookMarked, href: '/admin/lessons', label: 'Bài' },
    { icon: Users, href: '/admin/users', label: 'User' },
  ];

  return (
    <nav className="md:hidden fixed bottom-6 left-5 right-5 bg-white/95 backdrop-blur-xl border border-gray-100 px-4 py-3 flex items-center justify-between z-50 rounded-[28px] shadow-[0_12px_32px_rgba(31,41,55,0.15)] pb-[max(env(safe-area-inset-bottom),12px)]">
      {navItems.map((item, i) => {
        const active = pathname === item.href || (item.href !== '/admin' && pathname?.startsWith(item.href));
        return (
          <Link
            key={i}
            href={item.href}
            className={`flex flex-col items-center justify-center transition-all w-12 h-12 rounded-2xl ${active ? 'bg-violet-50' : 'active:scale-90'}`}
          >
            <item.icon
              size={22}
              strokeWidth={active ? 2.5 : 2}
              className={active ? 'text-violet-600' : 'text-gray-400'}
            />
            <span className={`text-[9px] font-extrabold mt-1 uppercase tracking-tighter ${active ? 'text-violet-600' : 'text-gray-400'}`}>
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
