'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useSubject } from '@/hooks/subject/useSubject';
import { useStats } from '@/hooks/stats/useStats';
import { 
  BookOpen, 
  Plus, 
  Settings, 
  LogOut, 
  Search, 
  LayoutDashboard,
  MessageSquare,
  FileText,
  User as UserIcon,
  ChevronRight,
  Target
} from 'lucide-react';
import Link from 'next/link';
import SubjectCard from '@/components/subject/SubjectCard';

export default function Dashboard() {
  const { user, isAuthenticated, logout, isInitializing } = useAuthStore();
  const router = useRouter();
  const { state: { subjects, isLoading }, actions } = useSubject({ autoFetch: isAuthenticated });
  const { stats, isLoading: isStatsLoading } = useStats();
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!isInitializing && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isInitializing, router]);

  if (isInitializing || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#F9FAFA] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#8B5CF6]"></div>
      </div>
    );
  }

  const filteredSubjects = subjects.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex-1 flex flex-col px-5 md:px-8 max-w-7xl mx-auto w-full animate-in fade-in duration-500 pb-20">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4 pt-10 md:pt-12">
        <div className="space-y-1">
          <p className="text-[#6B7280] font-medium text-[15px]">Xin chào, {user?.firstName} 👋</p>
          <h1 className="text-3xl font-extrabold text-[#1F2937] tracking-tight">Trang tổng quan</h1>
        </div>

        <div className="flex items-center space-x-3">
          <div className="relative flex-1 md:w-80 group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#8E8E93] transition-colors">
              <Search size={18} strokeWidth={2.5} />
            </div>
            <input
              type="text"
              placeholder="Tìm kiếm môn học..."
              className="w-full bg-[#F2F2F7] border border-[#E5E7EB] text-[#1F2937] pl-11 pr-4 py-3 rounded-2xl focus:ring-2 focus:ring-[#8B5CF6]/50 focus:border-[#8B5CF6] outline-none transition-all font-medium placeholder:text-[#8E8E93]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="hidden md:flex items-center p-1 bg-white border border-[#E5E7EB] rounded-2xl shadow-sm cursor-pointer hover:bg-gray-50 transition-colors" onClick={() => router.push('/profile')}>
             <div className="w-10 h-10 bg-[#8B5CF6] rounded-[14px] flex items-center justify-center text-white font-bold text-sm shadow-inner shadow-white/20">
                {user?.firstName?.[0]}{user?.lastName?.[0]}
             </div>
          </div>
        </div>
      </header>

      {/* Stats Section */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
         <div className="p-6 md:p-8 rounded-[28px] bg-[#8B5CF6] shadow-[0_4px_14px_rgba(139,92,246,0.3)] hover:shadow-[0_20px_40px_rgba(139,92,246,0.5)] relative overflow-hidden group hover:-translate-y-2 transition-all duration-500 ease-out cursor-pointer active:scale-[0.98]" onClick={() => router.push('/subjects')}>
            <div className="absolute top-0 right-0 p-8 transform translate-x-4 -translate-y-4 opacity-10 group-hover:scale-125 group-hover:-rotate-6 transition-all duration-700 ease-out">
               <BookOpen size={120} />
            </div>
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-black/10 opacity-50 group-hover:opacity-100 transition-opacity duration-500"></div>
            
            <div className="relative z-10 space-y-3 transform group-hover:translate-x-1 transition-transform duration-300">
               <p className="text-white/80 font-extrabold uppercase tracking-widest text-[11px] mb-1">Tổng số môn học</p>
               <h3 className="text-[44px] leading-none font-black text-white drop-shadow-md">{isStatsLoading ? '—' : stats.totalSubjects}</h3>
               <div className="flex items-center text-white/90 text-sm font-semibold pt-3">
                  <span>Xem chi tiết</span>
                  <ChevronRight size={16} strokeWidth={2.5} className="ml-0.5 transform group-hover:translate-x-1 transition-transform" />
               </div>
            </div>
         </div>
         
         <div className="p-6 md:p-8 rounded-[28px] bg-white border border-[#E5E7EB] shadow-[0_4px_12px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_40px_rgba(139,92,246,0.15)] relative overflow-hidden group hover:border-[#8B5CF6]/40 hover:-translate-y-2 transition-all duration-500 ease-out cursor-pointer active:scale-[0.98]" onClick={() => router.push('/documents')}>
            <div className="absolute top-0 right-0 p-8 transform translate-x-4 -translate-y-4 opacity-[0.03] group-hover:text-[#8B5CF6] group-hover:opacity-10 group-hover:scale-125 group-hover:-rotate-6 transition-all duration-700 ease-out">
               <FileText size={120} />
            </div>
            <div className="relative z-10 space-y-3 transform group-hover:translate-x-1 transition-transform duration-300">
               <p className="text-[#6B7280] font-extrabold uppercase tracking-widest text-[11px] mb-1">Thư viện tài liệu</p>
               <h3 className="text-[44px] leading-none font-black text-[#1F2937]">{isStatsLoading ? '—' : stats.totalDocuments}</h3>
               <div className="flex items-center text-[#8B5CF6] text-sm font-semibold pt-3">
                  <span>Xem tài liệu</span>
                  <ChevronRight size={16} strokeWidth={2.5} className="ml-0.5 transform group-hover:translate-x-1 transition-transform" />
               </div>
            </div>
         </div>

         <div className="p-6 md:p-8 rounded-[28px] bg-white border border-[#E5E7EB] shadow-[0_4px_12px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_40px_rgba(16,185,129,0.15)] relative overflow-hidden group hover:border-[#10B981]/40 hover:-translate-y-2 transition-all duration-500 ease-out cursor-pointer active:scale-[0.98]" onClick={() => router.push('/subjects')}>
         <div className="absolute top-0 right-0 p-8 transform translate-x-4 -translate-y-4 opacity-[0.03] group-hover:text-[#10B981] group-hover:opacity-10 group-hover:scale-125 group-hover:-rotate-6 transition-all duration-700 ease-out">
               <Target size={120} />
            </div>
            <div className="relative z-10 space-y-3 transform group-hover:translate-x-1 transition-transform duration-300">
               <p className="text-[#6B7280] font-extrabold uppercase tracking-widest text-[11px] mb-1">Bài tập của tôi</p>
               <h3 className="text-[44px] leading-none font-black text-[#1F2937]">{isStatsLoading ? '—' : stats.totalExercises}</h3>
               <div className="flex items-center text-[#10B981] text-sm font-semibold pt-3">
                  <span>Luyện tập ngay</span>
                  <ChevronRight size={16} strokeWidth={2.5} className="ml-0.5 transform group-hover:translate-x-1 transition-transform" />
               </div>
            </div>
         </div>
      </section>

      {/* Subjects Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-[20px] font-extrabold text-[#1F2937] tracking-tight">Môn học của bạn</h3>
          <div className="flex items-center space-x-2">
            <button 
              onClick={() => router.push('/documents')}
              className="flex items-center space-x-1.5 px-3 md:px-4 py-2 bg-white border border-[#E5E7EB] hover:border-[#8B5CF6]/50 text-[#4B5563] hover:text-[#8B5CF6] rounded-[14px] transition-all shadow-sm active:scale-95"
            >
              <FileText size={18} strokeWidth={2.5} />
              <span className="font-bold text-sm hidden sm:inline">Tài liệu</span>
            </button>
            <button 
              onClick={() => router.push('/subjects')}
              className="flex items-center space-x-1.5 px-3 md:px-4 py-2 bg-[#8B5CF6] hover:bg-[#7C3AED] text-white rounded-[14px] transition-all shadow-[0_4px_12px_rgba(139,92,246,0.3)] active:scale-95"
            >
              <Plus size={18} strokeWidth={2.5} />
              <span className="font-bold text-sm">Thêm môn</span>
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="aspect-square bg-gray-200/50 animate-pulse rounded-[24px] border border-[#E5E7EB]"></div>
            ))}
          </div>
        ) : subjects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white border-2 border-dashed border-[#E5E7EB] rounded-[32px]">
            <div className="w-16 h-16 bg-[#F5F3FF] rounded-2xl flex items-center justify-center mb-4">
               <BookOpen size={32} className="text-[#8B5CF6]" strokeWidth={1.5} />
            </div>
            <h4 className="text-[17px] font-bold text-[#1F2937] mb-1">Chưa có môn học nào</h4>
            <p className="text-[#6B7280] font-medium text-sm text-center px-4 max-w-sm">Hãy tạo môn học đầu tiên để bắt đầu lưu trữ tài liệu và luyện tập cùng AI nhé.</p>
            <button 
              onClick={() => router.push('/subjects')}
              className="mt-6 px-6 py-3 bg-[#8B5CF6] text-white font-bold rounded-2xl shadow-[0_4px_12px_rgba(139,92,246,0.3)] hover:bg-[#7C3AED] transition-all"
            >
              Bắt đầu thêm mới
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {filteredSubjects.map((subject) => (
              <SubjectCard
                key={subject.id}
                name={subject.name}
                color={subject.color}
                onClick={() => router.push(`/subjects/${subject.id}`)}
                onEdit={() => router.push(`/subjects/${subject.id}`)}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
