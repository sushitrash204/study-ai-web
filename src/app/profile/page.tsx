'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useStats } from '@/hooks/stats/useStats';
import {
    User,
    Lock,
    HelpCircle,
    Info,
    ChevronRight,
    LogOut,
    Edit3,
    Shield,
    BookOpen,
    FileText,
    Target
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)); }

interface SettingItemProps {
    icon: React.ReactNode;
    label: string;
    description?: string;
    onClick: () => void;
    danger?: boolean;
}

const SettingItem: React.FC<SettingItemProps> = ({ icon, label, description, onClick, danger }) => (
    <button
        onClick={onClick}
        className={cn(
            "w-full flex items-center justify-between px-5 py-4 transition-colors border-b border-[#F3F4F6] last:border-b-0 group",
            danger ? "hover:bg-[#FFF5F5]" : "hover:bg-[#F9FAFB]"
        )}
    >
        <div className="flex items-center space-x-4">
            <div className={cn(
                "w-9 h-9 rounded-[12px] flex items-center justify-center flex-shrink-0",
                danger ? "bg-[#FEE2E2] text-[#EF4444]" : "bg-[#F3F4F6] text-[#6B7280] group-hover:bg-[#F5F3FF] group-hover:text-[#8B5CF6]"
            )}>
                {icon}
            </div>
            <div className="text-left">
                <p className={cn("text-[15px] font-semibold", danger ? "text-[#EF4444]" : "text-[#1F2937]")}>{label}</p>
                {description && <p className="text-[12px] text-[#8E8E93] mt-0.5">{description}</p>}
            </div>
        </div>
        <ChevronRight size={18} className={cn("flex-shrink-0", danger ? "text-[#EF4444]" : "text-[#C7C7CC]")} />
    </button>
);

export default function ProfilePage() {
    const router = useRouter();
    const { user, logout } = useAuthStore();

    const { stats, isLoading: isStatsLoading } = useStats();

    const initials = `${user?.firstName?.[0] || ''}${user?.lastName?.[0] || ''}`.toUpperCase() || 'U';
    const fullName = `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'Người dùng';

    const handleLogout = () => {
        if (window.confirm('Bạn có chắc chắn muốn đăng xuất?')) {
            logout();
            router.push('/login');
        }
    };

    const handleSupport = () => {
        alert('Hỗ trợ Kỹ thuật\n\nEmail: nghia.nt.64cntt@ntu.edu.vn\nSĐT: 0383129381');
    };

    const handleAbout = () => {
        alert('Về ứng dụng\n\nAI Study Assistant - DATN\nPhiên bản: 1.0.0\nTác giả: Nguyễn Thanh Nghĩa');
    };

    return (
        <main className="max-w-2xl mx-auto w-full p-5 md:p-8 space-y-8 animate-in fade-in duration-500 bg-[#F9FAFA] pb-24">
            {/* Page Title */}
            <header className="pt-4 px-1">
                <h1 className="text-2xl font-bold text-[#1F2937] tracking-tight">Cá nhân</h1>
            </header>

            {/* Profile Card */}
            <section className="flex flex-col items-center text-center py-4">
                {/* Avatar */}
                <div className="relative mb-5">
                    <div className="w-[100px] h-[100px] rounded-full bg-[#8B5CF6] flex items-center justify-center shadow-lg">
                        <span className="text-[36px] font-bold text-white tracking-tight">{initials}</span>
                    </div>
                    <button
                        onClick={() => router.push('/profile/edit')}
                        className="absolute bottom-0 right-0 w-8 h-8 bg-[#10B981] border-[3px] border-[#F9FAFA] rounded-full flex items-center justify-center text-white shadow-sm hover:bg-[#059669] transition-colors"
                    >
                        <Edit3 size={16} strokeWidth={2.5} />
                    </button>
                </div>

                <h2 className="text-[22px] font-bold text-[#1F2937] tracking-tight">{fullName}</h2>
                <p className="text-[14px] text-[#6B7280] mt-1">{user?.email || 'user@email.com'}</p>
            </section>

            {/* Statistics */}
            <section className="grid grid-cols-2 gap-4">
                <div className="bg-white p-5 rounded-[24px] border border-[#EEF0F4] shadow-sm flex flex-col items-center text-center space-y-2">
                    <div className="w-10 h-10 bg-[#F5F3FF] text-[#8B5CF6] rounded-xl flex items-center justify-center">
                        <FileText size={20} />
                    </div>
                    <p className="text-[11px] font-bold text-[#6B7280] uppercase tracking-widest">Tài liệu</p>
                    <h4 className="text-2xl font-black text-[#1F2937]">{isStatsLoading ? '—' : stats.totalDocuments}</h4>
                </div>
                <div className="bg-white p-5 rounded-[24px] border border-[#EEF0F4] shadow-sm flex flex-col items-center text-center space-y-2">
                    <div className="w-10 h-10 bg-[#F0FDF4] text-[#10B981] rounded-xl flex items-center justify-center">
                        <Target size={20} />
                    </div>
                    <p className="text-[11px] font-bold text-[#6B7280] uppercase tracking-widest">Bài tập</p>
                    <h4 className="text-2xl font-black text-[#1F2937]">{isStatsLoading ? '—' : stats.totalExercises}</h4>
                </div>
            </section>

            {/* Account Settings */}
            <section>
                <p className="text-[13px] font-bold text-[#6B7280] uppercase tracking-wider mb-2.5 px-1">Tài khoản</p>
                <div className="bg-white border border-[#EEF0F4] rounded-[20px] overflow-hidden shadow-[0_4px_10px_rgba(0,0,0,0.04)]">
                    <SettingItem
                        icon={<User size={20} strokeWidth={2} />}
                        label="Chỉnh sửa thông tin"
                        description="Tên, ảnh đại diện"
                        onClick={() => router.push('/profile/edit')}
                    />
                    <SettingItem
                        icon={<Shield size={20} strokeWidth={2} />}
                        label="Bảo mật"
                        description="Đổi mật khẩu tài khoản"
                        onClick={() => router.push('/profile/change-password')}
                    />
                </div>
            </section>

            {/* Other */}
            <section>
                <p className="text-[13px] font-bold text-[#6B7280] uppercase tracking-wider mb-2.5 px-1">Khác</p>
                <div className="bg-white border border-[#EEF0F4] rounded-[20px] overflow-hidden shadow-[0_4px_10px_rgba(0,0,0,0.04)]">
                    <SettingItem
                        icon={<HelpCircle size={20} strokeWidth={2} />}
                        label="Hỗ trợ"
                        description="Liên hệ khi gặp sự cố"
                        onClick={handleSupport}
                    />
                    <SettingItem
                        icon={<Info size={20} strokeWidth={2} />}
                        label="Về ứng dụng"
                        description="Phiên bản 1.0.0"
                        onClick={handleAbout}
                    />
                </div>
            </section>

            {/* Logout */}
            <section className="pt-2">
                <button 
                    onClick={handleLogout}
                    className="w-full bg-[#FEE2E2] border border-[#FCA5A5] rounded-[20px] py-4 text-[#EF4444] font-bold text-[16px] transition-all active:scale-[0.98] hover:bg-[#FEE2E2]/80 shadow-sm"
                >
                    Đăng xuất
                </button>
            </section>
        </main>
    );
}
