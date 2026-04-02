'use client';

import React, { useState } from 'react';
import { useRouter as useNextRouter } from 'next/navigation';
import { useAuth } from '@/hooks/auth/useAuth';
import { ArrowLeft, Lock, Loader2, Save, Eye, EyeOff } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)); }

export default function ChangePasswordPage() {
    const router = useNextRouter();
    const { state: { isLoading }, actions } = useAuth();
    
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    
    const [showCurr, setShowCurr] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConf, setShowConf] = useState(false);

    const onSave = async (e: React.FormEvent) => {
        e.preventDefault();
        await actions.handleChangePassword(currentPassword, newPassword, confirmPassword, router);
    };

    return (
        <div className="min-h-screen bg-[#FAFAFA] font-sans pb-24">
            {/* Header */}
            <header className="sticky top-0 z-10 bg-white/90 backdrop-blur-md border-b border-[#E5E7EB] px-4 py-4 flex items-center justify-between shadow-sm">
                <div className="flex items-center space-x-3">
                    <button onClick={() => router.back()} className="p-2 hover:bg-[#F3F4F6] rounded-full text-[#6B7280]">
                        <ArrowLeft size={24} strokeWidth={2.5} />
                    </button>
                    <h1 className="font-extrabold text-[#1F2937] text-lg">Đổi mật khẩu</h1>
                </div>
                <div className="w-10" />
            </header>

            <main className="max-w-xl mx-auto w-full p-4 md:p-8">
                <form onSubmit={onSave} className="space-y-6">
                    <div className="bg-white border border-[#E5E7EB] rounded-[28px] p-6 md:p-8 shadow-[0_8px_30px_rgba(0,0,0,0.04)] space-y-6">
                        <div className="space-y-2">
                            <label className="text-[11px] font-bold text-[#8E8E93] uppercase tracking-widest px-1">Mật khẩu hiện tại</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#9CA3AF] group-focus-within:text-[#8B5CF6] transition-colors">
                                    <Lock size={18} />
                                </div>
                                <input
                                    type={showCurr ? "text" : "password"}
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    placeholder="Nhập mật khẩu cũ"
                                    className="w-full bg-[#F9FAFB] border border-[#E5E7EB] text-[#1F2937] pl-11 pr-12 py-3.5 rounded-2xl focus:ring-2 focus:ring-[#8B5CF6]/50 focus:border-[#8B5CF6] outline-none transition-all font-medium"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowCurr(!showCurr)}
                                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-[#9CA3AF] hover:text-[#8B5CF6]"
                                >
                                    {showCurr ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[11px] font-bold text-[#8E8E93] uppercase tracking-widest px-1">Mật khẩu mới</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#9CA3AF] group-focus-within:text-[#8B5CF6] transition-colors">
                                    <Lock size={18} />
                                </div>
                                <input
                                    type={showNew ? "text" : "password"}
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="Nhập mật khẩu mới"
                                    className="w-full bg-[#F9FAFB] border border-[#E5E7EB] text-[#1F2937] pl-11 pr-12 py-3.5 rounded-2xl focus:ring-2 focus:ring-[#8B5CF6]/50 focus:border-[#8B5CF6] outline-none transition-all font-medium"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowNew(!showNew)}
                                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-[#9CA3AF] hover:text-[#8B5CF6]"
                                >
                                    {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[11px] font-bold text-[#8E8E93] uppercase tracking-widest px-1">Xác nhận mật khẩu mới</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#9CA3AF] group-focus-within:text-[#8B5CF6] transition-colors">
                                    <Lock size={18} />
                                </div>
                                <input
                                    type={showConf ? "text" : "password"}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="Nhập lại mật khẩu mới"
                                    className="w-full bg-[#F9FAFB] border border-[#E5E7EB] text-[#1F2937] pl-11 pr-12 py-3.5 rounded-2xl focus:ring-2 focus:ring-[#8B5CF6]/50 focus:border-[#8B5CF6] outline-none transition-all font-medium"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConf(!showConf)}
                                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-[#9CA3AF] hover:text-[#8B5CF6]"
                                >
                                    {showConf ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full flex items-center justify-center space-x-2 py-4 bg-[#8B5CF6] hover:bg-[#7C3AED] disabled:bg-[#D1D5DB] text-white font-bold rounded-[20px] transition-all shadow-[0_8px_20px_rgba(139,92,246,0.3)] active:scale-95"
                    >
                        {isLoading ? <Loader2 className="animate-spin" size={20} /> : <><Save size={20} /><span>Đổi mật khẩu</span></>}
                    </button>
                </form>
            </main>
        </div>
    );
}
