'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/auth/useAuth';
import { ArrowLeft, User, Loader2, Save } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)); }

export default function EditProfilePage() {
    const router = useRouter();
    const { state: { user, isLoading }, actions } = useAuth();
    
    const [firstName, setFirstName] = useState(user?.firstName || '');
    const [lastName, setLastName] = useState(user?.lastName || '');

    useEffect(() => {
        if (user) {
            setFirstName(user.firstName || '');
            setLastName(user.lastName || '');
        }
    }, [user]);

    const onSave = async (e: React.FormEvent) => {
        e.preventDefault();
        await actions.handleUpdateProfile(firstName, lastName, router);
    };

    return (
        <div className="min-h-screen bg-[#FAFAFA] font-sans pb-24">
            {/* Header */}
            <header className="sticky top-0 z-10 bg-white/90 backdrop-blur-md border-b border-[#E5E7EB] px-4 py-4 flex items-center justify-between shadow-sm">
                <div className="flex items-center space-x-3">
                    <button onClick={() => router.back()} className="p-2 hover:bg-[#F3F4F6] rounded-full text-[#6B7280]">
                        <ArrowLeft size={24} strokeWidth={2.5} />
                    </button>
                    <h1 className="font-extrabold text-[#1F2937] text-lg">Sửa thông tin</h1>
                </div>
                <div className="w-10" />
            </header>

            <main className="max-w-xl mx-auto w-full p-4 md:p-8">
                <form onSubmit={onSave} className="space-y-6">
                    <div className="bg-white border border-[#E5E7EB] rounded-[28px] p-6 md:p-8 shadow-[0_8px_30px_rgba(0,0,0,0.04)] space-y-6">
                        <div className="space-y-2">
                            <label className="text-[11px] font-bold text-[#8E8E93] uppercase tracking-widest px-1">Tên (First Name)</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#9CA3AF] group-focus-within:text-[#8B5CF6] transition-colors">
                                    <User size={18} />
                                </div>
                                <input
                                    type="text"
                                    value={firstName}
                                    onChange={(e) => setFirstName(e.target.value)}
                                    placeholder="Nhập tên của bạn"
                                    className="w-full bg-[#F9FAFB] border border-[#E5E7EB] text-[#1F2937] pl-11 pr-4 py-3.5 rounded-2xl focus:ring-2 focus:ring-[#8B5CF6]/50 focus:border-[#8B5CF6] outline-none transition-all font-medium"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[11px] font-bold text-[#8E8E93] uppercase tracking-widest px-1">Họ (Last Name)</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#9CA3AF] group-focus-within:text-[#8B5CF6] transition-colors">
                                    <User size={18} />
                                </div>
                                <input
                                    type="text"
                                    value={lastName}
                                    onChange={(e) => setLastName(e.target.value)}
                                    placeholder="Nhập họ của bạn"
                                    className="w-full bg-[#F9FAFB] border border-[#E5E7EB] text-[#1F2937] pl-11 pr-4 py-3.5 rounded-2xl focus:ring-2 focus:ring-[#8B5CF6]/50 focus:border-[#8B5CF6] outline-none transition-all font-medium"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[11px] font-bold text-[#8E8E93] uppercase tracking-widest px-1">Email (Không thể thay đổi)</label>
                            <input
                                type="email"
                                value={user?.email || ''}
                                readOnly
                                className="w-full bg-[#F3F4F6] border border-[#E5E7EB] text-[#9CA3AF] px-4 py-3.5 rounded-2xl cursor-not-allowed font-medium"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full flex items-center justify-center space-x-2 py-4 bg-[#8B5CF6] hover:bg-[#7C3AED] disabled:bg-[#D1D5DB] text-white font-bold rounded-[20px] transition-all shadow-[0_8px_20px_rgba(139,92,246,0.3)] active:scale-95"
                    >
                        {isLoading ? <Loader2 className="animate-spin" size={20} /> : <><Save size={20} /><span>Lưu thay đổi</span></>}
                    </button>
                </form>
            </main>
        </div>
    );
}
