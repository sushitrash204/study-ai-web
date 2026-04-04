'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useStats } from '@/hooks/stats/useStats';
import {
   BookOpen,
   ChevronRight,
   FileText,
   Target,
   Sparkles,
   User
} from 'lucide-react';

export default function Dashboard() {
   const { user, isAuthenticated, isInitializing } = useAuthStore();
   const router = useRouter();
   const { stats, isLoading: isStatsLoading } = useStats();

   useEffect(() => {
      if (!isInitializing && !isAuthenticated) {
         router.push('/login');
      }
   }, [isAuthenticated, isInitializing, router]);

   if (isInitializing || !isAuthenticated) {
      return (
         <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="flex flex-col items-center gap-4">
               <div className="w-12 h-12 border-4 border-violet-600 border-t-transparent rounded-full animate-spin"></div>
               <p className="text-gray-500 font-medium">Đang tải dữ liệu...</p>
            </div>
         </div>
      );
   }

   return (
      <div className="min-h-screen bg-[#F9FAFA] p-4 md:p-8 pt-28">
         <header className="max-w-6xl mx-auto mb-12">
            <div className="flex items-center gap-4 mb-2">
               <div className="p-2 bg-violet-100 rounded-xl">
                  <Sparkles size={20} className="text-violet-600" />
               </div>
               <p className="text-violet-600 font-black text-xs uppercase tracking-[0.2em]">Bảng điều khiển học tập</p>
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight">
               Chào bạn, {user?.firstName}! <span className="animate-bounce inline-block">👋</span>
            </h1>
            <p className="text-gray-500 font-bold mt-2 text-lg">Bạn đang có kết quả học tập rất tốt, hãy tiếp tục nhé!</p>
         </header>

         {/* Main Stats Grid */}
         <section className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
            {/* Total Subjects Card */}
            <div
               onClick={() => router.push('/subjects')}
               className="p-10 rounded-[48px] bg-[#8B5CF6] shadow-[0_20px_40px_rgba(139,92,246,0.25)] hover:shadow-[0_30px_60px_rgba(139,92,246,0.35)] relative overflow-hidden group hover:-translate-y-2 transition-all duration-500 cursor-pointer"
            >
               <div className="absolute top-0 right-0 p-8 transform translate-x-6 -translate-y-6 opacity-10 group-hover:scale-125 group-hover:rotate-6 transition-all duration-700 ease-out">
                  <BookOpen size={160} />
               </div>
               <div className="relative z-10 space-y-6">
                  <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
                     <BookOpen size={28} className="text-white" />
                  </div>
                  <div className="space-y-1">
                     <p className="text-white/80 font-black uppercase tracking-widest text-[11px]">Tổng số môn học</p>
                     <h3 className="text-6xl font-black text-white">{isStatsLoading ? '—' : stats.totalSubjects}</h3>
                  </div>
                  <div className="flex items-center text-white/90 text-sm font-black pt-4">
                     <span>Mở thư viện môn học</span>
                     <ChevronRight size={18} className="ml-1 transform group-hover:translate-x-2 transition-transform" />
                  </div>
               </div>
            </div>

            {/* My Subjects Card */}
            <div
               onClick={() => router.push('/subjects')}
               className="p-10 rounded-[48px] bg-white border-2 border-gray-100 shadow-[0_8px_30px_rgba(0,0,0,0.02)] hover:shadow-[0_40px_80px_rgba(0,0,0,0.08)] relative overflow-hidden group hover:-translate-y-2 transition-all duration-500 cursor-pointer"
            >
               <div className="relative z-10 space-y-6">
                  <div className="w-14 h-14 bg-violet-50 rounded-2xl flex items-center justify-center">
                     <User size={28} className="text-violet-600" />
                  </div>
                  <div className="space-y-1">
                     <p className="text-gray-400 font-black uppercase tracking-widest text-[11px]">Môn học của bạn</p>
                     <h3 className="text-6xl font-black text-gray-900">{isStatsLoading ? '—' : stats.mySubjects}</h3>
                  </div>
                  <div className="flex items-center text-violet-600 text-sm font-black pt-4">
                     <span>Xem môn cá nhân</span>
                     <ChevronRight size={18} className="ml-1 transform group-hover:translate-x-2 transition-transform" />
                  </div>
               </div>
            </div>

            {/* Total Documents Card */}
            <div
               onClick={() => router.push('/documents')}
               className="p-10 rounded-[48px] bg-white border-2 border-gray-100 shadow-[0_8px_30px_rgba(0,0,0,0.02)] hover:shadow-[0_40px_80px_rgba(0,0,0,0.08)] relative overflow-hidden group hover:-translate-y-2 transition-all duration-500 cursor-pointer"
            >
               <div className="relative z-10 space-y-6">
                  <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center">
                     <FileText size={28} className="text-blue-500" />
                  </div>
                  <div className="space-y-1">
                     <p className="text-gray-400 font-black uppercase tracking-widest text-[11px]">Tài liệu đã tải</p>
                     <h3 className="text-6xl font-black text-gray-900">{isStatsLoading ? '—' : stats.totalDocuments}</h3>
                  </div>
                  <div className="flex items-center text-blue-600 text-sm font-black pt-4">
                     <span>Xem tài liệu của tôi</span>
                     <ChevronRight size={18} className="ml-1 transform group-hover:translate-x-2 transition-transform" />
                  </div>
               </div>
            </div>

            {/* Total Exercises Card */}
            <div
               onClick={() => router.push('/exercises')}
               className="p-10 rounded-[48px] bg-white border-2 border-gray-100 shadow-[0_8px_30px_rgba(0,0,0,0.02)] hover:shadow-[0_40px_80px_rgba(0,0,0,0.08)] relative overflow-hidden group hover:-translate-y-2 transition-all duration-500 cursor-pointer"
            >
               <div className="relative z-10 space-y-6">
                  <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center">
                     <Target size={28} className="text-emerald-500" />
                  </div>
                  <div className="space-y-1">
                     <p className="text-gray-400 font-black uppercase tracking-widest text-[11px]">Bài luyện tập</p>
                     <h3 className="text-6xl font-black text-gray-900">{isStatsLoading ? '—' : stats.totalExercises}</h3>
                  </div>
                  <div className="flex items-center text-emerald-600 text-sm font-black pt-4">
                     <span>Luyện tập ngay</span>
                     <ChevronRight size={18} className="ml-1 transform group-hover:translate-x-2 transition-transform" />
                  </div>
               </div>
            </div>
         </section>

         {/* Subtle Bottom Section */}
         <section className="max-w-6xl mx-auto mt-20 p-8 border-t border-gray-100 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
               <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                  <Sparkles size={24} className="text-amber-500" />
               </div>
               <div>
                  <h4 className="font-black text-gray-800 text-lg">Hệ thống AI Study Hub</h4>
                  <p className="text-gray-500 font-bold text-sm">Hỗ trợ bạn tối ưu hóa việc học tập mọi lúc mọi nơi.</p>
               </div>
            </div>
            <button onClick={() => router.push('/subjects')} className="px-8 py-4 bg-gray-900 text-white rounded-2xl font-black hover:bg-black transition-all active:scale-95 shadow-xl">
               Bắt đầu học ngay
            </button>
         </section>
      </div>
   );
}
