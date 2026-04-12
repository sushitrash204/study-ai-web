'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/auth/useAuth';
import { isValidEmail, isRequiredFilled } from '@/utils/validation';
import { Mail, Lock, Loader2, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { state: { isLoading, isAuthenticated }, actions } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, router]);

  const onLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isRequiredFilled(email, password)) {
      alert('Vui lòng nhập Email và Mật khẩu');
      return;
    }

    if (!isValidEmail(email)) {
      alert('Email không hợp lệ');
      return;
    }

    const success = await actions.handleLogin(email, password);
    if (success) {
      router.push('/');
    }
  };

  return (
    <div className="min-h-screen bg-[#F9FAFA] flex flex-col items-center justify-center p-6 font-sans" suppressHydrationWarning>
      <div className="relative w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-500" suppressHydrationWarning>
        <div className="bg-white border border-[#E5E7EB] rounded-[32px] p-8 md:p-10 shadow-[0_20px_60px_rgba(0,0,0,0.05)]" suppressHydrationWarning>
          <header className="text-center mb-10">
            <div className="w-16 h-16 bg-[#F5F3FF] rounded-[20px] shadow-sm flex items-center justify-center mx-auto mb-6 border border-[#8B5CF6]/20">
               <Lock className="text-[#8B5CF6]" size={32} strokeWidth={1.5} />
            </div>
            <h1 className="text-3xl font-extrabold text-[#1F2937] mb-2 tracking-tight">Đăng nhập</h1>
            <p className="text-[#6B7280] font-medium">Tiếp tục hành trình học tập cùng AI</p>
          </header>

          <form onSubmit={onLogin} className="space-y-5">
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-[#8E8E93] uppercase tracking-widest pl-1">Email</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#8E8E93] group-focus-within:text-[#8B5CF6] transition-colors">
                  <Mail size={20} strokeWidth={2} />
                </div>
                <input
                  type="email"
                  placeholder="name@example.com"
                  className="w-full bg-[#F2F2F7] border border-[#E5E7EB] text-[#1F2937] pl-12 pr-4 py-3.5 rounded-2xl focus:ring-2 focus:ring-[#8B5CF6]/50 focus:border-[#8B5CF6] outline-none transition-all font-medium placeholder:text-[#8E8E93]"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </div>

              <div className="flex items-center justify-between pb-1">
                <label className="text-[11px] font-bold text-[#8E8E93] uppercase tracking-widest pl-1">Mật khẩu</label>
                <Link href="/forgot-password" title="Quên mật khẩu?" className="text-[11px] font-bold text-[#8B5CF6] hover:text-[#7C3AED] transition-colors">Quên mật khẩu?</Link>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#8E8E93] group-focus-within:text-[#8B5CF6] transition-colors">
                  <Lock size={20} strokeWidth={2} />
                </div>
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full bg-[#F2F2F7] border border-[#E5E7EB] text-[#1F2937] pl-12 pr-4 py-3.5 rounded-2xl focus:ring-2 focus:ring-[#8B5CF6]/50 focus:border-[#8B5CF6] outline-none transition-all font-medium placeholder:text-[#8E8E93]"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                />
              </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#8B5CF6] hover:bg-[#7C3AED] disabled:bg-[#D1D5DB] disabled:shadow-none text-white font-bold py-4 rounded-[16px] shadow-[0_8px_20px_rgba(139,92,246,0.25)] flex items-center justify-center space-x-2 transition-all active:scale-[0.98] group mt-8"
            >
              {isLoading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  <span className="text-[15px]">Đăng nhập ngay</span>
                  <ArrowRight size={18} strokeWidth={2.5} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <footer className="mt-8 pt-6 border-t border-[#F3F4F6] text-center">
            <p className="text-[#6B7280] text-sm font-medium">
              Chưa có tài khoản?{' '}
              <Link href="/register" className="text-[#8B5CF6] font-bold hover:text-[#7C3AED] transition-colors ml-1">
                Đăng ký ngay
              </Link>
            </p>
          </footer>
        </div>
      </div>
    </div>
  );
}
