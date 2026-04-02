'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Lock, ArrowRight, Loader2, CheckCircle2, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/hooks/auth/useAuth';
import { validatePassword, validateConfirmPassword } from '@/utils/validation';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

function ResetPasswordContent() {
    const searchParams = useSearchParams();
    const token = searchParams.get('token');
    const router = useRouter();
    const { state: { isLoading } } = useAuth();
    
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isSuccess, setIsSuccess] = useState(false);

    if (!token) {
        return (
            <div className="text-center py-8">
                <div className="w-16 h-16 bg-[#FEE2E2] rounded-full flex items-center justify-center mx-auto mb-6 text-[#EF4444]">
                    <ShieldCheck size={32} />
                </div>
                <h2 className="text-xl font-bold text-[#1F2937] mb-2">Liên kết không hợp lệ</h2>
                <p className="text-[#6B7280] mb-8">Yêu cầu khôi phục mật khẩu đã hết hạn hoặc không tồn tại.</p>
                <Link href="/forgot-password" className="text-[#8B5CF6] font-bold">Yêu cầu liên kết mới</Link>
            </div>
        );
    }

    const handleReset = async (e: React.FormEvent) => {
        e.preventDefault();
        
        const passwordCheck = validatePassword(password);
        if (!passwordCheck.isValid) {
            alert(passwordCheck.message);
            return;
        }

        const confirmCheck = validateConfirmPassword(password, confirmPassword);
        if (!confirmCheck.isValid) {
            alert(confirmCheck.message);
            return;
        }

        // Normally call: await actions.handleResetPassword(token, password);
        // Simulator for now:
        setIsSuccess(true);
    };

    if (isSuccess) {
        return (
            <div className="text-center py-4 animate-in zoom-in-95 duration-300">
                <div className="w-20 h-20 bg-[#D1FAE5] rounded-full flex items-center justify-center mx-auto mb-6 text-[#10B981]">
                    <CheckCircle2 size={44} strokeWidth={2.5} />
                </div>
                <h2 className="text-2xl font-extrabold text-[#1F2937] mb-3">Thành công!</h2>
                <p className="text-[#6B7280] font-medium text-sm leading-relaxed mb-8 px-2">
                    Mật khẩu của bạn đã được đặt lại thành công. Bây giờ bạn có thể đăng nhập bằng mật khẩu mới.
                </p>
                <Link 
                    href="/login" 
                    className="inline-block w-full bg-[#8B5CF6] hover:bg-[#7C3AED] text-white font-bold py-4 rounded-[16px] transition-all shadow-[0_8px_20px_rgba(139,92,246,0.2)]"
                >
                    Đăng nhập ngay
                </Link>
            </div>
        );
    }

    return (
        <>
            <header className="text-center mb-10">
                <div className="w-16 h-16 bg-[#F5F3FF] rounded-[20px] shadow-sm flex items-center justify-center mx-auto mb-6 border border-[#8B5CF6]/20">
                    <Lock className="text-[#8B5CF6]" size={32} strokeWidth={1.5} />
                </div>
                <h1 className="text-2xl font-extrabold text-[#1F2937] mb-2 tracking-tight">Đặt lại mật khẩu</h1>
                <p className="text-[#6B7280] font-medium text-sm">
                    Vui lòng nhập mật khẩu mới cho tài khoản của bạn.
                </p>
            </header>

            <form onSubmit={handleReset} className="space-y-6">
                <div className="space-y-2">
                    <label className="text-[11px] font-bold text-[#8E8E93] uppercase tracking-widest pl-1">Mật khẩu mới</label>
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#8E8E93] group-focus-within:text-[#8B5CF6] transition-colors">
                            <Lock size={20} strokeWidth={2} />
                        </div>
                        <input
                            type="password"
                            placeholder="••••••••"
                            className="w-full bg-[#F2F2F7] border border-[#E5E7EB] text-[#1F2937] pl-12 pr-4 py-3.5 rounded-2xl focus:ring-2 focus:ring-[#8B5CF6]/50 focus:border-[#8B5CF6] outline-none transition-all font-medium"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            disabled={isLoading}
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-[11px] font-bold text-[#8E8E93] uppercase tracking-widest pl-1">Xác nhận mật khẩu</label>
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#8E8E93] group-focus-within:text-[#8B5CF6] transition-colors">
                            <Lock size={20} strokeWidth={2} />
                        </div>
                        <input
                            type="password"
                            placeholder="••••••••"
                            className="w-full bg-[#F2F2F7] border border-[#E5E7EB] text-[#1F2937] pl-12 pr-4 py-3.5 rounded-2xl focus:ring-2 focus:ring-[#8B5CF6]/50 focus:border-[#8B5CF6] outline-none transition-all font-medium"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            disabled={isLoading}
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-[#8B5CF6] hover:bg-[#7C3AED] disabled:bg-[#D1D5DB] text-white font-bold py-4 rounded-[16px] shadow-[0_8px_20px_rgba(139,92,246,0.25)] flex items-center justify-center space-x-2 transition-all active:scale-[0.98] group"
                >
                    {isLoading ? (
                        <Loader2 className="animate-spin" size={20} />
                    ) : (
                        <>
                            <span className="text-[15px]">Cập nhật mật khẩu</span>
                            <ArrowRight size={18} strokeWidth={2.5} className="group-hover:translate-x-1 transition-transform" />
                        </>
                    )}
                </button>
            </form>
        </>
    );
}

export default function ResetPasswordPage() {
    return (
        <div className="min-h-screen bg-[#FAFAFA] flex flex-col items-center justify-center p-6 font-sans">
            <div className="relative w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="bg-white border border-[#E5E7EB] rounded-[32px] p-8 md:p-10 shadow-[0_20px_60px_rgba(0,0,0,0.05)]">
                    <Suspense fallback={<div className="flex justify-center py-12"><Loader2 className="animate-spin text-[#8B5CF6]" size={40} /></div>}>
                        <ResetPasswordContent />
                    </Suspense>
                </div>
            </div>
        </div>
    );
}
