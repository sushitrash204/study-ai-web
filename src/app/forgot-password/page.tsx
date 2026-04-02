'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/auth/useAuth';
import { Mail, ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const { state: { isLoading }, actions } = useAuth();
    const [isSent, setIsSent] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email.trim()) {
            alert('Vui lòng nhập email');
            return;
        }

        const success = await actions.handleForgotPassword(email);
        if (success) {
            setIsSent(true);
        }
    };

    return (
        <div className="min-h-screen bg-[#F9FAFA] flex flex-col items-center justify-center p-6 font-sans">
            <div className="relative w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="bg-white border border-[#E5E7EB] rounded-[32px] p-8 md:p-10 shadow-[0_20px_60px_rgba(0,0,0,0.05)]">
                    
                    {!isSent ? (
                        <>
                            <header className="text-center mb-10">
                                <button 
                                    onClick={() => router.back()}
                                    className="absolute top-8 left-8 p-2 hover:bg-[#F3F4F6] rounded-full text-[#6B7280] transition-colors md:static md:mb-6 md:mx-auto md:block"
                                >
                                    <ArrowLeft size={24} strokeWidth={2.5} />
                                </button>
                                <div className="w-16 h-16 bg-[#F5F3FF] rounded-[20px] shadow-sm flex items-center justify-center mx-auto mb-6 border border-[#8B5CF6]/20">
                                    <Mail className="text-[#8B5CF6]" size={32} strokeWidth={1.5} />
                                </div>
                                <h1 className="text-2xl font-extrabold text-[#1F2937] mb-2 tracking-tight">Quên mật khẩu?</h1>
                                <p className="text-[#6B7280] font-medium text-sm leading-relaxed px-4">
                                    Nhập email của bạn để nhận liên kết khôi phục mật khẩu.
                                </p>
                            </header>

                            <form onSubmit={handleSubmit} className="space-y-6">
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

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full bg-[#8B5CF6] hover:bg-[#7C3AED] disabled:bg-[#D1D5DB] text-white font-bold py-4 rounded-[16px] shadow-[0_8px_20px_rgba(139,92,246,0.25)] flex items-center justify-center space-x-2 transition-all active:scale-[0.98]"
                                >
                                    {isLoading ? (
                                        <Loader2 className="animate-spin" size={20} />
                                    ) : (
                                        <span className="text-[15px]">Gửi liên kết khôi phục</span>
                                    )}
                                </button>
                            </form>
                        </>
                    ) : (
                        <div className="text-center py-4 animate-in zoom-in-95 duration-300">
                            <div className="w-20 h-20 bg-[#D1FAE5] rounded-full flex items-center justify-center mx-auto mb-6 text-[#10B981]">
                                <CheckCircle2 size={44} strokeWidth={2.5} />
                            </div>
                            <h2 className="text-2xl font-extrabold text-[#1F2937] mb-3">Đã gửi thành công!</h2>
                            <p className="text-[#6B7280] font-medium text-sm leading-relaxed mb-8 px-2">
                                Chúng tôi đã gửi hướng dẫn khôi phục mật khẩu đến <span className="text-[#1F2937] font-bold">{email}</span>. Vui lòng kiểm tra hộp thư của bạn.
                            </p>
                            <Link 
                                href="/login" 
                                className="inline-block w-full bg-[#F3F4F6] hover:bg-[#E5E7EB] text-[#4B5563] font-bold py-4 rounded-[16px] transition-all"
                            >
                                Quay lại Đăng nhập
                            </Link>
                        </div>
                    )}

                    {!isSent && (
                        <footer className="mt-8 pt-6 border-t border-[#F3F4F6] text-center">
                            <Link href="/login" className="text-[#8B5CF6] font-bold hover:text-[#7C3AED] transition-colors text-sm flex items-center justify-center space-x-2">
                                <span>Quay lại trang Đăng nhập</span>
                            </Link>
                        </footer>
                    )}
                </div>
            </div>
        </div>
    );
}
